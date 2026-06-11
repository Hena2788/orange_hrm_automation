class LoginPage {
  elements = {
    usernameInput: () => cy.getOXDInput('Username'),
    passwordInput: () => cy.getOXDInput('Password'),
    loginButton: () => cy.getOXD('button').contains('Login'),
    errorAlert: () => cy.get('.oxd-alert-content-text'),
    loginForm: () => cy.getOXD('form'),
    pageTitle: () => cy.get('.orangehrm-login-title'),
  };

  visit() {
    cy.visit('/auth/login');
    return this;
  }

  enterUsername(username) {
    if (username) {
      this.elements.usernameInput().clear().type(username);
    }
    return this;
  }

  enterPassword(password) {
    if (password) {
      this.elements.passwordInput().clear().type(password);
    }
    return this;
  }

  clickLogin() {
    this.elements.loginButton().click();
    return this;
  }

  login(username, password) {
    this.enterUsername(username);
    this.enterPassword(password);
    this.clickLogin();
    return this;
  }

  assertOnLoginPage() {
    cy.url().should('include', '/auth/login');
    this.elements.pageTitle().should('be.visible');
    return this;
  }

  assertErrorMessage(message) {
    this.elements.errorAlert().should('be.visible').and('contain', message);
    return this;
  }

  assertFieldValidation(label, message) {
    cy.getOXDInput(label).isInvalid(message);
    return this;
  }

  assertDashboardRedirect() {
    cy.url().should('include', '/dashboard/index');
    return this;
  }
}

export default new LoginPage();
