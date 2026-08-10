import type { NormalizeProps, PropTypes } from '@xihan-ui/core'
import type { TimelineApi, TimelineProps } from './timeline.types'
import { timelineAnatomy } from './timeline.anatomy'

const parts = timelineAnatomy.build()

/**
 * Timeline 无状态机：一串已经发生的事件，属性全部由 props 算出。
 *
 * 与 Steps 的分别在语义不在形状——两者的部件名相近，语义不可互换：
 * Steps 是「流程走到第几步」，有当前项、有完成态，每一步的呈现随步序变；
 * Timeline 是「按时间排的事件流」，条目已经发生、彼此平等，没有当前项也没有完成态。
 * 所以这里不产出 data-state，不算 current / completed，也不接受步序一类的输入；
 * 条目之间唯一的差别是各自的语气色。
 */
export function connectTimeline<T extends PropTypes>(
  props: TimelineProps,
  normalize: NormalizeProps<T>,
): TimelineApi<T> {
  // 方向恒有值：缺省竖排，读一眼 DOM 就知道这条线往哪走
  const orientation = props.orientation ?? 'vertical'
  const placement = props.placement
  const size = props.size

  return {
    // 报列表语义：皮肤要抹掉列表标记，抹掉后部分引擎会连列表语义一起丢，
    // 而作者未必把根写成 ol/ul，显式写出来两种情形都成立
    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      'role': 'list',
      'data-orientation': orientation,
      'data-placement': placement,
      'data-size': size,
    }),

    // 方向与侧别在条目上再写一份：皮肤据条目自身的属性排版，
    // 不必从根写后代选择器，时间线套时间线也就不会互相串
    getItemProps: () => normalize.element({
      ...parts.item.attrs,
      'role': 'listitem',
      'data-orientation': orientation,
      'data-placement': placement,
    }),

    // 圆点是纯视觉的，这一条说了什么全在 content 里；语气色落在它身上
    getIndicatorProps: item => normalize.element({
      ...parts.indicator.attrs,
      'aria-hidden': 'true',
      'data-tone': item.tone,
    }),

    // 圆点之间的连线，纯视觉；线有多长、首尾怎么裁由皮肤决定
    getConnectorProps: () => normalize.element({
      ...parts.connector.attrs,
      'aria-hidden': 'true',
      'data-orientation': orientation,
    }),

    getContentProps: () => normalize.element({ ...parts.content.attrs }),

    // 标题不占标题层级：时间线嵌在页面哪一层由使用者决定，组件自己插一级标题会污染文档大纲
    getTitleProps: () => normalize.element({ ...parts.title.attrs }),

    getDescriptionProps: () => normalize.element({ ...parts.description.attrs }),

    // 时刻只圈出一块文本位。写成 <time datetime="…"> 由作者决定，这里不代填机读时间：
    // 组件拿不到时区与精度，猜出来的 datetime 会比不写更糟
    getTimeProps: () => normalize.element({ ...parts.time.attrs }),
  }
}
