/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 grid list 相关实现。

import type { NavIntent, NormalizeProps, PressHandlers, PropTypes, Service } from '@xihan-ui/core'
import type { GridListApi, GridListNodeMeta, GridListRowProps, GridListSchema } from './grid-list.types'
import {
  contains,
  createPressTracker,
  dataAttr,
  focusItem,
  indexOfValue,
  isItemDisabled,
  ITEM_VALUE_ATTR,
  itemValue,
  matchTypeahead,
  navigateItems,
  navIntentFromKey,
  queryItems,
} from '@xihan-ui/core'
import { gridListAnatomy, gridListRowQuery, gridListRowText } from './grid-list.anatomy'

const parts = gridListAnatomy.build()
const INTERACTIVE = 'button, a[href], input, select, textarea, [contenteditable], [role="button"], [role="checkbox"], [role="link"]'

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
  const loop = prop('loop') ?? true
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

  const rows = (root: HTMLElement): HTMLElement[] =>
    queryItems(root, gridListRowQuery).filter(row => row.closest('[hidden]') == null)

  const focusValue = (row: HTMLElement | null): string | null => {
    const next = itemValue(row)
    if (next == null)
      return null
    focusItem(row)
    send({ type: 'ROW.FOCUS', value: next })
    return next
  }

  const focusBy = (root: HTMLElement, intent: NavIntent): string | null =>
    focusValue(navigateItems(rows(root), anchor, intent, { loop }))

  const focusMatch = (root: HTMLElement, query: string): void => {
    const list = rows(root)
    focusValue(matchTypeahead(list, indexOfValue(list, anchor), query, {
      text: gridListRowText,
      skip: isItemDisabled,
    }))
  }

  const commitSelection = (rowValue: string): void => {
    if (!editable || !selectable || metaOf.get(rowValue)?.disabled)
      return
    send(selectionMode === 'multiple'
      ? { type: 'ROW.TOGGLE', value: rowValue }
      : { type: 'ROW.SELECT', value: rowValue })
  }

  /**
   * Shift 扩选：从锚点到这一行那一段并进扩选开始前的选中集，只在多选下生效。
   * 全序取当下可见的行（有 collection 时取数据序），禁用行占着位置但不被收进去。
   */
  const extendTo = (root: HTMLElement, rowValue: string): void => {
    if (!editable || selectionMode !== 'multiple')
      return
    const items = collection.length
      ? collection.map(item => item.value)
      : rows(root).map(itemValue).filter((item): item is string => item != null)
    const off = collection.length
      ? collection.filter(item => item.disabled).map(item => item.value)
      : rows(root).filter(row => isItemDisabled(row)).map(itemValue).filter((item): item is string => item != null)
    send({ type: 'ROW.EXTEND', value: rowValue, items, disabled: off })
  }

  const selectAll = (root: HTMLElement): void => {
    if (!editable || selectionMode !== 'multiple')
      return
    const available = collection.length
      ? collection.filter(item => !item.disabled).map(item => item.value)
      : rows(root).filter(row => !isItemDisabled(row)).map(itemValue).filter((item): item is string => item != null)
    const all = available.length > 0 && available.every(item => value.includes(item))
    send({ type: 'VALUE.SET', value: all ? value.filter(item => !available.includes(item)) : [...new Set([...value, ...available])] })
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
        if (disabled)
          return
        const root = event.currentTarget as HTMLElement
        const target = event.target as HTMLElement
        const row = target.closest<HTMLElement>(parts.row.selector)
        if (row && target !== row && target.closest(INTERACTIVE))
          return
        const rowValue = itemValue(row) ?? focusedValue
        const command = event.ctrlKey || event.metaKey
        if (command && !event.altKey && (event.key === 'a' || event.key === 'A')) {
          if (selectionMode !== 'multiple')
            return
          event.preventDefault()
          if (!event.repeat)
            selectAll(root)
          return
        }
        const intent = command || event.altKey ? null : navIntentFromKey(event.key, { axis: 'vertical', dir: prop('dir') ?? 'ltr' })
        if (intent) {
          event.preventDefault()
          const next = focusBy(root, intent)
          // Shift + 方向键 / Home / End：焦点照常移动，锚点到新焦点行那一段并进选中
          if (next != null && event.shiftKey)
            extendTo(root, next)
          return
        }
        if (event.key === 'Enter' && rowValue != null) {
          event.preventDefault()
          if (event.repeat)
            return
          if (prop('onAction'))
            send({ type: 'ROW.ACTION', value: rowValue })
          else
            commitSelection(rowValue)
          return
        }
        const query = (prop('typeahead') ?? true) && !command && !event.altKey
          ? refs.get('typeahead').push(event.key)
          : null
        if (query != null) {
          event.preventDefault()
          focusMatch(root, query)
          return
        }
        if (event.key === ' ' && rowValue != null) {
          event.preventDefault()
          if (event.repeat)
            return
          // Shift + Space：锚点到焦点行那一段并进选中（只在多选下；单选照常选中这一行）
          if (event.shiftKey && selectionMode === 'multiple')
            extendTo(root, rowValue)
          else
            commitSelection(rowValue)
        }
      },
      'onFocus': (event: FocusEvent) => {
        const root = event.currentTarget as HTMLElement
        if (event.target !== root || contains(root, event.relatedTarget as Node | null))
          return
        const list = rows(root)
        const selected = list.find((row) => {
          const rowValue = itemValue(row)
          return rowValue != null && isSelected(rowValue) && !isItemDisabled(row)
        })
        focusItem(selected ?? navigateItems(list, null, 'first'))
      },
      'onFocusOut': (event: FocusEvent) => {
        const root = event.currentTarget as HTMLElement
        if (!contains(root, event.relatedTarget as Node | null))
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
          const target = event.target as HTMLElement
          if (off || target.closest(INTERACTIVE))
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

    getRowSelectionIndicatorProps: row => normalize.element({
      ...parts['row-selection-indicator'].attrs,
      ...stateAttrs(row),
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
