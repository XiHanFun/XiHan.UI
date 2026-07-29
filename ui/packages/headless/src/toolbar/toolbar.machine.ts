import type { ToolbarSchema } from './toolbar.types'
import { setup } from '@xihan-ui/machine'

const { createMachine } = setup<ToolbarSchema>()

// 工具条没有自己的值，条目的按下态、选中值、展开态都归条目自己。
// 机器只记焦点当下停在哪个条目上，它同时是 roving tabindex 的锚点与方向键的起点。
// 锚点不受控、不对外通知，只有一个状态，transition 省略 target 即只跑 actions。
export const toolbarMachine = createMachine({
  name: 'toolbar',
  context: ({ cell }) => ({
    focusedValue: cell<string | null>(() => ({ defaultValue: null })),
  }),
  initialState: () => 'idle',
  states: {
    idle: {
      on: {
        'ITEM.FOCUS': { actions: ['setFocusedValue'] },
        'TOOLBAR.BLUR': { actions: ['clearFocusedValue'] },
      },
    },
  },
  implementations: {
    actions: {
      setFocusedValue: ({ context, event }) => {
        const e = event.current()
        if (e.type === 'ITEM.FOCUS')
          context.set('focusedValue', e.value)
      },
      // 焦点离场即清锚点，root 据此重新认领 Tab 位
      clearFocusedValue: ({ context }) => context.set('focusedValue', null),
    },
  },
})
