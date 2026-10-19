/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 命令的排列与呈现：按 commandLayout 或缺省排列分组，铺成 <xh-toolbar> 的按钮与 <xh-context-menu> 的条目，
// 点击或选中时执行对应命令；弹层命令与菜单命令在工具栏上点开锚在按钮上的弹层与菜单。内置命令与扩展命令同一条路。

import type { IconRecord } from '@xihan-ui/core'
import type { KbdPlatform, KbdResolvedPlatform } from '@xihan-ui/core/hotkey'
import type { DesignerCommand, DesignerCommandMenuEntry, DesignerCommandPanel, DesignerCommandPlacement } from '@xihan-ui/designer-kit'
import type { XhMenuElement, XhPopoverElement } from '@xihan-ui/web-components/define'
import { DIAGNOSTIC_WARN, isDev, reportDiagnostic } from '@xihan-ui/core'
import { ariaKeyshortcut, detectKbdPlatform, resolveKbdPlatform } from '@xihan-ui/core/hotkey'
import { commandShortcuts, formatShortcut, isCommandMenuSeparator } from '@xihan-ui/designer-kit'
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

/** 命令的短文字：顶栏按钮图标下的那一行、只显示图标时没有图标的按钮上的字，没给 shortLabel 时就是 label。 */
export function commandShortLabel<Ctx>(command: DesignerCommand<Ctx>, context: Ctx): string {
  const short = typeof command.shortLabel === 'function' ? command.shortLabel(context) : command.shortLabel
  return short ?? commandLabel(command, context)
}

/** 命令此刻能否执行。 */
export function commandEnabled<Ctx>(command: DesignerCommand<Ctx>, context: Ctx): boolean {
  return command.enabled?.(context) ?? true
}

/** 执行一条命令：命令存在、有 run 且此刻可用才执行，返回是否执行了。没给 run 的弹层命令与菜单命令由命令工具栏打开。 */
export function runCommand<Ctx>(commands: DesignerCommandTable<Ctx>, id: string, context: Ctx): boolean {
  const command = commands.get(id)
  if (!command?.run || !commandEnabled(command, context))
    return false
  command.run(context)
  return true
}

/**
 * 工具栏按钮的显示方式：只显示图标、只显示文字、图标加文字；stacked 是图标在上、短文字在下，给顶栏的插入快捷钮用。
 * 没有图标的命令在 icon 档照样显示文字，写短文字（shortLabel，没给就是 label）。
 */
export type CommandToolbarDisplay = 'icon' | 'text' | 'both' | 'stacked'

/** 命令工具栏的排列方向。 */
export type CommandToolbarOrientation = 'horizontal' | 'vertical'

/** 命令工具栏的选项。 */
export interface CommandToolbarOptions {
  /** 按钮的显示方式，缺省 icon。 */
  readonly display?: CommandToolbarDisplay
  /** 排列方向，缺省 horizontal。竖排时提示与弹层在按钮的行首一侧弹出，放不下的按高度收进「更多」。 */
  readonly orientation?: CommandToolbarOrientation
  /** 快捷键按哪个平台写进 aria-keyshortcuts、在提示里显示成什么样子：auto（缺省）建工具栏时测一次。 */
  readonly platform?: KbdPlatform
  /**
   * 放不下的按钮：menu（缺省）收进行尾自己的「更多」菜单；external 由调用方列在别处（如面板头的「更多」菜单），
   * 自己的「更多」钮不占位、看不见，只留作弹层与菜单的锚点。收起的条目变了时外壳派发冒泡的 overflow-change。
   */
  readonly overflow?: 'menu' | 'external'
}

/**
 * 命令工具栏：一条 <xh-toolbar>，按分组铺按钮，放不下的收进行尾的「更多」菜单，收起的条目带着命令的图标；
 * 命令的语气写成按钮的 data-tone，快捷键按平台写成按钮的 aria-keyshortcuts。
 * 整条工具栏由一个委托模式的 <xh-tooltip> 包着：悬停或键盘聚焦到按钮时显示命令的文字与快捷键。
 * 弹层命令点开一个锚在按钮上的 <xh-popover>，菜单命令点开一个锚在按钮上的 <xh-menu>；命令收在「更多」里时锚在「更多」钮上，
 * 开着的时候命令被收进「更多」或又放回工具栏，弹层与菜单跟着换锚点。
 */
export interface CommandToolbar<Ctx> {
  /** 工具栏的外壳：包着 <xh-toolbar> 的那个 <xh-tooltip>，由调用方放进页面；布局上不占盒子。 */
  readonly element: HTMLElement
  /** 外壳里那条 <xh-toolbar>。 */
  readonly toolbar: HTMLElement
  /** 换上这组分组与此刻的状态：分组变了才重铺按钮，文字、图标、快捷键、可用与选中状态每次都刷新，开着的弹层与菜单一并刷新。 */
  readonly update: (groups: readonly (readonly string[])[], commands: DesignerCommandTable<Ctx>, context: Ctx, label: string) => void
  /** 此刻的显示方式。 */
  readonly display: () => CommandToolbarDisplay
  /** 换显示方式：不重铺按钮，工具栏按换过之后的宽度重新收放「更多」里的条目。 */
  readonly setDisplay: (display: CommandToolbarDisplay) => void
  /**
   * 打开一条弹层命令或菜单命令，给快捷键用：锚在它的按钮上，按钮收在「更多」里时锚在「更多」上。
   * 已经开着就不动。命令不在工具栏上、不是这两类命令、或此刻不可用时返回 false。
   */
  readonly open: (id: string) => boolean
  /** 关掉开着的弹层或菜单。 */
  readonly close: () => void
  /** 开着的那条弹层命令或菜单命令的 id；都没开时为 undefined。 */
  readonly opened: () => string | undefined
  /** 此刻收在「更多」里的命令，按工具栏上的先后。 */
  readonly overflowed: () => readonly { readonly id: string, readonly label: string, readonly disabled: boolean }[]
  /** 照点它的按钮那样执行一条命令：弹层与菜单命令开合，其余直接执行；不可用时什么都不做。 */
  readonly activate: (id: string) => void
}

/** 命令的全部快捷键写成 aria-keyshortcuts：shortcut 在前（委托提示只显示第一条），第二快捷键依次在后；一条都写不出时为 undefined。 */
function commandKeyshortcuts(command: Pick<DesignerCommand<never>, 'shortcut' | 'alternateShortcuts'>, platform: KbdPlatform): string | undefined {
  const value = commandShortcuts(command).map(keys => ariaKeyshortcut(keys, platform)).filter(Boolean).join(' ')
  return value === '' ? undefined : value
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
  /** 最近一次刷新时命令的文字、短文字与有没有图标：显示方式换了按它重写看得见的那段。 */
  texts: { readonly label: string, readonly short: string, readonly icon: boolean }
}

function createCommandButton(doc: Document, id: string): CommandButton {
  const icon = createAuthoredElement(doc, 'xh-icon', { 'data-scope': 'designer-commands', 'data-part': 'icon' }) as CommandButton['icon']
  const label = createAuthoredElement(doc, 'span', { 'data-scope': 'designer-commands', 'data-part': 'label' })
  const item = createAuthoredElement(doc, 'button', { 'data-xh-part': 'item', 'type': 'button', 'value': id }, [icon, label])
  return { item, icon, label, texts: { label: '', short: '', icon: false } }
}

/**
 * 按显示方式写按钮上看得见的文字：叠放时、只显示图标而这颗按钮没有图标时是短文字，其余是全名。
 * 只显示图标、这颗按钮又有图标时标上 data-icon-only，工具条按方钮画。
 */
function paintText(button: CommandButton, display: CommandToolbarDisplay): void {
  const short = display === 'stacked' || (display === 'icon' && !button.texts.icon)
  setText(button.label, short ? button.texts.short : button.texts.label)
  setAttributes(button.item, { 'data-icon-only': display === 'icon' && button.texts.icon })
}

/** 开发期核对短文字在不在名字里（不分大小写）：不在就报一条告警，一条命令只报一次。 */
function checkShortLabel(id: string, label: string, short: string, warned: Set<string>): void {
  if (warned.has(id) || label.toLowerCase().includes(short.toLowerCase()))
    return
  warned.add(id)
  reportDiagnostic({
    code: DIAGNOSTIC_WARN,
    level: 'warn',
    scope: 'designer-commands',
    message: `命令 ${id} 的 shortLabel 不在 label 里：按钮上看得见的字要包含在按钮的名字里，把短文字写进 label`,
    detail: { id, label, shortLabel: short },
  })
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

/** <xh-menu> 的一个条目。 */
type MenuNode = NonNullable<XhMenuElement['collection']>[number]

/** 菜单命令的一项在 <xh-menu> 里的值：条目与命令各占一个前缀，彼此不撞。 */
const MENU_ITEM_PREFIX = 'item:'
const MENU_COMMAND_PREFIX = 'command:'

/** 菜单命令现算出的一份 <xh-menu> 数据。 */
interface CommandMenuData {
  readonly collection: MenuNode[]
  readonly checkboxValue: string[]
  readonly radioValue: Record<string, string>
}

/**
 * 把菜单命令的各项换成 <xh-menu> 的数据：分隔线落到下一项的 separatorBefore 上，打头与收尾的分隔线不画；
 * 写成命令 id 的项按那条命令的文字、图标、可用与语气铺；可勾选的条目按 group 分复选与单选。
 */
function commandMenuData<Ctx>(entries: readonly DesignerCommandMenuEntry[], commands: DesignerCommandTable<Ctx>, context: Ctx): CommandMenuData {
  const collection: MenuNode[] = []
  const checkboxValue: string[] = []
  const radioValue: Record<string, string> = {}
  let separate = false
  for (const entry of entries) {
    if (isCommandMenuSeparator(entry)) {
      separate = collection.length > 0
      continue
    }
    const base = separate ? { separatorBefore: true } : {}
    separate = false
    if (typeof entry === 'string') {
      const command = commands.get(entry)
      if (!command)
        throw new TypeError(`[xh] 菜单命令里的 ${entry} 不是登记过的命令`)
      collection.push({
        ...base,
        value: `${MENU_COMMAND_PREFIX}${entry}`,
        label: commandLabel(command, context),
        disabled: !commandEnabled(command, context),
        ...(command.icon ? { icon: command.icon } : {}),
        ...(command.tone ? { tone: command.tone } : {}),
      })
      continue
    }
    const value = `${MENU_ITEM_PREFIX}${entry.value}`
    const node: MenuNode = {
      ...base,
      value,
      label: entry.label,
      ...(entry.disabled ? { disabled: true } : {}),
      ...(entry.icon ? { icon: entry.icon } : {}),
      ...(entry.tone ? { tone: entry.tone } : {}),
    }
    if (entry.checked !== undefined && entry.group !== undefined) {
      collection.push({ ...node, kind: 'radio', group: entry.group, closeOnSelect: true })
      if (entry.checked)
        radioValue[entry.group] = value
    }
    else if (entry.checked !== undefined) {
      collection.push({ ...node, kind: 'checkbox' })
      if (entry.checked)
        checkboxValue.push(value)
    }
    else {
      collection.push(node)
    }
  }
  return { collection, checkboxValue, radioValue }
}

/** 弹层与菜单在按钮的哪一侧：横排在下方，竖排在行首一侧（从左往右写时是左边）。 */
function popupSide(orientation: CommandToolbarOrientation, rtl: boolean): 'bottom' | 'left' | 'right' {
  if (orientation === 'horizontal')
    return 'bottom'
  return rtl ? 'right' : 'left'
}

type PopoverHost = XhPopoverElement
type MenuHost = XhMenuElement
type OverlayPlacement = NonNullable<XhPopoverElement['placement']>

/** 开着的弹层或菜单。 */
type OpenPopup<Ctx>
  = | { readonly kind: 'panel', readonly id: string, readonly instance: DesignerCommandPanel<Ctx>, readonly observer: MutationObserver | undefined }
    | { readonly kind: 'menu', readonly id: string, readonly observer: MutationObserver | undefined }

/** 建一条命令工具栏；点击按钮执行对应命令，用的是最近一次 update 交来的命令表与上下文。 */
export function createCommandToolbar<Ctx>(doc: Document, options: CommandToolbarOptions = {}): CommandToolbar<Ctx> {
  defineCommandElements()
  const platform = resolvePlatform(options.platform)
  const orientation = options.orientation ?? 'horizontal'
  let display: CommandToolbarDisplay = options.display ?? 'icon'
  const root = createAuthoredElement(doc, 'div', { 'data-xh-part': 'root' })
  const toolbar = createAuthoredElement(doc, 'xh-toolbar', {
    size: 'sm',
    orientation: orientation === 'vertical' ? 'vertical' : undefined,
  }, [root]) as HTMLElement & { itemIcons?: Readonly<Record<string, IconRecord>> }
  const trigger = createAuthoredElement(doc, 'div', { 'data-xh-part': 'trigger' }, [toolbar])
  const external = options.overflow === 'external'
  const element = createAuthoredElement(doc, 'xh-tooltip', {
    'data-scope': 'designer-commands',
    'data-display': display,
    'data-orientation': orientation,
    'data-overflow': external ? 'external' : undefined,
    'delegate': tooltipAnchors(display),
    platform,
  }, [
    trigger,
    createAuthoredElement(doc, 'div', { 'data-xh-part': 'positioner' }, [
      createAuthoredElement(doc, 'div', { 'data-xh-part': 'content' }, [createAuthoredElement(doc, 'div', { 'data-xh-part': 'arrow' })]),
    ]),
  ])
  const items = new Map<string, CommandButton>()
  /** 已经报过短文字不在名字里的命令。 */
  const warnedShort = new Set<string>()
  let overflowTrigger: HTMLButtonElement | undefined
  let layoutKey: string | undefined
  let current: { commands: DesignerCommandTable<Ctx>, context: Ctx } | undefined
  let popover: { readonly host: PopoverHost, readonly content: HTMLElement } | undefined
  let menu: MenuHost | undefined
  let popup: OpenPopup<Ctx> | undefined

  /** 按钮收在「更多」里时锚在「更多」上。 */
  const anchorOf = (button: HTMLButtonElement): HTMLElement => (button.hidden && overflowTrigger ? overflowTrigger : button)
  const rtl = (): boolean => doc.defaultView?.getComputedStyle(trigger).direction === 'rtl'
  const side = (): 'bottom' | 'left' | 'right' => popupSide(orientation, rtl())

  /** 按钮被收进「更多」或放回来时，开着的弹层与菜单跟着换锚点。 */
  const watchAnchor = (button: HTMLButtonElement, host: PopoverHost | MenuHost): MutationObserver | undefined => {
    const Observer = doc.defaultView?.MutationObserver
    if (!Observer)
      return undefined
    const observer = new Observer(() => {
      host.anchor = anchorOf(button)
    })
    observer.observe(button, { attributes: true, attributeFilter: ['hidden'] })
    return observer
  }

  const ensurePopover = (): { readonly host: PopoverHost, readonly content: HTMLElement } => {
    if (popover)
      return popover
    const content = createAuthoredElement(doc, 'div', { 'data-xh-part': 'content' })
    const host = createAuthoredElement(doc, 'xh-popover', {}, [createAuthoredElement(doc, 'div', { 'data-xh-part': 'positioner' }, [content])]) as PopoverHost
    host.anchor = null
    host.open = false
    host.addEventListener('open-change', (event) => {
      if (!(event as CustomEvent<{ open: boolean }>).detail.open)
        close()
    })
    trigger.append(host)
    popover = { host, content }
    return popover
  }

  /** 按此刻的命令表与上下文刷新菜单的条目、勾选与名字。 */
  const paintMenu = (host: MenuHost, command: DesignerCommand<Ctx>, commands: DesignerCommandTable<Ctx>, context: Ctx): void => {
    const data = commandMenuData(command.menu?.(context) ?? [], commands, context)
    host.collection = data.collection
    host.checkboxValue = data.checkboxValue
    host.radioValue = data.radioValue
    host.translations = { content: commandLabel(command, context) }
  }

  const ensureMenu = (): MenuHost => {
    if (menu)
      return menu
    const host = createAuthoredElement(doc, 'xh-menu') as MenuHost
    host.anchor = null
    host.open = false
    host.addEventListener('open-change', (event) => {
      if (!(event as CustomEvent<{ open: boolean }>).detail.open)
        close()
    })
    const choose = (value: string): void => {
      const command = popup?.kind === 'menu' && current ? current.commands.get(popup.id) : undefined
      if (!command || !current)
        return
      if (value.startsWith(MENU_COMMAND_PREFIX))
        runCommand(current.commands, value.slice(MENU_COMMAND_PREFIX.length), current.context)
      else if (value.startsWith(MENU_ITEM_PREFIX))
        command.select?.(value.slice(MENU_ITEM_PREFIX.length), current.context)
      // 菜单还开着（复选条目）时按此刻的状态重铺：选中改的状态不一定让设计器重新刷新命令栏
      if (popup?.kind === 'menu' && host.open && current)
        paintMenu(host, command, current.commands, current.context)
    }
    // 普通条目、命令与单选条目（选中即收起）派发 select
    host.addEventListener('select', event => choose((event as CustomEvent<{ value: string }>).detail.value))
    // 复选条目选中后菜单不收起，只派发 checkbox-value-change：与此刻的勾选比出点的是哪一条
    host.addEventListener('checkbox-value-change', (event) => {
      const next = new Set((event as CustomEvent<{ value: string[] }>).detail.value)
      const before = new Set(host.checkboxValue ?? [])
      for (const value of [...next].filter(item => !before.has(item)).concat([...before].filter(item => !next.has(item))))
        choose(value)
    })
    trigger.append(host)
    menu = host
    return menu
  }

  function close(): void {
    const open = popup
    if (!open)
      return
    popup = undefined
    open.observer?.disconnect()
    if (open.kind === 'panel' && popover) {
      popover.host.open = false
      open.instance.destroy?.()
      open.instance.element.remove()
    }
    else if (open.kind === 'menu' && menu) {
      menu.open = false
    }
  }

  function open(id: string): boolean {
    if (popup?.id === id)
      return true
    const button = items.get(id)
    const command = current?.commands.get(id)
    if (!button || !command || !current || (command.panel === undefined && command.menu === undefined) || !commandEnabled(command, current.context))
      return false
    close()
    const { commands, context } = current
    const placement: OverlayPlacement = `${side()}-start`
    if (command.panel) {
      const { host, content } = ensurePopover()
      const instance = command.panel(context)
      content.replaceChildren(instance.element)
      content.setAttribute('aria-label', commandLabel(command, context))
      host.placement = placement
      host.anchor = anchorOf(button.item)
      popup = { kind: 'panel', id, instance, observer: watchAnchor(button.item, host) }
      host.open = true
    }
    else {
      const host = ensureMenu()
      paintMenu(host, command, commands, context)
      host.placement = placement
      host.anchor = anchorOf(button.item)
      popup = { kind: 'menu', id, observer: watchAnchor(button.item, host) }
      host.open = true
    }
    return true
  }

  /** 点一颗按钮：弹层与菜单命令开合，其余直接执行。 */
  const activate = (id: string): void => {
    const item = items.get(id)?.item
    if (!item || item.disabled || !current)
      return
    const command = current.commands.get(id)
    if (command?.panel !== undefined || command?.menu !== undefined) {
      // 点开着的那一条是收起，点别的弹层或菜单命令是换过去
      if (popup?.id === id)
        close()
      else
        open(id)
      return
    }
    runCommand(current.commands, id, current.context)
  }
  root.addEventListener('click', (event) => {
    const item = (event.target as Element | null)?.closest<HTMLButtonElement>(ITEM_SELECTOR)
    if (item)
      activate(item.value)
  })
  const overflowed = (): { id: string, label: string, disabled: boolean }[] =>
    [...items].filter(([, button]) => button.item.hidden).map(([id, button]) => ({ id, label: button.item.getAttribute('aria-label') ?? id, disabled: button.item.disabled }))
  if (external) {
    // 收起的条目变了就告诉调用方，好让它重排自己列出这些条目的地方
    let key = ''
    const Observer = doc.defaultView?.MutationObserver
    if (Observer) {
      new Observer(() => {
        const next = overflowed().map(item => item.id).join(' ')
        if (next === key)
          return
        key = next
        element.dispatchEvent(new CustomEvent('overflow-change', { bubbles: true }))
      }).observe(root, { subtree: true, attributes: true, attributeFilter: ['hidden'] })
    }
  }
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
    open,
    close,
    opened: () => popup?.id,
    overflowed,
    activate,
    update(groups, commands, context, label) {
      current = { commands, context }
      const key = JSON.stringify(groups)
      if (key !== layoutKey) {
        layoutKey = key
        // 按钮要重铺：开着的弹层或菜单锚着的那颗按钮会被换掉，先关掉
        close()
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
        overflowTrigger = createAuthoredElement(doc, 'button', { 'data-xh-part': 'overflow-trigger', 'type': 'button' })
        children.push(overflowTrigger)
        root.replaceChildren(...children)
      }
      if (root.getAttribute('aria-label') !== label)
        root.setAttribute('aria-label', label)
      // 竖排时提示在行首一侧弹出，不盖住下一颗按钮
      if (orientation === 'vertical') {
        const placement = side()
        if (element.getAttribute('placement') !== placement)
          element.setAttribute('placement', placement)
      }
      const icons: Record<string, IconRecord> = {}
      for (const [id, button] of items) {
        const command = commands.get(id)!
        const text = commandLabel(command, context)
        const short = commandShortLabel(command, context)
        if (command.shortLabel !== undefined && isDev())
          checkShortLabel(id, text, short, warnedShort)
        button.texts = { label: text, short, icon: command.icon !== undefined }
        paintText(button, display)
        // 名字写在按钮上：只显示图标时文字收起，名字照样在
        setAttributes(button.item, {
          'aria-label': text,
          'aria-keyshortcuts': commandKeyshortcuts(command, platform),
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
      // 开着的弹层或菜单：命令不在了或此刻不可用就关掉，否则按新状态刷新
      if (popup) {
        const command = commands.get(popup.id)
        const button = items.get(popup.id)
        if (!command || !button || !commandEnabled(command, context)) {
          close()
        }
        else if (popup.kind === 'panel') {
          popover?.content.setAttribute('aria-label', commandLabel(command, context))
          popup.instance.update?.(context)
        }
        else if (menu) {
          paintMenu(menu, command, commands, context)
        }
      }
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
      if (!command.run)
        throw new TypeError(`[xh] 菜单里的 ${id} 是没有 run 的弹层或菜单命令，只能放在工具栏上`)
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
        'aria-keyshortcuts': commandKeyshortcuts(command, platform),
        'data-tone': command.tone,
      }, parts))
    }
  })
  content.replaceChildren(...children)
}
