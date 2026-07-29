import type { CheckboxSchema } from './checkbox.types'
import { setup } from '@xihan-ui/machine'

const { createMachine } = setup<CheckboxSchema>()

// 受控（checked 给定）时用户事件只发意图，宿主写回 checked 后由 watch 派发 CONTROLLED.* 回写。
export const checkboxMachine = createMachine({
  name: 'checkbox',
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
