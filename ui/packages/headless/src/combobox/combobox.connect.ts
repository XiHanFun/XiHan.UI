import type { NavIntent } from '@xihan-ui/behavior'
import type { NormalizeProps, PropTypes } from '@xihan-ui/core'
import type { Service } from '@xihan-ui/machine'
import type { ComboboxApi, ComboboxItemProps, ComboboxSchema } from './combobox.types'
import { isItemDisabled, ITEM_VALUE_ATTR, itemValue, navigateItems, queryItems } from '@xihan-ui/behavior'
import { contains, dataAttr } from '@xihan-ui/core'
import { comboboxAnatomy, comboboxItemQuery, comboboxItemText } from './combobox.anatomy'
import { COMBOBOX_DEFAULT_PLACEMENT } from './combobox.machine'

const parts = comboboxAnatomy.build()

export function connectCombobox<T extends PropTypes>(
  service: Service<ComboboxSchema>,
  normalize: NormalizeProps<T>,
): ComboboxApi<T> {
  const { state, prop, send, context, refs, scope } = service
  const open = state.get() === 'open'
  const ids = scope.ids('combobox', 'label', 'input', 'content')

  const value = context.get('value')
  const inputValue = context.get('inputValue')
  const valueText = context.get('valueText')
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
  // itemCount 为 null 表示还没结算过（首帧、无 DOM），此时不判空——否则空态会闪一下
  const empty = open && itemCount === 0
  const canClear = interactive && (inputValue !== '' || value.length > 0)
  const stateAttr = open ? 'open' : 'closed'
  // 位置由引擎写进 context；这里只读结果，不量 DOM、不调引擎，保持纯函数
  const position = context.get('position')
  const placement = position?.placement ?? prop('placement') ?? COMBOBOX_DEFAULT_PLACEMENT

  const isSelected = (v: string): boolean => value.includes(v)

  /**
   * 条目 id：aria-activedescendant 只认单个 IDREF，值里带空格会把它劈成两截，
   * 所以先编码再拼。编码是单射的，两个不同的值不会撞到同一个 id。
   */
  const itemId = (v: string): string => scope.partId(comboboxAnatomy.name, `item:${encodeURIComponent(v)}`)
  const groupLabelId = (group: string): string => scope.partId(comboboxAnatomy.name, `item-group-label:${group}`)

  // item / item-text / item-indicator 共用同一份状态标记，样式层各处一致
  const itemStateAttrs = (item: ComboboxItemProps): Record<string, string | undefined> => ({
    'data-state': isSelected(item.value) ? 'checked' : 'unchecked',
    'data-disabled': dataAttr(item.disabled),
    // 高亮与选中互相独立：可以高亮着一个未选中的候选
    'data-highlighted': dataAttr(highlighted === item.value),
  })

  /**
   * 候选集合只在事件那一刻读，两个适配器此时看到的是同一份活 DOM，顺序即文档序。
   * 渲染期不得调用——那里 Vue 读到的是上一帧、WC 读到的是本帧，两侧会分叉。
   */
  const items = (): HTMLElement[] => queryItems(refs.get('getContentEl')(), comboboxItemQuery)

  /**
   * 移高亮。焦点不动（这是 combobox 与 listbox 的分水岭：焦点恒在输入框，
   * 高亮只是报给读屏的一个 id），但列表要跟着滚，否则长列表里高亮会跑出可视区。
   */
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
    // 文本在事件这一刻取好带给机器：选中后调用方多半立刻重新过滤，届时这个条目可能已经不在了
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

    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      'data-state': stateAttr,
      'data-disabled': dataAttr(disabled),
      'data-readonly': dataAttr(readOnly),
      'data-invalid': dataAttr(invalid),
    }),

    getLabelProps: () => normalize.label({
      ...parts.label.attrs,
      'id': ids.label,
      // for 指向真正的 input：指到外层包裹节点上，点标题不会聚焦、读屏也拿不到名字
      'for': ids.input,
      'data-disabled': dataAttr(disabled),
    }),

    // 输入行整体：定位锚点取它，浮层因此与整个输入框对齐而不是只贴着文字框
    getControlProps: () => normalize.element({
      ...parts.control.attrs,
      'data-state': stateAttr,
      'data-disabled': dataAttr(disabled),
      'data-readonly': dataAttr(readOnly),
      'data-invalid': dataAttr(invalid),
    }),

    getInputProps: () => normalize.input({
      ...parts.input.attrs,
      'id': ids.input,
      'type': 'text',
      // 焦点自始至终在这里：列表展开也不交出去，高亮改由 aria-activedescendant 报给读屏
      'role': 'combobox',
      // 关掉浏览器自带的历史补全：它会盖在候选列表上，两套补全各说各话
      'autocomplete': 'off',
      'autocapitalize': 'none',
      'placeholder': prop('placeholder'),
      'value': inputValue,
      'disabled': disabled || undefined,
      'readonly': readOnly || undefined,
      // 作者把 label 换成非 <label> 元素时 for 会失效，这条兜住名字
      'aria-labelledby': ids.label,
      'aria-haspopup': 'listbox',
      'aria-expanded': open ? 'true' : 'false',
      'aria-controls': ids.content,
      // list = 候选以列表形式给出；both = 还额外做了内联补全
      'aria-autocomplete': inputBehavior === 'autocomplete' ? 'both' : 'list',
      // 收起态没有高亮可指，属性整个缺席（aria-activedescendant 没有"假值"写法）
      'aria-activedescendant': open && highlighted != null ? itemId(highlighted) : undefined,
      'aria-invalid': invalid ? 'true' : 'false',
      'data-state': stateAttr,
      'data-disabled': dataAttr(disabled),
      'data-readonly': dataAttr(readOnly),
      'data-invalid': dataAttr(invalid),
      'onInput': (event: Event) => {
        const el = event.target as HTMLInputElement
        // 删字标记在这里判最准：机器里 setInputValue 已经把新值落下去了，那时比不出方向
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
        const key = event.key

        // 带修饰键的组合基本归浏览器与读屏（Ctrl+A 全选文字、Cmd+← 跳行首……），
        // 只截 APG 明确指派给组合框的两条 Alt 组合
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
        // 收起态的 Home/End 是光标跳行首行尾，绝不能吞——展开着才归候选导航
        if (open && (key === 'Home' || key === 'End')) {
          event.preventDefault()
          highlightBy(key === 'Home' ? 'first' : 'last')
          return
        }
        if (key === 'Enter') {
          // 收起态放行：Enter 在表单里是提交，组合框没展开就没有理由拦它
          if (!open)
            return
          event.preventDefault()
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
          // 状态归消解层收口（只有栈顶层响应，嵌套浮层才逐层关闭）；
          // 这里只拦下浏览器自己那套 Escape 行为，免得输入框被回滚成默认值
          event.preventDefault()
          return
        }
        if (key === 'Backspace') {
          // 多选且输入串已空：退格改删最后一个已选项（此时框里没字可删，不拦也是白按一下）
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
      // 整个组合框只占一个 Tab 位（就是输入框），按钮退出 Tab 序列：
      // 键盘用户按方向键即可展开，多一站只会让人反复停在同一个控件上
      'tabindex': -1,
      // 单体控件用原生 disabled（与候选条目的 aria-disabled 相反）
      'disabled': !interactive || undefined,
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
      // 与数字框、文本框的辅助按钮同一套取舍：键盘用户走退格与 Escape，
      // 暴露给读屏等于把同一个能力报两遍，还会在 Tab 序里多出一站
      'tabindex': -1,
      'aria-hidden': true,
      'disabled': !canClear || undefined,
      'data-disabled': dataAttr(!canClear),
      'onPointerDown': keepFocus,
      'onClick': () => {
        if (!canClear)
          return
        send({ type: 'VALUE.CLEAR' })
        focusInput()
      },
    }),

    getPositionerProps: () => normalize.element({
      ...parts.positioner.attrs,
      'data-state': stateAttr,
      'data-placement': placement,
      // 锚点被滚出可视区时引擎会置 hidden，样式据此收起浮层
      'data-hidden': dataAttr(position?.hidden),
      'style': {
        position: 'absolute',
        insetInlineStart: `${position?.x ?? 0}px`,
        insetBlockStart: `${position?.y ?? 0}px`,
      },
    }),

    getContentProps: () => normalize.element({
      ...parts.content.attrs,
      'id': ids.content,
      'role': 'listbox',
      'aria-labelledby': ids.label,
      // 多选与否必须显式说：省略只是「没说」，读屏无从区分单选列表与「作者忘了标」
      'aria-multiselectable': multiple ? 'true' : 'false',
      // 列表永远不进 Tab 序列，也不承载焦点。写 -1 而不是整个不给：
      // 它是可滚动容器，某些浏览器会把可滚动区域自动塞进 Tab 序列
      'tabindex': -1,
      'data-state': stateAttr,
      'data-placement': placement,
      // 收起时留在 DOM 只隐藏，不卸载作者节点
      'hidden': !open || undefined,
      'onPointerDown': (event: PointerEvent) => {
        // 候选不可聚焦，按下去浏览器会把焦点退还给 body，输入框当场失焦、列表随即收起。
        // 在冒泡途中拦同样有效：默认行为是在派发结束后才执行的
        event.preventDefault()
      },
    }),

    getItemGroupProps: group => normalize.element({
      ...parts['item-group'].attrs,
      'role': 'group',
      // 分组标题不是候选，只能靠 aria-labelledby 挂上来；读屏据此播报「第 N 组，常见」
      'aria-labelledby': groupLabelId(group.value),
    }),

    getItemGroupLabelProps: group => normalize.element({
      ...parts['item-group-label'].attrs,
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
      // listbox 的选中语义是 aria-selected（不是 aria-checked）；未选中必须显式输出 false，
      // 省略会让读屏无从区分「未选中」与「不是选项」
      'aria-selected': isSelected(item.value) ? 'true' : 'false',
      // 集合条目一律 aria-disabled，绝不输出原生 disabled：原生 disabled 不派发 click，
      // 禁用候选的点击就再也走不到守卫里，样式与行为也会就此分裂
      'aria-disabled': item.disabled ? 'true' : 'false',
      // 刻意不给 tabindex：焦点恒在输入框，候选既不该被 Tab 停靠，也不该被点击带走焦点
      'onClick': (event: MouseEvent) => {
        // 只读/禁用时列表本就展不开，但候选仍在文档里（只是随 content 一起 hidden），
        // 程序化的点击照样送得到；守卫写在这儿，值才真的改不动
        if (!interactive || item.disabled)
          return
        send({ type: 'ITEM.SELECT', value: item.value, label: comboboxItemText(event.currentTarget as HTMLElement) })
      },
      // 指针划过即高亮：不同步的话，鼠标停在 A 上、回车却提交了键盘高亮的 B
      'onPointerMove': () => {
        if (interactive && !item.disabled && highlighted !== item.value)
          send({ type: 'ITEM.HIGHLIGHT', value: item.value })
      },
    }),

    getItemTextProps: item => normalize.element({
      ...parts['item-text'].attrs,
      ...itemStateAttrs(item),
    }),

    getItemIndicatorProps: item => normalize.element({
      ...parts['item-indicator'].attrs,
      ...itemStateAttrs(item),
      'aria-hidden': 'true',
    }),

    getEmptyProps: () => normalize.element({
      ...parts.empty.attrs,
      // 空态是一句状态播报而不是候选：它必须待在 role=listbox 之外（列表里只允许 option 与 group），
      // 放 positioner 里当 content 的兄弟。role=status 自带 polite 活区，结果空掉时读屏会念一次
      'role': 'status',
      'data-state': stateAttr,
      'hidden': !empty || undefined,
    }),
  }
}
