import type { CheckboxGroupSchema } from './checkbox-group.types'
import { resetDeclaredValue, setup } from '@xihan-ui/machine'

const { createMachine } = setup<CheckboxGroupSchema>()

/** 翻转单个值；新值按点击先后追加，不按声明顺序重排。 */
export function toggleItemValue(list: readonly string[], value: string): string[] {
  return list.includes(value) ? list.filter(v => v !== value) : [...list, value]
}

/**
 * 全选/全不选，判据只看传进来的这批值：这批值一个不落都在选中集合里即"已全选"。
 * 清空时只摘掉这批值，保留其它已选项。
 */
export function toggleAllValues(list: readonly string[], values: readonly string[]): string[] {
  if (values.length === 0)
    return [...list]
  const all = values.every(v => list.includes(v))
  if (all)
    return list.filter(v => !values.includes(v))
  return [...list, ...values.filter(v => !list.includes(v))]
}

// 选中集合住在 context 的 cell 里，不编码进状态：cell 本身就是受控/非受控的收口点
// （value prop 给定即受控，读直取 prop，写只发 onValueChange 不落内部值），
// 因此不需要影子事件与受控守卫。机器只有一个状态，逻辑全在 context + actions。
export const checkboxGroupMachine = createMachine({
  name: 'checkbox-group',
  context: ({ prop, cell }) => ({
    value: cell<string[]>(() => ({
      value: prop('value'),
      defaultValue: prop('defaultValue') ?? [],
      // 每次翻转都产出新数组，默认的 Object.is 会把"内容没变"也判成变了，
      // 于是受控父组件写回一份等价数组就会多派一次 onValueChange
      isEqual: (a, b) => Array.isArray(b) && a.length === b.length && a.every((v, i) => v === b[i]),
      // 通知必须挂在 cell 上：受控时 set 不写内部值，只有这条回调能把用户意图送出去
      onChange: value => prop('onValueChange')?.({ value }),
    })),
  }),
  initialState: () => 'idle',
  // 表单重置从任何状态都要认，所以挂根级。不设禁用/只读守卫：原生表单的重置算法
  // 不看这两个标志，禁用的字段一样回落点；要拦是表单那侧 preventDefault 的事
  on: {
    'FORM.RESET': { actions: ['resetToDefault'] },
  },
  states: {
    idle: {
      // 省略 target：只跑 actions，不换状态
      on: {
        // VALUE.SET 是程序化入口（api.setValue），不挂 editable：
        // readOnly 说的是"用户改不动"，不是"代码也改不动"——受控父组件写回值走的正是这条
        'VALUE.SET': { actions: ['setValue'] },
        'ITEM.TOGGLE': { guard: 'editable', actions: ['toggleItem'] },
        'ALL.TOGGLE': { guard: 'editable', actions: ['toggleAll'] },
      },
    },
  },
  implementations: {
    guards: {
      // 整组层面的闸门。单个条目自己的 disabled 只有作者声明得出来，机器看不见，
      // 那一层由 connect 在派事件前拦掉
      editable: ({ prop }) => !prop('disabled') && !prop('readOnly'),
    },
    actions: {
      resetToDefault: params => void resetDeclaredValue(params, 'value', 'value', 'defaultValue'),

      setValue: ({ context, event }) => {
        const e = event.current()
        if (e.type === 'VALUE.SET')
          context.set('value', [...e.value])
      },
      toggleItem: ({ context, event }) => {
        const e = event.current()
        if (e.type === 'ITEM.TOGGLE')
          context.set('value', toggleItemValue(context.get('value'), e.value))
      },
      toggleAll: ({ context, event }) => {
        const e = event.current()
        if (e.type === 'ALL.TOGGLE')
          context.set('value', toggleAllValues(context.get('value'), e.values))
      },
    },
  },
})
