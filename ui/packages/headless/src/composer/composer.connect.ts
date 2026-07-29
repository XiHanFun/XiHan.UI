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

  // 比机器里的 canSubmit 多算一条 !disabled。机器不需要它——禁用态把 SUBMIT/KEY.ENTER
  // 显式吃掉了；但按钮得先知道自己该不该置灰，否则禁用态下它看着能按，按下去却什么都不发生
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
      // textarea 是单体控件，用原生 disabled（与 text-field / switch 同）：
      // 只留 data-disabled 的话禁用态就只是样式，读屏照念、键盘照聚焦，敲进去的字却进不了状态
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
        // IME 守卫必须排在最前面，这是本组件最容易翻车的一处：
        // 拼音候选框里按回车是"确认选词"，那一下 keydown 照样冒到这里，漏判就等于用户
        // 每选一次词就把半截话发出去。isComposing 是标准字段；keyCode 229 是它在旧 WebKit
        // 与部分安卓输入法上的等价物，两条都得判，只判一条总有一类输入法漏网。
        // compositionstart/end 维护的 context.isComposing 是同一件事的另一条腿：
        // 它管住 canSubmit（点按钮那一路），这里管住键盘那一路
        if (event.isComposing || event.keyCode === 229)
          return
        // Shift+Enter 一律原样放行：换行交给浏览器插，组件不接管。
        // 自己接管就得连光标位置、撤销栈、选区替换一起重做，没有一处能做得比原生准
        if (event.key !== 'Enter' || event.shiftKey || !submitOnEnter)
          return
        // 拦下浏览器把 Enter 当换行的默认动作，免得提交完还在框里留下一个空行
        event.preventDefault()
        send({ type: 'KEY.ENTER' })
      },
    }),

    getSubmitTriggerProps: () => normalize.button({
      ...parts['submit-trigger'].attrs,
      'type': 'button',
      // 同一个按钮原位换身份：皮肤按 data-mode 换图标，读屏按 aria-label 换叫法，
      // DOM 位置一动不动，正在按它的用户不会按空
      'data-mode': streaming ? 'stop' : 'send',
      'aria-label': streaming ? (translations?.stop ?? 'Stop generating') : (translations?.send ?? 'Send'),
      // 流式期间恒为可用：此刻它是"停止"，能不能按跟输入框里有没有字没关系
      'disabled': (!streaming && !canSubmit) || undefined,
      'onClick': () => {
        send(streaming ? { type: 'STOP' } : { type: 'SUBMIT' })
      },
    }),
  }
}
