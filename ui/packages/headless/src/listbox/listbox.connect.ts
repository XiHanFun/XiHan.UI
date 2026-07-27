import type { NavIntent } from '@xihan-ui/behavior'
import type { NormalizeProps, PropTypes } from '@xihan-ui/core'
import type { Service } from '@xihan-ui/machine'
import type { ListboxApi, ListboxItemProps, ListboxSchema } from './listbox.types'
import { focusItem, indexOfValue, isItemDisabled, ITEM_VALUE_ATTR, itemValue, matchTypeahead, navigateItems, navIntentFromKey, queryItems } from '@xihan-ui/behavior'
import { contains, dataAttr } from '@xihan-ui/core'
import { listboxAnatomy, listboxItemQuery, listboxItemText } from './listbox.anatomy'
import { listboxSelectionMode } from './listbox.machine'

const parts = listboxAnatomy.build()

export function connectListbox<T extends PropTypes>(
  service: Service<ListboxSchema>,
  normalize: NormalizeProps<T>,
): ListboxApi<T> {
  const { context, prop, send, refs, scope } = service
  const value = context.get('value')
  const focusedValue = context.get('focusedValue') ?? null
  const anchorValue = context.get('anchorValue') ?? null
  const listDisabled = !!prop('disabled')
  const orientation = prop('orientation') ?? 'vertical'
  const dir = prop('dir') ?? 'ltr'
  const loop = prop('loop') ?? true
  const typeaheadOn = prop('typeahead') ?? true
  const mode = listboxSelectionMode(prop('selectionMode'), prop('multiple'))
  const multiselectable = mode !== 'single'
  const ids = scope.ids('listbox', 'label', 'content')

  // roving tabindex 的唯一锚点：焦点在列表内跟焦点走，否则落在选中集合的第一个。
  // 取的是选中集合里的第一个而不是文档序里最靠前的选中项——后者要查 DOM，
  // connect 在 Vue 侧是 render 期求值，那一刻 DOM 还不存在。
  const anchor = focusedValue ?? value[0] ?? null

  const isSelected = (v: string): boolean => value.includes(v)
  // 整个列表禁用向下传导到每个条目；条目也能单独禁用
  const isDisabled = (item: ListboxItemProps): boolean => listDisabled || !!item.disabled

  // item / item-text / item-indicator 共用同一份状态标记，样式层各处一致
  const stateAttrs = (item: ListboxItemProps): Record<string, string | undefined> => ({
    'data-state': isSelected(item.value) ? 'checked' : 'unchecked',
    'data-disabled': dataAttr(isDisabled(item)),
    // 焦点所在与选中互相独立：可以停在一个没被选中的条目上
    'data-highlighted': dataAttr(focusedValue === item.value),
  })

  const groupLabelId = (group: string): string => scope.partId(listboxAnatomy.name, `item-group-label:${group}`)

  /**
   * 条目集合只在事件那一刻读，两个适配器此时看到的是同一份活 DOM，顺序即文档序。
   * 渲染期不得调用——那里 Vue 读到的是上一帧、WC 读到的是本帧，两侧会分叉。
   */
  const items = (content: HTMLElement): HTMLElement[] => queryItems(content, listboxItemQuery)

  /** 事件目标所在的列表容器。条目级处理器拿不到 content，只能就地往上找。 */
  const contentOf = (el: HTMLElement): HTMLElement | null => el.closest<HTMLElement>(parts.content.selector)

  const focusValue = (el: HTMLElement | null): string | null => {
    const next = itemValue(el)
    if (next == null)
      return null
    focusItem(el)
    send({ type: 'ITEM.FOCUS', value: next })
    return next
  }

  /** 方向键落点：起点用锚点，终点用活 DOM 算，禁用条目自动跳过。 */
  const focusBy = (content: HTMLElement, intent: NavIntent): string | null =>
    focusValue(navigateItems(items(content), anchor, intent, { loop }))

  /** 连打检索落点：从当前锚点的下一个绕一圈找，禁用条目跳过；未命中保持原状。 */
  const focusMatch = (content: HTMLElement, query: string): void => {
    const list = items(content)
    focusValue(matchTypeahead(list, indexOfValue(list, anchor), query, {
      text: listboxItemText,
      skip: isItemDisabled,
    }))
  }

  /** 确认键：认焦点当下所在的条目，自报禁用的不认。 */
  const commit = (content: HTMLElement, kind: 'replace' | 'toggle'): void => {
    if (focusedValue == null)
      return
    const el = items(content).find(item => itemValue(item) === focusedValue)
    if (!el || isItemDisabled(el))
      return
    send({ type: kind === 'toggle' ? 'ITEM.TOGGLE' : 'ITEM.SELECT', value: focusedValue })
  }

  /**
   * 区间连选：从区间起点到落点整段替换掉原选中，不是并集——
   * 与文件管理器、邮件列表的 Shift 点选一致，往回拖时选中范围要跟着收窄。
   * 段内的禁用条目不进选中集合。
   */
  const extendTo = (content: HTMLElement, to: string): void => {
    const list = items(content)
    const from = indexOfValue(list, anchorValue ?? to)
    const target = indexOfValue(list, to)
    if (from < 0 || target < 0)
      return
    const [lo, hi] = from <= target ? [from, target] : [target, from]
    const range = list
      .slice(lo, hi + 1)
      .filter(el => !isItemDisabled(el))
      .map(itemValue)
      .filter((v): v is string => v != null)
    send({ type: 'VALUE.SET', value: range })
  }

  /**
   * 全选/取消全选。取消那一路只摘掉可选条目，选中着的禁用条目留在集合里——
   * 用户按 Ctrl+A 是在操作他够得着的那些，不该顺手把够不着的也清掉。
   */
  const selectAll = (content: HTMLElement): void => {
    const usable = items(content)
      .filter(el => !isItemDisabled(el))
      .map(itemValue)
      .filter((v): v is string => v != null)
    if (!usable.length)
      return
    const all = usable.every(v => isSelected(v))
    send({ type: 'VALUE.SET', value: all ? value.filter(v => !usable.includes(v)) : [...value, ...usable] })
  }

  return {
    value,
    selectionMode: mode,
    focusedValue,
    disabled: listDisabled,
    isSelected,
    setValue: next => send({ type: 'VALUE.SET', value: next }),
    select: v => send({ type: 'ITEM.SELECT', value: v }),
    toggle: v => send({ type: 'ITEM.TOGGLE', value: v }),

    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      'data-orientation': orientation,
      'data-disabled': dataAttr(listDisabled),
    }),

    getLabelProps: () => normalize.element({
      ...parts.label.attrs,
      'id': ids.label,
      'data-disabled': dataAttr(listDisabled),
    }),

    // 键盘全在 content 上收口：条目只管声明自己，一次冒泡一个处理器
    getContentProps: () => normalize.element({
      ...parts.content.attrs,
      'id': ids.content,
      'role': 'listbox',
      'aria-labelledby': ids.label,
      // 复选与否必须显式说：省略只是「没说」，读屏无从区分单选列表与「作者忘了标」
      'aria-multiselectable': multiselectable ? 'true' : 'false',
      'aria-orientation': orientation,
      'aria-disabled': listDisabled ? 'true' : 'false',
      // 焦点在列表外时容器兜底进 Tab 序列，由 onFocus 转投给条目。
      // 判据用 focusedValue 而非 anchor：anchor 可能指向一个不存在的条目
      // （受控值不在选项里、条目被删），那时没有任何条目认领 tabindex=0，
      // 容器再一让位，整组对键盘用户永久不可达。焦点已在组内时容器让位（-1），
      // Tab 才能正常离开本组。
      'tabindex': focusedValue == null ? 0 : -1,
      'data-orientation': orientation,
      'data-disabled': dataAttr(listDisabled),
      'onKeyDown': (event: KeyboardEvent) => {
        if (listDisabled)
          return
        const content = event.currentTarget as HTMLElement
        const key = event.key
        const command = event.ctrlKey || event.metaKey

        // Ctrl/Cmd + A 全选。单选列表不接这个键：那儿没有「全选」可言，
        // 吞掉它只会把浏览器的全选文本一并废掉
        if (command && !event.altKey && (key === 'a' || key === 'A')) {
          if (!multiselectable)
            return
          event.preventDefault()
          selectAll(content)
          return
        }
        // Ctrl/Cmd + Space：只切换焦点条目，不动其余选中（extended 的加选写法）
        if (command && key === ' ') {
          if (!multiselectable)
            return
          event.preventDefault()
          commit(content, 'toggle')
          return
        }
        // 方向键。带 Ctrl/Cmd/Alt 的组合一律不归导航管（Ctrl+Home 之类归浏览器与读屏）；
        // Shift 例外——多选时它是「移动焦点并顺手切换落点」的扩选写法，所以这里按键名判，
        // 不走 navIntentFromKey 的事件重载（那个对任何修饰键都返回 null）。
        // 返回 null 表示该键不归导航管，此时绝不 preventDefault（页面滚动与读屏要用）。
        const intent = command || event.altKey ? null : navIntentFromKey(key, { axis: orientation, dir })
        if (intent) {
          event.preventDefault()
          const next = focusBy(content, intent)
          // 扩选只认前后一步：Shift+Home/End 那种「一直选到端点」是另一回事，
          // 这里只搬焦点，不静默吞掉一大片选中
          if (next != null && event.shiftKey && multiselectable && (intent === 'next' || intent === 'prev'))
            send({ type: 'ITEM.TOGGLE', value: next })
          return
        }
        if (key === 'Enter') {
          event.preventDefault()
          commit(content, mode === 'multiple' ? 'toggle' : 'replace')
          return
        }
        // 连打检索只搬焦点、不改选中。缓冲区空时空格不算字符（push 返回 null），
        // 落到下面按确认键处理；缓冲区非空时它是词中间的空格，归检索。
        // 这个键既已被检索吞掉就一律拦下默认行为——词中间的空格若放行，页面会跟着滚一屏
        const query = typeaheadOn && !command && !event.altKey ? refs.get('typeahead').push(key) : null
        if (query != null) {
          event.preventDefault()
          focusMatch(content, query)
          return
        }
        if (key === ' ') {
          event.preventDefault()
          commit(content, mode === 'multiple' ? 'toggle' : 'replace')
        }
      },
      'onFocus': (event: FocusEvent) => {
        const content = event.currentTarget as HTMLElement
        // 只接管从列表外进来的焦点：组内 Shift+Tab 往外退时转投会把人困在列表里
        if (contains(content, event.relatedTarget as Node | null))
          return
        const list = items(content)
        // 焦点进入列表应当落在选中项上；它不可停留（禁用、或压根不在列表里）时
        // 退回首个可停留条目。整列禁用时两路都取不到，焦点就留在容器上。
        const selected = list.find((el) => {
          const v = itemValue(el)
          return v != null && isSelected(v) && !isItemDisabled(el)
        })
        // 落点条目自己的 onFocus 会把锚点接过去
        focusItem(selected ?? navigateItems(list, null, 'first'))
      },
      'onFocusOut': (event: FocusEvent) => {
        const content = event.currentTarget as HTMLElement
        if (contains(content, event.relatedTarget as Node | null))
          return
        send({ type: 'LIST.BLUR' })
      },
    }),

    getItemGroupProps: group => normalize.element({
      ...parts['item-group'].attrs,
      'role': 'group',
      // 分组标题不是选项，只能靠 aria-labelledby 挂上来；读屏据此播报「第 N 组，常见」
      'aria-labelledby': groupLabelId(group.value),
      'data-disabled': dataAttr(listDisabled),
    }),

    getItemGroupLabelProps: group => normalize.element({
      ...parts['item-group-label'].attrs,
      'id': groupLabelId(group.value),
      'data-disabled': dataAttr(listDisabled),
    }),

    getItemProps: item => normalize.element({
      ...parts.item.attrs,
      ...stateAttrs(item),
      // 导航、检索与选中都以此为条目身份
      [ITEM_VALUE_ATTR]: item.value,
      'role': 'option',
      // listbox 的选中语义是 aria-selected（不是 aria-checked）；未选中必须显式输出 false，
      // 省略会让读屏无从区分「未选中」与「不是选项」
      'aria-selected': isSelected(item.value) ? 'true' : 'false',
      // 集合条目一律 aria-disabled，绝不输出原生 disabled：原生 disabled 不可聚焦、
      // 也不派发 click，禁用条目就再也当不成方向键的起点，样式与行为也会就此分裂
      'aria-disabled': isDisabled(item) ? 'true' : 'false',
      // roving tabindex：整组只有锚点条目留在 Tab 序列内
      'tabindex': anchor === item.value ? 0 : -1,
      'onClick': (event: MouseEvent) => {
        if (isDisabled(item))
          return
        if (mode === 'single') {
          send({ type: 'ITEM.SELECT', value: item.value })
          return
        }
        if (mode === 'multiple') {
          send({ type: 'ITEM.TOGGLE', value: item.value })
          return
        }
        // extended：Shift 连选区间、Ctrl/Cmd 加选单个、裸点替换
        if (event.shiftKey) {
          const content = contentOf(event.currentTarget as HTMLElement)
          if (content)
            extendTo(content, item.value)
          return
        }
        send(event.ctrlKey || event.metaKey
          ? { type: 'ITEM.TOGGLE', value: item.value }
          : { type: 'ITEM.SELECT', value: item.value })
      },
      // 焦点是事实不是许可：禁用条目被点到也记锚点，方向键才知道从哪儿起步
      'onFocus': () => send({ type: 'ITEM.FOCUS', value: item.value }),
    }),

    getItemTextProps: item => normalize.element({
      ...parts['item-text'].attrs,
      ...stateAttrs(item),
    }),

    getItemIndicatorProps: item => normalize.element({
      ...parts['item-indicator'].attrs,
      ...stateAttrs(item),
      'aria-hidden': 'true',
    }),
  }
}
