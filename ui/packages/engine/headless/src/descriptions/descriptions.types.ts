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

export interface DescriptionsProps {
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
  getRootProps: () => T['element']
  getItemProps: (props?: DescriptionsItemProps) => T['element']
  getLabelProps: () => T['element']
  getValueProps: () => T['element']
}

/** 读屏文案。本组件目前没有需要外露的文案，保留该位。 */
export interface DescriptionsTranslations {}
