import type { NormalizeProps, PropTypes } from '@xihan-ui/kernel'
import type { Service } from '@xihan-ui/machine'
import type { ClipboardApi, ClipboardSchema } from './clipboard.types'
import { dataAttr } from '@xihan-ui/kernel'
import { clipboardAnatomy } from './clipboard.anatomy'

const parts = clipboardAnatomy.build()

export function connectClipboard<T extends PropTypes>(
  service: Service<ClipboardSchema>,
  normalize: NormalizeProps<T>,
): ClipboardApi<T> {
  const { state, prop, send, scope } = service
  const ids = scope.ids('clipboard', 'label', 'input')

  const status = state.get()
  const copied = status === 'copied'
  const value = prop('value') ?? ''

  return {
    status,
    copied,
    value,
    copy: () => send({ type: 'COPY.TRIGGER' }),

    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      'data-state': status,
      'data-copied': dataAttr(copied),
    }),

    getLabelProps: () => normalize.label({
      ...parts.label.attrs,
      'id': ids.label,
      // for 须指向真正的 input，指到外层包裹会丢掉名字与聚焦
      'for': ids.input,
      'data-state': status,
    }),

    getControlProps: () => normalize.element({
      ...parts.control.attrs,
      'data-state': status,
    }),

    getInputProps: () => normalize.input({
      ...parts.input.attrs,
      'id': ids.input,
      'type': 'text',
      'value': value,
      // 用 readonly 不用 disabled，disabled 会让框选不中、Ctrl/Cmd+C 走不通
      'readonly': true,
      // 作者把 label 换成非 <label> 元素时 for 会失效，这条兜住名字
      'aria-labelledby': ids.label,
      'data-state': status,
      'onFocus': (event: FocusEvent) => {
        // 聚焦即全选；读事件目标节点，connect 求值期不得查 DOM
        const el = event.currentTarget as HTMLInputElement | null
        el?.select?.()
      },
    }),

    getTriggerProps: () => normalize.button({
      ...parts.trigger.attrs,
      // 不给 type 会在 form 里变成 submit，Enter 直接提交表单
      'type': 'button',
      'data-state': status,
      'data-copied': dataAttr(copied),
      'onClick': () => send({ type: 'COPY.TRIGGER' }),
    }),

    /**
     * 两侧指示器常挂 + hidden 收起，不卸载。
     * 这里的 data-copied 是调用方声明的所属侧，与 root / trigger 上表示当前状态的同名属性不同义。
     */
    getIndicatorProps: indicator => normalize.element({
      ...parts.indicator.attrs,
      'data-state': status,
      'data-copied': dataAttr(indicator.copied),
      'hidden': indicator.copied !== copied || undefined,
    }),
  }
}
