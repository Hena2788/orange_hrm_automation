import './commands';
import 'cypress-mochawesome-reporter/register';

before(function () {
  cy.fixture('user').then((users) => {
    if (!Cypress.env('useDemo')) {
      Cypress.env('adminUsername', users.admin.username);
      Cypress.env('adminPassword', users.admin.password);
    }
  });
});

afterEach(function () {
  if (this.currentTest.state === 'failed') {
    const specName = Cypress.spec.name.replace('.cy.js', '');
    const testName = this.currentTest.title.replace(/\s+/g, '_');
    cy.screenshot(`${specName}/${testName}_failure`);
  }
});

after(function () {
  cy.task('logResults', `Completed: ${Cypress.spec.name}`);
});
