import type { LayoutBreakpoint, LayoutSchema, LayoutSiderPresentation } from './layout.types'
import { createEscapeFallback, setup } from '@xihan-ui/core'
import { trackSiderBreakpoint } from './layout.breakpoint'

const { createMachine } = setup<LayoutSchema>()

/**
 * 侧栏此刻按哪一档呈现。
 * 写了断点时覆盖档只在未达那一档时成立：宽屏退回占位档，与不写 sheet 时一模一样。
 */
export function resolveSiderPresentation(
  presentation: LayoutSiderPresentation | undefined,
  breakpoint: LayoutBreakpoint | undefined,
  narrow: boolean,
): LayoutSiderPresentation {
  if (presentation !== 'sheet')
    return 'inline'
  return breakpoint && !narrow ? 'inline' : 'sheet'
}

// 受控（siderCollapsed 给定）时用户事件只发意图、不自改状态，由 watch 派发 CONTROLLED.* 回写。
export const layoutMachine = createMachine({
  name: 'layout',
  context: ({ cell }) => ({
    siderNarrow: cell<boolean>(() => ({ defaultValue: false })),
  }),
  refs: () => ({
    config: null,
  }),
  initialState: ({ prop }) => ((prop('siderCollapsed') ?? prop('defaultSiderCollapsed')) ? 'collapsed' : 'expanded'),
  watch: ({ track, prop, action }) => track([() => prop('siderCollapsed')], () => action(['syncSiderCollapsed'])),
  // 挂根级：断点与折叠态无关，跟着状态挂会在每次折叠时重挂并重发一次当前值
  effects: ['trackSiderBreakpoint'],
  states: {
    expanded: {
      // 只在展开期间挂：Escape 收的是已经盖在内容之上的那一层，收起态没有可收的东西
      effects: ['dismissSiderSheet'],
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
      trackSiderBreakpoint,
      /**
       * 覆盖档的 Escape 后备出口。Hub 在 capture 阶段先让 Layer 消费本次按键，
       * 只有这条 lane 当时为空且票据一直有效，才在 bubble 阶段收起最近展开的侧栏。
       */
      dismissSiderSheet: ({ prop, context, send, scope, refs }) => {
        const config = refs.get('config')
        if (!config)
          throw new Error('[xh] Layout 覆盖式侧栏缺少 RuntimeConfig')
        const doc = scope.getDoc()
        if (config.scope.getDoc() !== doc || config.layerRegistry.ownerDocument !== doc)
          throw new Error('[xh] Layout 的 RuntimeConfig、LayerRegistry 与机器 Scope 必须属于同一 Document')
        const fallback = createEscapeFallback({
          config,
          isEnabled: () => resolveSiderPresentation(
            prop('siderPresentation'),
            prop('siderBreakpoint'),
            context.get('siderNarrow'),
          ) === 'sheet',
          onEscape: () => send({ type: 'SIDER.COLLAPSE' }),
        })
        return fallback.dispose
      },
    },
  },
})
