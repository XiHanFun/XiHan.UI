import type { SwitchSchema } from './switch.types'
import { setup } from '@xihan-ui/core'

const { createMachine } = setup<SwitchSchema>()

// 受控（checked 给定）与 dialog 同构：用户事件只发意图、不自改状态；宿主写回 checked 后
// 由 watch 派发影子事件 CONTROLLED.* 无条件回写。无副作用（switch 不挂 DOM effect）。
export const switchMachine = createMachine({
  name: 'switch',
  initialState: ({ prop }) => ((prop('checked') ?? prop('defaultChecked')) ? 'on' : 'off'),
  watch: ({ track, prop, action }) => track([() => prop('checked')], () => action(['syncChecked'])),
  // 表单重置从两个状态都要认，所以挂根级。状态就是值，回落靠转移而不是写 context：
  // 受控时只发意图（前两条命中即止），非受控才真的转过去
  on: {
    'FORM.RESET': [
      { guard: 'isCheckedControlled', actions: ['invokeReset'] },
      { guard: 'defaultsToChecked', target: 'on', actions: ['invokeReset'] },
      { target: 'off', actions: ['invokeReset'] },
    ],
  },
  states: {
    off: {
      on: {
        'TOGGLE': [
          { guard: 'isCheckedControlled', actions: ['invokeOnCheck'] },
          { target: 'on', actions: ['invokeOnCheck'] },
        ],
        'CONTROLLED.ON': { target: 'on' },
      },
    },
    on: {
      on: {
        'TOGGLE': [
          { guard: 'isCheckedControlled', actions: ['invokeOnUncheck'] },
          { target: 'off', actions: ['invokeOnUncheck'] },
        ],
        'CONTROLLED.OFF': { target: 'off' },
      },
    },
  },
  implementations: {
    guards: {
      isCheckedControlled: ({ prop }) => prop('checked') !== undefined,
      defaultsToChecked: ({ prop }) => !!prop('defaultChecked'),
    },
    actions: {
      invokeOnCheck: ({ prop }) => prop('onCheckedChange')?.({ checked: true }),
      invokeOnUncheck: ({ prop }) => prop('onCheckedChange')?.({ checked: false }),
      // 受控且宿主没声明 defaultChecked 时不发：那句兜底的 false 是组件的空值、不是宿主说过的默认值
      invokeReset: ({ prop, state }) => {
        if (prop('checked') !== undefined && prop('defaultChecked') === undefined)
          return
        const next = !!prop('defaultChecked')
        // 已经停在默认态就不白发一次：原生重置也不会为没变的控件派事件
        if (state.matches(next ? 'on' : 'off'))
          return
        prop('onCheckedChange')?.({ checked: next })
      },
      syncChecked: ({ prop, send }) => {
        const checked = prop('checked')
        if (checked === undefined)
          return
        send(checked ? { type: 'CONTROLLED.ON' } : { type: 'CONTROLLED.OFF' })
      },
    },
  },
})
