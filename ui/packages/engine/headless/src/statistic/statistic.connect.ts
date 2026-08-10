import type { NormalizeProps, PropTypes } from '@xihan-ui/kernel'
import type { StatisticApi, StatisticProps } from './statistic.types'
import { statisticAnatomy } from './statistic.anatomy'

const parts = statisticAnatomy.build()

// Statistic 无状态机：一组标签与数值不持有交互状态，属性全部由 props 算出。
// 数值本身由作者格式化好再塞进 value 槽，组件不做千分位、不做单位换算、不做动画。
export function connectStatistic<T extends PropTypes>(
  props: StatisticProps,
  normalize: NormalizeProps<T>,
): StatisticApi<T> {
  return {
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
  }
}
