import type { NavIntent } from '@xihan-ui/behavior'
import type { NormalizeProps, PropTypes } from '@xihan-ui/kernel'
import type { Service } from '@xihan-ui/machine'
import type { MentionApi, MentionInputEl, MentionInputProps, MentionItemProps, MentionNodeMeta, MentionSchema } from './mention.types'
import { isItemDisabled, ITEM_VALUE_ATTR, itemValue, navigateItems, queryItems } from '@xihan-ui/behavior'
import { contains, dataAttr, isComposingEvent } from '@xihan-ui/kernel'
import { overlayPositioned } from '../shared/overlay'
import { mentionAnatomy, mentionItemQuery, mentionItemText } from './mention.anatomy'
import { MENTION_DEFAULT_PLACEMENT } from './mention.machine'

const parts = mentionAnatomy.build()

/** 只有这些键单纯挪光标；正文与它们无关，重算触发才有意义。 */
const CARET_KEYS = new Set(['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'PageUp', 'PageDown'])

/**
 * 输入宿主是不是多行。
 *
 * textarea 的允许角色只有它自带的 textbox，写 role="combobox" 是文档一致性违规；
 * 而 aria-expanded 不在 textbox 的支持属性里。所以多行宿主上 type / role / aria-expanded
 * 三条一并缺席，「有候选浮层」改由 aria-haspopup、aria-controls、aria-autocomplete
 * 与 aria-activedescendant 表达——这四条 textbox 都支持。
 */
function isMultilineHost(input: MentionInputProps): boolean {
  return (input.as ?? 'textarea') === 'textarea'
}

/** 取光标位置；拿不到就当在末尾。 */
function caretOf(el: MentionInputEl): number {
  return el.selectionStart ?? el.value.length
}

// 落定那一侧的可用高度。贴边时引擎会回报 0，直接写进 min() 会把面板压成零高，
// 所以低于这个下限就当作没算出来：空串撤掉声明，退回皮肤 positioner 上那档 100vh
const AVAILABLE_H_FLOOR = 96

function availableHeightVar(available: number | undefined): Record<string, string> {
  return {
    '--xh-_mention-available-h':
      available != null && available >= AVAILABLE_H_FLOOR ? `${available}px` : '',
  }
}

export function connectMention<T extends PropTypes>(
  service: Service<MentionSchema>,
  normalize: NormalizeProps<T>,
): MentionApi<T> {
  const { state, prop, send, context, refs, scope } = service
  const open = state.get() === 'open'
  const ids = scope.ids('mention', 'content')

  const value = context.get('value')
  const trigger = context.get('trigger')
  // 高亮不承载焦点，只经 aria-activedescendant 上报；收起时为 null
  const highlighted = context.get('highlightedValue') ?? null
  const disabled = !!prop('disabled')
  const readOnly = !!prop('readOnly')
  const invalid = !!prop('invalid')
  const loop = prop('loop') ?? true
  const inputLabel = prop('translations')?.input
  const placeholder = prop('placeholder')
  const stateAttr = open ? 'open' : 'closed'
  // 位置由引擎写进 context，这里只读结果，不量 DOM、不调引擎
  const position = context.get('position')
  const placement = position?.placement ?? prop('placement') ?? MENTION_DEFAULT_PLACEMENT

  // collection 推出的候选元信息：显示文本与禁用都在这里定案，条目部件只报 value
  const nodes = prop('collection')
  const collection: MentionNodeMeta[] = (nodes ?? []).map(node => ({
    value: node.value,
    label: node.label ?? node.value,
    disabled: !!node.disabled,
  }))
  const metaOf = new Map(collection.map(meta => [meta.value, meta]))

  const isHighlighted = (v: string): boolean => highlighted === v

  /** 条目 id。aria-activedescendant 只认单个 IDREF，值里带空格会把它劈成两截，所以先编码再拼。 */
  const itemId = (v: string): string => scope.partId(mentionAnatomy.name, `item:${encodeURIComponent(v)}`)

  /** 候选禁用：部件上写的优先，没写就回 collection 里查。 */
  const itemDisabled = (item: MentionItemProps): boolean =>
    item.disabled ?? metaOf.get(item.value)?.disabled ?? false

  const itemStateAttrs = (item: MentionItemProps): Record<string, string | undefined> => ({
    'data-highlighted': dataAttr(isHighlighted(item.value)),
    'data-disabled': dataAttr(itemDisabled(item)),
  })

  /**
   * 候选集合只在事件那一刻读，顺序即文档序。
   * 渲染期不得调用：那里 Vue 读到上一帧、WC 读到本帧。
   */
  const items = (): HTMLElement[] => queryItems(refs.get('getContentEl')(), mentionItemQuery)

  /** 移高亮。焦点不动，但列表要跟着滚，否则长列表里高亮会跑出可视区。 */
  const highlightBy = (intent: NavIntent): void => {
    const el = navigateItems(items(), highlighted, intent, { loop })
    const next = itemValue(el)
    if (next == null)
      return
    send({ type: 'ITEM.HIGHLIGHT', value: next })
    el?.scrollIntoView?.({ block: 'nearest', inline: 'nearest' })
  }

  /** 确认键：认高亮所在的候选，自报禁用的不认。返回是否真提交了。 */
  const commitHighlighted = (): boolean => {
    if (highlighted == null)
      return false
    const el = items().find(item => itemValue(item) === highlighted)
    if (!el || isItemDisabled(el))
      return false
    // 文本在事件这一刻取好带给机器，插入后条目立刻会被过滤掉
    send({ type: 'ITEM.SELECT', value: highlighted, label: mentionItemText(el) })
    return true
  }

  /** 上报光标位置，机器据此重算触发。 */
  const syncCaret = (el: MentionInputEl): void => {
    send({ type: 'CARET.SYNC', value: el.value, caret: caretOf(el) })
  }

  return {
    open,
    collection,
    value,
    query: trigger?.query ?? null,
    activePrefix: trigger?.prefix ?? null,
    highlightedValue: highlighted,
    disabled,
    isHighlighted,
    setValue: next => send({ type: 'VALUE.SET', value: next }),
    close: () => send({ type: 'CLOSE' }),

    // 三个视觉轴打在根与 positioner 上：输入框与候选各从就近的那一处继承私有槽，其余子部件不重复标注
    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      'data-state': stateAttr,
      'data-variant': prop('variant'),
      'data-tone': prop('tone'),
      'data-size': prop('size'),
      'data-disabled': dataAttr(disabled),
      'data-readonly': dataAttr(readOnly),
      'data-invalid': dataAttr(invalid),
    }),

    /**
     * 可及名字与占位文字都只在给了才输出。
     * 输出一条空的 aria-label / placeholder 会把作者写在 input 部件上的那份抹掉——
     * WC 侧的属性铺设按「值为 undefined 即删属性」办事。
     */
    getInputProps: (input = {}) => normalize.textarea({
      ...parts.input.attrs,
      ...(inputLabel === undefined ? {} : { 'aria-label': inputLabel }),
      ...(placeholder === undefined ? {} : { placeholder }),
      // textarea 没有 type 属性
      'type': isMultilineHost(input) ? undefined : 'text',
      // 多行宿主保留它自带的 textbox 角色，不改成 combobox
      'role': isMultilineHost(input) ? undefined : 'combobox',
      // 关掉浏览器自带的历史补全，它会盖在候选列表上
      'autocomplete': 'off',
      'value': value,
      'disabled': disabled || undefined,
      'readonly': readOnly || undefined,
      // 显式 true/false：省略是没说，显式 false 是明确说了不是
      'aria-invalid': invalid ? 'true' : 'false',
      'aria-haspopup': 'listbox',
      // aria-expanded 不在 textbox 的支持属性里，多行宿主上整条缺席
      'aria-expanded': isMultilineHost(input) ? undefined : (open ? 'true' : 'false'),
      'aria-controls': ids.content,
      'aria-autocomplete': 'list',
      // 收起态没有高亮可指，属性整个缺席（aria-activedescendant 没有"假值"写法）
      'aria-activedescendant': open && highlighted != null ? itemId(highlighted) : undefined,
      'data-state': stateAttr,
      'data-disabled': dataAttr(disabled),
      'data-invalid': dataAttr(invalid),
      'onInput': (event: Event) => {
        const el = event.target as MentionInputEl
        send({ type: 'INPUT.CHANGE', value: el.value, caret: caretOf(el) })
      },
      // 点进正文别处即换了一个光标位置，触发要跟着重算
      'onClick': (event: MouseEvent) => {
        syncCaret(event.currentTarget as MentionInputEl)
      },
      /**
       * 只认纯移动光标的按键。
       * 回车这类在 keydown 里已经办完事的按键不能进来：那一刻正文刚换过、框里还是旧文，
       * 照它重算会把刚插完提及的位置又认成一次触发。
       */
      'onKeyUp': (event: KeyboardEvent) => {
        if (CARET_KEYS.has(event.key))
          syncCaret(event.currentTarget as MentionInputEl)
      },
      'onBlur': (event: FocusEvent) => {
        const el = event.currentTarget as HTMLElement
        const root = el.closest<HTMLElement>(parts.root.selector)
        // 焦点还在组件内部（点了候选之类）不算离场
        if (root && contains(root, event.relatedTarget as Node | null))
          return
        send({ type: 'CLOSE' })
      },
      'onKeyDown': (event: KeyboardEvent) => {
        // 收起态一条按键都不接管：这是一个正文输入框，抢键就等于抢走了打字
        if (disabled || !open)
          return
        // 组合期间的按键属于输入法候选框，组件一律不接
        if (isComposingEvent(event))
          return
        // 带修饰键的组合归浏览器与读屏
        if (event.ctrlKey || event.metaKey || event.altKey)
          return
        const key = event.key

        if (key === 'ArrowDown') {
          event.preventDefault()
          highlightBy('next')
          return
        }
        if (key === 'ArrowUp') {
          event.preventDefault()
          highlightBy('prev')
          return
        }
        if (key === 'Enter') {
          if (commitHighlighted()) {
            // 提交了候选就吞掉这次回车，正文里不留换行
            event.preventDefault()
            return
          }
          // 没有可提交的候选：回车照常换行，只把浮层收起来
          send({ type: 'CLOSE' })
          return
        }
        if (key === 'Escape') {
          // 收起由消解层收口；这里只拦掉 Escape 继续上冒去关掉外面的对话框
          event.preventDefault()
          return
        }
        if (key === 'Tab') {
          // 不拦：焦点要按 Tab 序列自然离开，浮层让开即可
          send({ type: 'CLOSE' })
        }
        // Home / End 一概不拦：多行正文里它们是跳行首行尾，抢走就没法打字了。
        // 光标随之挪动，keyup 会把新位置报回来，触发跟着重算
      },
    }),

    getPositionerProps: () => normalize.element({
      ...parts.positioner.attrs,
      // 定位层被搬到 portal 落点，继承不到作者子树上的方向；作者没给就不写，交给落点处的继承
      'dir': prop('dir'),
      // 视觉轴在浮层这一侧再打一次：positioner 被搬到 portal 落点，继承不到根上的私有槽
      'data-variant': prop('variant'),
      'data-tone': prop('tone'),
      'data-size': prop('size'),
      'data-state': stateAttr,
      'data-placement': placement,
      // 锚点被滚出可视区时引擎会置 hidden，样式据此收起浮层
      // 锚点被滚出可视区时引擎置 hidden，样式据此收起浮层
      'data-hidden': dataAttr(position?.hidden),
      // 落位才露：皮肤基线把定位层藏着，带这个才显示。展开那几帧坐标还没算出来时就是藏的
      'data-positioned': dataAttr(overlayPositioned(position)),
      'style': {
        position: 'fixed',
        left: `${position?.x ?? 0}px`,
        top: `${position?.y ?? 0}px`,
        // content 继承这个高度上限，超出的条目在浮层内部滚
        ...availableHeightVar(position?.availableHeight),
      },
    }),

    getContentProps: () => normalize.element({
      ...parts.content.attrs,
      'id': ids.content,
      'role': 'listbox',
      // role=listbox 必须有可及名字，而这里没有可指的标题部件，只能自带一句
      'aria-label': prop('translations')?.content ?? 'Mentions',
      // tabindex 写 -1 不能省：可滚动容器会被某些浏览器自动塞进 Tab 序列
      'tabindex': -1,
      'data-state': stateAttr,
      'data-placement': placement,
      // 收起时留在 DOM 只隐藏，不卸载作者节点
      'hidden': !open || undefined,
      'onPointerDown': (event: PointerEvent) => {
        // 不拦的话按下候选会让输入框失焦、浮层随即收起；在冒泡途中拦同样有效
        event.preventDefault()
      },
    }),

    getItemProps: item => normalize.element({
      ...parts.item.attrs,
      ...itemStateAttrs(item),
      // 导航与提交都以此为候选身份
      [ITEM_VALUE_ATTR]: item.value,
      // aria-activedescendant 要指得到它，所以每个候选都得有个稳定 id
      'id': itemId(item.value),
      'role': 'option',
      // 提及没有"选中过的候选"这回事：列表里被标为 selected 的恒是当前高亮那一条
      'aria-selected': isHighlighted(item.value) ? 'true' : 'false',
      // 集合条目一律 aria-disabled，原生 disabled 不派发 click，点击就走不到守卫里
      'aria-disabled': itemDisabled(item) ? 'true' : 'false',
      // 不给 tabindex：焦点恒在输入框
      'onClick': (event: MouseEvent) => {
        if (disabled || itemDisabled(item))
          return
        send({ type: 'ITEM.SELECT', value: item.value, label: mentionItemText(event.currentTarget as HTMLElement) })
      },
      // 指针划过即高亮：不同步的话，鼠标停在 A 上、回车却插进了键盘高亮的 B
      'onPointerMove': () => {
        if (!disabled && !itemDisabled(item) && highlighted !== item.value)
          send({ type: 'ITEM.HIGHLIGHT', value: item.value })
      },
    }),

    getItemTextProps: item => normalize.element({
      ...parts['item-text'].attrs,
      ...itemStateAttrs(item),
    }),
  }
}
