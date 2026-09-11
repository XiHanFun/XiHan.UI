// 守卫布尔组合子。产物带 COMBINATOR 标记，createMachine 的自检据此放行。
import type { GuardExpr, GuardFn, MachineSchema } from './types'

/** 组合子标记键，以 enumerable:false 挂在函数上。 */
export const COMBINATOR = Symbol.for('xihan-ui.guard-combinator')

export interface GuardCombinators<T extends MachineSchema> {
  and: (...exprs: Array<GuardExpr<T>>) => GuardFn<T>
  or: (...exprs: Array<GuardExpr<T>>) => GuardFn<T>
  not: (expr: GuardExpr<T>) => GuardFn<T>
}

function mark<T extends MachineSchema>(fn: GuardFn<T>, op: string, args: readonly unknown[]): GuardFn<T> {
  const metadata = Object.freeze({ op, args })
  return Object.defineProperty(fn, COMBINATOR, { value: metadata, enumerable: false })
}

/** 某个 guard 值是否是组合子产物。 */
export function isCombinator(v: unknown): boolean {
  return typeof v === 'function' && Object.hasOwn(v, COMBINATOR)
}

export function createGuards<T extends MachineSchema>(): GuardCombinators<T> {
  return {
    and: (...exprs) => {
      const args = Object.freeze([...exprs])
      return mark<T>(params => args.every(e => params.guard(e)), 'and', args)
    },
    or: (...exprs) => {
      const args = Object.freeze([...exprs])
      return mark<T>(params => args.some(e => params.guard(e)), 'or', args)
    },
    not: (expr) => {
      const arg = expr
      const args = Object.freeze([arg])
      return mark<T>(params => !params.guard(arg), 'not', args)
    },
  }
}
