import type { PropTypes } from '@xihan-ui/kernel'

/** 每一项在自己那格里的块向对齐。 */
export type GridAlign = 'start' | 'center' | 'end' | 'stretch' | 'baseline'

/** 每一项在自己那格里的行内对齐。 */
export type GridJustify = 'start' | 'center' | 'end' | 'stretch'

/** 行列间距档位，逐档对应一个间距令牌；档位名与 Flex 同一套。 */
export type GridGap = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

/** 断点档位名，与断点令牌逐字同名。 */
export type GridBreakpoint = 'sm' | 'md' | 'lg' | 'xl'

/** 列数与跨列的取值：1 至 12，逐值对应一条皮肤规则。 */
export type GridColumnCount = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12

/** 错列的取值：1 至 11，最多把这一格推到最后一列起排。 */
export type GridColumnOffset = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11

/** 逐档的列数：档与档之间自窄到宽依次接管，写了哪档就在哪档换列数。 */
export interface GridColsByBreakpoint {
  /** 未达到任何断点时分几列，不写按一列排。 */
  base?: GridColumnCount
  /** 视口宽度达到 sm 断点后分几列。 */
  sm?: GridColumnCount
  /** 视口宽度达到 md 断点后分几列。 */
  md?: GridColumnCount
  /** 视口宽度达到 lg 断点后分几列。 */
  lg?: GridColumnCount
  /** 视口宽度达到 xl 断点后分几列。 */
  xl?: GridColumnCount
}

/** 列数：整数即各档同一个列数；断点对象则逐档取值。 */
export type GridCols = GridColumnCount | GridColsByBreakpoint

export interface GridProps {
  /**
   * 列数：1 至 12 的整数，不写按一列排；范围外的值也按一列排。
   * 各列等宽，且每列的下限是 0，长内容不会把自己那列撑宽。
   * 也收断点对象 `{ base, sm, md, lg, xl }`，逐档写各自的列数，没写的档沿用比它窄的那一档。
   */
  cols?: GridCols
  /** 行列间距档位：xs / sm / md / lg / xl，不写则不留间距。档位换算成多少由皮肤定。 */
  gap?: GridGap
  /** 每一项在自己那格里的块向对齐：start / center / end / stretch / baseline，不写则铺满格高。 */
  align?: GridAlign
  /** 每一项在自己那格里的行内对齐：start / center / end / stretch，不写则铺满格宽。 */
  justify?: GridJustify
}

/** 每一格自报的占位声明。 */
export interface GridItemProps {
  /** 跨几列：1 至 12 的整数，不写占一列；范围外的值也占一列。 */
  span?: GridColumnCount
  /**
   * 往后错几列：1 至 11 的整数，这一项改从第 offset + 1 条列线起排，它前面那几列空着；
   * 不写不错列，范围外的值也不错列。
   */
  offset?: GridColumnOffset
}

export interface GridApi<T extends PropTypes = PropTypes> {
  getRootProps: () => T['element']
  getItemProps: (props?: GridItemProps) => T['element']
}

/** 读屏用的文案。本组件目前没有需要外露的文案，位先留着。 */
export interface GridTranslations {}
