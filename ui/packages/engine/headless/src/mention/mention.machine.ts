import type { Placement, PositionResult } from '@xihan-ui/kernel'
import type { MentionSchema, MentionTrigger } from './mention.types'
import { createDismissLayer, itemValue, navigateItems, queryItems } from '@xihan-ui/behavior'
import { setup } from '@xihan-ui/machine'
import { mentionItemQuery } from './mention.anatomy'
import { findMentionTrigger, insertMention, normalizeMentionPrefixes } from './mention.trigger'

const { createMachine } = setup<MentionSchema>()

/** 未指定 placement 时的落位；定位引擎与 connect 共用这一个缺省。 */
export const MENTION_DEFAULT_PLACEMENT: Placement = 'bottom-start'

/** 触发按字段比。引用比会让每次重算都算成变化，onQueryChange 因此空转。 */
function sameTrigger(a: MentionTrigger | null, b: MentionTrigger | null | undefined): boolean {
  if (a === b)
    return true
  if (!a || !b)
    return false
  return a.index === b.index && a.prefix === b.prefix && a.query === b.query
}

/** 取容器里首个可停留的候选值。 */
function firstItemValue(content: HTMLElement): string | null {
  return itemValue(navigateItems(queryItems(content, mentionItemQuery), null, 'first'))
}

/**
 * 提及不是独立的值：它就写在正文里，选中动作是「把光标处那段查询串换成候选文本」。
 * 因此这台机器持有的是整段正文与一个「光标处的触发」，而不是选中集合与输入串两条线。
 *
 * 开合不受控：它完全由触发算出来——有触发就开、没触发就合，
 * 唯一的例外是 Escape 记下的那一处，光标不挪走就不再自动展开。
 */
export const mentionMachine = createMachine({
  name: 'mention',
  context: ({ prop, cell }) => ({
    position: cell<PositionResult | null>(() => ({ defaultValue: null })),
    value: cell<string>(() => ({
      value: prop('value'),
      defaultValue: prop('defaultValue') ?? '',
      onChange: value => prop('onValueChange')?.({ value }),
    })),
    trigger: cell<MentionTrigger | null>(() => ({
      defaultValue: null,
      isEqual: sameTrigger,
      onChange: trigger => prop('onQueryChange')?.({
        query: trigger?.query ?? null,
        prefix: trigger?.prefix ?? null,
      }),
    })),
    dismissedIndex: cell<number | null>(() => ({ defaultValue: null })),
    // 高亮不受控、不对外通知：它只服务 aria-activedescendant 与回车的落点
    highlightedValue: cell<string | null>(() => ({ defaultValue: null })),
    itemCount: cell<number | null>(() => ({ defaultValue: null })),
  }),
  refs: () => ({
    config: null,
    registerLayer: null,
    position: null,
    getFloatingEl: () => null,
    getContentEl: () => null,
    getInputEl: () => null,
  }),
  // 挂载时光标在哪还不知道，一律从收起态起步
  initialState: () => 'closed',
  on: {
    // 这三件事与开合无关，两个状态里都得认
    'INPUT.CHANGE': { actions: ['setValue', 'syncTrigger', 'refreshCandidates'] },
    'CARET.SYNC': { actions: ['syncTrigger', 'refreshCandidates'] },
    'VALUE.SET': { actions: ['replaceValue'] },
    'ITEMS.SYNC': { actions: ['syncItems', 'ensureHighlight'] },
  },
  states: {
    closed: {
      on: {
        OPEN: { target: 'open', actions: ['invokeOnOpen'] },
      },
    },
    open: {
      // 先结算候选条数，再把高亮落到首条：提及浮层恒有高亮，回车才有确定的落点
      entry: ['syncItems', 'highlightFirst'],
      exit: ['clearHighlightedValue'],
      // 定位 → 消解。焦点全程留在输入框，因此不挂焦点域
      effects: ['trackPosition', 'trackLayer'],
      on: {
        'CLOSE': { target: 'closed', actions: ['invokeOnClose'] },
        'ESCAPE': { target: 'closed', actions: ['dismissHere', 'invokeOnClose'] },
        'ITEM.HIGHLIGHT': { actions: ['setHighlightedValue'] },
        'ITEM.SELECT': { target: 'closed', actions: ['selectItem', 'invokeOnClose'] },
      },
    },
  },
  implementations: {
    actions: {
      invokeOnOpen: ({ prop }) => prop('onOpenChange')?.({ open: true }),
      invokeOnClose: ({ prop }) => prop('onOpenChange')?.({ open: false }),

      // 禁用时正文一动不动：原生 disabled 已经挡住了打字，这条兜住程序化派进来的输入事件
      setValue: ({ context, prop, event }) => {
        const e = event.current()
        if (e.type === 'INPUT.CHANGE' && !prop('disabled'))
          context.set('value', e.value)
      },

      /** 程序化改写整段正文：触发点无从谈起，一并收起。 */
      replaceValue: ({ context, send, event }) => {
        const e = event.current()
        if (e.type !== 'VALUE.SET')
          return
        context.set('value', e.value)
        context.set('trigger', null)
        context.set('dismissedIndex', null)
        send({ type: 'CLOSE' })
      },

      /**
       * 按光标位置重算触发，并据此开合浮层。
       * 开合是算出来的，所以这里发 OPEN / CLOSE 而不是自己改状态——
       * 已经开着时再发 OPEN 是空转，收起态发 CLOSE 同理，两边都不会重复通知。
       */
      syncTrigger: ({ prop, context, event, send }) => {
        const e = event.current()
        if (e.type !== 'INPUT.CHANGE' && e.type !== 'CARET.SYNC')
          return
        if (prop('disabled')) {
          context.set('trigger', null)
          send({ type: 'CLOSE' })
          return
        }
        // 光标事件只在框里的正文与本机记的一致时才算数：刚插完一条提及、适配器还没把新正文
        // 渲进去的那一拍，框里还是改动前的文字，照它重算会把刚合上的浮层又弹回来
        if (e.type === 'CARET.SYNC' && e.value !== context.get('value'))
          return

        const found = findMentionTrigger(e.value, e.caret, normalizeMentionPrefixes(prop('prefix')))
        const dismissed = context.get('dismissedIndex')
        // 触发点换了地方，上一次 Escape 的记录随之作废
        if (!found || found.index !== dismissed)
          context.set('dismissedIndex', null)
        const next = found && found.index === dismissed ? null : found
        context.set('trigger', next)
        send(next ? { type: 'OPEN' } : { type: 'CLOSE' })
      },

      /**
       * 查询串变了之后重新结算候选。必须推迟一拍：调用方要等收到 onQueryChange 才重渲，
       * 此刻查到的是上一批候选。
       */
      refreshCandidates: ({ refs, context, state, flush }) => {
        flush(() => {
          if (state.get() !== 'open')
            return
          const content = refs.get('getContentEl')()
          if (!content)
            return
          const items = queryItems(content, mentionItemQuery)
          context.set('itemCount', items.length)
          const highlighted = context.get('highlightedValue')
          // 高亮被筛掉就改停到首条，不留一个指向不存在 id 的 aria-activedescendant
          if (highlighted == null || !items.some(el => itemValue(el) === highlighted))
            context.set('highlightedValue', firstItemValue(content))
        })
      },

      /** 只结算条数并摘掉悬空高亮。进入展开态时也跑它，那一刻 state 还没翻，不能按状态分支。 */
      syncItems: ({ refs, context }) => {
        const content = refs.get('getContentEl')()
        if (!content)
          return
        const items = queryItems(content, mentionItemQuery)
        context.set('itemCount', items.length)
        const highlighted = context.get('highlightedValue')
        if (highlighted != null && !items.some(el => itemValue(el) === highlighted))
          context.set('highlightedValue', null)
      },

      /** 展开即高亮首条。 */
      highlightFirst: ({ refs, context, state, flush }) => {
        const pick = (): void => {
          const content = refs.get('getContentEl')()
          if (content)
            context.set('highlightedValue', firstItemValue(content))
        }
        pick()
        // 展开这一刻候选可能还没挂上身份标记，推迟一拍再挑一次
        flush(() => {
          if (state.get() === 'open' && context.get('highlightedValue') == null)
            pick()
        })
      },

      /** 候选集合变过之后补一个高亮，展开态恒有落点。 */
      ensureHighlight: ({ refs, context, state }) => {
        if (state.get() !== 'open' || context.get('highlightedValue') != null)
          return
        const content = refs.get('getContentEl')()
        if (content)
          context.set('highlightedValue', firstItemValue(content))
      },

      setHighlightedValue: ({ context, event }) => {
        const e = event.current()
        if (e.type === 'ITEM.HIGHLIGHT')
          context.set('highlightedValue', e.value)
      },

      clearHighlightedValue: ({ context }) => context.set('highlightedValue', null),

      /** 记下被关掉的那个触发点，光标不离开它就不再自动展开。 */
      dismissHere: ({ context }) => {
        context.set('dismissedIndex', context.get('trigger')?.index ?? null)
        context.set('trigger', null)
      },

      /**
       * 把候选插进正文：换掉的只是光标处那段查询串，前后文一字不动，光标随后落在插入内容之后。
       */
      selectItem: ({ context, prop, event, refs, flush }) => {
        const e = event.current()
        if (e.type !== 'ITEM.SELECT')
          return
        const trigger = context.get('trigger')
        if (!trigger)
          return
        const label = e.label ?? e.value
        const { value, caret } = insertMention(context.get('value'), trigger, label)
        context.set('value', value)
        context.set('trigger', null)
        context.set('dismissedIndex', null)
        prop('onSelect')?.({ value: e.value, label, prefix: trigger.prefix })

        // 正文落定才移光标。受控宿主没把这次改动写回来时 context 里还是旧文，此时不动框里的东西
        flush(() => {
          const el = refs.get('getInputEl')()
          if (!el || context.get('value') !== value)
            return
          if (el.value !== value)
            el.value = value
          el.setSelectionRange?.(caret, caret)
        })
      },
    },
    effects: {
      // 定位全程在 effect 里：引擎订阅的返回值即 cleanup，位置结果写进 context 供 connect 读
      trackPosition: ({ refs, prop, context, flush }) => {
        const engine = refs.get('position')
        if (!engine)
          return undefined

        let stop: (() => void) | undefined
        let disposed = false

        // 必须等 DOM 落定再挂：进入展开态这一刻 content 还带着 hidden，此时量出的浮层尺寸为 0
        flush(() => {
          if (disposed)
            return
          const anchor = refs.get('getInputEl')()
          const floating = refs.get('getFloatingEl')()
          if (!anchor || !floating)
            return
          stop = engine.attach(
            anchor,
            floating,
            {
              placement: prop('placement') ?? MENTION_DEFAULT_PLACEMENT,
              offset: prop('offset'),
              // positioner 渲染成 fixed，坐标系必须跟着走视口系
              strategy: 'fixed',
            },
            result => context.set('position', result),
          )
        })

        return () => {
          disposed = true
          stop?.()
        }
      },

      // 层只在展开期间入栈；常驻栈会让后挂载的层永久占着栈顶，堵死它下面每一层的 Escape
      trackLayer: ({ refs, send }) => {
        const config = refs.get('config')
        const registerLayer = refs.get('registerLayer')
        if (!config || !registerLayer)
          return undefined

        const { layer, dispose: disposeLayer } = registerLayer()

        const dismiss = createDismissLayer({
          config,
          layer,
          onDismiss: (reason) => {
            // Escape 要记下这一处，与点外面收起不是一回事
            if (reason === 'escape-key') {
              send({ type: 'ESCAPE' })
              return
            }
            // 焦点跑到层外与输入框自己的 blur 是同一件事，只认后者，
            // 两处都收口时 onOpenChange 会为同一次离场发两遍
            if (reason === 'focus-outside')
              return
            send({ type: 'CLOSE' })
          },
        })

        return () => {
          dismiss.dispose()
          disposeLayer()
        }
      },
    },
  },
})
