/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 checkbox group 相关实现。

import type { ItemQuery, NormalizeProps, PressHandlers, PropTypes, Service } from '@xihan-ui/core'
import type {
  CheckboxGroupApi,
  CheckboxGroupCheckedState,
  CheckboxGroupItemProps,
  CheckboxGroupNodeMeta,
  CheckboxGroupPressedPart,
  CheckboxGroupSchema,
} from './checkbox-group.types'
import { createPressTracker, dataAttr, isItemDisabled, ITEM_VALUE_ATTR, itemValue, queryItems } from '@xihan-ui/core'
import { VISUALLY_HIDDEN_STYLE } from '../shared/visually-hidden'
import { checkboxGroupAnatomy } from './checkbox-group.anatomy'

const parts = checkboxGroupAnatomy.build()

// 条目集合在事件处理器里现查活 DOM，顺序即文档序。
const ITEM_QUERY: ItemQuery = { scope: checkboxGroupAnatomy.name, part: 'item' }

/** 全选态：拿选中集合去比作者声明的全集；全集缺省时只答 unchecked / indeterminate。 */
export function resolveCheckedState(
  value: readonly string[],
  itemValues: readonly string[],
): CheckboxGroupCheckedState {
  if (itemValues.length === 0)
    return value.length > 0 ? 'indeterminate' : 'unchecked'
  const hit = itemValues.filter(v => value.includes(v)).length
  if (hit === 0)
    return 'unchecked'
  return hit === itemValues.length ? 'checked' : 'indeterminate'
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
  const ids = scope.ids('checkbox-group', 'label', 'select-all-trigger')

  const editable = !groupDisabled && !readOnly
  const checkedState = resolveCheckedState(value, prop('itemValues') ?? [])

  // collection 推出的条目元信息：显示文本与禁用都在这里定案，条目部件只报 value
  const collection: CheckboxGroupNodeMeta[] = (prop('collection') ?? []).map(node => ({
    value: node.value,
    label: node.label ?? node.value,
    disabled: !!node.disabled,
  }))
  const metaOf = new Map(collection.map(meta => [meta.value, meta]))

  /** 条目禁用：部件上写的优先，没写就回 collection 里查。 */
  const itemDisabled = (item: CheckboxGroupItemProps): boolean =>
    item.disabled ?? metaOf.get(item.value)?.disabled ?? false

  const isChecked = (v: string): boolean => value.includes(v)
  // 组禁用向下传导到每个条目；条目也能单独禁用
  const isDisabled = (item: CheckboxGroupItemProps): boolean => groupDisabled || itemDisabled(item)
  // 能不能被用户改：整组闸门 + 条目自己的声明
  const canToggle = (item: CheckboxGroupItemProps): boolean => editable && !itemDisabled(item)

  // item / indicator / item-text / hidden-input 共用同一份状态标记
  const stateAttrs = (item: CheckboxGroupItemProps): Record<string, string | undefined> => ({
    'data-state': isChecked(item.value) ? 'checked' : 'unchecked',
    'data-disabled': dataAttr(isDisabled(item)),
  })

  const toggle = (item: CheckboxGroupItemProps): void => {
    if (canToggle(item))
      send({ type: 'ITEM.TOGGLE', value: item.value })
  }

  // 按压通道：真源是机器 context 里「正被按住的那一个」（条目按 value 记、全选格不带 value），各自合成一份
  // 跟踪器；Space 与触屏按住投影 data-pressed，指针按住由 :active 表出，皮肤两者同一档（data-pressed 投在行上，
  // 行换面、方框随行读宿主 host 槽换底）。选中与按压互相独立；条目自身的禁用只有 connect 知道，随 PRESS.START
  // 带给机器的守卫。role=checkbox 只有 Space 是激活键：Enter 在这里什么都不做，也就没有按压面可言
  const pressedPart = context.get('pressedPart')
  const pressedValue = context.get('pressedValue')
  const press = (part: CheckboxGroupPressedPart, value?: string, disabled?: boolean): PressHandlers => {
    const handlers = createPressTracker({
      isPressed: () => context.get('pressedPart') === part && context.get('pressedValue') === (value ?? null),
      onChange: down => send(down
        ? { type: 'PRESS.START', part, value, disabled }
        : { type: 'PRESS.END', part, value }),
    })
    return {
      ...handlers,
      onKeyDown: (event) => {
        if (event.key !== 'Enter')
          handlers.onKeyDown(event)
      },
    }
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
    collection,
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
      // 视觉轴打在根上，条目与方框从这里继承私有槽，子部件不重复标注
      'data-tone': prop('tone'),
      'data-size': prop('size'),
      'data-disabled': dataAttr(groupDisabled),
      'data-readonly': dataAttr(readOnly),
      'data-invalid': dataAttr(invalid),
      // 容器不占 Tab 位，每个条目自己是停靠点
    }),

    getLabelProps: () => normalize.element({ ...parts.label.attrs, id: ids.label }),

    getItemProps: (item) => {
      const handlers = press('item', item.value, itemDisabled(item))
      return normalize.element({
        ...parts.item.attrs,
        ...stateAttrs(item),
        'role': 'checkbox',
        // 整行是「方框 + 文案」的行级命中区：接 Action Control row 档、ghost 形态，row 档允许标签折行、
        // 按下只换面不缩放；xs 的 24px 是命中地板，方框 12 / 16 / 20px 居中其间，字号与间距由皮肤按组档位映射，
        // 与 transfer select-all-trigger 同理。方框是行内 aria-hidden 的标记，随行读宿主的 host 槽换面
        'data-xh-action-control': '',
        'data-xh-action-profile': 'row',
        'data-xh-action-variant': 'ghost',
        'data-xh-action-display': 'always',
        'data-xh-action-size': 'xs',
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
        // Space 与触屏按住投影 data-pressed，皮肤的按下面同时认它与指针 :active；与选中互相独立
        'data-pressed': dataAttr(pressedPart === 'item' && pressedValue === item.value),
        'onClick': () => toggle(item),
        // 同一个 keydown 先过跟踪器再翻转
        'onKeyDown': (e: KeyboardEvent) => {
          handlers.onKeyDown(e)
          // 改不动的条目放行 Space 给页面滚动
          if (e.key !== ' ' || !canToggle(item))
            return
          // role=checkbox 在非原生节点上，Space 的翻转自己做
          e.preventDefault()
          toggle(item)
        },
        'onKeyUp': handlers.onKeyUp,
        'onBlur': handlers.onBlur,
        'onPointerDown': handlers.onPointerDown,
        'onPointerUp': handlers.onPointerUp,
        'onPointerCancel': handlers.onPointerCancel,
      })
    },

    // 视觉方框，条目的可及名来自 item-text
    getIndicatorProps: item => normalize.element({
      ...parts.indicator.attrs,
      ...stateAttrs(item),
      'aria-hidden': true,
    }),

    getItemTextProps: item => normalize.element({
      ...parts['item-text'].attrs,
      ...stateAttrs(item),
    }),

    // 表单出口：选中值靠这批原生输入随表单提交（同名多值），对键盘与读屏不可见。
    getHiddenInputProps: item => normalize.input({
      ...parts['hidden-input'].attrs,
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
      'aria-hidden': true,
      'style': VISUALLY_HIDDEN_STYLE,
    }),

    getSelectAllTriggerProps: () => {
      const handlers = press('select-all-trigger')
      return normalize.element({
        ...parts['select-all-trigger'].attrs,
        'role': 'checkbox',
        // 与条目同形：整行接 Action Control row 档 ghost，xs 命中地板，按下只换面不缩放；方框由皮肤的 ::before 画，
        // 随行读宿主的 host 槽换面
        'data-xh-action-control': '',
        'data-xh-action-profile': 'row',
        'data-xh-action-variant': 'ghost',
        'data-xh-action-display': 'always',
        'data-xh-action-size': 'xs',
        // 自指的那一段要有落点
        'id': ids['select-all-trigger'],
        // 名字 = 组标题 + 全选格自己的文本：作者没写文本时由组标题兜住，
        // 写了文本也不会被顶掉（自指那段按 accname 规则取本节点的内容）；
        // 两段各自缺席时都是悬空 IDREF，按规则跳过
        'aria-labelledby': `${ids.label} ${ids['select-all-trigger']}`,
        // 勾了一部分时输出 mixed
        'aria-checked': checkedState === 'checked' ? 'true' : checkedState === 'indeterminate' ? 'mixed' : 'false',
        // 与条目同形：用 aria-disabled，禁用后仍可聚焦
        'aria-disabled': editable ? 'false' : 'true',
        'aria-readonly': readOnly ? 'true' : 'false',
        'tabindex': 0,
        'data-state': checkedState,
        'data-disabled': dataAttr(groupDisabled),
        'data-readonly': dataAttr(readOnly),
        // Space 与触屏按住投影 data-pressed，皮肤的按下面同时认它与指针 :active；与全选态互相独立
        'data-pressed': dataAttr(pressedPart === 'select-all-trigger'),
        'onClick': toggleAll,
        // 同一个 keydown 先过跟踪器再全选
        'onKeyDown': (e: KeyboardEvent) => {
          handlers.onKeyDown(e)
          if (e.key !== ' ' || !editable)
            return
          e.preventDefault()
          toggleAll(e)
        },
        'onKeyUp': handlers.onKeyUp,
        'onBlur': handlers.onBlur,
        'onPointerDown': handlers.onPointerDown,
        'onPointerUp': handlers.onPointerUp,
        'onPointerCancel': handlers.onPointerCancel,
      })
    },
  }
}
