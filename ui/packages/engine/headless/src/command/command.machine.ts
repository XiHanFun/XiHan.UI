import type { CommandNodeMeta, CommandSchema } from './command.types'
import { createDismissLayer, createFocusScope, setup } from '@xihan-ui/core'
import { closeReasonOf } from '../shared/close-reason'
import { createModalLayerResources, setupLayerTransaction, trackPresenceResources } from '../shared/overlay-shell'
import { flattenCommandGroups, navigateCommandResults, resolveCommandGroups } from './command.filter'
import { hiddenCommandValues } from './command.visibility'

const { createMachine } = setup<CommandSchema>()

/** 机器读 prop 的形状；这里只用到过滤要的那四项。 */
type CommandProps = CommandSchema['props']

/** 此刻该显示的那几条命令。过滤是纯函数，机器与连接层各算各的，不经 DOM。 */
function commandResults(
  prop: <K extends keyof CommandProps>(key: K) => CommandProps[K],
  query: string,
): readonly CommandNodeMeta[] {
  return flattenCommandGroups(resolveCommandGroups(
    prop('collection') ?? [],
    prop('groups') ?? [],
    query,
    { filter: prop('filter') ?? true, caseSensitive: !!prop('caseSensitive') },
  ))
}

// 开合编进 FSM 状态，走守卫对 + CONTROLLED.* 影子事件 + watch；
// 检索串走 cell 原生受控（给定 inputValue 即受控），键盘锚点不受控、不对外通知。
export const commandMachine = createMachine({
  name: 'command',
  context: ({ prop, cell }) => ({
    inputValue: cell<string>(() => ({
      value: prop('inputValue'),
      defaultValue: prop('defaultInputValue') ?? '',
      onChange: inputValue => prop('onInputValueChange')?.({ inputValue }),
    })),
    // 锚点只服务 aria-activedescendant 与确认键的落点，焦点全程留在检索框
    highlightedValue: cell<string | null>(() => ({ defaultValue: null })),
    // 与 collection 独立：仅镜像已挂载条目的显式 hidden，不以“找不到 DOM”推断隐藏。
    hiddenValues: cell<string[]>(() => ({ defaultValue: [] })),
  }),
  refs: () => ({
    config: null,
    registerLayer: null,
    presence: null,
    syncModalResources: null,
    getContentEl: () => null,
    getListEl: () => null,
    syncListVisibility: null,
    getInputEl: () => null,
  }),
  initialState: ({ prop }) => ((prop('open') ?? prop('defaultOpen')) ? 'open' : 'closed'),
  // Layer、消解、焦点与模态资源由顶层 effect 持有，逻辑关闭后等 Presence 真实退场再释放。
  effects: ['trackOverlay'],
  watch: ({ track, prop, context, action }) => {
    // 受控时用户事件只发意图；宿主写回 open 后由这条 watch 派发 CONTROLLED.* 回写状态
    track([() => prop('open')], () => action(['syncOpen']))
    // 模态策略是展开生命周期内可变的；核心机器统一切换行为资源。
    track([() => prop('modal')], () => action(['syncModalResources']))
    // 检索串一变结果就换了一批，锚点跟着钉回首条。
    // 挂在 watch 上而不是转移上：受控检索串要等宿主写回才真的变，那一拍才是结果换掉的时刻
    track([context.dep('inputValue')], () => action(['highlightFirst']))
    // 清单换了一批（远端取回、宿主自己筛完）：锚点还指得着就别动它，
    // 指不着了才补挑一次。不无条件重挑——宿主在模板里就地造数组时这条 watch 每帧都跳，
    // 无条件重挑会把方向键刚挪过去的锚点一次次拽回首条
    track([() => prop('collection')], () => action(['highlightIfDangling']))
    track([context.dep('hiddenValues')], () => action(['highlightVisibleIfDangling']))
  },
  on: {
    'INPUT.SET': { actions: ['setInputValue'] },
  },
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
      // 每次开都从空检索串起步，锚点落在首条上
      entry: ['resetInputValue', 'highlightFirst'],
      exit: ['clearHighlightedValue'],
      // 条目可见性只服务逻辑展开；行为与模态资源由顶层 effect 延后到真实退场释放。
      effects: ['trackItemVisibility'],
      on: {
        'CLOSE': [
          { guard: 'isOpenControlled', actions: ['invokeOnClose'] },
          { target: 'closed', actions: ['invokeOnClose'] },
        ],
        'TOGGLE': [
          { guard: 'isOpenControlled', actions: ['invokeOnClose'] },
          { target: 'closed', actions: ['invokeOnClose'] },
        ],
        'INPUT.CHANGE': { actions: ['setInputValue'] },
        'ITEM.HIGHLIGHT': { actions: ['setHighlightedValue'] },
        'HIGHLIGHT.CLEAR': { actions: ['clearHighlightedValue'] },
        // 先把选中通知发出去，再按 closeOnSelect 决定收不收；受控时收起同样只发意图
        'ITEM.SELECT': [
          { guard: 'keepsOpenOnSelect', actions: ['invokeOnSelect'] },
          { guard: 'isOpenControlled', actions: ['invokeOnSelect', 'invokeOnClose'] },
          { target: 'closed', actions: ['invokeOnSelect', 'invokeOnClose'] },
        ],
        'CONTROLLED.CLOSE': { target: 'closed' },
      },
    },
  },
  implementations: {
    guards: {
      isOpenControlled: ({ prop }) => prop('open') !== undefined,
      // 命中即「选完不收起」：转移停在第一条上，不带 target
      keepsOpenOnSelect: ({ prop }) => (prop('closeOnSelect') ?? true) === false,
    },
    actions: {
      invokeOnOpen: ({ prop }) => prop('onOpenChange')?.({ open: true }),
      invokeOnClose: ({ prop, event }) => prop('onOpenChange')?.({ open: false, reason: closeReasonOf(event.current()) }),

      // 只在受控（open 为布尔）时回写；open 变回 undefined = 转非受控，不强制关闭
      syncOpen: ({ prop, send }) => {
        const open = prop('open')
        if (open === undefined)
          return
        send(open ? { type: 'CONTROLLED.OPEN' } : { type: 'CONTROLLED.CLOSE' })
      },

      setInputValue: ({ context, event }) => {
        const e = event.current()
        if (e.type === 'INPUT.CHANGE' || e.type === 'INPUT.SET')
          context.set('inputValue', e.value)
      },

      /** 回到 defaultInputValue（缺省即空串）。受控时只发意图，宿主不写回就照旧。 */
      resetInputValue: ({ context, prop }) => context.set('inputValue', prop('defaultInputValue') ?? ''),

      setHighlightedValue: ({ context, event }) => {
        const e = event.current()
        if (e.type === 'ITEM.HIGHLIGHT')
          context.set('highlightedValue', e.value)
      },

      clearHighlightedValue: ({ context }) => context.set('highlightedValue', null),

      /** 锚点落在首条可用命令上；一条都没有就留空。收起态不动锚点，退出动作已经清过。 */
      highlightFirst: ({ context, prop, state }) => {
        if (state.get() !== 'open')
          return
        const first = navigateCommandResults(commandResults(prop, context.get('inputValue')), null, 'first', true)
        context.set('highlightedValue', first?.value ?? null)
      },

      /** 锚点还指得着就不动；指不着了（清单换了、那条被禁用了）才落回首条。 */
      highlightIfDangling: ({ context, prop, state }) => {
        if (state.get() !== 'open')
          return
        const results = commandResults(prop, context.get('inputValue'))
        const current = context.get('highlightedValue')
        if (current != null && results.some(item => item.value === current && !item.disabled))
          return
        context.set('highlightedValue', navigateCommandResults(results, null, 'first', true)?.value ?? null)
      },

      // 在 DOM 提交后按新的 hidden 镜像重核；不能拿上一帧 hidden 阻止检索结果重新出现。
      highlightVisibleIfDangling: ({ context, prop, state }) => {
        if (state.get() !== 'open')
          return
        const hidden = new Set(context.get('hiddenValues'))
        const results = commandResults(prop, context.get('inputValue')).filter(item => !hidden.has(item.value))
        const current = context.get('highlightedValue')
        if (current != null && results.some(item => item.value === current && !item.disabled))
          return
        context.set('highlightedValue', navigateCommandResults(results, null, 'first', true)?.value ?? null)
      },

      /** 选中通知；条目自报禁用的在连接层就被挡下，走不到这里。 */
      invokeOnSelect: ({ prop, event }) => {
        const e = event.current()
        if (e.type === 'ITEM.SELECT')
          prop('onSelect')?.({ value: e.value, label: e.label })
      },
      syncModalResources: ({ refs }) => refs.get('syncModalResources')?.(),
    },
    effects: {
      trackItemVisibility: ({ refs, context, flush }) => {
        let alive = true
        let observer: MutationObserver | undefined
        let observedList: HTMLElement | null = null
        const sync = (): void => {
          if (!alive)
            return
          const next = [...hiddenCommandValues(observedList)].sort()
          const previous = context.get('hiddenValues')
          if (next.length !== previous.length || next.some((value, index) => value !== previous[index]))
            context.set('hiddenValues', next)
        }
        const rebind = (): void => {
          if (!alive)
            return
          const list = refs.get('getListEl')()
          if (list === observedList) {
            if (!list)
              sync()
            return
          }
          observer?.disconnect()
          observer = undefined
          observedList = list
          // 纯逻辑运行不要求挂载 DOM；已有列表必须使用它所属的 Window。
          if (!list) {
            sync()
            return
          }
          const win = list.ownerDocument.defaultView
          if (!win)
            throw new Error('[xh] Command 列表缺少所属 Window')
          observer = new win.MutationObserver(sync)
          observer.observe(list, { subtree: true, childList: true, attributes: true, attributeFilter: ['hidden', 'data-scope', 'data-part', 'data-value'] })
          sync()
        }
        const dispose = (): void => {
          alive = false
          observer?.disconnect()
          if (refs.get('syncListVisibility') === rebind)
            refs.set('syncListVisibility', null)
        }
        refs.set('syncListVisibility', rebind)
        try {
          flush(rebind)
        }
        catch (error) {
          dispose()
          throw error
        }
        return dispose
      },
      trackOverlay: ({ refs, prop, scope, send, flush, state, track }) => {
        let reactivateFocus: (() => void) | null = null
        return trackPresenceResources({
          presence: () => refs.get('presence'),
          open: () => state.get() === 'open',
          track,
          acquire: () => {
            const config = refs.get('config')
            const registerLayer = refs.get('registerLayer')
            // 无 DOM 环境（纯逻辑测试）：状态机照常转移，不挂副作用
            if (!config || !registerLayer)
              return undefined

            return setupLayerTransaction(registerLayer, (layer, defer, run) => {
              const getContentEl = refs.get('getContentEl')

              const dismiss = createDismissLayer({
                config,
                layer,
                // 退场期只占原栈位屏蔽下层，不再重复发关闭；两个公开开关仍可动态更新。
                onEscapeKeyDown: (e) => {
                  if (state.get() !== 'open' || !(prop('closeOnEscape') ?? true))
                    e.preventDefault()
                },
                onInteractOutside: (e) => {
                  if (state.get() !== 'open' || !(prop('closeOnInteractOutside') ?? prop('modal') ?? true))
                    e.preventDefault()
                },
                onDismiss: (reason) => {
                  if (state.get() === 'open')
                    send({ type: 'CLOSE', src: reason === 'escape-key' ? 'esc' : 'interact-outside' })
                },
              })
              defer(() => dismiss.dispose())

              // 焦点域无条件建，modal 只决定陷不陷焦点；逻辑关闭后内容立即 inert，焦点约束同步停用。
              const focus = createFocusScope({
                config,
                layer,
                container: getContentEl,
                trapped: () => state.get() === 'open' && (prop('modal') ?? true),
                loop: () => state.get() === 'open' && (prop('modal') ?? true),
                // 开场焦点落在检索框上：面板一露面就能直接打字
                initialFocus: () => refs.get('getInputEl')(),
                restoreFocus: () => prop('restoreFocus') ?? true,
                // 归还落点显式给 trigger：指针打开那一刻焦点未必真在它身上（Safari 点按不给按钮焦点），
                // 靠焦点域的创建前快照会把 Escape 之后的 Tab 起点丢到 body 上。
                // 按 connect 给 trigger 落的 id 现取，全局快捷键唤起的用法没有 trigger，归还照旧走快照
                restoreTarget: () => scope.getById<HTMLElement>(scope.partId('command', 'trigger')),
              })
              reactivateFocus = focus.reactivate
              defer(() => {
                reactivateFocus = null
                focus.dispose()
              })

              // 模态滚动锁与背景失活保持到 Presence 退出完成；modal 动态关闭仍立即释放。
              const modalResources = createModalLayerResources({
                config,
                layer,
                enabled: () => prop('modal') ?? true,
                // 栈中位于本层之上的层一并算作目标：内层浮层搬到落点之后也是它的
                // 直接子元素，不排除会被本层的 MutationObserver 打上 inert
                targets: () => [
                  getContentEl(),
                  ...config.layerRegistry.elementsAbove(layer),
                ].filter(Boolean) as Element[],
                flush,
                run,
              })
              defer(modalResources.dispose)
              const syncModalResources = (): void => modalResources.sync()
              refs.set('syncModalResources', syncModalResources)
              defer(() => {
                if (refs.get('syncModalResources') === syncModalResources)
                  refs.set('syncModalResources', null)
              })
              syncModalResources()
            }, { registry: config.layerRegistry, flush })
          },
          onReopen: () => {
            const activate = reactivateFocus
            flush(() => scope.getWin().requestAnimationFrame(() => {
              if (state.get() === 'open' && reactivateFocus === activate)
                activate?.()
            }))
          },
        })
      },
    },
  },
})
