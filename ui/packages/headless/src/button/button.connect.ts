import type { NormalizeProps, PropTypes } from '@xihan-ui/core'
import type { ButtonApi, ButtonProps } from './button.types'
import { dataAttr } from '@xihan-ui/core'
import { buttonAnatomy } from './button.anatomy'

const parts = buttonAnatomy.build()

// Button 无状态机：状态全部来自 props 与浏览器原生伪类。
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
        // stopImmediatePropagation 而不是 stopPropagation：后者只挡往祖先冒泡，
        // 作者挂在同一个节点上的处理器照跑不误——一个"提交中"的按钮会被点第二次提交出去。
        // 前提是本处理器先注册：Vue 把 connect 的 props 排在透传属性之前，
        // WC 侧 spreader 在作者补监听器之前就接好了线。
        e.stopImmediatePropagation()
      },
    }),
    getLabelProps: () => normalize.element({ ...parts.label.attrs }),
    getIndicatorProps: () => normalize.element({ ...parts.indicator.attrs, 'aria-hidden': 'true' }),
    getPrefixProps: () => normalize.element({ ...parts.prefix.attrs, 'aria-hidden': 'true' }),
    getSuffixProps: () => normalize.element({ ...parts.suffix.attrs, 'aria-hidden': 'true' }),
  }
}
