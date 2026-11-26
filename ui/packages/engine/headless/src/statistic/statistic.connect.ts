/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 statistic 相关实现。

import type { NormalizeProps, PropTypes } from '@xihan-ui/core'
import type { StatisticApi, StatisticProps } from './statistic.types'
import { resolveLocale } from '@xihan-ui/core'
import { statisticAnatomy } from './statistic.anatomy'
import { formatStatisticValue } from './statistic.format'

const parts = statisticAnatomy.build()

// Statistic 无状态机：一组标签与数值不持有交互状态，属性全部由 props 算出。
// 给了 value 时数值由这里按语言格式化成 valueText；没给时数值由作者格式化好再写进 value 部件。组件不做动画。
export function connectStatistic<T extends PropTypes>(
  props: StatisticProps,
  normalize: NormalizeProps<T>,
): StatisticApi<T> {
  // null 与没给同义：数据还没到时宿主多半写的是 null，铺成「0」会被当成一个真实的数
  const valueText = props.value == null
    ? undefined
    : formatStatisticValue(props.value, resolveLocale(props.locale), props.formatOptions)

  return {
    trend: props.trend,
    valueText,

    // 两个轴只落在根上，各段从根上继承私有槽与语气槽，子部件不重复标注。
    // 根上不写 role：一块统计数是不是列表项、要不要可及名字，由它被摆在哪里决定。
    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      'data-size': props.size,
      'data-tone': props.tone,
    }),

    // 标签与数值不互相引用：本组件不生成 id，读屏里两者靠文档顺序相邻成对，
    // 需要显式关联的场景由作者自己写 aria-labelledby。
    getLabelProps: () => normalize.element({ ...parts.label.attrs }),

    getValueProps: () => normalize.element({ ...parts.value.attrs }),

    // 前后缀是数值的一部分（货币符号、单位、升降箭头），不对读屏隐藏
    getPrefixProps: () => normalize.element({ ...parts.prefix.attrs }),

    getSuffixProps: () => normalize.element({ ...parts.suffix.attrs }),

    // 涨跌只画一个箭头，说的话由作者写在部件里（「同比 +12%」）；
    // 部件空着时皮肤按方向出兜底字形，那个箭头是装饰，对读屏隐藏由作者的文案兜住
    getTrendProps: () => normalize.element({
      ...parts.trend.attrs,
      'data-trend': props.trend,
    }),
  }
}
