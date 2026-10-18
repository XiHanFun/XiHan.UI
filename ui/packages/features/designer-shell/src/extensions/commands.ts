/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 命令的排列与呈现：按 commandLayout 或缺省排列分组，铺成 <xh-toolbar> 的按钮与 <xh-context-menu> 的条目，
// 点击或选中时执行对应命令。内置命令与扩展命令同一条路。

import type { IconRecord } from '@xihan-ui/core'
import type { KbdPlatform, KbdResolvedPlatform } from '@xihan-ui/core/hotkey'
import type { DesignerCommand, DesignerCommandPlacement } from '@xihan-ui/designer-kit'
import { ariaKeyshortcut, detectKbdPlatform, resolveKbdPlatform } from '@xihan-ui/core/hotkey'
import { formatShortcut } from '@xihan-ui/designer-kit'
import { createAuthoredElement, setAttributes, setText } from '@xihan-ui/web-components/authoring'
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

/** 命令的短文字：顶栏按钮图标下的那一行，没给 shortLabel 时就是 label。 */
export function commandShortLabel<Ctx>(command: DesignerCommand<Ctx>, context: Ctx): string {
  const short = typeof command.shortLabel === 'function' ? command.shortLabel(context) : command.shortLabel
  return short ?? commandLabel(command, context)
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

/**
 * 工具栏按钮的显示方式：只显示图标、只显示文字、图标加文字；stacked 是图标在上、短文字在下，给顶栏的插入快捷钮用。
 * 没有图标的命令在 icon 档照样显示文字。
 */
export type CommandToolbarDisplay = 'icon' | 'text' | 'both' | 'stacked'

/** 命令工具栏的选项。 */
export interface CommandToolbarOptions {
  /** 按钮的显示方式，缺省 icon。 */
  readonly display?: CommandToolbarDisplay
  /** 快捷键按哪个平台写进 aria-keyshortcuts、在提示里显示成什么样子：auto（缺省）建工具栏时测一次。 */
  readonly platform?: KbdPlatform
}

/**
 * 命令工具栏：一条 <xh-toolbar>，按分组铺按钮，放不下的收进行尾的「更多」菜单，收起的条目带着命令的图标；
 * 命令的语气写成按钮的 data-tone，快捷键按平台写成按钮的 aria-keyshortcuts。
 * 整条工具栏由一个委托模式的 <xh-tooltip> 包着：悬停或键盘聚焦到按钮时显示命令的文字与快捷键。
 */
export interface CommandToolbar<Ctx> {
  /** 工具栏的外壳：包着 <xh-toolbar> 的那个 <xh-tooltip>，由调用方放进页面；布局上不占盒子。 */
  readonly element: HTMLElement
  /** 外壳里那条 <xh-toolbar>。 */
  readonly toolbar: HTMLElement
  /** 换上这组分组与此刻的状态：分组变了才重铺按钮，文字、图标、快捷键、可用与选中状态每次都刷新。 */
  readonly update: (groups: readonly (readonly string[])[], commands: DesignerCommandTable<Ctx>, context: Ctx, label: string) => void
  /** 此刻的显示方式。 */
  readonly display: () => CommandToolbarDisplay
  /** 换显示方式：不重铺按钮，工具栏按换过之后的宽度重新收放「更多」里的条目。 */
  readonly setDisplay: (display: CommandToolbarDisplay) => void
}

/** 工具栏按钮的选择器：委托提示认它作锚点，点击也按它找命令。 */
const ITEM_SELECTOR = 'button[data-xh-part=\'item\']'

/** 委托提示认哪些按钮：只显示图标、或只显示短文字时每个按钮都给提示；全名看得见时只给带快捷键的按钮。 */
function tooltipAnchors(display: CommandToolbarDisplay): string {
  return display === 'icon' || display === 'stacked' ? ITEM_SELECTOR : `${ITEM_SELECTOR}[aria-keyshortcuts]`
}

/** 工具栏上一个命令按钮：图标与文字两段都铺着，显示哪段由外壳上的 data-display 决定。 */
interface CommandButton {
  readonly item: HTMLButtonElement
  readonly icon: HTMLElement & { icon?: IconRecord }
  readonly label: HTMLElement
  /** 最近一次刷新时命令的文字与短文字：显示方式换了按它重写看得见的那段。 */
  texts: { readonly label: string, readonly short: string }
}

function createCommandButton(doc: Document, id: string): CommandButton {
  const icon = createAuthoredElement(doc, 'xh-icon', { 'data-scope': 'designer-commands', 'data-part': 'icon' }) as CommandButton['icon']
  const label = createAuthoredElement(doc, 'span', { 'data-scope': 'designer-commands', 'data-part': 'label' })
  const item = createAuthoredElement(doc, 'button', { 'data-xh-part': 'item', 'type': 'button', 'value': id }, [icon, label])
  return { item, icon, label, texts: { label: '', short: '' } }
}

/** 按显示方式写按钮上看得见的文字：叠放时是短文字，其余是全名。 */
function paintText(button: CommandButton, display: CommandToolbarDisplay): void {
  setText(button.label, display === 'stacked' ? button.texts.short : button.texts.label)
}

/** 两张图标表是否一样：同样的命令、同一份图标记录。 */
function sameIcons(a: Readonly<Record<string, IconRecord>> | undefined, b: Readonly<Record<string, IconRecord>>): boolean {
  const keys = Object.keys(b)
  return a !== undefined && Object.keys(a).length === keys.length && keys.every(key => a[key] === b[key])
}

/** 快捷键落定按哪个平台写：auto 与不给都当场测一次。 */
function resolvePlatform(platform: KbdPlatform | undefined): KbdResolvedPlatform {
  return platform === undefined || platform === 'auto' ? detectKbdPlatform() : resolveKbdPlatform(platform)
}

/** 建一条命令工具栏；点击按钮执行对应命令，用的是最近一次 update 交来的命令表与上下文。 */
export function createCommandToolbar<Ctx>(doc: Document, options: CommandToolbarOptions = {}): CommandToolbar<Ctx> {
  defineCommandElements()
  const platform = resolvePlatform(options.platform)
  let display: CommandToolbarDisplay = options.display ?? 'icon'
  const root = createAuthoredElement(doc, 'div', { 'data-xh-part': 'root' })
  const toolbar = createAuthoredElement(doc, 'xh-toolbar', { size: 'sm' }, [root]) as HTMLElement & { itemIcons?: Readonly<Record<string, IconRecord>> }
  const element = createAuthoredElement(doc, 'xh-tooltip', {
    'data-scope': 'designer-commands',
    'data-display': display,
    'delegate': tooltipAnchors(display),
    platform,
  }, [
    createAuthoredElement(doc, 'div', { 'data-xh-part': 'trigger' }, [toolbar]),
    createAuthoredElement(doc, 'div', { 'data-xh-part': 'positioner' }, [
      createAuthoredElement(doc, 'div', { 'data-xh-part': 'content' }, [createAuthoredElement(doc, 'div', { 'data-xh-part': 'arrow' })]),
    ]),
  ])
  const items = new Map<string, CommandButton>()
  let layoutKey: string | undefined
  let current: { commands: DesignerCommandTable<Ctx>, context: Ctx } | undefined
  root.addEventListener('click', (event) => {
    const item = (event.target as Element | null)?.closest<HTMLButtonElement>(ITEM_SELECTOR)
    if (item && !item.disabled && current)
      runCommand(current.commands, item.value, current.context)
  })
  return {
    element,
    toolbar,
    display: () => display,
    setDisplay(next) {
      if (next === display)
        return
      display = next
      setAttributes(element, { 'data-display': next, 'delegate': tooltipAnchors(next) })
      for (const button of items.values())
        paintText(button, next)
    },
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
            const button = createCommandButton(doc, id)
            items.set(id, button)
            return button.item
          })))
        })
        children.push(createAuthoredElement(doc, 'button', { 'data-xh-part': 'overflow-trigger', 'type': 'button' }))
        root.replaceChildren(...children)
      }
      if (root.getAttribute('aria-label') !== label)
        root.setAttribute('aria-label', label)
      const icons: Record<string, IconRecord> = {}
      for (const [id, button] of items) {
        const command = commands.get(id)!
        const text = commandLabel(command, context)
        button.texts = { label: text, short: commandShortLabel(command, context) }
        paintText(button, display)
        // 名字写在按钮上：只显示图标时文字收起，名字照样在
        setAttributes(button.item, {
          'aria-label': text,
          'aria-keyshortcuts': command.shortcut ? ariaKeyshortcut(command.shortcut, platform) : undefined,
          'aria-pressed': command.checked ? String(command.checked(context)) : undefined,
          'data-tone': command.tone,
          'data-icon': command.icon !== undefined,
        })
        const disabled = !commandEnabled(command, context)
        if (button.item.disabled !== disabled)
          button.item.disabled = disabled
        if (button.icon.icon !== command.icon)
          button.icon.icon = command.icon
        if (command.icon)
          icons[id] = command.icon
      }
      if (!sameIcons(toolbar.itemIcons, icons))
        toolbar.itemIcons = icons
    },
  }
}

/**
 * 把分组铺成 <xh-context-menu> content 里的条目：组与组之间一条分隔线，条目的 value 是命令 id，
 * 此刻不可用的写 aria-disabled，命令的语气写 data-tone，带图标的在文字前铺图标，
 * 带快捷键的在行尾写快捷键提示、并写进 aria-keyshortcuts（platform 由调用方测出，缺省按非 macOS 写）。
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
  const platform = options.platform ?? 'other'
  const children: HTMLElement[] = []
  groups.forEach((group, index) => {
    if (index > 0)
      children.push(createAuthoredElement(doc, 'div', { 'data-xh-part': 'separator' }))
    for (const id of group) {
      const command = commands.get(id)
      if (!command)
        throw new TypeError(`[xh] 菜单里的 ${id} 不是登记过的命令`)
      const parts: HTMLElement[] = []
      if (command.icon !== undefined) {
        const glyph = createAuthoredElement(doc, 'xh-icon') as HTMLElement & { icon?: IconRecord }
        glyph.icon = command.icon
        parts.push(createAuthoredElement(doc, 'span', { 'data-xh-part': 'item-icon' }, [glyph]))
      }
      parts.push(createAuthoredElement(doc, 'span', { 'data-xh-part': 'item-text' }, [commandLabel(command, context)]))
      if (command.shortcut !== undefined)
        parts.push(createAuthoredElement(doc, 'span', { 'data-xh-part': 'item-shortcut' }, [formatShortcut(command.shortcut, platform)]))
      children.push(createAuthoredElement(doc, 'div', {
        'data-xh-part': 'item',
        'value': id,
        'aria-disabled': commandEnabled(command, context) ? undefined : 'true',
        'aria-keyshortcuts': command.shortcut ? ariaKeyshortcut(command.shortcut, platform) : undefined,
        'data-tone': command.tone,
      }, parts))
    }
  })
  content.replaceChildren(...children)
}
