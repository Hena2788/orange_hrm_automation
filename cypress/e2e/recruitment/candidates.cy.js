import CandidatesPage from '../../pages/CandidatesPage';
import VacanciesPage from '../../pages/VacanciesPage';
import {
  loginAsAdmin,
  uniqueSuffix,
  ensureJobTitleExists,
  resolveHiringManagerSearchTerm,
  resolveJobTitle,
} from '../../support/helpers';

const candidateTestData = Cypress.env('candidatesData') || [];

describe('Recruitment Module - Candidates', () => {
  let testVacancyName;
  let testJobTitle;
  let testCandidate;

  before(function () {
    cy.task('db:reset');

    const suffix = uniqueSuffix();
    testJobTitle = `QA Job ${suffix}`;
    testVacancyName = `QA Vacancy ${suffix}`;
    testCandidate = {
      firstName: 'John',
      middleName: 'Q',
      lastName: `Candidate${suffix}`,
      email: `john.candidate${suffix}@test.com`,
      contactNumber: '1234567890',
    };

    loginAsAdmin();
    resolveHiringManagerSearchTerm();

    cy.then(() => {
      if (Cypress.env('useDemo')) {
        return resolveJobTitle().then((title) => {
          testJobTitle = title;
        });
      }
      ensureJobTitleExists(testJobTitle);
    });

    cy.then(() => {
      cy.intercept('POST', '**/api/v2/recruitment/vacancies').as('createVacancy');
      VacanciesPage.visitAddForm();
      VacanciesPage.fillVacancyForm({
        vacancyName: testVacancyName,
        jobTitle: testJobTitle,
        description: 'Test vacancy for candidate automation',
        hiringManager: Cypress.env('hiringManagerSearch'),
        numOfPositions: '2',
      });
      VacanciesPage.submitForm();
      cy.wait('@createVacancy', {timeout: 30000});
      VacanciesPage.assertSuccessToast();
    });
  });

  beforeEach(function () {
    loginAsAdmin();
    cy.intercept('GET', '**/api/v2/recruitment/candidates?*').as(
      'getCandidates',
    );
    cy.intercept('POST', '**/api/v2/recruitment/candidates').as(
      'createCandidate',
    );
  });

  after(function () {
    cy.task('logResults', 'Candidates module tests completed');
  });

  describe('Add New Candidate', () => {
    candidateTestData
      .filter((row) => row.scenario === 'add_valid')
      .forEach((row) => {
        it(`should add candidate: ${row.testCase}`, function () {
          const suffix = uniqueSuffix();
          const candidate = {
            firstName: row.firstName,
            middleName: row.middleName || '',
            lastName: `${row.lastName}${suffix}`,
            email: row.email.replace('@', `${suffix}@`),
            contactNumber: row.contactNumber,
            vacancy: testVacancyName,
          };

          CandidatesPage.visitAddForm();
          CandidatesPage.fillCandidateForm(candidate);
          CandidatesPage.submitForm();
          cy.wait('@createCandidate');
          CandidatesPage.assertSuccessToast();

          CandidatesPage.visit();
          cy.wait('@getCandidates');
          CandidatesPage.searchByVacancy(testVacancyName);
          cy.wait('@getCandidates');
          CandidatesPage.assertCandidateInList(
            candidate.firstName,
            candidate.lastName,
          );
        });
      });
  });

  describe('Mandatory Field Validation', () => {
    it('should show validation errors when mandatory fields are empty', function () {
      CandidatesPage.visitAddForm();
      CandidatesPage.submitForm();
      CandidatesPage.assertFirstNameRequired();
      CandidatesPage.assertLastNameRequired();
      CandidatesPage.assertFieldRequired('Email');
    });
  });

  describe('Search Candidates', () => {
    before(function () {
      loginAsAdmin();
      cy.intercept('POST', '**/api/v2/recruitment/candidates').as(
        'createCandidate',
      );
      const suffix = uniqueSuffix();
      CandidatesPage.visitAddForm();
      CandidatesPage.fillCandidateForm({
        ...testCandidate,
        lastName: `SearchTest${suffix}`,
        email: `search.test${suffix}@test.com`,
        vacancy: testVacancyName,
      });
      CandidatesPage.submitForm();
      CandidatesPage.assertSuccessToast();
      cy.wait('@createCandidate', {timeout: 15000});
      testCandidate.lastName = `SearchTest${suffix}`;
    });

    it('should search candidates by Job Title', function () {
      CandidatesPage.visit();
      cy.wait('@getCandidates');
      CandidatesPage.searchByJobTitle(testJobTitle);
      cy.wait('@getCandidates');
      CandidatesPage.assertCandidateInList(
        testCandidate.firstName,
        testCandidate.lastName,
      );
    });

    it('should search candidates by Hiring Manager', function () {
      CandidatesPage.visit();
      cy.wait('@getCandidates');
      CandidatesPage.searchByHiringManager(
        Cypress.env('hiringManagerLabel') || 'manda',
      );
      cy.wait('@getCandidates');
      CandidatesPage.assertCandidateInList(
        testCandidate.firstName,
        testCandidate.lastName,
      );
    });

    it('should search candidates by Date of Application', function () {
      const today = new Date();
      const year = today.getFullYear();
      const day = String(today.getDate()).padStart(2, '0');
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const appDate = `${year}-${day}-${month}`;

      CandidatesPage.visit();
      cy.wait('@getCandidates');
      CandidatesPage.searchByVacancy(testVacancyName);
      cy.wait('@getCandidates');
      CandidatesPage.searchByDateOfApplication(appDate, appDate);
      cy.wait('@getCandidates', {timeout: 15000});
      CandidatesPage.assertCandidateInList(
        testCandidate.firstName,
        testCandidate.lastName,
      );
    });
  });
});
