import type { NormalizeProps, PropTypes } from '@xihan-ui/core'
import type { Service } from '@xihan-ui/machine'
import type { ComposerApi, ComposerSchema } from './composer.types'
import { dataAttr } from '@xihan-ui/core'
import { composerAnatomy } from './composer.anatomy'

const parts = composerAnatomy.build()

export function connectComposer<T extends PropTypes>(
  service: Service<ComposerSchema>,
  normalize: NormalizeProps<T>,
): ComposerApi<T> {
  const { state, prop, send, context } = service

  const value = context.get('value')
  const isComposing = context.get('isComposing')
  const disabled = state.matches('disabled')
  const runStatus = prop('runStatus') ?? 'ready'
  const streaming = runStatus === 'streaming'
  const submitOnEnter = prop('submitOnEnter') ?? true
  const translations = prop('translations')

  // 在机器守卫之外额外要求非 disabled，供按钮判断是否置灰
  const canSubmit = !disabled && !streaming && !isComposing && value.trim() !== ''

  return {
    value,
    isComposing,
    canSubmit,
    streaming,
    disabled,
    setValue: next => send({ type: 'VALUE.SET', value: next }),
    submit: () => send({ type: 'SUBMIT' }),
    stop: () => send({ type: 'STOP' }),

    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      'data-disabled': dataAttr(disabled),
      'data-status': runStatus,
    }),

    getInputProps: () => normalize.textarea({
      ...parts.input.attrs,
      // 用原生 disabled 属性，同时挡住聚焦与输入
      'disabled': disabled || undefined,
      'aria-label': translations?.input ?? 'Message',
      'data-state': state.get(),
      'value': value,
      'onInput': (event: Event) => {
        send({ type: 'VALUE.SET', value: (event.target as HTMLTextAreaElement).value })
      },
      'onCompositionStart': () => {
        send({ type: 'COMPOSITION.START' })
      },
      'onCompositionEnd': () => {
        send({ type: 'COMPOSITION.END' })
      },
      'onKeyDown': (event: KeyboardEvent) => {
        // IME 组合态不提交，keyCode 229 兼容不上报 isComposing 的输入法
        if (event.isComposing || event.keyCode === 229)
          return
        // 非 Enter、Shift+Enter 与关掉 submitOnEnter 时原样放行
        if (event.key !== 'Enter' || event.shiftKey || !submitOnEnter)
          return
        // 阻止浏览器插入换行
        event.preventDefault()
        send({ type: 'KEY.ENTER' })
      },
    }),

    getSubmitTriggerProps: () => normalize.button({
      ...parts['submit-trigger'].attrs,
      'type': 'button',
      // 同一个按钮按 runStatus 在发送与停止两种身份间切换
      'data-mode': streaming ? 'stop' : 'send',
      'aria-label': streaming ? (translations?.stop ?? 'Stop generating') : (translations?.send ?? 'Send'),
      // 流式期间恒可用，此时按钮的语义是停止
      'disabled': (!streaming && !canSubmit) || undefined,
      'onClick': () => {
        send(streaming ? { type: 'STOP' } : { type: 'SUBMIT' })
      },
    }),
  }
}
