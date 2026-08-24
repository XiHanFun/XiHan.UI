import type { NormalizeProps, PropTypes } from '@xihan-ui/kernel'
import type { ButtonApi, ButtonProps } from './button.types'
import { dataAttr, isDev } from '@xihan-ui/kernel'
import { buttonAnatomy } from './button.anatomy'

const parts = buttonAnatomy.build()

/** 图标按钮缺可及名的提醒只投一次，连接层每次重算都会经过这里。 */
let iconOnlyNameWarned = false

// Button 无状态机，状态来自 props 与原生伪类。
export function connectButton<T extends PropTypes>(
  props: ButtonProps,
  normalize: NormalizeProps<T>,
): ButtonApi<T> {
  const disabled = !!props.disabled
  const loading = !!props.loading
  const interactive = !disabled && !loading
  // 图标按钮没有可见文字，没给 aria-label / aria-labelledby 就没有可及名；只在开发模式提醒一次
  if (isDev() && !iconOnlyNameWarned && props.iconOnly && !props.ariaLabel && !props.ariaLabelledby) {
    iconOnlyNameWarned = true
    console.warn('[xh:button] iconOnly 按钮没有可见文字，须给 aria-label 或 aria-labelledby')
  }

  return {
    disabled,
    loading,
    getRootProps: () => normalize.button({
      ...parts.root.attrs,
      'type': props.type ?? 'button',
      // 真 disabled 用原生（会丢焦点）；loading 用 aria-disabled + 拦截事件（保留焦点）
      'disabled': disabled || undefined,
      'aria-disabled': loading ? 'true' : undefined,
      // 在途要报 busy：aria-disabled 说的是「现在按不动」，aria-busy 说的是「这块还在更新」，
      // 两件事都成立。同族的 switch / popconfirm / table 都发这一条
      'aria-busy': loading ? 'true' : undefined,
      'data-variant': props.variant,
      'data-tone': props.tone,
      'data-size': props.size,
      'data-disabled': dataAttr(disabled),
      'data-loading': dataAttr(loading),
      'data-icon-only': dataAttr(!!props.iconOnly),
      'data-full-width': dataAttr(!!props.fullWidth),
      'onClick': (e: Event) => {
        if (interactive)
          return
        e.preventDefault()
        // 用 stopImmediatePropagation，同节点上作者的处理器也一并拦下
        e.stopImmediatePropagation()
      },
    }),
    getLabelProps: () => normalize.element({ ...parts.label.attrs }),
    getIndicatorProps: () => normalize.element({ ...parts.indicator.attrs, 'aria-hidden': true }),
    getPrefixProps: () => normalize.element({ ...parts.prefix.attrs, 'aria-hidden': true }),
    getSuffixProps: () => normalize.element({ ...parts.suffix.attrs, 'aria-hidden': true }),
  }
}
