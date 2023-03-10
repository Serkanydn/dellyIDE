module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: "eslint:recommended",
  overrides: [],
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  
  rules: {
    "no-new-object": 1,
    "object-shorthand": 1,
    "quote-props": 0,
    "no-prototype-builtins": 1,
    "prefer-object-spread": 1,
    "no-array-constructor": 1,
    "array-callback-return": 1,
    "prefer-destructuring": 1,
    quotes: 0,
    "template-curly-spacing": 1,
    "prefer-template": 1,
    "no-eval": 1,
    "no-useless-escape": 1,
    "func-style": 0,
    "wrap-iife": 1,
    "no-loop-func": 1,
    "prefer-rest-params": 1,
    "default-param-last": 1,
    "no-new-func": 1,
    "space-before-function-paren": 0,
    "space-before-blocks": 1,
    "no-param-reassign": 1,
    "prefer-spread": 1,
    "function-paren-newline": 1,
    "prefer-arrow-callback": 1,
    "arrow-spacing": 1,
    "arrow-parens": 1,
    "arrow-body-style": 1,
    "no-confusing-arrow": 1,
    "implicit-arrow-linebreak": 1,
    "no-useless-constructor": 1,
    "no-dupe-class-members": 1,
    "class-methods-use-this": 0,
    "no-duplicate-imports": 1,
    "object-curly-newline": 1,
    "no-iterator": 1,
    "no-restricted-syntax": 1,
    "generator-star-spacing": 1,
    "dot-notation": 1,
    "no-restricted-properties": 1,
    "no-undef": 0,
    "prefer-const": 1,
    "one-var": 0,
    "no-multi-assign": 1,
    "no-plusplus": 1,
    "operator-linebreak": 1,
    "no-unused-vars": 1,
    eqeqeq: 1,
    "no-case-declarations": 1,
    "no-nested-ternary": 1,
    "no-unneeded-ternary": 1,
    "no-mixed-operators": 1,
    "nonblock-statement-body-position": 1,
    "brace-style": 1,
    "no-else-return": 1,
    "spaced-comment": 1,
    indent: 0,
    "keyword-spacing": 1,
    "space-infix-ops": 1,
    "eol-last": 1,
    "newline-per-chained-call": 1,
    "no-whitespace-before-property": 1,
    "padded-blocks": 0,
    "no-multiple-empty-lines": 1,
    "space-in-parens": 1,
    "array-bracket-spacing": 1,
    "object-curly-spacing": 0,
    "max-len": 0,
    "block-spacing": 1,
    "comma-spacing": 1,
    "computed-property-spacing": 1,
    "func-call-spacing": 1,
    "key-spacing": 1,
    "no-trailing-spaces": 1,
    "comma-style": 1,
    "comma-dangle": 0,
    "no-new-wrappers": 1,
    "id-length": 1,
    camelcase: 1,
    "new-cap": 0,
    "no-underscore-dangle": 0,
    "no-restricted-globals": 1,
  },
};
