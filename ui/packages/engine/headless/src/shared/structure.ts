/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 组件的标准结构：作者照 anatomy 会写出的那棵部件树，与框架无关。
// 组件的结构函数按状态产出它，Vue / React 的缺省树与 Web Components 的生成节点都照它渲，三端出自同一处。

/** 标准结构里的一个部件节点。 */
export interface StructureNode {
  /** 同一父节点下唯一：渲染时按它复用节点。 */
  readonly key: string
  /** 部件名，与 anatomy 逐字相同；Web Components 写成 data-xh-part。 */
  readonly part: string
  /** Web Components 侧建节点用的标签；Vue / React 侧由部件组件自己决定。 */
  readonly tag: 'div' | 'span'
  /** 作者会写在节点上的身份属性（value、polarity 等），Vue / React 侧作为同名 prop 传给部件组件。 */
  readonly attrs?: Readonly<Record<string, string>>
  /** 节点里的文字；与 children 互斥。 */
  readonly text?: string
  readonly children?: readonly StructureNode[]
  /** 这个部件对应的模型数据（一格的取值等），适配器交给作者的内容插槽，不写进 DOM。 */
  readonly data?: unknown
}
