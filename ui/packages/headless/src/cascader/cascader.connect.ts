import type { NavIntent } from '@xihan-ui/behavior'
import type { NormalizeProps, PropTypes } from '@xihan-ui/core'
import type { Service } from '@xihan-ui/machine'
import type { CascaderApi, CascaderNodeMeta, CascaderSchema } from './cascader.types'
import { focusItem, ITEM_VALUE_ATTR, navIntentFromKey } from '@xihan-ui/behavior'
import { contains, dataAttr } from '@xihan-ui/core'
import { cascaderAnatomy } from './cascader.anatomy'
import {
  cascaderBuildColumns,
  cascaderBuildLevels,
  cascaderIndexNodes,
  cascaderPathKey,
  cascaderPathText,
  cascaderSamePath,
  cascaderStepColumn,
} from './cascader.columns'
import { CASCADER_DEFAULT_PLACEMENT, CASCADER_DEFAULT_SEPARATOR, findCascaderItemEl } from './cascader.machine'

const parts = cascaderAnatomy.build()

export function connectCascader<T extends PropTypes>(
  service: Service<CascaderSchema>,
  normalize: NormalizeProps<T>,
): CascaderApi<T> {
  const { state, prop, send, context, refs, scope } = service
  const open = state.get() === 'open'
  const ids = scope.ids('cascader', 'label', 'trigger', 'value-text', 'content')

  const collection = prop('collection') ?? []
  const activePath = context.get('activePath')
  const value = context.get('value')
  const multiple = !!prop('multiple')
  const disabled = !!prop('disabled')
  const readOnly = !!prop('readOnly')
  const invalid = !!prop('invalid')
  // 只读与禁用都改不了选中值；两者的区别在于禁用连浮层都展不开
  const interactive = !disabled && !readOnly
  // 一列就是一个列表框，走到尽头回绕是列表的常态
  const loop = prop('loop') ?? true
  const dir = prop('dir') ?? 'ltr'
  const expandTrigger = prop('expandTrigger') ?? 'click'
  const separator = prop('separator') ?? CASCADER_DEFAULT_SEPARATOR
  const placeholder = prop('placeholder') ?? null
  const stateAttr = open ? 'open' : 'closed'
  // 位置由引擎写进 context；这里只读结果，不量 DOM、不调引擎，保持纯函数
  const position = context.get('position')
  const placement = position?.placement ?? prop('placement') ?? CASCADER_DEFAULT_PLACEMENT

  // 三份投影都是 (collection, activePath) 的纯函数，一行 DOM 都不碰：
  // Vue 在 render 期求值 connect，那一刻 DOM 还不存在。
  // columns 是「当下并排开着哪几列」，levels 是作者写标记用的静态层，
  // index 覆盖全树——条目常挂不卸载，收起的列里那些条目照样得产出属性。
  const columns = cascaderBuildColumns(collection, activePath)
  const levels = cascaderBuildLevels(collection)
  const index = cascaderIndexNodes(collection)

  // 当下露面的条目：按值取本轮的元信息。不在其中 = 它这一轮该被 hidden 收起
  const shown = new Map<string, CascaderNodeMeta>()
  for (const column of columns) {
    for (const item of column.items) shown.set(item.value, item)
  }

  const metaOf = (v: string): CascaderNodeMeta | undefined => shown.get(v) ?? index.get(v)
  const isVisible = (v: string): boolean => shown.has(v)

  // 焦点锚点投影成「当下露得出面的」：列被砍掉后条目仍在 DOM 里但已 hidden、不可聚焦。
  // 让它继续认领 tabindex=0，而 content 又判自己「焦点在浮层内」让了位，整个浮层就一个停靠点都没有。
  const rawFocused = context.get('focusedPath')
  const focusedMeta = rawFocused?.length
    ? (() => {
        const hit = shown.get(rawFocused[rawFocused.length - 1]!)
        // 连 path 一起比：value 万一在两条分支里写重了，只比末段会认错条目
        return hit && cascaderSamePath(hit.path, rawFocused) ? hit : undefined
      })()
    : undefined
  const focusedPath = focusedMeta ? [...focusedMeta.path] : null

  const selectedKeys = new Set(value.map(cascaderPathKey))
  // 整个控件禁用向下传导到每个条目；条目也能在 collection 里单独禁用
  const isDisabled = (meta: CascaderNodeMeta): boolean => disabled || meta.disabled
  const isSelected = (v: string): boolean => {
    const meta = metaOf(v)
    return !!meta && selectedKeys.has(cascaderPathKey(meta.path))
  }
  // 落在展开路径上 = 它的子列开着，或它自己就是最后一站
  const isActive = (v: string): boolean => {
    const meta = metaOf(v)
    return !!meta && activePath[meta.level] === v && isVisible(v)
  }

  // 显示文字直接从 collection 的 label 取，不必去活 DOM 里现查条目文本：
  // 树数据本来就带着标签，连没展开过的那几层也报得出名字
  const valueText = value.length
    ? value.map(path => cascaderPathText(collection, path, separator)).join(', ')
    : null
  const displayText = valueText ?? placeholder ?? ''
  const canClear = interactive && value.length > 0
  const valuePath = value.length ? [...value[0]!] : null

  /**
   * 条目 id：aria-labelledby 只认单个 IDREF，值里带空格会把它劈成两截，所以先编码再拼。
   * 编码是单射的，两个不同的值不会撞到同一个 id。
   */
  const itemId = (v: string): string => scope.partId(cascaderAnatomy.name, `item:${encodeURIComponent(v)}`)

  /**
   * 把焦点交给某个条目。落点由 collection 算出（顺序与禁用的唯一事实源），
   * 元素则在事件那一刻按值现查活 DOM——两个适配器此时看到的是同一份文档。
   * 展开路径随焦点一并落到这条路径上（机器里的 setFocusedPath 收口）。
   */
  const focusMeta = (meta: CascaderNodeMeta | null | undefined): void => {
    if (!meta)
      return
    focusItem(findCascaderItemEl(refs.get('getContentEl')(), meta.value))
    send({ type: 'ITEM.FOCUS', level: meta.level, value: meta.value })
  }

  /** 列内方向键落点：起点用锚点，禁用条目自动跳过。无锚点时从最后一列的边界进。 */
  const focusBy = (intent: NavIntent): void => {
    const column = columns[focusedMeta?.level ?? columns.length - 1]
    if (!column)
      return
    focusMeta(cascaderStepColumn(column.items, focusedMeta?.value ?? null, intent, { loop }))
  }

  /**
   * 确认键与点条目的落点。分支是否落值由 changeOnSelect 说了算（机器里的 selectPath 收口），
   * 这里一律把两件事都发出去：先认领焦点与展开，再报选中意图。
   * 点分支因此是「展开它的子列，焦点留在它自己身上」——与右方向键「进子列」是两回事。
   */
  const activate = (meta: CascaderNodeMeta): void => {
    if (!interactive || isDisabled(meta))
      return
    send({ type: 'ITEM.FOCUS', level: meta.level, value: meta.value })
    send({ type: 'ITEM.SELECT', path: [...meta.path] })
  }

  /** 条目一系（item / item-text / item-indicator）共用的状态标记，样式层各处一致。 */
  const itemState = (v: string): Record<string, string | undefined> => {
    const meta = metaOf(v)
    return {
      'data-selected': dataAttr(isSelected(v)),
      'data-disabled': dataAttr(!!meta && isDisabled(meta)),
      // 焦点所在与选中互相独立：可以停在一个没被选中的条目上
      'data-highlighted': dataAttr(!!focusedMeta && focusedMeta.value === v),
      // 展开路径上的那一串：样式据此把「走过的这一条线」整体点亮
      'data-active': dataAttr(isActive(v)),
    }
  }

  return {
    open,
    collection,
    columns,
    levels,
    value,
    valuePath,
    valueText,
    displayText,
    activePath,
    focusedPath,
    multiple,
    disabled,
    readOnly,
    invalid,
    canClear,
    isSelected,
    isActive,
    isVisible,
    setOpen: (next) => {
      if (next !== open)
        send(next ? { type: 'OPEN', focus: 'selected' } : { type: 'CLOSE' })
    },
    setValue: next => send({ type: 'VALUE.SET', value: next }),
    setActivePath: next => send({ type: 'PATH.SET', path: next }),
    select: path => send({ type: 'ITEM.SELECT', path }),
    clear: () => send({ type: 'VALUE.CLEAR' }),

    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      'data-state': stateAttr,
      'data-disabled': dataAttr(disabled),
      'data-readonly': dataAttr(readOnly),
      'data-invalid': dataAttr(invalid),
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
      // trigger 是单体控件（与集合条目相反）：用原生 disabled，不可聚焦也不派 click，
      // 禁用的选择器本就不该有任何键盘入口。只读则相反——仍可聚焦、仍能展开来看
      'disabled': disabled || undefined,
      // 按钮扮演 combobox：展开的是若干并排的列表框，读屏据此播报「折叠的列表框」而不是「按钮」
      'role': 'combobox',
      'aria-haspopup': 'listbox',
      'aria-expanded': open ? 'true' : 'false',
      // 指向浮层壳而不是某一列：列是随展开路径增减的，指着其中一列会时不时悬空
      'aria-controls': ids.content,
      // 名字 = 标签 + 当前值。只指 label 的话读屏永远念不出用户选了什么——
      // accname 里 aria-labelledby 的优先级高于元素内容，会把内嵌的 value-text 挤掉。
      // 作者没写 label 时那一段是悬空 IDREF，按 accname 规则跳过，名字回落成当前值
      'aria-labelledby': `${ids.label} ${ids['value-text']}`,
      'aria-invalid': invalid ? 'true' : 'false',
      'aria-readonly': readOnly ? 'true' : 'false',
      'data-state': stateAttr,
      'data-disabled': dataAttr(disabled),
      'data-readonly': dataAttr(readOnly),
      'data-invalid': dataAttr(invalid),
      'data-placeholder': dataAttr(value.length === 0),
      // 只读仍开得了浮层：列能浏览、能一路展开，改不动的只是选中值。
      // 禁用那一路根本走不到这里（原生 disabled 既不可聚焦也不派 click），守卫留着是防程序化派发
      'onClick': () => {
        if (!disabled)
          send({ type: 'TOGGLE', focus: 'selected' })
      },
      'onKeydown': (event: KeyboardEvent) => {
        if (disabled)
          return
        // 纵向轴 + 不收 Home/End：收起态的上下键既展开又把焦点落到选中条目的相邻条目；
        // 返回 null（左右键、带修饰键的组合）不归导航管，此时绝不 preventDefault
        const intent = navIntentFromKey(event, { axis: 'vertical', home: false })
        if (intent) {
          event.preventDefault()
          send({ type: 'OPEN', focus: intent })
          return
        }
        // Enter 与空格都必须吞掉：按钮的默认激活会再合成一次 click，
        // 展开随即被那次 TOGGLE 关掉，看起来就是「按了没反应」
        if (event.key === 'Enter' || event.key === ' ') {
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

    getClearTriggerProps: () => normalize.button({
      ...parts['clear-trigger'].attrs,
      'type': 'button',
      // 整个控件只占一个 Tab 位（就是 trigger）：键盘用户走不到这个按钮，
      // 暴露给读屏等于把「可以清空」报两遍，还会在 Tab 序里多出一站
      'tabindex': -1,
      'aria-hidden': true,
      'disabled': !canClear || undefined,
      'data-disabled': dataAttr(!canClear),
      // 不拦的话浏览器会把焦点从 trigger 挪到这个按钮上，清完焦点就落在一个隐身节点里
      'onPointerDown': (event: PointerEvent) => {
        if (event.button === 0)
          event.preventDefault()
      },
      'onClick': () => {
        if (!canClear)
          return
        send({ type: 'VALUE.CLEAR' })
        // pointerdown 已拦掉默认聚焦，键盘/程序化激活这一路则要主动把焦点送回 trigger
        refs.get('getAnchorEl')()?.focus()
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

    // 键盘全在 content 上收口：条目只管声明自己，一次冒泡一个处理器。
    // 收口点选 content 而不是某一列，是因为左右键要跨列走——处理器挂在列上的话，
    // 焦点刚进新的一列，那一列的处理器还没轮到接管这次按键。
    // Escape 不在这里收——它归消解层管（只有栈顶层响应，嵌套浮层才能逐层关闭）
    getContentProps: () => normalize.element({
      ...parts.content.attrs,
      'id': ids.content,
      // 浮层壳自身没有集合语义（列表框语义在每一列上），只是焦点域与消解层的根节点。
      // 有锚点时 Tab 位归锚点条目；展开着却没有锚点（数据是空的、或条目刚被删光）时
      // 由容器兜底，否则整个浮层一个停靠点都没有、焦点域也无处可落。
      // 判据用 focusedPath 而非「锚点元素」：锚点可能指向一个已被砍掉的列里的条目
      'tabindex': open && focusedPath == null ? 0 : -1,
      'data-state': stateAttr,
      'data-placement': placement,
      // 收起时留在 DOM 只隐藏，不卸载作者节点
      'hidden': !open || undefined,
      'onKeyDown': (event: KeyboardEvent) => {
        // 收起态浮层是 hidden 的，按键不该改任何东西（程序化派发照样送得到）
        if (!open || disabled)
          return
        const key = event.key
        // 带 Ctrl/Cmd/Alt 的组合一律不归浮层管（Ctrl+Home 之类归浏览器与读屏）
        if (event.ctrlKey || event.metaKey || event.altKey)
          return

        // 不 preventDefault：浮层让开，焦点按 Tab 序列自然离开
        if (key === 'Tab') {
          send({ type: 'CLOSE', src: 'tab' })
          return
        }

        // 上下键与 Home/End 只在当前这一列里走。轴固定 vertical：左右键在级联里另有
        // 「进子列 / 回上一列」的语义，不能被当成同轴导航吃掉
        const intent = navIntentFromKey(event, { axis: 'vertical' })
        if (intent) {
          event.preventDefault()
          focusBy(intent)
          return
        }

        // rtl 下左右键整体对调：进子列永远是「往右边那一列去」的那个方向
        const forward = dir === 'rtl' ? 'ArrowLeft' : 'ArrowRight'
        const backward = dir === 'rtl' ? 'ArrowRight' : 'ArrowLeft'

        if (key === forward) {
          // 叶子右边没有列，这个键也就不归浮层管，放行给页面
          if (!focusedMeta?.branch)
            return
          // 展开路径被指针带偏过（悬停只改列不改焦点）：这一下先把它拉回焦点条目，
          // 子列这才是焦点条目自己的。不这么让一步，落点会掉进别人的子列里
          if (!cascaderSamePath(activePath, focusedMeta.path)) {
            event.preventDefault()
            send({ type: 'ITEM.FOCUS', level: focusedMeta.level, value: focusedMeta.value })
            return
          }
          // 子列此刻已经开着：焦点停在它父条目上时展开路径就等于那条路径
          const child = columns[focusedMeta.level + 1]
          const next = child ? cascaderStepColumn(child.items, null, 'first', { loop }) : null
          // 整列都禁用：进不去，这个键也就不该被吞掉
          if (!next)
            return
          event.preventDefault()
          focusMeta(next)
          return
        }

        if (key === backward) {
          // 根列左边没有列可回，什么也不做且不吞键
          if (!focusedMeta || focusedMeta.level === 0)
            return
          const parent = shown.get(focusedMeta.path[focusedMeta.level - 1]!)
          if (!parent)
            return
          event.preventDefault()
          // 焦点退回父条目，展开路径随之退到它——当前这一列于是变成最后一列，
          // 原先焦点所在的那一列被砍掉
          focusMeta(parent)
          return
        }

        if (key === 'Enter' || key === ' ') {
          if (!focusedMeta)
            return
          event.preventDefault()
          activate(focusedMeta)
        }
      },
      'onFocus': (event: FocusEvent) => {
        const content = event.currentTarget as HTMLElement
        // 只接管从浮层外进来的焦点：浮层内 Shift+Tab 往外退时转投会把人困在里面
        if (contains(content, event.relatedTarget as Node | null))
          return
        // 焦点落到容器上说明锚点还没挑出来（数据是空的、或条目刚被删光）：
        // 就地补一次，落到最后一列的首个可停留条目上。落点条目自己的 onFocus 会把锚点接过去
        const column = columns[columns.length - 1]
        if (!column)
          return
        focusItem(findCascaderItemEl(content, cascaderStepColumn(column.items, null, 'first', { loop })?.value ?? null))
      },
    }),

    getColumnProps: (column) => {
      // 子列的名字取展开它的那个条目。根列、已被砍掉的列、以及展开路径被程序化改成了
      // 一条走不通的路径时（那个父条目此刻并不在任何一列里），一律退回组件标题——
      // 指一个不存在的 id 会让读屏拿不到名字，IDREF 也就此悬空
      const above = column.level > 0 ? activePath[column.level - 1] : undefined
      const parent = above != null && isVisible(above) ? above : undefined
      return normalize.element({
        ...parts.column.attrs,
        // 一列就是一个列表框：条目的 role=option 要有个 listbox 容器才成立
        'role': 'listbox',
        'aria-orientation': 'vertical',
        // 复选与否必须显式说：省略只是「没说」，读屏无从区分单选列表与「作者忘了标」
        'aria-multiselectable': multiple ? 'true' : 'false',
        'aria-disabled': disabled ? 'true' : 'false',
        // 读屏据此播报「浙江，列表」而不是三个同名列表；作者没写 label 时那一段是悬空 IDREF，
        // 按 accname 规则跳过
        'aria-labelledby': parent == null ? ids.label : itemId(parent),
        'data-level': String(column.level),
        // 列永远不进 Tab 序列，也不承载焦点。写 -1 而不是整个不给：
        // 它是可滚动容器，某些浏览器会把可滚动区域自动塞进 Tab 序列
        'tabindex': -1,
        'data-state': stateAttr,
        // 展开路径砍短了，右边这些列就该收起来。作者节点常挂，只加 hidden
        'hidden': column.level >= columns.length || undefined,
      })
    },

    getItemProps: (item) => {
      const meta = metaOf(item.value)
      const visible = isVisible(item.value)
      const focused = !!focusedMeta && focusedMeta.value === item.value
      return normalize.element({
        ...parts.item.attrs,
        ...itemState(item.value),
        // 导航与选中都以此为条目身份
        [ITEM_VALUE_ATTR]: item.value,
        // 列的 aria-labelledby 要指得到它，所以每个条目都得有个稳定 id
        'id': itemId(item.value),
        'role': 'option',
        // 所在列取自 collection，不从 DOM 嵌套深度反推：不在 collection 里的条目没有层级可言
        'data-level': meta ? String(meta.level) : undefined,
        // listbox 的选中语义是 aria-selected（不是 aria-checked）；未选中必须显式输出 false，
        // 省略会让读屏无从区分「未选中」与「不是选项」
        'aria-selected': isSelected(item.value) ? 'true' : 'false',
        // 集合条目一律 aria-disabled，绝不输出原生 disabled：原生 disabled 不可聚焦、
        // 也不派发 click，禁用条目就再也当不成方向键的起点
        'aria-disabled': meta && isDisabled(meta) ? 'true' : 'false',
        // 只有分支报展开态：叶子右边没有列，报 aria-expanded 等于说「能展开却没展开」
        'aria-expanded': meta?.branch ? (isActive(item.value) ? 'true' : 'false') : undefined,
        // roving tabindex：整个浮层只有锚点条目留在 Tab 序列内。收起态无锚点——
        // 此时条目连同 content 一起 hidden，本就不可达
        'tabindex': focused ? 0 : -1,
        // 它这一轮不属于任何一列：常挂在 DOM 里，只是收起来不占位
        'hidden': !visible || undefined,
        'onClick': () => {
          // 收起态与被砍掉的列里条目仍在文档中（只是 hidden），程序化的点击照样送得到；
          // 守卫写在这儿，值才真的改不动
          if (!meta || !visible)
            return
          activate(meta)
        },
        // 焦点是事实不是许可：禁用条目被点到也记锚点，方向键才知道从哪儿起步。
        // 展开路径随之落到这条路径上——焦点在哪儿，开着的就是哪一串列
        'onFocus': () => {
          if (visible && meta)
            send({ type: 'ITEM.FOCUS', level: meta.level, value: meta.value })
        },
        // 悬停展开：只改展开路径，不碰焦点——鼠标划过不该把键盘焦点抢走。
        // expandTrigger=click 时这条整个让开，指针只有点下去才改变列
        'onPointerEnter': () => {
          if (!interactive || expandTrigger !== 'hover' || !meta || !visible || isDisabled(meta))
            return
          send({ type: 'ITEM.EXPAND', level: meta.level, value: meta.value })
        },
      })
    },

    getItemTextProps: item => normalize.element({
      ...parts['item-text'].attrs,
      ...itemState(item.value),
    }),

    getItemIndicatorProps: item => normalize.element({
      ...parts['item-indicator'].attrs,
      ...itemState(item.value),
      'aria-hidden': 'true',
    }),
  }
}
