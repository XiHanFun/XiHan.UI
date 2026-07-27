import type { NormalizeProps, PropTypes } from '@xihan-ui/core'
import type { Service } from '@xihan-ui/machine'
import type { ClipboardApi, ClipboardSchema } from './clipboard.types'
import { dataAttr } from '@xihan-ui/core'
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
      // for 指向真正的 input：指到外层包裹上，点标题不会聚焦、读屏也拿不到控件的名字
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
      // 只读而不是禁用：这个框存在的意义正是"看得见、选得中、自己也能复制走"，
      // 加了 disabled 就既不可聚焦也选不中，键盘用户的 Ctrl/Cmd+C 那条路当场断掉
      'readonly': true,
      // 作者把 label 换成非 <label> 元素时 for 会失效，这条兜住名字
      'aria-labelledby': ids.label,
      'data-state': status,
      'onFocus': (event: FocusEvent) => {
        // 聚焦即全选：读的是这次事件的目标节点，不是 connect 求值期间去查 DOM
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
     * 两套图标都是作者写的内容，组件只按状态决定谁露面：
     * 常挂 + hidden 收起，不卸载——卸载掉的节点作者再也拿不回来。
     * data-copied 在这里表达的是"这个标记属于哪一侧"（调用方声明），
     * 与 root / trigger 上表达当前状态的同名属性不是一回事。
     */
    getIndicatorProps: indicator => normalize.element({
      ...parts.indicator.attrs,
      'data-state': status,
      'data-copied': dataAttr(indicator.copied),
      'hidden': indicator.copied !== copied || undefined,
    }),
  }
}
