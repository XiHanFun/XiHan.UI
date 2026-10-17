/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 组件的标准结构：作者照 anatomy 会写出的那棵部件树，与框架无关。
// 组件的结构函数按状态产出 root 的子树（root 本身由组件或元素给出），Vue / React 的缺省树与
// Web Components 的生成节点都照它渲，三端出自同一处。

/**
 * 结构里用得到的标签：与 Vue / React 部件组件渲出的标签一致，按需要补，不放开成任意字符串。
 * svg、line、path 是 SVG 命名空间的图元。组合进来的另一个库内组件不走标签，走组合节点（StructureInstanceNode）。
 */
export type StructureTag = 'div' | 'span' | 'button' | 'label' | 'input' | 'textarea' | 'select' | 'p' | 'ul' | 'li' | 'fieldset' | 'legend' | 'h3' | 'footer' | 'svg' | 'line' | 'path'

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

/**
 * 作者有没有给某个插槽写内容：结构函数据此决定铺带 slot 的部件，还是照数据铺。重复部件的插槽带 key。
 * Vue 看同名插槽、React 看同名渲染函数（都不分 key），Web Components 看宿主直接子节点上的 `slot="<name>"` / `slot="<name>:<key>"`。
 */
export type StructureSlotted = (name: string, key?: string) => boolean

/** 标准结构里的一个部件节点；P 是组件结构会产出的部件名。 */
export interface StructureNode<P extends string = string> {
  /** 同一父节点下唯一：渲染时按它复用节点。重复部件取身份值（`item:${value}`），不用下标。 */
  readonly key: string
  /** 部件名，与 anatomy 逐字相同；Web Components 写成 data-xh-part。 */
  readonly part: P
  /**
   * 部件属于哪个组件，缺省为本组件；委派给内嵌组件的部件写那个组件名，part 是元素委派声明里的名字
   * （委派的是内嵌组件整份 anatomy 时就是它 anatomy 里的名字）。
   */
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
  readonly children?: readonly StructureChild<P>[]
  /** 这个部件的内容归作者；与 text、children 互斥。 */
  readonly slot?: StructureSlot
  /** 这个部件对应的模型数据（一格的取值、一个选项等），作为作者内容插槽的参数，不写进 DOM。 */
  readonly data?: unknown
}

/**
 * 组合节点：这个位置是另一个库内组件的一个实例，它自己的结构由它自己生成。
 * 不是外层组件的部件：没有 part，外层的 connect 也不往它身上铺属性；要定位、加样式时放进外层的某个部件里。
 * Web Components 生成 `<xh-${instance}>`，Vue / React 渲那个组件的根组件，都不写结构，内层走它自己的缺省结构。
 */
export interface StructureInstanceNode {
  /** 同一父节点下唯一，按它复用实例：实例里的展开、输入中的文字等状态跟着保留。 */
  readonly key: string
  /** 组件名，即那个组件的 anatomy 名，如 'select'、'number-field'。 */
  readonly instance: string
  /**
   * 交给内层组件的属性与回调，形状是那个组件的 headless props。
   * Web Components 按 property 赋值（不写 attribute），`onXxx` 回调换成 `xxx` 事件的监听；Vue / React 原样当 props。
   */
  readonly props?: Readonly<Record<string, unknown>>
}

/**
 * 装饰文字：段与段之间的分隔符这类不是部件、不接线的文字。三端都渲成一个只装这段文字的 span，
 * 不带部件名；Web Components 生成的这个 span 照样带生成标记，按 key 复用。
 */
export interface StructureLiteralNode {
  /** 同一父节点下唯一，按它复用节点。 */
  readonly key: string
  readonly literal: string
}

/**
 * 作者内容的出口：作者给的内容原样放在这个位置，外面不包部件节点。
 * Vue 渲同名插槽的内容、React 渲同名属性的内容；Web Components 把宿主直接子节点里写了 `slot="<name>"` 的那个节点本身
 * 挪到这里。作者内容自己就是完整的一块（如放进字段的库内控件），再包一层部件会多出一个不该有的节点时用它。
 * 作者没给内容时这个位置什么都没有。
 */
export interface StructureOutletNode {
  /** 同一父节点下唯一。 */
  readonly key: string
  readonly outlet: true
  /** 内容来自哪个插槽；Web Components 侧作者在宿主的直接子节点上写 `slot="<name>"`（带 key 时 `<name>:<key>`）。 */
  readonly slot: StructureSlot
  /** 交给插槽的参数，不写进 DOM。 */
  readonly data?: unknown
}

/** 结构里的一个子节点：部件节点、组合节点、装饰文字或作者内容的出口。 */
export type StructureChild<P extends string = string> = StructureNode<P> | StructureInstanceNode | StructureLiteralNode | StructureOutletNode

/** 是不是装饰文字。 */
export function isStructureLiteral(node: StructureChild): node is StructureLiteralNode {
  return 'literal' in node
}

/** 是不是组合节点。 */
export function isStructureInstance(node: StructureChild): node is StructureInstanceNode {
  return 'instance' in node
}

/** 是不是作者内容的出口。 */
export function isStructureOutlet(node: StructureChild): node is StructureOutletNode {
  return 'outlet' in node
}
