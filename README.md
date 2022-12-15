# eslint-plugin-supfiger

Custom and extended rules for ESLint by @supfiger

## Installation

You'll first need to install [ESLint](https://eslint.org/):

```sh
yarn add -D eslint 
```

Next, install `eslint-plugin-supfiger`:

```sh
yarn add -D eslint-plugin-supfiger
```

## Usage

Add `supfiger` to the plugins section of your `.eslintrc` configuration file. You can omit the `eslint-plugin-` prefix:

```json
{
    "plugins": [
        "supfiger"
    ]
}
```

## Rules

-  Disallow usage of the ``any`` type (*extended version*) -
  [typescript-no-any-extended](./docs/rules/typescript-no-any-extended.md) (see [basic official version](https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/eslint-plugin/docs/rules/no-explicit-any.md) for comparing with this one)


