import type { NavIntent, NormalizeProps, PropTypes, Service } from '@xihan-ui/core'
import type { CommandApi, CommandGroupMeta, CommandItemProps, CommandNodeMeta, CommandSchema } from './command.types'
import { contains, dataAttr, isComposingEvent, ITEM_VALUE_ATTR, itemValue, queryItems } from '@xihan-ui/core'
import { commandAnatomy, commandItemQuery, commandItemText } from './command.anatomy'
import { flattenCommandGroups, navigateCommandResults, resolveCommandGroups } from './command.filter'
import { hiddenCommandValues } from './command.visibility'

const parts = commandAnatomy.build()

// 指针亲手点亮过的条目：pointerleave 只收自己点的漆，键盘/打字建立的锚点被指针路过不受影响
const pointerHot = new WeakSet<Element>()

export function connectCommand<T extends PropTypes>(
  service: Service<CommandSchema>,
  normalize: NormalizeProps<T>,
): CommandApi<T> {
  const { state, prop, send, context, refs, scope } = service
  const open = state.get() === 'open'
  const ids = scope.ids('command', 'trigger', 'content', 'input', 'list')

  const inputValue = context.get('inputValue')
  const loading = !!prop('loading')
  const loop = prop('loop') ?? true
  const modal = prop('modal') ?? true
  const stateAttr = open ? 'open' : 'closed'
  const translations = prop('translations')

  // 清单是过滤与导航的事实源。没给清单时整套过滤让开：条目一个不收，空态也不判——
  // 那种用法下作者自己决定渲染什么，库这一层没有可依据的数据
  const hasCollection = prop('collection') != null

  // 过滤与归组在这里一次算完：清单是数据，条目部件只报 value
  const groups: readonly CommandGroupMeta[] = resolveCommandGroups(
    prop('collection') ?? [],
    prop('groups') ?? [],
    inputValue,
    { filter: prop('filter') ?? true, caseSensitive: !!prop('caseSensitive') },
  )
  const results: readonly CommandNodeMeta[] = flattenCommandGroups(groups)
  const metaOf = new Map(results.map(meta => [meta.value, meta]))

  const visibleGroups = new Set(groups.map(group => group.value))

  // 锚点所指的命令被筛掉时当场作废：留着会让 aria-activedescendant 指向一个不存在的 id
  const raw = context.get('highlightedValue')
  const hiddenValues = new Set(context.get('hiddenValues'))
  const highlighted = raw != null && metaOf.has(raw) && !hiddenValues.has(raw) ? raw : null
  // 没有结果或所有结果都明确隐藏时显示作者空态；未挂载候选不在隐藏镜像中。
  const empty = open && hasCollection && results.every(item => hiddenValues.has(item.value))

  /** 这条命令此刻在不在结果里。收起而不是不渲染：两个适配器因此产出同一棵 DOM。 */
  const itemHidden = (value: string): boolean => hasCollection && !metaOf.has(value)

  /** 条目 id。aria-activedescendant 只认单个 IDREF，值里带空格会把它劈成两截，所以先编码再拼。 */
  const itemId = (value: string): string => scope.partId(commandAnatomy.name, `item:${encodeURIComponent(value)}`)
  const groupLabelId = (group: string): string => scope.partId(commandAnatomy.name, `group-label:${group}`)

  /** 条目禁用：部件上写的优先，没写就回清单里查。 */
  const itemDisabled = (item: CommandItemProps): boolean =>
    item.disabled ?? metaOf.get(item.value)?.disabled ?? false

  // item 与 item-text 共用同一份状态标记，样式层各处一致
  const itemStateAttrs = (item: CommandItemProps): Record<string, string | undefined> => ({
    'data-disabled': dataAttr(itemDisabled(item)),
    'data-highlighted': dataAttr(highlighted === item.value),
  })

  /** 把某条命令滚进可视区。焦点不动，长清单里锚点才不会跑出视野。 */
  const scrollIntoView = (value: string): void => {
    const el = queryItems(refs.get('getListEl')(), commandItemQuery).find(item => itemValue(item) === value)
    el?.scrollIntoView?.({ block: 'nearest', inline: 'nearest' })
  }

  /** collection 保留未挂载候选；事件发生时仅排除已有 DOM 明确隐藏的条目。 */
  const renderedHidden = (): Set<string> => hiddenCommandValues(refs.get('getListEl')())

  /** 方向键仍按数据顺序选取，跳过禁用与作者明确隐藏的候选。 */
  const highlightBy = (intent: NavIntent): void => {
    const hidden = renderedHidden()
    const next = navigateCommandResults(results.filter(item => !hidden.has(item.value)), highlighted, intent, loop)
    if (!next)
      return
    send({ type: 'ITEM.HIGHLIGHT', value: next.value })
    scrollIntoView(next.value)
  }

  /** 确认键：认锚点所在的那条命令，禁用的不认。 */
  const commitHighlighted = (): void => {
    const meta = highlighted == null ? undefined : metaOf.get(highlighted)
    if (!meta || meta.disabled || renderedHidden().has(meta.value))
      return
    send({ type: 'ITEM.SELECT', value: meta.value, label: meta.label })
  }

  return {
    open,
    inputValue,
    groups,
    results,
    highlightedValue: highlighted,
    empty,
    loading,
    setOpen: (next) => {
      if (next !== open)
        send({ type: next ? 'OPEN' : 'CLOSE' })
    },
    setInputValue: next => send({ type: 'INPUT.SET', value: next }),
    select: (value) => {
      const meta = metaOf.get(value)
      if (meta?.disabled || renderedHidden().has(value))
        return
      send({ type: 'ITEM.SELECT', value, label: meta?.label ?? value })
    },

    getTriggerProps: () => normalize.button({
      ...parts.trigger.attrs,
      'id': ids.trigger,
      'type': 'button',
      'aria-haspopup': 'dialog',
      'aria-expanded': open ? 'true' : 'false',
      'aria-controls': ids.content,
      'data-state': stateAttr,
      'onClick': () => send({ type: 'TOGGLE' }),
    }),

    getBackdropProps: () => normalize.element({
      ...parts.backdrop.attrs,
      'data-state': stateAttr,
      // 形态轴落在 backdrop 上：三档换的都是这一层自己的底色与模糊
      'data-variant': prop('variant'),
      // 非模态不激活遮罩；Vue/React 据此不创建节点，WC 隐藏作者节点。
      'hidden': !modal || undefined,
    }),

    getPositionerProps: () => normalize.element({
      ...parts.positioner.attrs,
      // 定位层被搬到 portal 落点，继承不到作者子树上的方向；作者没给就不写，交给落点处的继承
      'dir': prop('dir'),
      // 尺寸轴在浮层这一侧打：positioner 被搬到落点，继承不到作者子树上的私有槽
      'data-size': prop('size'),
      'data-state': stateAttr,
      // 由皮肤的 inset 直接摆，不问引擎要坐标，没有「还没量完」的窗口：恒已落位
      'data-positioned': '',
    }),

    getContentProps: () => normalize.element({
      ...parts.content.attrs,
      'id': ids.content,
      'role': 'dialog',
      'tabindex': -1,
      // 显式写 false 而非省略：读屏对未声明与声明为非模态处理不同
      'aria-modal': modal ? 'true' : 'false',
      // 面板里没有标题栏，名字只能从文案表给
      'aria-label': translations?.title ?? 'Command palette',
      'data-state': stateAttr,
      // 尺寸轴落在 content 上：解剖里没有 root，positioner 非必需，且 content 会被 portal 走
      'data-size': prop('size'),
      // 收起态自带 hidden：positioner 非必需部件，最小结构下没有别的节点兜底
      'hidden': !open || undefined,
    }),

    getInputProps: () => normalize.input({
      ...parts.input.attrs,
      'id': ids.input,
      'type': 'text',
      // 焦点自始至终在这里：锚点改由 aria-activedescendant 报给读屏
      'role': 'combobox',
      // 关掉浏览器自带的历史补全，它会盖在结果列表上
      'autocomplete': 'off',
      'autocapitalize': 'none',
      'spellcheck': false,
      'placeholder': prop('placeholder'),
      'value': inputValue,
      'aria-label': translations?.input ?? 'Search commands',
      'aria-haspopup': 'listbox',
      // 列表恒在面板里，不另开合
      'aria-expanded': 'true',
      'aria-controls': ids.list,
      'aria-autocomplete': 'list',
      // 没有锚点可指时属性整个缺席（aria-activedescendant 没有「假值」写法）
      'aria-activedescendant': highlighted != null ? itemId(highlighted) : undefined,
      'data-state': stateAttr,
      'onInput': (event: Event) => {
        send({ type: 'INPUT.CHANGE', value: (event.target as HTMLInputElement).value })
      },
      'onKeyDown': (event: KeyboardEvent) => {
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
        if (key === 'Home' || key === 'End') {
          event.preventDefault()
          highlightBy(key === 'Home' ? 'first' : 'last')
          return
        }
        if (key === 'Enter') {
          event.preventDefault()
          // 按住不放会连发 keydown，选中是一次性动作，重复执行会连开好几条命令
          if (event.repeat)
            return
          commitHighlighted()
        }
        // Escape 由消解层收口，这里不拦：拦了浏览器把输入框回滚成默认值的行为反而要另写
      },
    }),

    getListProps: () => normalize.element({
      ...parts.list.attrs,
      'id': ids.list,
      'role': 'listbox',
      // 列表落焦要有名字：面板里没有可引的标题节点，只能从文案表给
      'aria-label': translations?.list ?? 'Commands',
      // 取数在途的播报归列表本体：两个相位占位自己不带这一位
      'aria-busy': loading ? 'true' : undefined,
      // tabindex 写 -1 不能省：可滚动容器会被某些浏览器自动塞进 Tab 序列
      'tabindex': -1,
      'data-state': stateAttr,
    }),

    getGroupProps: group => normalize.element({
      ...parts.group.attrs,
      'role': 'group',
      // 分组标题不是命令，只能靠 aria-labelledby 挂上来
      'aria-labelledby': groupLabelId(group.value),
      // 一条都没剩下的分组整组收起，列表里不留一道只有标题的白
      'hidden': (hasCollection && !visibleGroups.has(group.value)) || undefined,
    }),

    getGroupLabelProps: group => normalize.element({
      ...parts['group-label'].attrs,
      id: groupLabelId(group.value),
    }),

    getItemProps: item => normalize.element({
      ...parts.item.attrs,
      ...itemStateAttrs(item),
      // 导航与选中都以此为条目身份
      [ITEM_VALUE_ATTR]: item.value,
      // aria-activedescendant 要指得到它，所以每条命令都得有个稳定 id
      'id': itemId(item.value),
      'role': 'option',
      // 命令没有持久选值；这里是 APG combobox 的 selection-follows-focus：
      // aria-activedescendant 指到哪一条，哪一条就向读屏报 selected，其余显式为 false。
      'aria-selected': highlighted === item.value ? 'true' : 'false',
      // 集合条目一律 aria-disabled，原生 disabled 不派发 click，点击就走不到守卫里
      'aria-disabled': itemDisabled(item) ? 'true' : 'false',
      // 不给 tabindex：焦点恒在检索框
      'hidden': itemHidden(item.value) || undefined,
      'onClick': (event: MouseEvent) => {
        if (itemDisabled(item) || renderedHidden().has(item.value))
          return
        send({ type: 'ITEM.SELECT', value: item.value, label: commandItemText(event.currentTarget as HTMLElement) })
      },
      // 指针划过即挪锚点：不同步的话，鼠标停在 A 上、回车却执行了键盘锚点所在的 B
      'onPointerMove': (event: PointerEvent) => {
        if (!itemDisabled(item) && !renderedHidden().has(item.value) && highlighted !== item.value) {
          pointerHot.add(event.currentTarget as Element)
          send({ type: 'ITEM.HIGHLIGHT', value: item.value })
        }
      },
      // 指针离开整张列表才收锚点，条目之间的缝不算：那时 relatedTarget 是 list 本身。
      // 触摸 tap 序列里的 leave 不作数；打字建立的锚点被指针路过不受影响
      'onPointerLeave': (event: PointerEvent) => {
        const el = event.currentTarget as HTMLElement
        if (event.pointerType === 'touch' || !pointerHot.delete(el))
          return
        if (highlighted !== item.value)
          return
        if (contains(el.closest<HTMLElement>(parts.list.selector), event.relatedTarget as Node | null))
          return
        send({ type: 'HIGHLIGHT.CLEAR' })
      },
    }),

    getItemTextProps: item => normalize.element({
      ...parts['item-text'].attrs,
      ...itemStateAttrs(item),
    }),

    getEmptyProps: () => normalize.element({
      ...parts.empty.attrs,
      // 空态节点必须待在 role=listbox 之外（列表里只允许 option 与 group），放 content 里当 list 的兄弟；
      // role=status 自带 polite 活区
      'role': 'status',
      'data-state': stateAttr,
      // 取数在途时让位给在途占位，两者不同屏
      'hidden': !empty || loading || undefined,
    }),

    getLoadingProps: () => normalize.element({
      ...parts.loading.attrs,
      'role': 'status',
      'data-state': stateAttr,
      'hidden': !(open && loading) || undefined,
    }),

    getFooterProps: () => normalize.element({
      ...parts.footer.attrs,
      'data-state': stateAttr,
    }),
  }
}
