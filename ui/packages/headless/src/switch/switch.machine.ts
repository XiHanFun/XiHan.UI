import type { SwitchSchema } from './switch.types'
import { setup } from '@xihan-ui/machine'

const { createMachine } = setup<SwitchSchema>()

// 受控（checked 给定）与 dialog 同构：用户事件只发意图、不自改状态；宿主写回 checked 后
// 由 watch 派发影子事件 CONTROLLED.* 无条件回写。无副作用（switch 不挂 DOM effect）。
export const switchMachine = createMachine({
  name: 'switch',
  initialState: ({ prop }) => ((prop('checked') ?? prop('defaultChecked')) ? 'on' : 'off'),
  watch: ({ track, prop, action }) => track([() => prop('checked')], () => action(['syncChecked'])),
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
    },
    actions: {
      invokeOnCheck: ({ prop }) => prop('onCheckedChange')?.({ checked: true }),
      invokeOnUncheck: ({ prop }) => prop('onCheckedChange')?.({ checked: false }),
      syncChecked: ({ prop, send }) => {
        const checked = prop('checked')
        if (checked === undefined)
          return
        send(checked ? { type: 'CONTROLLED.ON' } : { type: 'CONTROLLED.OFF' })
      },
    },
  },
})
