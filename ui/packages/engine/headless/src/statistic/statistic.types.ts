/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 statistic 类型契约。

import type { PropTypes, Size, Tone } from '@xihan-ui/core'

/** 尺寸档位，只影响字号与行间距。 */

/** 语气档位，决定数值与前后缀使用哪族颜色。 */

/** 该数值与上一期相比是上涨、下跌，还是持平。取值写为 trend 部件的 data-direction。 */
export type StatisticTrend = 'up' | 'down' | 'flat'

export interface StatisticProps {
  /** 尺寸：sm / md / lg，只写为 root 的 data-size。 */
  size?: Size
  /** 语气：brand / neutral / success / warning / danger / info，只写为 root 的 data-tone。 */
  tone?: Tone
  /**
   * 涨跌：up / down / flat，写为 trend 部件的 data-direction，皮肤据此绘制兜底箭头。
   * 与 tone 正交，方向与颜色互不联动：下跌也可以是正面信息（差错率、退货率）。
   */
  trend?: StatisticTrend
}

export interface StatisticApi<T extends PropTypes = PropTypes> {
  /** 当前涨跌方向；未提供时为 undefined。 */
  trend?: StatisticTrend
  getRootProps: () => T['element']
  getLabelProps: () => T['element']
  getValueProps: () => T['element']
  getPrefixProps: () => T['element']
  getSuffixProps: () => T['element']
  getTrendProps: () => T['element']
}

/** 读屏文案。本组件目前没有需要外露的文案，保留该位。 */
export interface StatisticTranslations {}
