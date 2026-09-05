import type { NormalizeProps, PropTypes, Service } from '@xihan-ui/core'
import type { SegmentedApi, SegmentedItemProps, SegmentedNodeMeta, SegmentedSchema } from './segmented.types'
import { anchorItem, contains, dataAttr, focusItem, ITEM_VALUE_ATTR, itemValue, navigateItems, navIntentFromKey, queryItems, readDirection } from '@xihan-ui/core'
import { segmentedAnatomy, segmentedItemQuery } from './segmented.anatomy'

const parts = segmentedAnatomy.build()

// 条目集合只在事件处理器里查活 DOM，顺序即文档序
const ITEM_QUERY = segmentedItemQuery

export function connectSegmented<T extends PropTypes>(
  service: Service<SegmentedSchema>,
  normalize: NormalizeProps<T>,
): SegmentedApi<T> {
  const { context, prop, send } = service
  const value = context.get('value') ?? null
  const focusedValue = context.get('focusedValue') ?? null
  const indicator = context.get('indicator')

  // collection 推出的条目元信息：显示文本与禁用都在这里定案，条目部件只报 value
  const collection: SegmentedNodeMeta[] = (prop('collection') ?? []).map(node => ({
    value: node.value,
    label: node.label ?? node.value,
    disabled: !!node.disabled,
  }))
  const metaOf = new Map(collection.map(meta => [meta.value, meta]))

  const groupDisabled = !!prop('disabled')
  const readOnly = !!prop('readOnly')
  const invalid = !!prop('invalid')
  const required = !!prop('required')
  const orientation = prop('orientation') ?? 'horizontal'
  const loop = prop('loop') ?? true

  const isSelected = (target: string): boolean => value === target
  // 组禁用向下传导到每一段；单段也能自己禁用：部件上写的优先，没写就回 collection 里查
  const isDisabled = (item: SegmentedItemProps): boolean =>
    groupDisabled || (item.disabled ?? metaOf.get(item.value)?.disabled ?? false)

  // roving tabindex 的唯一锚点：焦点在组内跟焦点走，否则跟选中值走
  const anchor = focusedValue ?? value

  // item / item-text 共用的状态标记
  const stateAttrs = (item: SegmentedItemProps): Record<string, string | undefined> => ({
    'data-state': isSelected(item.value) ? 'checked' : 'unchecked',
    'data-disabled': dataAttr(isDisabled(item)),
    'data-readonly': dataAttr(readOnly),
    'data-invalid': dataAttr(invalid),
  })

  const select = (item: SegmentedItemProps): void => {
    if (!isDisabled(item) && !readOnly)
      send({ type: 'ITEM.SELECT', value: item.value })
  }

  return {
    value,
    collection,
    focusedValue,
    disabled: groupDisabled,
    readOnly,
    isSelected,
    setValue: next => send({ type: 'VALUE.SET', value: next }),
    measure: () => send({ type: 'INDICATOR.MEASURE' }),

    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      // 只在作者显式给了时才写：写死 ltr 会切断从 RTL 祖先继承来的方向
      'dir': prop('dir'),
      // 一排互斥选项就是单选组；role=radiogroup 本身收下面这四条，不必下放到条目
      'role': 'radiogroup',
      'aria-orientation': orientation,
      'aria-readonly': readOnly ? 'true' : 'false',
      'aria-invalid': invalid ? 'true' : 'false',
      'aria-required': required ? 'true' : 'false',
      // 焦点在组外时容器可 Tab，进入后让位给条目。
      // 判据只能用 focusedValue：anchor 可能指向一个已不存在的值，那时没有条目认领 tabindex=0
      'tabindex': focusedValue == null ? 0 : -1,
      'data-orientation': orientation,
      'data-disabled': dataAttr(groupDisabled),
      'data-readonly': dataAttr(readOnly),
      'data-invalid': dataAttr(invalid),
      'data-required': dataAttr(required),
      'data-block': dataAttr(!!prop('block')),
      'data-tone': prop('tone'),
      'data-size': prop('size'),
      // 键盘全在容器上收口：条目只管声明自己，一次冒泡一个处理器
      'onKeyDown': (event: KeyboardEvent) => {
        if (groupDisabled)
          return
        // axis 'both'：四个方向键都搬焦点，orientation 只描述视觉排布。
        // 方向只对调左右键，上下键在 rtl 下语义不变；Home/End 走首末段。
        // 方向从容器现读：整页 rtl 而作者没传 dir 时，左右键也该跟着视觉顺序翻转；
        // 按键发生在事件时刻，DOM 一定在场。prop('dir') 仍然优先
        const dir = prop('dir') ?? readDirection(event.currentTarget as Element)
        const intent = navIntentFromKey(event, { axis: 'both', dir })
        // 返回 null 表示该键不归导航管，此时绝不 preventDefault：
        // Enter/Space 要留给原生按钮翻成 click，页面滚动也要留给页面
        if (!intent)
          return
        event.preventDefault()
        const items = queryItems(event.currentTarget as HTMLElement, ITEM_QUERY)
        const target = navigateItems(items, anchor, intent, { loop })
        const next = itemValue(target)
        if (next == null)
          return
        // 单选组里焦点跟着选中走；只读时焦点照走，只是不落值
        focusItem(target)
        if (!readOnly)
          send({ type: 'ITEM.SELECT', value: next })
      },
      'onFocus': (event: FocusEvent) => {
        const container = event.currentTarget as HTMLElement
        // 只接管从组外进来的焦点：组内 Shift+Tab 往外退时转投会把人困在组里
        if (contains(container, event.relatedTarget as Node | null))
          return
        // 落在锚点上：APG 要求焦点进组时落在已选中的那一段，没有选中项才落第一段
        const items = queryItems(container, ITEM_QUERY)
        focusItem(anchorItem(items, anchor) ?? navigateItems(items, null, 'first'))
      },
      'onFocusOut': (event: FocusEvent) => {
        const container = event.currentTarget as HTMLElement
        if (contains(container, event.relatedTarget as Node | null))
          return
        send({ type: 'GROUP.BLUR' })
      },
    }),

    getItemProps: (item) => {
      const disabled = isDisabled(item)
      return normalize.button({
        ...parts.item.attrs,
        ...stateAttrs(item),
        // 导航与选中都以此为条目身份
        [ITEM_VALUE_ATTR]: item.value,
        // 原生按钮的 Enter/Space 激活由平台负责；少了 type，按钮落在 form 里会变成 submit
        'type': 'button',
        'role': 'radio',
        // 未选中也显式输出 false：省略会让读屏无从区分"未选中"与"不是单选项"
        'aria-checked': isSelected(item.value) ? 'true' : 'false',
        // 集合条目一律 aria-disabled，不用原生 disabled：原生 disabled 不可聚焦、不派 click，
        // 禁用的那一段就当不成方向键的起点
        'aria-disabled': disabled ? 'true' : 'false',
        // 锚点那一段独占 Tab 序列位
        'tabindex': anchor === item.value ? 0 : -1,
        'onClick': () => select(item),
        // 焦点是事实不是许可：禁用段被点到也记锚点，方向键才知道从哪儿起步
        'onFocus': () => send({ type: 'ITEM.FOCUS', value: item.value }),
      })
    },

    getItemTextProps: item => normalize.element({
      ...parts['item-text'].attrs,
      ...stateAttrs(item),
    }),

    // 位置与尺寸由机器量好，铺成内联样式里的四个私有槽，皮肤照着摆。
    // 不发 data-orientation：指示器的盒子横竖两向都由这四个槽定死，没有按排布分支的规则；
    // 要按排布挑选它，从根上的 data-orientation 往下选
    getIndicatorProps: () => normalize.element({
      ...parts.indicator.attrs,
      'aria-hidden': true,
      'data-value': value ?? undefined,
      'hidden': indicator == null || undefined,
      'style': indicator
        ? {
            '--xh-_segmented-indicator-x': `${indicator.inlineStart}px`,
            '--xh-_segmented-indicator-y': `${indicator.blockStart}px`,
            '--xh-_segmented-indicator-w': `${indicator.inlineSize}px`,
            '--xh-_segmented-indicator-h': `${indicator.blockSize}px`,
          }
        : undefined,
    }),

    // 表单出口：整组只有一份，提交的就是当前选中值
    getHiddenInputProps: () => normalize.input({
      ...parts['hidden-input'].attrs,
      // type 须先于 value 写入：改 type 会重置输入的值
      type: 'hidden',
      // 未给 name 时不产出该属性，这份输入便不参与提交
      name: prop('name'),
      value: value ?? '',
      // 禁用的控件不该提交出值
      disabled: groupDisabled || undefined,
    }),
  }
}
