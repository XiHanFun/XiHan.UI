import type { NavIntent } from '@xihan-ui/behavior'
import type { NormalizeProps, PropTypes } from '@xihan-ui/kernel'
import type { Service } from '@xihan-ui/machine'
import type {
  TransferApi,
  TransferCheckState,
  TransferItemProps,
  TransferSchema,
  TransferSide,
} from './transfer.types'
import { focusItem, isItemDisabled, ITEM_VALUE_ATTR, itemValue, navigateItems, navIntentFromKey, queryItems } from '@xihan-ui/behavior'
import { contains, dataAttr } from '@xihan-ui/kernel'
import { transferAnatomy, transferItemQuery } from './transfer.anatomy'
import { transferFocusKey, transferOppositeSide, transferQueryKey } from './transfer.machine'
import {
  transferCheckedValues,
  transferCheckState,
  transferIsCheckable,
  transferOperableValues,
  transferSideOf,
  transferVisibleItems,
} from './transfer.sets'

const parts = transferAnatomy.build()

/** 两侧各存一份的数据用这个形状。 */
type BySide<V> = Record<TransferSide, V>

function bySide<V>(make: (side: TransferSide) => V): BySide<V> {
  return { source: make('source'), target: make('target') }
}

export function connectTransfer<T extends PropTypes>(
  service: Service<TransferSchema>,
  normalize: NormalizeProps<T>,
): TransferApi<T> {
  const { context, prop, send, scope } = service
  const collection = prop('collection') ?? []
  const value = context.get('value')
  const selected = context.get('selected')
  const disabled = !!prop('disabled')
  const oneWay = !!prop('oneWay')
  const searchable = !!prop('searchable')
  const loop = prop('loop') ?? true
  const dir = prop('dir') ?? 'ltr'
  const filter = prop('filter')
  const ids = scope.ids('transfer', 'source-title', 'target-title', 'source-list', 'target-list')

  const titleId: BySide<string> = { source: ids['source-title'], target: ids['target-title'] }
  const listId: BySide<string> = { source: ids['source-list'], target: ids['target-list'] }

  /** 条目元信息的唯一事实源是 collection，不是标记。 */
  const index = new Map(collection.map(item => [item.value, item]))

  const queries = bySide<string>(side => (searchable ? context.get(transferQueryKey(side)) : ''))

  // connect 在 render 期求值，此时 DOM 尚不存在，不得读 DOM
  const visible = bySide(side => transferVisibleItems(collection, value, side, queries[side], filter))
  const operable = bySide(side => transferOperableValues(visible[side]))
  const checked = bySide(side => transferCheckedValues(operable[side], selected))
  const checkStates = bySide<TransferCheckState>(side => transferCheckState(operable[side], selected))

  const selectable = bySide(side => transferIsCheckable(side, oneWay))
  const editable = bySide(side => !disabled && selectable[side])

  const visibleSet = bySide(side => new Set(visible[side].map(item => item.value)))

  /** 焦点锚点投影成本侧当下可见的值：搬走或被搜索藏起的条目已 hidden、不可聚焦，不能认领 tabindex=0。 */
  const focusedValue = bySide<string | null>((side) => {
    const raw = context.get(transferFocusKey(side))
    return raw != null && visibleSet[side].has(raw) ? raw : null
  })

  /** roving tabindex 的锚点。 */
  const anchor = bySide<string | null>(side =>
    focusedValue[side] ?? visible[side].find(item => selected.includes(item.value))?.value ?? null)

  const isChecked = (v: string): boolean => selected.includes(v)
  const sideOf = (v: string): TransferSide => transferSideOf(value, v)
  const isItemLocked = (v: string): boolean => disabled || !!index.get(v)?.disabled

  /** 往 to 侧搬此刻是否可行。 */
  const canMove = (to: TransferSide): boolean => {
    if (disabled)
      return false
    if (to === 'source' && oneWay)
      return false
    return checked[transferOppositeSide(to)].length > 0
  }

  /** 条目一系（item / item-text / item-checkbox）共用的状态标记。 */
  const itemState = (item: TransferItemProps): Record<string, string | undefined> => {
    // 同一个 value 在两侧各有一个节点，只有归属那一侧才算数
    const belongs = sideOf(item.value) === item.side
    const shown = belongs && visibleSet[item.side].has(item.value)
    return {
      'data-side': item.side,
      'data-state': shown && isChecked(item.value) ? 'checked' : 'unchecked',
      'data-disabled': dataAttr(isItemLocked(item.value)),
      'data-highlighted': dataAttr(shown && focusedValue[item.side] === item.value),
    }
  }

  /** 这个条目节点此刻该不该显形。两侧各挂一份全集，不属于本侧的那一份一律隐去。 */
  const isShown = (item: TransferItemProps): boolean =>
    sideOf(item.value) === item.side && visibleSet[item.side].has(item.value)

  // ── 以下都在事件那一刻读活 DOM。渲染期不得调用 ──

  const rootOf = (el: HTMLElement): HTMLElement | null => el.closest<HTMLElement>(parts.root.selector)

  /** 某一侧的列表容器。 */
  const listElOf = (from: HTMLElement, side: TransferSide): HTMLElement | null => {
    const panel = rootOf(from)?.querySelector<HTMLElement>(parts[`${side}-panel`].selector)
    return panel?.querySelector<HTMLElement>(parts.list.selector) ?? null
  }

  /** 某一侧看得见的条目元素，按推导序（collection 原序）排列；文档序里混着 hidden 条目，不能用。 */
  const visibleEls = (list: HTMLElement, side: TransferSide): HTMLElement[] => {
    const byValue = new Map<string, HTMLElement>()
    for (const el of queryItems(list, transferItemQuery)) {
      const v = itemValue(el)
      if (v != null && !byValue.has(v))
        byValue.set(v, el)
    }
    return visible[side]
      .map(item => byValue.get(item.value))
      .filter((el): el is HTMLElement => el != null)
  }

  const focusValue = (side: TransferSide, el: HTMLElement | null): string | null => {
    const next = itemValue(el)
    if (next == null)
      return null
    focusItem(el)
    send({ type: 'ITEM.FOCUS', side, value: next })
    return next
  }

  /** 方向键落点。 */
  const focusBy = (list: HTMLElement, side: TransferSide, intent: NavIntent): string | null =>
    focusValue(side, navigateItems(visibleEls(list, side), anchor[side], intent, { loop }))

  /** 确认键：切换焦点当下所在的条目。 */
  const commit = (side: TransferSide): void => {
    const focused = focusedValue[side]
    if (focused == null || !editable[side] || !operable[side].includes(focused))
      return
    send({ type: 'ITEM.TOGGLE', value: focused })
  }

  /** 搬运并安排焦点去处：焦点必须先安置再发搬运事件，否则落点取决于宿主提交 DOM 的时机。 */
  const moveTo = (from: HTMLElement, to: TransferSide): void => {
    const active = scope.getActiveElement()
    const holds = !!active && (active === from || from.contains(active))
    if (holds)
      listElOf(from, to)?.focus()
    send({ type: 'ITEMS.MOVE', to })
  }

  return {
    collection,
    value,
    selected,
    disabled,
    oneWay,
    searchable,
    visibleItems: side => visible[side],
    checkedValues: side => checked[side],
    checkState: side => checkStates[side],
    query: side => queries[side],
    canMove,
    isChecked,
    sideOf,
    setValue: next => send({ type: 'VALUE.SET', value: next }),
    setSelected: next => send({ type: 'SELECTED.SET', selected: next }),
    setQuery: (side, next) => send({ type: 'SEARCH.SET', side, query: next }),
    toggle: v => send({ type: 'ITEM.TOGGLE', value: v }),
    toggleAll: side => send({ type: 'SIDE.TOGGLE_ALL', side }),
    move: to => send({ type: 'ITEMS.MOVE', to }),

    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      'data-disabled': dataAttr(disabled),
      'data-one-way': dataAttr(oneWay),
      // 只在作者显式给了 dir 时才写，默认写 ltr 会盖掉外层文档的 rtl
      'dir': prop('dir'),
    }),

    getPanelProps: panel => normalize.element({
      ...parts[`${panel.side}-panel`].attrs,
      'data-side': panel.side,
      'data-disabled': dataAttr(disabled),
    }),

    getPanelHeaderProps: panel => normalize.element({
      ...parts['panel-header'].attrs,
      'data-side': panel.side,
      'data-disabled': dataAttr(disabled),
    }),

    getPanelTitleProps: panel => normalize.element({
      ...parts['panel-title'].attrs,
      'id': titleId[panel.side],
      'data-side': panel.side,
    }),

    /** 计数只出数字，不出文案。 */
    getPanelCountProps: panel => normalize.element({
      ...parts['panel-count'].attrs,
      'data-side': panel.side,
      'data-count': String(visible[panel.side].length),
      'data-checked-count': String(checked[panel.side].length),
    }),

    getSearchProps: panel => normalize.input({
      ...parts.search.attrs,
      'type': 'text',
      'autocomplete': 'off',
      'autocapitalize': 'none',
      'value': queries[panel.side],
      // 单体控件用原生 disabled，集合条目才用 aria-disabled
      'disabled': disabled || undefined,
      'aria-controls': listId[panel.side],
      // 搜索框无可见标签，借本侧标题当可及名字
      'aria-labelledby': titleId[panel.side],
      'data-side': panel.side,
      // 关掉搜索时只隐去，不卸载作者节点
      'hidden': !searchable || undefined,
      'onInput': (event: Event) => {
        if (disabled)
          return
        send({ type: 'SEARCH.SET', side: panel.side, query: (event.target as HTMLInputElement).value })
      },
    }),

    // 键盘在 list 上收口，条目不各挂处理器
    getListProps: panel => normalize.element({
      ...parts.list.attrs,
      'id': listId[panel.side],
      'role': 'listbox',
      'aria-labelledby': titleId[panel.side],
      // 复选与否必须显式输出，oneWay 下 target 侧确实选不了
      'aria-multiselectable': selectable[panel.side] ? 'true' : 'false',
      'aria-disabled': disabled ? 'true' : 'false',
      // 判据用 focusedValue 而非锚点：锚点可能指向已搬走的值，那时没有条目认领 tabindex=0
      'tabindex': focusedValue[panel.side] == null ? 0 : -1,
      'data-side': panel.side,
      'data-disabled': dataAttr(disabled),
      'onKeyDown': (event: KeyboardEvent) => {
        if (disabled)
          return
        const list = event.currentTarget as HTMLElement
        const side = panel.side
        const key = event.key
        const command = event.ctrlKey || event.metaKey

        // Ctrl/Cmd + A 全选本侧可操作条目，再按一次取消
        if (command && !event.altKey && (key === 'a' || key === 'A')) {
          if (!editable[side])
            return
          event.preventDefault()
          send({ type: 'SIDE.TOGGLE_ALL', side })
          return
        }
        // Ctrl/Cmd + Space：与裸空格同义，切换焦点条目
        if (command && key === ' ') {
          if (!editable[side])
            return
          event.preventDefault()
          commit(side)
          return
        }

        // 横向方向键 = 把本侧勾中的条目搬向对面；rtl 下方向对调
        if (!command && !event.altKey && (key === 'ArrowRight' || key === 'ArrowLeft')) {
          const toTarget = (key === 'ArrowRight') !== (dir === 'rtl')
          const to: TransferSide = toTarget ? 'target' : 'source'
          // 本侧就是目的地时不拦这个键，放行给页面
          if (to === side || !canMove(to))
            return
          event.preventDefault()
          moveTo(list, to)
          return
        }

        // 按键名判而不走 navIntentFromKey 的事件重载：那个重载对任何修饰键都返回 null，会吞掉 Shift 扩选
        const intent = command || event.altKey ? null : navIntentFromKey(key, { axis: 'vertical' })
        if (intent) {
          event.preventDefault()
          const next = focusBy(list, side, intent)
          // 扩选只认前后一步
          if (next != null && event.shiftKey && editable[side] && (intent === 'next' || intent === 'prev'))
            send({ type: 'ITEM.TOGGLE', value: next })
          return
        }

        if (key === 'Enter' || key === ' ') {
          event.preventDefault()
          commit(side)
        }
      },
      'onFocus': (event: FocusEvent) => {
        const list = event.currentTarget as HTMLElement
        // 只接管从本列表之外进来的焦点：组内 Shift+Tab 往外退时转投会把人困在列表里
        if (contains(list, event.relatedTarget as Node | null))
          return
        const els = visibleEls(list, panel.side)
        // 焦点进入应当落在勾中项上；它不可停留（禁用）时退回首个可停留条目。
        // 整体禁用时两路都取不到，焦点就留在容器上
        const hit = els.find((el) => {
          const v = itemValue(el)
          return v != null && isChecked(v) && !isItemDisabled(el)
        })
        // 落点条目自己的 onFocus 会把锚点接过去
        focusItem(hit ?? navigateItems(els, null, 'first'))
      },
      'onFocusOut': (event: FocusEvent) => {
        const list = event.currentTarget as HTMLElement
        if (contains(list, event.relatedTarget as Node | null))
          return
        send({ type: 'LIST.BLUR', side: panel.side })
      },
    }),

    /**
     * 全选格是原生按钮 + role=checkbox：Enter/Space 的激活由平台负责，
     * 原生 disabled 才拦得住（单体控件一律如此）。
     * mixed 是这个部件存在的理由——勾了一部分时读屏要念"部分选中"，
     * 而不是在 true/false 里二选一硬凑。
     */
    getSelectAllTriggerProps: (panel) => {
      const state = checkStates[panel.side]
      const off = !editable[panel.side] || operable[panel.side].length === 0
      return normalize.button({
        ...parts['select-all-trigger'].attrs,
        'type': 'button',
        'role': 'checkbox',
        'aria-checked': state === 'checked' ? 'true' : state === 'indeterminate' ? 'mixed' : 'false',
        'aria-controls': listId[panel.side],
        'disabled': off || undefined,
        'data-side': panel.side,
        'data-state': state,
        'data-disabled': dataAttr(off),
        'onClick': () => {
          if (off)
            return
          send({ type: 'SIDE.TOGGLE_ALL', side: panel.side })
        },
      })
    },

    getItemProps: (item) => {
      const shown = isShown(item)
      const locked = isItemLocked(item.value)
      return normalize.element({
        ...parts.item.attrs,
        ...itemState(item),
        // 导航、焦点与勾选都以此为条目身份
        [ITEM_VALUE_ATTR]: item.value,
        'role': 'option',
        // listbox 的选中语义是 aria-selected；未选中必须显式输出 false，
        // 省略会让读屏无从区分「没勾」与「不是选项」
        'aria-selected': shown && isChecked(item.value) ? 'true' : 'false',
        // 集合条目一律 aria-disabled，绝不输出原生 disabled：原生 disabled 不可聚焦、
        // 也不派发 click，禁用条目就再也当不成方向键的起点，样式与行为也会就此分裂
        'aria-disabled': locked ? 'true' : 'false',
        // roving tabindex：每一侧只有锚点条目留在 Tab 序列内。
        // 隐去的条目绝不认领——它不可聚焦，占了停靠位就等于这一侧没有停靠位
        'tabindex': shown && anchor[item.side] === item.value ? 0 : -1,
        // 不属于本侧、或被搜索筛掉的那一份只隐去，不卸载作者节点
        'hidden': !shown || undefined,
        'onClick': () => {
          if (!shown || locked || !editable[item.side])
            return
          send({ type: 'ITEM.TOGGLE', value: item.value })
        },
        // 焦点是事实不是许可：禁用条目被点到也记锚点，方向键才知道从哪儿起步
        'onFocus': () => {
          if (shown)
            send({ type: 'ITEM.FOCUS', side: item.side, value: item.value })
        },
      })
    },

    getItemTextProps: item => normalize.element({
      ...parts['item-text'].attrs,
      ...itemState(item),
    }),

    // 视觉方框，读屏不需要它——勾选态由条目自己的 aria-selected 承担。
    // oneWay 下的 target 侧勾不了任何东西，这一格也就不该在场
    getItemCheckboxProps: item => normalize.element({
      ...parts['item-checkbox'].attrs,
      ...itemState(item),
      'aria-hidden': 'true',
      'hidden': !selectable[item.side] || undefined,
    }),

    getToTargetTriggerProps: () => normalize.button({
      ...parts['to-target-trigger'].attrs,
      'type': 'button',
      // 单体控件用原生 disabled：没勾中任何可搬的条目时按下去什么也不会发生，
      // 它就该退出 Tab 序列，而不是留在那儿让人按一下、没反应、再按一下
      'disabled': !canMove('target') || undefined,
      'aria-controls': listId.target,
      'data-disabled': dataAttr(!canMove('target')),
      'onClick': (event: MouseEvent) => {
        if (!canMove('target'))
          return
        moveTo(event.currentTarget as HTMLElement, 'target')
      },
    }),

    getToSourceTriggerProps: () => normalize.button({
      ...parts['to-source-trigger'].attrs,
      'type': 'button',
      // oneWay 把这条路整个封死，此时它恒为禁用
      'disabled': !canMove('source') || undefined,
      'aria-controls': listId.source,
      'data-disabled': dataAttr(!canMove('source')),
      'onClick': (event: MouseEvent) => {
        if (!canMove('source'))
          return
        moveTo(event.currentTarget as HTMLElement, 'source')
      },
    }),
  }
}
