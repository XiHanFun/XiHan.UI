import type { Cleanup, Layer, PositionResult } from '@xihan-ui/core'
import type { SideNavNode, SideNavSchema } from './side-nav.types'
import { focusItem, navigateItems, setup, trackHoverIntent } from '@xihan-ui/core'
import { sameArray as sameValues, uniqueArray as unique } from '../shared/array'
import { OVERLAY_OFFSET } from '../shared/overlay'
import { trackOverlayLayer } from '../shared/overlay-shell'
import { indexTree } from '../tree'

const { createMachine } = setup<SideNavSchema>()

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
    presences: new Map(),
    openPopoutLayer: () => {},
    closePopoutLayer: () => {},
    syncPopoutPresence: () => {},
  }),
  initialState: () => 'idle',
  // 多分支弹出层的资源会跨逻辑关闭保留，由根级会话管理器按 Presence 身份结清。
  effects: ['trackPopoutSessions'],
  // 折叠开关在弹出期间翻回平铺时收掉面板，机器自己保证「弹出只存在于折叠态」
  watch: ({ track, prop, action }) => track(
    [() => prop('collapsed'), () => prop('collapsedPopout')],
    () => action(['syncCollapsed']),
  ),
  on: {
    'PRESENCE.SET': { actions: ['setPresence'] },
  },
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
      setPresence: ({ refs, event }) => {
        const e = event.current()
        if (e.type !== 'PRESENCE.SET')
          return
        const current = refs.get('presences').get(e.value)
        if (e.connected) {
          refs.get('presences').set(e.value, e.presence)
          refs.get('syncPopoutPresence')(e.value, e.presence, true)
          return
        }
        if (current !== e.presence)
          return
        refs.get('presences').delete(e.value)
        refs.get('syncPopoutPresence')(e.value, e.presence, false)
      },
    },
    effects: {
      trackPopoutSessions: ({ refs, context, state, send, flush }) => {
        interface Session {
          value: string
          generation: number
          release: Cleanup
          exitDispose: Cleanup | null
          releaseReadyDispose: Cleanup | null
          layer: Layer
          reactivate: (() => void) | null
          focusScoped: boolean
          closing: boolean
          restoreFocus: boolean
        }

        const sessions = new Map<string, Session>()
        let disposed = false

        const isCurrent = (value: string): boolean =>
          state.get() === 'popout' && context.get('popoutValue') === value

        const releaseSession = (session: Session, force = false): void => {
          if (sessions.get(session.value) !== session)
            return
          const registry = refs.get('config')?.layerRegistry
          if (!force && registry && registry.top() !== session.layer) {
            session.releaseReadyDispose ??= registry.subscribe(() => {
              if (registry.top() === session.layer) {
                refs.get('config')?.scope.getWin().queueMicrotask(() => releaseSession(session))
              }
            })
            return
          }
          sessions.delete(session.value)
          session.exitDispose?.()
          session.exitDispose = null
          session.releaseReadyDispose?.()
          session.releaseReadyDispose = null
          const anchor = refs.get('getPopoutAnchorEl')(session.value)
          const content = refs.get('getPopoutContentEl')(session.value)
          const active = content?.ownerDocument.activeElement
          session.release()
          // 指针会话没有 FocusScope；若关闭原因承诺归还，仍由 Headless 在资源释放后兑现。
          if (!session.focusScoped
            && session.restoreFocus
            && !isCurrent(context.get('popoutValue') ?? '')
            && anchor
            && content
            && active
            && (content.contains(active) || active === content.ownerDocument.body)) {
            content.ownerDocument.defaultView?.requestAnimationFrame(() => {
              if (!disposed && state.get() !== 'popout')
                anchor.focus()
            })
          }
        }

        const bindExit = (session: Session): void => {
          session.exitDispose?.()
          session.exitDispose = null
          const presence = refs.get('presences').get(session.value)
          if (!presence || !presence.rendered) {
            releaseSession(session)
            return
          }
          const generation = session.generation
          session.exitDispose = presence.onExitComplete(() => {
            if (session.closing && session.generation === generation)
              releaseSession(session)
          })
        }

        const focusFirstRow = (value: string): void => {
          flush(() => {
            if (!disposed && isCurrent(value)) {
              const content = refs.get('getPopoutContentEl')(value)
              if (content)
                focusItem(navigateItems(popoutRows(content), null, 'first'))
            }
          })
        }

        const openSession = (value: string, intent: 'first' | 'none'): void => {
          let session = sessions.get(value)
          if (session) {
            session.generation += 1
            session.closing = false
            session.restoreFocus = false
            session.exitDispose?.()
            session.exitDispose = null
            session.releaseReadyDispose?.()
            session.releaseReadyDispose = null
            refs.get('presences').get(value)?.update(true)
            if (intent === 'first') {
              session.reactivate?.()
              focusFirstRow(value)
            }
            return
          }

          const config = refs.get('config')
          const registerLayer = refs.get('registerLayer')
          if (!config || !registerLayer)
            return
          let reactivate: (() => void) | null = null
          let created: Session | null = null
          let ownedLayer: Layer | null = null
          const focusScoped = intent === 'first'
          const release = trackOverlayLayer({
            config,
            registerLayer: () => {
              const registration = registerLayer(value)
              ownedLayer = registration.layer
              return registration
            },
            flush,
            active: () => isCurrent(value),
            onDismiss: reason => send({ type: 'POPOUT.CLOSE', src: reason === 'escape-key' ? 'esc' : 'interact-outside' }),
            focusScope: focusScoped
              ? {
                  container: () => refs.get('getPopoutContentEl')(value),
                  initialFocus: () => {
                    const content = refs.get('getPopoutContentEl')(value)
                    return content ? navigateItems(popoutRows(content), null, 'first') : null
                  },
                  restoreFocus: () => !!created?.restoreFocus && !isCurrent(context.get('popoutValue') ?? ''),
                  restoreTarget: () => refs.get('getPopoutAnchorEl')(value),
                  onReactivate: (next) => {
                    reactivate = next
                    if (created)
                      created.reactivate = next
                  },
                }
              : null,
          })
          if (!release || !ownedLayer)
            return
          session = {
            value,
            generation: 1,
            release,
            exitDispose: null,
            releaseReadyDispose: null,
            layer: ownedLayer,
            reactivate,
            focusScoped,
            closing: false,
            restoreFocus: false,
          }
          created = session
          sessions.set(value, session)
        }

        const closeSession = (value: string): void => {
          const session = sessions.get(value)
          if (!session)
            return
          const generation = session.generation
          queueMicrotask(() => {
            if (disposed || sessions.get(value) !== session || session.generation !== generation || isCurrent(value))
              return
            session.closing = true
            session.restoreFocus = context.get('popoutReturnFocus')
            bindExit(session)
          })
        }

        refs.set('openPopoutLayer', openSession)
        refs.set('closePopoutLayer', closeSession)
        refs.set('syncPopoutPresence', (value, _presence, connected) => {
          const session = sessions.get(value)
          if (!session) {
            if (connected && isCurrent(value))
              openSession(value, context.get('popoutIntent'))
            return
          }
          if (!connected) {
            releaseSession(session)
            return
          }
          if (session.closing)
            bindExit(session)
        })

        return () => {
          disposed = true
          refs.set('openPopoutLayer', () => {})
          refs.set('closePopoutLayer', () => {})
          refs.set('syncPopoutPresence', () => {})
          for (const session of [...sessions.values()].reverse()) {
            session.restoreFocus = false
            releaseSession(session, true)
          }
        }
      },
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
          const value = context.get('popoutValue')
          if (value == null)
            return
          const anchor = refs.get('getPopoutAnchorEl')(value)
          const floating = refs.get('getPopoutPositionerEl')(value)
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
      // popout 状态效应只报告会话进出；资源本体由根级按身份管理并等待对应 Presence。
      trackPopoutLayer: ({ refs, context }) => {
        const value = context.get('popoutValue')
        if (value == null)
          return undefined
        refs.get('openPopoutLayer')(value, context.get('popoutIntent'))
        return () => refs.get('closePopoutLayer')(value)
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
          const value = context.get('popoutValue')
          if (value == null)
            return
          const trigger = refs.get('getPopoutAnchorEl')(value)
          // 无渲染器或锚点未在场时没有可观察目标；下次状态效应建立时重新解析。
          if (!trigger)
            return
          cleanup = trackHoverIntent({
            trigger,
            getContentEl: () => refs.get('getPopoutContentEl')(value),
            onOpenIntent: () => {},
            onCloseIntent: () => {
              const content = refs.get('getPopoutContentEl')(value)
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
