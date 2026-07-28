import type { NavIntent } from '@xihan-ui/behavior'
import type { NormalizeProps, PropTypes } from '@xihan-ui/core'
import type { Service } from '@xihan-ui/machine'
import type {
  TransferApi,
  TransferCheckState,
  TransferItemProps,
  TransferSchema,
  TransferSide,
} from './transfer.types'
import { focusItem, isItemDisabled, ITEM_VALUE_ATTR, itemValue, navigateItems, navIntentFromKey, queryItems } from '@xihan-ui/behavior'
import { contains, dataAttr } from '@xihan-ui/core'
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

/** 两侧各存一份的东西一律用这个形状，省得处处写 side === 'source' ? a : b。 */
type BySide<V> = Record<TransferSide, V>

function bySide<V>(make: (side: TransferSide) => V): BySide<V> {
  return { source: make('source'), target: make('target') }
}

export function connectTransfer<T extends PropTypes>(
  service: Service<TransferSchema>,
  normalize: NormalizeProps<T>,
): TransferApi<T> {
  const { context, prop, send, scope } = service
  const items = prop('items') ?? []
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

  /** 元信息的唯一事实源是 items，不是标记：作者不必在两侧各抄一份禁用声明。 */
  const index = new Map(items.map(item => [item.value, item]))

  // 搜索关掉时搜索串一律按空处理：那个框此刻带着 hidden，
  // 拿一个用户看不见的串去筛列表是纯粹的幽灵行为
  const queries = bySide<string>(side => (searchable ? context.get(transferQueryKey(side)) : ''))

  // 两侧集合全部由纯函数推导，一行 DOM 都不读：
  // Vue 在 render 期求值 connect，那一刻 DOM 还不存在
  const visible = bySide(side => transferVisibleItems(items, value, side, queries[side], filter))
  const operable = bySide(side => transferOperableValues(visible[side]))
  const checked = bySide(side => transferCheckedValues(operable[side], selected))
  const checkStates = bySide<TransferCheckState>(side => transferCheckState(operable[side], selected))

  // 结构上这一侧接不接受勾选（oneWay），与整体禁用分开记：
  // 前者决定 item-checkbox 在不在场，后者只是此刻改不动
  const selectable = bySide(side => transferIsCheckable(side, oneWay))
  const editable = bySide(side => !disabled && selectable[side])

  const visibleSet = bySide(side => new Set(visible[side].map(item => item.value)))

  /**
   * 焦点锚点投影成"这一侧当下看得见的"：条目被搬到对面、或被搜索藏起来之后，
   * 节点仍在 DOM 里但已 hidden、不可聚焦。让它继续认领 tabindex=0，
   * 而列表容器又判自己"焦点在组内"让了位，这一侧就一个 Tab 停靠点都没有了。
   */
  const focusedValue = bySide<string | null>((side) => {
    const raw = context.get(transferFocusKey(side))
    return raw != null && visibleSet[side].has(raw) ? raw : null
  })

  /**
   * roving tabindex 的唯一锚点：焦点在这一侧就跟焦点走，
   * 否则落在该侧首个勾中的可见条目上，都没有就交给容器兜底。
   */
  const anchor = bySide<string | null>(side =>
    focusedValue[side] ?? visible[side].find(item => selected.includes(item.value))?.value ?? null)

  const isChecked = (v: string): boolean => selected.includes(v)
  const sideOf = (v: string): TransferSide => transferSideOf(value, v)
  // 整体禁用向下传导到每个条目；条目也能在 items 里单独禁用
  const isItemLocked = (v: string): boolean => disabled || !!index.get(v)?.disabled

  /** 往 to 侧搬此刻可不可行：对面有勾中的可操作条目，且这条路没被 oneWay 封死。 */
  const canMove = (to: TransferSide): boolean => {
    if (disabled)
      return false
    if (to === 'source' && oneWay)
      return false
    return checked[transferOppositeSide(to)].length > 0
  }

  /** 条目一系（item / item-text / item-checkbox）共用同一份状态标记，样式层各处一致。 */
  const itemState = (item: TransferItemProps): Record<string, string | undefined> => {
    // 同一个 value 在两侧各有一个节点，只有它真正归属的那个才算数
    const belongs = sideOf(item.value) === item.side
    const shown = belongs && visibleSet[item.side].has(item.value)
    return {
      'data-side': item.side,
      'data-state': shown && isChecked(item.value) ? 'checked' : 'unchecked',
      'data-disabled': dataAttr(isItemLocked(item.value)),
      // 焦点所在与勾选互相独立：可以停在一个没勾中的条目上
      'data-highlighted': dataAttr(shown && focusedValue[item.side] === item.value),
    }
  }

  /** 这个条目节点此刻该不该显形。两侧各挂一份全集，不属于本侧的那一份一律隐去。 */
  const isShown = (item: TransferItemProps): boolean =>
    sideOf(item.value) === item.side && visibleSet[item.side].has(item.value)

  // ── 以下都在事件那一刻读活 DOM。渲染期不得调用 ──

  const rootOf = (el: HTMLElement): HTMLElement | null => el.closest<HTMLElement>(parts.root.selector)

  /** 某一侧的列表容器。搬完之后要把焦点送过去，只能就地从触发节点往上找回根再往下取。 */
  const listElOf = (from: HTMLElement, side: TransferSide): HTMLElement | null => {
    const panel = rootOf(from)?.querySelector<HTMLElement>(parts[`${side}-panel`].selector)
    return panel?.querySelector<HTMLElement>(parts.list.selector) ?? null
  }

  /**
   * 某一侧看得见的条目元素，按**推导序**（= items 原序）排列。
   *
   * 顺序刻意不取文档序：被搬到对面、被搜索筛掉的条目仍留在文档里
   * （内容常挂 + hidden，不卸载作者节点），按文档序走方向键会一头扎进看不见的条目。
   */
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

  /** 方向键落点：起点用锚点，终点在该侧可见序上算，禁用条目自动跳过。 */
  const focusBy = (list: HTMLElement, side: TransferSide, intent: NavIntent): string | null =>
    focusValue(side, navigateItems(visibleEls(list, side), anchor[side], intent, { loop }))

  /** 确认键：认焦点当下所在的条目，禁用的、以及被搜索藏起来的都不认。 */
  const commit = (side: TransferSide): void => {
    const focused = focusedValue[side]
    if (focused == null || !editable[side] || !operable[side].includes(focused))
      return
    send({ type: 'ITEM.TOGGLE', value: focused })
  }

  /**
   * 搬运并安排焦点去处。
   *
   * 判据是**这个节点当下正持有焦点**（或焦点就在它内部），不是"值对得上"：
   * 触发按钮搬完就会因为没勾选可搬而变成原生禁用，禁用元素不可聚焦，
   * 浏览器会把焦点丢回 body——键盘用户当场失去落点，再按 Tab 得从页首重来。
   * 列表内按方向键搬也是同一回事：持有焦点的那个条目随即隐去。
   *
   * 去处取**目的地那一侧的列表容器**：它恒在场、恒可聚焦，且正好指向"东西搬到哪儿去了"。
   * 容器自己的 onFocus 随后会把焦点转投给该侧的锚点条目（那一侧空着时就留在容器上）。
   *
   * 焦点必须**先**安置、再搬：反过来的话，落点取决于宿主什么时候把这一帧提交到 DOM
   * （Vue 排微任务、WC 等 updateComplete、纯逻辑宿主同步重渲），三种宿主会落到不同节点上。
   * 先动焦点，落点就只由"搬之前的那份 DOM"决定，与提交时机无关。
   */
  const moveTo = (from: HTMLElement, to: TransferSide): void => {
    const active = scope.getActiveElement()
    const holds = !!active && (active === from || from.contains(active))
    if (holds)
      listElOf(from, to)?.focus()
    send({ type: 'ITEMS.MOVE', to })
  }

  return {
    items,
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
      // 只在作者显式给了 dir 时才写：默认写 ltr 会把外层文档的 rtl 语境整个盖掉
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

    /**
     * 计数只出数字、不出文字：文案是作者的事（语言、单复数、"项/条"都由他定）。
     * 皮肤层在节点为空时用 ::after 把这两个数补出来，作者写了内容就用作者的。
     */
    getPanelCountProps: panel => normalize.element({
      ...parts['panel-count'].attrs,
      'data-side': panel.side,
      'data-count': String(visible[panel.side].length),
      'data-checked-count': String(checked[panel.side].length),
    }),

    getSearchProps: panel => normalize.input({
      ...parts.search.attrs,
      'type': 'text',
      // 关掉浏览器自带的历史补全：这里筛的是本地列表，两套补全会互相盖住
      'autocomplete': 'off',
      'autocapitalize': 'none',
      'value': queries[panel.side],
      // 单体控件用原生 disabled（与集合条目的 aria-disabled 相反）
      'disabled': disabled || undefined,
      'aria-controls': listId[panel.side],
      // 搜索框自己没有可见文字标签，借本侧标题当名字：读屏会念成"待选，编辑框"
      'aria-labelledby': titleId[panel.side],
      'data-side': panel.side,
      // 关掉搜索时节点常挂、只隐去，不卸载作者写的东西
      'hidden': !searchable || undefined,
      'onInput': (event: Event) => {
        if (disabled)
          return
        send({ type: 'SEARCH.SET', side: panel.side, query: (event.target as HTMLInputElement).value })
      },
    }),

    // 键盘全在 list 上收口：条目只管声明自己，一次冒泡一个处理器
    getListProps: panel => normalize.element({
      ...parts.list.attrs,
      'id': listId[panel.side],
      'role': 'listbox',
      'aria-labelledby': titleId[panel.side],
      // 复选与否必须显式说：省略只是「没说」。oneWay 下的 target 侧真的选不了，
      // 此时报 true 是在骗读屏
      'aria-multiselectable': selectable[panel.side] ? 'true' : 'false',
      'aria-disabled': disabled ? 'true' : 'false',
      // 焦点在本侧之外时容器兜底进 Tab 序列，由 onFocus 转投给条目。
      // 判据用 focusedValue 而非锚点：锚点可能指向一个已搬走、已被搜索藏起来的值，
      // 那时没有任何条目认领 tabindex=0，容器再一让位，这一侧对键盘用户永久不可达
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
        // Ctrl/Cmd + Space：只切换焦点条目，与裸空格同义（保留组合是为了和列表类控件的手感一致）
        if (command && key === ' ') {
          if (!editable[side])
            return
          event.preventDefault()
          commit(side)
          return
        }

        // 横向方向键 = 把本侧勾中的条目搬向对面。列表是竖排的，左右键本来无事可做，
        // 拿来当列表内的搬运入口，键盘用户不必先 Tab 到中间的按钮再回来。
        // rtl 下"往对面"的方向整体对调——这正是 dir 在本组件里的用处
        if (!command && !event.altKey && (key === 'ArrowRight' || key === 'ArrowLeft')) {
          const toTarget = (key === 'ArrowRight') !== (dir === 'rtl')
          const to: TransferSide = toTarget ? 'target' : 'source'
          // 本侧就是目的地（在左栏按"往左"）：无事可做，这个键就不归组件管，放行给页面
          if (to === side || !canMove(to))
            return
          event.preventDefault()
          moveTo(list, to)
          return
        }

        // 竖轴导航。带 Ctrl/Cmd/Alt 的组合一律不归导航管；Shift 例外——
        // 它是「移动焦点并顺手切换落点」的扩选写法，所以这里按键名判，
        // 不走 navIntentFromKey 的事件重载（那个对任何修饰键都返回 null）
        const intent = command || event.altKey ? null : navIntentFromKey(key, { axis: 'vertical' })
        if (intent) {
          event.preventDefault()
          const next = focusBy(list, side, intent)
          // 扩选只认前后一步：Shift+Home/End 那种「一直选到端点」是另一回事
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
        'aria-checked': state === 'all' ? 'true' : state === 'some' ? 'mixed' : 'false',
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
