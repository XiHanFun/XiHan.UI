/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 grid list 相关实现。

import type { ControlVariant, Direction, Size, Tone } from '@xihan-ui/core'
import type { GridListNode, GridListSchema, GridListSelectionMode, GridListTranslations } from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import { useMemo } from 'react'
import { withXhConfig } from '../../config/config'
import { mergeReactProps } from '../../runtime/merge-props'
import { useNativeEvents } from '../../runtime/native-events'
import { GridListProvider, GridListRowProvider, useGridListContext, useGridListRow } from './context'
import { useGridList } from './use-grid-list'

type GridListProps = GridListSchema['props']

export interface XhGridListRootProps extends Omit<ComponentPropsWithRef<'div'>, 'children' | 'dir' | 'defaultValue' | 'onChange'> {
  collection?: GridListNode[]
  value?: string | string[]
  defaultValue?: string | string[]
  selectionMode?: GridListSelectionMode
  disabled?: boolean
  readOnly?: boolean
  invalid?: boolean
  loading?: boolean
  loop?: boolean
  typeahead?: boolean
  dir?: Direction
  variant?: ControlVariant
  tone?: Tone
  size?: Size
  translations?: Partial<GridListTranslations>
  onValueChange?: GridListProps['onValueChange']
  onAction?: GridListProps['onAction']
  children?: ReactNode
}

export function XhGridListRoot({
  collection,
  value,
  defaultValue,
  selectionMode,
  disabled,
  readOnly,
  invalid,
  loading,
  loop,
  typeahead,
  dir,
  variant,
  tone,
  size,
  translations,
  onValueChange,
  onAction,
  children,
  ...rest
}: XhGridListRootProps): ReactNode {
  const context = useGridList(withXhConfig('grid-list', {
    collection,
    value,
    defaultValue,
    selectionMode,
    disabled,
    readOnly,
    invalid,
    loading,
    loop,
    typeahead,
    dir,
    variant,
    tone,
    size,
    translations,
    onValueChange,
    onAction,
  }) as GridListProps)
  const api = context.api
  const bind = useNativeEvents(api.getRootProps() as Record<string, unknown>, ['onFocus'])
  return (
    <GridListProvider value={context}>
      <div {...mergeReactProps(bind.attrs, rest as Record<string, unknown>, { ref: bind.ref })}>
        {children}
      </div>
    </GridListProvider>
  )
}

XhGridListRoot.xhEvents = ['value-change', 'action'] as const

export interface XhGridListLabelProps extends ComponentPropsWithRef<'span'> {}
export function XhGridListLabel({ children, ...rest }: XhGridListLabelProps): ReactNode {
  const { api } = useGridListContext()
  return <span {...mergeReactProps(api.getLabelProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</span>
}

export interface XhGridListRowProps extends Omit<ComponentPropsWithRef<'div'>, 'value'> {
  value: string
  disabled?: boolean
}
export function XhGridListRow({ value, disabled, children, ...rest }: XhGridListRowProps): ReactNode {
  const { api } = useGridListContext()
  const row = useMemo(() => ({ value, disabled }), [value, disabled])
  const bind = useNativeEvents(api.getRowProps(row) as Record<string, unknown>, ['onFocus'])
  return (
    <GridListRowProvider value={row}>
      <div {...mergeReactProps(bind.attrs, rest as Record<string, unknown>, { ref: bind.ref })}>{children}</div>
    </GridListRowProvider>
  )
}

function RowSelectionIndicator({ children, ...rest }: ComponentPropsWithRef<'span'>): ReactNode {
  const { api } = useGridListContext()
  const row = useGridListRow()
  return <span {...mergeReactProps(api.getRowSelectionIndicatorProps(row) as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</span>
}
export const XhGridListRowSelectionIndicator = RowSelectionIndicator

function rowPart(
  getter: 'getRowContentProps' | 'getRowTextProps' | 'getRowDescriptionProps' | 'getRowActionsProps',
  props: ComponentPropsWithRef<'div'>,
): ReactNode {
  const { api } = useGridListContext()
  const row = useGridListRow()
  const { children, ...rest } = props
  return <div {...mergeReactProps(api[getter](row) as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</div>
}

export interface XhGridListRowPartProps extends ComponentPropsWithRef<'div'> {}
export function XhGridListRowContent(props: XhGridListRowPartProps): ReactNode {
  return rowPart('getRowContentProps', props)
}
export function XhGridListRowText(props: XhGridListRowPartProps): ReactNode {
  return rowPart('getRowTextProps', props)
}
export function XhGridListRowDescription(props: XhGridListRowPartProps): ReactNode {
  return rowPart('getRowDescriptionProps', props)
}
export function XhGridListRowActions(props: XhGridListRowPartProps): ReactNode {
  return rowPart('getRowActionsProps', props)
}

export interface XhGridListRowActionProps extends ComponentPropsWithRef<'button'> {}
export function XhGridListRowAction({ children, ...rest }: XhGridListRowActionProps): ReactNode {
  const { api } = useGridListContext()
  const row = useGridListRow()
  return <button {...mergeReactProps(api.getRowActionProps(row) as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</button>
}

export interface XhGridListEmptyProps extends ComponentPropsWithRef<'div'> {}
export function XhGridListEmpty({ children, ...rest }: XhGridListEmptyProps): ReactNode {
  const { api } = useGridListContext()
  return <div {...mergeReactProps(api.getEmptyProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</div>
}

export interface XhGridListLoadingProps extends ComponentPropsWithRef<'div'> {}
export function XhGridListLoading({ children, ...rest }: XhGridListLoadingProps): ReactNode {
  const { api } = useGridListContext()
  return <div {...mergeReactProps(api.getLoadingProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</div>
}
