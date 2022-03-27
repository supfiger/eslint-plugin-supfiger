# `typescript-no-any-extended`

For the base info
goto [official doc of the rule](https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/eslint-plugin/docs/rules/no-explicit-any.md).

## Options

The rule accepts an options object with the following properties:

```ts
interface Options {
  // if true, auto-fixing will be made available in which the "any" type is converted to an "unknown" type
  fixToUnknown?: boolean;
  // specify if arrays from the rest operator are considered okay
  ignoreRestArgs?: boolean;
  // options for param of catch clause
  catchOptions?: {
    // allow any for the param
    allow?: boolean;
    // autofix to any if type is not specified
    fixToAny?: boolean;
  };
};

// defaults
const options: Options = {
  fixToUnknown: false,
  ignoreRestArgs: false,
  catchOptions: {
    allow: false,
    fixToAny: false
  } 
}
```
