import type { Placement, PositionResult } from '@xihan-ui/kernel'
import type { ComboboxFocusIntent, ComboboxSchema } from './combobox.types'
import { createDismissLayer, isItemDisabled, itemValue, navigateItems, queryItems } from '@xihan-ui/behavior'
import { resetDeclaredValue, setup } from '@xihan-ui/machine'
import { comboboxItemQuery, comboboxItemText } from './combobox.anatomy'

const { createMachine } = setup<ComboboxSchema>()

/** 未指定 placement 时的落位；定位引擎与 connect 共用这一个缺省。 */
export const COMBOBOX_DEFAULT_PLACEMENT: Placement = 'bottom-start'

/** 裸串是单选的简写，内部一律按数组处理；undefined 要原样透传，cell 靠它区分受控与否。 */
function toValues(input: string | string[] | undefined): string[] | undefined {
  if (input === undefined)
    return undefined
  return typeof input === 'string' ? [input] : [...input]
}

/** 选中集合的不变量：单选恒为长度 ≤ 1，多选去重。公开 API 与退格删末项都经这里收口。 */
function normalizeSelection(next: readonly string[], multiple: boolean): string[] {
  return multiple ? [...new Set(next)] : next.slice(0, 1)
}

/**
 * 数组按元素比。受控时 cell 每次读都把 prop 归一成新数组，引用比恒不相等，
 * 会导致版本号空转与 onValueChange 重复发。
 */
function sameValues(a: string[], b: string[] | undefined): boolean {
  return !!b && a.length === b.length && a.every((v, i) => v === b[i])
}

// 选中值与输入串走 cell 原生受控（给定 prop 即受控），不需要影子事件；
// 开合编进 FSM 状态，走守卫对 + CONTROLLED.* 影子事件 + watch。
export const comboboxMachine = createMachine({
  name: 'combobox',
  context: ({ prop, cell }) => ({
    position: cell<PositionResult | null>(() => ({ defaultValue: null })),
    value: cell<string[]>(() => ({
      value: toValues(prop('value')),
      defaultValue: toValues(prop('defaultValue')) ?? [],
      isEqual: sameValues,
      onChange: value => prop('onValueChange')?.({ value }),
    })),
    inputValue: cell<string>(() => ({
      value: prop('inputValue'),
      defaultValue: prop('defaultInputValue') ?? '',
      onChange: inputValue => prop('onInputValueChange')?.({ inputValue }),
    })),
    // 显示文本只能从活 DOM 取：条目文本是作者写的插槽内容，prop 里没有
    valueText: cell<string | null>(() => ({ defaultValue: null })),
    // 高亮不受控、不对外通知：它只服务 aria-activedescendant 与确认键的落点
    highlightedValue: cell<string | null>(() => ({ defaultValue: null })),
    // null = 还没结算过。默认写 0 会让首帧（DOM 尚未就位）误判为「无匹配项」而闪一下空态
    itemCount: cell<number | null>(() => ({ defaultValue: null })),
    focusIntent: cell<ComboboxFocusIntent>(() => ({ defaultValue: 'none' })),
  }),
  refs: () => ({
    config: null,
    registerLayer: null,
    position: null,
    getAnchorEl: () => null,
    getFloatingEl: () => null,
    getContentEl: () => null,
    getInputEl: () => null,
  }),
  initialState: ({ prop }) => ((prop('open') ?? prop('defaultOpen')) ? 'open' : 'closed'),
  // 挂载即按选中值结算一次显示文本，并据此把输入框填成选中项的文字
  entry: ['syncValueText', 'prefillInputValue'],
  watch: ({ track, prop, context, action }) => {
    // 开合受控时用户事件只发意图、不自改状态；宿主写回 open 后由这里派发影子事件无条件回写
    track([() => prop('open')], () => action(['syncOpen']))
    // 这条 watch 只兜宿主侧的写入，内部选中当场就同步过文本
    track([context.dep('value')], () => action(['syncValueText']))
  },
  on: {
    'FORM.RESET': { actions: ['resetToDefault'] },
    // 这几件事与开合无关，两个状态里都得认
    'VALUE.SET': { actions: ['setValue', 'syncValueText'] },
    'VALUE.CLEAR': { actions: ['clearValue'] },
    'INPUT.SET': { actions: ['setInputValue'] },
    'ITEMS.SYNC': { actions: ['syncItems'] },
  },
  states: {
    closed: {
      on: {
        // 受控命中 → 只发意图；非受控 → 落 target 并一并通知。
        // 落点意图先记进 context：受控时转移那一拍走 CONTROLLED.OPEN，读不到当初那个按键事件
        'OPEN': [
          { guard: 'isOpenControlled', actions: ['setFocusIntent', 'invokeOnOpen'] },
          { target: 'open', actions: ['setFocusIntent', 'invokeOnOpen'] },
        ],
        'TOGGLE': [
          { guard: 'isOpenControlled', actions: ['setFocusIntent', 'invokeOnOpen'] },
          { target: 'open', actions: ['setFocusIntent', 'invokeOnOpen'] },
        ],
        // 打字即展开
        'INPUT.CHANGE': [
          { guard: 'isOpenControlled', actions: ['setInputValue', 'setFocusIntent', 'invokeOnOpen', 'refreshAfterInput'] },
          { target: 'open', actions: ['setInputValue', 'setFocusIntent', 'invokeOnOpen', 'refreshAfterInput'] },
        ],
        'INPUT.BLUR': { actions: ['reconcileInput'] },
        'CONTROLLED.OPEN': { target: 'open' },
      },
    },
    open: {
      // 先结算候选条数（空态节点据此显形），再按落点意图挑高亮
      entry: ['syncItems', 'setInitialHighlightedValue'],
      exit: ['clearHighlightedValue'],
      // 进入 open：定位 → 消解。退出时逆序拆。焦点全程留在输入框，因此不挂焦点域
      effects: ['trackPosition', 'trackLayer'],
      on: {
        'CLOSE': [
          { guard: 'isOpenControlled', actions: ['invokeOnClose'] },
          { target: 'closed', actions: ['invokeOnClose'] },
        ],
        'TOGGLE': [
          { guard: 'isOpenControlled', actions: ['invokeOnClose'] },
          { target: 'closed', actions: ['invokeOnClose'] },
        ],
        // Escape 分两拍：先摘掉高亮，高亮已空才收起列表
        'ESCAPE': [
          { guard: 'hasHighlight', actions: ['clearHighlightedValue'] },
          { guard: 'isOpenControlled', actions: ['invokeOnClose'] },
          { target: 'closed', actions: ['invokeOnClose'] },
        ],
        'INPUT.CHANGE': { actions: ['setInputValue', 'refreshAfterInput'] },
        // 焦点离开整个组件：收起并把输入串与选中值对齐
        'INPUT.BLUR': [
          { guard: 'isOpenControlled', actions: ['reconcileInput', 'invokeOnClose'] },
          { target: 'closed', actions: ['reconcileInput', 'invokeOnClose'] },
        ],
        'ITEM.HIGHLIGHT': { actions: ['setHighlightedValue'] },
        'HIGHLIGHT.CLEAR': { actions: ['clearHighlightedValue'] },
        // 多选选完接着筛：列表不收起。单选选完即收起，走与 CLOSE 相同的收口
        'ITEM.SELECT': [
          { guard: 'isMultiple', actions: ['selectItem'] },
          { guard: 'isOpenControlled', actions: ['selectItem', 'invokeOnClose'] },
          { target: 'closed', actions: ['selectItem', 'invokeOnClose'] },
        ],
        'VALUE.COMMIT': [
          { guard: 'isMultiple', actions: ['commitInputValue'] },
          { guard: 'isOpenControlled', actions: ['commitInputValue', 'invokeOnClose'] },
          { target: 'closed', actions: ['commitInputValue', 'invokeOnClose'] },
        ],
        'CONTROLLED.CLOSE': { target: 'closed' },
      },
    },
  },
  implementations: {
    guards: {
      isOpenControlled: ({ prop }) => prop('open') !== undefined,
      isMultiple: ({ prop }) => !!prop('multiple'),
      hasHighlight: ({ context }) => context.get('highlightedValue') != null,
    },
    actions: {
      // 值与输入串是两条独立受控轴，各判各的；高亮锚点指向的条目可能已被过滤掉
      resetToDefault: (params) => {
        resetDeclaredValue(params, 'value', 'value', 'defaultValue')
        resetDeclaredValue(params, 'inputValue', 'inputValue', 'defaultInputValue')
        params.context.reset('highlightedValue')
        params.action(['syncValueText'])
      },

      invokeOnOpen: ({ prop }) => prop('onOpenChange')?.({ open: true }),
      invokeOnClose: ({ prop }) => prop('onOpenChange')?.({ open: false }),

      // 只在受控（open 为布尔）时回写；open 变回 undefined = 转非受控，不强制关闭
      syncOpen: ({ prop, send }) => {
        const open = prop('open')
        if (open === undefined)
          return
        send(open ? { type: 'CONTROLLED.OPEN' } : { type: 'CONTROLLED.CLOSE' })
      },

      setFocusIntent: ({ context, event }) => {
        const e = event.current()
        if (e.type === 'OPEN' || e.type === 'TOGGLE') {
          context.set('focusIntent', e.focus ?? 'none')
          return
        }
        // 打字展开时不替用户预选，具体挑不挑由 inputBehavior 说了算
        if (e.type === 'INPUT.CHANGE')
          context.set('focusIntent', 'none')
      },

      setInitialHighlightedValue: ({ refs, prop, context, state, flush }) => {
        const pick = (): void => {
          const intent = context.get('focusIntent')
          if (intent === 'none') {
            context.set('highlightedValue', null)
            return
          }
          const content = refs.get('getContentEl')()
          // 无 DOM 环境时锚点留空，状态转移不受影响
          if (!content)
            return
          const items = queryItems(content, comboboxItemQuery)
          if (intent === 'selected') {
            // 选中项仍在候选里且可停留才高亮它，不在就不高亮
            const selected = context.get('value')[0] ?? null
            const el = items.find(item => itemValue(item) === selected && !isItemDisabled(item))
            context.set('highlightedValue', itemValue(el ?? null))
            return
          }
          context.set('highlightedValue', itemValue(navigateItems(items, null, intent, { loop: prop('loop') ?? true })))
        }
        pick()
        // 初始即展开时条目的身份标记还没写入，这一刻查不到条目，推迟一拍再挑一次
        flush(() => {
          if (state.get() === 'open' && context.get('highlightedValue') == null)
            pick()
        })
      },

      setHighlightedValue: ({ context, event }) => {
        const e = event.current()
        if (e.type === 'ITEM.HIGHLIGHT')
          context.set('highlightedValue', e.value)
      },

      clearHighlightedValue: ({ context }) => context.set('highlightedValue', null),

      setInputValue: ({ context, event }) => {
        const e = event.current()
        if (e.type === 'INPUT.CHANGE' || e.type === 'INPUT.SET')
          context.set('inputValue', e.value)
      },

      /**
       * 候选集合重新结算：条数供空态节点用，同时把悬空的高亮摘掉。
       * 过滤是调用方做的，机器无从预知何时变，所以适配器每次提交完 DOM 都要发一次 ITEMS.SYNC。
       */
      syncItems: ({ refs, context }) => {
        const content = refs.get('getContentEl')()
        if (!content)
          return
        const items = queryItems(content, comboboxItemQuery)
        context.set('itemCount', items.length)
        const highlighted = context.get('highlightedValue')
        // 高亮项被筛掉时必须摘掉，否则 aria-activedescendant 指向一个不存在的 id
        if (highlighted != null && !items.some(el => itemValue(el) === highlighted))
          context.set('highlightedValue', null)
      },

      /** 输入串变化后的收尾。必须推迟一拍：调用方要等收到 onInputValueChange 才重渲，此刻查到的是旧候选。 */
      refreshAfterInput: ({ refs, prop, context, state, event, flush }) => {
        const e = event.current()
        // 删字时不做内联补全，否则退格补回来、字永远删不掉
        const deleting = e.type === 'INPUT.CHANGE' && !!e.deleting
        flush(() => {
          if (state.get() !== 'open')
            return
          const content = refs.get('getContentEl')()
          if (!content)
            return
          const items = queryItems(content, comboboxItemQuery)
          context.set('itemCount', items.length)

          const behavior = prop('inputBehavior') ?? 'none'
          if (behavior === 'none') {
            const highlighted = context.get('highlightedValue')
            if (highlighted != null && !items.some(el => itemValue(el) === highlighted))
              context.set('highlightedValue', null)
            return
          }

          const first = navigateItems(items, null, 'first')
          context.set('highlightedValue', itemValue(first))
          if (behavior !== 'autocomplete' || !first || deleting)
            return

          // 内联补全：把输入框补成首个候选的文本，补出的那段设为选区；
          // 只在候选文本以已输入部分开头时补，否则会把用户打的字整段换掉
          const typed = context.get('inputValue')
          const text = comboboxItemText(first)
          if (typed === '' || text.length <= typed.length || !text.toLowerCase().startsWith(typed.toLowerCase()))
            return
          const input = refs.get('getInputEl')()
          if (!input)
            return
          // 先落 context 再写 DOM：适配器随后重渲时值已相同，不会重设 value 把选区冲掉
          context.set('inputValue', text)
          input.value = text
          input.setSelectionRange?.(typed.length, text.length)
        })
      },

      /**
       * 单选选中项的显示文本。给了 collection 就按数据取，一次算完；
       * 没给才回到活 DOM 现查那条老路，那条路上首帧条目可能还没挂上身份标记，查不到就推迟一拍再来一次。
       */
      syncValueText: ({ refs, prop, context, flush }) => {
        const resolve = (): boolean => {
          const value = context.get('value')
          // 多选没有「那一个」显示文本，恒为空；输入串在多选下只是筛选用的草稿
          if (value.length !== 1) {
            context.set('valueText', null)
            return true
          }
          const collection = prop('collection')
          if (collection) {
            const node = collection.find(item => item.value === value[0])
            // 数据里没有这一项（宿主已把它筛出候选）时留着上一次算出的文本，不改写
            if (node)
              context.set('valueText', node.label ?? node.value)
            return true
          }
          const content = refs.get('getContentEl')()
          if (!content)
            return false
          const el = queryItems(content, comboboxItemQuery).find(item => itemValue(item) === value[0])
          if (!el)
            return false
          context.set('valueText', comboboxItemText(el))
          return true
        }
        if (resolve())
          return
        flush(() => {
          resolve()
        })
      },

      /** 挂载时把输入框填成选中项的文字；给了 inputValue / defaultInputValue 或多选时不填。 */
      prefillInputValue: ({ prop, context, flush }) => {
        if (prop('multiple') || prop('inputValue') !== undefined || prop('defaultInputValue') !== undefined)
          return
        const fill = (): void => {
          const text = context.get('valueText')
          // 用户已经打了字就不覆盖：显示文本可能要等一拍才结算得出来
          if (text == null || context.get('inputValue') !== '')
            return
          context.set('inputValue', text)
        }
        fill()
        flush(fill)
      },

      selectItem: ({ context, prop, event }) => {
        const e = event.current()
        if (e.type !== 'ITEM.SELECT')
          return
        const current = context.get('value')
        if (prop('multiple')) {
          context.set('value', current.includes(e.value) ? current.filter(v => v !== e.value) : [...current, e.value])
          // 多选选完接着筛下一个：输入串清空，候选回到未过滤的全集
          context.set('inputValue', '')
          return
        }
        context.set('value', [e.value])
        // 文本由调用方在事件那一刻取好带过来，条目随后可能被过滤掉就查不到了
        context.set('valueText', e.label ?? null)
        context.set('inputValue', e.label ?? e.value)
      },

      commitInputValue: ({ context, prop }) => {
        if (!prop('allowCustomValue'))
          return
        const text = context.get('inputValue')
        if (text === '')
          return
        const current = context.get('value')
        if (prop('multiple')) {
          if (!current.includes(text))
            context.set('value', [...current, text])
          context.set('inputValue', '')
          return
        }
        // 输入串等于当前选中项的显示文本时不提交，否则值会被换成标签
        if (text === context.get('valueText'))
          return
        context.set('value', [text])
        context.set('valueText', text)
      },

      setValue: ({ context, prop, event }) => {
        const e = event.current()
        if (e.type !== 'VALUE.SET')
          return
        context.set('value', normalizeSelection(e.value, !!prop('multiple')))
      },

      clearValue: ({ context }) => {
        context.set('value', [])
        context.set('valueText', null)
        context.set('inputValue', '')
      },

      /**
       * 焦点离场时让输入串与选中值对齐：
       * 不许自定义值时把没提交的字收回去；允许自定义值时输入串本身就是值。
       */
      reconcileInput: ({ context, prop }) => {
        const multiple = !!prop('multiple')
        const text = context.get('inputValue')
        if (prop('allowCustomValue')) {
          // 多选下不替用户造 token，只把残留清掉
          if (multiple) {
            context.set('inputValue', '')
            return
          }
          // 输入串等于当前选中项的显示文本时让开，否则值会被换成标签
          if (text === context.get('valueText'))
            return
          context.set('value', text === '' ? [] : [text])
          context.set('valueText', text === '' ? null : text)
          return
        }
        context.set('inputValue', multiple ? '' : (context.get('valueText') ?? ''))
      },
    },
    effects: {
      // 定位全程在 effect 里：引擎订阅的返回值即 cleanup，位置结果写进 context 供 connect 读
      trackPosition: ({ refs, prop, context, flush }) => {
        // 进入展开态先清上一次的坐标：引擎量完之前不算落位，皮肤据此藏着。
        // 不清的话重开会按上次的位置判「已落位」——页面滚过就在旧位置闪一帧
        context.set('position', null)
        const engine = refs.get('position')
        // 无引擎时不定位，其余照常
        if (!engine)
          return undefined

        let stop: (() => void) | undefined
        let disposed = false

        // 必须等 DOM 落定再挂：进入展开态这一刻 content 还带着 hidden，此时量出的浮层尺寸为 0
        flush(() => {
          if (disposed)
            return
          const anchor = refs.get('getAnchorEl')()
          const floating = refs.get('getFloatingEl')()
          if (!anchor || !floating)
            return
          stop = engine.attach(
            anchor,
            floating,
            {
              placement: prop('placement') ?? COMBOBOX_DEFAULT_PLACEMENT,
              offset: prop('offset'),
              // positioner 渲染成 fixed，坐标系必须跟着走视口系
              strategy: 'fixed',
              // start / end 是逻辑对齐，RTL 下行内轴要翻过来
              dir: prop('dir'),
              // 落定那一侧的可用空间，connect 转成内联自定义属性给皮肤限高
              size: true,
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
        // 无 DOM 环境不挂副作用，状态机照常转移
        if (!config || !registerLayer)
          return undefined

        const { layer, dispose: disposeLayer } = registerLayer()

        const dismiss = createDismissLayer({
          config,
          layer,
          onDismiss: (reason) => {
            // Escape 走两拍（先清高亮再收起），所以不复用 CLOSE
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

        // 列表不接管焦点，因此没有焦点域可挂；焦点离开整个组件由输入框的 blur 上报（INPUT.BLUR）
        return () => {
          dismiss.dispose()
          disposeLayer()
        }
      },
    },
  },
})
