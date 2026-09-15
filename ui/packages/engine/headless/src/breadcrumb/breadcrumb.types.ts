/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 breadcrumb 类型契约。

import type { Direction, PropTypes, Size, Tone } from '@xihan-ui/core'

/** 读屏文案，默认英文。 */
export interface BreadcrumbTranslations {
  /** 根节点的 aria-label，用于区分页面上的多个 nav 地标。 */
  root: string
}

/** 一层路径的数据。提供 collection 时，文字、链接与当前页以它为准。 */
export interface BreadcrumbNode {
  /** 层级身份，写入 data-value。 */
  value: string
  /** 显示文字；默认回退为 value。 */
  label?: string
  /** 链接地址；未提供时渲染为不带 href 的 a。 */
  href?: string
  /** 图标文本，写入 link-icon 部件；需要放置图形时改用插槽。 */
  icon?: string
  /** 当前页所在层级。 */
  current?: boolean
}

/** 单层的元信息，由 collection 推导。 */
export interface BreadcrumbNodeMeta {
  value: string
  /** node.label ?? node.value，恒为字符串。 */
  label: string
  href?: string
  icon?: string
  current: boolean
}

/** 折叠后序列中的一项：一层路径，或一段被折叠的层级。 */
export type BreadcrumbItem
  = | { type: 'node', node: BreadcrumbNodeMeta }
    | { type: 'ellipsis', nodes: readonly BreadcrumbNodeMeta[] }

export interface BreadcrumbProps {
  /**
   * 层级数据，文字、链接与当前页的事实源。
   * 未提供时回到层级逐个写成部件的方式。
   */
  collection?: readonly BreadcrumbNode[]
  /** 最多展开的层数，超出的中间层折叠为一个省略位；未提供时全部列出。 */
  maxItems?: number
  /** 文字方向，只作用于排版；作者未提供时不写入。 */
  dir?: Direction
  translations?: Partial<BreadcrumbTranslations>
  /** 语气：brand / neutral / success / warning / danger / info，决定使用哪族颜色。 */
  tone?: Tone
  /** 尺寸：sm / md / lg。 */
  size?: Size
}

/**
 * 链接声明是否为当前页，connect 据此产出属性。
 * connect 不反查 DOM：它在 Vue 的 render 期求值，此时 DOM 尚不存在。
 */
export interface BreadcrumbLinkProps {
  /** 当前页对应的条目：输出 aria-current="page"，不可点击、不占 Tab 位。 */
  current?: boolean
}

export interface BreadcrumbApi<T extends PropTypes = PropTypes> {
  /** 由 collection 推导的层级元信息，按数据顺序排列；未提供 collection 时为空数组。 */
  collection: readonly BreadcrumbNodeMeta[]
  /** 按 maxItems 折叠后的序列，省略位自带被折叠的层级；未提供 collection 时为空数组。 */
  items: readonly BreadcrumbItem[]
  getRootProps: () => T['element']
  getListProps: () => T['element']
  getItemProps: () => T['element']
  getLinkProps: (props: BreadcrumbLinkProps) => T['element']
  getLinkIconProps: () => T['element']
  getSeparatorProps: () => T['element']
  getEllipsisProps: () => T['element']
}
