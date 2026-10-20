/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 设置对话框里只显示、不存值的条目的种类，快捷键表的分组与行，以及四款都有的按键。只放类型与常量、不引别的模块，
// 设置模型与对话框都从这里取。

/** 快捷键表里的一行：名字与按键；几组按键都能触发时依次列出（第二快捷键在后）。 */
export interface DesignerShortcutRow {
  readonly label: string
  readonly keys: readonly (readonly string[])[]
}

/** 快捷键表的一组：名字已按语言取好。 */
export interface DesignerShortcutTableGroup {
  readonly label: string
  readonly rows: readonly DesignerShortcutRow[]
}

/** 只显示、不存值的条目种类。 */
export type DesignerDisplayControl
  /** 几段说明文字，按段铺，只收纯文本。 */
  = | { readonly kind: 'note', readonly paragraphs: readonly string[] }
    /** 一颗钮：点了派发设置对话框的 settings-command，由设计器跑这条命令。 */
    | { readonly kind: 'action', readonly command: string, readonly text: string }
    /** 名字与值的几行，如版本。 */
    | { readonly kind: 'info', readonly rows: readonly { readonly label: string, readonly value: string }[] }
    /** 快捷键表：几组，每组若干行。 */
    | { readonly kind: 'shortcutTable', readonly groups: readonly DesignerShortcutTableGroup[] }

/** 只显示条目的种类名。 */
export const DESIGNER_DISPLAY_CONTROL_KINDS: readonly DesignerDisplayControl['kind'][] = ['note', 'action', 'info', 'shortcutTable']

/** 这条条目只显示、不存值。 */
export function isDesignerDisplayControl(control: { readonly kind: string }): control is DesignerDisplayControl {
  return (DESIGNER_DISPLAY_CONTROL_KINDS as readonly string[]).includes(control.kind)
}

/** 快捷键表的分组：designer-shell 内置的命令与四款共有的按键、各款共有的编辑命令、本设计器、扩展。 */
export type DesignerShortcutGroupId = 'common' | 'edit' | 'designer' | 'extensions'

/** 交给设置对话框 shortcuts 的一组：名字由对话框按语言取。 */
export interface DesignerShortcutGroup {
  readonly id: DesignerShortcutGroupId
  readonly rows: readonly DesignerShortcutRow[]
}

/** DESIGNER_COMMON_KEYS 里的 id：这几种的名字由设置对话框按语言取。 */
export type DesignerCommonKeyId = 'nudge' | 'nudgeLarge' | 'pan' | 'menubar' | 'selectionToolbar' | 'cancel'

/**
 * 快捷键表「通用」组末尾的一行按键。id 是 DESIGNER_COMMON_KEYS 里的几种时可以不写名字，由设置对话框按语言取；
 * 写了 label（已按语言取好）就用它，各款改写某一行的说明时用；另加的行必须写 label。
 */
export type DesignerCommonKey
  = | { readonly id: DesignerCommonKeyId, readonly keys: readonly (readonly string[])[], readonly label?: string }
    | { readonly id: string, readonly keys: readonly (readonly string[])[], readonly label: string }

/** 快捷键页要的数据。 */
export interface DesignerShortcutsSource {
  readonly groups: readonly DesignerShortcutGroup[]
  /** 「通用」组末尾的那几行；不给时是 DESIGNER_COMMON_KEYS。 */
  readonly commonKeys?: readonly DesignerCommonKey[]
}

/**
 * 四款都有、不是命令的按键；名字由设置对话框按语言取。快捷键页缺省把它们接在「通用」组末尾，
 * 各款有不适用或说法不同的，在它的基础上过滤、改写后经 shortcutSettingsSource 的 commonKeys 交进去。
 */
export const DESIGNER_COMMON_KEYS = [
  { id: 'nudge', keys: [['ArrowUp'], ['ArrowDown'], ['ArrowLeft'], ['ArrowRight']] },
  { id: 'nudgeLarge', keys: [['Shift', 'ArrowUp'], ['Shift', 'ArrowDown'], ['Shift', 'ArrowLeft'], ['Shift', 'ArrowRight']] },
  { id: 'pan', keys: [['Space']] },
  { id: 'menubar', keys: [['F10']] },
  { id: 'selectionToolbar', keys: [['Alt', 'F10']] },
  { id: 'cancel', keys: [['Escape']] },
] as const satisfies readonly { readonly id: DesignerCommonKeyId, readonly keys: readonly (readonly string[])[] }[]

/** 四款共有的编辑命令，快捷键表里归「编辑」。 */
export const DESIGNER_EDIT_COMMANDS: readonly string[] = ['undo', 'redo', 'cut', 'copy', 'paste', 'delete', 'duplicate', 'select-all']
