/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 组件的标准结构：作者照 anatomy 会写出的那棵部件树，与框架无关。
// 组件的结构函数按状态产出 root 的子树（root 本身由组件或元素给出），Vue / React 的缺省树与
// Web Components 的生成节点都照它渲，三端出自同一处。

/**
 * 结构里用得到的标签：与 Vue / React 部件组件渲出的标签一致，按需要补，不放开成任意字符串。
 * `xh-*` 是结构里组合进来的另一个库内元素（如筛选器条件里的下拉），它自己的结构由它自己生成。
 */
export type StructureTag = 'div' | 'span' | 'button' | 'label' | 'input' | 'textarea' | 'p' | 'ul' | 'li' | 'fieldset' | 'legend' | `xh-${string}`

/**
 * 可接管部件在 root 里的位置：trailing 排在 root 子节点的末尾，portal 经 Portal 脱离文档流。
 * 只有这两种位置的部件能单独接管，作者节点与生成节点的先后才不会把 DOM 序、Tab 序弄反。
 */
export type StructureTakeoverPosition = 'trailing' | 'portal'

/**
 * 部件的内容归作者。name 是插槽名：Vue 交给同名作用域插槽，React 交给同名渲染函数，参数是节点的 data。
 * 重复部件带 key，Web Components 侧作者在宿主的直接子节点上写 `slot="<name>:<key>"`，单例写 `slot="<name>"`。
 */
export interface StructureSlot {
  readonly name: string
  readonly key?: string
}

/** 标准结构里的一个部件节点；P 是组件结构会产出的部件名。 */
export interface StructureNode<P extends string = string> {
  /** 同一父节点下唯一：渲染时按它复用节点。重复部件取身份值（`item:${value}`），不用下标。 */
  readonly key: string
  /** 部件名，与 anatomy 逐字相同；Web Components 写成 data-xh-part。 */
  readonly part: P
  /** 部件属于哪个组件，缺省为本组件；委派给内嵌组件的部件写那个组件名，part 是它 anatomy 里的名字。 */
  readonly component?: string
  /** Web Components 侧建节点用的标签，与 Vue / React 部件组件渲出的标签相同。 */
  readonly tag: StructureTag
  /**
   * 作者会写在节点上的身份属性（value、level、polarity 等），Vue / React 侧作为同名 prop 传给部件组件。
   * role、aria-*、data-state、tabindex 这类由 connect 产出的属性不放这里：两边写同一个属性，撤的时候归属就乱了。
   */
  readonly attrs?: Readonly<Record<string, string>>
  /** 节点里的文字；与 children、slot 互斥。 */
  readonly text?: string
  readonly children?: readonly StructureNode<P>[]
  /** 这个部件的内容归作者；与 text、children 互斥。 */
  readonly slot?: StructureSlot
  /** 这个部件对应的模型数据（一格的取值、一个选项等），作为作者内容插槽的参数，不写进 DOM。 */
  readonly data?: unknown
}
