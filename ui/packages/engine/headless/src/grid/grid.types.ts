/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 grid 类型契约。

import type { PropTypes } from '@xihan-ui/core'

/** 每一项在所在格中的块向对齐。 */
export type GridAlign = 'start' | 'center' | 'end' | 'stretch' | 'baseline'

/** 每一项在所在格中的行内对齐。 */
export type GridJustifyItems = 'start' | 'center' | 'end' | 'stretch'

/** 行列间距档位，逐档对应一个间距令牌；档位名与 Flex 同一套。 */
export type GridGap = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

/** 断点档位名，与断点令牌逐字同名。 */
export type GridBreakpoint = 'sm' | 'md' | 'lg' | 'xl'

/** 列数与跨列的取值：1 至 12，逐值对应一条皮肤规则。 */
export type GridColumnCount = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12

/** 错列的取值：1 至 11，最多把该格推到最后一列起排。 */
export type GridColumnOffset = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11

/** 行数的取值：1 至 12，与列数同一档范围。 */
export type GridRowCount = GridColumnCount

/** 自适应列宽的下限四档，逐档对应一个 --xh-layout-col-min-* 令牌。 */
export type GridMinColWidth = 'xs' | 'sm' | 'md' | 'lg'

/** 逐档的列数：档与档之间自窄到宽依次接管，写了哪档就在哪档切换列数。 */
export interface GridColsByBreakpoint {
  /** 未达到任何断点时的列数，未提供时按一列排列。 */
  base?: GridColumnCount
  /** 视口宽度达到 sm 断点后的列数。 */
  sm?: GridColumnCount
  /** 视口宽度达到 md 断点后的列数。 */
  md?: GridColumnCount
  /** 视口宽度达到 lg 断点后的列数。 */
  lg?: GridColumnCount
  /** 视口宽度达到 xl 断点后的列数。 */
  xl?: GridColumnCount
}

/** 列数：整数即各档同一个列数；断点对象则逐档取值。 */
export type GridCols = GridColumnCount | GridColsByBreakpoint

/** 逐档的跨列，档位与列数同一套。 */
export interface GridSpanByBreakpoint {
  /** 未达到任何断点时的跨列数，未提供时占一列。 */
  base?: GridColumnCount
  /** 视口宽度达到 sm 断点后的跨列数。 */
  sm?: GridColumnCount
  /** 视口宽度达到 md 断点后的跨列数。 */
  md?: GridColumnCount
  /** 视口宽度达到 lg 断点后的跨列数。 */
  lg?: GridColumnCount
  /** 视口宽度达到 xl 断点后的跨列数。 */
  xl?: GridColumnCount
}

/** 跨列：整数即各档同一个跨度；断点对象则逐档取值。 */
export type GridSpan = GridColumnCount | GridSpanByBreakpoint

/** 逐档的错列，档位与列数同一套。 */
export interface GridOffsetByBreakpoint {
  /** 未达到任何断点时的错列数，未提供时不错列。 */
  base?: GridColumnOffset
  /** 视口宽度达到 sm 断点后的错列数。 */
  sm?: GridColumnOffset
  /** 视口宽度达到 md 断点后的错列数。 */
  md?: GridColumnOffset
  /** 视口宽度达到 lg 断点后的错列数。 */
  lg?: GridColumnOffset
  /** 视口宽度达到 xl 断点后的错列数。 */
  xl?: GridColumnOffset
}

/** 错列：整数即各档同一个错位；断点对象则逐档取值。 */
export type GridOffset = GridColumnOffset | GridOffsetByBreakpoint

export interface GridProps {
  /**
   * 列数：1 至 12 的整数，未提供时按一列排列；范围外的值也按一列排列。
   * 各列等宽，且每列的下限是 0，长内容不会把所在列撑宽。
   * 也接受断点对象 `{ base, sm, md, lg, xl }`，逐档写各自的列数，未写的档沿用更窄的一档。
   */
  cols?: GridCols
  /**
   * 行数：1 至 12 的整数，未提供时行数由内容撑出；范围外的值按未提供处理。
   * 提供后把这几行排为显式轨道，超出的项落入隐式行。
   */
  rows?: GridRowCount
  /**
   * 每列的最小宽度：xs / sm / md / lg 四档，各对应一个列宽下限令牌。提供后列数改由容器宽度
   * 除以该下限得出（放得下几列即几列），`cols` 的轨道表不再生效。不接受裸像素值。
   */
  minColWidth?: GridMinColWidth
  /** 行列间距档位：xs / sm / md / lg / xl，未提供时不留间距。档位对应的数值由皮肤决定。 */
  gap?: GridGap
  /** 只改行间距，档位同 gap；未提供时跟随 gap。 */
  rowGap?: GridGap
  /** 只改列间距，档位同 gap；未提供时跟随 gap。 */
  columnGap?: GridGap
  /** 每一项在所在格中的块向对齐：start / center / end / stretch / baseline，未提供时铺满格高。 */
  align?: GridAlign
  /** 每一项在所在格中的行内对齐：start / center / end / stretch，未提供时铺满格宽。 */
  justifyItems?: GridJustifyItems
}

/** 每一格声明的占位。 */
export interface GridItemProps {
  /**
   * 跨列数：1 至 12 的整数，未提供时占一列；范围外的值也占一列。
   * 也接受断点对象 `{ base, sm, md, lg, xl }`，逐档写各自的跨度，未写的档沿用更窄的一档。
   */
  span?: GridSpan
  /**
   * 向后错列数：1 至 11 的整数，该项改从第 offset + 1 条列线起排，前面的列留空；
   * 未提供时不错列，范围外的值也不错列。
   * 也接受断点对象 `{ base, sm, md, lg, xl }`，逐档写各自的错位，未写的档沿用更窄的一档。
   */
  offset?: GridOffset
}

export interface GridApi<T extends PropTypes = PropTypes> {
  getRootProps: () => T['element']
  getItemProps: (props?: GridItemProps) => T['element']
}

/** 读屏文案。本组件目前没有需要外露的文案，保留该位。 */
export interface GridTranslations {}
