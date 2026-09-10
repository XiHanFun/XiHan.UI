import type { NavIntent, NormalizeProps, PropTypes, SelectionOrder, Service } from '@xihan-ui/core'
import type { TagApi } from '../tag'
import type { TagGroupApi, TagGroupItemProps, TagGroupNodeMeta, TagGroupSchema } from './tag-group.types'
import { contains, dataAttr, focusItem, indexOfValue, isItemDisabled, ITEM_VALUE_ATTR, itemValue, matchTypeahead, mergeProps, navigateItems, navIntentFromKey, toggleSelectAll } from '@xihan-ui/core'
import { connectStaticTag } from '../tag'
import { tagGroupAnatomy, tagGroupItems, tagGroupItemText } from './tag-group.anatomy'

const parts = tagGroupAnatomy.build()

export function connectTagGroup<T extends PropTypes>(
  service: Service<TagGroupSchema>,
  normalize: NormalizeProps<T>,
): TagGroupApi<T> {
  const { context, prop, send, refs, scope } = service
  const value = context.get('value')
  const focusedValue = context.get('focusedValue') ?? null
  const groupDisabled = !!prop('disabled')
  const readOnly = !!prop('readOnly')
  const orientation = prop('orientation') ?? 'horizontal'
  const dir = prop('dir') ?? 'ltr'
  const loop = prop('loop') ?? true
  const typeaheadOn = prop('typeahead') ?? true
  const mode = prop('selectionMode') ?? 'none'
  const selectable = mode !== 'none'
  const multiselectable = mode === 'multiple'
  const groupDeletable = prop('deletable') ?? false
  const editable = !groupDisabled && !readOnly
  const ids = scope.ids('tag-group', 'label', 'list')

  const translations = prop('translations')
  const label = {
    deleteItem: translations?.deleteItem ?? ((text: string) => `Delete ${text}`),
    list: translations?.list ?? 'Tags',
  }

  // roving tabindex 锚点：焦点在组内跟焦点走，否则落在选中集合的第一个。
  // 不取文档序里最靠前的选中项，那要查 DOM，而 connect 在 render 期求值、此时 DOM 尚不存在
  const anchor = focusedValue ?? value[0] ?? null

  // collection 推出的条目元信息：显示文本、禁用与可摘都在这里定案，条目部件只报 value
  const collection: TagGroupNodeMeta[] = (prop('collection') ?? []).map(node => ({
    value: node.value,
    label: node.label ?? node.value,
    disabled: !!node.disabled,
    deletable: node.deletable,
  }))
  const metaOf = new Map(collection.map(meta => [meta.value, meta]))

  const isSelected = (v: string): boolean => selectable && value.includes(v)
  /** 条目禁用：整组禁用一票通过，其次看部件上写的，再没有就回 collection 里查。 */
  const isDisabled = (item: TagGroupItemProps): boolean =>
    groupDisabled || (item.disabled ?? metaOf.get(item.value)?.disabled ?? false)
  /** 这一枚摘不摘得掉：部件上写的优先，其次 collection，再没有就跟随整组。 */
  const isDeletable = (item: TagGroupItemProps): boolean =>
    item.deletable ?? metaOf.get(item.value)?.deletable ?? groupDeletable
  const canDelete = (item: TagGroupItemProps): boolean => editable && isDeletable(item) && !isDisabled(item)

  // 标签本体与格子共用同一份状态标记；选中是布尔位，data-state 留给 tag 的 open 族
  const stateAttrs = (item: TagGroupItemProps): Record<string, string | undefined> => ({
    'data-selected': dataAttr(isSelected(item.value)),
    'data-disabled': dataAttr(isDisabled(item)),
    'data-highlighted': dataAttr(focusedValue === item.value),
  })

  /** 按文档序现读条目集合；仅在事件回调中调用。 */
  const items = (list: HTMLElement): HTMLElement[] => tagGroupItems(list)

  const focusValue = (el: HTMLElement | null): string | null => {
    const next = itemValue(el)
    if (next == null)
      return null
    focusItem(el)
    send({ type: 'ITEM.FOCUS', value: next })
    return next
  }

  /** 方向键落点：以锚点为起点在活 DOM 上求解，禁用条目跳过。 */
  const focusBy = (list: HTMLElement, intent: NavIntent): string | null =>
    focusValue(navigateItems(items(list), anchor, intent, { loop }))

  /** 连打检索落点：从当前锚点的下一个绕一圈查找，未命中保持原状。 */
  const focusMatch = (list: HTMLElement, query: string): void => {
    const all = items(list)
    focusValue(matchTypeahead(all, indexOfValue(all, anchor), query, {
      text: tagGroupItemText,
      skip: isItemDisabled,
    }))
  }

  /** 确认键：作用于焦点所在的非禁用条目。 */
  const commit = (list: HTMLElement, kind: 'replace' | 'toggle'): void => {
    if (focusedValue == null)
      return
    const el = items(list).find(item => itemValue(item) === focusedValue)
    if (!el || isItemDisabled(el))
      return
    send({ type: kind === 'toggle' ? 'ITEM.TOGGLE' : 'ITEM.SELECT', value: focusedValue })
  }

  /** 从标记里取全序与禁用判定：集合怎么算归原语，谁在前谁在后归 DOM。 */
  const orderOf = (list: HTMLElement): SelectionOrder => {
    const all = items(list)
    const disabled = new Set(all.filter(el => isItemDisabled(el)).map(itemValue).filter((v): v is string => v != null))
    return {
      items: all.map(itemValue).filter((v): v is string => v != null),
      isDisabled: (v: string) => disabled.has(v),
    }
  }

  /** 全选/取消全选；取消时保留选中的禁用条目。 */
  const selectAll = (list: HTMLElement): void => {
    const next = toggleSelectAll({ selected: value, anchor: null }, orderOf(list))
    send({ type: 'VALUE.SET', value: [...next.selected] })
  }

  /**
   * 摘掉一枚，并先把焦点安排好。
   *
   * 落点取前一枚：摘完之后它在文档里的位置原样不动，节点必然还在；后一枚的位子会被
   * 后面的条目顶上来，宿主按下标复用节点时手里攥着的那个恰好被卸载，焦点当场又丢了。
   * 前面一枚都没有才退回后一枚，一枚不剩就交给列表容器——它恒在，且此刻锚点即将清空，
   * 容器会重新认领 Tab 停靠点。
   *
   * 只在焦点确实落在这一枚里时才搬：鼠标点摘除钮时焦点压根没进来，搬走它等于把用户
   * 从别处拽过来。列表按 id 取——键盘与摘除钮两条路都到这里，不必各自带着出发点。
   */
  const requestDelete = (item: TagGroupItemProps): void => {
    const list = scope.getById(ids.list)
    if (!list)
      return
    const all = items(list)
    const index = indexOfValue(all, item.value)
    const owner = index < 0 ? null : all[index]!
    if (owner && contains(owner, scope.getActiveElement())) {
      const next = all[index - 1] ?? all[index + 1] ?? null
      if (next)
        focusValue(next)
      else
        focusItem(list)
    }
    send({ type: 'ITEM.DELETE', value: item.value })
  }

  // 一枚标签套的是库里的 tag：三轴与只读从整组传下去，禁用与可摘逐枚定。
  // 显隐受控在这里——标签在不在由宿主的数据决定，不建机器。
  // 关闭钮即摘除钮：受控 open 下按它只发 onOpenChange，摘除从这里回到机器；
  // 禁用与只读都由 tag 挡在钮上，这里不再守一次
  const hostedTag = (item: TagGroupItemProps): TagApi<T> => connectStaticTag(
    {
      variant: prop('variant'),
      tone: prop('tone'),
      size: prop('size'),
      readOnly,
      disabled: isDisabled(item),
      closable: isDeletable(item),
      open: true,
      translations: { close: label.deleteItem(metaOf.get(item.value)?.label ?? item.value) },
      onOpenChange: ({ open }) => {
        if (!open)
          requestDelete(item)
      },
    },
    { get: () => true, set: () => {} },
    normalize,
  )

  return {
    value,
    collection,
    selectionMode: mode,
    focusedValue,
    disabled: groupDisabled,
    readOnly,
    deletable: groupDeletable,
    isSelected,
    setValue: next => send({ type: 'VALUE.SET', value: next }),
    select: v => send({ type: 'ITEM.SELECT', value: v }),
    toggle: v => send({ type: 'ITEM.TOGGLE', value: v }),
    deleteItem: v => send({ type: 'ITEM.DELETE', value: v }),

    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      'data-orientation': orientation,
      'data-disabled': dataAttr(groupDisabled),
      'data-readonly': dataAttr(readOnly),
    }),

    getLabelProps: () => normalize.element({
      ...parts.label.attrs,
      'id': ids.label,
      'data-disabled': dataAttr(groupDisabled),
    }),

    // 键盘在 list 上收口，靠冒泡统一处理
    getListProps: () => normalize.element({
      ...parts.list.attrs,
      'id': ids.list,
      'role': 'grid',
      // 作者没渲染 label 时这是条悬空 IDREF，按 accname 规则整条落空，名字退回下面的兜底
      'aria-labelledby': ids.label,
      'aria-label': label.list,
      'aria-multiselectable': multiselectable ? 'true' : 'false',
      'aria-disabled': groupDisabled ? 'true' : 'false',
      'aria-readonly': readOnly ? 'true' : 'false',
      // 焦点在组外时容器进 Tab 序列，onFocus 再转投给条目。
      // 判据只能用 focusedValue：anchor 可能指向一枚已被摘掉、或压根不在列表里的标签，
      // 那时没有条目认领 tabindex=0，容器若也退出 Tab 序列，整组对键盘用户永久不可达
      'tabindex': focusedValue == null ? 0 : -1,
      'data-orientation': orientation,
      'data-disabled': dataAttr(groupDisabled),
      'onKeyDown': (event: KeyboardEvent) => {
        if (groupDisabled)
          return
        const list = event.currentTarget as HTMLElement
        const key = event.key
        const command = event.ctrlKey || event.metaKey

        // Ctrl/Cmd + A 全选，只在可多选时接这个键
        if (command && !event.altKey && (key === 'a' || key === 'A')) {
          if (!multiselectable || !editable)
            return
          event.preventDefault()
          // 按住不放会连发 keydown，这是切换：重复执行会来回翻转
          if (event.repeat)
            return
          selectAll(list)
          return
        }
        // 方向键：带修饰键的组合不算导航
        const intent = command || event.altKey || event.shiftKey ? null : navIntentFromKey(key, { axis: orientation, dir })
        if (intent) {
          event.preventDefault()
          focusBy(list, intent)
          return
        }
        // 摘除走 Delete / Backspace：摘除钮不占 Tab 位，键盘那一路只能落在这儿
        if (key === 'Delete' || key === 'Backspace') {
          if (focusedValue == null)
            return
          const el = items(list).find(item => itemValue(item) === focusedValue)
          if (!el)
            return
          // 禁用与可摘从节点上现读：作者写在部件上的那一份声明已由上一帧落到 DOM，
          // 键盘这一路手里只有一个值，回不到作者的原始声明
          const item = {
            value: focusedValue,
            disabled: isItemDisabled(el),
            deletable: el.hasAttribute('data-deletable'),
          }
          if (!canDelete(item))
            return
          event.preventDefault()
          requestDelete(item)
          return
        }
        if (key === 'Enter') {
          if (!selectable || !editable)
            return
          event.preventDefault()
          commit(list, multiselectable ? 'toggle' : 'replace')
          return
        }
        // 连打检索只搬焦点、不改选中。缓冲区空时 push(' ') 返回 null，空格才落到下面当确认键
        const query = typeaheadOn && !command && !event.altKey ? refs.get('typeahead').push(key) : null
        if (query != null) {
          event.preventDefault()
          focusMatch(list, query)
          return
        }
        if (key === ' ') {
          if (!selectable || !editable)
            return
          event.preventDefault()
          commit(list, multiselectable ? 'toggle' : 'replace')
        }
      },
      'onFocus': (event: FocusEvent) => {
        const list = event.currentTarget as HTMLElement
        // 只接管从组外进来的焦点：摘完最后一枚时焦点是从组内交到容器手上的，不能再弹出去
        if (contains(list, event.relatedTarget as Node | null))
          return
        const all = items(list)
        // 焦点落在首个可停留的选中项上，取不到则退回首个可停留条目
        const selected = all.find((el) => {
          const v = itemValue(el)
          return v != null && isSelected(v) && !isItemDisabled(el)
        })
        // 落点条目自己的 onFocus 会把锚点接过去
        focusItem(selected ?? navigateItems(all, null, 'first'))
      },
      'onFocusOut': (event: FocusEvent) => {
        const list = event.currentTarget as HTMLElement
        if (contains(list, event.relatedTarget as Node | null))
          return
        send({ type: 'LIST.BLUR' })
      },
    }),

    // 标签本体就是 tag 的 root（data-scope="tag"）：三轴与置灰由 tag 给，
    // 集合里的那些事——行角色、身份、roving tabindex、选中与锚点——叠在它上面
    getItemProps: item => mergeProps<T['element']>(
      hostedTag(item).getRootProps(),
      normalize.element({
        ...stateAttrs(item),
        // 导航、检索、选中与摘除的条目身份
        [ITEM_VALUE_ATTR]: item.value,
        'role': 'row',
        // 不参与选中时干脆不出这个属性：一排纯标记标签报「未选中」是句假话
        'aria-selected': selectable ? (isSelected(item.value) ? 'true' : 'false') : undefined,
        // 用 aria-disabled 而非原生 disabled，禁用条目仍可聚焦、仍是导航起点
        'aria-disabled': isDisabled(item) ? 'true' : 'false',
        // roving tabindex：整组只有锚点条目留在 Tab 序列内
        'tabindex': anchor === item.value ? 0 : -1,
        'data-selectable': dataAttr(selectable),
        'data-deletable': dataAttr(isDeletable(item)),
        'onClick': () => {
          if (!selectable || !editable || isDisabled(item))
            return
          send(multiselectable
            ? { type: 'ITEM.TOGGLE', value: item.value }
            : { type: 'ITEM.SELECT', value: item.value })
        },
        // 禁用条目被聚焦也记锚点，作为方向键起点
        'onFocus': () => send({ type: 'ITEM.FOCUS', value: item.value }),
      }),
    ),

    // 标签里那一格：摘除钮可聚焦，只有落在 gridcell 下面才是合法嵌套
    getCellProps: item => normalize.element({
      ...parts.cell.attrs,
      ...stateAttrs(item),
      role: 'gridcell',
    }),

    // 标签文字落在 tag 的 label 上，截断规则挂在那一层
    getItemTextProps: item => hostedTag(item).getLabelProps(),

    // 摘除钮就是所在标签那份 tag 的 close-trigger：可及名、禁用、收起与点按都由 tag 给。
    // 不占 Tab 位：一排十枚标签，逐枚摘除钮各占一个停靠点时 Tab 就没法用了；
    // 键盘那一路走方向键选中标签再按 Delete / Backspace
    getItemDeleteTriggerProps: item => mergeProps<T['button']>(
      hostedTag(item).getCloseTriggerProps(),
      normalize.button({
        tabindex: -1,
        onPointerDown: (event: PointerEvent) => {
          // 只认主键，右键留给上下文菜单。
          // 焦点不因点这颗叉而改变：焦点在组外就留在组外，在某一枚标签上就留在那一枚上，
          // 摘完之后的去处由 requestDelete 按当下的焦点位置决定
          if (event.button === 0)
            event.preventDefault()
        },
      }),
    ),
  }
}
