import type { PositionResult } from '@xihan-ui/core'
import type { PopoverSchema } from './popover.types'
import { createDismissLayer, createFocusScope } from '@xihan-ui/behavior'
import { setup } from '@xihan-ui/machine'

const { createMachine } = setup<PopoverSchema>()

export const popoverMachine = createMachine({
  name: 'popover',
  context: ({ cell }) => ({
    // 位置结果由 trackPosition 里的引擎回填；connect 只读这里，不碰 DOM
    position: cell<PositionResult | null>(() => ({ defaultValue: null })),
  }),
  refs: () => ({
    config: null,
    layer: null,
    position: null,
    getAnchorEl: () => null,
    getFloatingEl: () => null,
    getContentEl: () => null,
  }),
  initialState: ({ prop }) => ((prop('open') ?? prop('defaultOpen')) ? 'open' : 'closed'),
  // 受控（open prop 给定）时，用户事件只发意图回调、不自改状态；宿主写回 open 后
  // 由此 watch 追踪 open 变化，派发影子事件 CONTROLLED.* 无条件回写状态。
  watch: ({ track, prop, action }) => track([() => prop('open')], () => action(['syncOpen'])),
  states: {
    closed: {
      on: {
        // 受控命中 → 只发意图；非受控 → 落 target 并一并通知
        'OPEN': [
          { guard: 'isOpenControlled', actions: ['invokeOnOpen'] },
          { target: 'open', actions: ['invokeOnOpen'] },
        ],
        'TOGGLE': [
          { guard: 'isOpenControlled', actions: ['invokeOnOpen'] },
          { target: 'open', actions: ['invokeOnOpen'] },
        ],
        'CONTROLLED.OPEN': { target: 'open' },
      },
    },
    open: {
      // 进入 open：定位 → 消解 → 焦点。退出 open 时按同序清理，焦点归还发生在消解层撤销之后。
      effects: ['trackPosition', 'trackDismiss', 'trackFocus'],
      on: {
        'CLOSE': [
          { guard: 'isOpenControlled', actions: ['invokeOnClose'] },
          { target: 'closed', actions: ['invokeOnClose'] },
        ],
        'TOGGLE': [
          { guard: 'isOpenControlled', actions: ['invokeOnClose'] },
          { target: 'closed', actions: ['invokeOnClose'] },
        ],
        'CONTROLLED.CLOSE': { target: 'closed' },
      },
    },
  },
  implementations: {
    guards: {
      isOpenControlled: ({ prop }) => prop('open') !== undefined,
    },
    actions: {
      invokeOnOpen: ({ prop }) => prop('onOpenChange')?.({ open: true }),
      invokeOnClose: ({ prop }) => prop('onOpenChange')?.({ open: false }),
      // 只在受控（open 为布尔）时回写；open 变回 undefined = 转非受控，不强制关闭
      syncOpen: ({ prop, send }) => {
        const open = prop('open')
        if (open === undefined)
          return
        send(open ? { type: 'CONTROLLED.OPEN' } : { type: 'CONTROLLED.CLOSE' })
      },
    },
    effects: {
      // 定位全程在 effect 里：引擎订阅的返回值即 cleanup，位置结果写进 context 供 connect 读。
      trackPosition: ({ refs, prop, context }) => {
        const engine = refs.get('position')
        // 无引擎（纯逻辑测试 / 无布局环境 / SSR）：不定位，其余照常
        if (!engine)
          return undefined
        const anchor = refs.get('getAnchorEl')()
        const floating = refs.get('getFloatingEl')()
        if (!anchor || !floating)
          return undefined
        return engine.attach(
          anchor,
          floating,
          { placement: prop('placement'), offset: prop('offset') },
          result => context.set('position', result),
        )
      },
      trackDismiss: ({ refs, prop, send }) => {
        const config = refs.get('config')
        const layer = refs.get('layer')
        // 无 DOM 环境（纯逻辑测试）：状态机照常转移，不挂副作用
        if (!config || !layer)
          return undefined

        const dismiss = createDismissLayer({
          config,
          layer,
          // 关不关在这里判定：两个开关都现读 prop，开合中途改也立刻生效
          onDismiss: (reason) => {
            const escape = reason === 'escape-key'
            const allowed = escape
              ? (prop('closeOnEscape') ?? true)
              : (prop('closeOnInteractOutside') ?? true)
            if (!allowed)
              return
            send({ type: 'CLOSE', src: escape ? 'esc' : 'interact-outside' })
          },
        })
        return () => dismiss.dispose()
      },
      trackFocus: ({ refs, prop }) => {
        const config = refs.get('config')
        const layer = refs.get('layer')
        if (!config || !layer)
          return undefined

        const focus = createFocusScope({
          config,
          layer,
          // 每次读最新 ref，容器晚一拍就位也能命中
          container: () => refs.get('getContentEl')(),
          // 非模态浮层不陷焦点也不回绕：Tab 能走出去，走出去即由消解层判定是否关闭
          trapped: () => prop('modal') ?? false,
          loop: prop('modal') ?? false,
          restoreFocus: () => true,
        })
        return () => focus.dispose()
      },
    },
  },
})
