module.exports = {
  root: true,
  env: {
    browser: true,
    node: true
  },
  parserOptions: {
    parser: 'babel-eslint'
  },
  extends: [
    '@nuxtjs'
  ],
  // custom rules
  rules: {
    "no-console": "off",
    "prefer-promise-reject-errors": "off",
    "semi": [2, "always"],
    "quotes": [2, "double"]
  }
}
