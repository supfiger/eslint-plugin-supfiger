'use strict'

const STATUS = {
  off: 0,
  warn: 1,
  error: 2,
}

const TAB_WIDTH = 2


module.exports = {
  root: true,
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:eslint-plugin/recommended',
  ],
  env: {
    node: true,
    es2021: true,
  },
  'parser': '@typescript-eslint/parser',
  'parserOptions': {
    'ecmaVersion': 'latest',
    'sourceType': 'module',
  },
  ignorePatterns: ['node_modules', 'lib', '.idea'],
  overrides: [
    {
      files: ['tests/**/*.js'],
      env: { mocha: true },
    },
  ],
  rules: {
    '@typescript-eslint/no-explicit-any': STATUS.off,
    indent: STATUS.off, // important: do not remove/change this rule! // use next one rule
    '@typescript-eslint/indent': [STATUS.error, TAB_WIDTH, { VariableDeclarator: 'first' }],
    semi: [STATUS.error, 'never', { beforeStatementContinuationChars: 'always' }],
    quotes: [STATUS.error, 'single', { avoidEscape: true, allowTemplateLiterals: true }],
  },
}
