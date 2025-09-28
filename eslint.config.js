// eslint.config.js
const js = require("@eslint/js");
const tseslint = require("typescript-eslint");

module.exports = [
  {
    ignores: ["dist", "node_modules"],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.ts", "**/*.tsx"], // 👈 aqui você define as extensões
    rules: {
      "no-unused-vars": "warn",
      "no-console": "off",
    },
  },
];
