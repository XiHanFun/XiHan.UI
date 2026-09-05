import type { NormalizeProps, PropTypes, Service } from '@xihan-ui/core'
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
  const disabled = !!prop('disabled')
  const translations = prop('translations')
  // 播报区只在成功那一档有话说；平时是空串，读屏不会念一段旧文案
  const announcement = copied ? (translations?.copied ?? 'Copied') : ''

  return {
    status,
    disabled,
    announcement,
    copied,
    value,
    copy: () => send({ type: 'COPY.TRIGGER' }),

    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      // 三个视觉轴落在根上，复制按钮沿继承流取值
      'data-variant': prop('variant'),
      'data-tone': prop('tone'),
      'data-size': prop('size'),
      'data-state': status,
      'data-copied': dataAttr(copied),
      'data-disabled': dataAttr(disabled),
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

    getCopyTriggerProps: () => normalize.button({
      ...parts['copy-trigger'].attrs,
      // 不给 type 会在 form 里变成 submit，Enter 直接提交表单
      'type': 'button',
      // 单体原生控件用原生 disabled：它本就不该被聚焦，也不该派 click
      'disabled': disabled || undefined,
      // 按钮里只放一个图标时没有可见文字，可及名字只能由这里给。
      // 不给缺省值：按钮上多半写着可见的「复制」，凭空盖一个名字会让读屏念的与屏上写的对不上
      'aria-label': translations?.copy,
      'data-state': status,
      'data-copied': dataAttr(copied),
      'data-disabled': dataAttr(disabled),
      'onClick': () => send({ type: 'COPY.TRIGGER' }),
    }),

    /**
     * 两侧指示器常挂 + hidden 收起，不卸载。
     * 这里的 data-copied 是调用方声明的所属侧，与 root / trigger 上表示当前状态的同名属性不同义。
     */
    getIndicatorProps: indicator => normalize.element({
      ...parts.indicator.attrs,
      // 不发 aria-hidden：解剖里没有单独的 label，钮上写的字就装在这里，
      // 藏起来等于把按钮的可及名一起藏掉
      'data-state': status,
      'data-copied': dataAttr(indicator.copied),
      'hidden': indicator.copied !== copied || undefined,
    }),

    // 复制成功的文字回执：换色与换图标读屏都拿不到，这一处是唯一的通道
    getStatusProps: () => normalize.element({
      ...parts.status.attrs,
      'role': 'status',
      'aria-live': 'polite',
      'aria-atomic': 'true',
      'data-state': status,
    }),
  }
}
