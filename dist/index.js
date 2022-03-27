"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const requireindex_1 = __importDefault(require("requireindex"));
const obj = (0, requireindex_1.default)(__dirname + '/rules');
const rules = {};
Object.keys(obj).forEach((ruleName) => {
    rules[ruleName] = obj[ruleName].default;
});
module.exports = { rules };
