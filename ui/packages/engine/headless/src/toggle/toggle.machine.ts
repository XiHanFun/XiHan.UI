import type { ToggleSchema } from './toggle.types'
import { setup } from '@xihan-ui/machine'

const { createMachine } = setup<ToggleSchema>()

// 受控（pressed 给定）时用户事件只发意图、不自改状态；宿主写回 pressed 后
// 由 watch 派发影子事件 CONTROLLED.* 无条件回写。无副作用。
export const toggleMachine = createMachine({
  name: 'toggle',
  initialState: ({ prop }) => ((prop('pressed') ?? prop('defaultPressed')) ? 'on' : 'off'),
  watch: ({ track, prop, action }) => track([() => prop('pressed')], () => action(['syncPressed'])),
  states: {
    off: {
      on: {
        'TOGGLE': [
          { guard: 'isPressedControlled', actions: ['invokeOnPress'] },
          { target: 'on', actions: ['invokeOnPress'] },
        ],
        'CONTROLLED.ON': { target: 'on' },
      },
    },
    on: {
      on: {
        'TOGGLE': [
          { guard: 'isPressedControlled', actions: ['invokeOnUnpress'] },
          { target: 'off', actions: ['invokeOnUnpress'] },
        ],
        'CONTROLLED.OFF': { target: 'off' },
      },
    },
  },
  implementations: {
    guards: {
      isPressedControlled: ({ prop }) => prop('pressed') !== undefined,
    },
    actions: {
      invokeOnPress: ({ prop }) => prop('onPressedChange')?.({ pressed: true }),
      invokeOnUnpress: ({ prop }) => prop('onPressedChange')?.({ pressed: false }),
      syncPressed: ({ prop, send }) => {
        const pressed = prop('pressed')
        if (pressed === undefined)
          return
        send(pressed ? { type: 'CONTROLLED.ON' } : { type: 'CONTROLLED.OFF' })
      },
    },
  },
})
