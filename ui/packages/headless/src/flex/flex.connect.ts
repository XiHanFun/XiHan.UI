import type { NormalizeProps, PropTypes } from '@xihan-ui/kernel'
import type { FlexApi, FlexProps } from './flex.types'
import { dataAttr } from '@xihan-ui/kernel'
import { flexAnatomy } from './flex.anatomy'

const parts = flexAnatomy.build()

// Flex 无状态机：一维排布不持有任何状态，六个排版参数原样落成 data-*，换算成哪条 CSS 规则由皮肤定。
// 根上不写 role：容器只做排布，里面装的是列表还是一组按钮由作者自己声明。
export function connectFlex<T extends PropTypes>(
  props: FlexProps,
  normalize: NormalizeProps<T>,
): FlexApi<T> {
  return {
    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      // 方向恒有值：缺省 row，读一眼 DOM 就知道这一层往哪排
      'data-direction': props.direction ?? 'row',
      'data-align': props.align,
      'data-justify': props.justify,
      'data-gap': props.gap,
      'data-wrap': dataAttr(props.wrap),
      'data-inline': dataAttr(props.inline),
    }),
  }
}
