export function getAdminCredentials() {
  return {
    username: Cypress.env('adminUsername'),
    password: Cypress.env('adminPassword'),
  };
}

export function uniqueSuffix() {
  return Date.now().toString().slice(-6);
}

export function loginAsAdmin() {
  const {username, password} = getAdminCredentials();
  cy.session(
    [username, password],
    () => {
      cy.visit('/auth/login');
      cy.getOXD('form').within(() => {
        cy.getOXDInput('Username').type(username);
        cy.getOXDInput('Password').type(password);
        cy.getOXD('button').contains('Login').click();
      });
      cy.url().should('include', '/dashboard/index');
    },
    {cacheAcrossSpecs: true},
  );
}

export function ensureJobTitleExists(jobTitleName) {
  cy.intercept('POST', '**/api/v2/admin/job-titles').as('createJobTitle');
  cy.visit('/admin/saveJobTitle');
  cy.getOXD('form').within(() => {
    cy.getOXDInput('Job Title').type(jobTitleName);
    cy.getOXD('button').contains('Save').click();
  });
  cy.wait('@createJobTitle');
}

function authenticatedRequest(options) {
  return cy.getCookies().then((cookies) => {
    const cookieHeader = cookies.map((c) => `${c.name}=${c.value}`).join('; ');
    return cy
      .request({
        failOnStatusCode: false,
        ...options,
        headers: {
          ...options.headers,
          ...(cookieHeader ? {Cookie: cookieHeader} : {}),
        },
      })
      .then((response) => {
        if (response.status === 401) {
          throw new Error(
            `Unauthorized API call to ${options.url}. Run loginAsAdmin() first.`,
          );
        }
        return response;
      });
  });
}

export function resolveJobTitle() {
  return authenticatedRequest({
    method: 'GET',
    url: '/api/v2/admin/job-titles',
    qs: {limit: 50},
  }).then((response) => {
    const titles = response.body?.data || [];
    const active = titles.find((t) => t.title && !t.isDeleted) || titles[0];
    const jobTitle = active?.title;

    if (!jobTitle) {
      throw new Error('No job titles found on the target environment');
    }

    Cypress.env('jobTitle', jobTitle);
    return jobTitle;
  });
}

export function resolveHiringManagerSearchTerm() {
  return authenticatedRequest({
    method: 'GET',
    url: '/api/v2/pim/employees',
    qs: {
      nameOrId: 'a',
      includeEmployees: 'onlyCurrent',
      limit: 20,
    },
  }).then((response) => {
    const employees = response.body?.data || [];
    const employee = employees.find((e) => !e.terminationId) || employees[0];
    if (!employee) {
      return 'Admin';
    }
    const searchTerm = employee.firstName;
    Cypress.env('hiringManagerSearch', searchTerm);
    Cypress.env(
      'hiringManagerLabel',
      `${employee.firstName} ${employee.middleName || ''} ${employee.lastName}`
        .replace(/\s+/g, ' ')
        .trim(),
    );
    return searchTerm;
  });
}
