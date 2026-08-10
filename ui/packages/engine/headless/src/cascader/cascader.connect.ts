import type { NavIntent } from '@xihan-ui/behavior'
import type { NormalizeProps, PropTypes } from '@xihan-ui/kernel'
import type { Service } from '@xihan-ui/machine'
import type { CascaderApi, CascaderNodeMeta, CascaderSchema } from './cascader.types'
import { focusItem, ITEM_VALUE_ATTR, navIntentFromKey } from '@xihan-ui/behavior'
import { contains, dataAttr } from '@xihan-ui/kernel'
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
  // 只读与禁用都改不了选中值，区别在于禁用连浮层都展不开
  const interactive = !disabled && !readOnly
  const loop = prop('loop') ?? true
  const dir = prop('dir') ?? 'ltr'
  const expandTrigger = prop('expandTrigger') ?? 'click'
  const separator = prop('separator') ?? CASCADER_DEFAULT_SEPARATOR
  const placeholder = prop('placeholder') ?? null
  const stateAttr = open ? 'open' : 'closed'
  // 位置由引擎写进 context，这里只读结果
  const position = context.get('position')
  const placement = position?.placement ?? prop('placement') ?? CASCADER_DEFAULT_PLACEMENT

  // 三份 (collection, activePath) 的纯投影，不得读 DOM：connect 在 render 期求值，此时 DOM 尚不存在。
  // columns 是当下并排开着的列，levels 是写标记用的
  // 静态层，index 覆盖全树（收起的列里那些条目也要产出属性）
  const columns = cascaderBuildColumns(collection, activePath)
  const levels = cascaderBuildLevels(collection)
  const index = cascaderIndexNodes(collection)

  // 当下露面的条目：按值取本轮的元信息，不在其中即该被 hidden 收起
  const shown = new Map<string, CascaderNodeMeta>()
  for (const column of columns) {
    for (const item of column.items) shown.set(item.value, item)
  }

  const metaOf = (v: string): CascaderNodeMeta | undefined => shown.get(v) ?? index.get(v)
  const isVisible = (v: string): boolean => shown.has(v)

  // 焦点锚点只认当下露得出面的条目：列被砍掉后条目仍在 DOM 里但已 hidden、不可聚焦
  const rawFocused = context.get('focusedPath')
  const focusedMeta = rawFocused?.length
    ? (() => {
        const hit = shown.get(rawFocused[rawFocused.length - 1]!)
        // 连 path 一起比，value 在两条分支里写重时只比末段会认错条目
        return hit && cascaderSamePath(hit.path, rawFocused) ? hit : undefined
      })()
    : undefined
  const focusedPath = focusedMeta ? [...focusedMeta.path] : null

  const selectedKeys = new Set(value.map(cascaderPathKey))
  // 整个控件禁用向下传导到每个条目，条目也能在 collection 里单独禁用
  const isDisabled = (meta: CascaderNodeMeta): boolean => disabled || meta.disabled
  const isSelected = (v: string): boolean => {
    const meta = metaOf(v)
    return !!meta && selectedKeys.has(cascaderPathKey(meta.path))
  }
  // 落在展开路径上：它的子列开着，或它自己就是最后一站
  const isActive = (v: string): boolean => {
    const meta = metaOf(v)
    return !!meta && activePath[meta.level] === v && isVisible(v)
  }

  // 显示文字从 collection 的 label 取，不查活 DOM，没展开过的层也报得出名字
  const valueText = value.length
    ? value.map(path => cascaderPathText(collection, path, separator)).join(', ')
    : null
  const displayText = valueText ?? placeholder ?? ''
  const canClear = interactive && value.length > 0
  const valuePath = value.length ? [...value[0]!] : null

  /** 条目 id。值先编码再拼：aria-labelledby 只认单个 IDREF，值里带空格会把它劈成两截。 */
  const itemId = (v: string): string => scope.partId(cascaderAnatomy.name, `item:${encodeURIComponent(v)}`)

  /**
   * 把焦点交给某个条目。落点由 collection 算出，元素在事件那一刻按值现查活 DOM。
   * 展开路径随焦点一并落到这条路径上。
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
   * 确认键与点条目的落点：先认领焦点与展开，再报选中意图。
   * 分支是否落值由机器按 changeOnSelect 判定。
   */
  const activate = (meta: CascaderNodeMeta): void => {
    if (!interactive || isDisabled(meta))
      return
    send({ type: 'ITEM.FOCUS', level: meta.level, value: meta.value })
    send({ type: 'ITEM.SELECT', path: [...meta.path] })
  }

  /** 条目一系（item / item-text / item-indicator）共用的状态标记。 */
  const itemState = (v: string): Record<string, string | undefined> => {
    const meta = metaOf(v)
    return {
      'data-selected': dataAttr(isSelected(v)),
      'data-disabled': dataAttr(!!meta && isDisabled(meta)),
      // 焦点所在与选中互相独立
      'data-highlighted': dataAttr(!!focusedMeta && focusedMeta.value === v),
      // 落在展开路径上
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
      // 三个视觉轴只落在根上，皮肤由此往下派发；子部件不重复标注
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

    getTriggerProps: () => normalize.button({
      ...parts.trigger.attrs,
      'id': ids.trigger,
      'type': 'button',
      // trigger 用原生 disabled，禁用后不可聚焦也不派 click；只读则仍可聚焦、仍能展开
      'disabled': disabled || undefined,
      // 按钮扮演 combobox，展开的是若干并排的列表框
      'role': 'combobox',
      'aria-haspopup': 'listbox',
      'aria-expanded': open ? 'true' : 'false',
      // 指向浮层壳而不是某一列，列随展开路径增减
      'aria-controls': ids.content,
      // 名字 = 标签 + 当前值；作者没写 label 时那一段是悬空 IDREF，按 accname 规则跳过
      'aria-labelledby': `${ids.label} ${ids['value-text']}`,
      'aria-invalid': invalid ? 'true' : 'false',
      'aria-readonly': readOnly ? 'true' : 'false',
      'data-state': stateAttr,
      'data-disabled': dataAttr(disabled),
      'data-readonly': dataAttr(readOnly),
      'data-invalid': dataAttr(invalid),
      'data-placeholder': dataAttr(value.length === 0),
      // 只读仍开得了浮层，改不动的只是选中值；禁用守卫防的是程序化派发
      'onClick': () => {
        if (!disabled)
          send({ type: 'TOGGLE', focus: 'selected' })
      },
      'onKeydown': (event: KeyboardEvent) => {
        if (disabled)
          return
        // 纵向轴且不收 Home/End：上下键展开并把焦点落到选中条目的相邻条目
        const intent = navIntentFromKey(event, { axis: 'vertical', home: false })
        if (intent) {
          event.preventDefault()
          send({ type: 'OPEN', focus: intent })
          return
        }
        // 吞掉 Enter 与空格，否则按钮的默认激活会再合成一次 click 把浮层关掉
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
      // 整个控件只占一个 Tab 位（trigger），清空按钮不进 Tab 序、也不暴露给读屏
      'tabindex': -1,
      'aria-hidden': true,
      'disabled': !canClear || undefined,
      'data-disabled': dataAttr(!canClear),
      // 拦掉默认聚焦，否则焦点会从 trigger 挪到这个隐身按钮上
      'onPointerDown': (event: PointerEvent) => {
        if (event.button === 0)
          event.preventDefault()
      },
      'onClick': () => {
        if (!canClear)
          return
        send({ type: 'VALUE.CLEAR' })
        // 键盘/程序化激活这一路没走 pointerdown，主动把焦点送回 trigger
        refs.get('getAnchorEl')()?.focus()
      },
    }),

    getPositionerProps: () => normalize.element({
      ...parts.positioner.attrs,
      'data-state': stateAttr,
      'data-placement': placement,
      // 锚点被滚出可视区时引擎会置 hidden
      'data-hidden': dataAttr(position?.hidden),
      'style': {
        position: 'fixed',
        insetInlineStart: `${position?.x ?? 0}px`,
        insetBlockStart: `${position?.y ?? 0}px`,
      },
    }),

    // 键盘全在 content 上收口，左右键要跨列走。Escape 归消解层管，不在这里收
    getContentProps: () => normalize.element({
      ...parts.content.attrs,
      'id': ids.content,
      // 浮层壳只是焦点域与消解层的根节点，列表框语义在每一列上。
      // 有锚点时 Tab 位归锚点条目，展开着却没有锚点时由容器兜底
      'tabindex': open && focusedPath == null ? 0 : -1,
      'data-state': stateAttr,
      'data-placement': placement,
      // 收起时留在 DOM 只隐藏，不卸载作者节点
      'hidden': !open || undefined,
      'onKeyDown': (event: KeyboardEvent) => {
        // 收起态按键不改任何东西，守卫防的是程序化派发
        if (!open || disabled)
          return
        const key = event.key
        // 带 Ctrl/Cmd/Alt 的组合不归浮层管
        if (event.ctrlKey || event.metaKey || event.altKey)
          return

        // 不 preventDefault，焦点按 Tab 序列自然离开
        if (key === 'Tab') {
          send({ type: 'CLOSE', src: 'tab' })
          return
        }

        // 上下键与 Home/End 只在当前列里走；轴固定 vertical，左右键另有进子列/回上一列的语义
        const intent = navIntentFromKey(event, { axis: 'vertical' })
        if (intent) {
          event.preventDefault()
          focusBy(intent)
          return
        }

        // rtl 下左右键整体对调
        const forward = dir === 'rtl' ? 'ArrowLeft' : 'ArrowRight'
        const backward = dir === 'rtl' ? 'ArrowRight' : 'ArrowLeft'

        if (key === forward) {
          // 叶子右边没有列，不吞这个键
          if (!focusedMeta?.branch)
            return
          // 展开路径被悬停带偏过时先把它拉回焦点条目，子列才是焦点条目自己的
          if (!cascaderSamePath(activePath, focusedMeta.path)) {
            event.preventDefault()
            send({ type: 'ITEM.FOCUS', level: focusedMeta.level, value: focusedMeta.value })
            return
          }
          // 走到这里子列已经开着
          const child = columns[focusedMeta.level + 1]
          const next = child ? cascaderStepColumn(child.items, null, 'first', { loop }) : null
          // 整列都禁用，进不去也不吞键
          if (!next)
            return
          event.preventDefault()
          focusMeta(next)
          return
        }

        if (key === backward) {
          // 根列左边没有列可回，不吞键
          if (!focusedMeta || focusedMeta.level === 0)
            return
          const parent = shown.get(focusedMeta.path[focusedMeta.level - 1]!)
          if (!parent)
            return
          event.preventDefault()
          // 焦点退回父条目，展开路径随之退到它，原先焦点所在的那一列被砍掉
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
        // 只接管从浮层外进来的焦点，否则浮层内 Shift+Tab 往外退会被困住
        if (contains(content, event.relatedTarget as Node | null))
          return
        // 焦点落到容器上说明还没有锚点，就地补一次落到最后一列的首个可停留条目
        const column = columns[columns.length - 1]
        if (!column)
          return
        focusItem(findCascaderItemEl(content, cascaderStepColumn(column.items, null, 'first', { loop })?.value ?? null))
      },
    }),

    getColumnProps: (column) => {
      // 子列的名字取展开它的那个条目；父条目不在任何可见列里时退回组件标题，避免悬空 IDREF
      const above = column.level > 0 ? activePath[column.level - 1] : undefined
      const parent = above != null && isVisible(above) ? above : undefined
      return normalize.element({
        ...parts.column.attrs,
        // 一列就是一个列表框，条目的 role=option 需要 listbox 容器
        'role': 'listbox',
        'aria-orientation': 'vertical',
        // 显式输出复选与否，省略时读屏无从区分
        'aria-multiselectable': multiple ? 'true' : 'false',
        'aria-disabled': disabled ? 'true' : 'false',
        'aria-labelledby': parent == null ? ids.label : itemId(parent),
        'data-level': String(column.level),
        // 列不进 Tab 序也不承载焦点；显式写 -1，可滚动容器会被某些浏览器自动塞进 Tab 序
        'tabindex': -1,
        'data-state': stateAttr,
        // 展开路径砍短后右边这些列收起，只加 hidden 不卸载
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
        // 列的 aria-labelledby 要指得到它，每个条目都需要稳定 id
        'id': itemId(item.value),
        'role': 'option',
        // 所在列取自 collection，不从 DOM 嵌套深度反推
        'data-level': meta ? String(meta.level) : undefined,
        // listbox 的选中语义是 aria-selected；未选中也显式输出 false
        'aria-selected': isSelected(item.value) ? 'true' : 'false',
        // 集合条目用 aria-disabled 而非原生 disabled，禁用条目仍要能当方向键的起点
        'aria-disabled': meta && isDisabled(meta) ? 'true' : 'false',
        // 分支报「激活它会露出一个列表框」：子列是右边另起的一列，不长在条目里面，
        // 因此走 aria-haspopup 而不是 aria-expanded（option 不收 aria-expanded）。
        // 反向的那半边由子列的 aria-labelledby 指回本条目给出
        'aria-haspopup': meta?.branch ? 'listbox' : undefined,
        // 分支与否只驱动样式，不再进可及树
        'data-branch': dataAttr(!!meta?.branch),
        // roving tabindex：整个浮层只有锚点条目留在 Tab 序列内
        'tabindex': focused ? 0 : -1,
        // 这一轮不属于任何一列，常挂在 DOM 里只收起不占位
        'hidden': !visible || undefined,
        'onClick': () => {
          // 隐藏条目仍在文档中，程序化点击送得到，守卫写在这里值才改不动
          if (!meta || !visible)
            return
          activate(meta)
        },
        // 禁用条目被点到也记锚点，方向键才知道从哪儿起步；展开路径随之落到这条路径上
        'onFocus': () => {
          if (visible && meta)
            send({ type: 'ITEM.FOCUS', level: meta.level, value: meta.value })
        },
        // 悬停展开只改展开路径，不碰焦点；expandTrigger=click 时整条让开
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
