# Contributing to Molinex Web Application

This document describes the collaboration rules used by the Vanguard Web Applications Development Team.

## Before starting

Synchronize the integration branch:

```powershell
git switch develop
git pull --ff-only origin develop
```

The working tree must be clean before starting a feature.

## Branch workflow

Use Git Flow Helper to start a feature from `develop`:

```text
Feature Start → <short-kebab-case-name>
```

The helper creates `feature/<short-kebab-case-name>`. Keep one concern per feature and avoid mixing unrelated formatting or refactoring changes.

Publish the feature when it is ready to share:

```text
Feature Publish
```

Open a pull request with:

- Base branch: `develop`
- Compare branch: the published `feature/*` branch
- A concise summary of the behavior implemented
- The validation commands and user flows executed

After the pull request is merged on GitHub, do not run **Feature Finish**, because the pull request already performed the integration. Update the local repository instead:

```powershell
git switch develop
git pull --ff-only origin develop
git branch -d feature/<feature-name>
git fetch origin --prune
```

## Commit messages

Use Conventional Commits:

```text
<type>(<optional-scope>): <imperative-description>
```

Common types:

- `feat`: adds user-facing behavior.
- `fix`: corrects incorrect behavior.
- `docs`: changes documentation only.
- `test`: adds or updates tests.
- `refactor`: changes structure without changing behavior.
- `chore`: updates tooling, dependencies, or project maintenance files.

Examples:

```text
feat(production): add raw material reception form
fix(quality): restore quality assessment routes
docs: add local setup instructions
chore(release): bump version to 0.1.0
```

Keep commits small, buildable, and focused on one reason for change.

## Architecture conventions

- Organize business code by bounded context.
- Keep domain rules and domain models independent from Vue, Pinia, Axios, and PrimeVue.
- Use value objects for meaningful domain concepts instead of passing primitive values throughout the model.
- Keep reusable cross-context domain concepts in `src/shared/domain/model`.
- Keep route definitions at the root of each context's `presentation` folder, not inside `views`.
- Views read reactive state and call actions through Pinia stores.
- Stores coordinate APIs and assemblers; views must not call REST clients directly.
- Assemblers translate between HTTP resources and domain objects.
- Reference other aggregates by identity rather than embedding mutable aggregate instances.
- Add visible text to both `src/locales/en.json` and `src/locales/es.json`.
- Use environment variables for API addresses and endpoint paths.
- Never commit credentials, license keys, or `.env.local`.

## Definition of done

Before publishing a feature:

1. Confirm that the implementation matches its user story and permitted operations.
2. Exercise the affected flow against the local fake API.
3. Verify English and Spanish UI text.
4. Confirm that no browser-console error was introduced.
5. Run:

   ```powershell
   npm test
   npm run build
   ```

6. Review `git status` and the complete diff.
7. Exclude generated files, local configuration, and unrelated changes.

## Pull request review

A pull request should be merged only when:

- Its scope is understandable from the title and description.
- The build and tests succeed.
- The changed user flow has been manually verified.
- Domain, application, infrastructure, and presentation responsibilities remain separated.
- At least one teammate has reviewed it when the team workflow requires approval.

## Release branches

Release branches are created only after the planned feature scope is integrated and validated in `develop`. The first partial Molinex release is planned as `v0.1.0`; `v1.0.0` is reserved for a complete and stable product scope.
