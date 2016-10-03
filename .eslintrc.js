module.exports = {
    "env": {
        "browser": true,
        "node": true,
        "commonjs": true,
        "es6": true,
        "mocha": true //all of mocha's globals are allowed - keep until eslint allows glob pattern rule-sets
    },
    "extends": [
        "eslint:recommended",
        "angular"
    ],
    "globals": {
        "jQuery": 1,
        "$": 1
    },
    "parserOptions": {
        "sourceType": "module"
    },
    "rules": {
        "accessor-pairs": "error",
        "angular/no-private-call": "warn",
        "angular/no-service-method": "off",
        "array-bracket-spacing": [
            "error",
            "never"
        ],
        "array-callback-return": "error",
        "arrow-body-style": "error",
        "arrow-parens": "error",
        "arrow-spacing": "error",
        "block-scoped-var": "error",
        "block-spacing": "error",
        "brace-style": [
            "error",
            "1tbs"
        ],
        "callback-return": "error",
        "camelcase": "off",
        "comma-spacing": [
            "warn",
            {
                "after": true,
                "before": false
            }
        ],
        "comma-style": [
            "error",
            "last"
        ],
        "complexity": "error",
        "computed-property-spacing": [
            "error",
            "never"
        ],
        "consistent-return": "off",
        "consistent-this": "off",
        "console": "off",
        "curly": "error",
        "default-case": "error",
        "dot-location": [
            "error",
            "property"
        ],
        "dot-notation": [
            "warn",
            {
                "allowKeywords": true
            }
        ],
        "eol-last": "off",
        "eqeqeq": "error",
        "func-names": "off",
        "func-style": [
            "error",
            "declaration"
        ],
        "generator-star-spacing": "error",
        "global-require": "error",
        "guard-for-in": "error",
        "handle-callback-err": "error",
        "id-blacklist": "error",
        "id-length": "off",
        "id-match": "error",
        "indent": "off",
        "init-declarations": "off",
        "jsx-quotes": "error",
        "key-spacing": "warn",
        "keyword-spacing": "off",
        "lines-around-comment": "error",
        "max-depth": "error",
        "max-len": "off",
        "max-nested-callbacks": "error",
        "max-params": "off",
        "max-statements": "off",
        "new-parens": "error",
        "newline-after-var": "off",
        "newline-before-return": "off",
        "newline-per-chained-call": "error",
        "no-alert": "error",
        "no-array-constructor": "error",
        "no-arrow-condition": "off",
        "no-bitwise": "error",
        "no-caller": "error",
        "no-catch-shadow": "error",
        "no-confusing-arrow": ["error", {"allowParens": true}],
        "no-continue": "error",
        "no-div-regex": "error",
        "no-else-return": "off",
        "no-empty-function": "error",
        "no-eq-null": "error",
        "no-eval": "error",
        "no-extend-native": "error",
        "no-extra-bind": "error",
        "no-extra-label": "error",
        "no-extra-parens": "off",
        "no-floating-decimal": "error",
        "no-implicit-coercion": "warn",
        "no-implicit-globals": "error",
        "no-implied-eval": "error",
        "no-inline-comments": "off",
        "no-inner-declarations": [
            "error",
            "functions"
        ],
        "no-invalid-this": "off",
        "no-iterator": "error",
        "no-label-var": "error",
        "no-labels": "error",
        "no-lone-blocks": "error",
        "no-lonely-if": "off",
        "no-loop-func": "error",
        "no-magic-numbers": "off",
        "no-mixed-requires": "error",
        "no-multi-spaces": "error",
        "no-multi-str": "error",
        "no-multiple-empty-lines": "error",
        "no-native-reassign": "error",
        "no-negated-condition": "off",
        "no-nested-ternary": "off",
        "no-new": "error",
        "no-new-func": "error",
        "no-new-object": "error",
        "no-new-require": "error",
        "no-new-wrappers": "error",
        "no-octal-escape": "error",
        "no-param-reassign": [
            "error",
            {
                "props": false
            }
        ],
        "no-path-concat": "error",
        "no-plusplus": ["error", {
            "allowForLoopAfterthoughts": true
        }],
        "no-process-env": "error",
        "no-process-exit": "error",
        "no-proto": "error",
        "no-restricted-globals": "error",
        "no-restricted-imports": "error",
        "no-restricted-modules": "error",
        "no-restricted-syntax": "error",
        "no-return-assign": "error",
        "no-script-url": "error",
        "no-self-compare": "error",
        "no-sequences": "error",
        "no-shadow": "error",
        "no-shadow-restricted-names": "error",
        "no-spaced-func": "off",
        "no-sync": "error",
        "no-ternary": "off",
        "no-throw-literal": "off",
        "no-trailing-spaces": "off",
        "no-undef-init": "error",
        "no-undefined": "error",
        "no-underscore-dangle": "off",
        "no-unmodified-loop-condition": "error",
        "no-unneeded-ternary": "error",
        "no-unused-expressions": "off",
        "no-unused-vars": "warn",
        "no-use-before-define": "off",
        "no-useless-call": "error",
        "no-useless-concat": "error",
        "no-useless-constructor": "error",
        "no-var": "off",
        "no-void": "error",
        "no-warning-comments": "warn",
        "no-whitespace-before-property": "error",
        "no-with": "error",
        "object-curly-spacing": "off",
        "object-shorthand": "off",
        "one-var": "off",
        "one-var-declaration-per-line": [
            "error",
            "initializations"
        ],
        "operator-assignment": "error",
        "operator-linebreak": [
            "error",
            "after"
        ],
        "padded-blocks": "off",
        "prefer-arrow-callback": "off",
        "prefer-const": "error",
        "prefer-reflect": "off",
        "prefer-rest-params": "off",
        "prefer-spread": "error",
        "prefer-template": "off",
        "quote-props": "off",
        "quotes": "off",
        "radix": "error",
        "require-jsdoc": "off",
        "require-yield": "error",
        "semi": "off",
        "semi-spacing": "error",
        "sort-imports": "warn",
        "sort-vars": "off",
        "space-before-blocks": "off",
        "space-before-function-paren": "off",
        "space-in-parens": [
            "error",
            "never"
        ],
        "space-infix-ops": "error",
        "space-unary-ops": "error",
        "spaced-comment": "off",
        "strict": "off",
        "template-curly-spacing": "error",
        "valid-jsdoc": "error",
        "vars-on-top": "off",
        "wrap-iife": "error",
        "wrap-regex": "error",
        "yield-star-spacing": "error",
        "yoda": [
            "error",
            "never"
        ]
    }
};