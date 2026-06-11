class CandidatesPage {
  elements = {
    addButton: () => cy.getOXD('button').contains('Add'),
    saveButton: () => cy.getOXD('button').contains('Save'),
    searchButton: () => cy.getOXD('button').contains('Search'),
    resetButton: () => cy.getOXD('button').contains('Reset'),
    candidateTable: () => cy.get('.oxd-table-body'),
    tableRows: () => cy.get('.oxd-table-card'),
    pageTitle: () => cy.get('.orangehrm-main-title'),
  };

  visit() {
    cy.visit('/recruitment/viewCandidates');
    return this;
  }

  clickAdd() {
    this.elements.addButton().click();
    cy.url().should('include', '/recruitment/addCandidate');
    return this;
  }

  visitAddForm() {
    cy.visit('/recruitment/addCandidate');
    return this;
  }

  fillFirstName(firstName) {
    cy.get('input.orangehrm-firstname').clear().type(firstName);
    return this;
  }

  fillMiddleName(middleName) {
    if (middleName) {
      cy.get('input.orangehrm-middlename').clear().type(middleName);
    }
    return this;
  }

  fillLastName(lastName) {
    cy.get('input.orangehrm-lastname').clear().type(lastName);
    return this;
  }

  fillEmail(email) {
    cy.getOXDInput('Email').clear().type(email);
    return this;
  }

  fillContactNumber(contactNumber) {
    if (contactNumber) {
      cy.getOXDInput('Contact Number').clear().type(contactNumber);
    }
    return this;
  }

  selectVacancy(vacancyName) {
    cy.getOXDInput('Vacancy').click();
    cy.get('.oxd-select-dropdown', {timeout: 15000})
      .should('be.visible')
      .contains(vacancyName)
      .click();
    return this;
  }

  fillDateOfApplication(date) {
    if (date) {
      cy.getOXDInput('Date of Application').clear().type(date);
    }
    return this;
  }

  fillCandidateForm({firstName, middleName, lastName, email, contactNumber, vacancy, dateOfApplication}) {
    this.fillFirstName(firstName);
    this.fillMiddleName(middleName);
    this.fillLastName(lastName);
    this.fillEmail(email);
    if (contactNumber) this.fillContactNumber(contactNumber);
    if (vacancy) this.selectVacancy(vacancy);
    if (dateOfApplication) this.fillDateOfApplication(dateOfApplication);
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

  assertFirstNameRequired() {
    cy.get('input.orangehrm-firstname')
      .closest('.oxd-input-group')
      .contains('Required');
    return this;
  }

  assertLastNameRequired() {
    cy.get('input.orangehrm-lastname')
      .closest('.oxd-input-group')
      .contains('Required');
    return this;
  }

  assertSuccessToast() {
    cy.url({timeout: 15000}).should('match', /addCandidate\/\d+/);
    return this;
  }

  assertCandidateInList(firstName, lastName) {
    this.elements.tableRows().should('contain', firstName);
    this.elements.tableRows().should('contain', lastName);
    return this;
  }

  searchByVacancy(vacancyName) {
    cy.getOXDInput('Vacancy').click();
    cy.get('.oxd-select-dropdown', {timeout: 15000})
      .should('be.visible')
      .contains(vacancyName)
      .click();
    this.elements.searchButton().click();
    return this;
  }

  searchByJobTitle(jobTitle) {
    cy.getOXDInput('Job Title').click();
    cy.get('.oxd-select-dropdown').contains(jobTitle).click();
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

  searchByDateOfApplication(fromDate, toDate) {
    cy.contains('.oxd-input-group', 'Date of Application')
      .find('input')
      .first()
      .clear()
      .type(fromDate);
    if (toDate) {
      cy.contains('.oxd-input-group', 'Date of Application')
        .find('input')
        .last()
        .clear()
        .type(toDate);
    }
    this.elements.searchButton().click();
    return this;
  }

  clickSearch() {
    this.elements.searchButton().click();
    return this;
  }
}

export default new CandidatesPage();
