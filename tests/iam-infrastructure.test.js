import {test, beforeEach} from "node:test";
import assert from "node:assert/strict";
import {AxiosHeaders} from "axios";
import {SignInCommand} from "../src/iam/application/sign-in.command.js";
import {SignUpCommand} from "../src/iam/application/sign-up.command.js";
import {RegisterUserCommand} from "../src/iam/application/register-user.command.js";
import {SignInAssembler} from "../src/iam/infrastructure/assemblers/sign-in.assembler.js";
import {SignUpAssembler} from "../src/iam/infrastructure/assemblers/sign-up.assembler.js";
import {UserAssembler} from "../src/iam/infrastructure/assemblers/user.assembler.js";
import {TokenStorage, tokenStorage} from "../src/iam/infrastructure/token-storage.js";
import {iamInterceptor} from "../src/iam/infrastructure/iam-interceptor.js";
import {canActivate, landingRoute, protectModuleRoutes, safeRedirectPath} from "../src/iam/infrastructure/access-rules.js";
import {AccessToken} from "../src/iam/domain/model/access-token.js";
import {AuthenticatedSession} from "../src/iam/domain/model/authenticated-session.js";
import {Role} from "../src/iam/domain/model/role.js";
import {UserId} from "../src/iam/domain/model/user-id.js";
import {Permission} from "../src/iam/domain/model/permission.js";
import {RoleType} from "../src/iam/domain/model/role-type.js";
import {BaseApi} from "../src/shared/infrastructure/base-api.js";
import {IamApi} from "../src/iam/infrastructure/iam-api.js";
import {CommercialApi} from "../src/commercial-engagement/infrastructure/commercial-api.js";
import productionRoutes from "../src/production-management/presentation/production-management.routes.js";
import qualityRoutes from "../src/quality-yield-control/presentation/quality-yield-control.routes.js";
import assetRoutes from "../src/asset-maintenance-management/presentation/asset-maintenance-management.routes.js";

const userResource = (overrides = {}) => ({
    id: 'usr-7', email: 'Rosa@Molinex.test', fullName: 'Rosa Quispe', jobTitle: 'Technician', phoneNumber: '+51 999 111 222',
    role: RoleType.MAINTENANCE_TECHNICIAN, permissions: [Permission.MANAGE_MAINTENANCE, Permission.VIEW_OPERATIONAL_INFORMATION],
    status: 'ACTIVE', ...overrides,
});
const sessionOf = type => new AuthenticatedSession({userId: new UserId('usr-1'), token: new AccessToken('mlx-demo.x'), role: Role.of(type)});

/** Browser storage stand-in. */
function installStorage({failing = false} = {}) {
    const entries = new Map();
    const stub = {
        getItem: key => { if (failing) throw new Error('denied'); return entries.has(key) ? entries.get(key) : null; },
        setItem: (key, value) => { if (failing) throw new Error('denied'); entries.set(key, String(value)); },
        removeItem: key => { if (failing) throw new Error('denied'); entries.delete(key); },
    };
    Object.defineProperty(globalThis, 'localStorage', {value: stub, configurable: true, writable: true});
    return entries;
}

beforeEach(() => {
    installStorage();
    tokenStorage.clear();
    iamInterceptor.setUnauthorizedListener(null);
});

// ---- Assemblers -----------------------------------------------------------------------------

test('SignInAssembler builds the request from the command and the session from the resource', () => {
    const command = new SignInCommand({email: '  rosa@molinex.test ', password: ' keep spaces '});
    assert.deepEqual(SignInAssembler.toRequest(command), {email: 'rosa@molinex.test', password: ' keep spaces '});

    const session = SignInAssembler.toSession({
        userId: 'usr-7', token: 'mlx-demo.abc', role: RoleType.PRODUCTION_OPERATOR,
        permissions: [Permission.MANAGE_PRODUCTION, Permission.VIEW_OPERATIONAL_INFORMATION],
    });
    assert.ok(session.isAuthenticated());
    assert.equal(session.userId.value, 'usr-7');
    assert.equal(session.token.value, 'mlx-demo.abc');
    assert.ok(session.allows(Permission.MANAGE_PRODUCTION));
    assert.equal(session.allows(Permission.MANAGE_USERS), false);
    assert.throws(() => SignInAssembler.toSession({userId: 'usr-7', token: '', role: RoleType.PRODUCTION_OPERATOR, permissions: []}));
});

test('SignUpAssembler sends only email, password and full name and maps the created account', () => {
    const request = SignUpAssembler.toRequest(new SignUpCommand({email: 'new@molinex.test', password: 'Secret-123', fullName: ' New Person '}));
    assert.deepEqual(request, {email: 'new@molinex.test', password: 'Secret-123', fullName: 'New Person'});
    assert.ok(!('role' in request) && !('status' in request) && !('permissions' in request));
    const created = SignUpAssembler.toEntity(userResource({role: RoleType.PRODUCTION_OPERATOR, permissions: []}));
    assert.equal(created.role.type, RoleType.PRODUCTION_OPERATOR);
});

test('UserAssembler maps resources to entities and back without credentials', () => {
    const user = UserAssembler.toEntity(userResource());
    assert.equal(user.id.value, 'usr-7');
    assert.equal(user.email.value, 'rosa@molinex.test');
    assert.equal(user.profile.jobTitle.value, 'Technician');
    assert.equal(user.role.type, RoleType.MAINTENANCE_TECHNICIAN);
    assert.deepEqual(UserAssembler.toResource(user), {
        id: 'usr-7', email: 'rosa@molinex.test', fullName: 'Rosa Quispe', jobTitle: 'Technician', phoneNumber: '+51 999 111 222',
        role: RoleType.MAINTENANCE_TECHNICIAN, permissions: [Permission.MANAGE_MAINTENANCE, Permission.VIEW_OPERATIONAL_INFORMATION],
        status: 'ACTIVE',
    });
    assert.ok(!JSON.stringify(UserAssembler.toResource(user)).toLowerCase().includes('password'));
});

test('UserAssembler tolerates absent optional profile data and rejects invalid resources', () => {
    const user = UserAssembler.toEntity(userResource({jobTitle: undefined, phoneNumber: undefined}));
    assert.ok(user.profile.jobTitle.isEmpty() && user.profile.phoneNumber.isEmpty());
    assert.throws(() => UserAssembler.toEntity(userResource({status: 'DELETED'})));
    assert.throws(() => UserAssembler.toEntity(userResource({role: 'SUPERUSER'})));
    assert.throws(() => UserAssembler.toEntity(userResource({email: 'not-an-email'})));
});

test('UserAssembler.toEntities reads arrays and wrapped responses, and builds the register request', () => {
    assert.equal(UserAssembler.toEntities({data: [userResource(), userResource({id: 'usr-8', email: 'b@molinex.test'})]}).length, 2);
    assert.equal(UserAssembler.toEntities({data: {users: [userResource()]}}).length, 1);
    const request = UserAssembler.toRegisterRequest(new RegisterUserCommand({
        email: 'a@molinex.test', password: 'Secret-123', fullName: 'A B', jobTitle: ' Lead ', phoneNumber: '', role: RoleType.ADMINISTRATOR,
    }));
    assert.deepEqual(request, {email: 'a@molinex.test', password: 'Secret-123', fullName: 'A B', jobTitle: 'Lead', phoneNumber: '', role: RoleType.ADMINISTRATOR});
});

// ---- Token storage --------------------------------------------------------------------------

test('TokenStorage saves, reads and clears only the token value', () => {
    const entries = installStorage();
    const storage = new TokenStorage();
    assert.equal(storage.get(), null);
    storage.save(new AccessToken('mlx-demo.abc'));
    assert.equal(storage.get().value, 'mlx-demo.abc');
    assert.deepEqual([...entries.values()], ['mlx-demo.abc']);
    storage.clear();
    assert.equal(storage.get(), null);
    assert.equal(entries.size, 0);
});

test('TokenStorage falls back to memory when the browser denies storage', () => {
    installStorage({failing: true});
    const storage = new TokenStorage();
    storage.save(new AccessToken('mlx-demo.memory'));
    assert.equal(storage.get().value, 'mlx-demo.memory');
    storage.clear();
    assert.equal(storage.get(), null);
});

// ---- Interceptor ----------------------------------------------------------------------------

const requestConfig = (url, baseURL = 'http://localhost:3000/api/v1') => ({url, baseURL, headers: new AxiosHeaders()});

test('iamInterceptor adds the bearer token to requests for the API origin', () => {
    tokenStorage.save(new AccessToken('mlx-demo.abc'));
    assert.equal(iamInterceptor.onRequest(requestConfig('/machines')).headers.get('Authorization'), 'Bearer mlx-demo.abc');
    assert.equal(iamInterceptor.onRequest(requestConfig('http://localhost:3000/other/path')).headers.get('Authorization'), 'Bearer mlx-demo.abc');
});

test('iamInterceptor never sends the token to another origin', () => {
    tokenStorage.save(new AccessToken('mlx-demo.abc'));
    for (const url of ['https://evil.example/steal', '//evil.example/steal', 'http://localhost:3001/api/v1/machines', 'http://localhost.evil.example/x']) {
        assert.equal(iamInterceptor.onRequest(requestConfig(url)).headers.get('Authorization'), undefined, url);
    }
});

test('iamInterceptor sends nothing without a session', () => {
    assert.equal(iamInterceptor.onRequest(requestConfig('/machines')).headers.get('Authorization'), undefined);
});

const failure = (status, code, {sentToken = true} = {}) => {
    const headers = new AxiosHeaders();
    if (sentToken) headers.set('Authorization', 'Bearer mlx-demo.abc');
    return {config: {headers}, response: {status, data: {code}}};
};

test('iamInterceptor reports a rejected token to the listener, and only then', () => {
    let notifications = 0;
    iamInterceptor.setUnauthorizedListener(() => { notifications += 1; });

    iamInterceptor.onResponseError(failure(401, 'INVALID_TOKEN'));
    assert.equal(notifications, 1);
    iamInterceptor.onResponseError(failure(401, 'AUTHENTICATION_REQUIRED'));
    assert.equal(notifications, 2);

    iamInterceptor.onResponseError(failure(401, 'INVALID_CREDENTIALS'));
    iamInterceptor.onResponseError(failure(401, 'INVALID_TOKEN', {sentToken: false}));
    iamInterceptor.onResponseError(failure(403, 'FORBIDDEN'));
    iamInterceptor.onResponseError(failure(500, 'INTERNAL_ERROR'));
    iamInterceptor.onResponseError({config: {headers: new AxiosHeaders()}});
    iamInterceptor.onResponseError(undefined);
    assert.equal(notifications, 2);
});

test('every Axios instance gets the interceptors exactly once', () => {
    for (const api of [new BaseApi(), new IamApi(), new CommercialApi()]) {
        assert.equal(api.http.interceptors.request.handlers.filter(Boolean).length, 1, api.constructor.name);
        assert.equal(api.http.interceptors.response.handlers.filter(Boolean).length, 1, api.constructor.name);
    }
});

test('an API request carries the token end to end through its own Axios instance', async () => {
    tokenStorage.save(new AccessToken('mlx-demo.abc'));
    const api = new BaseApi();
    api.http.defaults.baseURL = 'http://localhost:3000/api/v1';
    let seen;
    api.http.defaults.adapter = async config => {
        seen = config.headers.get('Authorization');
        return {data: [], status: 200, statusText: 'OK', headers: {}, config};
    };
    await api.http.get('/machines');
    assert.equal(seen, 'Bearer mlx-demo.abc');
    await api.http.get('https://elsewhere.example/data');
    assert.equal(seen, undefined);
});

// ---- Access rules ---------------------------------------------------------------------------

test('canActivate applies public, guest-only, authenticated and permission routes', () => {
    const operator = sessionOf(RoleType.PRODUCTION_OPERATOR);
    const admin = sessionOf(RoleType.ADMINISTRATOR);

    assert.ok(canActivate({public: true}, null));
    assert.ok(canActivate({public: true}, operator));

    assert.ok(canActivate({guestOnly: true}, null));
    assert.equal(canActivate({guestOnly: true}, operator), false);

    assert.equal(canActivate({}, null), false);
    assert.ok(canActivate({}, operator));

    assert.equal(canActivate({permission: Permission.MANAGE_USERS}, null), false);
    assert.equal(canActivate({permission: Permission.MANAGE_USERS}, operator), false);
    assert.ok(canActivate({permission: Permission.MANAGE_USERS}, admin));
});

test('landingRoute sends each role to the module it works in', () => {
    assert.deepEqual(landingRoute(null), {name: 'commercial-value-proposition'});
    assert.deepEqual(landingRoute(sessionOf(RoleType.PRODUCTION_OPERATOR)), {name: 'production-overview'});
    assert.deepEqual(landingRoute(sessionOf(RoleType.ADMINISTRATOR)), {name: 'production-overview'});
    assert.deepEqual(landingRoute(sessionOf(RoleType.MAINTENANCE_TECHNICIAN)), {name: 'maintenance-machines'});
    const blind = new AuthenticatedSession({userId: new UserId('u'), token: new AccessToken('t'), role: new Role(RoleType.ADMINISTRATOR, [Permission.MANAGE_USERS])});
    assert.deepEqual(landingRoute(blind), {name: 'iam-profile'});
});

test('safeRedirectPath only accepts in-application paths', () => {
    assert.equal(safeRedirectPath('/production/batches?x=1'), '/production/batches?x=1');
    for (const unsafe of ['https://evil.example', '//evil.example', '/\\evil.example', 'production', '', null, undefined, ['/a'], 42]) {
        assert.equal(safeRedirectPath(unsafe), null, String(unsafe));
    }
});

test('protectModuleRoutes requires the manage permission to register or edit and the view permission to read', () => {
    const assertAccess = (routes, managePermission, expectations) => {
        const protectedRoutes = protectModuleRoutes(routes, managePermission);
        for (const route of protectedRoutes) {
            if (route.redirect) continue;
            const writes = /(^|\/)(new|edit)(\/|$)/.test(route.path);
            assert.equal(route.meta.permission, writes ? managePermission : Permission.VIEW_OPERATIONAL_INFORMATION, route.path);
            expectations.push(route.path);
        }
    };
    const seen = [];
    assertAccess(productionRoutes, Permission.MANAGE_PRODUCTION, seen);
    assertAccess(qualityRoutes, Permission.MANAGE_PRODUCTION, seen);
    assertAccess(assetRoutes, Permission.MANAGE_MAINTENANCE, seen);

    const byPath = new Map([
        ...protectModuleRoutes(productionRoutes, Permission.MANAGE_PRODUCTION),
        ...protectModuleRoutes(qualityRoutes, Permission.MANAGE_PRODUCTION),
        ...protectModuleRoutes(assetRoutes, Permission.MANAGE_MAINTENANCE),
    ].map(route => [route.path, route.meta.permission]));
    for (const path of ['receptions/new', 'batches/new', 'records/new', 'records/:id/edit', 'assessments/new', 'waste/new']) {
        assert.equal(byPath.get(path), Permission.MANAGE_PRODUCTION, path);
    }
    for (const path of ['machinery/new', 'maintenance/preventive/new', 'maintenance/corrective/new']) {
        assert.equal(byPath.get(path), Permission.MANAGE_MAINTENANCE, path);
    }
    for (const path of ['receptions', 'batches', 'records', 'history', 'waste', 'machinery', 'maintenance']) {
        assert.equal(byPath.get(path), Permission.VIEW_OPERATIONAL_INFORMATION, path);
    }
    assert.ok(seen.length > 15, 'the real module route files were inspected');
    // The module titles survive the protection.
    assert.equal(protectModuleRoutes(productionRoutes, Permission.MANAGE_PRODUCTION).find(route => route.name === 'production-receptions').meta.titleKey, 'receptions.title');
});
