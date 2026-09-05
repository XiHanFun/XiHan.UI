import type { StickToBottomHandle } from '@xihan-ui/core'
import type { LogSchema } from './log.types'
import { createStickToBottom, setup } from '@xihan-ui/core'

const { createMachine } = setup<LogSchema>()

export const logMachine = createMachine({
  name: 'log',
  context: ({ cell }) => ({
    // 初值为在底且粘附，真实几何由句柄的第一次回报补上
    atBottom: cell<boolean>(() => ({ defaultValue: true })),
    sticking: cell<boolean>(() => ({ defaultValue: true })),
  }),
  refs: () => ({
    config: null,
    getViewportEl: () => null,
    getContentEl: () => null,
    stick: null,
  }),
  initialState: () => 'idle',
  // 粘底副作用全程挂载
  effects: ['trackStickToBottom'],
  states: {
    idle: {
      on: {
        'STICK.CHANGE': { actions: ['setStickState'] },
        'SCROLL_TO_BOTTOM': { actions: ['invokeScrollToBottom'] },
      },
    },
  },
  implementations: {
    actions: {
      setStickState: ({ event, context, prop }) => {
        const e = event.current()
        if (e.type !== 'STICK.CHANGE')
          return
        context.set('atBottom', e.atBottom)
        context.set('sticking', e.sticking)
        // 句柄只在值变化时回报，此处直接转发
        prop('onStickChange')?.({ atBottom: e.atBottom, sticking: e.sticking })
      },

      // 句柄缺席时不做任何事
      invokeScrollToBottom: ({ refs }) => {
        refs.get('stick')?.scrollToBottom()
      },
    },
    effects: {
      /** 在 flush 时创建粘底句柄并存入 refs，卸载时释放；config 缺席则不创建。 */
      trackStickToBottom: ({ refs, prop, send, flush }) => {
        let disposed = false
        let handle: StickToBottomHandle | undefined

        flush(() => {
          if (disposed)
            return
          const config = refs.get('config')
          if (!config)
            return
          handle = createStickToBottom({
            config,
            scrollEl: refs.get('getViewportEl'),
            contentEl: refs.get('getContentEl'),
            threshold: prop('threshold'),
            onChange: s => send({ type: 'STICK.CHANGE', atBottom: s.atBottom, sticking: s.sticking }),
          })
          refs.set('stick', handle)
        })

        return () => {
          disposed = true
          handle?.dispose()
          // 句柄已释放，同时清掉 ref
          refs.set('stick', null)
        }
      },
    },
  },
})
