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
  // 两套词汇同指一件事：新的 orientation 优先，没写才回落到旧的 direction
  const orientation = props.orientation ?? (props.direction === 'column' ? 'vertical' : 'horizontal')
  return {
    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      // 方向恒有值：缺省 horizontal，读一眼 DOM 就知道这一层往哪排
      'data-orientation': orientation,
      // 旧词汇再发一个版本：使用者的全局规则与快照可能还写着 data-direction。
      // 皮肤只认 data-orientation，这一条纯粹是过渡期的兼容位
      'data-direction': orientation === 'vertical' ? 'column' : 'row',
      'data-align': props.align,
      'data-justify': props.justify,
      'data-gap': props.gap,
      'data-wrap': dataAttr(props.wrap),
      'data-inline': dataAttr(props.inline),
    }),
  }
}
