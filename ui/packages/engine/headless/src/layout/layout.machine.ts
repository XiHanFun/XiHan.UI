import type { LayoutSchema } from './layout.types'
import { setup } from '@xihan-ui/core'

const { createMachine } = setup<LayoutSchema>()

// 受控（siderCollapsed 给定）时用户事件只发意图、不自改状态，由 watch 派发 CONTROLLED.* 回写。
export const layoutMachine = createMachine({
  name: 'layout',
  initialState: ({ prop }) => ((prop('siderCollapsed') ?? prop('defaultSiderCollapsed')) ? 'collapsed' : 'expanded'),
  watch: ({ track, prop, action }) => track([() => prop('siderCollapsed')], () => action(['syncSiderCollapsed'])),
  // 挂根级：断点与折叠态无关，跟着状态挂会在每次折叠时重挂并重发一次当前值
  effects: ['trackSiderBreakpoint'],
  states: {
    expanded: {
      on: {
        // 受控命中 → 只发意图；非受控 → 落 target 并一并通知
        'SIDER.COLLAPSE': [
          { guard: 'isSiderCollapsedControlled', actions: ['invokeOnCollapse'] },
          { target: 'collapsed', actions: ['invokeOnCollapse'] },
        ],
        'SIDER.TOGGLE': [
          { guard: 'isSiderCollapsedControlled', actions: ['invokeOnCollapse'] },
          { target: 'collapsed', actions: ['invokeOnCollapse'] },
        ],
        'CONTROLLED.COLLAPSE': { target: 'collapsed' },
      },
    },
    collapsed: {
      on: {
        'SIDER.EXPAND': [
          { guard: 'isSiderCollapsedControlled', actions: ['invokeOnExpand'] },
          { target: 'expanded', actions: ['invokeOnExpand'] },
        ],
        'SIDER.TOGGLE': [
          { guard: 'isSiderCollapsedControlled', actions: ['invokeOnExpand'] },
          { target: 'expanded', actions: ['invokeOnExpand'] },
        ],
        'CONTROLLED.EXPAND': { target: 'expanded' },
      },
    },
  },
  implementations: {
    guards: {
      isSiderCollapsedControlled: ({ prop }) => prop('siderCollapsed') !== undefined,
    },
    actions: {
      invokeOnCollapse: ({ prop }) => prop('onSiderCollapsedChange')?.({ collapsed: true }),
      invokeOnExpand: ({ prop }) => prop('onSiderCollapsedChange')?.({ collapsed: false }),
      // 只在受控（siderCollapsed 为布尔）时回写；变回 undefined = 转非受控，不强制展开
      syncSiderCollapsed: ({ prop, send }) => {
        const collapsed = prop('siderCollapsed')
        if (collapsed === undefined)
          return
        send(collapsed ? { type: 'CONTROLLED.COLLAPSE' } : { type: 'CONTROLLED.EXPAND' })
      },
    },
    effects: {
      /**
       * 跟住 siderBreakpoint 那一档的媒体查询，跨过去发一次、挂载时也发一次当前值。
       * 档位的像素宽度取自断点令牌，JS 里不另抄一份；令牌样式表没引入时这条不跑。
       * 档位在挂载时读一次。
       */
      trackSiderBreakpoint: ({ prop, scope }) => {
        const tier = prop('siderBreakpoint')
        if (!tier)
          return undefined
        const win = scope.getWin()
        if (typeof win.matchMedia !== 'function')
          return undefined
        const width = scope.getComputedStyle(scope.getDoc().documentElement)
          .getPropertyValue(`--xh-breakpoint-${tier}`)
          .trim()
        if (!width)
          return undefined
        const query = win.matchMedia(`(min-width: ${width})`)
        const notify = (): void => prop('onSiderBreakpoint')?.({ matched: query.matches })
        notify()
        query.addEventListener('change', notify)
        return () => query.removeEventListener('change', notify)
      },
    },
  },
})
