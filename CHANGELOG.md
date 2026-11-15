# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Identity and Access Management: sign-in, sign-up, sign-out, session recovery after a reload, user list and administration, role assignment, own profile, access-denied page, and the `useIamStore`, `IamApi`, assemblers, `TokenStorage`, `authenticationGuard` and `iamInterceptor` of its design.
- Role and permission model (`ADMINISTRATOR`, `MAINTENANCE_TECHNICIAN`, `PRODUCTION_OPERATOR`; `MANAGE_USERS`, `MANAGE_PRODUCTION`, `MANAGE_MAINTENANCE`, `VIEW_OPERATIONAL_INFORMATION`, `VIEW_REPORTS`; `ACTIVE`, `INACTIVE`, `LOCKED`) with translated labels.
- Commercial Engagement: public plan catalog, value proposition and commercial inquiry form, with loading, empty, error, retry and confirmation states, and the `useCommercialStore`, `CommercialApi` and assemblers of its design.
- Authentication section in the top bar and an application shell navigation that adapts to visitors and to each role.
- Route authorization by permission in the router; the module route files are unchanged.
- `VITE_IAM_*` and `VITE_COMMERCIAL_*` endpoint path variables in `.env.development` and `.env.example`; the paths default to the mock API contract when the variable is absent.
- English and Spanish translations for the new contexts, access errors and API error codes.
- Automated tests of the new domain models, assemblers, interceptor, access rules, route protection, error mapping, translations and stores.
- README sections for the local connection to `molinex-platform`, access control, permissions, demonstration accounts and limitations.

### Changed

- `BaseApi` installs the authentication interceptor on every Axios instance; the token is only sent to the API origin, and a rejected token ends the session.
- `ApiErrorHandler` maps the error codes of the API and the `401` and `403` statuses.
- The shared `link-button` and the production traceability components hide actions the signed-in role cannot use.
- Focus rings stay visible on PrimeVue buttons and toggles.
- The application now expects the `molinex-platform` mock API, whose operational endpoints require a bearer token. `npm run api` keeps the legacy internal mock, which does not implement the new contexts.

## [0.1.1] - 2026-10-09

### Added

- Azure Static Web Apps navigation fallback for direct access to and refreshes of Vue Router routes.

### Changed

- Configured the production frontend to consume the Molinex mock API deployed on Azure App Service.

## [0.1.0] - 2026-10-09

### Added

- Vue 3 and Vite project foundation with Pinia, Vue Router, Axios, PrimeVue, PrimeFlex, PrimeIcons, and Vue I18n.
- DDD-inspired organization by bounded context and by domain, infrastructure, application, and presentation layers.
- Shared Kernel with reusable value objects, HTTP infrastructure, presentation components, application shell, and utilities.
- English and Spanish runtime localization and a responsive Molinex visual theme.
- Raw material reception registration and consultation (US-05).
- Production batch registration and traceability to its reception (US-06).
- Production process registration and editing (US-07 and US-10).
- Production overview, batch traceability, and production history (US-08 and US-09).
- Quality assessment registration and consultation for production processes (US-11).
- Waste registration, percentage calculation, and consultation (US-14).
- Machinery inventory and machine registration (US-17).
- Preventive and corrective maintenance registration and history (US-19 and US-20).
- Local fake REST API with seven resources, seeded data, and `/api/v1` rewrite rules.
- Automated tests for Shared Kernel value objects and Production Management domain rules.
- Project README, MIT license, and team contribution guidelines.

### Fixed

- Corrected waste validation and calculated percentage handling.
- Consolidated cross-context domain imports under `src/shared/domain/model`.
- Restored the missing Quality and Waste views and their route definitions.
- Prevented empty mode-specific environment variables from overriding the local PrimeUI license key.
