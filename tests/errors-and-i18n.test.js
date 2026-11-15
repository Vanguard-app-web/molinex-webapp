import {test} from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {AxiosError} from "axios";
import {ApiErrorHandler} from "../src/shared/infrastructure/api-error-handler.js";
import {roleTypes} from "../src/iam/domain/model/role-type.js";
import {permissions} from "../src/iam/domain/model/permission.js";
import {accountStatuses} from "../src/iam/domain/model/account-status.js";

const sourceRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "src");
const read = file => JSON.parse(fs.readFileSync(path.join(sourceRoot, "locales", file), "utf8"));
const en = read("en.json");
const es = read("es.json");

const flatten = (object, prefix = "") => Object.entries(object).flatMap(([key, value]) =>
    value && typeof value === "object" && !Array.isArray(value) ? flatten(value, `${prefix}${key}.`) : [[`${prefix}${key}`, value]]);
// PrimeVue component texts exist only in the Spanish file; English uses the PrimeVue defaults.
const messages = locale => new Map(flatten(locale).filter(([key]) => !key.startsWith("primevue.")));
const english = messages(en);
const spanish = messages(es);

const sourceFiles = directory => fs.readdirSync(directory, {withFileTypes: true}).flatMap(entry => {
    const location = path.join(directory, entry.name);
    if (entry.isDirectory()) return entry.name === "locales" ? [] : sourceFiles(location);
    return /\.(vue|js)$/.test(entry.name) ? [location] : [];
});

// ---- API errors -----------------------------------------------------------------------------

const apiError = (status, code) => new AxiosError("failure", "ERR_BAD_RESPONSE", {}, {}, {status, data: code ? {status, code} : {}});

test("ApiErrorHandler maps HTTP statuses to message keys", () => {
    assert.deepEqual(ApiErrorHandler.toMessages(apiError(400)), ["api-errors.bad-request"]);
    assert.deepEqual(ApiErrorHandler.toMessages(apiError(422)), ["api-errors.bad-request"]);
    assert.deepEqual(ApiErrorHandler.toMessages(apiError(401)), ["api-errors.session-expired"]);
    assert.deepEqual(ApiErrorHandler.toMessages(apiError(403)), ["api-errors.forbidden"]);
    assert.deepEqual(ApiErrorHandler.toMessages(apiError(404)), ["api-errors.not-found"]);
    assert.deepEqual(ApiErrorHandler.toMessages(apiError(409)), ["api-errors.conflict"]);
    assert.deepEqual(ApiErrorHandler.toMessages(apiError(500)), ["api-errors.server"]);
    assert.deepEqual(ApiErrorHandler.toMessages(apiError(418)), ["api-errors.unexpected"]);
});

test("ApiErrorHandler prefers the specific error code of the API", () => {
    const expectations = {
        INVALID_CREDENTIALS: [401, "api-errors.invalid-credentials"],
        ACCOUNT_INACTIVE: [403, "api-errors.account-inactive"],
        ACCOUNT_LOCKED: [403, "api-errors.account-locked"],
        EMAIL_ALREADY_REGISTERED: [409, "api-errors.email-registered"],
        LAST_ADMINISTRATOR: [409, "api-errors.last-administrator"],
        USER_NOT_FOUND: [404, "api-errors.user-not-found"],
        AUTHENTICATION_REQUIRED: [401, "api-errors.session-expired"],
        INVALID_TOKEN: [401, "api-errors.session-expired"],
        PRIVILEGE_CHANGE_FORBIDDEN: [403, "api-errors.privilege-change"],
    };
    for (const [code, [status, key]] of Object.entries(expectations)) {
        assert.deepEqual(ApiErrorHandler.toMessages(apiError(status, code)), [key], code);
        assert.ok(english.has(key) && spanish.has(key), `${key} is translated`);
    }
    // An unknown code falls back to the status.
    assert.deepEqual(ApiErrorHandler.toMessages(apiError(409, "SOMETHING_NEW")), ["api-errors.conflict"]);
});

test("ApiErrorHandler tells a missing connection from a failed answer and keeps mapped messages", () => {
    assert.deepEqual(ApiErrorHandler.toMessages(new AxiosError("Network Error", "ERR_NETWORK", {}, {})), ["api-errors.network"]);
    assert.deepEqual(ApiErrorHandler.toMessages(new Error("mapping failed")), ["api-errors.invalid-data"]);
    assert.deepEqual(ApiErrorHandler.toMessages({messages: ["maintenance.errors.unknown-machine"]}), ["maintenance.errors.unknown-machine"]);
    assert.deepEqual(ApiErrorHandler.toMessages(undefined), ["api-errors.invalid-data"]);
});

// ---- Translations ---------------------------------------------------------------------------

test("English and Spanish define exactly the same message keys", () => {
    assert.deepEqual([...english.keys()].filter(key => !spanish.has(key)), [], "missing in Spanish");
    assert.deepEqual([...spanish.keys()].filter(key => !english.has(key)), [], "missing in English");
});

test("every message has text and the same placeholders in both languages", () => {
    const placeholders = text => [...String(text).matchAll(/\{(\w+)\}/g)].map(match => match[1]).sort();
    for (const [key, text] of english) {
        assert.ok(typeof text === "string" && text.trim() !== "", `English ${key} is empty`);
        assert.ok(typeof spanish.get(key) === "string" && spanish.get(key).trim() !== "", `Spanish ${key} is empty`);
        assert.deepEqual(placeholders(spanish.get(key)), placeholders(text), `placeholders of ${key}`);
    }
});

test("roles, permissions and account states have a visible label in both languages", () => {
    for (const [group, values] of [["role-type", roleTypes], ["permission", permissions], ["account-status", accountStatuses]]) {
        for (const value of values) {
            for (const [name, catalog] of [["English", english], ["Spanish", spanish]]) {
                assert.ok(catalog.has(`${group}.${value}`), `${name} lacks ${group}.${value}`);
            }
        }
    }
});

test("every translation key referenced by the source exists", () => {
    const topLevel = new Set(Object.keys(en));
    const literal = /(['"`])([a-z][a-z0-9-]*(?:\.[A-Za-z0-9_-]+)+)\1/g;
    const missing = [];
    for (const file of sourceFiles(sourceRoot)) {
        for (const match of fs.readFileSync(file, "utf8").matchAll(literal)) {
            const key = match[2];
            if (!topLevel.has(key.split(".")[0])) continue;
            if (!english.has(key) || !spanish.has(key)) missing.push(`${path.relative(sourceRoot, file)}: ${key}`);
        }
    }
    assert.deepEqual(missing, []);
});

test("the dynamic keys of the Identity and Commercial views resolve", () => {
    const dynamic = [
        ...["sign-up", "create", "edit"].flatMap(mode => [`user-form.title-${mode}`, `user-form.description-${mode}`, `user-form.save-${mode}`]),
        ...["signed-out", "session-expired"].map(reason => `sign-in-form.reasons.${reason}`),
        ...["sign-in", "sign-up", "sign-out", "restore-session", "fetch-users", "register-user", "assign-role", "update-profile",
            "fetch-plans", "fetch-value-proposition", "submit-inquiry"].map(operation => `operations.${operation}`),
    ];
    for (const key of dynamic) assert.ok(english.has(key) && spanish.has(key), key);
});

test("views do not hard-code visible text in the new contexts", () => {
    // A heuristic: text between tags that contains letters and is not an interpolation or entity.
    const offenders = [];
    for (const context of ["iam", "commercial-engagement"]) {
        for (const file of sourceFiles(path.join(sourceRoot, context)).filter(name => name.endsWith(".vue"))) {
            const template = /<template>([\s\S]*)<\/template>\s*(?:<style|$)/.exec(fs.readFileSync(file, "utf8"))?.[1] ?? "";
            for (const match of template.matchAll(/>([^<>{}]*[A-Za-z]{3,}[^<>{}]*)</g)) {
                offenders.push(`${path.relative(sourceRoot, file)}: ${match[1].trim()}`);
            }
        }
    }
    assert.deepEqual(offenders, []);
});
