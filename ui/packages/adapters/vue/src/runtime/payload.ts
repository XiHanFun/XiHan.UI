/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

/**
 * 取某个 headless 回调的载荷类型。
 *
 * 组件的 `emits` 用对象式声明，每个事件都要写出载荷类型。载荷的真源在 headless 的
 * `on*` 回调上，这里直接从该处取，而不是把 106 个 `*Details` 的名字在适配器中再抄一遍：
 * 再抄一遍就多一处可能不一致的地方，而这一处 TypeScript 无法检查（名字写错只是换了个类型，照样编译）。
 *
 * ```ts
 * emits: {
 *   'value-change': (_details: PayloadOf<SelectProps, 'onValueChange'>) => true,
 *   'update:value': (_value: PayloadOf<SelectProps, 'onValueChange'>['value']) => true,
 * }
 * ```
 */
export type PayloadOf<T, K extends keyof T>
  = NonNullable<T[K]> extends (...args: infer A) => unknown ? A[0] : never
