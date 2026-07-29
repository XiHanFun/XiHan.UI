import type { TabsSchema } from './tabs.types'
import { setup } from '@xihan-ui/machine'

const { createMachine } = setup<TabsSchema>()

// 选中值住在 context 的 cell 里，受控/非受控在 cell 收口，不需要影子事件与受控守卫。
export const tabsMachine = createMachine({
  name: 'tabs',
  context: ({ prop, cell }) => ({
    value: cell<string | null>(() => ({
      value: prop('value'),
      defaultValue: prop('defaultValue') ?? null,
      onChange: value => prop('onValueChange')?.({ value }),
    })),
    // 焦点锚点：不受控、不对外通知，只服务 roving tabindex 与方向键起点
    focusedValue: cell<string | null>(() => ({ defaultValue: null })),
  }),
  initialState: () => 'idle',
  states: {
    idle: {
      // 省略 target：只跑 actions，不换状态
      on: {
        'VALUE.SET': { actions: ['setValue'] },
        'TRIGGER.SELECT': { actions: ['setValue', 'setFocusedValue'] },
        'TRIGGER.FOCUS': { actions: ['setFocusedValue'] },
        // automatic 下方向键顺带切换选中，manual 下只搬焦点锚点
        'TRIGGER.NAVIGATE': [
          { guard: 'isAutomatic', actions: ['setValue', 'setFocusedValue'] },
          { actions: ['setFocusedValue'] },
        ],
        'LIST.BLUR': { actions: ['clearFocusedValue'] },
      },
    },
  },
  implementations: {
    guards: {
      isAutomatic: ({ prop }) => (prop('activationMode') ?? 'automatic') === 'automatic',
    },
    actions: {
      setValue: ({ context, event }) => {
        const e = event.current()
        if (e.type === 'VALUE.SET' || e.type === 'TRIGGER.SELECT' || e.type === 'TRIGGER.NAVIGATE')
          context.set('value', e.value)
      },
      setFocusedValue: ({ context, event }) => {
        const e = event.current()
        if (e.type === 'TRIGGER.SELECT' || e.type === 'TRIGGER.FOCUS' || e.type === 'TRIGGER.NAVIGATE')
          context.set('focusedValue', e.value)
      },
      clearFocusedValue: ({ context }) => context.set('focusedValue', null),
    },
  },
})
