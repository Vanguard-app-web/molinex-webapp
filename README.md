# Molinex Web Application

Molinex is a web application for the operational management of rice mills. It supports the traceability of raw material receptions, production batches and processes, quality and waste records, machinery, and maintenance activities.

This repository contains the Vue single-page application developed by the Vanguard team for the Web Applications course.

## Current scope

The planned first release, `v0.1.0`, represents the partial but functional scope implemented for Sprint 2. It currently includes:

- **Production Management:** raw material receptions, production batches, production processes, traceability, and production history.
- **Quality and Yield Control:** quality assessments and waste records associated with production processes.
- **Asset and Maintenance Management:** machinery inventory and preventive and corrective maintenance records.
- **Shared Kernel:** reusable domain value objects, HTTP infrastructure, presentation components, application shell, internationalization, and common utilities.

The application currently consumes a local fake REST API powered by `json-server`. The deployable mock API and the definitive backend are separate stages of the project.

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
npm install
```

Create `.env.local` from the committed template:

```powershell
Copy-Item .env.example .env.local
```

Set the team PrimeUI key in `.env.local`:

```env
VITE_PRIME_UI_LICENSE_KEY="<provided-license-key>"
```

Files matching `*.local` are ignored by Git. Do not commit the license key or other credentials.

## Run locally

Start the fake REST API in the first terminal:

```powershell
npm run api
```

It runs at `http://localhost:3000/api/v1`.

Start the Vue application in a second terminal:

```powershell
npm run dev
```

Open the local URL printed by Vite, normally `http://localhost:5173`.

## Available scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Starts the Vite development server. |
| `npm run api` | Starts the local JSON Server API on port 3000. |
| `npm test` | Runs the automated domain and integration tests. |
| `npm run build` | Creates the production bundle in `dist/`. |
| `npm run preview` | Serves the production bundle locally for verification. |

## Fake API resources

The local API exposes these resources under `/api/v1`:

- `/raw-material-receptions`
- `/production-batches`
- `/production-records`
- `/quality-assessments`
- `/waste-records`
- `/machines`
- `/maintenance-records`

Seed data and local rewrite rules live under `server/`. The production API base URL will be updated when the deployable mock API is available in Azure.

## Quality checks

Before opening a pull request, run:

```powershell
npm test
npm run build
```

Also verify the affected user flows in both English and Spanish while the local API is running.

## Collaboration workflow

Development follows Git Flow with feature branches and pull requests into `develop`. Commit messages follow Conventional Commits. See [CONTRIBUTING.md](CONTRIBUTING.md) for the complete workflow.

## Project documentation

- [Architecture Decision Records](docs/adrs.md) document the decisions implemented in this codebase.
- [CHANGELOG.md](CHANGELOG.md) records the contents of each release.
- Business requirements, architecture diagrams, EventStorming models, and other report artifacts are maintained in the [Molinex Applications Web report](https://github.com/Vanguard-app-web/molinex-report-apweb).

## License

This project is licensed under the MIT License. See [LICENSE.md](LICENSE.md).
