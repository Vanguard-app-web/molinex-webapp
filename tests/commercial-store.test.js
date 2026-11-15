import {test, beforeEach} from "node:test";
import assert from "node:assert/strict";
import {createPinia, setActivePinia} from "pinia";
import {installFakeHttp, installStorage} from "./support/fake-http.js";

// The fake transport must exist before the store creates its API adapter.
const http = installFakeHttp();
installStorage();
const {default: useCommercialStore} = await import("../src/commercial-engagement/application/commercial.store.js");
const {tokenStorage} = await import("../src/iam/infrastructure/token-storage.js");
const {CommercialInquiry} = await import("../src/commercial-engagement/domain/model/commercial-inquiry.entity.js");
const {ContactInformation} = await import("../src/commercial-engagement/domain/model/contact-information.js");
const {FullName} = await import("../src/commercial-engagement/domain/model/full-name.js");
const {EmailAddress} = await import("../src/commercial-engagement/domain/model/email-address.js");
const {CompanyName} = await import("../src/commercial-engagement/domain/model/company-name.js");
const {InquiryMessage} = await import("../src/commercial-engagement/domain/model/inquiry-message.js");

const draft = () => CommercialInquiry.submit({
    contact: new ContactInformation({
        fullName: new FullName("Lucía Rojas"), email: new EmailAddress("lucia@mill.test"), phone: null, companyName: new CompanyName("Molino Andino"),
    }),
    message: new InquiryMessage("We would like a demonstration."),
});
const stored = body => ({status: 201, data: {id: "inq-1", submittedAt: "2026-11-15T12:00:00.000Z", ...body}});

let store;

beforeEach(() => {
    http.reset();
    tokenStorage.clear();
    setActivePinia(createPinia());
    store = useCommercialStore();
});

test("an empty plan catalog and a value proposition without benefits are valid states", async () => {
    http.use(async ({path}) => (path === "/commercial/plans" ? {data: []} : {data: {headline: "Published headline", benefits: []}}));
    await store.fetchPlans();
    await store.fetchValueProposition();
    assert.deepEqual(store.plans, []);
    assert.ok(store.plansLoaded);
    assert.equal(store.valueProposition.headline.value, "Published headline");
    assert.deepEqual([...store.valueProposition.benefits], []);
    assert.ok(store.valuePropositionLoaded);
    assert.deepEqual(store.errors, []);
});

test("published plans are mapped without anonymous access being a problem", async () => {
    http.use(async () => ({data: [{id: "sample-1", name: "Sample plan", priceLabel: "Sample price", features: ["Feature"]}]}));
    await store.fetchPlans();
    assert.equal(store.plans.length, 1);
    assert.equal(store.plans[0].name.value, "Sample plan");
    assert.equal(http.calls[0].authorization, null, "no session is needed");
});

test("loading failures are reported and can be retried", async () => {
    http.use(async () => "network");
    await store.fetchPlans();
    assert.deepEqual(store.errors, [{operation: "fetch-plans", message: "api-errors.network"}]);
    assert.equal(store.plansLoaded, false);

    http.use(async () => ({data: []}));
    await store.fetchPlans();
    assert.deepEqual(store.errors, []);
    assert.ok(store.plansLoaded);
});

test("content that breaks the contract is reported as invalid data", async () => {
    http.use(async () => ({data: {headline: "", benefits: []}}));
    await store.fetchValueProposition();
    assert.deepEqual(store.errors, [{operation: "fetch-value-proposition", message: "api-errors.invalid-data"}]);
    assert.equal(store.valuePropositionLoaded, false);
});

test("an inquiry is only confirmed after the API stored it, and the API assigns id and time", async () => {
    http.use(async ({body}) => stored(body));
    assert.equal(store.inquiry, null);
    const result = await store.submitInquiry(draft());

    assert.deepEqual(http.calls[0].body, {
        fullName: "Lucía Rojas", email: "lucia@mill.test", companyName: "Molino Andino", message: "We would like a demonstration.",
    });
    assert.ok(result.isStored);
    assert.equal(store.inquiry.id.value, "inq-1");
    assert.equal(store.inquiry.submittedAt.value.toISOString(), "2026-11-15T12:00:00.000Z");
    assert.deepEqual(store.errors, []);
    assert.equal(store.submitting, false);

    store.resetInquiry();
    assert.equal(store.inquiry, null);
});

test("a failed submission never confirms anything and can be retried", async () => {
    http.use(async () => ({status: 500, data: {code: "INTERNAL_ERROR"}}));
    assert.equal(await store.submitInquiry(draft()), null);
    assert.equal(store.inquiry, null);
    assert.deepEqual(store.errors, [{operation: "submit-inquiry", message: "api-errors.server"}]);
    assert.equal(store.submitting, false);

    http.use(async ({body}) => stored(body));
    assert.ok(await store.submitInquiry(draft()));
    assert.deepEqual(store.errors, [], "the previous error is cleared when retrying");
    assert.ok(store.inquiry.isStored);
});

test("a rejected inquiry reports the API validation and keeps no inquiry", async () => {
    http.use(async () => ({status: 400, data: {code: "VALIDATION_ERROR", details: [{field: "email", code: "INVALID_FORMAT"}]}}));
    assert.equal(await store.submitInquiry(draft()), null);
    assert.deepEqual(store.errors, [{operation: "submit-inquiry", message: "api-errors.bad-request"}]);
    assert.equal(store.inquiry, null);
});

test("a response without an identity is not accepted as a stored inquiry", async () => {
    http.use(async ({body}) => ({status: 201, data: body}));
    assert.equal(await store.submitInquiry(draft()), null);
    assert.equal(store.inquiry, null);
    assert.equal(store.errors[0].operation, "submit-inquiry");
});

test("a second submission while one is in flight is ignored", async () => {
    let release;
    const gate = new Promise(resolve => { release = resolve; });
    http.use(async ({body}) => { await gate; return stored(body); });

    const first = store.submitInquiry(draft());
    assert.ok(store.submitting);
    assert.equal(await store.submitInquiry(draft()), null);
    release();
    assert.ok(await first);
    assert.equal(http.calls.length, 1, "only one request reached the API");
    assert.equal(store.submitting, false);
});
