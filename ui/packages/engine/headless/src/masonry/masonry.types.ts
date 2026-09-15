/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 masonry 类型契约。

import type { PropTypes } from '@xihan-ui/core'

/** 间距档位，逐档对应一个间距令牌；档位名与 Grid 同一套。 */
export type MasonryGap = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

/** 断点档位名，与断点令牌逐字同名。 */
export type MasonryBreakpoint = 'sm' | 'md' | 'lg' | 'xl'

/** 逐档的列数：档与档之间自窄到宽依次接管，写了哪档就在哪档切换列数。 */
export interface MasonryColumnsByBreakpoint {
  /** 未达到任何断点时的列数，未提供时按默认列数（3）。 */
  base?: number
  /** 容器宽度达到 sm 断点后的列数。 */
  sm?: number
  /** 容器宽度达到 md 断点后的列数。 */
  md?: number
  /** 容器宽度达到 lg 断点后的列数。 */
  lg?: number
  /** 容器宽度达到 xl 断点后的列数。 */
  xl?: number
}

/** 列数：整数即各档同一个列数；断点对象则逐档取值。 */
export type MasonryColumns = number | MasonryColumnsByBreakpoint

export interface MasonryProps {
  /**
   * 列数，未提供时按三列。也接受断点对象 `{ base, sm, md, lg, xl }`，逐档写各自的列数，
   * 未写的档沿用更窄的一档。换档依据容器自身的宽度，不是视口宽度。
   */
  columns?: MasonryColumns
  /** 列与列、项与项之间的间距档位：xs / sm / md / lg / xl，未提供时不留间距。档位对应的数值由皮肤决定。 */
  gap?: MasonryGap
  /**
   * 按文档序逐列填充：项分段落入各列，阅读顺序仍是先走完左列，再走下一列。
   * 未提供时最短列优先，视觉上更齐平，但相邻的两项未必相邻。
   */
  sequential?: boolean
}

/** 一列声明的位次。 */
export interface MasonryColumnProps {
  /** 第几列，从 0 起。 */
  index: number
}

/** 一项声明的位次与落点。 */
export interface MasonryItemProps {
  /** 在作者书写的顺序中排第几，从 0 起；重排把项移入其他列后，依靠它识别原序。 */
  index: number
  /** 落在第几列，从 0 起。 */
  column: number
}

export interface MasonryApi<T extends PropTypes = PropTypes> {
  getRootProps: () => T['element']
  getColumnProps: (props: MasonryColumnProps) => T['element']
  getItemProps: (props: MasonryItemProps) => T['element']
}

/** 读屏文案。本组件目前没有需要外露的文案，保留该位。 */
export interface MasonryTranslations {}
