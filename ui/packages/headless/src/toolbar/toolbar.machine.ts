import type { ToolbarSchema } from './toolbar.types'
import { setup } from '@xihan-ui/machine'

const { createMachine } = setup<ToolbarSchema>()

// 工具条没有任何自己的值：条目的按下态、选中值、展开态都归条目自己。
// 机器只记一件事——焦点当下停在哪个条目上，它同时是 roving tabindex 的锚点
// 与方向键的起点。锚点不受控、不对外通知，因此不需要 cell 的受控收口，
// 更不需要影子事件与受控守卫。只有一个状态，transition 省略 target 即只跑 actions。
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
      // 焦点离场即清锚点：root 据此重新认领 Tab 位，下次 Tab 才进得来
      clearFocusedValue: ({ context }) => context.set('focusedValue', null),
    },
  },
})
