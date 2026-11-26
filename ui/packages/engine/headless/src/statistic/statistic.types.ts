/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 statistic 类型契约。

import type { PropTypes, Size, Tone } from '@xihan-ui/core'

/** 尺寸档位，只影响字号与行间距。 */

/** 语气档位，决定数值与前后缀使用哪族颜色。 */

/** 该数值与上一期相比是上涨、下跌，还是持平。取值写为 trend 部件的 data-trend。 */
export type StatisticTrend = 'up' | 'down' | 'flat'

export interface StatisticProps {
  /** 尺寸：sm / md / lg，只写为 root 的 data-size。 */
  size?: Size
  /** 语气：brand / neutral / success / warning / danger / info，只写为 root 的 data-tone。 */
  tone?: Tone
  /**
   * 涨跌：up / down / flat，写为 trend 部件的 data-trend，皮肤据此绘制兜底箭头。
   * 与 tone 正交，方向与颜色互不联动：下跌也可以是正面信息（差错率、退货率）。
   */
  trend?: StatisticTrend
  /**
   * 数值。给了就按 locale 与 formatOptions 格式化成 valueText，value 部件没写内容时显示这串字；
   * 部件里写了内容就照写的显示，不覆盖。不给时数值由作者写进 value 部件。
   */
  value?: number
  /**
   * 交给 Intl.NumberFormat 的选项：小数位、分组、货币、百分比、单位、紧凑记数等。
   * 不写按该语言的缺省（分组打开、至多三位小数）；只在给了 value 时生效，选项不合法时格式化当场报错。
   */
  formatOptions?: Intl.NumberFormatOptions
  /**
   * BCP 47 语言标记，决定小数点、分组符、数字系统与货币写法。
   * 未提供时取全局配置的 locale，再没有按宿主语言，宿主也没有时按 en-US。
   */
  locale?: string
}

export interface StatisticApi<T extends PropTypes = PropTypes> {
  /** 当前涨跌方向；未提供时为 undefined。 */
  trend?: StatisticTrend
  /** value 按 locale 与 formatOptions 格式化后的文字；没给 value 时为 undefined。 */
  valueText?: string
  getRootProps: () => T['element']
  getLabelProps: () => T['element']
  getValueProps: () => T['element']
  getPrefixProps: () => T['element']
  getSuffixProps: () => T['element']
  getTrendProps: () => T['element']
}

/** 读屏文案。本组件目前没有需要外露的文案，保留该位。 */
export interface StatisticTranslations {}
