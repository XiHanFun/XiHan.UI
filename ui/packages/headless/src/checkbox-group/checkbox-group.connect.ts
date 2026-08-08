import type { ItemQuery } from '@xihan-ui/behavior'
import type { NormalizeProps, PropTypes } from '@xihan-ui/core'
import type { Service } from '@xihan-ui/machine'
import type {
  CheckboxGroupApi,
  CheckboxGroupCheckedState,
  CheckboxGroupItemProps,
  CheckboxGroupSchema,
} from './checkbox-group.types'
import { isItemDisabled, ITEM_VALUE_ATTR, itemValue, queryItems } from '@xihan-ui/behavior'
import { dataAttr } from '@xihan-ui/core'
import { checkboxGroupAnatomy } from './checkbox-group.anatomy'

const parts = checkboxGroupAnatomy.build()

// 条目集合在事件处理器里现查活 DOM，顺序即文档序。
const ITEM_QUERY: ItemQuery = { scope: checkboxGroupAnatomy.name, part: 'item' }

// 隐藏输入保留在布局与表单里，不用 display:none，原生校验提示需要一个可定位的框。
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

/** 全选态：拿选中集合去比作者声明的全集；全集缺省时只答 none / some。 */
export function resolveCheckedState(
  value: readonly string[],
  itemValues: readonly string[],
): CheckboxGroupCheckedState {
  if (itemValues.length === 0)
    return value.length > 0 ? 'some' : 'none'
  const hit = itemValues.filter(v => value.includes(v)).length
  if (hit === 0)
    return 'none'
  return hit === itemValues.length ? 'all' : 'some'
}

export function connectCheckboxGroup<T extends PropTypes>(
  service: Service<CheckboxGroupSchema>,
  normalize: NormalizeProps<T>,
): CheckboxGroupApi<T> {
  const { context, prop, send, scope } = service
  const value = context.get('value') ?? []
  const groupDisabled = !!prop('disabled')
  const readOnly = !!prop('readOnly')
  const invalid = !!prop('invalid')
  const orientation = prop('orientation') ?? 'vertical'
  const name = prop('name')
  const ids = scope.ids('checkbox-group', 'label', 'trigger')

  const editable = !groupDisabled && !readOnly
  const checkedState = resolveCheckedState(value, prop('itemValues') ?? [])

  const isChecked = (v: string): boolean => value.includes(v)
  // 组禁用向下传导到每个条目；条目也能单独禁用
  const isDisabled = (item: CheckboxGroupItemProps): boolean => groupDisabled || !!item.disabled
  // 能不能被用户改：整组闸门 + 条目自己的声明
  const canToggle = (item: CheckboxGroupItemProps): boolean => editable && !item.disabled

  // item / item-control / item-text / item-hidden-input 共用同一份状态标记
  const stateAttrs = (item: CheckboxGroupItemProps): Record<string, string | undefined> => ({
    'data-state': isChecked(item.value) ? 'checked' : 'unchecked',
    'data-disabled': dataAttr(isDisabled(item)),
  })

  const toggle = (item: CheckboxGroupItemProps): void => {
    if (canToggle(item))
      send({ type: 'ITEM.TOGGLE', value: item.value })
  }

  /** 全选：从 trigger 顺祖先链找回 root，现查条目并按 aria-disabled 排除禁用项。 */
  const toggleAll = (event: Event): void => {
    if (!editable)
      return
    const container = (event.currentTarget as HTMLElement | null)?.closest<HTMLElement>(parts.root.selector) ?? null
    const values = queryItems(container, ITEM_QUERY)
      .filter(el => !isItemDisabled(el))
      .map(el => itemValue(el))
      .filter((v): v is string => v != null)
    if (values.length === 0)
      return
    send({ type: 'ALL.TOGGLE', values })
  }

  return {
    value,
    checkedState,
    disabled: groupDisabled,
    readOnly,
    invalid,
    isChecked,
    setValue: next => send({ type: 'VALUE.SET', value: next }),
    toggleValue: v => send({ type: 'ITEM.TOGGLE', value: v }),

    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      'role': 'group',
      'aria-labelledby': ids.label,
      // role=group 不接受 aria-orientation，只出 data-orientation
      'data-orientation': orientation,
      'data-disabled': dataAttr(groupDisabled),
      'data-readonly': dataAttr(readOnly),
      'data-invalid': dataAttr(invalid),
      // 容器不占 Tab 位，每个条目自己是停靠点
    }),

    getLabelProps: () => normalize.element({ ...parts.label.attrs, id: ids.label }),

    getItemProps: item => normalize.element({
      ...parts.item.attrs,
      ...stateAttrs(item),
      'role': 'checkbox',
      // 未选中显式输出 false
      'aria-checked': isChecked(item.value) ? 'true' : 'false',
      // 条目一律用 aria-disabled 而非原生 disabled，保持可聚焦
      'aria-disabled': isDisabled(item) ? 'true' : 'false',
      'aria-readonly': readOnly ? 'true' : 'false',
      // 校验状态落在每个条目上，role=group 不接受 aria-invalid
      'aria-invalid': invalid ? 'true' : 'false',
      // 全选时按它认领条目身份
      [ITEM_VALUE_ATTR]: item.value,
      // 每一项都是独立的 Tab 停靠点，禁用项同样保留停靠位
      'tabindex': 0,
      'onClick': () => toggle(item),
      'onKeyDown': (e: KeyboardEvent) => {
        // 改不动的条目放行 Space 给页面滚动
        if (e.key !== ' ' || !canToggle(item))
          return
        // role=checkbox 在非原生节点上，Space 的翻转自己做
        e.preventDefault()
        toggle(item)
      },
    }),

    // 视觉方框，条目的可及名来自 item-text
    getItemControlProps: item => normalize.element({
      ...parts['item-control'].attrs,
      ...stateAttrs(item),
      'aria-hidden': 'true',
    }),

    getItemTextProps: item => normalize.element({
      ...parts['item-text'].attrs,
      ...stateAttrs(item),
    }),

    // 表单出口：选中值靠这批原生输入随表单提交（同名多值），对键盘与读屏不可见。
    getItemHiddenInputProps: item => normalize.input({
      ...parts['item-hidden-input'].attrs,
      ...stateAttrs(item),
      // type 先于 checked 写入：改 type 会重置输入的选中态
      'type': 'checkbox',
      // name 缺省即不产出该属性，此时这份输入不参与提交
      'name': name,
      'value': item.value,
      'checked': isChecked(item.value),
      // 单体输入用原生 disabled，禁用项不提交出值
      'disabled': isDisabled(item) || undefined,
      // inert 把这份输入从焦点与无障碍树里整个摘掉：条目那层是 role=checkbox，
      // 它的后代里不能留下可聚焦的控件（负 tabindex 与 aria-hidden 都拦不住读屏的虚拟光标）
      'inert': true,
      'tabindex': -1,
      'aria-hidden': 'true',
      'style': HIDDEN_INPUT_STYLE,
    }),

    getTriggerProps: () => normalize.element({
      ...parts.trigger.attrs,
      'role': 'checkbox',
      // 自指的那一段要有落点
      'id': ids.trigger,
      // 名字 = 组标题 + 全选格自己的文本：作者没写文本时由组标题兜住，
      // 写了文本也不会被顶掉（自指那段按 accname 规则取本节点的内容）；
      // 两段各自缺席时都是悬空 IDREF，按规则跳过
      'aria-labelledby': `${ids.label} ${ids.trigger}`,
      // 勾了一部分时输出 mixed
      'aria-checked': checkedState === 'all' ? 'true' : checkedState === 'some' ? 'mixed' : 'false',
      // 与条目同形：用 aria-disabled，禁用后仍可聚焦
      'aria-disabled': editable ? 'false' : 'true',
      'aria-readonly': readOnly ? 'true' : 'false',
      'tabindex': 0,
      'data-state': checkedState,
      'data-disabled': dataAttr(groupDisabled),
      'data-readonly': dataAttr(readOnly),
      'onClick': toggleAll,
      'onKeyDown': (e: KeyboardEvent) => {
        if (e.key !== ' ' || !editable)
          return
        e.preventDefault()
        toggleAll(e)
      },
    }),
  }
}
