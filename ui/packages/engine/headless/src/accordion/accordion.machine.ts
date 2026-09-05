import type { AccordionSchema } from './accordion.types'
import { setup } from '@xihan-ui/core'

const { createMachine } = setup<AccordionSchema>()

export const accordionMachine = createMachine({
  name: 'accordion',
  context: ({ prop, cell }) => ({
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
          // collapsible=false 时最后一个展开项不许收起
          if (!prop('collapsible') && current.length <= 1)
            return
          context.set('value', current.filter(v => v !== e.value))
          return
        }
        // multiple=false 时展开一项即收起其余
        context.set('value', prop('multiple') ? [...current, e.value] : [e.value])
      },
      setValue: ({ context, prop, event }) => {
        const e = event.current()
        if (e.type !== 'VALUE.SET')
          return
        // 与 toggleItem 相同的 multiple / collapsible 约束
        const next = prop('multiple') ? [...e.value] : e.value.slice(0, 1)
        if (!next.length && !prop('collapsible'))
          return
        context.set('value', next)
      },
    },
  },
})
