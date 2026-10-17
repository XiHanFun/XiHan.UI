/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 表达式输入框的宿主端口：检查函数与宿主补全来源。函数补全由组件从表达式引擎的函数表生成，不经这里。

/** 一条表达式问题。区间按源码的 UTF-16 下标，end 不含。 */
export interface ExpressionInputIssue {
  readonly start: number
  readonly end: number
  /** 问题码，组件按它到文案桶里取说明；给了 message 时不看它。 */
  readonly code?: string
  /** 现成的说明文字，给了就直接显示。 */
  readonly message?: string
  /** 填进说明里的数据，如未知的名字。 */
  readonly data?: Readonly<Record<string, string | number>>
  /** 缺省 error；只有 error 让输入框处于无效态。 */
  readonly severity?: 'error' | 'warning'
}

/**
 * 检查函数：给一段源码，返回它的问题，没有问题时返回空数组。
 * 必须同步、无副作用；组件在值变化后去抖调用，失焦时立即调用。
 */
export type ExpressionCheck = (source: string) => readonly ExpressionInputIssue[]

/** 补全条目的种类。 */
export type ExpressionCompletionKind = 'variable' | 'function'

/** 一条宿主补全：可引用的名字，或宿主自己提供的函数。 */
export interface ExpressionCompletion {
  /** 列表里显示的名字。 */
  readonly label: string
  readonly kind: ExpressionCompletionKind
  /** 名字后面的一小段提示，如字段的类型。 */
  readonly detail?: string
  /** 下一行的一句话说明。 */
  readonly description?: string
  /** 插入的文本，缺省：变量为 label，函数为 `${label}()` 且光标落在括号里。 */
  readonly insert?: string
}

/** 按光标处的词取补全时的查询。 */
export interface ExpressionCompletionQuery {
  /** 整段源码。 */
  readonly source: string
  /** 光标的 UTF-16 下标。 */
  readonly caret: number
  /** 光标前正在输入的那个名字，可以为空串。 */
  readonly word: string
  /** 名字前紧挨着 `.` 时为点之前的那串名字（如 `$row`），否则为 null。 */
  readonly member: string | null
}

/**
 * 宿主补全来源：静态列表由组件按词前缀过滤；函数形式由宿主按查询自己给出并过滤，
 * 例如在 `$row.` 之后列出行内字段。
 */
export type ExpressionCompletionSource
  = | readonly ExpressionCompletion[]
    | ((query: ExpressionCompletionQuery) => readonly ExpressionCompletion[])
