import {test, beforeEach} from "node:test";
import assert from "node:assert/strict";
import {createPinia, setActivePinia} from "pinia";
import {installFakeHttp, installStorage} from "./support/fake-http.js";

// The fake transport must exist before the store creates its API adapter.
const http = installFakeHttp();
const entries = installStorage();
const {default: useIamStore} = await import("../src/iam/application/iam.store.js");
const {tokenStorage} = await import("../src/iam/infrastructure/token-storage.js");
const {SignInCommand} = await import("../src/iam/application/sign-in.command.js");
const {SignUpCommand} = await import("../src/iam/application/sign-up.command.js");
const {RegisterUserCommand} = await import("../src/iam/application/register-user.command.js");
const {UserId} = await import("../src/iam/domain/model/user-id.js");
const {Role} = await import("../src/iam/domain/model/role.js");
const {UserProfile} = await import("../src/iam/domain/model/user-profile.js");
const {FullName} = await import("../src/iam/domain/model/full-name.js");
const {JobTitle} = await import("../src/iam/domain/model/job-title.js");
const {PhoneNumber} = await import("../src/iam/domain/model/phone-number.js");
const {Permission} = await import("../src/iam/domain/model/permission.js");
const {RoleType} = await import("../src/iam/domain/model/role-type.js");
const {rolePermissions} = await import("../src/iam/domain/model/role-permissions.js");

/** In-memory stand-in for the IAM endpoints of the mock API, following the documented contract. */
function createBackend() {
    const error = (status, code) => ({status, data: {status, code, message: code, details: []}});
    const users = [
        {id: "usr-1", email: "admin@molinex.test", password: "pw-admin", fullName: "Demo Administrator", jobTitle: "", phoneNumber: "", role: RoleType.ADMINISTRATOR, status: "ACTIVE"},
        {id: "usr-2", email: "operator@molinex.test", password: "pw-operator", fullName: "Demo Operator", jobTitle: "", phoneNumber: "", role: RoleType.PRODUCTION_OPERATOR, status: "ACTIVE"},
        {id: "usr-3", email: "inactive@molinex.test", password: "pw-inactive", fullName: "Inactive", jobTitle: "", phoneNumber: "", role: RoleType.PRODUCTION_OPERATOR, status: "INACTIVE"},
    ];
    const tokens = new Map();
    const resourceOf = ({password, ...user}) => ({...user, permissions: [...rolePermissions[user.role]]});
    const state = {users, tokens, offline: false};

    state.handle = async ({method, path, body, authorization}) => {
        if (state.offline) return "network";
        const key = `${method} ${path}`;
        if (key === "POST /iam/sign-in") {
            const user = users.find(candidate => candidate.email === body.email);
            if (!user || user.password !== body.password) return error(401, "INVALID_CREDENTIALS");
            if (user.status !== "ACTIVE") return error(403, "ACCOUNT_INACTIVE");
            const token = `mlx-demo.${user.id}.${tokens.size}`;
            tokens.set(token, user.id);
            return {data: {userId: user.id, token, role: user.role, permissions: [...rolePermissions[user.role]]}};
        }
        if (key === "POST /iam/sign-up") {
            if (users.some(candidate => candidate.email === body.email)) return error(409, "EMAIL_ALREADY_REGISTERED");
            const user = {id: `usr-${users.length + 1}`, email: body.email, password: body.password, fullName: body.fullName, jobTitle: "", phoneNumber: "", role: RoleType.PRODUCTION_OPERATOR, status: "ACTIVE"};
            users.push(user);
            return {status: 201, data: resourceOf(user)};
        }

        const token = authorization?.replace("Bearer ", "");
        const current = users.find(candidate => candidate.id === tokens.get(token));
        if (!authorization) return error(401, "AUTHENTICATION_REQUIRED");
        if (!current) return error(401, "INVALID_TOKEN");

        if (key === "POST /iam/sign-out") {
            tokens.delete(token);
            return {status: 204};
        }
        if (key === "GET /iam/profile") return {data: resourceOf(current)};
        if (key === "PUT /iam/profile") {
            if (body.role !== current.role) return error(403, "PRIVILEGE_CHANGE_FORBIDDEN");
            Object.assign(current, {fullName: body.fullName, jobTitle: body.jobTitle, phoneNumber: body.phoneNumber});
            return {data: resourceOf(current)};
        }
        const needsAdministrator = current.role !== RoleType.ADMINISTRATOR;
        if (key === "GET /iam/users") return needsAdministrator ? error(403, "FORBIDDEN") : {data: users.map(resourceOf)};
        if (key === "POST /iam/users") {
            if (needsAdministrator) return error(403, "FORBIDDEN");
            const user = {id: `usr-${users.length + 1}`, status: "ACTIVE", ...body};
            users.push(user);
            return {status: 201, data: resourceOf(user)};
        }
        const target = /^PUT \/iam\/users\/([^/]+)(\/role)?$/.exec(key);
        if (target) {
            if (needsAdministrator) return error(403, "FORBIDDEN");
            const user = users.find(candidate => candidate.id === target[1]);
            if (!user) return error(404, "USER_NOT_FOUND");
            if (target[2]) {
                const lastAdministrator = user.role === RoleType.ADMINISTRATOR && body.role !== RoleType.ADMINISTRATOR
                    && !users.some(candidate => candidate !== user && candidate.role === RoleType.ADMINISTRATOR && candidate.status === "ACTIVE");
                if (lastAdministrator) return error(409, "LAST_ADMINISTRATOR");
                user.role = body.role;
            } else {
                Object.assign(user, {fullName: body.fullName, jobTitle: body.jobTitle, phoneNumber: body.phoneNumber});
            }
            return {data: resourceOf(user)};
        }
        return error(404, "NOT_FOUND");
    };
    return state;
}

let backend;
let store;

beforeEach(() => {
    entries.clear();
    tokenStorage.clear();
    http.reset();
    backend = createBackend();
    http.use(backend.handle);
    setActivePinia(createPinia());
    store = useIamStore();
});

const signInAs = async email => store.signIn(new SignInCommand({email, password: `pw-${email.split("@")[0]}`}));
const requests = path => http.calls.filter(call => call.path === path);

test("signing in stores the session, loads the profile and keeps the password out of every state", async () => {
    const session = await signInAs("operator@molinex.test");
    assert.ok(session);
    assert.ok(store.isAuthenticated);
    assert.equal(store.currentUser.profile.fullName.value, "Demo Operator");
    assert.ok(store.hasPermission(Permission.MANAGE_PRODUCTION));
    assert.equal(store.hasPermission(Permission.MANAGE_USERS), false);
    assert.equal(tokenStorage.get().value, session.token.value);
    assert.deepEqual(store.errors, []);

    // The profile request carried the new token; the sign-in request carried none.
    assert.equal(requests("/iam/sign-in")[0].authorization, null);
    assert.equal(requests("/iam/profile")[0].authorization, `Bearer ${session.token.value}`);

    const everything = JSON.stringify({session: store.currentSession, user: store.currentUser, stored: [...entries.values()]});
    assert.ok(!everything.includes("pw-operator"));
});

test("a wrong password or an inactive account fails without creating a session", async () => {
    const wrong = await store.signIn(new SignInCommand({email: "operator@molinex.test", password: "nope"}));
    assert.equal(wrong, null);
    assert.deepEqual(store.errors, [{operation: "sign-in", message: "api-errors.invalid-credentials"}]);
    assert.equal(store.isAuthenticated, false);
    assert.equal(tokenStorage.get(), null);
    assert.equal(store.sessionEndReason, null, "a credential error is not a rejected token");

    assert.equal(await signInAs("inactive@molinex.test"), null);
    assert.deepEqual(store.errors, [{operation: "sign-in", message: "api-errors.account-inactive"}]);
    assert.equal(entries.size, 0);
});

test("a service failure while signing in keeps the form retryable and leaves no token behind", async () => {
    backend.offline = true;
    assert.equal(await signInAs("operator@molinex.test"), null);
    assert.deepEqual(store.errors, [{operation: "sign-in", message: "api-errors.network"}]);
    backend.offline = false;
    assert.ok(await signInAs("operator@molinex.test"));
    assert.deepEqual(store.errors, []);
});

test("restoreSession recovers the session from the stored token once", async () => {
    await signInAs("admin@molinex.test");
    const token = tokenStorage.get();

    setActivePinia(createPinia());
    const reloaded = useIamStore();
    assert.equal(reloaded.isAuthenticated, false);
    http.reset();
    await reloaded.restoreSession();
    await reloaded.restoreSession();
    assert.ok(reloaded.isAuthenticated);
    assert.equal(reloaded.currentSession.token.value, token.value);
    assert.ok(reloaded.hasPermission(Permission.MANAGE_USERS));
    assert.equal(requests("/iam/profile").length, 1, "the check runs once");
});

test("restoreSession does nothing without a stored token", async () => {
    await store.restoreSession();
    assert.equal(http.calls.length, 0);
    assert.equal(store.isAuthenticated, false);
});

test("a stored token the API rejects is discarded", async () => {
    tokenStorage.save({value: "mlx-demo.revoked"});
    await store.restoreSession();
    assert.equal(store.isAuthenticated, false);
    assert.equal(tokenStorage.get(), null);
});

test("a network failure while restoring keeps the token and allows another attempt", async () => {
    await signInAs("operator@molinex.test");
    setActivePinia(createPinia());
    const reloaded = useIamStore();
    backend.offline = true;
    await reloaded.restoreSession();
    assert.equal(reloaded.isAuthenticated, false);
    assert.deepEqual(reloaded.errors, [{operation: "restore-session", message: "api-errors.network"}]);
    assert.ok(tokenStorage.get(), "the token survives a temporary outage");

    backend.offline = false;
    await reloaded.restoreSession();
    assert.ok(reloaded.isAuthenticated);
});

test("when the API rejects the token the session and every private datum are dropped", async () => {
    await signInAs("admin@molinex.test");
    await store.fetchUsers();
    assert.ok(store.usersLoaded && store.users.length > 0);

    backend.tokens.clear();
    await store.fetchUsers();
    assert.equal(store.isAuthenticated, false);
    assert.equal(store.currentUser, null);
    assert.deepEqual(store.users, []);
    assert.equal(store.usersLoaded, false);
    assert.equal(tokenStorage.get(), null);
    assert.equal(store.sessionEndReason, "session-expired");
});

test("signing out invalidates the token on the API and clears the session", async () => {
    const session = await signInAs("admin@molinex.test");
    await store.fetchUsers();
    await store.signOut();
    assert.equal(store.isAuthenticated, false);
    assert.deepEqual(store.users, []);
    assert.equal(tokenStorage.get(), null);
    assert.equal(store.sessionEndReason, "signed-out");
    assert.equal(requests("/iam/sign-out")[0].authorization, `Bearer ${session.token.value}`);
    assert.equal(backend.tokens.has(session.token.value), false, "the API no longer accepts the token");
});

test("the local session ends even when the API cannot be reached on sign-out", async () => {
    await signInAs("operator@molinex.test");
    backend.offline = true;
    await store.signOut();
    assert.equal(store.isAuthenticated, false);
    assert.equal(tokenStorage.get(), null);
});

test("sign-up creates an account without signing in and reports duplicates", async () => {
    const created = await store.signUp(new SignUpCommand({email: "new@molinex.test", password: "Secret-123", fullName: "New Person"}));
    assert.equal(created.email.value, "new@molinex.test");
    assert.equal(created.role.type, RoleType.PRODUCTION_OPERATOR);
    assert.equal(store.isAuthenticated, false);
    assert.equal(tokenStorage.get(), null);
    assert.deepEqual(requests("/iam/sign-up")[0].body, {email: "new@molinex.test", password: "Secret-123", fullName: "New Person"});

    assert.equal(await store.signUp(new SignUpCommand({email: "new@molinex.test", password: "Secret-123", fullName: "Again"})), null);
    assert.deepEqual(store.errors, [{operation: "sign-up", message: "api-errors.email-registered"}]);
});

test("user administration is refused to roles without MANAGE_USERS", async () => {
    await signInAs("operator@molinex.test");
    await store.fetchUsers();
    assert.deepEqual(store.errors, [{operation: "fetch-users", message: "api-errors.forbidden"}]);
    assert.equal(store.usersLoaded, false);
    assert.equal(store.isAuthenticated, true, "a permission error does not end the session");
});

test("administrators list, register and update users", async () => {
    await signInAs("admin@molinex.test");
    await store.fetchUsers();
    assert.equal(store.users.length, 3);
    assert.ok(store.usersLoaded);

    const registered = await store.registerUser(new RegisterUserCommand({
        email: "tech@molinex.test", password: "Secret-123", fullName: "New Technician", role: RoleType.MAINTENANCE_TECHNICIAN,
    }));
    assert.equal(registered.role.type, RoleType.MAINTENANCE_TECHNICIAN);
    assert.equal(store.users.length, 4);

    const profile = new UserProfile({fullName: new FullName("Renamed Operator"), jobTitle: new JobTitle("Packer"), phoneNumber: new PhoneNumber("+51 999 888 777")});
    const updated = await store.updateProfile(new UserId("usr-2"), profile);
    assert.equal(updated.profile.fullName.value, "Renamed Operator");
    assert.equal(store.userById("usr-2").profile.jobTitle.value, "Packer");
    assert.equal(requests("/iam/users/usr-2")[0].method, "PUT", "another user's profile goes through user administration");
});

test("a user edits their own profile through the profile endpoint, and a failure leaves the profile unchanged", async () => {
    await signInAs("operator@molinex.test");
    const profile = new UserProfile({fullName: new FullName("Operator Renamed")});
    const updated = await store.updateProfile(new UserId("usr-2"), profile);
    assert.equal(updated.profile.fullName.value, "Operator Renamed");
    assert.equal(store.currentUser.profile.fullName.value, "Operator Renamed");
    assert.equal(requests("/iam/profile").filter(call => call.method === "PUT").length, 1);
    assert.equal(store.currentUser.role.type, RoleType.PRODUCTION_OPERATOR);

    backend.offline = true;
    const failed = await store.updateProfile(new UserId("usr-2"), new UserProfile({fullName: new FullName("Never Saved")}));
    assert.equal(failed, null);
    assert.equal(store.currentUser.profile.fullName.value, "Operator Renamed");
    assert.deepEqual(store.errors, [{operation: "update-profile", message: "api-errors.network"}]);
});

test("assigning a role updates the directory, and the own session when it is the own user", async () => {
    await signInAs("admin@molinex.test");
    await store.fetchUsers();
    const promoted = await store.assignRole(new UserId("usr-2"), Role.of(RoleType.MAINTENANCE_TECHNICIAN));
    assert.equal(promoted.role.type, RoleType.MAINTENANCE_TECHNICIAN);
    assert.equal(store.userById("usr-2").role.type, RoleType.MAINTENANCE_TECHNICIAN);
    assert.deepEqual(requests("/iam/users/usr-2/role")[0].body, {role: RoleType.MAINTENANCE_TECHNICIAN});
    assert.ok(store.hasPermission(Permission.MANAGE_USERS), "the administrator's own session is untouched");
    assert.equal(await store.assignRole(new UserId("usr-404"), Role.of(RoleType.ADMINISTRATOR)), null);
    assert.deepEqual(store.errors, [{operation: "assign-role", message: "api-errors.user-not-found"}]);
});

test("the last administrator cannot be demoted and the session keeps its permissions", async () => {
    await signInAs("admin@molinex.test");
    await store.fetchUsers();
    const demoted = await store.assignRole(new UserId("usr-1"), Role.of(RoleType.PRODUCTION_OPERATOR));
    assert.equal(demoted, null);
    assert.deepEqual(store.errors, [{operation: "assign-role", message: "api-errors.last-administrator"}]);
    assert.equal(store.userById("usr-1").role.type, RoleType.ADMINISTRATOR);
    assert.ok(store.hasPermission(Permission.MANAGE_USERS));
});

test("the store knows the three roles and the five permissions of the design", () => {
    assert.deepEqual(store.roles.map(role => role.type), ["ADMINISTRATOR", "MAINTENANCE_TECHNICIAN", "PRODUCTION_OPERATOR"]);
    assert.equal(store.permissions.length, 5);
});
