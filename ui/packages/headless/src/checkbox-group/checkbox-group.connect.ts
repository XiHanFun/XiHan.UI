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

// 条目集合只在事件处理器里查活 DOM：那一刻两个适配器看到的是同一份文档，顺序即文档序。
const ITEM_QUERY: ItemQuery = { scope: checkboxGroupAnatomy.name, part: 'item' }

// 隐藏输入要留在布局与表单里，不能 display:none——原生校验提示需要一个可定位的框。
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

/**
 * 全选态：拿选中集合去比作者声明的全集。
 * 全集缺省时只回答得了"有没有选中过东西"，答不出 all——硬凑一个 all 会让
 * indeterminate 的父复选框在只勾了一项时就显示"全选"，比不给答案更糟。
 */
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
  const ids = scope.ids('checkbox-group', 'label')

  const editable = !groupDisabled && !readOnly
  const checkedState = resolveCheckedState(value, prop('itemValues') ?? [])

  const isChecked = (v: string): boolean => value.includes(v)
  // 组禁用向下传导到每个条目；条目也能单独禁用
  const isDisabled = (item: CheckboxGroupItemProps): boolean => groupDisabled || !!item.disabled
  // 能不能被用户改：整组闸门 + 条目自己的声明。两者都过了才接管按键
  const canToggle = (item: CheckboxGroupItemProps): boolean => editable && !item.disabled

  // item / item-control / item-text / item-hidden-input 共用同一份状态标记，样式层各处一致
  const stateAttrs = (item: CheckboxGroupItemProps): Record<string, string | undefined> => ({
    'data-state': isChecked(item.value) ? 'checked' : 'unchecked',
    'data-disabled': dataAttr(isDisabled(item)),
  })

  const toggle = (item: CheckboxGroupItemProps): void => {
    if (canToggle(item))
      send({ type: 'ITEM.TOGGLE', value: item.value })
  }

  /**
   * 全选：条目集合在这一刻现查，机器不记账。
   * 从 trigger 顺祖先链找回 root 再查：trigger 的事件对象只给得出它自己，
   * 而条目挂在 root 底下，绕不开这一跳。trigger 若被写在 root 之外就查不到条目，
   * 此时什么都不做——比拿整份文档去猜要安全。
   *
   * 禁用条目按 aria-disabled 现读排除：那是 connect 每帧写回的事实，
   * 全选不该把用户点不动的项也勾上。
   */
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
      // 只出 data-orientation：role=group 并不接受 aria-orientation（radiogroup 才接受），
      // 写上去是无效 ARIA，读屏不会因此念出排布方式
      'data-orientation': orientation,
      'data-disabled': dataAttr(groupDisabled),
      'data-readonly': dataAttr(readOnly),
      'data-invalid': dataAttr(invalid),
      // 容器不占 Tab 位：每个条目自己就是一个停靠点（见 getItemProps），
      // 容器再占一个只会让用户多按一次 Tab 却什么也聚焦不到
    }),

    getLabelProps: () => normalize.element({ ...parts.label.attrs, id: ids.label }),

    getItemProps: item => normalize.element({
      ...parts.item.attrs,
      ...stateAttrs(item),
      'role': 'checkbox',
      // 未选中必须显式输出 false：省略会让读屏无从区分"未选中"与"不是复选项"
      'aria-checked': isChecked(item.value) ? 'true' : 'false',
      // 集合条目一律 aria-disabled，绝不输出原生 disabled：
      // 原生 disabled 不可聚焦也不派发 click，禁用项就此从键盘用户眼里消失
      'aria-disabled': isDisabled(item) ? 'true' : 'false',
      'aria-readonly': readOnly ? 'true' : 'false',
      // 校验状态落在每个条目上：role=group 不接受 aria-invalid，
      // 而"这一组填得不对"对读屏用户来说要在他正操作的那个控件上听见
      'aria-invalid': invalid ? 'true' : 'false',
      // 全选时按它认领条目身份
      [ITEM_VALUE_ATTR]: item.value,
      // 每一项都是独立的 Tab 停靠点——复选框组与单选组正相反：
      // 单选组内至多选一个，Tab 只该停一次、组内用方向键走；
      // 复选框各选各的，跳过任何一项都等于让键盘用户够不着它。
      // 禁用项同样保留停靠位：aria-disabled 的条目仍要能被聚焦、被读出来
      'tabindex': 0,
      'onClick': () => toggle(item),
      'onKeyDown': (e: KeyboardEvent) => {
        // 改不动的条目不认这个键，因此也不能吞掉它：Space 必须放行给页面滚动
        if (e.key !== ' ' || !canToggle(item))
          return
        // role=checkbox 落在非原生节点上，Space 的翻转得自己做；
        // 不拦下来的话页面会跟着往下滚一屏
        e.preventDefault()
        toggle(item)
      },
    }),

    // 视觉方框，读屏不需要它——条目的可及名来自 item-text
    getItemControlProps: item => normalize.element({
      ...parts['item-control'].attrs,
      ...stateAttrs(item),
      'aria-hidden': 'true',
    }),

    getItemTextProps: item => normalize.element({
      ...parts['item-text'].attrs,
      ...stateAttrs(item),
    }),

    // 表单出口：选中值靠这批原生输入随表单提交（同名多值）。它们对键盘与读屏都不存在
    // （tabindex=-1 + aria-hidden），交互全部由 item 承担，两者不会各说各话。
    getItemHiddenInputProps: item => normalize.input({
      ...parts['item-hidden-input'].attrs,
      ...stateAttrs(item),
      // type 先于 checked 写入：改 type 会重置输入的选中态
      'type': 'checkbox',
      // name 缺省即不产出该属性，此时这份输入不参与提交
      'name': name,
      'value': item.value,
      'checked': isChecked(item.value),
      // 单体输入用原生 disabled（与 item 的 aria-disabled 相反）：禁用项不该提交出值
      'disabled': isDisabled(item) || undefined,
      'tabindex': -1,
      'aria-hidden': 'true',
      'style': HIDDEN_INPUT_STYLE,
    }),

    getTriggerProps: () => normalize.element({
      ...parts.trigger.attrs,
      'role': 'checkbox',
      // mixed 是这个部件存在的理由：勾了一部分时读屏要念"部分选中"，
      // 而不是在 true/false 里二选一硬凑
      'aria-checked': checkedState === 'all' ? 'true' : checkedState === 'some' ? 'mixed' : 'false',
      // 与条目同形：角色节点是普通元素而非原生控件，原生 disabled 在它身上不成立，
      // 且禁用后仍要能被聚焦，读屏才读得到这一组当前是"半选"
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
