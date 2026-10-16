/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 内置函数共用的实参读取、故障构造与列表展开。
import type { ExprValue } from '../value'
import type { Runtime } from './entry'
import { ExprNumber } from '../decimal'
import { Fault } from '../issues'
import { ExprList, listItem, typeOf } from '../value'

/** 第 `index` 个实参类型不符。 */
export function typeMismatch(index: number, value: ExprValue): Fault {
  return new Fault('XH_EXPR_TYPE_MISMATCH', { index, actual: typeOf(value) })
}

/** 第 `index` 个实参取值不合法。 */
export function invalidArgument(index: number): Fault {
  return new Fault('XH_EXPR_INVALID_ARGUMENT', { index })
}

/** 是否有任一实参为 `null`。 */
export function anyNull(args: readonly ExprValue[]): boolean {
  return args.includes(null)
}

/** 取数字实参，类型不符返回故障。 */
export function numberArg(args: readonly ExprValue[], index: number): ExprNumber | Fault {
  const value = args[index] ?? null
  return value instanceof ExprNumber ? value : typeMismatch(index, value)
}

/** 取字符串实参，类型不符返回故障。 */
export function stringArg(args: readonly ExprValue[], index: number): string | Fault {
  const value = args[index] ?? null
  return typeof value === 'string' ? value : typeMismatch(index, value)
}

/** 取整数实参并限定范围；不是数字返回类型不符，不是整数或越界返回不合法实参。 */
export function integerArg(args: readonly ExprValue[], index: number, min: number, max: number): number | Fault {
  const value = numberArg(args, index)
  if (value instanceof Fault)
    return value
  if (!value.isInteger)
    return invalidArgument(index)
  const integer = value.toJs()
  return integer >= min && integer <= max ? integer : invalidArgument(index)
}

/** 字符串结果不得超过长度上限。 */
export function limitString(text: string, runtime: Runtime): string | Fault {
  return text.length > runtime.maxStringLength ? new Fault('XH_EXPR_STRING_TOO_LONG', { max: runtime.maxStringLength }) : text
}

/**
 * 把实参逐个展开：列表递归展开成元素，`null` 跳过，其余值交给 `visit`。
 * `visit` 的第二个参数是该值来自第几个实参。每个列表元素计一步，每层列表计一层深。
 */
export function forEachLeaf(args: readonly ExprValue[], runtime: Runtime, visit: (value: Exclude<ExprValue, null | ExprList>, index: number) => Fault | undefined): Fault | undefined {
  const walk = (value: ExprValue, index: number): Fault | undefined => {
    if (value === null)
      return undefined
    if (!(value instanceof ExprList))
      return visit(value, index)
    const entered = runtime.enter()
    if (entered)
      return entered
    try {
      for (let position = 0; position < value.length; position += 1) {
        const charged = runtime.charge(1)
        if (charged)
          return charged
        const item = listItem(value, position)
        if (item instanceof Fault)
          return item
        const failed = walk(item, index)
        if (failed)
          return failed
      }
      return undefined
    }
    finally {
      runtime.leave()
    }
  }
  for (let index = 0; index < args.length; index += 1) {
    const failed = walk(args[index]!, index)
    if (failed)
      return failed
  }
  return undefined
}
