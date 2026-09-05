import type { NormalizeProps, PropTypes } from '@xihan-ui/core'
import type { GradientTextApi, GradientTextProps } from './gradient-text.types'
import { gradientTextAnatomy } from './gradient-text.anatomy'

const parts = gradientTextAnatomy.build()

/** 能提前收尾一条声明、从而在同一个 style 里塞进第二条的字符。 */
const UNSAFE_COLOR = /[;{}<>\\]|\/\*|\*\//

/** 取一个可以直接写进声明右侧的颜色值；带上述字符的一律丢弃，退回皮肤缺省。 */
function colorStop(value: string | undefined): string | undefined {
  const text = value?.trim()
  return text && !UNSAFE_COLOR.test(text) ? text : undefined
}

// GradientText 无状态机：两端颜色与走向都由 props 算出。
// 两端颜色写成根上的内联 CSS 变量，渐变怎么画、缺省用哪族颜色，全部在皮肤里；
// 走向按档位落成 data-direction，皮肤逐档换算成 `to <边或角>`。
export function connectGradientText<T extends PropTypes>(
  props: GradientTextProps,
  normalize: NormalizeProps<T>,
): GradientTextApi<T> {
  const from = colorStop(props.from)
  const to = colorStop(props.to)
  // 两端颜色拼成一整条内联 style 文本，自定义属性靠这条路才能同时落到两个适配器上；
  // 给了颜色时根节点的内联 style 归本组件管，作者自己的内联样式写在外层元素上。
  const style = [
    from === undefined ? '' : `--xh-gradient-text-from: ${from}`,
    to === undefined ? '' : `--xh-gradient-text-to: ${to}`,
  ].filter(Boolean).join('; ')

  return {
    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      // 走向恒有值：读一眼 DOM 就知道这段字往哪个方向渐变
      'data-direction': props.direction ?? 'to-right',
      ...(style ? { style } : {}),
    }),
  }
}
