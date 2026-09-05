import type { NavIntent, NormalizeProps, PropTypes, Service } from '@xihan-ui/core'
import type { SelectApi, SelectItemProps, SelectNodeMeta, SelectSchema } from './select.types'
import { contains, dataAttr, focusItem, focusSafely, indexOfValue, isItemDisabled, ITEM_VALUE_ATTR, itemValue, matchTypeahead, navigateItems, navIntentFromKey, queryItems } from '@xihan-ui/core'
import { overlayPositioned } from '../shared/overlay'
import { VISUALLY_HIDDEN_STYLE } from '../shared/visually-hidden'
import { selectAnatomy, selectItemQuery, selectItemText } from './select.anatomy'
import { SELECT_DEFAULT_PLACEMENT } from './select.machine'

const parts = selectAnatomy.build()

// 指针亲手点亮过的条目：pointerleave 只收自己点的漆，键盘建立的高亮被指针路过不受影响
const pointerHot = new WeakSet<Element>()

// 落定那一侧的可用高度。贴边时引擎会回报 0，直接写进 min() 会把面板压成零高，
// 所以低于这个下限就当作没算出来：空串撤掉声明，退回皮肤 positioner 上那档 100vh
const AVAILABLE_H_FLOOR = 96

function availableHeightVar(available: number | undefined): Record<string, string> {
  return {
    '--xh-_select-available-h':
      available != null && available >= AVAILABLE_H_FLOOR ? `${available}px` : '',
  }
}

// 锚点实测宽度。content 拿它做最小宽的下界，浮层因此不窄于触发器；
// 引擎没算出来时空串撤掉声明，退回皮肤 positioner 上那档 0
function anchorWidthVar(width: number | undefined): Record<string, string> {
  return {
    '--xh-_select-anchor-w': width != null ? `${width}px` : '',
  }
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

  // collection 推出的条目元信息：显示文本与禁用都在这里定案，条目部件只报 value
  const collection: SelectNodeMeta[] = (prop('collection') ?? []).map(node => ({
    value: node.value,
    label: node.label ?? node.value,
    disabled: !!node.disabled,
  }))
  const metaOf = new Map(collection.map(meta => [meta.value, meta]))

  // 给了 collection 就当场按数据算，首帧即准；没给才读机器现查 DOM 后回填的那一份。
  // 两条路都保证与 value 逐项等长对齐，查不到的那一项退回值本身。
  const valueText = prop('collection')
    ? value.map(v => metaOf.get(v)?.label ?? v)
    : context.get('valueText')
  const placeholder = prop('placeholder') ?? null
  // 多选把各项文本连起来显示；分隔符固定，作者要别的排版就自己渲染 valueText
  const displayText = valueText.length > 0 ? valueText.join(', ') : placeholder ?? ''
  // 标签形态：与 value/valueText 同序，maxTagCount 只截可见的、余数进 overflowCount
  const allTags = value.map((v, i) => ({ value: v, label: valueText[i] ?? v }))
  const maxTagCount = prop('maxTagCount')
  const tags = maxTagCount === undefined ? allTags : allTags.slice(0, Math.max(0, maxTagCount))
  const overflowCount = allTags.length - tags.length
  const tagLabel = (v: string): string => allTags.find(tag => tag.value === v)?.label ?? v
  // roving tabindex 与方向键起点共用这一个锚点；收起时为 null（条目此刻不可达）
  const highlighted = context.get('highlightedValue') ?? null
  const disabled = !!prop('disabled')
  const readOnly = !!prop('readOnly')
  const invalid = !!prop('invalid')
  // 只读与禁用都改不了选中值，区别在于禁用连浮层都展不开
  const interactive = !disabled && !readOnly
  const canClear = interactive && value.length > 0
  const loop = prop('loop') ?? true
  const dir = prop('dir')

  /** 条目禁用：部件上写的优先，没写就回 collection 里查。 */
  const itemDisabled = (item: SelectItemProps): boolean =>
    item.disabled ?? metaOf.get(item.value)?.disabled ?? false

  // item / item-text / item-indicator 共用同一份状态标记，样式层各处一致
  const itemStateAttrs = (item: SelectItemProps): Record<string, string | undefined> => ({
    'data-state': value.includes(item.value) ? 'checked' : 'unchecked',
    'data-disabled': dataAttr(itemDisabled(item)),
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
    if (highlighted == null || !interactive)
      return
    const el = items().find(item => itemValue(item) === highlighted)
    if (!el || isItemDisabled(el))
      return
    event.preventDefault()
    send({ type: 'ITEM.SELECT', value: highlighted })
  }

  return {
    open,
    collection,
    value,
    valueText,
    displayText,
    multiple,
    invalid,
    readOnly,
    canClear,
    tags,
    overflowCount,
    highlightedValue: highlighted,
    setOpen: (next) => {
      if (next !== open)
        send(next ? { type: 'OPEN', focus: 'selected' } : { type: 'CLOSE' })
    },
    setValue: next => send({ type: 'VALUE.SET', value: next }),
    clear: () => send({ type: 'VALUE.CLEAR' }),
    deselect: v => send({ type: 'VALUE.SET', value: value.filter(x => x !== v) }),
    // 三个视觉轴打在根与 positioner 上：触发器与条目各从就近的那一处继承私有槽，其余子部件不重复标注
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
    getLabelProps: () => normalize.element({
      ...parts.label.attrs,
      'id': ids.label,
      'data-disabled': dataAttr(disabled),
    }),
    // 盒：描边、底色与聚焦环都落在它上面，样式要认的状态因此在这里发全
    getControlProps: () => normalize.element({
      ...parts.control.attrs,
      'data-state': stateAttr,
      'data-disabled': dataAttr(disabled),
      'data-readonly': dataAttr(readOnly),
      'data-invalid': dataAttr(invalid),
    }),
    getTriggerProps: () => normalize.button({
      ...parts.trigger.attrs,
      'id': ids.trigger,
      'type': 'button',
      // trigger 是单体控件：用原生 disabled，不可聚焦也不派 click
      'disabled': disabled || undefined,
      // 按钮扮演 combobox（select-only 形态）：读屏据此播报「组合框，已折叠」并把 aria-controls 指向列表框
      'role': 'combobox',
      'aria-haspopup': 'listbox',
      'aria-expanded': open ? 'true' : 'false',
      'aria-controls': ids.content,
      // 名字 = 标签 + 当前值：aria-labelledby 优先级高于元素内容，只指 label 会挤掉 value-text。
      // 作者没写 label 时那段是悬空 IDREF，按 accname 规则跳过。
      'aria-labelledby': `${ids.label} ${ids['value-text']}`,
      'aria-invalid': invalid ? 'true' : 'false',
      'aria-readonly': readOnly ? 'true' : 'false',
      'data-state': stateAttr,
      'data-disabled': dataAttr(disabled),
      'data-readonly': dataAttr(readOnly),
      'data-invalid': dataAttr(invalid),
      'data-placeholder': dataAttr(value.length === 0),
      'onClick': () => send({ type: 'TOGGLE', focus: 'selected' }),
      'onKeydown': (event: KeyboardEvent) => {
        // 收起态的键盘清空：Delete 清空全部，Backspace 单选清空、多选去掉最后一个
        if (canClear && (event.key === 'Delete' || event.key === 'Backspace')) {
          event.preventDefault()
          if (event.key === 'Delete' || !multiple)
            send({ type: 'VALUE.CLEAR' })
          else
            send({ type: 'VALUE.SET', value: value.slice(0, -1) })
          return
        }
        // 纵向轴且不收 Home/End；返回 null 的按键不归导航管，不得 preventDefault
        const intent = navIntentFromKey(event, { axis: 'vertical', home: false })
        if (intent) {
          event.preventDefault()
          send({ type: 'OPEN', focus: intent })
          return
        }
        // Enter 必须吞掉：按钮默认激活会再合成一次 click，展开会被那次 TOGGLE 关掉。
        // 键盘打开要有可见落点：无选中值时锚定首个条目，有选中仍定位到选中项
        if (event.key === 'Enter') {
          event.preventDefault()
          send({ type: 'OPEN', focus: value.length ? 'selected' : 'first' })
          return
        }
        // 收起态连打直接改选中值，不展开；缓冲区空时空格不算字符，落到下面按展开处理
        const query = isTypeaheadEvent(event) ? refs.get('typeahead').push(event.key) : null
        if (query != null) {
          event.preventDefault()
          const next = itemValue(match(query, value.at(-1) ?? null))
          if (next != null && interactive)
            send({ type: 'VALUE.SET', value: multiple ? (value.includes(next) ? value : [...value, next]) : [next] })
          return
        }
        if (event.key === ' ') {
          event.preventDefault()
          send({ type: 'OPEN', focus: value.length ? 'selected' : 'first' })
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
      'aria-hidden': true,
      // 有值时清空钮顶上来，箭头让位：两个图标并排堆在框里，用户分不清点哪个
      'data-clearable': dataAttr(canClear),
      'data-state': stateAttr,
      'data-disabled': dataAttr(disabled),
    }),
    getTagProps: ({ value: v }) => normalize.element({
      ...parts.tag.attrs,
      'data-value': v,
      'data-disabled': dataAttr(disabled),
    }),
    getItemDeleteTriggerProps: ({ value: v }) => normalize.button({
      ...parts['item-delete-trigger'].attrs,
      'type': 'button',
      'aria-label': (prop('translations')?.deleteItem ?? ((label: string) => `Delete ${label}`))(tagLabel(v)),
      'data-disabled': dataAttr(disabled),
      'onClick': () => {
        if (interactive)
          send({ type: 'VALUE.SET', value: value.filter(x => x !== v) })
      },
    }),
    // 清空按钮是 trigger 的兄弟节点（按钮不能套按钮），点按只清值不碰开合
    getClearTriggerProps: () => normalize.button({
      ...parts['clear-trigger'].attrs,
      'type': 'button',
      // 整个控件只占一个 Tab 位（trigger）：清空钮不进 Tab 序，但仍对读屏可见
      'tabindex': -1,
      'aria-label': prop('translations')?.clearTrigger ?? 'Clear',
      // 清不了就整个收起，不灰留位
      'hidden': !canClear || undefined,
      // 拦掉默认聚焦，否则焦点会从 trigger 挪到这个按钮上
      'onPointerDown': (event: PointerEvent) => {
        if (event.button === 0)
          event.preventDefault()
      },
      'onClick': (event: MouseEvent) => {
        if (!canClear)
          return
        send({ type: 'VALUE.CLEAR' })
        // 键盘/程序化激活这一路没走 pointerdown，主动把焦点送回 trigger；
        // 适配器没挂锚点 ref 时按 id 在同一文档里找
        const doc = (event.currentTarget as HTMLElement | null)?.ownerDocument
        const trigger = refs.get('getAnchorEl')() ?? doc?.getElementById(ids.trigger) ?? null
        trigger?.focus()
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
        // content 继承这个宽度下界，浮层至少与触发器同宽
        ...anchorWidthVar(position?.anchorWidth),
      },
    }),
    // 浮层的外壳：描边、底色、阴影画在它身上，键盘也在它上面收口（条目只管声明自己）。
    // 列表框语义与滚动都归 list——底部操作区要留在滚动之外，且 listbox 里不能塞按钮。
    // Escape 归消解层管，只有栈顶层响应。
    getContentProps: () => normalize.element({
      ...parts.content.attrs,
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
    // 列表框本体：滚动在这一层，底部操作区因此留在视口里不随条目滚走；
    // role=listbox 只许拥有 option 与 group，按钮那类东西放进 footer 才不违规
    getListProps: () => normalize.element({
      ...parts.list.attrs,
      'id': ids.content,
      'role': 'listbox',
      // 名字与 trigger 同源（标签 + 当前值）：无锚点时焦点歇在这儿，读屏只报得出容器的名字与角色。
      // 作者没渲染 label / value-text 时两段都是悬空 IDREF，按 accname 规则整条落空，
      // 名字退回下面那个可写的兜底
      'aria-labelledby': `${ids.label} ${ids['value-text']}`,
      'aria-label': prop('translations')?.content ?? 'Options',
      // 多选语义显式报出，读屏据此播报「可多选」
      'aria-multiselectable': multiple ? 'true' : 'false',
      // 有锚点时 Tab 位归高亮条目；展开却无锚点时由容器兜底，否则列表没有任何 Tab 停靠点。
      // 收起态不需要兜底，外层 content 此时是 hidden。
      'tabindex': open && highlighted == null ? 0 : -1,
      'data-state': stateAttr,
    }),
    // 浮层底部的操作区：作者往里放「新建」「全选」这类按钮。
    // 它是 content 的子节点、list 的兄弟，故不在列表框的拥有关系里，方向键与连打检索也不认它
    getFooterProps: () => normalize.element({
      ...parts.footer.attrs,
      'data-state': stateAttr,
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
      'aria-disabled': itemDisabled(item) ? 'true' : 'false',
      // 高亮是键盘焦点所在，与选中互相独立：可以高亮着未选中的条目
      'data-highlighted': dataAttr(highlighted === item.value),
      // roving tabindex：整组只有高亮条目留在 Tab 序列内；收起态无锚点
      'tabindex': highlighted === item.value ? 0 : -1,
      'onClick': () => {
        if (interactive && !itemDisabled(item))
          send({ type: 'ITEM.SELECT', value: item.value })
      },
      // 焦点是事实不是许可：禁用条目被点到也记锚点，方向键才知道从哪儿起步
      'onFocus': () => send({ type: 'ITEM.HIGHLIGHT', value: item.value }),
      // 指针划过即把焦点连同高亮一起搬来：不同步的话，鼠标停在 A 上、回车却提交了键盘高亮的 B；
      // 只聚焦不滚动，滚动留给键盘导航
      'onPointerMove': (event: PointerEvent) => {
        if (itemDisabled(item) || highlighted === item.value)
          return
        const el = event.currentTarget as HTMLElement
        pointerHot.add(el)
        focusSafely(el)
        send({ type: 'ITEM.HIGHLIGHT', value: item.value })
      },
      // 指针离开列表层：收掉高亮、焦点还给列表，hover 不留漆。
      // 判据是「还在不在 list 里」——条目之间有间距时，指针落在缝上，relatedTarget 是 list 本身；
      // footer 是 list 的兄弟，指针挪到那儿仍按离开处理。
      // 触摸 tap 序列里的 leave 不作数
      'onPointerLeave': (event: PointerEvent) => {
        const el = event.currentTarget as HTMLElement
        if (event.pointerType === 'touch' || !pointerHot.delete(el))
          return
        if (highlighted !== item.value)
          return
        // list 认领着 listbox 的 id
        const list = el.ownerDocument.getElementById(ids.content)
        if (contains(list, event.relatedTarget as Node | null))
          return
        send({ type: 'HIGHLIGHT.CLEAR' })
        list?.focus()
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
      'aria-hidden': true,
      'style': VISUALLY_HIDDEN_STYLE,
    }),
  }
}
