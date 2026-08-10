import type { ItemQuery } from '@xihan-ui/behavior'
import type { NormalizeProps, PropTypes } from '@xihan-ui/core'
import type { Service } from '@xihan-ui/machine'
import type { RadioGroupApi, RadioGroupItemProps, RadioGroupNodeMeta, RadioGroupSchema } from './radio-group.types'
import { focusItem, ITEM_VALUE_ATTR, itemValue, navigateItems, navIntentFromKey, queryItems } from '@xihan-ui/behavior'
import { contains, dataAttr } from '@xihan-ui/core'
import { radioGroupAnatomy } from './radio-group.anatomy'

const parts = radioGroupAnatomy.build()

// 条目查询描述符；只在事件处理器里查活 DOM，渲染期不得调用
const ITEM_QUERY: ItemQuery = { scope: radioGroupAnatomy.name, part: 'item' }

// 视觉隐藏但保留在布局与表单里，不能 display:none——原生校验提示需要一个可定位的框
const HIDDEN_INPUT_STYLE = {
  position: 'absolute',
  inlineSize: '1px',
  blockSize: '1px',
  margin: '-1px',
  padding: '0',
  border: '0',
  overflow: 'hidden',
  clipPath: 'inset(50%)',
  whiteSpace: 'nowrap',
}

export function connectRadioGroup<T extends PropTypes>(
  service: Service<RadioGroupSchema>,
  normalize: NormalizeProps<T>,
): RadioGroupApi<T> {
  const { context, prop, send, scope } = service
  const value = context.get('value') ?? null
  const focusedValue = context.get('focusedValue') ?? null
  const groupDisabled = !!prop('disabled')
  const orientation = prop('orientation') ?? 'vertical'
  const dir = prop('dir') ?? 'ltr'
  const name = prop('name')
  const ids = scope.ids('radio-group', 'label')

  // collection 推出的条目元信息：显示文本与禁用都在这里定案，条目部件只报 value
  const collection: RadioGroupNodeMeta[] = (prop('collection') ?? []).map(node => ({
    value: node.value,
    label: node.label ?? node.value,
    disabled: !!node.disabled,
  }))
  const metaOf = new Map(collection.map(meta => [meta.value, meta]))

  /** 条目禁用：部件上写的优先，没写就回 collection 里查。 */
  const itemDisabled = (item: RadioGroupItemProps): boolean =>
    item.disabled ?? metaOf.get(item.value)?.disabled ?? false

  // roving tabindex 锚点：焦点值优先，否则选中值
  const anchor = focusedValue ?? value

  const isChecked = (item: RadioGroupItemProps): boolean => value === item.value
  const isDisabled = (item: RadioGroupItemProps): boolean => groupDisabled || itemDisabled(item)

  // item / item-text / indicator / hidden-input 共用的状态标记
  const stateAttrs = (item: RadioGroupItemProps): Record<string, string | undefined> => ({
    'data-state': isChecked(item) ? 'checked' : 'unchecked',
    'data-disabled': dataAttr(isDisabled(item)),
  })

  const select = (item: RadioGroupItemProps): void => {
    if (!isDisabled(item))
      send({ type: 'ITEM.SELECT', value: item.value })
  }

  return {
    value,
    collection,
    focusedValue,
    setValue: next => send({ type: 'VALUE.SET', value: next }),
    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      'role': 'radiogroup',
      'aria-labelledby': ids.label,
      // 只描述视觉排布，与方向键接受的轴无关（见 onKeyDown 的 axis: 'both'）
      'aria-orientation': orientation,
      'data-orientation': orientation,
      'data-tone': prop('tone'),
      'data-size': prop('size'),
      'data-disabled': dataAttr(groupDisabled),
      // 焦点在组外时容器可 Tab，进入后让位给条目。
      // 判据只能用 focusedValue：anchor 可能指向一个已不存在的值，那时没有条目认领 tabindex=0
      'tabindex': focusedValue == null ? 0 : -1,
      'onFocus': (e: FocusEvent) => {
        const container = e.currentTarget as HTMLElement
        // 只接管从组外进来的焦点
        if (contains(container, e.relatedTarget as Node | null))
          return
        const items = queryItems(container, ITEM_QUERY)
        focusItem(navigateItems(items, null, 'first'))
      },
      'onFocusOut': (e: FocusEvent) => {
        const container = e.currentTarget as HTMLElement
        if (contains(container, e.relatedTarget as Node | null))
          return
        send({ type: 'GROUP.BLUR' })
      },
      'onKeyDown': (e: KeyboardEvent) => {
        if (groupDisabled)
          return
        // 四个方向键都响应，不接 Home/End
        const intent = navIntentFromKey(e, { axis: 'both', dir, home: false })
        // 返回 null 表示该键不归导航管，此时绝不 preventDefault
        if (!intent)
          return
        e.preventDefault()
        const items = queryItems(e.currentTarget as HTMLElement, ITEM_QUERY)
        const target = navigateItems(items, anchor, intent, { loop: true })
        const next = itemValue(target)
        if (next == null)
          return
        // 方向键移动焦点的同时选中
        focusItem(target)
        send({ type: 'ITEM.SELECT', value: next })
      },
    }),
    getLabelProps: () => normalize.element({ ...parts.label.attrs, id: ids.label }),
    getItemProps: item => normalize.element({
      ...parts.item.attrs,
      ...stateAttrs(item),
      'role': 'radio',
      // 未选中也显式输出 false：省略会让读屏无从区分"未选中"与"不是单选项"
      'aria-checked': isChecked(item) ? 'true' : 'false',
      // 用 aria-disabled 保持禁用条目可聚焦
      'aria-disabled': isDisabled(item) ? 'true' : 'false',
      [ITEM_VALUE_ATTR]: item.value,
      // 锚点条目独占 Tab 序列位
      'tabindex': anchor === item.value ? 0 : -1,
      'onClick': () => select(item),
      // 禁用条目被聚焦也记锚点
      'onFocus': () => send({ type: 'ITEM.FOCUS', value: item.value }),
      'onKeyDown': (e: KeyboardEvent) => {
        // 禁用条目不认这个键，因此也不能吞掉它：Space 必须放行给页面滚动
        if (e.key !== ' ' || isDisabled(item))
          return
        e.preventDefault()
        select(item)
      },
    }),
    getItemTextProps: item => normalize.element({
      ...parts['item-text'].attrs,
      ...stateAttrs(item),
    }),
    getIndicatorProps: item => normalize.element({
      ...parts.indicator.attrs,
      ...stateAttrs(item),
      'aria-hidden': 'true',
    }),
    // 表单出口：选中值随这份原生输入提交
    getHiddenInputProps: item => normalize.input({
      ...parts['hidden-input'].attrs,
      ...stateAttrs(item),
      // type 须先于 checked 写入
      'type': 'radio',
      // 未给 name 时不产出该属性，不参与提交
      'name': name,
      'value': item.value,
      'checked': isChecked(item),
      // 禁用时不提交值
      'disabled': isDisabled(item) || undefined,
      // inert 把这份输入从焦点与无障碍树里整个摘掉：条目那层是 role=radio，
      // 它的后代里不能留下可聚焦的控件（负 tabindex 与 aria-hidden 都拦不住读屏的虚拟光标）
      'inert': true,
      'tabindex': -1,
      'aria-hidden': 'true',
      'style': HIDDEN_INPUT_STYLE,
    }),
  }
}
