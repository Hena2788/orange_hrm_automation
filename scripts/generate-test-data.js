/**
 * Generates Excel test data files for data-driven Cypress tests.
 * Run: node scripts/generate-test-data.js
 */
const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

const dataDir = path.resolve(__dirname, '../cypress/fixtures/data');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, {recursive: true});
}

const loginData = [
  {
    testCase: 'Valid Admin Login',
    username: 'Admin',
    password: 'admin123',
    expectedResult: 'success',
    expectedMessage: '',
    field: '',
  },
  {
    testCase: 'Invalid Username',
    username: 'InvalidUser',
    password: 'admin123',
    expectedResult: 'invalid_credentials',
    expectedMessage: 'Invalid credentials',
    field: '',
  },
  {
    testCase: 'Invalid Password',
    username: 'Admin',
    password: 'wrongpassword',
    expectedResult: 'invalid_credentials',
    expectedMessage: 'Invalid credentials',
    field: '',
  },
  {
    testCase: 'Empty Username and Password',
    username: '',
    password: '',
    expectedResult: 'field_validation',
    expectedMessage: 'Required',
    field: 'Username',
  },
  {
    testCase: 'Empty Username',
    username: '',
    password: 'admin123',
    expectedResult: 'field_validation',
    expectedMessage: 'Required',
    field: 'Username',
  },
  {
    testCase: 'Empty Password',
    username: 'Admin',
    password: '',
    expectedResult: 'field_validation',
    expectedMessage: 'Required',
    field: 'Password',
  },
  {
    testCase: 'Special Characters Username',
    username: '!@#$%^&*()',
    password: 'admin123',
    expectedResult: 'invalid_credentials',
    expectedMessage: 'Invalid credentials',
    field: '',
  },
  {
    testCase: 'Overly Long Username',
    username: 'A'.repeat(150),
    password: 'admin123',
    expectedResult: 'invalid_credentials',
    expectedMessage: 'Invalid credentials',
    field: '',
  },
];

const candidatesData = [
  {
    testCase: 'Valid Candidate with all fields',
    scenario: 'add_valid',
    firstName: 'Alice',
    middleName: 'M',
    lastName: 'Smith',
    email: 'alice.smith@test.com',
    contactNumber: '9876543210',
  },
  {
    testCase: 'Valid Candidate minimal fields',
    scenario: 'add_valid',
    firstName: 'Bob',
    middleName: '',
    lastName: 'Johnson',
    email: 'bob.johnson@test.com',
    contactNumber: '',
  },
];

const vacanciesData = [
  {
    testCase: 'Valid Vacancy with all fields',
    scenario: 'add_valid',
    vacancyName: 'Senior QA Engineer',
    description: 'Automated testing vacancy for E2E validation',
    hiringManager: 'manda',
    numOfPositions: '2',
  },
  {
    testCase: 'Valid Vacancy with single position',
    scenario: 'add_valid',
    vacancyName: 'Junior Developer',
    description: 'Entry level development position',
    hiringManager: 'manda',
    numOfPositions: '1',
  },
];

function writeExcel(filename, data) {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
  XLSX.writeFile(workbook, path.join(dataDir, filename));
  console.log(`Created: ${filename}`);
}

writeExcel('loginData.xlsx', loginData);
writeExcel('candidatesData.xlsx', candidatesData);
writeExcel('vacanciesData.xlsx', vacanciesData);

console.log('All Excel test data files generated successfully.');
