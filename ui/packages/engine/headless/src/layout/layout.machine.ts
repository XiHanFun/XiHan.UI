import type { LayoutBreakpoint, LayoutSchema, LayoutSiderPresentation } from './layout.types'
import { getLayerRegistry, setup } from '@xihan-ui/core'

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
      /**
       * 跟住 siderBreakpoint 那一档的媒体查询，跨过去发一次、挂载时也发一次当前值。
       * 档位的像素宽度取自断点令牌，JS 里不另抄一份；令牌样式表没引入时这条不跑。
       * 档位在挂载时读一次。
       */
      trackSiderBreakpoint: ({ prop, context, send, scope }) => {
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
        const notify = (): void => {
          const matched = query.matches
          context.set('siderNarrow', !matched)
          prop('onSiderBreakpoint')?.({ matched })
          // 覆盖档跨档时跟着开合：进覆盖档先收起，免得一挂上来就盖住内容；回占位档还原成展开。
          // 走的是 siderCollapsed 那条通道，受控宿主照常收到回调、由它说了算
          if (prop('siderPresentation') === 'sheet')
            send(matched ? { type: 'SIDER.EXPAND' } : { type: 'SIDER.COLLAPSE' })
        }
        notify()
        query.addEventListener('change', notify)
        return () => query.removeEventListener('change', notify)
      },
      /**
       * 覆盖档的 Escape：盖在内容之上的那一层按 Escape 收起。
       * 两道闸门：侧栏得真按覆盖档摆着（占位档下它是骨架的一列，Escape 与它无关），
       * 且此刻没有浮层在层栈上——对话框、下拉这些叠在骨架之上，Escape 先归它们，
       * 一次按键不该既关掉浮层又把侧栏一起收走。
       */
      dismissSiderSheet: ({ prop, context, send, scope }) => {
        const doc = scope.getDoc()
        const registry = getLayerRegistry(doc)
        const onKeydown = (event: KeyboardEvent): void => {
          if (event.key !== 'Escape' || event.defaultPrevented)
            return
          if (registry.top())
            return
          const presentation = resolveSiderPresentation(
            prop('siderPresentation'),
            prop('siderBreakpoint'),
            context.get('siderNarrow'),
          )
          if (presentation !== 'sheet')
            return
          send({ type: 'SIDER.COLLAPSE' })
        }
        doc.addEventListener('keydown', onKeydown)
        return () => doc.removeEventListener('keydown', onKeydown)
      },
    },
  },
})
