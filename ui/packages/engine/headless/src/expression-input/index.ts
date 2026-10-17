/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 导出 . 模块的公共接口。

export { expressionInputAnatomy } from './expression-input.anatomy'
export { connectExpressionInput } from './expression-input.connect'
export { expressionInputKeyboard } from './expression-input.keyboard'
export { EXPRESSION_INPUT_CHECK_DELAY, expressionInputMachine } from './expression-input.machine'
export { expressionInputMeta } from './expression-input.meta'
export { EXPRESSION_INPUT_STRUCTURE_TAKEOVER, expressionInputStructure } from './expression-input.structure'
export type { ExpressionInputStructureOptions } from './expression-input.structure'
export { applyExpressionCompletion, collectExpressionCompletions, expressionLineColumn, expressionSegments, expressionSignature, expressionWordAt } from './expression-input.text'
export type { ExpressionCompletionInput } from './expression-input.text'
export type {
  ExpressionInputApi,
  ExpressionInputAutoSize,
  ExpressionInputCompletionSelectDetails,
  ExpressionInputEl,
  ExpressionInputHost,
  ExpressionInputInputProps,
  ExpressionInputIssueProps,
  ExpressionInputIssuesChangeDetails,
  ExpressionInputIssueView,
  ExpressionInputItem,
  ExpressionInputItemProps,
  ExpressionInputMarkProps,
  ExpressionInputOpenChangeDetails,
  ExpressionInputSchema,
  ExpressionInputSegment,
  ExpressionInputTranslations,
  ExpressionInputValueChangeDetails,
  ExpressionInputWord,
} from './expression-input.types'
