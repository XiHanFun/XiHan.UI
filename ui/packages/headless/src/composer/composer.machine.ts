import type { ComposerSchema } from './composer.types'
import { setup } from '@xihan-ui/machine'

const { createMachine } = setup<ComposerSchema>()

export const composerMachine = createMachine({
  name: 'composer',
  context: ({ prop, cell }) => ({
    // 值住在 cell 里：受控（给了 value）与非受控的收口点就是它。
    // 但 cell 只管值本身，empty/editing 是编进 FSM 的状态——宿主直接改 value 时
    // 不经过 VALUE.SET，得靠下面 watch 里那条 track 派发影子事件把状态拉齐
    value: cell<string>(() => ({
      value: prop('value'),
      defaultValue: prop('defaultValue') ?? '',
      onChange: value => prop('onValueChange')?.({ value }),
    })),
    isComposing: cell<boolean>(() => ({ defaultValue: false })),
  }),
  // 初值用 trim 判空，与 isValueEmpty 守卫同一把尺子：
  // 两处不一致的话，一个只含空格的 defaultValue 会让「禁用再启用」跳到跟初始不同的状态
  initialState: ({ prop }) => {
    if (prop('disabled'))
      return 'disabled'
    return (prop('value') ?? prop('defaultValue') ?? '').trim() === '' ? 'empty' : 'editing'
  },
  watch: ({ track, prop, context, action }) => {
    track([() => prop('disabled')], () => action(['syncDisabled']))
    // 受控时宿主直接改 value 不经过 VALUE.SET（恢复草稿、点一条建议提示词都是这样），
    // 不跟着同步的话 empty/editing 会与实际值脱节：框里明明有字，机器还停在 empty
    track([context.dep('value')], () => action(['syncValueState']))
  },
  // 组合态、停止、提交都跟当前是空是满无关，挂在根级；disabled 状态里再显式吃掉它们。
  // 提交尤其不能只挂在 editing 上：受控且宿主不写回时 value 压根没变过，
  // 机器一直停在 empty，于是按钮亮着却怎么点都不发
  on: {
    'COMPOSITION.START': { actions: ['setComposing'] },
    'COMPOSITION.END': { actions: ['clearComposing'] },
    'STOP': [{ guard: 'isStreaming', actions: ['invokeStop'] }],
    // invokeSubmit 必须排在 clearValue 前面：它要读走的正是即将被清掉的那个值。
    // canSubmit 里已经含了非空判断，空态不会误发
    'KEY.ENTER': [
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
        // 判定要看事件载荷而不是 context：setValue 还没跑，context 里躺的是上一次的值
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
      // 组合期间被禁用时，compositionend 要么被下面的空转移吃掉、要么浏览器压根不发，
      // isComposing 会永久停在 true，把 canSubmit 连同所有提交路径一起锁死。
      // 复位写在 entry 而不是 COMPOSITION.END 的转移上，才兜得住"根本没有 end 事件"那一路
      entry: ['clearComposing'],
      // 显式写成空转移把事件吃掉，而不是靠"不声明"：不声明会一路落到根级的 on，
      // 于是禁用态下点停止照样能停、按回车照样能发、输入法照样能改 isComposing
      on: {
        'COMPOSITION.START': {},
        'COMPOSITION.END': {},
        'STOP': {},
        'KEY.ENTER': {},
        'SUBMIT': {},
        'CONTROLLED.VALUE.EMPTY': {},
        'CONTROLLED.VALUE.FILLED': {},
      },
    },
  },
  implementations: {
    guards: {
      canSubmit: ({ context, prop }) =>
        context.get('value').trim() !== ''
        && !context.get('isComposing')
        && (prop('runStatus') ?? 'ready') === 'ready',
      isStreaming: ({ prop }) => prop('runStatus') === 'streaming',
      isValueEmpty: ({ context }) => context.get('value').trim() === '',
      // 读事件不读 context：VALUE.SET 的目标状态取决于用户刚敲出来的那个值
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
      // 受控时这一笔经 cell 走成 onValueChange，由宿主自己把值清掉
      clearValue: ({ context }) => {
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
      // 与 collapsible 的 syncOpen 差一处：那边 open 变回 undefined 是「转非受控」故按兵不动，
      // 这边 disabled 没给就等于没禁用，undefined 与 false 一样发 ENABLE
      syncDisabled: ({ prop, send }) => {
        send(prop('disabled') ? { type: 'CONTROLLED.DISABLE' } : { type: 'CONTROLLED.ENABLE' })
      },
      // 值变了但不是走 VALUE.SET 来的（受控回写），状态得自己追上去
      syncValueState: ({ context, send }) => {
        send(context.get('value').trim() === ''
          ? { type: 'CONTROLLED.VALUE.EMPTY' }
          : { type: 'CONTROLLED.VALUE.FILLED' })
      },
    },
  },
})
