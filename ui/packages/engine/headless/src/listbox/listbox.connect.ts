import type { NavIntent, NormalizeProps, PropTypes, SelectionOrder, Service } from '@xihan-ui/core'
import type { ListboxApi, ListboxItemProps, ListboxNodeMeta, ListboxSchema } from './listbox.types'
import { applySelection, contains, dataAttr, focusItem, indexOfValue, isItemDisabled, ITEM_VALUE_ATTR, itemValue, matchTypeahead, navigateItems, navIntentFromKey, queryItems, toggleSelectAll } from '@xihan-ui/core'
import { listboxAnatomy, listboxItemQuery, listboxItemText } from './listbox.anatomy'

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
  const mode = prop('selectionMode') ?? 'single'
  const multiselectable = mode !== 'single'
  const ids = scope.ids('listbox', 'label', 'content')

  // roving tabindex 锚点：焦点在列表内跟焦点走，否则落在选中集合的第一个。
  // 不取文档序里最靠前的选中项，那要查 DOM，而 connect 在 render 期求值、此时 DOM 尚不存在
  const anchor = focusedValue ?? value[0] ?? null

  // collection 推出的条目元信息：显示文本与禁用都在这里定案，条目部件只报 value
  const collection: ListboxNodeMeta[] = (prop('collection') ?? []).map(node => ({
    value: node.value,
    label: node.label ?? node.value,
    disabled: !!node.disabled,
  }))
  const metaOf = new Map(collection.map(meta => [meta.value, meta]))

  const isSelected = (v: string): boolean => value.includes(v)
  /** 条目禁用：整列禁用一票通过，其次看部件上写的，再没有就回 collection 里查。 */
  const isDisabled = (item: ListboxItemProps): boolean =>
    listDisabled || (item.disabled ?? metaOf.get(item.value)?.disabled ?? false)

  // item / item-text / item-indicator 共用同一份状态标记
  const stateAttrs = (item: ListboxItemProps): Record<string, string | undefined> => ({
    'data-state': isSelected(item.value) ? 'checked' : 'unchecked',
    'data-disabled': dataAttr(isDisabled(item)),
    'data-highlighted': dataAttr(focusedValue === item.value),
  })

  const groupLabelId = (group: string): string => scope.partId(listboxAnatomy.name, `group-label:${group}`)

  /** 按文档序现读条目集合；仅在事件回调中调用。 */
  const items = (content: HTMLElement): HTMLElement[] => queryItems(content, listboxItemQuery)

  /** 事件目标所在的列表容器。 */
  const contentOf = (el: HTMLElement): HTMLElement | null => el.closest<HTMLElement>(parts.content.selector)

  const focusValue = (el: HTMLElement | null): string | null => {
    const next = itemValue(el)
    if (next == null)
      return null
    focusItem(el)
    send({ type: 'ITEM.FOCUS', value: next })
    return next
  }

  /** 方向键落点：以锚点为起点在活 DOM 上求解，禁用条目跳过。 */
  const focusBy = (content: HTMLElement, intent: NavIntent): string | null =>
    focusValue(navigateItems(items(content), anchor, intent, { loop }))

  /** 连打检索落点：从当前锚点的下一个绕一圈查找，未命中保持原状。 */
  const focusMatch = (content: HTMLElement, query: string): void => {
    const list = items(content)
    focusValue(matchTypeahead(list, indexOfValue(list, anchor), query, {
      text: listboxItemText,
      skip: isItemDisabled,
    }))
  }

  /** 确认键：作用于焦点所在的非禁用条目。 */
  const commit = (content: HTMLElement, kind: 'replace' | 'toggle'): void => {
    if (focusedValue == null)
      return
    const el = items(content).find(item => itemValue(item) === focusedValue)
    if (!el || isItemDisabled(el))
      return
    send({ type: kind === 'toggle' ? 'ITEM.TOGGLE' : 'ITEM.SELECT', value: focusedValue })
  }

  /** 区间连选：整段替换原选中，段内禁用条目不入选。 */
  /** 从标记里取全序与禁用判定：集合怎么算归原语，谁在前谁在后归 DOM。 */
  const orderOf = (content: HTMLElement): SelectionOrder => {
    const list = items(content)
    const disabled = new Set(list.filter(el => isItemDisabled(el)).map(itemValue).filter((v): v is string => v != null))
    return {
      items: list.map(itemValue).filter((v): v is string => v != null),
      isDisabled: (value: string) => disabled.has(value),
    }
  }

  const extendTo = (content: HTMLElement, to: string): void => {
    const next = applySelection({
      state: { selected: value, anchor: anchorValue ?? to },
      mode: 'multiple',
      value: to,
      extend: true,
      ...orderOf(content),
    })
    send({ type: 'VALUE.SET', value: [...next.selected] })
  }

  /** 全选/取消全选；取消时保留选中的禁用条目。 */
  const selectAll = (content: HTMLElement): void => {
    const next = toggleSelectAll({ selected: value, anchor: anchorValue }, orderOf(content))
    send({ type: 'VALUE.SET', value: [...next.selected] })
  }

  return {
    value,
    collection,
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

    // 键盘在 content 上收口，靠冒泡统一处理
    getContentProps: () => normalize.element({
      ...parts.content.attrs,
      'id': ids.content,
      'role': 'listbox',
      'aria-labelledby': ids.label,
      'aria-multiselectable': multiselectable ? 'true' : 'false',
      'aria-orientation': orientation,
      'aria-disabled': listDisabled ? 'true' : 'false',
      // 焦点在列表外时容器进 Tab 序列，onFocus 再转投给条目。
      // 判据只能用 focusedValue：anchor 可能指向一个不存在的条目，那时没有条目认领 tabindex=0
      'tabindex': focusedValue == null ? 0 : -1,
      'data-orientation': orientation,
      'data-disabled': dataAttr(listDisabled),
      'onKeyDown': (event: KeyboardEvent) => {
        if (listDisabled)
          return
        const content = event.currentTarget as HTMLElement
        const key = event.key
        const command = event.ctrlKey || event.metaKey

        // Ctrl/Cmd + A 全选，单选列表不接这个键
        if (command && !event.altKey && (key === 'a' || key === 'A')) {
          if (!multiselectable)
            return
          event.preventDefault()
          // 按住不放会连发 keydown，这是切换：重复执行会来回翻转
          if (event.repeat)
            return
          selectAll(content)
          return
        }
        // Ctrl/Cmd + Space：只切换焦点条目，不动其余选中
        if (command && key === ' ') {
          if (!multiselectable)
            return
          event.preventDefault()
          // 按住不放会连发 keydown，这是切换：重复执行会来回翻转
          if (event.repeat)
            return
          commit(content, 'toggle')
          return
        }
        // 方向键：带 Ctrl/Cmd/Alt 的组合不算导航，Shift 例外（多选扩选）。
        // 按键名判而不走 navIntentFromKey 的事件重载：那个重载对任何修饰键都返回 null，会吞掉 Shift 扩选
        const intent = command || event.altKey ? null : navIntentFromKey(key, { axis: orientation, dir })
        if (intent) {
          event.preventDefault()
          const next = focusBy(content, intent)
          // 扩选只认前后一步，Shift+Home/End 只搬焦点
          if (next != null && event.shiftKey && multiselectable && (intent === 'next' || intent === 'prev'))
            send({ type: 'ITEM.TOGGLE', value: next })
          return
        }
        if (key === 'Enter') {
          event.preventDefault()
          commit(content, mode === 'multiple' ? 'toggle' : 'replace')
          return
        }
        // 连打检索只搬焦点、不改选中。缓冲区空时 push(' ') 返回 null，空格才落到下面当确认键
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
        // 只接管从列表外进来的焦点
        if (contains(content, event.relatedTarget as Node | null))
          return
        const list = items(content)
        // 焦点落在首个可停留的选中项上，取不到则退回首个可停留条目
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

    getGroupProps: group => normalize.element({
      ...parts.group.attrs,
      'role': 'group',
      // 分组标题经 aria-labelledby 关联
      'aria-labelledby': groupLabelId(group.value),
      'data-disabled': dataAttr(listDisabled),
    }),

    getGroupLabelProps: group => normalize.element({
      ...parts['group-label'].attrs,
      'id': groupLabelId(group.value),
      'data-disabled': dataAttr(listDisabled),
    }),

    getItemProps: item => normalize.element({
      ...parts.item.attrs,
      ...stateAttrs(item),
      // 导航、检索与选中的条目身份
      [ITEM_VALUE_ATTR]: item.value,
      'role': 'option',
      // 未选中也显式输出 false
      'aria-selected': isSelected(item.value) ? 'true' : 'false',
      // 用 aria-disabled 而非原生 disabled，禁用条目仍可聚焦
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
      // 禁用条目被聚焦也记锚点，作为方向键起点
      'onFocus': () => send({ type: 'ITEM.FOCUS', value: item.value }),
    }),

    getItemTextProps: item => normalize.element({
      ...parts['item-text'].attrs,
      ...stateAttrs(item),
    }),

    getItemIndicatorProps: item => normalize.element({
      ...parts['item-indicator'].attrs,
      ...stateAttrs(item),
      'aria-hidden': true,
    }),
  }
}
