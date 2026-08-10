import type { PropTypes } from '@xihan-ui/core'

/** 尺寸档位，只改字号与行间距。 */
export type StatisticSize = 'sm' | 'md' | 'lg'

/** 语气档位，决定数值与前后缀用哪族颜色。 */
export type StatisticTone = 'brand' | 'neutral' | 'success' | 'warning' | 'danger' | 'info'

export interface StatisticProps {
  /** 尺寸：sm / md / lg，只落成 root 的 data-size。 */
  size?: StatisticSize
  /** 语气：brand / neutral / success / warning / danger / info，只落成 root 的 data-tone。 */
  tone?: StatisticTone
}

export interface StatisticApi<T extends PropTypes = PropTypes> {
  getRootProps: () => T['element']
  getLabelProps: () => T['element']
  getValueProps: () => T['element']
  getPrefixProps: () => T['element']
  getSuffixProps: () => T['element']
}
