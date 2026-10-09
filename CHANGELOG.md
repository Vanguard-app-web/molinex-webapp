# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
