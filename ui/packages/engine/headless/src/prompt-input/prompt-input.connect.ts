import type { NormalizeProps, PropTypes } from '@xihan-ui/kernel'
import type { Service } from '@xihan-ui/machine'
import type { PromptInputApi, PromptInputSchema } from './prompt-input.types'
import { dataAttr, isComposingEvent } from '@xihan-ui/kernel'
import { promptInputAnatomy } from './prompt-input.anatomy'

const parts = promptInputAnatomy.build()

export function connectPromptInput<T extends PropTypes>(
  service: Service<PromptInputSchema>,
  normalize: NormalizeProps<T>,
): PromptInputApi<T> {
  const { state, prop, send, context } = service

  const value = context.get('value')
  const isComposing = context.get('isComposing')
  const disabled = state.matches('disabled')
  const busy = prop('busy') === true
  const submitKey = prop('submitKey') ?? 'enter'
  const allowEmptySubmit = prop('allowEmptySubmit') === true
  const translations = prop('translations')

  /**
   * 比机器守卫多一条「非禁用」：守卫管事件放不放行，这一份管按钮长什么样。
   * 两处必须一起改，否则会出现「按钮亮着但按不动」。
   */
  const canSubmit = !disabled && !busy && !isComposing && (allowEmptySubmit || value.trim() !== '')

  return {
    value,
    isComposing,
    canSubmit,
    busy,
    disabled,
    setValue: next => send({ type: 'VALUE.SET', value: next }),
    submit: () => send({ type: 'SUBMIT' }),
    stop: () => send({ type: 'STOP' }),

    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      'data-disabled': dataAttr(disabled),
      'data-busy': dataAttr(busy),
      'data-variant': prop('variant'),
      'data-tone': prop('tone'),
      'data-size': prop('size'),
    }),

    getInputProps: () => normalize.textarea({
      ...parts.input.attrs,
      // 用原生 disabled 属性，同时挡住聚焦与输入
      'disabled': disabled || undefined,
      // 只在作者给了文案时才发：无条件发会盖掉他自己的 <label for> 与 aria-label
      'aria-label': translations?.input,
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
        // 同一个输入框上叠了别的处理器且它已经处理过，就让位。
        // mergeProps 对 onXxx 是顺序链式组合，前一个 preventDefault 挡不住后一个，
        // 这条判断写在这里，作者不必再包一层
        if (event.defaultPrevented)
          return
        // 组合期间的 Enter 是在确认候选词，不提交也不 preventDefault
        if (isComposingEvent(event))
          return
        if (event.key !== 'Enter')
          return
        // Shift+Enter 恒为换行
        if (event.shiftKey)
          return
        const mod = event.ctrlKey || event.metaKey
        // enter 档：裸 Enter 与 Mod+Enter 都提交；mod-enter 档：只有 Mod+Enter 提交
        if (submitKey === 'mod-enter' && !mod)
          return
        // 阻止浏览器插入换行
        event.preventDefault()
        // 按住不放会连发 keydown，一次按压只提交一次；键照样吞掉，只是不重复执行
        if (event.repeat)
          return
        send({ type: 'KEY.SUBMIT' })
      },
    }),

    getSubmitTriggerProps: () => normalize.button({
      ...parts['submit-trigger'].attrs,
      'type': 'button',
      // 同一颗按钮按 busy 在发送与停止两种身份间切换
      'data-mode': busy ? 'stop' : 'send',
      'aria-label': busy ? (translations?.stop ?? 'Stop generating') : (translations?.send ?? 'Send'),
      // 生成期间恒可用，此刻按钮的语义是停止
      'disabled': (!busy && !canSubmit) || undefined,
      'onClick': () => {
        send(busy ? { type: 'STOP' } : { type: 'SUBMIT' })
      },
    }),
  }
}
