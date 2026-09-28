/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 grid list 相关实现。

import type { NormalizeProps, PressHandlers, PropTypes, Service } from '@xihan-ui/core'
import type { GridListApi, GridListNodeMeta, GridListRowProps, GridListSchema } from './grid-list.types'
import { createPressTracker, dataAttr, isComposingEvent, ITEM_VALUE_ATTR, queryItems } from '@xihan-ui/core'
import { isEditableTarget } from '../shared/editable-target'
import { createGridCollection, fromInlineControl, readGridKey } from '../shared/grid-collection'
import { gridListAnatomy, gridListRowQuery, gridListRowText } from './grid-list.anatomy'

const parts = gridListAnatomy.build()

export function connectGridList<T extends PropTypes>(
  service: Service<GridListSchema>,
  normalize: NormalizeProps<T>,
): GridListApi<T> {
  const { context, prop, refs, scope, send } = service
  const value = context.get('value')
  const focusedValue = context.get('focusedValue')
  const selectionMode = prop('selectionMode') ?? 'single'
  const disabled = !!prop('disabled')
  const readOnly = !!prop('readOnly')
  const invalid = !!prop('invalid')
  const loading = !!prop('loading')
  const editable = !disabled && !readOnly && !loading
  const selectable = selectionMode !== 'none'
  const counted = prop('collection') != null
  const ids = scope.ids('grid-list', 'label')
  const anchor = focusedValue ?? value[0] ?? null

  const collection: GridListNodeMeta[] = (prop('collection') ?? []).map(node => ({
    value: node.value,
    label: node.label ?? node.value,
    description: node.description ?? null,
    disabled: !!node.disabled,
    tone: node.tone ?? null,
  }))
  const metaOf = new Map(collection.map(item => [item.value, item]))
  const isSelected = (rowValue: string): boolean => value.includes(rowValue)
  const isDisabled = (row: GridListRowProps): boolean =>
    disabled || (row.disabled ?? metaOf.get(row.value)?.disabled ?? false)
  const stateAttrs = (row: GridListRowProps): Record<string, string | undefined> => ({
    'data-state': isSelected(row.value) ? 'checked' : 'unchecked',
    'data-disabled': dataAttr(isDisabled(row)),
    'data-highlighted': dataAttr(focusedValue === row.value),
  })

  // 全选与范围选的全序：给了数据按数据序（禁用行占着位置但不被收进去），手写的行按当下可见的行
  const grid = createGridCollection({
    items: root => queryItems(root, gridListRowQuery).filter(row => row.closest('[hidden]') == null),
    text: gridListRowText,
    anchor,
    loop: prop('loop') ?? true,
    isSelected,
    onFocus: next => send({ type: 'ROW.FOCUS', value: next }),
    order: collection.length
      ? { items: collection.map(item => item.value), isDisabled: item => !!metaOf.get(item)?.disabled }
      : null,
  })

  const commitSelection = (rowValue: string): void => {
    if (!editable || !selectable || metaOf.get(rowValue)?.disabled)
      return
    send(selectionMode === 'multiple'
      ? { type: 'ROW.TOGGLE', value: rowValue }
      : { type: 'ROW.SELECT', value: rowValue })
  }

  /** Shift 扩选：从锚点到这一行那一段并进扩选开始前的选中集，只在多选下生效。 */
  const extendTo = (root: HTMLElement, rowValue: string): void => {
    if (!editable || selectionMode !== 'multiple')
      return
    const order = grid.order(root)
    send({ type: 'ROW.EXTEND', value: rowValue, items: [...order.items], disabled: order.items.filter(item => order.isDisabled?.(item)) })
  }

  const pressedValue = context.get('pressedValue')
  const press = (row: GridListRowProps): PressHandlers => createPressTracker({
    isPressed: () => context.get('pressedValue') === row.value,
    onChange: down => send(down
      ? { type: 'PRESS.START', value: row.value, disabled: isDisabled(row) }
      : { type: 'PRESS.END', value: row.value }),
  })

  return {
    value,
    collection,
    selectionMode,
    focusedValue,
    disabled,
    readOnly,
    invalid,
    loading,
    isSelected,
    setValue: next => send({ type: 'VALUE.SET', value: next }),
    select: rowValue => send({ type: 'ROW.SELECT', value: rowValue }),
    toggle: rowValue => send({ type: 'ROW.TOGGLE', value: rowValue }),
    action: rowValue => send({ type: 'ROW.ACTION', value: rowValue }),

    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      'role': 'grid',
      'aria-label': prop('translations')?.root ?? 'Items',
      'aria-labelledby': ids.label,
      'aria-multiselectable': selectionMode === 'multiple' ? 'true' : undefined,
      'aria-disabled': disabled ? 'true' : 'false',
      'aria-readonly': readOnly ? 'true' : 'false',
      'aria-invalid': invalid ? 'true' : 'false',
      'aria-busy': loading ? 'true' : undefined,
      'tabindex': !counted || collection.length > 0 ? (focusedValue == null ? 0 : -1) : undefined,
      'data-variant': prop('variant') ?? 'outline',
      'data-tone': prop('tone'),
      'data-size': prop('size'),
      'data-disabled': dataAttr(disabled),
      'data-readonly': dataAttr(readOnly),
      'data-invalid': dataAttr(invalid),
      'data-loading': dataAttr(loading),
      'onKeyDown': (event: KeyboardEvent) => {
        // 输入法组合中的按键归候选框；落在可编辑控件上的按键归那个控件——行外的也算
        // （空态、加载态里作者放的输入框同在 grid 之内），不放行的话打字会被连打检索吃掉，
        // 确认候选的那一下 Enter 会触发焦点行的主操作
        if (disabled || isComposingEvent(event) || isEditableTarget(event.target))
          return
        const root = event.currentTarget as HTMLElement
        const row = (event.target as HTMLElement).closest<HTMLElement>(parts.row.selector)
        // 行内按钮的 Enter / Space 交给按钮自己
        if (fromInlineControl(event.target, row))
          return
        const key = readGridKey(event, {
          axis: 'vertical',
          dir: prop('dir') ?? 'ltr',
          typeahead: (prop('typeahead') ?? true) ? refs.get('typeahead') : null,
        })
        const rowValue = row?.getAttribute(ITEM_VALUE_ATTR) ?? focusedValue
        switch (key?.kind) {
          case 'select-all': {
            if (selectionMode !== 'multiple')
              return
            event.preventDefault()
            if (!event.repeat && editable)
              send({ type: 'VALUE.SET', value: grid.selectAll(root, value) })
            return
          }
          case 'navigate': {
            event.preventDefault()
            const next = grid.focusBy(root, key.intent)
            // Shift + 方向键 / Home / End：焦点照常移动，锚点到新焦点行那一段并进选中
            if (next != null && key.extend)
              extendTo(root, next)
            return
          }
          case 'enter': {
            if (rowValue == null)
              return
            event.preventDefault()
            if (event.repeat)
              return
            if (prop('onAction'))
              send({ type: 'ROW.ACTION', value: rowValue })
            else
              commitSelection(rowValue)
            return
          }
          case 'typeahead': {
            event.preventDefault()
            grid.focusMatch(root, key.query)
            return
          }
          case 'space': {
            if (rowValue == null)
              return
            event.preventDefault()
            if (event.repeat)
              return
            // Shift + Space：锚点到焦点行那一段并进选中（只在多选下；单选照常选中这一行）
            if (key.extend && selectionMode === 'multiple')
              extendTo(root, rowValue)
            else
              commitSelection(rowValue)
          }
        }
      },
      'onFocus': (event: FocusEvent) => grid.enter(event),
      'onFocusOut': (event: FocusEvent) => {
        if (grid.leaves(event))
          send({ type: 'GRID.BLUR' })
      },
    }),

    getLabelProps: () => normalize.element({
      ...parts.label.attrs,
      'id': ids.label,
      'data-disabled': dataAttr(disabled),
    }),

    getRowProps: (row) => {
      const handlers = press(row)
      const off = isDisabled(row)
      return normalize.element({
        ...parts.row.attrs,
        ...stateAttrs(row),
        'data-xh-collection-item': '',
        'data-xh-collection-context': 'page',
        'data-xh-collection-size': prop('size') ?? 'md',
        'data-tone': metaOf.get(row.value)?.tone ?? undefined,
        [ITEM_VALUE_ATTR]: row.value,
        'role': 'row',
        'aria-selected': selectable ? (isSelected(row.value) ? 'true' : 'false') : undefined,
        'aria-disabled': off ? 'true' : 'false',
        'tabindex': anchor === row.value ? 0 : -1,
        'data-pressed': dataAttr(pressedValue === row.value),
        'onClick': (event: MouseEvent) => {
          if (off || fromInlineControl(event.target, event.currentTarget as HTMLElement))
            return
          if (selectionMode === 'none') {
            send({ type: 'ROW.ACTION', value: row.value })
            return
          }
          // Shift + 点击：锚点到这一行那一段并进选中（只在多选下）
          const root = event.shiftKey && selectionMode === 'multiple'
            ? (event.currentTarget as HTMLElement).closest<HTMLElement>(parts.root.selector)
            : null
          if (root) {
            extendTo(root, row.value)
            return
          }
          commitSelection(row.value)
        },
        'onFocus': (event: FocusEvent) => {
          if (event.target === event.currentTarget)
            send({ type: 'ROW.FOCUS', value: row.value })
        },
        'onKeyDown': (event: KeyboardEvent) => {
          if (event.target === event.currentTarget)
            handlers.onKeyDown(event)
        },
        'onKeyUp': handlers.onKeyUp,
        'onBlur': handlers.onBlur,
        'onPointerDown': handlers.onPointerDown,
        'onPointerUp': handlers.onPointerUp,
        'onPointerCancel': handlers.onPointerCancel,
      })
    },

    // 行首方框里的勾归勾选标记配方：与 Checkbox、Transfer、Table 同一副标记语言
    getRowSelectionIndicatorProps: row => normalize.element({
      ...parts['row-selection-indicator'].attrs,
      ...stateAttrs(row),
      'data-xh-check-mark': isSelected(row.value) ? 'checked' : 'unchecked',
      'data-xh-check-mark-profile': 'box',
      'data-xh-collection-slot': 'prefix',
      'aria-hidden': true,
      'hidden': !selectable || undefined,
    }),
    getRowContentProps: row => normalize.element({
      ...parts['row-content'].attrs,
      ...stateAttrs(row),
      role: 'gridcell',
    }),
    getRowTextProps: row => normalize.element({
      ...parts['row-text'].attrs,
      ...stateAttrs(row),
      'data-xh-collection-slot': 'text',
    }),
    getRowDescriptionProps: row => normalize.element({
      ...parts['row-description'].attrs,
      ...stateAttrs(row),
      'data-xh-collection-slot': 'description',
    }),
    getRowActionsProps: row => normalize.element({
      ...parts['row-actions'].attrs,
      ...stateAttrs(row),
      role: 'gridcell',
    }),
    getRowActionProps: row => normalize.button({
      ...parts['row-action'].attrs,
      ...stateAttrs(row),
      'type': 'button',
      'disabled': isDisabled(row) || undefined,
      'data-xh-action-control': '',
      'data-xh-action-profile': 'text',
      'data-xh-action-variant': 'ghost',
      'data-xh-action-display': 'always',
      'data-xh-action-size': 'xs',
    }),
    getEmptyProps: () => normalize.element({
      ...parts.empty.attrs,
      hidden: counted ? (loading || collection.length > 0) || undefined : loading || undefined,
    }),
    getLoadingProps: () => normalize.element({
      ...parts.loading.attrs,
      hidden: counted ? (!loading || collection.length > 0) || undefined : !loading || undefined,
    }),
  }
}
