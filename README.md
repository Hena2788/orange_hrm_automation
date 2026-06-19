# OrangeHRM Cypress E2E Automation

Standalone Cypress project for automating **Login** and **Recruitment** (Candidates & Vacancies) on OrangeHRM.

## Project Structure

```
OrganHRM_Automation/
├── .github/workflows/cypress-e2e.yml   # CI/CD pipeline
├── cypress.config.js                   # Cypress config (env overrides for CI)
├── cypress/
│   ├── e2e/login/
│   ├── e2e/recruitment/
│   ├── fixtures/data/                  # Excel test data
│   ├── pages/                          # Page Object Model
│   └── support/
└── scripts/generate-test-data.js
```

## Local Setup

```bash
cd OrganHRM_Automation
npm install
npm run generate-data
npm test
```

| Command | Description |
|---------|-------------|
| `npm test` | Run all 20 E2E tests |
| `npm run test:login` | Login module only |
| `npm run test:recruitment` | Recruitment module only |
| `npm run open` | Cypress interactive runner |
| `npm run lint` | ESLint on cypress/ and scripts/ |

**HTML report:** `cypress/reports/index.html`

### Target application

Override via environment variables or edit `cypress.config.js`:

| Environment | `CYPRESS_BASE_URL` | `CYPRESS_useDemo` |
|-------------|-------------------|-------------------|
| Hosted demo (default) | `https://opensource-demo.orangehrmlive.com/web/index.php` | `true` |
| Local OrangeHRM | Your local URL | `false` |

For local installs, run `php <orangehrm>/src/test/functional/tools/prepare.php` first.

**Node.js:** Use Node 22+ locally (`.nvmrc` pins Node 24 for CI).

## CI/CD (GitHub Actions)

Pipeline file: `.github/workflows/cypress-e2e.yml`

### Triggers

- Push / pull request to `main`, `master`, or `develop`
- Nightly schedule (02:00 UTC)
- Manual run (`workflow_dispatch`)

### Pipeline stages

1. **Lint** — ESLint on test code
2. **Cypress (parallel)** — Login and Recruitment run in separate jobs
3. **Artifacts** — Mochawesome reports, screenshots (on failure), videos

### GitHub secrets (optional — Cypress Cloud)

| Secret | Purpose |
|--------|---------|
| `CYPRESS_RECORD_KEY` | Record runs to [Cypress Cloud](https://cloud.cypress.io) |

When `CYPRESS_RECORD_KEY` is set, the workflow automatically records results. Project ID is in `cypress.config.js` (`CYPRESS_PROJECT_ID` override supported).

### Branch protection (recommended)

GitHub → Settings → Branches → Add rule:

- Require status checks: `Lint`, `E2E — Login`, `E2E — Recruitment`

## Features

- Page Object Model (Login, Candidates, Vacancies)
- Data-driven testing with Excel files
- Cypress hooks (`before`, `beforeEach`, `after`, `afterEach`)
- Test retries and Mochawesome HTML reporting
- CI/CD with parallel jobs, caching, and artifact uploads
