import type { PropTypes } from '@xihan-ui/core'

/** 间距档位，逐档对应一个间距令牌；档位名与 Grid 同一套。 */
export type MasonryGap = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

/** 断点档位名，与断点令牌逐字同名。 */
export type MasonryBreakpoint = 'sm' | 'md' | 'lg' | 'xl'

/** 逐档的列数：档与档之间自窄到宽依次接管，写了哪档就在哪档换列数。 */
export interface MasonryColumnsByBreakpoint {
  /** 一档都没达到时分几列，不写按缺省列数（3）。 */
  base?: number
  /** 容器宽度达到 sm 断点后分几列。 */
  sm?: number
  /** 容器宽度达到 md 断点后分几列。 */
  md?: number
  /** 容器宽度达到 lg 断点后分几列。 */
  lg?: number
  /** 容器宽度达到 xl 断点后分几列。 */
  xl?: number
}

/** 列数：整数即各档同一个列数；断点对象则逐档取值。 */
export type MasonryColumns = number | MasonryColumnsByBreakpoint

export interface MasonryProps {
  /**
   * 分几列，不写按三列。也收断点对象 `{ base, sm, md, lg, xl }`，逐档写各自的列数，
   * 没写的档沿用比它窄的那一档。换档看的是容器自身的宽度，不是视口宽度。
   */
  columns?: MasonryColumns
  /** 列与列、项与项之间的间距档位：xs / sm / md / lg / xl，不写则不留间距。档位换算成多少由皮肤定。 */
  gap?: MasonryGap
  /**
   * 按文档序逐列填：项成段落进各列，读起来仍是「先走完左列，再走下一列」。
   * 不写则最短列优先，视觉上更齐平，但相邻的两项未必挨着。
   */
  sequential?: boolean
}

/** 一列自报的位次。 */
export interface MasonryColumnProps {
  /** 第几列，从 0 数起。 */
  index: number
}

/** 一项自报的位次与落点。 */
export interface MasonryItemProps {
  /** 在作者写的顺序里排第几，从 0 数起；重排把项挪进别的列后，靠它认回原序。 */
  index: number
  /** 落在第几列，从 0 数起。 */
  column: number
}

export interface MasonryApi<T extends PropTypes = PropTypes> {
  getRootProps: () => T['element']
  getColumnProps: (props: MasonryColumnProps) => T['element']
  getItemProps: (props: MasonryItemProps) => T['element']
}

/** 读屏用的文案。本组件目前没有需要外露的文案，位先留着。 */
export interface MasonryTranslations {}
