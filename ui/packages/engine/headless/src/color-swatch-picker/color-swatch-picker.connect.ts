/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 color swatch picker 相关实现。

import type { ItemQuery, NormalizeProps, PressHandlers, PropTypes, Service } from '@xihan-ui/core'
import type { ColorSwatchPickerApi, ColorSwatchPickerItemProps, ColorSwatchPickerNodeMeta, ColorSwatchPickerSchema, ColorSwatchPickerTranslations } from './color-swatch-picker.types'
import { anchorItem, contains, createPressTracker, dataAttr, focusItem, ITEM_VALUE_ATTR, itemValue, navigateItems, navIntentFromKey, queryItems } from '@xihan-ui/core'
import { colorCss, colorParse, colorSameColor } from '../shared/color'
import { VISUALLY_HIDDEN_STYLE } from '../shared/visually-hidden'
import { colorSwatchPickerAnatomy } from './color-swatch-picker.anatomy'

const parts = colorSwatchPickerAnatomy.build()

// 格子查询描述符；只在事件处理器里查活 DOM，渲染期不得调用
const ITEM_QUERY: ItemQuery = { scope: colorSwatchPickerAnatomy.name, part: 'item' }

function resolveTranslations(input: Partial<ColorSwatchPickerTranslations> | undefined): ColorSwatchPickerTranslations {
  return {
    group: input?.group ?? 'Color swatches',
    swatch: input?.swatch ?? (value => `Color ${value}`),
  }
}

export function connectColorSwatchPicker<T extends PropTypes>(
  service: Service<ColorSwatchPickerSchema>,
  normalize: NormalizeProps<T>,
): ColorSwatchPickerApi<T> {
  const { context, prop, send, scope } = service
  const value = context.get('value') ?? null
  const focusedValue = context.get('focusedValue') ?? null
  const groupDisabled = !!prop('disabled')
  const readOnly = !!prop('readOnly')
  const invalid = !!prop('invalid')
  const required = !!prop('required')
  const dir = prop('dir') ?? 'ltr'
  const name = prop('name')
  const label = resolveTranslations(prop('translations'))
  const ids = scope.ids('color-swatch-picker', 'label')

  // swatches 推出的格子元信息：名字与禁用都在这里定案，格子部件只报 value
  const swatches: ColorSwatchPickerNodeMeta[] = (prop('swatches') ?? []).map(node => ({
    value: node.value,
    label: node.label ?? node.value,
    disabled: !!node.disabled,
  }))
  const metaOf = new Map(swatches.map(meta => [meta.value, meta]))

  /** 格子禁用：部件上写的优先，没写就回 swatches 里查。 */
  const itemDisabled = (item: ColorSwatchPickerItemProps): boolean =>
    item.disabled ?? metaOf.get(item.value)?.disabled ?? false

  /** 格子的名字：部件上写的优先，其次 swatches，都没有就按文案念颜色串。 */
  const itemLabel = (item: ColorSwatchPickerItemProps): string => {
    const own = item.label ?? metaOf.get(item.value)?.label
    return own != null && own !== item.value ? own : label.swatch(item.value)
  }

  // 选中按颜色比而不是按串比：#f00 与 rgb(255,0,0) 是同一格；解析不出的串退回逐字比
  const isSelected = (candidate: string): boolean =>
    value !== null && (value === candidate || colorSameColor(value, candidate))

  // roving tabindex 锚点：焦点值优先，否则选中的那一格。
  // 选中值与格子的串可能是同色异写（rgb 写法的红对 #ff0000 那一格），所以锚点不能拿 value 逐字去比：
  // 渲染期没给 swatches 时格子的串只在渲染各格时才知道，按颜色逐格比；给了 swatches 就先在数据里
  // 定下那一格，同色异写的两格只让第一格认领 Tab 位。事件里则在活 DOM 上找那一格
  const claimsAnchor = (candidate: string): boolean => {
    if (focusedValue != null)
      return focusedValue === candidate
    if (value === null)
      return false
    if (swatches.length)
      return swatches.find(meta => isSelected(meta.value))?.value === candidate
    return isSelected(candidate)
  }
  const anchorIn = (items: readonly HTMLElement[]): string | null => {
    if (focusedValue != null)
      return focusedValue
    for (const el of items) {
      const candidate = itemValue(el)
      if (candidate != null && isSelected(candidate))
        return candidate
    }
    return null
  }

  const isDisabled = (item: ColorSwatchPickerItemProps): boolean => groupDisabled || itemDisabled(item)

  // 按压通道：真源是机器 context 里「正被按住的那一格」（按颜色串记），每格各自合成一份跟踪器；
  // Space 与触屏按住投影 data-pressed，指针按住由 :active 表出，皮肤两者同一档（形态④：换描边并缩放）。
  // 选中与按压互相独立；格子自身的禁用只有 connect 知道，随 PRESS.START 带给机器的守卫
  const pressedValue = context.get('pressedValue')
  const press = (item: ColorSwatchPickerItemProps): PressHandlers => createPressTracker({
    isPressed: () => context.get('pressedValue') === item.value,
    onChange: down => send(down
      ? { type: 'PRESS.START', value: item.value, disabled: isDisabled(item) }
      : { type: 'PRESS.END', value: item.value }),
  })

  // item / swatch / indicator / hidden-input 共用的状态标记
  const stateAttrs = (item: ColorSwatchPickerItemProps): Record<string, string | undefined> => ({
    'data-state': isSelected(item.value) ? 'checked' : 'unchecked',
    'data-disabled': dataAttr(isDisabled(item)),
    'data-readonly': dataAttr(readOnly),
    'data-invalid': dataAttr(invalid),
  })

  const select = (item: ColorSwatchPickerItemProps): void => {
    if (!isDisabled(item) && !readOnly)
      send({ type: 'ITEM.SELECT', value: item.value })
  }

  return {
    value,
    swatches,
    focusedValue,
    isSelected,
    setValue: next => send({ type: 'VALUE.SET', value: next }),
    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      'role': 'radiogroup',
      'aria-labelledby': ids.label,
      // 作者没放 label 部件时名字从文案取，两者同时在时以 label 部件为准
      'aria-label': label.group,
      'data-size': prop('size'),
      'data-tone': prop('tone'),
      'data-disabled': dataAttr(groupDisabled),
      // role=radiogroup 本身接受这三条，不必像 role=group 那样下放到格子
      'aria-readonly': readOnly ? 'true' : 'false',
      'aria-invalid': invalid ? 'true' : 'false',
      'aria-required': required ? 'true' : 'false',
      'data-readonly': dataAttr(readOnly),
      'data-invalid': dataAttr(invalid),
      'data-required': dataAttr(required),
      // 焦点在组外时容器可 Tab，进入后让位给格子。
      // 判据只能用 focusedValue：anchor 可能指向一个已不存在的值，那时没有格子认领 tabindex=0
      'tabindex': focusedValue == null ? 0 : -1,
      'onFocus': (e: FocusEvent) => {
        const container = e.currentTarget as HTMLElement
        // 只接管从组外进来的焦点
        if (contains(container, e.relatedTarget as Node | null))
          return
        // 落在锚点上：APG 要求焦点进组时落在已选中的那个，没有选中项才落第一个
        const items = queryItems(container, ITEM_QUERY)
        focusItem(anchorItem(items, anchorIn(items)) ?? navigateItems(items, null, 'first'))
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
        // 四个方向键都响应（格子常排成多行），不接 Home/End
        const intent = navIntentFromKey(e, { axis: 'both', dir, home: false })
        // 返回 null 表示该键不归导航管，此时绝不 preventDefault
        if (!intent)
          return
        e.preventDefault()
        const items = queryItems(e.currentTarget as HTMLElement, ITEM_QUERY)
        const target = navigateItems(items, anchorIn(items), intent, { loop: true })
        const next = itemValue(target)
        if (next == null)
          return
        // 方向键移动焦点的同时选中；只读时焦点照走，只是不落值
        focusItem(target)
        if (!readOnly)
          send({ type: 'ITEM.SELECT', value: next })
      },
    }),
    // 标题只随整组置灰：单格禁用是格子自己的事，标签不跟
    getLabelProps: () => normalize.element({
      ...parts.label.attrs,
      'id': ids.label,
      'data-disabled': dataAttr(groupDisabled),
    }),
    getItemProps: (item) => {
      const handlers = press(item)
      return normalize.element({
        ...parts.item.attrs,
        ...stateAttrs(item),
        'role': 'radio',
        // 未选中也显式输出 false：省略会让读屏无从区分"未选中"与"不是单选项"
        'aria-checked': isSelected(item.value) ? 'true' : 'false',
        // 用 aria-disabled 保持禁用格子可聚焦
        'aria-disabled': isDisabled(item) ? 'true' : 'false',
        // 格子上没有字，名字只能直给
        'aria-label': itemLabel(item),
        [ITEM_VALUE_ATTR]: item.value,
        // 锚点格子独占 Tab 序列位
        'tabindex': claimsAnchor(item.value) ? 0 : -1,
        // Space 与触屏按住投影 data-pressed，皮肤的按下面同时认它与指针 :active；与选中互相独立
        'data-pressed': dataAttr(pressedValue === item.value),
        'onClick': () => select(item),
        // 禁用格子被聚焦也记锚点
        'onFocus': () => send({ type: 'ITEM.FOCUS', value: item.value }),
        'onKeyDown': (e: KeyboardEvent) => {
          // role=radio 只有 Space 是激活键：Enter 在这里什么都不做，也就没有按压面可言
          if (e.key !== 'Enter')
            handlers.onKeyDown(e)
          // 禁用格子不认这个键，因此也不能吞掉它：Space 必须放行给页面滚动
          if (e.key !== ' ' || isDisabled(item))
            return
          e.preventDefault()
          select(item)
        },
        'onKeyUp': handlers.onKeyUp,
        'onBlur': handlers.onBlur,
        'onPointerDown': handlers.onPointerDown,
        'onPointerUp': handlers.onPointerUp,
        'onPointerCancel': handlers.onPointerCancel,
      })
    },
    // 色块面：棋盘格、描边与尺寸档由 Swatch 家族画，这里只投影颜色；解析不出的串不画颜色层
    getSwatchProps: item => normalize.element({
      ...parts.swatch.attrs,
      ...stateAttrs(item),
      'aria-hidden': true,
      'data-xh-swatch': '',
      'data-xh-swatch-size': prop('size'),
      'style': { '--xh-_swatch-color': (() => {
        const rgba = colorParse(item.value)
        return rgba ? colorCss(rgba) : ''
      })() },
    }),
    getIndicatorProps: item => normalize.element({
      ...parts.indicator.attrs,
      ...stateAttrs(item),
      'aria-hidden': true,
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
      'checked': isSelected(item.value),
      // 禁用时不提交值
      'disabled': isDisabled(item) || undefined,
      // inert 把这份输入从焦点与无障碍树里整个摘掉：格子那层是 role=radio，
      // 它的后代里不能留下可聚焦的控件（负 tabindex 与 aria-hidden 都拦不住读屏的虚拟光标）
      'inert': true,
      'tabindex': -1,
      'aria-hidden': true,
      'style': VISUALLY_HIDDEN_STYLE,
    }),
  }
}
