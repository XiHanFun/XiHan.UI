// 守卫布尔组合子（§3.4.3）。组合子产物带 COMBINATOR 标记 → 可序列化/运行时可还原，
// 是 states 里唯一允许出现内联函数的场景（createMachine 的 D2 自检据此放行）。
import type { GuardExpr, GuardFn, MachineSchema } from './types'

/** 组合子标记键：一个属性键，非注册表；enumerable:false 保证不进 JSON.stringify。 */
export const COMBINATOR = Symbol.for('xihan-ui.guard-combinator')

export interface GuardCombinators<T extends MachineSchema> {
  and: (...exprs: Array<GuardExpr<T>>) => GuardFn<T>
  or: (...exprs: Array<GuardExpr<T>>) => GuardFn<T>
  not: (expr: GuardExpr<T>) => GuardFn<T>
}

function mark<T extends MachineSchema>(fn: GuardFn<T>, op: string, args: unknown[]): GuardFn<T> {
  return Object.defineProperty(fn, COMBINATOR, { value: { op, args }, enumerable: false })
}

/** 某个 guard 值是否是组合子产物（vs 裸内联函数）。 */
export function isCombinator(v: unknown): boolean {
  return typeof v === 'function' && COMBINATOR in (v as object)
}

export function createGuards<T extends MachineSchema>(): GuardCombinators<T> {
  return {
    and: (...exprs) => mark<T>(params => exprs.every(e => params.guard(e)), 'and', exprs),
    or: (...exprs) => mark<T>(params => exprs.some(e => params.guard(e)), 'or', exprs),
    not: expr => mark<T>(params => !params.guard(expr), 'not', [expr]),
  }
}
