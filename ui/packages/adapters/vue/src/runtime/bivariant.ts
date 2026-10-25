/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 参数双变的回调类型，给按值类型收窄的根组件用。
// 模板里 Volar 推断得出值类型，回调参数照它收窄；`h()` 推断不了组件的泛型，按 unknown 擦掉值类型，
// 这时作者照旧写的 (value: string[]) => … 也要交得进来——属性写法的函数类型参数逆变，交不进来，方法签名才双变。

/** 参数双变的回调：在模板里按推断出的类型收窄，在 `h()` 里也收得下按具体类型写的回调。 */
// eslint-disable-next-line ts/method-signature-style -- 方法签名才是双变的，改成属性写法就退回逆变
export type BivariantCallback<A extends unknown[], R = void> = { bivarianceHack(...args: A): R }['bivarianceHack']
