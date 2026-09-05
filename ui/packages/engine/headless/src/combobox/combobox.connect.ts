import type { NavIntent } from '@xihan-ui/behavior'
import type { NormalizeProps, PropTypes } from '@xihan-ui/kernel'
import type { Service } from '@xihan-ui/machine'
import type { ComboboxApi, ComboboxInputEl, ComboboxInputProps, ComboboxItemProps, ComboboxNodeMeta, ComboboxSchema } from './combobox.types'
import { isItemDisabled, ITEM_VALUE_ATTR, itemValue, navigateItems, queryItems } from '@xihan-ui/behavior'
import { contains, dataAttr, isComposingEvent } from '@xihan-ui/kernel'
import { overlayPositioned } from '../shared/overlay'
import { comboboxAnatomy, comboboxItemQuery, comboboxItemText } from './combobox.anatomy'
import { COMBOBOX_DEFAULT_PLACEMENT } from './combobox.machine'

const parts = comboboxAnatomy.build()

// 指针亲手点亮过的条目：pointerleave 只收自己点的漆，键盘/打字建立的高亮被指针路过不受影响
const pointerHot = new WeakSet<Element>()

/**
 * 输入宿主是不是多行。
 *
 * textarea 的允许角色只有它自带的 textbox，写 role="combobox" 是文档一致性违规；
 * 而 aria-expanded 不在 textbox 的支持属性里。所以多行宿主上 type / role / aria-expanded
 * 三条一并缺席，「有候选浮层」改由 aria-haspopup、aria-controls、aria-autocomplete
 * 与 aria-activedescendant 表达——这四条 textbox 都支持。
 */
function isMultilineHost(input: ComboboxInputProps): boolean {
  return (input.as ?? 'input') === 'textarea'
}

// 落定那一侧的可用高度。贴边时引擎会回报 0，直接写进 min() 会把面板压成零高，
// 所以低于这个下限就当作没算出来：空串撤掉声明，退回皮肤 positioner 上那档 100vh
const AVAILABLE_H_FLOOR = 96

function availableHeightVar(available: number | undefined): Record<string, string> {
  return {
    '--xh-_combobox-available-h':
      available != null && available >= AVAILABLE_H_FLOOR ? `${available}px` : '',
  }
}

// 锚点实测宽度。content 拿它做最小宽的下界，浮层因此不窄于输入框；
// 引擎没算出来时空串撤掉声明，退回皮肤 positioner 上那档 0
function anchorWidthVar(width: number | undefined): Record<string, string> {
  return {
    '--xh-_combobox-anchor-w': width != null ? `${width}px` : '',
  }
}

export function connectCombobox<T extends PropTypes>(
  service: Service<ComboboxSchema>,
  normalize: NormalizeProps<T>,
): ComboboxApi<T> {
  const { state, prop, send, context, refs, scope } = service
  const open = state.get() === 'open'
  const ids = scope.ids('combobox', 'label', 'input', 'content')

  const value = context.get('value')
  const inputValue = context.get('inputValue')

  // collection 推出的候选元信息：显示文本与禁用都在这里定案，条目部件只报 value
  const nodes = prop('collection')
  const collection: ComboboxNodeMeta[] = (nodes ?? []).map(node => ({
    value: node.value,
    label: node.label ?? node.value,
    disabled: !!node.disabled,
  }))
  const metaOf = new Map(collection.map(meta => [meta.value, meta]))

  // 给了 collection 就当场按数据算，首帧即准；选中项已被宿主筛出候选时退回机器算好的那一份
  const onlySelected = value.length === 1 ? value[0] : undefined
  const valueText = nodes && onlySelected != null
    ? metaOf.get(onlySelected)?.label ?? context.get('valueText')
    : context.get('valueText')
  // 高亮不承载焦点，只经 aria-activedescendant 上报；收起时为 null
  const highlighted = context.get('highlightedValue') ?? null
  const itemCount = context.get('itemCount')
  const multiple = !!prop('multiple')
  const disabled = !!prop('disabled')
  const readOnly = !!prop('readOnly')
  const invalid = !!prop('invalid')
  const loop = prop('loop') ?? true
  const inputBehavior = prop('inputBehavior') ?? 'none'
  // 只读与禁用都不改值也不展开；两者的区别只在输入框可不可聚焦、文字能不能选
  const interactive = !disabled && !readOnly
  // itemCount 为 null 表示还没结算过，此时不判空，否则空态会闪一下
  const empty = open && itemCount === 0
  const canClear = interactive && (inputValue !== '' || value.length > 0)
  const stateAttr = open ? 'open' : 'closed'
  // 位置由引擎写进 context，这里只读结果，不量 DOM、不调引擎
  const position = context.get('position')
  const placement = position?.placement ?? prop('placement') ?? COMBOBOX_DEFAULT_PLACEMENT

  const isSelected = (v: string): boolean => value.includes(v)

  /** 条目 id。aria-activedescendant 只认单个 IDREF，值里带空格会把它劈成两截，所以先编码再拼。 */
  const itemId = (v: string): string => scope.partId(comboboxAnatomy.name, `item:${encodeURIComponent(v)}`)
  const groupLabelId = (group: string): string => scope.partId(comboboxAnatomy.name, `group-label:${group}`)

  /** 候选禁用：部件上写的优先，没写就回 collection 里查。 */
  const itemDisabled = (item: ComboboxItemProps): boolean =>
    item.disabled ?? metaOf.get(item.value)?.disabled ?? false

  // item / item-text / item-indicator 共用同一份状态标记，样式层各处一致
  const itemStateAttrs = (item: ComboboxItemProps): Record<string, string | undefined> => ({
    'data-state': isSelected(item.value) ? 'checked' : 'unchecked',
    'data-disabled': dataAttr(itemDisabled(item)),
    // 高亮与选中互相独立：可以高亮着一个未选中的候选
    'data-highlighted': dataAttr(highlighted === item.value),
  })

  /**
   * 候选集合只在事件那一刻读，顺序即文档序。
   * 渲染期不得调用：那里 Vue 读到上一帧、WC 读到本帧。
   */
  const items = (): HTMLElement[] => queryItems(refs.get('getContentEl')(), comboboxItemQuery)

  /** 移高亮。焦点不动，但列表要跟着滚，否则长列表里高亮会跑出可视区。 */
  const highlightEl = (el: HTMLElement | null): void => {
    const next = itemValue(el)
    if (next == null)
      return
    send({ type: 'ITEM.HIGHLIGHT', value: next })
    el?.scrollIntoView?.({ block: 'nearest', inline: 'nearest' })
  }

  /** 方向键落点：起点用当前高亮，终点用活 DOM 算，禁用候选自动跳过。 */
  const highlightBy = (intent: NavIntent): void => {
    highlightEl(navigateItems(items(), highlighted, intent, { loop }))
  }

  /** 确认键：认高亮所在的候选，自报禁用的不认。返回是否真提交了。 */
  const commitHighlighted = (): boolean => {
    if (highlighted == null)
      return false
    const el = items().find(item => itemValue(item) === highlighted)
    if (!el || isItemDisabled(el))
      return false
    // 文本在事件这一刻取好带给机器，选中后条目可能立刻被过滤掉
    send({ type: 'ITEM.SELECT', value: highlighted, label: comboboxItemText(el) })
    return true
  }

  /** 焦点恒在输入框：按钮上的交互结束后要把它送回去。 */
  const focusInput = (): void => refs.get('getInputEl')()?.focus()

  /** 按钮上的指针按下一律拦掉：不拦，浏览器会把焦点从输入框挪走，aria-activedescendant 就断了。 */
  const keepFocus = (event: PointerEvent): void => {
    if (event.button === 0)
      event.preventDefault()
  }

  return {
    open,
    collection,
    value,
    inputValue,
    valueText,
    highlightedValue: highlighted,
    multiple,
    disabled,
    readOnly,
    invalid,
    empty,
    canClear,
    isSelected,
    setOpen: (next) => {
      if (next !== open)
        send(next ? { type: 'OPEN', focus: 'selected' } : { type: 'CLOSE' })
    },
    setValue: next => send({ type: 'VALUE.SET', value: next }),
    setInputValue: next => send({ type: 'INPUT.SET', value: next }),
    clear: () => send({ type: 'VALUE.CLEAR' }),

    // 三个视觉轴打在根与 positioner 上：输入行与候选各从就近的那一处继承私有槽，其余子部件不重复标注
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

    getLabelProps: () => normalize.label({
      ...parts.label.attrs,
      'id': ids.label,
      // for 须指向真正的 input，指到外层包裹会丢掉名字与聚焦
      'for': ids.input,
      'data-disabled': dataAttr(disabled),
    }),

    // 定位锚点取整个输入行，浮层因此与输入框对齐
    getControlProps: () => normalize.element({
      ...parts.control.attrs,
      'data-state': stateAttr,
      'data-disabled': dataAttr(disabled),
      'data-readonly': dataAttr(readOnly),
      'data-invalid': dataAttr(invalid),
    }),

    getInputProps: (input = {}) => normalize.input({
      ...parts.input.attrs,
      'id': ids.input,
      // textarea 没有 type 属性
      'type': isMultilineHost(input) ? undefined : 'text',
      // 焦点自始至终在这里：列表展开也不交出去，高亮改由 aria-activedescendant 报给读屏。
      // textarea 不写这个角色：它的允许角色只有 textbox，组合框语义改由下面几条属性表达
      'role': isMultilineHost(input) ? undefined : 'combobox',
      // 关掉浏览器自带的历史补全，它会盖在候选列表上
      'autocomplete': 'off',
      'autocapitalize': 'none',
      'placeholder': prop('placeholder'),
      'value': inputValue,
      'disabled': disabled || undefined,
      'readonly': readOnly || undefined,
      // 作者把 label 换成非 <label> 元素时 for 会失效，这条兜住名字
      'aria-labelledby': ids.label,
      'aria-haspopup': 'listbox',
      // aria-expanded 不在 textbox 的支持属性里，多行宿主上整条缺席
      'aria-expanded': isMultilineHost(input) ? undefined : (open ? 'true' : 'false'),
      'aria-controls': ids.content,
      // list = 候选以列表形式给出；both = 还额外做了内联补全
      'aria-autocomplete': inputBehavior === 'autocomplete' ? 'both' : 'list',
      // 收起态没有高亮可指，属性整个缺席（aria-activedescendant 没有"假值"写法）
      'aria-activedescendant': open && highlighted != null ? itemId(highlighted) : undefined,
      'aria-invalid': invalid ? 'true' : 'false',
      // 皮肤只认 data-*、不认标签名，多行宿主的排版靠这一条认出来
      'data-multiline': dataAttr(isMultilineHost(input)),
      'data-state': stateAttr,
      'data-disabled': dataAttr(disabled),
      'data-readonly': dataAttr(readOnly),
      'data-invalid': dataAttr(invalid),
      'onInput': (event: Event) => {
        const el = event.target as ComboboxInputEl
        // 删字标记必须在这里判：机器里 setInputValue 已落下新值，那时比不出方向
        send({ type: 'INPUT.CHANGE', value: el.value, deleting: el.value.length < inputValue.length })
      },
      'onClick': () => {
        if (interactive && !open && (prop('openOnClick') ?? false))
          send({ type: 'OPEN', focus: 'selected' })
      },
      'onBlur': (event: FocusEvent) => {
        const input = event.currentTarget as HTMLElement
        const root = input.closest<HTMLElement>(parts.root.selector)
        // 焦点还在组件内部（点了触发按钮之类）不算离场
        if (root && contains(root, event.relatedTarget as Node | null))
          return
        send({ type: 'INPUT.BLUR' })
      },
      'onKeyDown': (event: KeyboardEvent) => {
        if (!interactive)
          return
        // 组合期间的按键属于输入法候选框，组件一律不接
        if (isComposingEvent(event))
          return
        const key = event.key

        // 带修饰键的组合归浏览器与读屏，只截 APG 指派给组合框的两条 Alt 组合
        if (event.ctrlKey || event.metaKey || event.altKey) {
          if (!event.altKey || event.ctrlKey || event.metaKey)
            return
          if (key === 'ArrowDown' && !open) {
            event.preventDefault()
            send({ type: 'OPEN', focus: 'none' })
            return
          }
          if (key === 'ArrowUp' && open) {
            event.preventDefault()
            send({ type: 'CLOSE' })
          }
          return
        }

        if (key === 'ArrowDown') {
          event.preventDefault()
          if (open)
            highlightBy('next')
          else
            send({ type: 'OPEN', focus: 'first' })
          return
        }
        if (key === 'ArrowUp') {
          event.preventDefault()
          if (open)
            highlightBy('prev')
          else
            send({ type: 'OPEN', focus: 'last' })
          return
        }
        // 收起态的 Home/End 是光标跳行首行尾，不能吞
        if (open && (key === 'Home' || key === 'End')) {
          event.preventDefault()
          highlightBy(key === 'Home' ? 'first' : 'last')
          return
        }
        if (key === 'Enter') {
          // 收起态放行，Enter 在表单里是提交
          if (!open)
            return
          event.preventDefault()
          // 按住不放会连发 keydown，这是切换：重复执行会来回翻转
          if (event.repeat)
            return
          if (commitHighlighted())
            return
          // 没有高亮：允许自定义值就把输入串收成值，否则只收起
          send(prop('allowCustomValue') ? { type: 'VALUE.COMMIT' } : { type: 'CLOSE' })
          return
        }
        if (key === 'Tab') {
          // 不拦：焦点要按 Tab 序列自然离开，列表让开即可
          if (open)
            send({ type: 'CLOSE' })
          return
        }
        if (key === 'Escape') {
          if (!open)
            return
          // 收起由消解层收口；这里只拦掉浏览器把输入框回滚成默认值的行为
          event.preventDefault()
          return
        }
        if (key === 'Backspace') {
          // 多选且输入串已空时，退格改删最后一个已选项
          if (!multiple || inputValue !== '' || value.length === 0)
            return
          event.preventDefault()
          send({ type: 'VALUE.SET', value: value.slice(0, -1) })
        }
      },
    }),

    getTriggerProps: () => normalize.button({
      ...parts.trigger.attrs,
      'type': 'button',
      // 整个组合框只占一个 Tab 位（输入框），按钮退出 Tab 序列
      'tabindex': -1,
      // 单体控件用原生 disabled（与候选条目的 aria-disabled 相反）
      'disabled': !interactive || undefined,
      // 钮里只有一枚箭头，名字只能从这里给；展开与否由输入框的 aria-expanded 说，名字不跟着变
      'aria-label': prop('translations')?.trigger ?? 'Show suggestions',
      'aria-controls': ids.content,
      'data-state': stateAttr,
      'data-disabled': dataAttr(!interactive),
      'onPointerDown': keepFocus,
      'onClick': () => {
        if (!interactive)
          return
        send({ type: 'TOGGLE', focus: 'selected' })
        // pointerdown 已拦掉默认聚焦，键盘激活这一路则要主动把焦点送回输入框
        focusInput()
      },
    }),

    getClearTriggerProps: () => normalize.button({
      ...parts['clear-trigger'].attrs,
      'type': 'button',
      // 键盘用户走退格与 Escape，这个按钮不进 Tab 序列；读屏按虚拟光标仍找得到它
      'tabindex': -1,
      'aria-label': prop('translations')?.clearTrigger ?? 'Clear',
      // 没值就整个收起，不是禁用：有值才出现，出现即可用
      'hidden': !canClear || undefined,
      // 按下不夺焦：焦点留在输入框，aria-activedescendant 才不断
      'onPointerDown': (event: PointerEvent) => {
        if (event.button === 0)
          event.preventDefault()
      },
      'onClick': () => {
        if (!canClear)
          return
        send({ type: 'VALUE.CLEAR' })
        refs.get('getInputEl')()?.focus()
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
        // content 继承这个宽度下界，浮层至少与输入框同宽
        ...anchorWidthVar(position?.anchorWidth),
      },
    }),

    getContentProps: () => normalize.element({
      ...parts.content.attrs,
      'id': ids.content,
      'role': 'listbox',
      'aria-labelledby': ids.label,
      // 单选也显式写 'false'，不省略
      'aria-multiselectable': multiple ? 'true' : 'false',
      // tabindex 写 -1 不能省：可滚动容器会被某些浏览器自动塞进 Tab 序列
      'tabindex': -1,
      'data-state': stateAttr,
      'data-placement': placement,
      // 收起时留在 DOM 只隐藏，不卸载作者节点
      'hidden': !open || undefined,
      'onPointerDown': (event: PointerEvent) => {
        // 不拦的话按下候选会让输入框失焦、列表随即收起；在冒泡途中拦同样有效
        event.preventDefault()
      },
    }),

    getGroupProps: group => normalize.element({
      ...parts.group.attrs,
      'role': 'group',
      // 分组标题不是候选，只能靠 aria-labelledby 挂上来
      'aria-labelledby': groupLabelId(group.value),
    }),

    getGroupLabelProps: group => normalize.element({
      ...parts['group-label'].attrs,
      id: groupLabelId(group.value),
    }),

    getItemProps: item => normalize.element({
      ...parts.item.attrs,
      ...itemStateAttrs(item),
      // 导航与选中都以此为候选身份
      [ITEM_VALUE_ATTR]: item.value,
      // aria-activedescendant 要指得到它，所以每个候选都得有个稳定 id
      'id': itemId(item.value),
      'role': 'option',
      // listbox 的选中语义是 aria-selected；未选中也显式写 'false'
      'aria-selected': isSelected(item.value) ? 'true' : 'false',
      // 集合条目一律 aria-disabled，原生 disabled 不派发 click，点击就走不到守卫里
      'aria-disabled': itemDisabled(item) ? 'true' : 'false',
      // 不给 tabindex：焦点恒在输入框
      'onClick': (event: MouseEvent) => {
        // 候选常挂在文档里（只是随 content 一起 hidden），程序化点击照样送得到，守卫必须写在这儿
        if (!interactive || itemDisabled(item))
          return
        send({ type: 'ITEM.SELECT', value: item.value, label: comboboxItemText(event.currentTarget as HTMLElement) })
      },
      // 指针划过即高亮：不同步的话，鼠标停在 A 上、回车却提交了键盘高亮的 B
      'onPointerMove': (event: PointerEvent) => {
        if (interactive && !itemDisabled(item) && highlighted !== item.value) {
          pointerHot.add(event.currentTarget as Element)
          send({ type: 'ITEM.HIGHLIGHT', value: item.value })
        }
      },
      // 指针离开候选浮层：收掉高亮，hover 不留漆。
      // 判据是「还在不在 content 里」——条目之间有间距时，指针落在缝上，relatedTarget 是 content 本身。
      // 触摸 tap 序列里的 leave 不作数；打字建立的高亮被指针路过不受影响
      'onPointerLeave': (event: PointerEvent) => {
        const el = event.currentTarget as HTMLElement
        if (event.pointerType === 'touch' || !pointerHot.delete(el))
          return
        if (!interactive || highlighted !== item.value)
          return
        if (contains(el.closest<HTMLElement>(parts.content.selector), event.relatedTarget as Node | null))
          return
        send({ type: 'HIGHLIGHT.CLEAR' })
      },
    }),

    getItemTextProps: item => normalize.element({
      ...parts['item-text'].attrs,
      ...itemStateAttrs(item),
    }),

    getItemIndicatorProps: item => normalize.element({
      ...parts['item-indicator'].attrs,
      ...itemStateAttrs(item),
      'aria-hidden': true,
    }),

    getEmptyProps: () => normalize.element({
      ...parts.empty.attrs,
      // 空态节点必须待在 role=listbox 之外（列表里只允许 option 与 group），放 positioner 里当 content 的兄弟；
      // role=status 自带 polite 活区
      'role': 'status',
      'data-state': stateAttr,
      'hidden': !empty || undefined,
    }),

    getHiddenInputProps: () => normalize.input({
      // type 先于 value 写入：改 type 会重置输入的值
      type: 'hidden',
      ...parts['hidden-input'].attrs,
      // name 缺省即不产出该属性，此时不参与提交
      name: prop('name'),
      // 多选按逗号拼成一串，与 tree-select 同法
      value: value.join(','),
      // 单体控件用原生 disabled，禁用时不提交值
      disabled: disabled || undefined,
    }),
  }
}
