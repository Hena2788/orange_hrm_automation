import VacanciesPage from '../../pages/VacanciesPage';
import {
  loginAsAdmin,
  uniqueSuffix,
  ensureJobTitleExists,
  resolveHiringManagerSearchTerm,
} from '../../support/helpers';

const vacancyTestData = Cypress.env('vacanciesData') || [];

describe('Recruitment Module - Vacancies', () => {
  let testJobTitle;

  before(function () {
    cy.task('db:reset');

    const suffix = uniqueSuffix();
    testJobTitle = `QA Vacancy Job ${suffix}`;

    loginAsAdmin();
    resolveHiringManagerSearchTerm();

    if (!Cypress.env('useDemo')) {
      ensureJobTitleExists(testJobTitle);
    } else {
      testJobTitle = 'Automaton Tester';
    }
  });

  beforeEach(function () {
    loginAsAdmin();
    cy.intercept('GET', '**/api/v2/recruitment/vacancies?*').as('getVacancies');
    cy.intercept('POST', '**/api/v2/recruitment/vacancies').as('createVacancy');
  });

  after(function () {
    cy.task('logResults', 'Vacancies module tests completed');
  });

  describe('Add New Vacancy', () => {
    vacancyTestData
      .filter((row) => row.scenario === 'add_valid')
      .forEach((row) => {
        it(`should add vacancy: ${row.testCase}`, function () {
          const suffix = uniqueSuffix();
          const vacancyName = `${row.vacancyName}${suffix}`;

          VacanciesPage.visitAddForm();
          VacanciesPage.fillVacancyForm({
            vacancyName,
            jobTitle: testJobTitle,
            description: row.description,
            hiringManager: Cypress.env('hiringManagerSearch'),
            numOfPositions: row.numOfPositions,
          });
          VacanciesPage.submitForm();
          VacanciesPage.assertSuccessToast();
          cy.wait('@createVacancy', {timeout: 15000});

          VacanciesPage.visit();
          cy.wait('@getVacancies');
          VacanciesPage.assertVacancyInList(vacancyName);
        });
      });
  });

  describe('Mandatory Field Validation', () => {
    it('should show validation errors when mandatory fields are empty', function () {
      VacanciesPage.visitAddForm();
      VacanciesPage.submitForm();
      VacanciesPage.assertFieldRequired('Vacancy Name');
      VacanciesPage.assertFieldRequired('Job Title');
      VacanciesPage.assertFieldRequired('Hiring Manager');
    });
  });

  describe('Search Vacancies', () => {
    let createdVacancyName;

    before(function () {
      loginAsAdmin();
      const suffix = uniqueSuffix();
      createdVacancyName = `Search Vacancy ${suffix}`;

      cy.intercept('POST', '**/api/v2/recruitment/vacancies').as('createVacancy');
      VacanciesPage.visitAddForm();
      VacanciesPage.fillVacancyForm({
        vacancyName: createdVacancyName,
        jobTitle: testJobTitle,
        description: 'Vacancy for search test',
        hiringManager: Cypress.env('hiringManagerSearch'),
        numOfPositions: '3',
      });
      VacanciesPage.submitForm();
      cy.wait('@createVacancy');
    });

    it('should search vacancies by Job Title', function () {
      VacanciesPage.visit();
      cy.wait('@getVacancies');
      VacanciesPage.searchByJobTitle(testJobTitle);
      cy.wait('@getVacancies');
      VacanciesPage.assertVacancyInList(createdVacancyName);
    });

    it('should search vacancies by Hiring Manager', function () {
      VacanciesPage.visit();
      cy.wait('@getVacancies');
      VacanciesPage.searchByHiringManager(
        Cypress.env('hiringManagerLabel') || 'manda',
      );
      cy.wait('@getVacancies');
      VacanciesPage.assertVacancyInList(createdVacancyName);
    });

    it('should search vacancies by Vacancy Name filter', function () {
      VacanciesPage.visit();
      cy.wait('@getVacancies');
      VacanciesPage.searchByVacancyName(createdVacancyName);
      cy.wait('@getVacancies');
      VacanciesPage.assertVacancyInList(createdVacancyName);
    });
  });
});
