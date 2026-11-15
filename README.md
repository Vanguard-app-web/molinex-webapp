# Molinex Web Application

Molinex is a web application for the operational management of rice mills. It supports the traceability of raw material receptions, production batches and processes, quality and waste records, machinery, and maintenance activities.

This repository contains the Vue single-page application developed by the Vanguard team for the Web Applications course.

## Current scope

The planned first release, `v0.1.0`, represents the partial but functional scope implemented for Sprint 2. It currently includes:

- **Production Management:** raw material receptions, production batches, production processes, traceability, and production history.
- **Quality and Yield Control:** quality assessments and waste records associated with production processes.
- **Asset and Maintenance Management:** machinery inventory and preventive and corrective maintenance records.
- **Identity and Access Management:** sign-in, sign-up, sign-out, session recovery after a reload, user administration, role assignment, own profile, and route and action authorization by permission.
- **Commercial Engagement:** public plan catalog, value proposition and commercial inquiry form, available without signing in.
- **Shared Kernel:** reusable domain value objects, HTTP infrastructure, presentation components, application shell, internationalization, and common utilities.

Operational Intelligence and Reporting and Analytics are not implemented.

The application consumes the mock REST API of the `molinex-platform` repository, which implements every context listed above. The definitive backend is a separate stage of the project. See [Mock API and local connection](#mock-api-and-local-connection).

## Technology stack

| Concern | Technology |
| --- | --- |
| Frontend framework | Vue 3 with Composition API and `<script setup>` |
| Build tool | Vite |
| State management | Pinia setup stores |
| Routing | Vue Router |
| UI components | PrimeVue, PrimeFlex, and PrimeIcons |
| HTTP client | Axios |
| Internationalization | Vue I18n |
| Development API | JSON Server |
| Testing | Node.js test runner |

## Architecture

The source code is organized by bounded context and DDD-inspired layers:

```text
src/
├── production-management/
├── quality-yield-control/
├── asset-maintenance-management/
├── iam/
├── commercial-engagement/
├── shared/
│   ├── domain/model/
│   ├── infrastructure/
│   └── presentation/
├── locales/
├── router.js
├── pinia.js
└── main.js
```

Each business bounded context is divided into:

- `domain/model`: entities, value objects, and domain rules.
- `infrastructure`: REST API clients and assemblers.
- `application`: Pinia stores and application coordination.
- `presentation`: Vue components, views, and route definitions.

Domain concepts shared across bounded contexts belong in `src/shared/domain/model`. Views communicate with their store and do not call API clients directly.

## Prerequisites

- Node.js 24.20 LTS or newer.
- npm, included with Node.js.
- A PrimeUI Community license key provided to the team.

## Local setup

Clone the repository and install its dependencies:

```powershell
git clone https://github.com/Vanguard-app-web/molinex-webapp.git
Set-Location molinex-webapp
npm ci
```

`npm install` works as well; `npm ci` restores exactly what `package-lock.json` records.

Create `.env.local` from the committed template:

```powershell
Copy-Item .env.example .env.local
```

Set the team PrimeUI key in `.env.local`:

```env
VITE_PRIME_UI_LICENSE_KEY="<provided-license-key>"
```

Files matching `*.local` are ignored by Git. Do not commit the license key or other credentials.

Without a key the application still runs, but PrimeVue prints `PrimeUI license is not configured` in the console and shows an "Invalid PrimeUI License" badge. The key is never part of the repository or of any package.

## Run locally

The web application needs the mock API of the `molinex-platform` repository. Run them in two terminals.

1. In the `molinex-platform` folder, start the mock API (it runs at `http://localhost:3000`):

   ```powershell
   npm ci
   npm start
   ```

2. In the `molinex-webapp` folder, start the Vue application:

   ```powershell
   npm run dev
   ```

   Open the local URL printed by Vite, normally `http://localhost:5173`.

`.env.development` already points to `http://localhost:3000/api/v1`. To use other ports, set the variables in the shell (they take precedence over the `.env` files) or in `.env.local`:

```powershell
# Mock API on another port: PORT=3101 in the platform terminal, then in the web terminal:
$env:VITE_API_BASE_URL = "http://localhost:3101/api/v1"
npm run dev -- --port 5174
```

Do not run `npm run api` for these flows (see below).

## Available scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Starts the Vite development server. |
| `npm run api` | Starts the legacy internal JSON Server on port 3000. It does **not** implement Identity and Access Management or Commercial Engagement, and its operational endpoints are not protected. Use the `molinex-platform` mock instead. |
| `npm test` | Runs the automated domain, infrastructure, store, translation and integration tests (Node.js test runner, no extra dependencies). |
| `npm run build` | Creates the production bundle in `dist/`. |
| `npm run preview` | Serves the production bundle locally for verification. |

## Mock API and local connection

`server/` (the `npm run api` script) is the original internal mock and is kept unchanged for reference. The current API contract lives in `molinex-platform`, and its README documents every endpoint, error, permission and demonstration account. The frontend uses these paths under `VITE_API_BASE_URL`:

| Variable | Default path | Used by |
| --- | --- | --- |
| `VITE_RAW_MATERIAL_RECEPTIONS_ENDPOINT_PATH`, `VITE_PRODUCTION_BATCHES_ENDPOINT_PATH`, `VITE_PRODUCTION_RECORDS_ENDPOINT_PATH` | `/raw-material-receptions`, `/production-batches`, `/production-records` | Production Management |
| `VITE_QUALITY_ASSESSMENTS_ENDPOINT_PATH`, `VITE_WASTE_RECORDS_ENDPOINT_PATH` | `/quality-assessments`, `/waste-records` | Quality and Yield Control |
| `VITE_MACHINES_ENDPOINT_PATH`, `VITE_MAINTENANCE_RECORDS_ENDPOINT_PATH` | `/machines`, `/maintenance-records` | Asset and Maintenance Management |
| `VITE_IAM_SIGN_IN_ENDPOINT_PATH`, `VITE_IAM_SIGN_UP_ENDPOINT_PATH`, `VITE_IAM_SIGN_OUT_ENDPOINT_PATH`, `VITE_IAM_USERS_ENDPOINT_PATH`, `VITE_IAM_PROFILE_ENDPOINT_PATH` | `/iam/sign-in`, `/iam/sign-up`, `/iam/sign-out`, `/iam/users`, `/iam/profile` | Identity and Access Management |
| `VITE_COMMERCIAL_PLANS_ENDPOINT_PATH`, `VITE_COMMERCIAL_VALUE_PROPOSITION_ENDPOINT_PATH`, `VITE_COMMERCIAL_INQUIRIES_ENDPOINT_PATH` | `/commercial/plans`, `/commercial/value-proposition`, `/commercial/inquiries` | Commercial Engagement |

The Identity and Commercial paths default to the values above when the variable is absent, so `.env.production` (which points to the deployed API) does not need to define them. Production deployment settings are not changed by this work: the deployed mock API must be updated to the new `molinex-platform` version before the matching frontend is released, because the operational endpoints now require a token.

## Access control

- Visitors can open the value proposition (`/value-proposition`), the plans (`/plans`), the inquiry form (`/contact`), sign-in (`/sign-in`) and sign-up (`/sign-up`). Every other route requires a session; a visitor is sent to sign-in and returns to the requested page afterwards.
- A signed-in user who lacks the permission of a route sees the access-denied page. Links the user cannot use are hidden, and the API enforces the same rules independently.
- The session survives a page reload: only the opaque access token is kept in `localStorage` (never a password). On start the token is checked against the API. If the API rejects the token, or after sign-out, the session and every private datum are discarded and the page reloads at sign-in so the other modules also drop what they held in memory.
- One Axios interceptor, installed by `BaseApi` on each API instance, sends `Authorization: Bearer <token>` only to the API origin.

| Route | Permission |
| --- | --- |
| Read pages of Production, Quality and Assets | `VIEW_OPERATIONAL_INFORMATION` |
| Pages that register or edit production, quality or waste data | `MANAGE_PRODUCTION` |
| Pages that register machines or maintenance | `MANAGE_MAINTENANCE` |
| `/users`, `/users/new`, `/users/:id/edit`, `/users/:id/role` | `MANAGE_USERS` |
| `/profile` | any signed-in user |

| Role | Permissions |
| --- | --- |
| `ADMINISTRATOR` | `MANAGE_USERS`, `VIEW_OPERATIONAL_INFORMATION`, `VIEW_REPORTS` |
| `MAINTENANCE_TECHNICIAN` | `MANAGE_MAINTENANCE`, `VIEW_OPERATIONAL_INFORMATION` |
| `PRODUCTION_OPERATOR` | `MANAGE_PRODUCTION`, `VIEW_OPERATIONAL_INFORMATION` |

The matrix is derived from the C4 actors and relationships (see the `molinex-platform` README); `VIEW_REPORTS` only travels with the role, because reporting is out of scope. The permissions the API returns always take precedence over this default matrix.

### Demonstration accounts

Fictitious accounts created by the mock API (public demonstration values, not secrets):

| Email | Password | Role | Status |
| --- | --- | --- | --- |
| `admin@molinex.test` | `Demo-Admin-2026` | `ADMINISTRATOR` | `ACTIVE` |
| `technician@molinex.test` | `Demo-Technician-2026` | `MAINTENANCE_TECHNICIAN` | `ACTIVE` |
| `operator@molinex.test` | `Demo-Operator-2026` | `PRODUCTION_OPERATOR` | `ACTIVE` |
| `inactive@molinex.test` | `Demo-Inactive-2026` | `PRODUCTION_OPERATOR` | `INACTIVE` |
| `locked@molinex.test` | `Demo-Locked-2026` | `MAINTENANCE_TECHNICIAN` | `LOCKED` |

### Decisions and limitations

- The authentication is a **local simulation**: the token is an opaque demonstration value, not a JWT, and nothing here is production-grade security. There is no email verification, password recovery, multi-factor authentication or external integration.
- Public sign-up creates accounts with the `PRODUCTION_OPERATOR` role (the design does not define the default role); only an administrator can change a role, and nobody can raise their own privileges through sign-up or the profile.
- The API does not offer an operation to change the account status, so the interface cannot activate, deactivate or lock accounts.
- The commercial catalog is empty: no plans, prices or benefits are confirmed in the sources, and none were invented. The value proposition headline reuses the product description of this application. Both appear as understandable empty states and are published through the content file of `molinex-platform`.
- The technician of a maintenance record is still typed as a name; linking `TechnicianReference.principalId` to the signed-in user is not part of this scope.

## Quality checks

Before opening a pull request, run:

```powershell
npm test
npm run build
```

To build and preview the production bundle against a local mock API without touching `.env.production`, override the API address in the shell (this never sends a request to the deployed API):

```powershell
$env:VITE_API_BASE_URL = "http://localhost:3000/api/v1"
npm run build
npm run preview
```

Also verify the affected user flows in both English and Spanish while the mock API is running.

## Collaboration workflow

Development follows Git Flow with feature branches and pull requests into `develop`. Commit messages follow Conventional Commits. See [CONTRIBUTING.md](CONTRIBUTING.md) for the complete workflow.

## Project documentation

- [Architecture Decision Records](docs/adrs.md) document the decisions implemented in this codebase.
- [CHANGELOG.md](CHANGELOG.md) records the contents of each release.
- Business requirements, architecture diagrams, EventStorming models, and other report artifacts are maintained in the [Molinex Applications Web report](https://github.com/Vanguard-app-web/molinex-report-apweb).

## License

This project is licensed under the MIT License. See [LICENSE.md](LICENSE.md).
