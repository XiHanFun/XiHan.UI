/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 设置对话框里只显示、不存值的条目：几段说明、一颗跑命令的钮、名字与值的几行、快捷键表。帮助、快捷键与关于三页
// 由它们组成，各款与扩展的分区也能用。这几种条目没有缺省值，编辑器不写设置，resolveSettings 里也不出现。

import type { DesignerCommandTable } from '../extensions/commands'
import type { DesignerDisplayControl, DesignerShortcutGroupId, DesignerShortcutRow, DesignerShortcutsSource } from './display-model'
import { commandShortcuts } from '@xihan-ui/designer-kit'
import { createAuthoredElement, setText } from '@xihan-ui/web-components/authoring'
import { DESIGNER_SHELL_COMMANDS } from '../extensions/builtin-commands'
import { commandLabel } from '../extensions/commands'
import { DESIGNER_EDIT_COMMANDS } from './display-model'

/** shortcutSettingsSource 的选项。 */
export interface DesignerShortcutsSourceOptions {
  /** 扩展登记的命令 id：这些归「扩展」。 */
  readonly extensionCommands?: Iterable<string>
  /** 本设计器不是命令的按键（名字已按语言取好），排在「本设计器」那一组末尾。 */
  readonly keys?: readonly DesignerShortcutRow[]
}

/**
 * 从命令表现算快捷键页要的数据：凡有快捷键的命令一行（名字按此刻的上下文取，第二快捷键写在同一行）。designer-shell 内置的
 * 命令归「通用」，四款共有的编辑命令（DESIGNER_EDIT_COMMANDS）归「编辑」，扩展的归「扩展」，其余归「本设计器」。
 * 四款都有的按键（DESIGNER_COMMON_KEYS）由设置对话框补进「通用」。各款每轮更新时交给设置对话框的 shortcuts。
 */
export function shortcutSettingsSource<Ctx>(commands: DesignerCommandTable<Ctx>, context: Ctx, options: DesignerShortcutsSourceOptions = {}): DesignerShortcutsSource {
  const shell = new Set<string>(Object.values(DESIGNER_SHELL_COMMANDS))
  const edit = new Set(DESIGNER_EDIT_COMMANDS)
  const extensions = new Set(options.extensionCommands ?? [])
  const rows: Record<DesignerShortcutGroupId, DesignerShortcutRow[]> = { common: [], edit: [], designer: [], extensions: [] }
  for (const command of commands.values()) {
    const keys = commandShortcuts(command)
    if (keys.length === 0)
      continue
    const group: DesignerShortcutGroupId = extensions.has(command.id) ? 'extensions' : shell.has(command.id) ? 'common' : edit.has(command.id) ? 'edit' : 'designer'
    rows[group].push({ label: commandLabel(command, context), keys })
  }
  rows.designer.push(...options.keys ?? [])
  return { groups: (['common', 'edit', 'designer', 'extensions'] as const).filter(id => rows[id].length > 0).map(id => ({ id, rows: rows[id] })) }
}

/** 一条只显示条目铺成的节点；action 的钮点了调 run。 */
export function createDisplayContent(doc: Document, control: DesignerDisplayControl, run: (command: string) => void): HTMLElement {
  const SCOPE = 'designer-settings'
  if (control.kind === 'note') {
    return createAuthoredElement(doc, 'div', { 'data-scope': SCOPE, 'data-part': 'note' }, control.paragraphs.map(text => createAuthoredElement(doc, 'div', { 'data-scope': SCOPE, 'data-part': 'note-paragraph' }, [text])))
  }
  if (control.kind === 'action') {
    const text = createAuthoredElement(doc, 'span', {})
    setText(text, control.text)
    const button = createAuthoredElement(doc, 'xh-button', { 'variant': 'outline', 'size': 'sm', 'data-scope': SCOPE, 'data-part': 'action', 'data-command': control.command }, [
      createAuthoredElement(doc, 'button', { 'data-xh-part': 'root', 'type': 'button' }, [text]),
    ])
    button.addEventListener('click', () => {
      if (!(button as HTMLElement & { disabled?: boolean }).disabled)
        run(control.command)
    })
    return button
  }
  if (control.kind === 'info') {
    return createAuthoredElement(doc, 'div', { 'data-scope': SCOPE, 'data-part': 'info' }, control.rows.map(row => createAuthoredElement(doc, 'div', { 'data-scope': SCOPE, 'data-part': 'info-row' }, [
      createAuthoredElement(doc, 'span', { 'data-scope': SCOPE, 'data-part': 'info-label' }, [row.label]),
      createAuthoredElement(doc, 'span', { 'data-scope': SCOPE, 'data-part': 'info-value' }, [row.value]),
    ])))
  }
  return createAuthoredElement(doc, 'div', { 'data-scope': SCOPE, 'data-part': 'shortcuts' }, control.groups.map(group => createAuthoredElement(doc, 'div', { 'role': 'group', 'aria-label': group.label, 'data-scope': SCOPE, 'data-part': 'shortcut-group' }, [
    createAuthoredElement(doc, 'div', { 'data-scope': SCOPE, 'data-part': 'shortcut-group-title', 'aria-hidden': 'true' }, [group.label]),
    ...group.rows.map(row => createAuthoredElement(doc, 'div', { 'data-scope': SCOPE, 'data-part': 'shortcut-row' }, [
      createAuthoredElement(doc, 'span', { 'data-scope': SCOPE, 'data-part': 'shortcut-label' }, [row.label]),
      createAuthoredElement(doc, 'span', { 'data-scope': SCOPE, 'data-part': 'shortcut-keys' }, row.keys.map(keys => createAuthoredElement(doc, 'xh-kbd', { keys: keys.join(',') }, [
        createAuthoredElement(doc, 'kbd', { 'data-xh-part': 'root' }),
      ]))),
    ])),
  ])))
}
