import type { CheckboxSchema } from './checkbox.types'
import { setup } from '@xihan-ui/core'

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
  // 表单重置从三个状态都要认，所以挂根级。状态就是值，回落靠转移而不是写 context：
  // 受控时只发意图（第一条命中即止），非受控才真的转过去
  on: {
    'FORM.RESET': [
      { guard: 'isCheckedControlled', actions: ['invokeReset'] },
      { guard: 'defaultsToIndeterminate', target: 'indeterminate', actions: ['invokeReset'] },
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
      defaultsToIndeterminate: ({ prop }) => prop('defaultChecked') === 'indeterminate',
      defaultsToChecked: ({ prop }) => prop('defaultChecked') === true,
    },
    actions: {
      invokeOnCheck: ({ prop }) => prop('onCheckedChange')?.({ checked: true }),
      invokeOnUncheck: ({ prop }) => prop('onCheckedChange')?.({ checked: false }),
      // 受控且宿主没声明 defaultChecked 时不发：那句兜底的 off 是组件的空值、不是宿主说过的默认值
      invokeReset: ({ prop, state }) => {
        if (prop('checked') !== undefined && prop('defaultChecked') === undefined)
          return
        const next = initialFrom(prop('defaultChecked'))
        // 已经停在默认态就不白发一次：原生重置也不会为没变的控件派事件
        if (state.matches(next))
          return
        // 回落点是半选时不通知：onCheckedChange 的载荷刻意只有布尔，表达不了半选。
        // 状态照常转过去，屏幕是对的；受控且默认半选的组合因此拿不到重置，这是已知限制
        if (next === 'indeterminate')
          return
        prop('onCheckedChange')?.({ checked: next === 'on' })
      },
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
