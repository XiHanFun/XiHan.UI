/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 属性面板的自定义编辑器接口：设计器把一个属性交给宿主提供的编辑器渲染与修改。

import type { JsonValue } from '@xihan-ui/core/json'

/** 交给编辑器的上下文；D 是属性描述，T 是被编辑的对象（如节点、元素、字段）。 */
export interface PropertyEditorContext<D = unknown, T = unknown> {
  /** 属性的当前值，未设置时为 undefined。 */
  readonly value: JsonValue | undefined
  readonly descriptor: D
  readonly target: T
  readonly readonly: boolean
  /** 写入新值，undefined 表示清除；连续输入由设计器并为一步撤销。 */
  readonly setValue: (value: JsonValue | undefined) => void
  /** 一次编辑结束（如失焦）：此后的写入另起一步撤销。 */
  readonly commit: () => void
}

/** 编辑器实例：设计器把 element 放进属性面板，值或只读状态变化时调用 update，移除前调用 destroy。 */
export interface PropertyEditorInstance<D = unknown, T = unknown> {
  readonly element: HTMLElement
  readonly update?: (context: PropertyEditorContext<D, T>) => void
  readonly destroy?: () => void
}

/** 自定义属性编辑器：按上下文创建一个编辑器实例。 */
export type PropertyEditor<D = unknown, T = unknown> = (context: PropertyEditorContext<D, T>) => PropertyEditorInstance<D, T>
