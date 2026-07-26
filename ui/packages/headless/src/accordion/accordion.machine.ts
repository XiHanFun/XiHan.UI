import type { AccordionSchema } from './accordion.types'
import { setup } from '@xihan-ui/machine'

const { createMachine } = setup<AccordionSchema>()

// 展开集合住在 context 的 cell 里，不编码进 FSM 状态：cell 本身就是受控开关
// （value 给定时读直接走 prop、写只发 onValueChange），因此不需要影子事件与守卫对。
// 机器只有一个状态，transition 省略 target 即只跑 actions、不换状态。
export const accordionMachine = createMachine({
  name: 'accordion',
  context: ({ prop, cell }) => ({
    // 显式实参：value 可为 undefined，交给推断会把它并进 cell 的值类型
    value: cell<string[]>(() => ({
      value: prop('value'),
      defaultValue: prop('defaultValue') ?? [],
      onChange: value => prop('onValueChange')?.({ value }),
    })),
  }),
  initialState: () => 'idle',
  states: {
    idle: {
      on: {
        'ITEM.TOGGLE': { actions: ['toggleItem'] },
        'VALUE.SET': { actions: ['setValue'] },
      },
    },
  },
  implementations: {
    actions: {
      toggleItem: ({ context, prop, event }) => {
        const e = event.current()
        if (e.type !== 'ITEM.TOGGLE')
          return
        const current = context.get('value')
        if (current.includes(e.value)) {
          // collapsible=false 时最后一个展开项不许收起，面板恒有内容
          if (!prop('collapsible') && current.length <= 1)
            return
          context.set('value', current.filter(v => v !== e.value))
          return
        }
        // multiple=false 时展开一项即收起其余，集合恒为长度 1
        context.set('value', prop('multiple') ? [...current, e.value] : [e.value])
      },
      setValue: ({ context, event }) => {
        const e = event.current()
        if (e.type !== 'VALUE.SET')
          return
        context.set('value', [...e.value])
      },
    },
  },
})
