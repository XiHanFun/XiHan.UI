import type { NormalizeProps, PropTypes } from '@xihan-ui/core'
import type { ButtonApi, ButtonProps } from './button.types'
import { dataAttr } from '@xihan-ui/core'
import { buttonAnatomy } from './button.anatomy'

const parts = buttonAnatomy.build()

// Button 无状态机，状态来自 props 与原生伪类。
export function connectButton<T extends PropTypes>(
  props: ButtonProps,
  normalize: NormalizeProps<T>,
): ButtonApi<T> {
  const disabled = !!props.disabled
  const loading = !!props.loading
  const interactive = !disabled && !loading
  const state = loading ? 'loading' : disabled ? 'disabled' : undefined

  return {
    disabled,
    loading,
    getRootProps: () => normalize.button({
      ...parts.root.attrs,
      'type': props.type ?? 'button',
      // 真 disabled 用原生（会丢焦点）；loading 用 aria-disabled + 拦截事件（保留焦点）
      'disabled': disabled || undefined,
      'aria-disabled': loading ? 'true' : undefined,
      'data-state': state,
      'data-variant': props.variant,
      'data-size': props.size,
      'data-disabled': dataAttr(disabled),
      'data-loading': dataAttr(loading),
      'onClick': (e: Event) => {
        if (interactive)
          return
        e.preventDefault()
        // 用 stopImmediatePropagation，同节点上作者的处理器也一并拦下
        e.stopImmediatePropagation()
      },
    }),
    getLabelProps: () => normalize.element({ ...parts.label.attrs }),
    getIndicatorProps: () => normalize.element({ ...parts.indicator.attrs, 'aria-hidden': 'true' }),
    getPrefixProps: () => normalize.element({ ...parts.prefix.attrs, 'aria-hidden': 'true' }),
    getSuffixProps: () => normalize.element({ ...parts.suffix.attrs, 'aria-hidden': 'true' }),
  }
}
