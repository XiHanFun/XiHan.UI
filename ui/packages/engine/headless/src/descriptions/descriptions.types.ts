/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 descriptions 类型契约。

import type { ControlVariant, PropTypes, Size } from '@xihan-ui/core'

/** 每行放置几组标签与取值。皮肤逐档给出列数，一到六列。 */
export type DescriptionsColumns = 1 | 2 | 3 | 4 | 5 | 6

/** 标签相对取值的位置：top 标签在上、left 标签在左。 */
export type DescriptionsPlacement = 'top' | 'left'

/** 尺寸档位，只影响每格的内边距、组与组的间距与整体字号。 */

/**
 * 一组「标签 + 取值」的数据。label 铺进 label 部件，content 铺进 value 部件。
 * 描述列表只读、没有选中一说；条目身份写 value，不写时按下标认。
 */
export interface DescriptionsNode {
  /** 条目身份，同一份描述列表里唯一；不写时取下标。Web Components 用 `slot="value:<身份>"` 接管取值时要写。 */
  value?: string
  /** 标签。 */
  label: string
  /** 取值；数字原样转成文字。不写时这一格的取值是空的。 */
  content?: string | number
  /** 该格横跨几列，未写即占一列；上限是根上的 columns。 */
  span?: number
}

/** 一组的元信息，由 collection 推导。 */
export interface DescriptionsNodeMeta {
  /** node.value，没写时为下标，恒为字符串。 */
  value: string
  /** 第几组，0 起。 */
  index: number
  label: string
  /** node.content 转成的文字；没写时为空串。 */
  content: string
  /** 原样透传，未提供时为 undefined；钳到列数以内由 getItemProps 负责。 */
  span?: number
}

export interface DescriptionsProps {
  /**
   * 各组的数据：给了且不写结构时（Vue 不写默认插槽、React 不给 children、Web Components 只写 root）按它铺出标准结构。
   * 作者手写结构时不读它。
   */
  collection?: readonly DescriptionsNode[]
  /** 每行放置几组，一到六列；未提供时每行一组。 */
  columns?: DescriptionsColumns
  /** 形态：ghost 不画壳（默认），outline 绘制外框并在格与格之间补网格线，subtle 淡底。默认 ghost。 */
  variant?: ControlVariant
  /** 标签的位置：top / left；未提供时标签在上。 */
  placement?: DescriptionsPlacement
  /** 尺寸：sm / md / lg。 */
  size?: Size
}

/**
 * 一格的声明。
 * connect 在 Vue 的 render 期求值，此时 DOM 尚不存在，不得反查 DOM。
 */
export interface DescriptionsItemProps {
  /**
   * 该格横跨的列数，未提供时占一列。
   * 小于 1 按 1 计算，超过当前列数按列数计算：跨出网格的格子会另起一行，比截断更差。
   * 该数值写入 `--xh-_descriptions-item-span`，由皮肤逐档决定是否采用：
   * 一行只放得下一组的窄档不采用，该档每格都占满整行。
   */
  span?: number
}

export interface DescriptionsApi<T extends PropTypes = PropTypes> {
  /** 由 collection 推导的各组元信息，按数据顺序排列；未提供 collection 时为空数组。 */
  collection: readonly DescriptionsNodeMeta[]
  getRootProps: () => T['element']
  /**
   * 列表之前的头部：左侧标题、右侧附加内容（操作、状态）。
   * 它排在根之外：根常写成 dl，dl 的子节点只能是成对的 dt / dd。
   */
  getHeaderProps: () => T['element']
  /** 标题。作者按页面层级选标题标签（h2 / h3…），组件不替作者定层级。 */
  getTitleProps: () => T['element']
  /** 附加内容：编辑、复制等作用于整份描述的操作，或一枚状态标签。 */
  getExtraProps: () => T['element']
  getItemProps: (props?: DescriptionsItemProps) => T['element']
  getLabelProps: () => T['element']
  getValueProps: () => T['element']
}

/** 读屏文案。本组件目前没有需要外露的文案，保留该位。 */
export interface DescriptionsTranslations {}
