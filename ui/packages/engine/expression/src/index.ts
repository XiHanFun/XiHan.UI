/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// @xihan-ui/expression —— 受限表达式语言：解析成可序列化的语法树、静态检查、确定性求值。

export type { ArrayNode, BinaryNode, BinaryOperator, CallNode, ConditionalNode, ExpressionNode, IdentifierNode, IndexNode, LiteralNode, LogicalNode, LogicalOperator, MemberNode, NodeRange, NumberNode, UnaryNode, UnaryOperator } from './ast'
export { check, compile } from './check'
export type { CheckOptions, CompileResult } from './check'
export { ExprDate } from './date'
export type { DateParts, DateUnit } from './date'
export { ExprNumber } from './decimal'
export { createExpressionEngine } from './engine'
export type { CompiledExpression, EngineCompileOptions, EngineCompileResult, EngineEvaluation, ExpressionEngine, ExpressionEngineOptions } from './engine'
export { evaluate } from './evaluate'
export type { EvaluateOptions, EvaluateResult, EvaluateScope } from './evaluate'
export { conditionOf, evaluateSource } from './evaluate-source'
export type { ConditionResult } from './evaluate-source'
export { FORMAT_DECIMALS_LIMIT, FORMAT_KINDS, FORMAT_ROUNDINGS, formatValue, NUMERAL_STYLES } from './format'
export type { DateFormatSpec, FormatOptions, FormatRounding, FormatSpec, NumberFormatSpec, NumeralFormatSpec, NumeralStyle, PercentFormatSpec, RmbUpperFormatSpec, ValueFormatter } from './format'
export { checkFormatSpec } from './format-check'
export type { CheckFormatSpecOptions, FormatSpecIssue, FormatSpecIssueCode } from './format-check'
export type { FunctionSignature } from './functions/entry'
export { createFunctionTable, DEFAULT_FUNCTION_TABLE, FunctionTable } from './functions/table'
export type { FunctionContext, FunctionDefinition, FunctionFailure, FunctionTableOptions } from './functions/table'
export type { ExpressionIssue, ExpressionIssueCode, ExpressionIssueData } from './issues'
export { DEFAULT_LIMITS } from './limits'
export { parse } from './parser'
export type { ParseOptions, ParseResult } from './parser'
export { checkExpressions, evaluatePlan, planExpressions } from './plan'
export type { ExpressionEntry, ExpressionPlan, ExpressionPlanIssue, ExpressionPlanStep, PlanEvaluation, PlanOptions } from './plan'
export { isPlainName, print } from './print'
export { collectReferences } from './references'
export type { ExpressionReference } from './references'
export { renameReferences } from './rename'
export type { ReferenceRename, RenameReferencesResult } from './rename'
export { ExprList, ExprRecord, isExprValue, toExpressionValue, toPlain, typeOf } from './value'
export type { ExprValue, ExprValueType, PlainValue } from './value'
