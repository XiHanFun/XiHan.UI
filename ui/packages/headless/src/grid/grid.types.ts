import type { PropTypes } from '@xihan-ui/core'

/** 每一项在自己那格里的块向对齐。 */
export type GridAlign = 'start' | 'center' | 'end' | 'stretch' | 'baseline'

/** 每一项在自己那格里的行内对齐。 */
export type GridJustify = 'start' | 'center' | 'end' | 'stretch'

/** 行列间距档位，逐档对应一个间距令牌；档位名与 Flex 同一套。 */
export type GridGap = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

export interface GridProps {
  /** 列数：1 至 12 的整数，不写按一列排。各列等宽，且每列的下限是 0，长内容不会把自己那列撑宽。 */
  cols?: number
  /** 行列间距档位：xs / sm / md / lg / xl，不写则不留间距。档位换算成多少由皮肤定。 */
  gap?: GridGap
  /** 每一项在自己那格里的块向对齐：start / center / end / stretch / baseline，不写则铺满格高。 */
  align?: GridAlign
  /** 每一项在自己那格里的行内对齐：start / center / end / stretch，不写则铺满格宽。 */
  justify?: GridJustify
}

/** 每一格自报的占位声明。 */
export interface GridItemProps {
  /** 跨几列：1 至 12 的整数，不写占一列。 */
  span?: number
  /** 往后错几列：1 至 11 的整数，这一项改从第 offset + 1 条列线起排，它前面那几列空着。 */
  offset?: number
}

export interface GridApi<T extends PropTypes = PropTypes> {
  getRootProps: () => T['element']
  getItemProps: (props?: GridItemProps) => T['element']
}
