/**
 * @fileoverview Disallow usage of the `any` type
 * @author
 */

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

/**
 * @type {import('eslint').Rule.RuleModule}
 */

import { createEslintRule } from '../utils'
import { AST_NODE_TYPES, TSESLint, TSESTree } from '@typescript-eslint/experimental-utils'

type MessageIds = 'unexpectedAny' | 'suggestUnknown' | 'suggestNever' | 'implicitAnyInCatchParam'

export type Options = [
  {
    fixToUnknown?: boolean;
    ignoreRestArgs?: boolean;
    catchOptions?: {
      allow?: boolean
      fixToAny?: boolean
    };
  },
];

export default createEslintRule<Options, MessageIds>({
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
      suggestUnknown:
        'Use `unknown` instead, this will force you to explicitly, and safely assert the type is correct.',
      suggestNever:
        'Use `never` instead, this is useful when instantiating generic type parameters that you don\'t need to know the type of.',
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
      // rest args
      if (ignoreRestArgs && isNodeDescendantOfRestElementInFunction(node)) {
        return
      }

      // catch clause params
      const catchCloseNode = searchNode(node, AST_NODE_TYPES.CatchClause) as TSESTree.CatchClause
      const isNodeInCatchParam = catchCloseNode && catchCloseNode?.param?.typeAnnotation?.typeAnnotation?.type === AST_NODE_TYPES.TSAnyKeyword

      if (catchOptions?.allow && isNodeInCatchParam) {
        return
      }

      let fix: TSESLint.ReportFixFunction | null = null
      const suggest: TSESLint.ReportSuggestionArray<MessageIds> = [
        {
          messageId: 'suggestUnknown',
          fix(fixer: TSESLint.RuleFixer): TSESLint.RuleFix {
            return fixer.replaceText(node, 'unknown')
          },
        },
        {
          messageId: 'suggestNever',
          fix(fixer: TSESLint.RuleFixer): TSESLint.RuleFix {
            return fixer.replaceText(node, 'never')
          },
        },
      ]

      if (fixToUnknown) {
        fix = (fixer): TSESLint.RuleFix =>
          fixer.replaceText(node, 'unknown')
      }

      context.report({
        node,
        messageId: 'unexpectedAny',
        fix,
        suggest,
      })
    },
    CatchClause(node) {
      if (!node.param) {
        return
      }

      if (catchOptions?.fixToAny && !node.param.typeAnnotation) {
        context.report({
          node,
          fix: (fixer): TSESLint.RuleFix => fixer.insertTextAfter(node.param!, ': any'),
          messageId: 'implicitAnyInCatchParam',
        })
      }
    },
  }),
})

/**
 * Checks if the node is an arrow function, function/constructor declaration or function expression
 * @param node the node to be validated.
 * @returns true if the node is any kind of function declaration or expression
 * @private
 */
function isNodeValidFunction(node: TSESTree.Node): boolean {
  return [
    AST_NODE_TYPES.ArrowFunctionExpression, // const x = (...args: any[]) => {};
    AST_NODE_TYPES.FunctionDeclaration, // function f(...args: any[]) {}
    AST_NODE_TYPES.FunctionExpression, // const x = function(...args: any[]) {};
    AST_NODE_TYPES.TSEmptyBodyFunctionExpression, // declare class A { f(...args: any[]): unknown; }
    AST_NODE_TYPES.TSFunctionType, // type T = (...args: any[]) => unknown;
    AST_NODE_TYPES.TSConstructorType, // type T = new (...args: any[]) => unknown
    AST_NODE_TYPES.TSCallSignatureDeclaration, // type T = {(...args: any[]): unknown};
    AST_NODE_TYPES.TSConstructSignatureDeclaration, // type T = {new (...args: any[]): unknown};
    AST_NODE_TYPES.TSMethodSignature, // type T = {f(...args: any[]): unknown};
    AST_NODE_TYPES.TSDeclareFunction, // declare function _8(...args: any[]): unknown;
  ].includes(node.type)
}

/**
 * Checks if the node is a rest element child node of a function
 * @param node the node to be validated.
 * @returns true if the node is a rest element child node of a function
 * @private
 */
function isNodeRestElementInFunction(node: TSESTree.Node): boolean {
  return (
    node.type === AST_NODE_TYPES.RestElement &&
    typeof node.parent !== 'undefined' &&
    isNodeValidFunction(node.parent)
  )
}

/**
 * Checks if the node is a TSTypeOperator node with a readonly operator
 * @param node the node to be validated.
 * @returns true if the node is a TSTypeOperator node with a readonly operator
 * @private
 */
function isNodeReadonlyTSTypeOperator(node: TSESTree.Node): boolean {
  return (
    node.type === AST_NODE_TYPES.TSTypeOperator &&
    node.operator === 'readonly'
  )
}

/**
 * Checks if the node is a TSTypeReference node with an Array identifier
 * @param node the node to be validated.
 * @returns true if the node is a TSTypeReference node with an Array identifier
 * @private
 */
function isNodeValidArrayTSTypeReference(node: TSESTree.Node): boolean {
  return (
    node.type === AST_NODE_TYPES.TSTypeReference &&
    typeof node.typeName !== 'undefined' &&
    node.typeName.type === AST_NODE_TYPES.Identifier &&
    ['Array', 'ReadonlyArray'].includes(node.typeName.name)
  )
}

/**
 * Checks if the node is a valid TSTypeOperator or TSTypeReference node
 * @param node the node to be validated.
 * @returns true if the node is a valid TSTypeOperator or TSTypeReference node
 * @private
 */
function isNodeValidTSType(node: TSESTree.Node): boolean {
  return (
    isNodeReadonlyTSTypeOperator(node) ||
    isNodeValidArrayTSTypeReference(node)
  )
}

/**
 * Checks if the great grand-parent node is a RestElement node in a function
 * @param node the node to be validated.
 * @returns true if the great grand-parent node is a RestElement node in a function
 * @private
 */
function isGreatGrandparentRestElement(node: TSESTree.Node): boolean {
  return (
    node?.parent?.parent?.parent != null &&
    isNodeRestElementInFunction(node.parent.parent.parent)
  )
}

/**
 * Checks if the great great grand-parent node is a valid RestElement node in a function
 * @param node the node to be validated.
 * @returns true if the great great grand-parent node is a valid RestElement node in a function
 * @private
 */
function isGreatGreatGrandparentRestElement(node: TSESTree.Node): boolean {
  return (
    node.parent?.parent?.parent?.parent != null &&
    isNodeValidTSType(node.parent.parent) &&
    isNodeRestElementInFunction(node.parent.parent.parent.parent)
  )
}

/**
 * Checks if the great grand-parent or the great great grand-parent node is a RestElement node
 * @param node the node to be validated.
 * @returns true if the great grand-parent or the great great grand-parent node is a RestElement node
 * @private
 */
function isNodeDescendantOfRestElementInFunction(
  node: TSESTree.Node,
): boolean {
  return (
    isGreatGrandparentRestElement(node) ||
    isGreatGreatGrandparentRestElement(node)
  )
}

function searchNode(node: TSESTree.TSAnyKeyword, type: AST_NODE_TYPES) {
  const isSearched = (node: any) => node?.type === type

  const search = (currentNode: any): any => {
    if (!currentNode) return

    return isSearched(currentNode) ? currentNode : search(currentNode?.parent)
  }

  return search(node)
}
