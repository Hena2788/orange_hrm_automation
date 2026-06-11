import LoginPage from '../../pages/LoginPage';

const loginTestData = Cypress.env('loginData') || [];

describe('Login Module', () => {
  before(function () {
    cy.intercept('POST', '**/auth/validate').as('postLogin');
  });

  beforeEach(function () {
    LoginPage.visit();
  });

  after(function () {
    cy.task('logResults', 'Login module tests completed');
  });

  describe('Valid Login', () => {
    it('should login successfully with correct credentials and redirect to dashboard', function () {
      const validData = loginTestData.find(
        (row) => row.expectedResult === 'success',
      );

      LoginPage.login(validData.username, validData.password);
      cy.wait('@postLogin');
      LoginPage.assertDashboardRedirect();
    });
  });

  describe('Invalid Login - Data Driven', () => {
    loginTestData
      .filter((row) => row.expectedResult === 'invalid_credentials')
      .forEach((row) => {
        it(`should show error for invalid login: ${row.testCase}`, function () {
          LoginPage.login(row.username, row.password);
          LoginPage.assertErrorMessage(
            row.expectedMessage || Cypress.env('invalidLoginMessage'),
          );
          LoginPage.assertOnLoginPage();
        });
      });
  });

  describe('Field Validation - Data Driven', () => {
    loginTestData
      .filter((row) => row.expectedResult === 'field_validation')
      .forEach((row) => {
        it(`should validate fields: ${row.testCase}`, function () {
          if (row.username) {
            LoginPage.enterUsername(row.username);
          }
          if (row.password) {
            LoginPage.enterPassword(row.password);
          }
          LoginPage.clickLogin();

          if (!row.username) {
            LoginPage.assertFieldValidation('Username', 'Required');
          }
          if (!row.password) {
            LoginPage.assertFieldValidation('Password', 'Required');
          }
          LoginPage.assertOnLoginPage();
        });
      });
  });
});
