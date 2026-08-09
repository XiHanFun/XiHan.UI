import type { NavIntent } from '@xihan-ui/behavior'
import type { NormalizeProps, PropTypes } from '@xihan-ui/core'
import type { Service } from '@xihan-ui/machine'
import type { SelectApi, SelectItemProps, SelectSchema } from './select.types'
import { focusItem, indexOfValue, isItemDisabled, ITEM_VALUE_ATTR, itemValue, matchTypeahead, navigateItems, navIntentFromKey, queryItems } from '@xihan-ui/behavior'
import { dataAttr } from '@xihan-ui/core'
import { selectAnatomy, selectItemQuery, selectItemText } from './select.anatomy'
import { SELECT_DEFAULT_PLACEMENT } from './select.machine'

const parts = selectAnatomy.build()

// 隐藏 select 要留在布局与表单里，不能 display:none——原生校验提示需要一个可定位的框。
const HIDDEN_SELECT_STYLE = {
  position: 'absolute',
  inlineSize: '1px',
  blockSize: '1px',
  margin: '-1px',
  padding: '0',
  border: '0',
  overflow: 'hidden',
  clipPath: 'inset(50%)',
  whiteSpace: 'nowrap',
}

export function connectSelect<T extends PropTypes>(
  service: Service<SelectSchema>,
  normalize: NormalizeProps<T>,
): SelectApi<T> {
  const { state, prop, send, context, refs, scope } = service
  const open = state.get() === 'open'
  const ids = scope.ids('select', 'label', 'trigger', 'content', 'value-text')

  // 带 Ctrl/Meta/Alt 的组合不归连打检索管，否则 Ctrl+A / Cmd+R 会被 preventDefault 吞掉；
  // Shift+字母是大写字母，仍参与检索。
  const isTypeaheadEvent = (event: KeyboardEvent): boolean =>
    !event.ctrlKey && !event.metaKey && !event.altKey
  const stateAttr = open ? 'open' : 'closed'
  // 位置由引擎写进 context，这里只读结果，不量 DOM、不调引擎
  const position = context.get('position')
  const placement = position?.placement ?? prop('placement') ?? SELECT_DEFAULT_PLACEMENT
  const multiple = !!prop('multiple')
  const value = context.get('value')
  // 机器保证与 value 逐项等长对齐，查不到条目的那一项已退回值本身
  const valueText = context.get('valueText')
  const placeholder = prop('placeholder') ?? null
  // 多选把各项文本连起来显示；分隔符固定，作者要别的排版就自己渲染 valueText
  const displayText = valueText.length > 0 ? valueText.join(', ') : placeholder ?? ''
  // roving tabindex 与方向键起点共用这一个锚点；收起时为 null（条目此刻不可达）
  const highlighted = context.get('highlightedValue') ?? null
  const disabled = !!prop('disabled')
  const loop = prop('loop') ?? true
  const dir = prop('dir')

  // item / item-text / item-indicator 共用同一份状态标记，样式层各处一致
  const itemStateAttrs = (item: SelectItemProps): Record<string, string | undefined> => ({
    'data-state': value.includes(item.value) ? 'checked' : 'unchecked',
    'data-disabled': dataAttr(item.disabled),
  })

  /**
   * 条目集合只在事件那一刻读活 DOM，顺序即文档序。
   * 收起态条目虽 hidden 但仍在文档里，查询照样命中，收起态连打靠这一点。
   */
  const items = (): HTMLElement[] => queryItems(refs.get('getContentEl')(), selectItemQuery)

  /** 连打检索落点：从当前起点的下一个绕一圈找，禁用条目跳过；未命中返回 null。 */
  const match = (query: string, from: string | null): HTMLElement | null => {
    const list = items()
    return matchTypeahead(list, indexOfValue(list, from), query, {
      text: selectItemText,
      skip: isItemDisabled,
    })
  }

  const highlightEl = (el: HTMLElement | null): void => {
    const next = itemValue(el)
    if (next == null)
      return
    focusItem(el)
    send({ type: 'ITEM.HIGHLIGHT', value: next })
  }

  /** 方向键落点：起点用锚点，终点用活 DOM 算，禁用条目自动跳过。 */
  const highlightBy = (intent: NavIntent): void => {
    highlightEl(navigateItems(items(), highlighted, intent, { loop }))
  }

  /** 确认键：认高亮所在的条目，自报禁用的不认。 */
  const activate = (event: KeyboardEvent): void => {
    if (highlighted == null)
      return
    const el = items().find(item => itemValue(item) === highlighted)
    if (!el || isItemDisabled(el))
      return
    event.preventDefault()
    send({ type: 'ITEM.SELECT', value: highlighted })
  }

  return {
    open,
    value,
    valueText,
    displayText,
    multiple,
    highlightedValue: highlighted,
    setOpen: (next) => {
      if (next !== open)
        send(next ? { type: 'OPEN', focus: 'selected' } : { type: 'CLOSE' })
    },
    setValue: next => send({ type: 'VALUE.SET', value: next }),
    // 三个视觉轴只落在根上：触发器与条目都从这里继承私有槽，子部件不重复标注
    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      'data-state': stateAttr,
      'data-variant': prop('variant'),
      'data-tone': prop('tone'),
      'data-size': prop('size'),
      'data-disabled': dataAttr(disabled),
    }),
    getLabelProps: () => normalize.element({
      ...parts.label.attrs,
      'id': ids.label,
      'data-disabled': dataAttr(disabled),
    }),
    getTriggerProps: () => normalize.button({
      ...parts.trigger.attrs,
      'id': ids.trigger,
      'type': 'button',
      // trigger 是单体控件：用原生 disabled，不可聚焦也不派 click
      'disabled': disabled || undefined,
      // 展开的是 listbox 不是 menu：读屏据此播报「折叠列表框」而不是「菜单按钮」
      'aria-haspopup': 'listbox',
      'aria-expanded': open ? 'true' : 'false',
      'aria-controls': ids.content,
      // 名字 = 标签 + 当前值：aria-labelledby 优先级高于元素内容，只指 label 会挤掉 value-text。
      // 作者没写 label 时那段是悬空 IDREF，按 accname 规则跳过。
      'aria-labelledby': `${ids.label} ${ids['value-text']}`,
      'data-state': stateAttr,
      'data-disabled': dataAttr(disabled),
      'data-placeholder': dataAttr(value.length === 0),
      'onClick': () => send({ type: 'TOGGLE', focus: 'selected' }),
      'onKeydown': (event: KeyboardEvent) => {
        // 纵向轴且不收 Home/End；返回 null 的按键不归导航管，不得 preventDefault
        const intent = navIntentFromKey(event, { axis: 'vertical', home: false })
        if (intent) {
          event.preventDefault()
          send({ type: 'OPEN', focus: intent })
          return
        }
        // Enter 必须吞掉：按钮默认激活会再合成一次 click，展开会被那次 TOGGLE 关掉
        if (event.key === 'Enter') {
          event.preventDefault()
          send({ type: 'OPEN', focus: 'selected' })
          return
        }
        // 收起态连打直接改选中值，不展开；缓冲区空时空格不算字符，落到下面按展开处理
        const query = isTypeaheadEvent(event) ? refs.get('typeahead').push(event.key) : null
        if (query != null) {
          event.preventDefault()
          const next = itemValue(match(query, value.at(-1) ?? null))
          if (next != null)
            send({ type: 'VALUE.SET', value: multiple ? (value.includes(next) ? value : [...value, next]) : [next] })
          return
        }
        if (event.key === ' ') {
          event.preventDefault()
          send({ type: 'OPEN', focus: 'selected' })
        }
      },
    }),
    getValueTextProps: () => normalize.element({
      ...parts['value-text'].attrs,
      // trigger 的 aria-labelledby 指过来，当前值才进得了可及名字
      'id': ids['value-text'],
      // 无选中：样式据此把占位文字画淡
      'data-placeholder': dataAttr(value.length === 0),
      'data-disabled': dataAttr(disabled),
    }),
    getIndicatorProps: () => normalize.element({
      ...parts.indicator.attrs,
      'aria-hidden': 'true',
      'data-state': stateAttr,
      'data-disabled': dataAttr(disabled),
    }),
    getPositionerProps: () => normalize.element({
      ...parts.positioner.attrs,
      'data-state': stateAttr,
      'data-placement': placement,
      // 锚点被滚出可视区时引擎会置 hidden，样式据此收起浮层
      'data-hidden': dataAttr(position?.hidden),
      'style': {
        position: 'fixed',
        insetInlineStart: `${position?.x ?? 0}px`,
        insetBlockStart: `${position?.y ?? 0}px`,
      },
    }),
    // 键盘全在 content 上收口，条目只管声明自己。
    // Escape 归消解层管，只有栈顶层响应。
    getContentProps: () => normalize.element({
      ...parts.content.attrs,
      'id': ids.content,
      'role': 'listbox',
      'aria-labelledby': ids.label,
      // 多选语义显式报出，读屏据此播报「可多选」
      'aria-multiselectable': multiple ? 'true' : 'false',
      // 有锚点时 Tab 位归高亮条目；展开却无锚点时由容器兜底，否则列表没有任何 Tab 停靠点。
      // 收起态不需要兜底，content 此时是 hidden。
      'tabindex': open && highlighted == null ? 0 : -1,
      'data-state': stateAttr,
      'data-placement': placement,
      // 收起时留在 DOM 只隐藏，不卸载作者节点
      'hidden': !open || undefined,
      'onKeydown': (event: KeyboardEvent) => {
        // 纵向列表：左右键返回 null，放行给页面滚动与读屏
        const intent = navIntentFromKey(event, { axis: 'vertical', dir })
        if (intent) {
          event.preventDefault()
          highlightBy(intent)
          return
        }
        // 不 preventDefault：列表让开，焦点按 Tab 序列自然离开
        if (event.key === 'Tab') {
          send({ type: 'CLOSE', src: 'tab' })
          return
        }
        if (event.key === 'Enter') {
          activate(event)
          return
        }
        // 多选下 Space 是切换选中的首选键，不让连打检索把它吃掉
        if (multiple && event.key === ' ') {
          activate(event)
          return
        }
        // 连打只移高亮不选中；键已被检索吞掉，一律拦下默认行为，否则空格会滚页
        const query = isTypeaheadEvent(event) ? refs.get('typeahead').push(event.key) : null
        if (query != null) {
          event.preventDefault()
          highlightEl(match(query, highlighted))
          return
        }
        if (event.key === ' ')
          activate(event)
      },
    }),
    getItemProps: item => normalize.element({
      ...parts.item.attrs,
      ...itemStateAttrs(item),
      // 导航、检索与选中都以此为条目身份
      [ITEM_VALUE_ATTR]: item.value,
      'role': 'option',
      // listbox 的选中语义是 aria-selected（不是 aria-checked）；未选中必须显式输出 false，
      // 省略会让读屏无从区分「未选中」与「不是选项」
      'aria-selected': value.includes(item.value) ? 'true' : 'false',
      // 集合条目一律 aria-disabled，不用原生 disabled：原生 disabled 不可聚焦、也不派 click
      'aria-disabled': item.disabled ? 'true' : 'false',
      // 高亮是键盘焦点所在，与选中互相独立：可以高亮着未选中的条目
      'data-highlighted': dataAttr(highlighted === item.value),
      // roving tabindex：整组只有高亮条目留在 Tab 序列内；收起态无锚点
      'tabindex': highlighted === item.value ? 0 : -1,
      'onClick': () => {
        if (!item.disabled)
          send({ type: 'ITEM.SELECT', value: item.value })
      },
      // 焦点是事实不是许可：禁用条目被点到也记锚点，方向键才知道从哪儿起步
      'onFocus': () => send({ type: 'ITEM.HIGHLIGHT', value: item.value }),
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
    // 表单出口：选中值靠这份原生 select 提交并被 required 校验看见，对键盘与读屏不存在。
    getHiddenSelectProps: () => normalize.select({
      ...parts['hidden-select'].attrs,
      // name 缺省即不产出该属性，此时这份 select 不参与提交
      'name': prop('name'),
      // 多选提交要 name 带 [] 之外的语义由作者定，这里只如实开原生多选
      'multiple': multiple || undefined,
      'required': prop('required') || undefined,
      // 单体控件用原生 disabled（与条目的 aria-disabled 相反）：禁用的控件不该提交出值
      'disabled': disabled || undefined,
      'tabindex': -1,
      'aria-hidden': 'true',
      'style': HIDDEN_SELECT_STYLE,
    }),
  }
}
