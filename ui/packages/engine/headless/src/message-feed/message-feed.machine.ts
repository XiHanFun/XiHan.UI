import type { StickToBottomHandle } from '@xihan-ui/core'
import type { MessageFeedSchema } from './message-feed.types'
import { createStickToBottom, setup } from '@xihan-ui/core'

const { createMachine } = setup<MessageFeedSchema>()

// 一个状态，逻辑全在 context 与 actions 里：粘底两个布尔由句柄写，锚点由条目的 onFocus 写。
// 三个 cell 都是内部瞬态，没有受控入口，也就没有 CONTROLLED.* 那一套。
export const messageFeedMachine = createMachine({
  name: 'message-feed',
  context: ({ cell }) => ({
    // 初值为在底且粘附，真实几何由句柄的第一次回报补上
    atBottom: cell<boolean>(() => ({ defaultValue: true })),
    sticking: cell<boolean>(() => ({ defaultValue: true })),
    focusedId: cell<string | null>(() => ({ defaultValue: null })),
  }),
  refs: () => ({
    config: null,
    getRootEl: () => null,
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
        'ITEM.FOCUS': { actions: ['setFocusedId'] },
        'FEED.BLUR': { actions: ['clearFocusedId'] },
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

      setFocusedId: ({ context, event, prop }) => {
        const e = event.current()
        if (e.type !== 'ITEM.FOCUS')
          return
        context.set('focusedId', e.id)
        prop('onItemFocus')?.({ id: e.id })
      },

      // 焦点离场即清锚点，root 据此重新认领 Tab 位
      clearFocusedId: ({ context, prop }) => {
        context.set('focusedId', null)
        prop('onItemFocus')?.({ id: null })
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
