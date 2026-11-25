/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 从组件定义取出它接受的 props，各组件据此导出与 React 同名的 Xh*Props 类型。

/**
 * 组件在模板与 `h()` 里接受的 props：声明的 props、emits 对应的 onXxx 监听，以及 class、style、key、ref。
 * 泛型组件推断不了类型参数，那几个组件各自写具名的泛型类型，不走这里。
 */
export type PropsOf<C> = C extends abstract new (...args: never[]) => { $props: infer P } ? P : never
