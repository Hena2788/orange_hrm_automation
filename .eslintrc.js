module.exports = {
  root: true,
  env: {
    node: true,
    es2022: true,
  },
  plugins: ['cypress'],
  extends: ['eslint:recommended', 'plugin:cypress/recommended'],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  overrides: [
    {
      files: ['cypress/**/*.js'],
      env: {
        'cypress/globals': true,
      },
    },
  ],
  rules: {
    'no-console': 'off',
    'cypress/no-unnecessary-waiting': 'warn',
    'cypress/unsafe-to-chain-command': 'off',
  },
};
