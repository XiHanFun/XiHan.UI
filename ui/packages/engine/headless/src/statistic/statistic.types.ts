import type { PropTypes, Size, Tone } from '@xihan-ui/core'

/** 尺寸档位，只改字号与行间距。 */

/** 语气档位，决定数值与前后缀用哪族颜色。 */

/** 这个数与上一期比是涨、是跌，还是持平。取值落成 trend 部件的 data-direction。 */
export type StatisticTrend = 'up' | 'down' | 'flat'

export interface StatisticProps {
  /** 尺寸：sm / md / lg，只落成 root 的 data-size。 */
  size?: Size
  /** 语气：brand / neutral / success / warning / danger / info，只落成 root 的 data-tone。 */
  tone?: Tone
  /**
   * 涨跌：up / down / flat，落成 trend 部件的 data-direction，皮肤据它出兜底箭头。
   * 与 tone 正交，方向与颜色互不联动——跌也可以是好事（差错率、退货率）。
   */
  trend?: StatisticTrend
}

export interface StatisticApi<T extends PropTypes = PropTypes> {
  /** 当前涨跌方向；没给即 undefined。 */
  trend?: StatisticTrend
  getRootProps: () => T['element']
  getLabelProps: () => T['element']
  getValueProps: () => T['element']
  getPrefixProps: () => T['element']
  getSuffixProps: () => T['element']
  getTrendProps: () => T['element']
}

/** 读屏用的文案。本组件目前没有需要外露的文案，位先留着。 */
export interface StatisticTranslations {}
