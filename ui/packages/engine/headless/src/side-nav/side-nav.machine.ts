import type { PositionResult } from '@xihan-ui/kernel'
import type { SideNavNode, SideNavSchema } from './side-nav.types'
import { createDismissLayer, createFocusScope, navigateItems, trackHoverIntent } from '@xihan-ui/behavior'
import { setup } from '@xihan-ui/machine'
import { OVERLAY_OFFSET } from '../shared/overlay'
import { indexTree } from '../tree'

const { createMachine } = setup<SideNavSchema>()

/** 去重且保序：展开集合是一个集合，重复元素没有意义。 */
function unique(values: readonly string[]): string[] {
  return [...new Set(values)]
}

/** 数组按元素比：受控时 cell 每次读都产出新数组，默认的 Object.is 恒不相等。 */
function sameValues(a: string[], b: string[] | undefined): boolean {
  return !!b && a.length === b.length && a.every((v, i) => v === b[i])
}

/**
 * 手风琴收口：展开某枝时收起同层其余分支，不同层与它的祖先不动。
 * 层级按父节点判：同父即同层。
 */
export function accordionSiblings(
  collection: readonly SideNavNode[],
  expanded: readonly string[],
  opening: string,
): string[] {
  const index = indexTree(collection)
  const parent = index.get(opening)?.parent ?? null
  return expanded.filter((value) => {
    if (value === opening)
      return true
    return (index.get(value)?.parent ?? null) !== parent
  })
}

/** 清掉某一枝名下的旧坐标：那是上一次弹出留下的，页面滚过就不作数了。 */
function clearPlacement(
  context: { get: (k: 'popoutPlacements') => Record<string, PositionResult>, set: (k: 'popoutPlacements', v: Record<string, PositionResult>) => void },
  value: string,
): void {
  const placements = context.get('popoutPlacements')
  if (!(value in placements))
    return
  const { [value]: _dropped, ...rest } = placements
  context.set('popoutPlacements', rest)
}

/** 弹出面板里的行集合：分支按钮与链接按文档序混排。 */
function popoutRows(content: HTMLElement): HTMLElement[] {
  return [...content.querySelectorAll<HTMLElement>(
    '[data-scope="side-nav"][data-part="branch-trigger"], [data-scope="side-nav"][data-part="link"]',
  )]
}

// 选中、展开与焦点锚点都住在 context 的 cell 里，受控/非受控在 cell 收口。
// idle 是平铺展开；popout 是折叠态下弹出子级面板的浮层期，定位/消解/悬停三效应只在这期间在场。
export const sideNavMachine = createMachine({
  name: 'side-nav',
  context: ({ prop, cell }) => ({
    value: cell<string | null>(() => ({
      value: prop('value'),
      defaultValue: prop('defaultValue') ?? null,
      onChange: value => prop('onValueChange')?.({ value }),
    })),
    expandedValue: cell<string[]>(() => {
      const controlled = prop('expandedValue')
      return {
        value: controlled ? [...controlled] : undefined,
        defaultValue: prop('defaultExpandedValue') ? unique(prop('defaultExpandedValue')!) : [],
        isEqual: sameValues,
        onChange: value => prop('onExpandedValueChange')?.({ value }),
      }
    }),
    focusedValue: cell<string | null>(() => ({ defaultValue: null })),
    popoutValue: cell<string | null>(() => ({ defaultValue: null })),
    // 逐分支的最后一次定位：收起中的那枝靠它留在原地播完退场
    popoutPlacements: cell<Record<string, PositionResult>>(() => ({ defaultValue: {} })),
    popoutIntent: cell<'first' | 'none'>(() => ({ defaultValue: 'none' })),
    popoutReturnFocus: cell<boolean>(() => ({ defaultValue: false })),
  }),
  refs: () => ({
    config: null,
    registerLayer: null,
    position: null,
    getPopoutAnchorEl: () => null,
    getPopoutPositionerEl: () => null,
    getPopoutContentEl: () => null,
  }),
  initialState: () => 'idle',
  // 折叠开关在弹出期间翻回平铺时收掉面板，机器自己保证「弹出只存在于折叠态」
  watch: ({ track, prop, action }) => track(
    [() => prop('collapsed'), () => prop('collapsedPopout')],
    () => action(['syncCollapsed']),
  ),
  states: {
    idle: {
      on: {
        'VALUE.SET': { guard: 'canChange', actions: ['setValue'] },
        'LINK.SELECT': { guard: 'canChange', actions: ['selectLink'] },
        'EXPANDED.SET': { guard: 'canChange', actions: ['setExpanded'] },
        'BRANCH.EXPAND': { guard: 'canChange', actions: ['expandBranch'] },
        'BRANCH.COLLAPSE': { guard: 'canChange', actions: ['collapseBranch'] },
        'BRANCH.TOGGLE': { guard: 'canChange', actions: ['toggleBranch'] },
        'NODE.FOCUS': { actions: ['setFocusedValue'] },
        'FOCUS.CLEAR': { actions: ['clearFocusedValue'] },
        'POPOUT.OPEN': { guard: 'canPopout', target: 'popout', actions: ['setPopout'] },
      },
    },
    popout: {
      effects: ['trackPopoutPosition', 'trackPopoutLayer', 'trackPopoutHover'],
      on: {
        'VALUE.SET': { guard: 'canChange', actions: ['setValue'] },
        // 面板里选中叶子：落值并收面板，焦点归还触发按钮
        'LINK.SELECT': { guard: 'canChange', target: 'idle', actions: ['selectLink', 'setPopoutReturnFocus'] },
        'EXPANDED.SET': { guard: 'canChange', actions: ['setExpanded'] },
        'NODE.FOCUS': { actions: ['setFocusedValue'] },
        'FOCUS.CLEAR': { actions: ['clearFocusedValue'] },
        // 同值重开只更新落焦端；换分支由连接层先发 CLOSE 再发 OPEN，效应随状态重挂换锚
        'POPOUT.OPEN': { guard: 'canPopout', actions: ['setPopout'] },
        'POPOUT.CLOSE': { target: 'idle', actions: ['setPopoutReturnFocus'] },
      },
    },
  },
  implementations: {
    guards: {
      canChange: ({ prop }) => !prop('disabled'),
      canPopout: ({ prop }) => !prop('disabled') && !!prop('collapsed') && (prop('collapsedPopout') ?? true),
    },
    actions: {
      setValue: ({ context, event }) => {
        const e = event.current()
        if (e.type === 'VALUE.SET')
          context.set('value', e.value)
      },
      selectLink: ({ context, event }) => {
        const e = event.current()
        if (e.type === 'LINK.SELECT')
          context.set('value', e.value)
      },
      setExpanded: ({ context, event }) => {
        const e = event.current()
        if (e.type === 'EXPANDED.SET')
          context.set('expandedValue', unique(e.value))
      },
      expandBranch: ({ context, prop, event }) => {
        const e = event.current()
        if (e.type !== 'BRANCH.EXPAND')
          return
        const current = context.get('expandedValue')
        if (current.includes(e.value))
          return
        const next = [...current, e.value]
        context.set(
          'expandedValue',
          prop('accordion') ? accordionSiblings(prop('collection') ?? [], next, e.value) : next,
        )
      },
      collapseBranch: ({ context, event }) => {
        const e = event.current()
        if (e.type === 'BRANCH.COLLAPSE')
          context.set('expandedValue', context.get('expandedValue').filter(v => v !== e.value))
      },
      toggleBranch: ({ context, prop, event }) => {
        const e = event.current()
        if (e.type !== 'BRANCH.TOGGLE')
          return
        const current = context.get('expandedValue')
        if (current.includes(e.value)) {
          context.set('expandedValue', current.filter(v => v !== e.value))
          return
        }
        const next = [...current, e.value]
        context.set(
          'expandedValue',
          prop('accordion') ? accordionSiblings(prop('collection') ?? [], next, e.value) : next,
        )
      },
      setFocusedValue: ({ context, event }) => {
        const e = event.current()
        if (e.type === 'NODE.FOCUS')
          context.set('focusedValue', e.value)
      },
      clearFocusedValue: ({ context }) => context.set('focusedValue', null),
      setPopout: ({ context, event, state }) => {
        const e = event.current()
        if (e.type !== 'POPOUT.OPEN')
          return
        // 展开时只清这一枝名下的旧坐标：留着它面板会先在旧位置画一帧再跳走；
        // 别枝名下的那份不动，换枝时上一枝靠它留在原地播完退场。
        // 已开着的同值重开只更新落焦端，坐标照旧
        if (state.get() !== 'popout' || context.get('popoutValue') !== e.value)
          clearPlacement(context, e.value)
        context.set('popoutValue', e.value)
        context.set('popoutIntent', e.focus ?? 'none')
      },
      // Escape、面板内选中与键盘收回归还焦点；悬停离开与层外交互不归还
      setPopoutReturnFocus: ({ context, event }) => {
        const e = event.current()
        const restore = e.type === 'LINK.SELECT'
          || (e.type === 'POPOUT.CLOSE' && (e.src === 'esc' || e.src === 'keyboard' || e.src === 'select'))
        context.set('popoutReturnFocus', restore)
      },
      // 折叠开关翻回平铺（或弹出被关掉）时收掉开着的面板
      syncCollapsed: ({ prop, state, send }) => {
        if (state.get() === 'popout' && !(prop('collapsed') && (prop('collapsedPopout') ?? true)))
          send({ type: 'POPOUT.CLOSE' })
      },
    },
    effects: {
      // 挂载定位引擎：锚点是触发按钮，被定位的是定位层（已搬到浮层落点），结果写进 context 供 connect 读
      trackPopoutPosition: ({ refs, prop, context, flush }) => {
        const engine = refs.get('position')
        if (!engine)
          return undefined
        let stop: (() => void) | undefined
        let disposed = false
        flush(() => {
          if (disposed)
            return
          const anchor = refs.get('getPopoutAnchorEl')()
          const floating = refs.get('getPopoutPositionerEl')()
          if (!anchor || !floating)
            return
          stop = engine.attach(
            anchor,
            floating,
            {
              placement: prop('dir') === 'rtl' ? 'left-start' : 'right-start',
              offset: OVERLAY_OFFSET,
              strategy: 'fixed',
              dir: prop('dir'),
              // 落定那一侧的可用空间，connect 转成内联自定义属性给皮肤限高
              size: true,
            },
            // 记到正弹出的那一枝名下
            (result) => {
              const owner = context.get('popoutValue')
              if (owner != null)
                context.set('popoutPlacements', { ...context.get('popoutPlacements'), [owner]: result })
            },
          )
        })
        return () => {
          disposed = true
          stop?.()
        }
      },
      // 层、消解层与焦点域同生共死；层只在弹出期间入栈。
      // 悬停打开（落焦端 'none'）不建焦点域：指针路过不抢别处的焦点
      trackPopoutLayer: ({ refs, context, send }) => {
        const config = refs.get('config')
        const registerLayer = refs.get('registerLayer')
        if (!config || !registerLayer)
          return undefined

        const { layer, dispose: disposeLayer } = registerLayer()
        const dismiss = createDismissLayer({
          config,
          layer,
          onDismiss: reason =>
            send({ type: 'POPOUT.CLOSE', src: reason === 'escape-key' ? 'esc' : 'interact-outside' }),
        })

        const focus = context.get('popoutIntent') === 'first'
          ? createFocusScope({
              config,
              layer,
              container: () => refs.get('getPopoutContentEl')(),
              trapped: () => false,
              loop: false,
              // 面板首个可停留的行；禁用行跳过
              initialFocus: () => {
                const content = refs.get('getPopoutContentEl')()
                return content ? navigateItems(popoutRows(content), null, 'first') : null
              },
              restoreFocus: () => context.get('popoutReturnFocus'),
            })
          : null

        return () => {
          focus?.dispose()
          dismiss.dispose()
          disposeLayer()
          // 指针打开的会话没建焦点域，但键盘可能中途进过面板：归还承诺在这里兑现。
          // 归还标记随关闭动作落值、拆除晚一帧才读得到，与焦点域的返还同节拍
          if (!focus) {
            const anchorEl = refs.get('getPopoutAnchorEl')()
            const content = refs.get('getPopoutContentEl')()
            const doc = content?.ownerDocument
            const active = doc?.activeElement
            if (anchorEl && content && active && (content.contains(active) || active === doc!.body)) {
              (doc!.defaultView ?? globalThis).requestAnimationFrame(() => {
                if (context.get('popoutReturnFocus'))
                  anchorEl.focus()
              })
            }
          }
        }
      },
      // 关闭侧的悬停意图：离开触发按钮与面板（经安全三角赶路除外）即收。
      // 键盘打开的会话不挂；焦点已进面板时指针路过也不拆台
      trackPopoutHover: ({ refs, context, send, flush }) => {
        if (context.get('popoutIntent') === 'first')
          return undefined
        let cleanup: (() => void) | undefined
        let disposed = false
        flush(() => {
          if (disposed)
            return
          cleanup = trackHoverIntent({
            getTriggerEl: () => refs.get('getPopoutAnchorEl')(),
            getContentEl: () => refs.get('getPopoutContentEl')(),
            onOpenIntent: () => {},
            onCloseIntent: () => {
              const content = refs.get('getPopoutContentEl')()
              if (content && content.contains(content.ownerDocument.activeElement))
                return
              send({ type: 'POPOUT.CLOSE', src: 'hover' })
            },
          })
        })
        return () => {
          disposed = true
          cleanup?.()
        }
      },
    },
  },
})
