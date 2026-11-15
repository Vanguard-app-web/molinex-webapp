import {test} from "node:test";
import assert from "node:assert/strict";
import {Plan} from "../src/commercial-engagement/domain/model/plan.entity.js";
import {PlanId} from "../src/commercial-engagement/domain/model/plan-id.js";
import {PlanName} from "../src/commercial-engagement/domain/model/plan-name.js";
import {PriceLabel} from "../src/commercial-engagement/domain/model/price-label.js";
import {ValueProposition} from "../src/commercial-engagement/domain/model/value-proposition.entity.js";
import {PropositionHeadline} from "../src/commercial-engagement/domain/model/proposition-headline.js";
import {CommercialInquiry} from "../src/commercial-engagement/domain/model/commercial-inquiry.entity.js";
import {CommercialInquiryId} from "../src/commercial-engagement/domain/model/commercial-inquiry-id.js";
import {ContactInformation} from "../src/commercial-engagement/domain/model/contact-information.js";
import {FullName} from "../src/commercial-engagement/domain/model/full-name.js";
import {EmailAddress} from "../src/commercial-engagement/domain/model/email-address.js";
import {PhoneNumber} from "../src/commercial-engagement/domain/model/phone-number.js";
import {CompanyName} from "../src/commercial-engagement/domain/model/company-name.js";
import {InquiryMessage} from "../src/commercial-engagement/domain/model/inquiry-message.js";
import {SubmissionDateTime} from "../src/commercial-engagement/domain/model/submission-date-time.js";
import {PlanAssembler} from "../src/commercial-engagement/infrastructure/assemblers/plan.assembler.js";
import {ValuePropositionAssembler} from "../src/commercial-engagement/infrastructure/assemblers/value-proposition.assembler.js";
import {CommercialInquiryAssembler} from "../src/commercial-engagement/infrastructure/assemblers/commercial-inquiry.assembler.js";

const contact = (phone = null) => new ContactInformation({
    fullName: new FullName('Lucía Rojas'),
    email: new EmailAddress('Lucia@Mill.test'),
    phone,
    companyName: new CompanyName('Molino Andino'),
});
const message = () => new InquiryMessage('We would like a demonstration.');

test('plan value objects need a value and are shown verbatim', () => {
    for (const ValueObject of [PlanId, PlanName, PriceLabel, PropositionHeadline, CommercialInquiryId, FullName, CompanyName, InquiryMessage]) {
        assert.throws(() => new ValueObject('   '), ValueObject.name);
        assert.throws(() => new ValueObject(undefined), ValueObject.name);
    }
    assert.equal(new PriceLabel('  Contact for pricing ').value, 'Contact for pricing');
});

test('commercial text has no invented length limit', () => {
    const long = 'x'.repeat(20000);
    assert.equal(new FullName(long).value.length, 20000);
    assert.equal(new CompanyName(long).value.length, 20000);
    assert.equal(new InquiryMessage(long).value.length, 20000);
});

test('EmailAddress and PhoneNumber of a visitor are validated', () => {
    assert.equal(new EmailAddress(' Lucia@Mill.TEST ').value, 'lucia@mill.test');
    for (const invalid of ['', 'lucia', 'lucia@', 'lucia@mill', 'lu cia@mill.test']) assert.equal(EmailAddress.isValid(invalid), false, invalid);
    assert.ok(new PhoneNumber('+51 999 888 777').isValid());
    for (const invalid of ['', 'call me', '123']) {
        assert.equal(PhoneNumber.isValid(invalid), false, invalid);
        assert.throws(() => new PhoneNumber(invalid), invalid);
    }
});

test('InquiryMessage detects blank input', () => {
    assert.ok(InquiryMessage.isBlank(''));
    assert.ok(InquiryMessage.isBlank('   \n\t'));
    assert.ok(InquiryMessage.isBlank(undefined));
    assert.equal(InquiryMessage.isBlank('Hello'), false);
    assert.equal(message().isBlank(), false);
});

test('ContactInformation keeps the phone optional', () => {
    assert.equal(contact().phone, null);
    assert.equal(contact(new PhoneNumber('+51 999 888 777')).phone.value, '+51 999 888 777');
    assert.throws(() => new ContactInformation({fullName: new FullName('A'), email: new EmailAddress('a@b.test'), phone: '999', companyName: new CompanyName('C')}));
    assert.throws(() => new ContactInformation({fullName: new FullName('A'), email: new EmailAddress('a@b.test')}));
});

test('a submitted inquiry is a draft until the API gives it an identity', () => {
    const draft = CommercialInquiry.submit({contact: contact(), message: message()});
    assert.equal(draft.id, null);
    assert.equal(draft.submittedAt, null);
    assert.equal(draft.isStored, false);

    const stored = new CommercialInquiry({
        id: new CommercialInquiryId('inq-1'), contact: contact(), message: message(),
        submittedAt: new SubmissionDateTime('2026-11-15T12:00:00.000Z'),
    });
    assert.ok(stored.isStored);
    assert.throws(() => new CommercialInquiry({id: new CommercialInquiryId('inq-1'), contact: contact(), message: message()}));
    assert.throws(() => new CommercialInquiry({contact: contact(), message: message(), submittedAt: new SubmissionDateTime(new Date())}));
    assert.throws(() => CommercialInquiry.submit({contact: {}, message: message()}));
});

test('SubmissionDateTime is immutable and rejects invalid dates', () => {
    const submitted = new SubmissionDateTime('2026-11-15T12:00:00.000Z');
    submitted.value.setFullYear(1999);
    assert.equal(submitted.value.toISOString(), '2026-11-15T12:00:00.000Z');
    assert.throws(() => new SubmissionDateTime('not a date'));
});

test('Plan and ValueProposition are read models built from published content', () => {
    const plan = new Plan({id: new PlanId('p1'), name: new PlanName('Plan'), price: new PriceLabel('Price'), features: [' One ', 'Two']});
    assert.deepEqual([...plan.features], ['One', 'Two']);
    assert.throws(() => plan.features.push('Three'), TypeError);
    assert.throws(() => new Plan({id: new PlanId('p1'), name: new PlanName('Plan'), price: new PriceLabel('Price'), features: ['']}));
    assert.deepEqual([...new ValueProposition({headline: new PropositionHeadline('Headline'), benefits: []}).benefits], []);
    assert.throws(() => new ValueProposition({headline: new PropositionHeadline('Headline'), benefits: [' ']}));
});

test('PlanAssembler maps plans and an empty catalog without inventing any', () => {
    const plans = PlanAssembler.toEntities({data: [
        {id: 'sample-1', name: 'Sample', priceLabel: 'Sample price', features: ['A', 'B']},
        {id: 'sample-2', name: 'Other', priceLabel: 'Other price', features: []},
    ]});
    assert.equal(plans.length, 2);
    assert.equal(plans[0].price.value, 'Sample price');
    assert.deepEqual([...plans[0].features], ['A', 'B']);
    assert.deepEqual(PlanAssembler.toEntities({data: []}), []);
    assert.equal(PlanAssembler.toEntities({data: {plans: [{id: 'p', name: 'N', priceLabel: 'P', features: []}]}}).length, 1);
    assert.throws(() => PlanAssembler.toEntity({id: 'p', name: 'N', features: []}));
});

test('ValuePropositionAssembler maps the headline and benefits', () => {
    const proposition = ValuePropositionAssembler.toEntity({headline: 'Headline', benefits: ['One']});
    assert.equal(proposition.headline.value, 'Headline');
    assert.deepEqual([...proposition.benefits], ['One']);
    assert.deepEqual([...ValuePropositionAssembler.toEntity({headline: 'Headline', benefits: []}).benefits], []);
    assert.throws(() => ValuePropositionAssembler.toEntity({headline: '', benefits: []}));
});

test('CommercialInquiryAssembler sends a draft without id or submission time and omits an absent phone', () => {
    const resource = CommercialInquiryAssembler.toResource(CommercialInquiry.submit({contact: contact(), message: message()}));
    assert.deepEqual(resource, {
        fullName: 'Lucía Rojas', email: 'lucia@mill.test', companyName: 'Molino Andino', message: 'We would like a demonstration.',
    });
    assert.ok(!('id' in resource) && !('submittedAt' in resource) && !('phone' in resource));
    assert.equal(CommercialInquiryAssembler.toResource(CommercialInquiry.submit({contact: contact(new PhoneNumber('+51 999 888 777')), message: message()})).phone, '+51 999 888 777');
});

test('CommercialInquiryAssembler builds the stored inquiry the API returned', () => {
    const stored = CommercialInquiryAssembler.toEntity({
        id: 'inq-9', fullName: 'Lucía Rojas', email: 'lucia@mill.test', companyName: 'Molino Andino',
        message: 'Hello', submittedAt: '2026-11-15T12:00:00.000Z',
    });
    assert.ok(stored.isStored);
    assert.equal(stored.id.value, 'inq-9');
    assert.equal(stored.contact.phone, null);
    assert.equal(stored.submittedAt.value.toISOString(), '2026-11-15T12:00:00.000Z');

    const withPhone = CommercialInquiryAssembler.toEntity({
        id: 'inq-10', fullName: 'A', email: 'a@b.test', phone: '+51 999 888 777', companyName: 'C', message: 'M', submittedAt: '2026-11-15T12:00:00.000Z',
    });
    assert.equal(withPhone.contact.phone.value, '+51 999 888 777');
    assert.equal(CommercialInquiryAssembler.toEntity({fullName: 'A', email: 'a@b.test', companyName: 'C', message: 'M'}).isStored, false);
    assert.throws(() => CommercialInquiryAssembler.toEntity({id: 'inq-1', fullName: 'A', email: 'a@b.test', companyName: 'C', message: 'M'}));
});
