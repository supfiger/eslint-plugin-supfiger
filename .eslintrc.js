const STATUS = {
  off: 0,
  warn: 1,
  error: 2,
}

const TAB_WIDTH = 2

module.exports = {
  'env': {
    es2021: true,
    node: true,
  },
  'extends': [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  'parser': '@typescript-eslint/parser',
  'parserOptions': {
    'ecmaVersion': 'latest',
    'sourceType': 'module',
  },
  plugins: [
    'supfiger-eslint',
  ],
  ignorePatterns: ['node_modules', 'dist', '.idea'],
  rules: {
    '@typescript-eslint/no-explicit-any': STATUS.off,
    indent: STATUS.off, // important: do not remove/change this rule! // use next one rule
    '@typescript-eslint/indent': [STATUS.error, TAB_WIDTH, { VariableDeclarator: 'first' }],
    semi: [STATUS.error, 'never', { beforeStatementContinuationChars: 'always' }],
    quotes: [STATUS.error, 'single', { avoidEscape: true, allowTemplateLiterals: true }],
  },
}


