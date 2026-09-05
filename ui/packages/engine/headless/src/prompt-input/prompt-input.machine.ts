import type { PromptInputSchema } from './prompt-input.types'
import { setup } from '@xihan-ui/machine'

const { createMachine } = setup<PromptInputSchema>()

// disabled 是状态不是布尔：进入时要复位组合态，且要用显式空转移逐条吃掉根级事件——
// 转移查找会沿祖先链落到根级兜底，不吃掉的话禁用期间照样能提交。
export const promptInputMachine = createMachine({
  name: 'prompt-input',
  context: ({ prop, cell }) => ({
    // cell 收口受控与非受控的取值；empty/editing 状态由 watch 里的 syncValueState 拉齐
    value: cell<string>(() => ({
      value: prop('value'),
      defaultValue: prop('defaultValue') ?? '',
      onChange: value => prop('onValueChange')?.({ value }),
    })),
    isComposing: cell<boolean>(() => ({ defaultValue: false })),
  }),
  // 初值判空与 isValueEmpty 守卫同样使用 trim
  initialState: ({ prop }) => {
    if (prop('disabled'))
      return 'disabled'
    return (prop('value') ?? prop('defaultValue') ?? '').trim() === '' ? 'empty' : 'editing'
  },
  watch: ({ track, prop, context, action }) => {
    track([() => prop('disabled')], () => action(['syncDisabled']))
    // 宿主直接改 value 不经过 VALUE.SET，这里补一次状态同步
    track([context.dep('value')], () => action(['syncValueState']))
  },
  // 组合态、提交与停止挂在根级，disabled 状态里再显式吃掉
  on: {
    'COMPOSITION.START': { actions: ['setComposing'] },
    'COMPOSITION.END': { actions: ['clearComposing'] },
    'STOP': [{ guard: 'isLoading', actions: ['invokeStop'] }],
    // invokeSubmit 排在 clearValue 前面，先读走待清空的值
    'KEY.SUBMIT': [
      { guard: 'canSubmit', target: 'empty', actions: ['invokeSubmit', 'clearValue'] },
    ],
    'SUBMIT': [
      { guard: 'canSubmit', target: 'empty', actions: ['invokeSubmit', 'clearValue'] },
    ],
    'CONTROLLED.DISABLE': { target: 'disabled' },
    'CONTROLLED.ENABLE': [
      { guard: 'isValueEmpty', target: 'empty' },
      { target: 'editing' },
    ],
    'CONTROLLED.VALUE.EMPTY': { target: 'empty' },
    'CONTROLLED.VALUE.FILLED': { target: 'editing' },
  },
  states: {
    empty: {
      on: {
        // 按事件载荷判定，此时 setValue 尚未执行，context 里还是旧值
        'VALUE.SET': [
          { guard: 'isNextValueEmpty', actions: ['setValue'] },
          { target: 'editing', actions: ['setValue'] },
        ],
      },
    },
    editing: {
      on: {
        'VALUE.SET': [
          { guard: 'isNextValueEmpty', target: 'empty', actions: ['setValue'] },
          { actions: ['setValue'] },
        ],
      },
    },
    disabled: {
      // 进入禁用态即复位 isComposing，兜住组合期间被禁用而收不到 compositionend 的情况
      entry: ['clearComposing'],
      // 显式声明空转移，避免事件落到根级的 on 上。
      // CONTROLLED.VALUE.* 这两条尤其不能漏：宿主在同一拍里既置 disabled 又清空 value
      // （提交后最常见的一拍），watch 顺序会把状态从 disabled 拽回 empty，输入框重新可编辑
      on: {
        'COMPOSITION.START': {},
        'COMPOSITION.END': {},
        'STOP': {},
        'KEY.SUBMIT': {},
        'SUBMIT': {},
        'VALUE.SET': {},
        'CONTROLLED.VALUE.EMPTY': {},
        'CONTROLLED.VALUE.FILLED': {},
      },
    },
  },
  implementations: {
    guards: {
      canSubmit: ({ context, prop }) =>
        !prop('loading')
        && !context.get('isComposing')
        && (prop('allowEmptySubmit') === true || context.get('value').trim() !== ''),
      isLoading: ({ prop }) => prop('loading') === true,
      isValueEmpty: ({ context }) => context.get('value').trim() === '',
      // 判定 VALUE.SET 事件载荷里的新值是否为空
      isNextValueEmpty: ({ event }) => {
        const e = event.current()
        return e.type === 'VALUE.SET' && e.value.trim() === ''
      },
    },
    actions: {
      setValue: ({ context, event }) => {
        const e = event.current()
        if (e.type === 'VALUE.SET')
          context.set('value', e.value)
      },
      // 受控时这一笔经 cell 变成 onValueChange，由宿主写回
      clearValue: ({ context, prop }) => {
        if (prop('clearOnSubmit') === false)
          return
        context.set('value', '')
      },
      setComposing: ({ context }) => {
        context.set('isComposing', true)
      },
      clearComposing: ({ context }) => {
        context.set('isComposing', false)
      },
      invokeSubmit: ({ context, prop }) => {
        prop('onSubmit')?.({ value: context.get('value') })
      },
      invokeStop: ({ prop }) => {
        prop('onStop')?.()
      },
      // disabled 为 undefined 与 false 同样发 ENABLE
      syncDisabled: ({ prop, send }) => {
        send(prop('disabled') ? { type: 'CONTROLLED.DISABLE' } : { type: 'CONTROLLED.ENABLE' })
      },
      // 按当前值是否为空，把状态同步到 empty 或 editing
      syncValueState: ({ context, send }) => {
        send(context.get('value').trim() === ''
          ? { type: 'CONTROLLED.VALUE.EMPTY' }
          : { type: 'CONTROLLED.VALUE.FILLED' })
      },
    },
  },
})
