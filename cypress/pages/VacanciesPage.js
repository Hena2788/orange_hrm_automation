class VacanciesPage {
  elements = {
    addButton: () => cy.getOXD('button').contains('Add'),
    saveButton: () => cy.getOXD('button').contains('Save'),
    searchButton: () => cy.getOXD('button').contains('Search'),
    resetButton: () => cy.getOXD('button').contains('Reset'),
    vacancyTable: () => cy.get('.orangehrm-vacancy-list'),
    tableRows: () => cy.get('.oxd-table-card'),
    pageTitle: () => cy.get('.orangehrm-main-title'),
  };

  visit() {
    cy.visit('/recruitment/viewJobVacancy');
    return this;
  }

  visitAddForm() {
    cy.visit('/recruitment/addJobVacancy');
    return this;
  }

  clickAdd() {
    this.elements.addButton().click();
    return this;
  }

  fillVacancyName(name) {
    cy.getOXDInput('Vacancy Name').clear().type(name);
    return this;
  }

  selectJobTitle(jobTitle) {
    cy.getOXDInput('Job Title').click();
    cy.get('.oxd-select-dropdown', {timeout: 15000})
      .should('be.visible')
      .find('.oxd-select-option')
      .then(($options) => {
        const match = [...$options].find((el) =>
          el.innerText.toLowerCase().includes(jobTitle.toLowerCase()),
        );
        cy.wrap(match || $options.first()).click();
      });
    return this;
  }

  fillDescription(description) {
    if (description) {
      cy.getOXDInput('Description').clear().type(description);
    }
    return this;
  }

  selectHiringManager(managerName) {
    cy.intercept('GET', '**/api/v2/pim/employees?*').as('searchEmployees');
    cy.getOXDInput('Hiring Manager').clear().type(managerName, {delay: 150});
    cy.wait('@searchEmployees', {timeout: 15000});
    cy.get('.oxd-autocomplete-dropdown', {timeout: 15000})
      .should('be.visible')
      .find('.oxd-autocomplete-option')
      .first()
      .then(($option) => {
        Cypress.env('hiringManagerLabel', $option.text().trim());
        cy.wrap($option).click();
      });
    return this;
  }

  fillNumberOfPositions(numPositions) {
    if (numPositions !== undefined && numPositions !== '') {
      cy.getOXDInput('Number of Positions').clear().type(String(numPositions));
    }
    return this;
  }

  fillVacancyForm({vacancyName, jobTitle, description, hiringManager, numOfPositions}) {
    if (vacancyName) this.fillVacancyName(vacancyName);
    if (jobTitle) this.selectJobTitle(jobTitle);
    if (description) this.fillDescription(description);
    if (hiringManager) this.selectHiringManager(hiringManager);
    if (numOfPositions) this.fillNumberOfPositions(numOfPositions);
    return this;
  }

  submitForm() {
    this.elements.saveButton().click();
    return this;
  }

  assertFieldRequired(label) {
    cy.getOXDInput(label).isInvalid('Required');
    return this;
  }

  assertSuccessToast() {
    cy.get('.orangehrm-main-title', {timeout: 15000}).should(
      'contain',
      'Edit Vacancy',
    );
    return this;
  }

  assertVacancyInList(vacancyName) {
    this.elements.tableRows().should('contain', vacancyName);
    return this;
  }

  searchByJobTitle(jobTitle) {
    cy.getOXDInput('Job Title').click();
    cy.get('.oxd-select-dropdown', {timeout: 15000})
      .should('be.visible')
      .find('.oxd-select-option')
      .then(($options) => {
        const match = [...$options].find((el) =>
          el.innerText.toLowerCase().includes(jobTitle.toLowerCase()),
        );
        cy.wrap(match || $options.first()).click();
      });
    this.elements.searchButton().click();
    return this;
  }

  searchByHiringManager(managerName) {
    cy.getOXDInput('Hiring Manager').click();
    cy.get('.oxd-select-dropdown', {timeout: 15000})
      .should('be.visible')
      .find('.oxd-select-option')
      .then(($options) => {
        const match = [...$options].find((el) =>
          el.innerText.toLowerCase().includes(managerName.toLowerCase()),
        );
        if (match) {
          cy.wrap(match).click();
        } else {
          cy.wrap($options.first()).click();
        }
      });
    this.elements.searchButton().click();
    return this;
  }

  searchByVacancyName(vacancyName) {
    cy.getOXDInput('Vacancy').click();
    cy.get('.oxd-select-dropdown').contains(vacancyName).click();
    this.elements.searchButton().click();
    return this;
  }

  clickSearch() {
    this.elements.searchButton().click();
    return this;
  }
}

export default new VacanciesPage();
