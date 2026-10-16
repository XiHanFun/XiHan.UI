/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 设计器零件的登记表：全量注册、按需注册与标签到元素类型的映射都从这张表来。元素不在 import 时注册。

import { registerElement } from '@xihan-ui/web-components/authoring'
import { XhDesignerPropertiesElement } from './properties/properties-element'

/** 零件元素类：可以带一个注册它用到的库内元素的静态方法。 */
interface ShellElementClass extends CustomElementConstructor {
  defineDependencies?: () => void
}

/** 标签名 → 元素类。 */
export const DESIGNER_SHELL_ELEMENTS = {
  'xh-designer-properties': XhDesignerPropertiesElement,
} as const satisfies Readonly<Record<`xh-designer-${string}`, ShellElementClass>>

/** 标签名 → 元素实例类型。 */
export type DesignerShellTagMap = { [K in keyof typeof DESIGNER_SHELL_ELEMENTS]: InstanceType<(typeof DESIGNER_SHELL_ELEMENTS)[K]> }

function register(tag: string, ctor: ShellElementClass): void {
  ctor.defineDependencies?.()
  registerElement(tag, ctor)
}

/** 按需注册一个零件（连同它用到的库内元素）；重复注册同一个类不报错，同名注册了别的类时抛错。 */
export function defineDesignerShellElement<K extends keyof DesignerShellTagMap>(tag: K, ctor: (new () => DesignerShellTagMap[K]) & ShellElementClass): void {
  register(tag, ctor)
}

/** 注册全部零件；重复调用不报错。 */
export function defineDesignerShell(): void {
  for (const [tag, ctor] of Object.entries<ShellElementClass>(DESIGNER_SHELL_ELEMENTS))
    register(tag, ctor)
}
