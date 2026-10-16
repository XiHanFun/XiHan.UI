/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 设计器零件的登记表：全量注册、按需注册与标签到元素类型的映射都从这张表来。元素不在 import 时注册。

import { registerElement } from '@xihan-ui/web-components/authoring'

/** 标签名 → 元素类。 */
export const DESIGNER_SHELL_ELEMENTS = {} as const satisfies Readonly<Record<`xh-designer-${string}`, CustomElementConstructor>>

/** 标签名 → 元素实例类型。 */
export type DesignerShellTagMap = { [K in keyof typeof DESIGNER_SHELL_ELEMENTS]: InstanceType<(typeof DESIGNER_SHELL_ELEMENTS)[K]> }

/** 按需注册一个零件；重复注册同一个类不报错，同名注册了别的类时抛错。 */
export function defineDesignerShellElement<K extends keyof DesignerShellTagMap>(tag: K, ctor: new () => DesignerShellTagMap[K]): void {
  registerElement(tag, ctor)
}

/** 注册全部零件；重复调用不报错。 */
export function defineDesignerShell(): void {
  for (const [tag, ctor] of Object.entries<CustomElementConstructor>(DESIGNER_SHELL_ELEMENTS))
    registerElement(tag, ctor)
}
