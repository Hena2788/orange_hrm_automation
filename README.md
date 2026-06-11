# OrangeHRM Cypress E2E Automation

Standalone Cypress project for automating **Login** and **Recruitment** (Candidates & Vacancies) on OrangeHRM.

## Project Structure

```
OrganHRM_Automation/
├── cypress.config.js              # Local config (create from example)
├── cypress.config.example.js
├── cypress/
│   ├── e2e/
│   │   ├── login/login.cy.js
│   │   └── recruitment/
│   │       ├── candidates.cy.js
│   │       └── vacancies.cy.js
│   ├── fixtures/data/             # Excel test data
│   ├── pages/                     # Page Object Model
│   └── support/
│       ├── e2e.js                 # Global hooks
│       ├── commands.js
│       ├── helpers.js
│       └── oxd.js
└── scripts/generate-test-data.js
```

## Setup

```bash
cd C:\Users\QA-BinaryCosmo\OrganHRM_Automation
npm install
cp cypress.config.example.js cypress.config.js
npm run generate-data
```

### Target application

Edit `cypress.config.js`:

| Environment | baseUrl | useDemo |
|-------------|---------|---------|
| Hosted demo | `https://opensource-demo.orangehrmlive.com/web/index.php` | `true` |
| Local OrangeHRM | Your local URL (e.g. `http://localhost/orangehrm/web/index.php`) | `false` |

For local installs, run `php <orangehrm>/src/test/functional/tools/prepare.php` in the OrangeHRM repo first.

## Run Tests

```bash
npm test              # all E2E tests
npm run test:login    # login only
npm run test:recruitment
npm run open          # Cypress interactive runner
```

**HTML report:** `cypress/reports/index.html`

## Cypress Cloud

1. Create a project at [cloud.cypress.io](https://cloud.cypress.io)
2. Set `projectId` in `cypress.config.js`
3. Run: `set CYPRESS_RECORD_KEY=your_key && npm run test:cloud`

## Features

- Page Object Model (Login, Candidates, Vacancies)
- Data-driven testing with Excel files
- Cypress hooks (`before`, `beforeEach`, `after`, `afterEach`)
- Test retries and Mochawesome HTML reporting
