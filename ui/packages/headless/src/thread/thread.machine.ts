import type { StickToBottomHandle } from '@xihan-ui/behavior'
import type { ThreadSchema } from './thread.types'
import { createStickToBottom } from '@xihan-ui/behavior'
import { setup } from '@xihan-ui/machine'

const { createMachine } = setup<ThreadSchema>()

export const threadMachine = createMachine({
  name: 'thread',
  context: ({ cell }) => ({
    // 初值取"在底且粘着"：新会话一开局内容还没长出来，视口天然就在底部。
    // 真实几何由句柄的第一次回报补上，这里不去读 DOM。
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
  // 粘底与状态无关，全程挂着：会话从头到尾只有这一个状态，没有"该挂/该卸"的时机之分
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
        // 句柄只在值真变时才回报，这里直接转发，不再去重
        prop('onStickChange')?.({ atBottom: e.atBottom, sticking: e.sticking })
      },

      // 句柄缺席（无 DOM 环境）时静默不动：滚动本就归浏览器，没有句柄也不该报错
      invokeScrollToBottom: ({ refs }) => {
        refs.get('stick')?.scrollToBottom()
      },
    },
    effects: {
      /**
       * 粘底句柄的生命周期。滚动位置、尺寸变化与脱锚判定全在句柄里，
       * 连接层一行 DOM 都不碰。
       *
       * 推迟一拍再建：挂载这一刻作者的消息还在渲，此时量到的高度全是 0，
       * 首帧会误判成"没溢出"，一进来按钮就闪一下。disposed 兜住"还没建起来
       * 就被卸载"那一路——不然句柄会挂到一台已经停掉的机器上，没人再去 dispose 它。
       *
       * config 缺席就整套不挂：没有 DOM 环境时状态机照常跑，不去半挂一个量不到东西的句柄。
       */
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
          // 句柄已死，ref 必须跟着清掉：留着的话 SCROLL_TO_BOTTOM 会打到一个已解绑的句柄上
          refs.set('stick', null)
        }
      },
    },
  },
})
