import type { NormalizeProps, PropTypes } from '@xihan-ui/kernel'
import type { SpaceApi, SpaceProps } from './space.types'
import { dataAttr } from '@xihan-ui/kernel'
import { spaceAnatomy } from './space.anatomy'

const parts = spaceAnatomy.build()

// Space 无状态机：排布参数原样落成 data-*，换算成哪条 CSS 规则由皮肤定。
// 方向与间距恒有值：不写也留 md 间距，这是本组件与裸弹性容器的分野，落到 DOM 上一眼可见。
// 根上不写 role：容器只做排布，里面装的是列表还是一组按钮由作者自己声明。
export function connectSpace<T extends PropTypes>(
  props: SpaceProps,
  normalize: NormalizeProps<T>,
): SpaceApi<T> {
  return {
    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      // 新旧两个 prop 同指一件事：orientation 优先，没写才回落到 direction
      'data-orientation': props.orientation ?? props.direction ?? 'horizontal',
      'data-gap': props.gap ?? 'md',
      'data-align': props.align,
      'data-justify': props.justify,
      'data-wrap': dataAttr(props.wrap),
      'data-inline': dataAttr(props.inline),
    }),

    // 分隔符两端产出同一份属性：Vue 侧由 split 插槽在每道缝里铺一个，WC 侧由作者逐个写在 root 里。
    // aria-hidden 恒为真：它是装饰，逐条念出来只会打断内容。
    getSplitProps: () => normalize.element({
      ...parts.split.attrs,
      'aria-hidden': true,
    }),
  }
}
