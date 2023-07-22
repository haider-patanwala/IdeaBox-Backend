module.exports = {
  env: {
    browser: true,
    commonjs: true, // because of NodeJS
    es2021: true,
    mocha: true, // so that ESLint can understand that mocha is being used globally and it prevents the  unneccessary warnings of undefined methods.
  },
  extends: 'airbnb-base', // eslint extends base version because of a NodeJS app.
  overrides: [
    {
      env: {
        node: true,
      },
      files: [
        '.eslintrc.{js,cjs}',
      ],
      parserOptions: {
        sourceType: 'script',
      },
    },
  ],
  parserOptions: {
    ecmaVersion: 'latest',
  },
  rules: {
    quotes: ["off", "double"],
    "no-console": 0,
    "max-len": 0, // for comments length
    "no-underscore-dangle": "off", // for _id
  },
};
