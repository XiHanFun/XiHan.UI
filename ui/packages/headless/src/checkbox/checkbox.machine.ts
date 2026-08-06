import type { CheckboxSchema } from './checkbox.types'
import { setup } from '@xihan-ui/machine'

const { createMachine } = setup<CheckboxSchema>()

/** 三态的初值：'indeterminate' 单独一档，其余按真假分。 */
function initialFrom(checked: boolean | 'indeterminate' | undefined): 'off' | 'on' | 'indeterminate' {
  if (checked === 'indeterminate')
    return 'indeterminate'
  return checked ? 'on' : 'off'
}

// 受控（checked 给定）时用户事件只发意图，宿主写回 checked 后由 watch 派发 CONTROLLED.* 回写。
export const checkboxMachine = createMachine({
  name: 'checkbox',
  initialState: ({ prop }) => initialFrom(prop('checked') ?? prop('defaultChecked')),
  watch: ({ track, prop, action }) => track([() => prop('checked')], () => action(['syncChecked'])),
  states: {
    off: {
      on: {
        'TOGGLE': [
          { guard: 'isCheckedControlled', actions: ['invokeOnCheck'] },
          { target: 'on', actions: ['invokeOnCheck'] },
        ],
        'CHECK': [
          { guard: 'isCheckedControlled', actions: ['invokeOnCheck'] },
          { target: 'on', actions: ['invokeOnCheck'] },
        ],
        'CONTROLLED.ON': { target: 'on' },
        'CONTROLLED.INDETERMINATE': { target: 'indeterminate' },
      },
    },
    on: {
      on: {
        'TOGGLE': [
          { guard: 'isCheckedControlled', actions: ['invokeOnUncheck'] },
          { target: 'off', actions: ['invokeOnUncheck'] },
        ],
        'UNCHECK': [
          { guard: 'isCheckedControlled', actions: ['invokeOnUncheck'] },
          { target: 'off', actions: ['invokeOnUncheck'] },
        ],
        'CONTROLLED.OFF': { target: 'off' },
        'CONTROLLED.INDETERMINATE': { target: 'indeterminate' },
      },
    },
    // 半选：点击走向全选（APG 的父项约定），命令式设值两个方向都认
    indeterminate: {
      on: {
        'TOGGLE': [
          { guard: 'isCheckedControlled', actions: ['invokeOnCheck'] },
          { target: 'on', actions: ['invokeOnCheck'] },
        ],
        'CHECK': [
          { guard: 'isCheckedControlled', actions: ['invokeOnCheck'] },
          { target: 'on', actions: ['invokeOnCheck'] },
        ],
        'UNCHECK': [
          { guard: 'isCheckedControlled', actions: ['invokeOnUncheck'] },
          { target: 'off', actions: ['invokeOnUncheck'] },
        ],
        'CONTROLLED.ON': { target: 'on' },
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
        if (checked === 'indeterminate') {
          send({ type: 'CONTROLLED.INDETERMINATE' })
          return
        }
        send(checked ? { type: 'CONTROLLED.ON' } : { type: 'CONTROLLED.OFF' })
      },
    },
  },
})
