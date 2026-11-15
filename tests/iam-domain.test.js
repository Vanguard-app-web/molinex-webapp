import {test} from "node:test";
import assert from "node:assert/strict";
import {RoleType, roleTypes, isRoleType} from "../src/iam/domain/model/role-type.js";
import {Permission, permissions} from "../src/iam/domain/model/permission.js";
import {AccountStatus, accountStatuses} from "../src/iam/domain/model/account-status.js";
import {DEFAULT_SIGN_UP_ROLE, rolePermissions} from "../src/iam/domain/model/role-permissions.js";
import {Role} from "../src/iam/domain/model/role.js";
import {UserId} from "../src/iam/domain/model/user-id.js";
import {EmailAddress} from "../src/iam/domain/model/email-address.js";
import {FullName} from "../src/iam/domain/model/full-name.js";
import {JobTitle} from "../src/iam/domain/model/job-title.js";
import {PhoneNumber} from "../src/iam/domain/model/phone-number.js";
import {UserProfile} from "../src/iam/domain/model/user-profile.js";
import {User} from "../src/iam/domain/model/user.entity.js";
import {AccessToken} from "../src/iam/domain/model/access-token.js";
import {AuthenticatedSession} from "../src/iam/domain/model/authenticated-session.js";

const profile = (name = 'Ana Torres') => new UserProfile({fullName: new FullName(name)});
const user = (overrides = {}) => new User({
    id: new UserId('usr-1'),
    email: new EmailAddress('ana@molinex.test'),
    profile: profile(),
    role: Role.of(RoleType.PRODUCTION_OPERATOR),
    status: AccountStatus.ACTIVE,
    ...overrides,
});

test('the enumerations use exactly the names of the design', () => {
    assert.deepEqual([...roleTypes], ['ADMINISTRATOR', 'MAINTENANCE_TECHNICIAN', 'PRODUCTION_OPERATOR']);
    assert.deepEqual([...permissions], ['MANAGE_USERS', 'MANAGE_PRODUCTION', 'MANAGE_MAINTENANCE', 'VIEW_OPERATIONAL_INFORMATION', 'VIEW_REPORTS']);
    assert.deepEqual([...accountStatuses], ['ACTIVE', 'INACTIVE', 'LOCKED']);
    assert.ok(isRoleType(RoleType.ADMINISTRATOR));
    assert.equal(isRoleType('SUPERUSER'), false);
});

test('the permission matrix derived from the C4 actors', () => {
    assert.deepEqual([...rolePermissions[RoleType.ADMINISTRATOR]].sort(),
        [Permission.MANAGE_USERS, Permission.VIEW_OPERATIONAL_INFORMATION, Permission.VIEW_REPORTS].sort());
    assert.deepEqual([...rolePermissions[RoleType.MAINTENANCE_TECHNICIAN]].sort(),
        [Permission.MANAGE_MAINTENANCE, Permission.VIEW_OPERATIONAL_INFORMATION].sort());
    assert.deepEqual([...rolePermissions[RoleType.PRODUCTION_OPERATOR]].sort(),
        [Permission.MANAGE_PRODUCTION, Permission.VIEW_OPERATIONAL_INFORMATION].sort());
    for (const type of roleTypes) assert.ok(Role.of(type).allows(Permission.VIEW_OPERATIONAL_INFORMATION), type);
});

test('only the administrator manages users, and nobody else gains that permission', () => {
    assert.ok(Role.of(RoleType.ADMINISTRATOR).allows(Permission.MANAGE_USERS));
    assert.equal(Role.of(RoleType.ADMINISTRATOR).allows(Permission.MANAGE_PRODUCTION), false);
    assert.equal(Role.of(RoleType.ADMINISTRATOR).allows(Permission.MANAGE_MAINTENANCE), false);
    assert.equal(Role.of(RoleType.MAINTENANCE_TECHNICIAN).allows(Permission.MANAGE_USERS), false);
    assert.equal(Role.of(RoleType.MAINTENANCE_TECHNICIAN).allows(Permission.MANAGE_PRODUCTION), false);
    assert.equal(Role.of(RoleType.PRODUCTION_OPERATOR).allows(Permission.MANAGE_USERS), false);
    assert.equal(Role.of(RoleType.PRODUCTION_OPERATOR).allows(Permission.MANAGE_MAINTENANCE), false);
});

test('public sign-up announces the least-surprising default role', () => {
    assert.equal(DEFAULT_SIGN_UP_ROLE, RoleType.PRODUCTION_OPERATOR);
});

test('Role rejects unknown types and permissions, and ignores permissions it does not know from the API', () => {
    assert.throws(() => Role.of('SUPERUSER'));
    assert.throws(() => new Role(RoleType.ADMINISTRATOR, ['DELETE_EVERYTHING']));
    const fromApi = Role.fromResource(RoleType.MAINTENANCE_TECHNICIAN, [Permission.MANAGE_MAINTENANCE, 'SOMETHING_NEW']);
    assert.deepEqual([...fromApi.permissions], [Permission.MANAGE_MAINTENANCE]);
    assert.throws(() => Role.fromResource('SUPERUSER', []));
    assert.deepEqual([...Role.fromResource(RoleType.ADMINISTRATOR, undefined).permissions], [...rolePermissions[RoleType.ADMINISTRATOR]]);
    assert.ok(Role.of(RoleType.ADMINISTRATOR).equals(Role.of(RoleType.ADMINISTRATOR)));
    assert.equal(Role.of(RoleType.ADMINISTRATOR).equals(Role.of(RoleType.PRODUCTION_OPERATOR)), false);
});

test('a role keeps its permissions immutable', () => {
    const role = Role.of(RoleType.PRODUCTION_OPERATOR);
    assert.throws(() => role.permissions.push(Permission.MANAGE_USERS), TypeError);
    assert.equal(role.allows(Permission.MANAGE_USERS), false);
});

test('EmailAddress normalizes case and spaces and rejects malformed addresses', () => {
    assert.equal(new EmailAddress('  Ana@Molinex.TEST ').value, 'ana@molinex.test');
    assert.ok(new EmailAddress('ana@molinex.test').isValid());
    for (const invalid of ['', 'ana', 'ana@', '@molinex.test', 'ana@molinex', 'a na@molinex.test', 'ana@@molinex.test', null, 42]) {
        assert.equal(EmailAddress.isValid(invalid), false, String(invalid));
        assert.throws(() => new EmailAddress(invalid), String(invalid));
    }
    assert.throws(() => new EmailAddress(`${'a'.repeat(250)}@molinex.test`));
});

test('FullName, JobTitle and PhoneNumber follow the profile rules', () => {
    assert.throws(() => new FullName('   '));
    assert.throws(() => new FullName('x'.repeat(FullName.MAX_LENGTH + 1)));
    assert.equal(new FullName('  Ana Torres ').value, 'Ana Torres');

    assert.ok(new JobTitle().isEmpty());
    assert.throws(() => new JobTitle('x'.repeat(JobTitle.MAX_LENGTH + 1)));

    assert.ok(new PhoneNumber('').isEmpty());
    assert.equal(new PhoneNumber('+51 999 888 777').value, '+51 999 888 777');
    assert.ok(PhoneNumber.isValid('(01) 555-1234'));
    for (const invalid of ['abc', '12345', '1'.repeat(16), '++51 999 888 777', '51 999 x88']) {
        assert.equal(PhoneNumber.isValid(invalid), false, invalid);
        assert.throws(() => new PhoneNumber(invalid), invalid);
    }
});

test('UserProfile requires a full name and defaults the optional parts to empty', () => {
    assert.throws(() => new UserProfile({}));
    const created = profile();
    assert.ok(created.jobTitle.isEmpty());
    assert.ok(created.phoneNumber.isEmpty());
});

test('User can be given a role and a profile but validates what it holds', () => {
    const ana = user();
    ana.assignRole(Role.of(RoleType.ADMINISTRATOR));
    assert.equal(ana.role.type, RoleType.ADMINISTRATOR);
    ana.updateProfile(profile('Ana María Torres'));
    assert.equal(ana.profile.fullName.value, 'Ana María Torres');
    assert.throws(() => ana.assignRole('ADMINISTRATOR'));
    assert.throws(() => ana.updateProfile({fullName: 'Ana'}));
    assert.throws(() => user({status: 'DELETED'}));
    assert.throws(() => user({id: 'usr-1'}));
    assert.equal(ana.status, AccountStatus.ACTIVE);
});

test('UserId compares by value and refuses blank values', () => {
    assert.ok(new UserId('usr-1').equals(new UserId(' usr-1 ')));
    assert.equal(new UserId('usr-1').equals(new UserId('usr-2')), false);
    assert.throws(() => new UserId(''));
    assert.throws(() => new UserId(null));
});

test('AccessToken never prints its value by accident', () => {
    const token = new AccessToken('mlx-demo.secret-value');
    assert.equal(token.value, 'mlx-demo.secret-value');
    assert.ok(!String(token).includes('secret-value'));
    assert.ok(!JSON.stringify({token}).includes('secret-value'));
    assert.throws(() => new AccessToken('  '));
});

test('AuthenticatedSession exposes the role permissions and can refresh its role', () => {
    const session = new AuthenticatedSession({
        userId: new UserId('usr-1'),
        token: new AccessToken('mlx-demo.t'),
        role: Role.of(RoleType.PRODUCTION_OPERATOR),
    });
    assert.ok(session.isAuthenticated());
    assert.ok(session.allows(Permission.MANAGE_PRODUCTION));
    assert.equal(session.allows(Permission.MANAGE_USERS), false);

    const promoted = session.withRole(Role.of(RoleType.ADMINISTRATOR));
    assert.ok(promoted.allows(Permission.MANAGE_USERS));
    assert.ok(promoted.userId.equals(session.userId));
    assert.equal(promoted.token, session.token);
    assert.throws(() => new AuthenticatedSession({userId: 'usr-1', token: session.token, role: session.role}));
    assert.throws(() => new AuthenticatedSession({userId: session.userId, token: 'raw', role: session.role}));
});
