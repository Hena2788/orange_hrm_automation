/**
 * Cypress configuration — override via environment variables in CI/local.
 *
 * CYPRESS_BASE_URL, CYPRESS_useDemo, CYPRESS_PROJECT_ID, CYPRESS_RECORD_KEY
 * See README.md for CI/CD setup.
 */
const {defineConfig} = require('cypress');

const axios = require('axios');
const XLSX = require('xlsx');
const path = require('path');

const isCI = process.env.CI === 'true';

module.exports = defineConfig({
  defaultCommandTimeout: 10000,
  pageLoadTimeout: isCI ? 120000 : 60000,
  retries: {
    runMode: isCI ? 2 : 2,
    openMode: 0,
  },
  video: true,
  screenshotOnRunFailure: true,
  scrollBehavior: 'top',
  projectId: process.env.CYPRESS_PROJECT_ID || '83eznf',
  reporter: 'cypress-mochawesome-reporter',
  reporterOptions: {
    reportDir: 'cypress/reports',
    charts: true,
    reportPageTitle: 'OrangeHRM E2E Test Report',
    embeddedScreenshots: true,
    inlineAssets: true,
    saveAllAttempts: false,
  },
  env: {
    useDemo:
      process.env.CYPRESS_useDemo !== undefined
        ? process.env.CYPRESS_useDemo === 'true'
        : true,
    adminUsername: process.env.CYPRESS_adminUsername || 'Admin',
    adminPassword: process.env.CYPRESS_adminPassword || 'admin123',
    invalidLoginMessage: 'Invalid credentials',
    hiringManagerSearch: 'manda',
  },
  e2e: {
    baseUrl:
      process.env.CYPRESS_BASE_URL ||
      'https://opensource-demo.orangehrmlive.com/web/index.php',
    supportFile: 'cypress/support/e2e.js',
    specPattern: 'cypress/e2e/**/*.cy.js',
    setupNodeEvents(on, config) {
      require('cypress-mochawesome-reporter/plugin')(on);

      const asyncWrapper = async (promise) => {
        try {
          return [await promise, null];
        } catch (err) {
          console.error(err);
          return [null, err];
        }
      };

      const testingApiEndpoint = `${config.baseUrl}/functional-testing`;

      const createSavePoint = async (savepointName) =>
        asyncWrapper(
          axios.post(`${testingApiEndpoint}/database/create-savepoint`, {
            savepointName,
          }),
        );

      const restoreToSavePoint = async (savepointName) =>
        asyncWrapper(
          axios.post(`${testingApiEndpoint}/database/restore-to-savepoint`, {
            savepointName,
          }),
        );

      const deleteSavePoints = async (savepointNames) =>
        asyncWrapper(
          axios.post(`${testingApiEndpoint}/database/delete-savepoints`, {
            savepointNames,
          }),
        );

      const resetDatabase = async () =>
        asyncWrapper(axios.post(`${testingApiEndpoint}/database/reset`));

      const truncateTable = async (tables) =>
        asyncWrapper(
          axios.post(`${testingApiEndpoint}/truncate-table`, {tables}),
        );

      on('task', {
        async 'db:reset'() {
          if (config.env.useDemo) return null;
          const [response] = await resetDatabase();
          return response ? response.data : undefined;
        },
        async 'db:truncate'(payload) {
          if (config.env.useDemo) return null;
          const [response] = await truncateTable(payload.tables);
          return response ? response.data : undefined;
        },
        async 'db:snapshot'(payload) {
          if (config.env.useDemo) return null;
          const [response] = await createSavePoint(payload.name);
          return response ? response.data : undefined;
        },
        async 'db:restore'(payload) {
          if (config.env.useDemo) return null;
          const [response] = await restoreToSavePoint(payload.name);
          return response ? response.data : undefined;
        },
        async 'db:clearSnapshots'(payload) {
          if (config.env.useDemo) return null;
          const [response] = await deleteSavePoints(payload.names);
          return response ? response.data : undefined;
        },
        readExcel(filePath) {
          const workbook = XLSX.readFile(
            path.resolve(__dirname, filePath),
          );
          const sheetName = workbook.SheetNames[0];
          return XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
        },
        logResults(message) {
          console.log(`[Test Results] ${message}`);
          return null;
        },
      });

      loadExcelFixtures(config);
      return config;
    },
  },
});

function loadExcelFixtures(config) {
  const fixtures = ['loginData', 'candidatesData', 'vacanciesData'];
  fixtures.forEach((name) => {
    try {
      const filePath = path.resolve(
        __dirname,
        `cypress/fixtures/data/${name}.xlsx`,
      );
      const workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      config.env[name] = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
    } catch (err) {
      console.warn(
        `Could not load ${name}.xlsx — run: npm run generate-data`,
      );
      config.env[name] = [];
    }
  });
}
