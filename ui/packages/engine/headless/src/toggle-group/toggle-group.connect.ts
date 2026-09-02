import type { ItemQuery } from '@xihan-ui/behavior'
import type { NormalizeProps, PropTypes } from '@xihan-ui/kernel'
import type { Service } from '@xihan-ui/machine'
import type { ToggleGroupApi, ToggleGroupItemProps, ToggleGroupNodeMeta, ToggleGroupSchema } from './toggle-group.types'
import { focusItem, isItemDisabled, ITEM_VALUE_ATTR, itemValue, navigateItems, navIntentFromKey, queryItems } from '@xihan-ui/behavior'
import { contains, dataAttr } from '@xihan-ui/kernel'
import { toggleGroupAnatomy } from './toggle-group.anatomy'

const parts = toggleGroupAnatomy.build()

// 条目集合只在事件处理器里查活 DOM，顺序即文档序；归属过滤保证嵌套的两组开关互不吞并。
const ITEM_QUERY: ItemQuery = { scope: toggleGroupAnatomy.name, part: 'item' }

export function connectToggleGroup<T extends PropTypes>(
  service: Service<ToggleGroupSchema>,
  normalize: NormalizeProps<T>,
): ToggleGroupApi<T> {
  const { context, prop, send } = service
  const value = context.get('value')

  // collection 推出的条目元信息：显示文本与禁用都在这里定案，条目部件只报 value
  const collection: ToggleGroupNodeMeta[] = (prop('collection') ?? []).map(node => ({
    value: node.value,
    label: node.label ?? node.value,
    disabled: !!node.disabled,
  }))
  const metaOf = new Map(collection.map(meta => [meta.value, meta]))

  const focusedValue = context.get('focusedValue') ?? null
  const multiple = !!prop('multiple')
  const groupDisabled = !!prop('disabled')
  const orientation = prop('orientation') ?? 'horizontal'
  const dir = prop('dir') ?? 'ltr'
  const loop = prop('loop') ?? true
  const rovingFocus = prop('rovingFocus') ?? true

  const isSelected = (target: string): boolean => value.includes(target)
  // 组禁用向下传导到每个条目；条目也能单独禁用：部件上写的优先，没写就回 collection 里查
  const isDisabled = (item: ToggleGroupItemProps): boolean =>
    groupDisabled || (item.disabled ?? metaOf.get(item.value)?.disabled ?? false)

  // roving tabindex 的唯一锚点：焦点在组内跟焦点走，否则跟第一个选中值走。
  const anchor = focusedValue ?? value[0] ?? null

  /** 条目的 Tab 停靠位。关掉 roving 后每个条目都自成一个停靠点。 */
  const itemTabIndex = (item: ToggleGroupItemProps): number => {
    if (!rovingFocus)
      return 0
    return anchor === item.value ? 0 : -1
  }

  /**
   * 容器的 Tab 停靠位。
   * 判据是 focusedValue == null 而不是 anchor == null：anchor 可能指向已删掉或不在选项里的条目，
   * 那时无人认领 tabindex=0。焦点已在组内时容器让位，Tab 才能正常离开本组。
   * 关掉 roving 时条目自己全在 Tab 序列里，容器不再占位。
   * 整组禁用时同样不占位：方向键一概不响应，留着就是个什么都不通的 Tab 停靠点。
   */
  const rootTabIndex = (): number | undefined => {
    if (groupDisabled)
      return undefined
    if (!rovingFocus)
      return -1
    return focusedValue == null ? 0 : -1
  }

  /** 方向键落点：起点用锚点（作者声明的值），终点用事件那一刻的活 DOM 算。 */
  const navigate = (container: HTMLElement, event: KeyboardEvent): void => {
    // axis 'both'：四个方向键都搬焦点，orientation 只描述视觉排布。
    // dir 只对调左右键，上下键在 rtl 下语义不变
    const intent = navIntentFromKey(event, { axis: 'both', dir })
    // 返回 null 表示该键不归导航管，此时绝不 preventDefault（页面滚动与读屏要用）
    if (!intent)
      return
    event.preventDefault()
    const target = navigateItems(queryItems(container, ITEM_QUERY), anchor, intent, { loop })
    const next = itemValue(target)
    if (next == null)
      return
    // 方向键只搬焦点、不改选中，切换要靠确认键
    focusItem(target)
    send({ type: 'ITEM.FOCUS', value: next })
  }

  return {
    value,
    collection,
    focusedValue,
    multiple,
    disabled: groupDisabled,
    isSelected,
    setValue: next => send({ type: 'VALUE.SET', value: next }),

    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      // 单选借 radiogroup 语义，多选用中性的 group 容器。
      // 两套语义不混用：radiogroup 配 aria-checked、group 配 aria-pressed。
      'role': multiple ? 'group' : 'radiogroup',
      // aria-orientation 只有 radiogroup 收，role=group 给了是无效 ARIA；
      // 排布信息一律走 data-orientation
      'aria-orientation': multiple ? undefined : orientation,
      'data-tone': prop('tone'),
      'data-size': prop('size'),
      'data-orientation': orientation,
      'data-disabled': dataAttr(groupDisabled),
      'tabindex': rootTabIndex(),
      // 键盘全在容器上收口：条目只管声明自己，一次冒泡一个处理器
      'onKeyDown': (event: KeyboardEvent) => {
        if (groupDisabled || !rovingFocus)
          return
        navigate(event.currentTarget as HTMLElement, event)
      },
      'onFocus': (event: FocusEvent) => {
        if (!rovingFocus)
          return
        const container = event.currentTarget as HTMLElement
        // 只接管从组外进来的焦点：组内 Shift+Tab 往外退时转投会把人困在组里
        if (contains(container, event.relatedTarget as Node | null))
          return
        const items = queryItems(container, ITEM_QUERY)
        // 转投给锚点条目；锚点悬空或已禁用时退回首个可停留条目。
        // 落点条目自己的 onFocus 会把锚点接过去
        const target = items.find(el => itemValue(el) === anchor && !isItemDisabled(el))
          ?? navigateItems(items, null, 'first', { loop })
        focusItem(target)
      },
      'onFocusOut': (event: FocusEvent) => {
        const container = event.currentTarget as HTMLElement
        if (contains(container, event.relatedTarget as Node | null))
          return
        send({ type: 'GROUP.BLUR' })
      },
    }),

    getItemProps: (item) => {
      const selected = isSelected(item.value)
      const disabled = isDisabled(item)
      return normalize.button({
        ...parts.item.attrs,
        // 导航与选中都以此为条目身份
        [ITEM_VALUE_ATTR]: item.value,
        // 原生按钮的 Enter/Space 激活由平台负责；少了 type，按钮落在 form 里会变成 submit
        'type': 'button',
        // 单选用 radio + aria-checked，多选保留原生按钮 role + aria-pressed，两者只出现一个
        'role': multiple ? undefined : 'radio',
        'aria-checked': multiple ? undefined : (selected ? 'true' : 'false'),
        'aria-pressed': multiple ? (selected ? 'true' : 'false') : undefined,
        // 集合条目一律 aria-disabled，不用原生 disabled：原生 disabled 不可聚焦、不派 click，
        // 禁用条目就当不成方向键的起点
        'aria-disabled': disabled ? 'true' : 'false',
        'tabindex': itemTabIndex(item),
        'data-state': selected ? 'on' : 'off',
        'data-disabled': dataAttr(disabled),
        'onClick': () => {
          if (!disabled)
            send({ type: 'ITEM.TOGGLE', value: item.value })
        },
        // 焦点是事实不是许可：禁用条目被点到也记锚点，方向键才知道从哪儿起步
        'onFocus': () => send({ type: 'ITEM.FOCUS', value: item.value }),
      })
    },
  }
}
