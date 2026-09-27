/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 grid list 类型契约。

import type { ControlVariant, Direction, MachineSchema, PropTypes, Size, Tone, Typeahead } from '@xihan-ui/core'

export type GridListSelectionMode = 'none' | 'single' | 'multiple'

export interface GridListValueChangeDetails {
  value: string[]
}

export interface GridListActionDetails {
  value: string
}

export interface GridListNode {
  value: string
  label?: string
  description?: string
  disabled?: boolean
  tone?: Tone
}

export interface GridListNodeMeta {
  value: string
  label: string
  description: string | null
  disabled: boolean
  tone: Tone | null
}

export interface GridListRowProps {
  value: string
  disabled?: boolean
}

export interface GridListTranslations {
  /** 没有可见标题时作为 grid 的可及名。 */
  root: string
}

export interface GridListSchema extends MachineSchema {
  props: {
    collection?: GridListNode[]
    value?: string | string[]
    defaultValue?: string | string[]
    /** none 只保留行主操作与行内按钮；single / multiple 开启选择。默认 single。 */
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
    onValueChange?: (details: GridListValueChangeDetails) => void
    /** Enter 或 selectionMode=none 时点击行触发；行内按钮保留自己的原生事件。 */
    onAction?: (details: GridListActionDetails) => void
  }
  context: {
    value: string[]
    focusedValue: string | null
    pressedValue: string | null
  }
  computed: Record<string, never>
  refs: { typeahead: Typeahead }
  state: 'idle'
  event:
    | { type: 'VALUE.SET', value: string[] }
    | { type: 'ROW.SELECT', value: string }
    | { type: 'ROW.TOGGLE', value: string }
    | { type: 'ROW.ACTION', value: string }
    | { type: 'ROW.FOCUS', value: string }
    | { type: 'GRID.BLUR' }
    | { type: 'PRESS.START', value: string, disabled?: boolean }
    | { type: 'PRESS.END', value: string }
  tag: never
  guard: 'canPress'
  action: 'setValue' | 'selectRow' | 'toggleRow' | 'invokeAction' | 'setFocusedValue' | 'clearFocus' | 'startPress' | 'endPress' | 'releaseWhenInert'
  effect: never
}

export interface GridListApi<T extends PropTypes = PropTypes> {
  value: string[]
  collection: readonly GridListNodeMeta[]
  selectionMode: GridListSelectionMode
  focusedValue: string | null
  disabled: boolean
  readOnly: boolean
  invalid: boolean
  loading: boolean
  isSelected: (value: string) => boolean
  setValue: (next: string[]) => void
  select: (value: string) => void
  toggle: (value: string) => void
  action: (value: string) => void
  getRootProps: () => T['element']
  getLabelProps: () => T['element']
  getRowProps: (props: GridListRowProps) => T['element']
  getRowSelectionIndicatorProps: (props: GridListRowProps) => T['element']
  getRowContentProps: (props: GridListRowProps) => T['element']
  getRowTextProps: (props: GridListRowProps) => T['element']
  getRowDescriptionProps: (props: GridListRowProps) => T['element']
  getRowActionsProps: (props: GridListRowProps) => T['element']
  getRowActionProps: (props: GridListRowProps) => T['button']
  getEmptyProps: () => T['element']
  getLoadingProps: () => T['element']
}
