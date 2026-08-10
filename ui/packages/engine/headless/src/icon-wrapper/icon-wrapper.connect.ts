import type { NormalizeProps, PropTypes } from '@xihan-ui/kernel'
import type { IconWrapperApi, IconWrapperProps } from './icon-wrapper.types'
import { iconWrapperAnatomy } from './icon-wrapper.anatomy'

const parts = iconWrapperAnatomy.build()

// IconWrapper 无状态机：一层定直径的底座，三个视觉轴全部由 props 算出。
// 根上不写 role、也不写 aria-hidden：里面那个图元是装饰还是信息，由作者按用途声明。
export function connectIconWrapper<T extends PropTypes>(
  props: IconWrapperProps,
  normalize: NormalizeProps<T>,
): IconWrapperApi<T> {
  return {
    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      'data-variant': props.variant,
      'data-tone': props.tone,
      'data-size': props.size,
    }),
  }
}
