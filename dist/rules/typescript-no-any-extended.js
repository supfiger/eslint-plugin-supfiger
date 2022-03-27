"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
const experimental_utils_1 = require("@typescript-eslint/experimental-utils");
exports.default = (0, utils_1.createEslintRule)({
    name: 'typescript-no-any-extended',
    meta: {
        type: 'suggestion',
        docs: {
            description: 'Disallow usage of the `any` type',
            recommended: 'error',
            suggestion: true,
        },
        fixable: 'code',
        hasSuggestions: true,
        messages: {
            unexpectedAny: 'Unexpected any. Specify a different type.',
            implicitAnyInCatchParam: 'Implicit any in catch param.',
            suggestUnknown: 'Use `unknown` instead, this will force you to explicitly, and safely assert the type is correct.',
            suggestNever: 'Use `never` instead, this is useful when instantiating generic type parameters that you don\'t need to know the type of.',
        },
        schema: [
            {
                type: 'object',
                additionalProperties: false,
                properties: {
                    fixToUnknown: {
                        type: 'boolean',
                    },
                    ignoreRestArgs: {
                        type: 'boolean',
                    },
                    catchOptions: {
                        type: 'object',
                        properties: {
                            allow: 'boolean',
                            fixToAny: 'boolean',
                        },
                    },
                },
            },
        ],
    },
    defaultOptions: [
        {
            fixToUnknown: false,
            ignoreRestArgs: false,
            catchOptions: {
                allow: false,
                fixToAny: false,
            },
        },
    ],
    create: (context, [{ ignoreRestArgs, fixToUnknown, catchOptions }]) => ({
        TSAnyKeyword(node) {
            var _a, _b, _c;
            if (ignoreRestArgs && isNodeDescendantOfRestElementInFunction(node)) {
                return;
            }
            const catchCloseNode = searchNode(node, experimental_utils_1.AST_NODE_TYPES.CatchClause);
            const isNodeInCatchParam = catchCloseNode && ((_c = (_b = (_a = catchCloseNode === null || catchCloseNode === void 0 ? void 0 : catchCloseNode.param) === null || _a === void 0 ? void 0 : _a.typeAnnotation) === null || _b === void 0 ? void 0 : _b.typeAnnotation) === null || _c === void 0 ? void 0 : _c.type) === experimental_utils_1.AST_NODE_TYPES.TSAnyKeyword;
            if ((catchOptions === null || catchOptions === void 0 ? void 0 : catchOptions.allow) && isNodeInCatchParam) {
                return;
            }
            let fix = null;
            const suggest = [
                {
                    messageId: 'suggestUnknown',
                    fix(fixer) {
                        return fixer.replaceText(node, 'unknown');
                    },
                },
                {
                    messageId: 'suggestNever',
                    fix(fixer) {
                        return fixer.replaceText(node, 'never');
                    },
                },
            ];
            if (fixToUnknown) {
                fix = (fixer) => fixer.replaceText(node, 'unknown');
            }
            context.report({
                node,
                messageId: 'unexpectedAny',
                fix,
                suggest,
            });
        },
        CatchClause(node) {
            if (!node.param) {
                return;
            }
            if ((catchOptions === null || catchOptions === void 0 ? void 0 : catchOptions.fixToAny) && !node.param.typeAnnotation) {
                context.report({
                    node,
                    fix: (fixer) => fixer.insertTextAfter(node.param, ': any'),
                    messageId: 'implicitAnyInCatchParam',
                });
            }
        },
    }),
});
function isNodeValidFunction(node) {
    return [
        experimental_utils_1.AST_NODE_TYPES.ArrowFunctionExpression,
        experimental_utils_1.AST_NODE_TYPES.FunctionDeclaration,
        experimental_utils_1.AST_NODE_TYPES.FunctionExpression,
        experimental_utils_1.AST_NODE_TYPES.TSEmptyBodyFunctionExpression,
        experimental_utils_1.AST_NODE_TYPES.TSFunctionType,
        experimental_utils_1.AST_NODE_TYPES.TSConstructorType,
        experimental_utils_1.AST_NODE_TYPES.TSCallSignatureDeclaration,
        experimental_utils_1.AST_NODE_TYPES.TSConstructSignatureDeclaration,
        experimental_utils_1.AST_NODE_TYPES.TSMethodSignature,
        experimental_utils_1.AST_NODE_TYPES.TSDeclareFunction,
    ].includes(node.type);
}
function isNodeRestElementInFunction(node) {
    return (node.type === experimental_utils_1.AST_NODE_TYPES.RestElement &&
        typeof node.parent !== 'undefined' &&
        isNodeValidFunction(node.parent));
}
function isNodeReadonlyTSTypeOperator(node) {
    return (node.type === experimental_utils_1.AST_NODE_TYPES.TSTypeOperator &&
        node.operator === 'readonly');
}
function isNodeValidArrayTSTypeReference(node) {
    return (node.type === experimental_utils_1.AST_NODE_TYPES.TSTypeReference &&
        typeof node.typeName !== 'undefined' &&
        node.typeName.type === experimental_utils_1.AST_NODE_TYPES.Identifier &&
        ['Array', 'ReadonlyArray'].includes(node.typeName.name));
}
function isNodeValidTSType(node) {
    return (isNodeReadonlyTSTypeOperator(node) ||
        isNodeValidArrayTSTypeReference(node));
}
function isGreatGrandparentRestElement(node) {
    var _a, _b;
    return (((_b = (_a = node === null || node === void 0 ? void 0 : node.parent) === null || _a === void 0 ? void 0 : _a.parent) === null || _b === void 0 ? void 0 : _b.parent) != null &&
        isNodeRestElementInFunction(node.parent.parent.parent));
}
function isGreatGreatGrandparentRestElement(node) {
    var _a, _b, _c;
    return (((_c = (_b = (_a = node.parent) === null || _a === void 0 ? void 0 : _a.parent) === null || _b === void 0 ? void 0 : _b.parent) === null || _c === void 0 ? void 0 : _c.parent) != null &&
        isNodeValidTSType(node.parent.parent) &&
        isNodeRestElementInFunction(node.parent.parent.parent.parent));
}
function isNodeDescendantOfRestElementInFunction(node) {
    return (isGreatGrandparentRestElement(node) ||
        isGreatGreatGrandparentRestElement(node));
}
function searchNode(node, type) {
    const isSearched = (node) => (node === null || node === void 0 ? void 0 : node.type) === type;
    const search = (currentNode) => {
        if (!currentNode)
            return;
        return isSearched(currentNode) ? currentNode : search(currentNode === null || currentNode === void 0 ? void 0 : currentNode.parent);
    };
    return search(node);
}
