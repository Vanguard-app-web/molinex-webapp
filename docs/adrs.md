# Architecture Decision Records

This document records the architectural decisions implemented in Molinex Web Application `v0.1.0`. Each record describes the decision as it exists in the codebase; architecture diagrams and broader project analysis remain in the report repository.

## ADR-001: Organize the SPA by bounded context and layered architecture

- **Status:** Accepted
- **Date:** 2026-10-09

### Context

Molinex covers production, quality, yield, machinery, and maintenance concerns. Organizing all files only by technical type would mix distinct business models and make their boundaries unclear.

### Decision

Organize business code into `production-management`, `quality-yield-control`, and `asset-maintenance-management` bounded contexts. Divide each context into `domain`, `infrastructure`, `application`, and `presentation` layers.

### Consequences

- Business responsibilities and vocabulary remain visible in the directory structure.
- Dependencies between contexts require explicit identities, shared concepts, or application coordination.
- Some concepts are intentionally repeated when they mean different things in different contexts.

## ADR-002: Maintain a small Shared Kernel

- **Status:** Accepted
- **Date:** 2026-10-09

### Context

Several contexts use the same measurement concepts, HTTP setup, application shell, formatting, and presentation primitives. Duplicating these definitions would introduce inconsistent behavior.

### Decision

Keep stable cross-context domain concepts in `src/shared/domain/model`, common HTTP infrastructure in `src/shared/infrastructure`, and reusable shell and UI elements in `src/shared/presentation`. Do not create a separate `production-quality-shared-kernel` module.

### Consequences

- Shared concepts have one implementation and one set of tests.
- Changes to the kernel can affect several contexts and therefore require careful review.
- Context-specific rules remain outside Shared even when their names appear similar.

## ADR-003: Use Pinia setup stores as the application layer

- **Status:** Accepted
- **Date:** 2026-10-09

### Context

Vue views need reactive state and coordinated asynchronous operations without taking responsibility for HTTP access or business object mapping.

### Decision

Use Composition-API Pinia setup stores in each bounded context. Views read store state with `storeToRefs` and invoke store actions. Stores coordinate API clients, assemblers, loading flags, and operation errors.

### Consequences

- Views remain focused on interaction and rendering.
- Application workflows have a consistent entry point.
- Stores depend on infrastructure classes directly, favoring course simplicity over introducing repository ports not used by the reference guide.

## ADR-004: Translate HTTP resources with assemblers

- **Status:** Accepted
- **Date:** 2026-10-09

### Context

REST resources are plain serializable data, while the domain model uses entities and value objects with validation and behavior. Sending or storing domain objects directly would couple the model to the transport format.

### Decision

Use assembler classes in each context's infrastructure layer to create domain objects from API resources and create request resources from domain objects.

### Consequences

- API representation changes are isolated from the domain model.
- Stores operate with domain objects and send explicit resources.
- Every new resource shape requires an assembler mapping and tests or acceptance validation.

## ADR-005: Model domain concepts with value objects and reference aggregates by identity

- **Status:** Accepted
- **Date:** 2026-10-09

### Context

Primitive strings and numbers do not express constraints such as supported units, positive weights, identifiers, codes, names, and valid dates. Direct object references between aggregates would also expand consistency boundaries.

### Decision

Represent meaningful domain concepts with immutable value objects that validate their state. Keep aggregates small and reference other aggregates through identifiers, resolving display information in stores or read models.

### Consequences

- Invalid values are rejected close to their definition.
- Domain APIs express business meaning rather than primitive parameters alone.
- Assemblers and forms must explicitly construct value objects and surface validation errors.

## ADR-006: Use the Vue Composition API and runtime internationalization

- **Status:** Accepted
- **Date:** 2026-10-09

### Context

The application must support English and Spanish without separate builds, while following the Composition-API-first style used in the course.

### Decision

Implement Vue single-file components with `<script setup>` and use Vue I18n in Composition API mode. Store all visible interface messages in `src/locales/en.json` and `src/locales/es.json`.

### Consequences

- Users can switch language immediately at runtime.
- New visible messages must be added to both dictionaries.
- Browser titles and form validation messages use the same translation source as the views.

## ADR-007: Use PrimeVue with a Molinex design system

- **Status:** Accepted
- **Date:** 2026-10-09

### Context

The SPA needs accessible form, data, feedback, and navigation controls while maintaining the visual identity established for Molinex.

### Decision

Use PrimeVue components with PrimeFlex and PrimeIcons, configured with a custom Molinex preset and shared design tokens. Load the PrimeUI Community license through `VITE_PRIME_UI_LICENSE_KEY` in an ignored local environment file or deployment secret.

### Consequences

- Common controls behave and look consistently across contexts.
- The application depends on PrimeVue conventions and its license configuration.
- Custom styling should extend shared tokens instead of introducing unrelated palettes.

## ADR-008: Use JSON Server as a replaceable development API

- **Status:** Accepted
- **Date:** 2026-10-09

### Context

The Vue application must demonstrate complete REST interactions before the definitive backend and database are available.

### Decision

Use JSON Server with `server/db.json` and `server/routes.json` for local development. Expose the same `/api/v1` resource paths expected from the future platform and configure the base URL and endpoints through Vite environment variables.

### Consequences

- The frontend can be developed and demonstrated independently.
- JSON Server is not the definitive C# backend and does not implement production security or persistence guarantees.
- The deployed mock will live in a separate project; replacing it should primarily require an environment URL change when the API contract remains compatible.

## ADR-009: Use relative imports without a path alias

- **Status:** Accepted
- **Date:** 2026-10-09

### Context

The reference project uses the default Vite resolver and relative module paths. Introducing an alias would require additional Vite and editor configuration that is not necessary for the current project size.

### Decision

Use explicit relative imports, including file extensions, and keep `vite.config.js` limited to the Vue plugin unless deployment later requires another setting.

### Consequences

- The project works with the default Vite configuration.
- Import paths expose the distance between layers and contexts.
- Moving files may require updating several import statements.
