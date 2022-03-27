"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createEslintRule = void 0;
const experimental_utils_1 = require("@typescript-eslint/experimental-utils");
exports.createEslintRule = experimental_utils_1.ESLintUtils.RuleCreator((ruleName) => ruleName);
