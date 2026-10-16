/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

/**
 * 表达式问题码。解析、静态检查与求值三个阶段共用一张表：
 *
 * 解析
 * - `XH_EXPR_EMPTY`：源码只有空白。
 * - `XH_EXPR_TOO_LONG`：源码长度超过 `maxLength`。
 * - `XH_EXPR_TOO_DEEP`：语法树深度超过 `maxDepth`。
 * - `XH_EXPR_UNEXPECTED_CHARACTER`：词法上不认识的字符（含全角标点与单个 `=` `&` `|`）。
 * - `XH_EXPR_UNEXPECTED_TOKEN`：词法正确但出现在不该出现的位置。
 * - `XH_EXPR_UNEXPECTED_END`：表达式没写完。
 * - `XH_EXPR_UNTERMINATED_STRING`：字符串或反引号标识符没有闭合。
 * - `XH_EXPR_INVALID_ESCAPE`：字符串里的转义序列不合法。
 * - `XH_EXPR_INVALID_NUMBER`：数字字面量不合法。
 * - `XH_EXPR_INVALID_IDENTIFIER`：反引号标识符为空。
 * - `XH_EXPR_CHAINED_COMPARISON`：比较运算连写（`a < b < c`、`a == b == c`）。
 * - `XH_EXPR_INVALID_CALLEE`：调用目标不是函数名（如 `a.b()`、`(f)()`）。
 *
 * 静态检查与求值
 * - `XH_EXPR_UNKNOWN_IDENTIFIER`：标识符不在宿主声明的名单里。
 * - `XH_EXPR_UNKNOWN_FUNCTION`：函数不在函数表里。
 * - `XH_EXPR_ARGUMENT_COUNT`：实参个数不在函数允许的范围内。
 * - `XH_EXPR_FORBIDDEN_MEMBER`：访问 `__proto__`、`constructor`、`prototype`。
 * - `XH_EXPR_INVALID_AST`：语法树结构不合法。
 *
 * 求值
 * - `XH_EXPR_TYPE_MISMATCH`：运算数或实参的类型不符合规则。
 * - `XH_EXPR_INVALID_ARGUMENT`：实参类型正确但取值不合法（如 `SQRT(-1)`、未知的日期单位）。
 * - `XH_EXPR_INVALID_INDEX`：数组下标不是整数。
 * - `XH_EXPR_DIVISION_BY_ZERO`：除数或取余的除数为 0。
 * - `XH_EXPR_NUMBER_OVERFLOW`：数值绝对值达到 10^65。
 * - `XH_EXPR_DATE_OUT_OF_RANGE`：日期超出 0001-01-01 至 9999-12-31。
 * - `XH_EXPR_STRING_TOO_LONG`：字符串结果长度超过 `maxStringLength`。
 * - `XH_EXPR_STEP_LIMIT`：求值步数超过 `maxSteps`。
 * - `XH_EXPR_DEPTH_LIMIT`：求值嵌套深度超过 `maxDepth`。
 * - `XH_EXPR_UNSUPPORTED_VALUE`：宿主数据或函数返回值不是可表示的值。
 * - `XH_EXPR_NOW_UNAVAILABLE`：调用 `NOW()` / `TODAY()` 但宿主没有提供当前时间。
 * - `XH_EXPR_FUNCTION_FAILED`：宿主函数抛出异常。
 */
export type ExpressionIssueCode
  = | 'XH_EXPR_EMPTY'
    | 'XH_EXPR_TOO_LONG'
    | 'XH_EXPR_TOO_DEEP'
    | 'XH_EXPR_UNEXPECTED_CHARACTER'
    | 'XH_EXPR_UNEXPECTED_TOKEN'
    | 'XH_EXPR_UNEXPECTED_END'
    | 'XH_EXPR_UNTERMINATED_STRING'
    | 'XH_EXPR_INVALID_ESCAPE'
    | 'XH_EXPR_INVALID_NUMBER'
    | 'XH_EXPR_INVALID_IDENTIFIER'
    | 'XH_EXPR_CHAINED_COMPARISON'
    | 'XH_EXPR_INVALID_CALLEE'
    | 'XH_EXPR_UNKNOWN_IDENTIFIER'
    | 'XH_EXPR_UNKNOWN_FUNCTION'
    | 'XH_EXPR_ARGUMENT_COUNT'
    | 'XH_EXPR_FORBIDDEN_MEMBER'
    | 'XH_EXPR_INVALID_AST'
    | 'XH_EXPR_TYPE_MISMATCH'
    | 'XH_EXPR_INVALID_ARGUMENT'
    | 'XH_EXPR_INVALID_INDEX'
    | 'XH_EXPR_DIVISION_BY_ZERO'
    | 'XH_EXPR_NUMBER_OVERFLOW'
    | 'XH_EXPR_DATE_OUT_OF_RANGE'
    | 'XH_EXPR_STRING_TOO_LONG'
    | 'XH_EXPR_STEP_LIMIT'
    | 'XH_EXPR_DEPTH_LIMIT'
    | 'XH_EXPR_UNSUPPORTED_VALUE'
    | 'XH_EXPR_NOW_UNAVAILABLE'
    | 'XH_EXPR_FUNCTION_FAILED'

/** 问题附带的定位数据，只放名字、序号与数量，不放文案。 */
export type ExpressionIssueData = Readonly<Record<string, string | number>>

/**
 * 一条问题：问题码加源码区间（UTF-16 码元偏移，左闭右开）。
 * `data` 按问题码携带名字、实参序号、个数上下限等定位数据。
 */
export interface ExpressionIssue {
  readonly code: ExpressionIssueCode
  readonly start: number
  readonly end: number
  readonly data?: ExpressionIssueData
}

/** 构造一条冻结的问题。 */
export function createIssue(code: ExpressionIssueCode, start: number, end: number, data?: Record<string, string | number>): ExpressionIssue {
  return data === undefined
    ? Object.freeze({ code, start, end })
    : Object.freeze({ code, start, end, data: Object.freeze({ ...data }) })
}

/** 求值过程中尚未定位的故障；求值器把它挂到出错节点的区间上。 */
export class Fault {
  readonly code: ExpressionIssueCode
  readonly data: Record<string, string | number> | undefined

  constructor(code: ExpressionIssueCode, data?: Record<string, string | number>) {
    this.code = code
    this.data = data
  }
}

/** 判断一个值是不是未定位的故障。 */
export function isFault(value: unknown): value is Fault {
  return value instanceof Fault
}
