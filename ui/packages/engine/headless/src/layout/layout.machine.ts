import type { LayoutSchema } from './layout.types'
import { setup } from '@xihan-ui/machine'

const { createMachine } = setup<LayoutSchema>()

// 受控（siderCollapsed 给定）时用户事件只发意图、不自改状态，由 watch 派发 CONTROLLED.* 回写。
export const layoutMachine = createMachine({
  name: 'layout',
  initialState: ({ prop }) => ((prop('siderCollapsed') ?? prop('defaultSiderCollapsed')) ? 'collapsed' : 'expanded'),
  watch: ({ track, prop, action }) => track([() => prop('siderCollapsed')], () => action(['syncSiderCollapsed'])),
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
  },
})
