/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 命令的排列与呈现：按 commandLayout 或缺省排列分组，铺成 <xh-toolbar> 的按钮与 <xh-context-menu> 的条目，
// 点击或选中时执行对应命令。内置命令与扩展命令同一条路。

import type { DesignerCommand, DesignerCommandPlacement } from '@xihan-ui/designer-kit'
import { formatShortcut } from '@xihan-ui/designer-kit'
import { createAuthoredElement, setText } from '@xihan-ui/web-components/authoring'
import { defineCommandElements } from '../internal/ui-elements'

/** 各位置的命令排列：位置 → 若干组命令 id。写了某个位置就只显示列出的命令。 */
export type DesignerCommandLayout = Readonly<Partial<Record<DesignerCommandPlacement, readonly (readonly string[])[]>>>

/** 命令表：命令 id → 命令，内置在前、扩展按登记顺序在后。 */
export type DesignerCommandTable<Ctx> = ReadonlyMap<string, DesignerCommand<Ctx>>

/**
 * 排出某个位置的命令分组。layout 写了这个位置就用它；否则用 defaults（各款内置的缺省排列），
 * 再把 placement 含这个位置、又不在缺省排列里的命令按登记顺序追加成一组。空组去掉。
 * 排列里出现命令表里没有的 id 时抛 TypeError：写错的 id 不会静默消失。
 */
export function arrangeCommands<Ctx>(
  placement: DesignerCommandPlacement,
  commands: DesignerCommandTable<Ctx>,
  defaults: readonly (readonly string[])[],
  layout?: DesignerCommandLayout,
): string[][] {
  const custom = layout?.[placement]
  const groups = (custom ?? defaults).map(group => [...group])
  for (const id of groups.flat()) {
    if (!commands.has(id))
      throw new TypeError(`[xh] 命令排列 ${placement} 里的 ${id} 不是登记过的命令`)
  }
  if (custom === undefined) {
    const listed = new Set(groups.flat())
    groups.push([...commands.values()].filter(command => command.placement?.includes(placement) && !listed.has(command.id)).map(command => command.id))
  }
  return groups.filter(group => group.length > 0)
}

/** 命令的文字。 */
export function commandLabel<Ctx>(command: DesignerCommand<Ctx>, context: Ctx): string {
  return typeof command.label === 'function' ? command.label(context) : command.label
}

/** 命令此刻能否执行。 */
export function commandEnabled<Ctx>(command: DesignerCommand<Ctx>, context: Ctx): boolean {
  return command.enabled?.(context) ?? true
}

/** 执行一条命令：命令存在且此刻可用才执行，返回是否执行了。 */
export function runCommand<Ctx>(commands: DesignerCommandTable<Ctx>, id: string, context: Ctx): boolean {
  const command = commands.get(id)
  if (!command || !commandEnabled(command, context))
    return false
  command.run(context)
  return true
}

/** 命令工具栏：一条 <xh-toolbar>，按分组铺按钮，放不下的收进行尾的「更多」菜单；命令的语气写成按钮的 data-tone。 */
export interface CommandToolbar<Ctx> {
  readonly element: HTMLElement
  /** 换上这组分组与此刻的状态：分组变了才重铺按钮，文字、可用与选中状态每次都刷新。 */
  readonly update: (groups: readonly (readonly string[])[], commands: DesignerCommandTable<Ctx>, context: Ctx, label: string) => void
}

/** 建一条命令工具栏；点击按钮执行对应命令，用的是最近一次 update 交来的命令表与上下文。 */
export function createCommandToolbar<Ctx>(doc: Document): CommandToolbar<Ctx> {
  defineCommandElements()
  const root = createAuthoredElement(doc, 'div', { 'data-xh-part': 'root' })
  const element = createAuthoredElement(doc, 'xh-toolbar', { size: 'sm' }, [root])
  const items = new Map<string, HTMLButtonElement>()
  let layoutKey: string | undefined
  let current: { commands: DesignerCommandTable<Ctx>, context: Ctx } | undefined
  root.addEventListener('click', (event) => {
    const item = (event.target as Element | null)?.closest<HTMLButtonElement>('button[data-xh-part="item"]')
    if (item && !item.disabled && current)
      runCommand(current.commands, item.value, current.context)
  })
  return {
    element,
    update(groups, commands, context, label) {
      current = { commands, context }
      const key = JSON.stringify(groups)
      if (key !== layoutKey) {
        layoutKey = key
        items.clear()
        const children: HTMLElement[] = []
        groups.forEach((group, index) => {
          if (index > 0)
            children.push(createAuthoredElement(doc, 'div', { 'data-xh-part': 'separator' }))
          children.push(createAuthoredElement(doc, 'div', { 'data-xh-part': 'group' }, group.map((id) => {
            const item = createAuthoredElement(doc, 'button', { 'data-xh-part': 'item', 'type': 'button', 'value': id })
            items.set(id, item)
            return item
          })))
        })
        children.push(createAuthoredElement(doc, 'button', { 'data-xh-part': 'overflow-trigger', 'type': 'button' }))
        root.replaceChildren(...children)
      }
      if (root.getAttribute('aria-label') !== label)
        root.setAttribute('aria-label', label)
      for (const [id, item] of items) {
        const command = commands.get(id)!
        setText(item, commandLabel(command, context))
        const disabled = !commandEnabled(command, context)
        if (item.disabled !== disabled)
          item.disabled = disabled
        if (command.checked)
          item.setAttribute('aria-pressed', String(command.checked(context)))
        else
          item.removeAttribute('aria-pressed')
        if (command.tone)
          item.setAttribute('data-tone', command.tone)
        else
          item.removeAttribute('data-tone')
      }
    },
  }
}

/**
 * 把分组铺成 <xh-context-menu> content 里的条目：组与组之间一条分隔线，条目的 value 是命令 id，
 * 此刻不可用的写 aria-disabled，命令的语气写 data-tone，带快捷键的在行尾写快捷键提示（platform 由调用方测出，缺省按非 macOS 写）。
 * 选中条目时用 runCommand 执行。
 */
export function renderCommandMenu<Ctx>(
  content: HTMLElement,
  groups: readonly (readonly string[])[],
  commands: DesignerCommandTable<Ctx>,
  context: Ctx,
  options: { readonly platform?: 'mac' | 'other' } = {},
): void {
  defineCommandElements()
  const doc = content.ownerDocument
  const children: HTMLElement[] = []
  groups.forEach((group, index) => {
    if (index > 0)
      children.push(createAuthoredElement(doc, 'div', { 'data-xh-part': 'separator' }))
    for (const id of group) {
      const command = commands.get(id)
      if (!command)
        throw new TypeError(`[xh] 菜单里的 ${id} 不是登记过的命令`)
      const parts = [createAuthoredElement(doc, 'span', { 'data-xh-part': 'item-text' }, [commandLabel(command, context)])]
      if (command.shortcut !== undefined)
        parts.push(createAuthoredElement(doc, 'span', { 'data-xh-part': 'item-shortcut' }, [formatShortcut(command.shortcut, options.platform ?? 'other')]))
      children.push(createAuthoredElement(doc, 'div', {
        'data-xh-part': 'item',
        'value': id,
        'aria-disabled': commandEnabled(command, context) ? undefined : 'true',
        'data-tone': command.tone,
      }, parts))
    }
  })
  content.replaceChildren(...children)
}
