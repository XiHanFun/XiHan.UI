/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 命令菜单栏：内置文件、编辑、视图、帮助四张菜单与外壳认得的命令的缺省排列，扩展登记的菜单，按命令表排出各菜单，
// 铺成 <xh-menubar> 的数据，选中条目执行命令；窄屏时整条收成一颗「菜单」钮，点开的 <xh-menu> 里每张菜单是一个子菜单。

import type { IconRecord } from '@xihan-ui/core'
import type { KbdPlatform } from '@xihan-ui/core/hotkey'
import type { DesignerCommand } from '@xihan-ui/designer-kit'
import type { XhMenubarElement, XhMenuElement } from '@xihan-ui/web-components/define'
import type { DesignerCommandsTranslations } from '../translations'
import type { DesignerCommandLayout, DesignerCommandTable, MenuNode } from './commands'
import { DIAGNOSTIC_WARN, isDev, reportDiagnostic } from '@xihan-ui/core'
import { DesignerExtensionError, formatShortcut } from '@xihan-ui/designer-kit'
import { createAuthoredElement, setText } from '@xihan-ui/web-components/authoring'
import { defineMenubarElements } from '../internal/ui-elements'
import { commandEnabled, commandKeyshortcuts, commandLabel, commandMenuData, MENU_COMMAND_PREFIX, MENU_ITEM_PREFIX, resolvePlatform, runCommand } from './commands'

/** 内置四张菜单的 id。 */
export const DESIGNER_MENUBAR_MENUS = {
  file: 'file',
  edit: 'edit',
  view: 'view',
  help: 'help',
} as const

/** 菜单栏上的一张菜单：命令经 placement 的 menubar:<id> 或排列落进来，没有命令的菜单不显示。 */
export interface DesignerMenubarMenu<Ctx = unknown> {
  /** 菜单 id，在整条菜单栏里唯一；内置的是 file、edit、view、help。 */
  readonly id: string
  /** 入口上的文字；给函数时每次刷新现取，随语言变。 */
  readonly label: string | ((context: Ctx) => string)
  /** 先后：内置的文件 0、编辑 10、视图 20、帮助 90，各款与扩展的写在 30–80 之间；不写按 50，同值按登记顺序。 */
  readonly order?: number
}

/** 菜单栏的缺省排列：菜单 id → 若干组命令 id，组与组之间画分隔线。 */
export type DesignerMenubarLayout = Readonly<Record<string, readonly (readonly string[])[]>>

/** 排好的一张菜单：菜单与它此刻的命令分组。 */
export interface ArrangedMenubarMenu<Ctx = unknown> {
  readonly menu: DesignerMenubarMenu<Ctx>
  readonly groups: readonly (readonly string[])[]
}

/** designerMenubarMenus 的选项。 */
export interface DesignerMenubarMenusOptions<Ctx> {
  /** 菜单名的文案（xh-designer-commands 那一桶），每次刷新现取，随语言变。 */
  readonly translations: (context: Ctx) => DesignerCommandsTranslations
}

/** 内置的四张菜单：文件、编辑、视图、帮助，名字取 xh-designer-commands 的 menuFile、menuEdit、menuView、menuHelp。 */
export function designerMenubarMenus<Ctx>(options: DesignerMenubarMenusOptions<Ctx>): DesignerMenubarMenu<Ctx>[] {
  const { translations } = options
  return [
    { id: DESIGNER_MENUBAR_MENUS.file, label: context => translations(context).menuFile, order: 0 },
    { id: DESIGNER_MENUBAR_MENUS.edit, label: context => translations(context).menuEdit, order: 10 },
    { id: DESIGNER_MENUBAR_MENUS.view, label: context => translations(context).menuView, order: 20 },
    { id: DESIGNER_MENUBAR_MENUS.help, label: context => translations(context).menuHelp, order: 90 },
  ]
}

/** 外壳认得的命令在四张内置菜单里的缺省排列。 */
const BUILTIN_LAYOUT: Readonly<Record<string, readonly (readonly string[])[]>> = {
  file: [['save'], ['open-file'], ['settings']],
  edit: [['undo', 'redo'], ['cut', 'copy', 'paste', 'delete', 'duplicate'], ['select-all'], ['edit-json']],
  view: [['design', 'preview'], ['zoom-in', 'zoom-out', 'zoom-to-fit', 'zoom-to-actual'], ['pan-tool'], ['panels', 'appearance']],
  help: [['start-tour', 'help', 'shortcuts'], ['about']],
}

/**
 * 四张内置菜单的缺省排列，只留 commands 里有的命令，空组去掉：
 * 文件是保存 / 打开文件 / 设置，编辑是撤销、重做 / 剪切、复制、粘贴、删除、创建副本 / 全选 / 编辑 JSON，
 * 视图是设计、预览 / 放大、缩小、适合窗口、实际大小 / 拖动 / 面板、外观（显示工具栏、状态栏、菜单栏三条开关收在这个子菜单里），
 * 帮助是开始引导、帮助、快捷键 / 关于。各款自己的命令写 placement 落进来，或在这份排列上改了交给 arrangeMenubar。
 */
export function designerMenubarLayout(commands: DesignerCommandTable<never>): Record<string, string[][]> {
  return Object.fromEntries(Object.entries(BUILTIN_LAYOUT).map(([menu, groups]) => [
    menu,
    groups.map(group => group.filter(id => commands.has(id))).filter(group => group.length > 0),
  ]))
}

function checkLayout(placement: string, groups: readonly (readonly string[])[], commands: DesignerCommandTable<never>): void {
  for (const id of groups.flat()) {
    if (!commands.has(id))
      throw new TypeError(`[xh] 命令排列 ${placement} 里的 ${id} 不是登记过的命令`)
  }
}

/**
 * 排出菜单栏：菜单按 order 排（不写按 50，同值按登记顺序），每张菜单的分组照 arrangeCommands 的规则：
 * 宿主的 layout 写了 menubar:<菜单 id> 就只用它（给空数组就不要这张菜单）；否则用 defaults 里这张菜单的排列，
 * placement 含 menubar:<菜单 id>、又不在排列里的命令按登记顺序成一组，排在缺省排列的最后一组之前
 * （最后一组是收尾，如文件菜单的设置；缺省排列不到两组时接在后面）。空组去掉，没有命令的菜单不出现。
 * 排列里出现命令表里没有的 id 时抛 TypeError。
 */
export function arrangeMenubar<Ctx>(
  menus: readonly DesignerMenubarMenu<Ctx>[],
  commands: DesignerCommandTable<Ctx>,
  defaults: DesignerMenubarLayout,
  layout?: DesignerCommandLayout,
): ArrangedMenubarMenu<Ctx>[] {
  const sorted = menus.map((menu, index) => ({ menu, index })).sort((a, b) => (a.menu.order ?? 50) - (b.menu.order ?? 50) || a.index - b.index)
  const arranged: ArrangedMenubarMenu<Ctx>[] = []
  for (const { menu } of sorted) {
    const placement = `menubar:${menu.id}` as const
    const custom = layout?.[placement]
    let groups: string[][]
    if (custom !== undefined) {
      checkLayout(placement, custom, commands as DesignerCommandTable<never>)
      groups = custom.map(group => [...group])
    }
    else {
      const base = (defaults[menu.id] ?? []).map(group => [...group])
      checkLayout(placement, base, commands as DesignerCommandTable<never>)
      const listed = new Set(base.flat())
      const extra = [...commands.values()].filter(command => command.placement?.includes(placement) && !listed.has(command.id)).map(command => command.id)
      groups = base.length >= 2 ? [...base.slice(0, -1), extra, base.at(-1)!] : [...base, extra]
    }
    groups = groups.filter(group => group.length > 0)
    if (groups.length > 0)
      arranged.push({ menu, groups })
  }
  return arranged
}

/** 带菜单的一个来源：扩展 id 与它登记的菜单（扩展的 menubarMenus 字段就是这个形状）。 */
export interface DesignerMenubarMenuSource<Ctx = unknown> {
  readonly id: string
  readonly menubarMenus?: readonly DesignerMenubarMenu<Ctx>[]
}

/**
 * 合起内置菜单与各来源登记的菜单：内置在前，来源按登记顺序在后。菜单 id 与内置的或彼此重名时抛 DesignerExtensionError，
 * 名字空间是 menubar-menu，与内置的撞时报 @xihan-ui/designer-shell。
 */
export function collectMenubarMenus<Ctx>(builtins: readonly DesignerMenubarMenu<Ctx>[], sources: readonly DesignerMenubarMenuSource<Ctx>[]): DesignerMenubarMenu<Ctx>[] {
  const owners = new Map<string, string>(builtins.map(menu => [menu.id, '@xihan-ui/designer-shell']))
  const menus = [...builtins]
  for (const source of sources) {
    for (const menu of source.menubarMenus ?? []) {
      const owner = owners.get(menu.id)
      if (owner !== undefined)
        throw new DesignerExtensionError('menubar-menu', menu.id, [owner, source.id])
      owners.set(menu.id, source.id)
      menus.push(menu)
    }
  }
  return menus
}

/** 命令菜单栏的选项。 */
export interface CommandMenubarOptions {
  /** 快捷键提示按哪个平台写：auto（缺省）建菜单栏时测一次。 */
  readonly platform?: KbdPlatform
  /** 窄屏那颗「菜单」钮上的图标，图标集见 @xihan-ui/icons；不给只写文字。 */
  readonly menuIcon?: IconRecord
}

/** 命令菜单栏要的两段文字：整条菜单栏的名字与窄屏那颗钮上的字，都在 xh-designer-commands 那一桶里。 */
export type CommandMenubarLabels = Pick<DesignerCommandsTranslations, 'menubar' | 'menu'>

/**
 * 命令菜单栏：一条数据模式的 <xh-menubar>，每张菜单一个入口，条目按命令铺；窄屏（外框的 data-narrow）时这一条收起，
 * 换成一颗「菜单」钮，点开的 <xh-menu> 里每张菜单是一个子菜单。由调用方以 slot="menubar" 交给外框。
 */
export interface CommandMenubar<Ctx> {
  /** 菜单栏的外壳，由调用方放进外框。 */
  readonly element: HTMLElement
  /** 里面那条 <xh-menubar>。 */
  readonly menubar: HTMLElement
  /**
   * 换上排好的菜单与此刻的状态：文字、图标、快捷键提示与读屏念的快捷键（aria-keyshortcuts，含第二快捷键）、可用与勾选每次都刷新，数据没变时不重设；
   * 之后每次打开菜单（含窄屏那张）都用这一份命令表与上下文按此刻的状态重算一遍。
   * 普通命令是一条，开关式命令是勾选条目（选中即收起），菜单命令是子菜单（勾选与单选值交给子层，勾选条目同样选中即收起）；
   * 弹层命令不进菜单栏，开发期报一条告警。
   */
  readonly update: (menus: readonly ArrangedMenubarMenu<Ctx>[], commands: DesignerCommandTable<Ctx>, context: Ctx, labels: CommandMenubarLabels) => void
}

type MenubarHost = XhMenubarElement
type MenubarNode = NonNullable<MenubarHost['collection']>[number]
type MenuHost = XhMenuElement

/** 条目选中后做什么：执行一条命令，或交给菜单命令的 select。 */
type MenubarAction
  = | { readonly kind: 'command', readonly id: string }
    | { readonly kind: 'item', readonly command: string, readonly value: string }

/** 一轮铺出的数据。 */
interface MenubarData {
  readonly collection: MenubarNode[]
  readonly checkboxValue: string[]
  readonly actions: Map<string, MenubarAction>
}

/** 窄屏菜单里每张菜单那个子菜单入口的值前缀。 */
const COMPACT_MENU_PREFIX = 'menu:'

/** 建一条命令菜单栏；选中条目执行对应命令，用的是最近一次 update 交来的命令表与上下文。 */
export function createCommandMenubar<Ctx>(doc: Document, options: CommandMenubarOptions = {}): CommandMenubar<Ctx> {
  defineMenubarElements()
  const platform = resolvePlatform(options.platform)
  const menubar = createAuthoredElement(doc, 'xh-menubar', { size: 'sm' }) as MenubarHost
  const bar = createAuthoredElement(doc, 'div', { 'data-scope': 'designer-menubar', 'data-part': 'bar' }, [menubar])
  const triggerLabel = createAuthoredElement(doc, 'span', { 'data-scope': 'designer-menubar', 'data-part': 'menu-label' })
  const triggerChildren: HTMLElement[] = []
  if (options.menuIcon) {
    const glyph = createAuthoredElement(doc, 'xh-icon', { 'data-scope': 'designer-menubar', 'data-part': 'menu-icon' }) as HTMLElement & { icon?: IconRecord }
    glyph.icon = options.menuIcon
    triggerChildren.push(glyph)
  }
  triggerChildren.push(triggerLabel)
  const trigger = createAuthoredElement(doc, 'button', { 'type': 'button', 'aria-haspopup': 'menu', 'data-scope': 'designer-menubar', 'data-part': 'menu-trigger' }, triggerChildren) as HTMLButtonElement
  const compact = createAuthoredElement(doc, 'div', { 'data-scope': 'designer-menubar', 'data-part': 'compact' }, [trigger])
  const element = createAuthoredElement(doc, 'div', { 'data-scope': 'designer-menubar', 'data-part': 'root' }, [bar, compact])
  /** 已经报过不进菜单栏的弹层命令。 */
  const warned = new Set<string>()
  let current: { menus: readonly ArrangedMenubarMenu<Ctx>[], commands: DesignerCommandTable<Ctx>, context: Ctx, labels: CommandMenubarLabels } | undefined
  let data: MenubarData = { collection: [], checkboxValue: [], actions: new Map() }
  let collectionKey: string | undefined
  let checkedKey: string | undefined
  let menu: MenuHost | undefined
  let compactKey: string | undefined

  /** 一条命令铺成的条目；弹层命令不铺。 */
  const itemOf = (command: DesignerCommand<Ctx>, value: string, context: Ctx, commands: DesignerCommandTable<Ctx>, actions: Map<string, MenubarAction>): MenubarNode | undefined => {
    if (command.panel !== undefined) {
      if (isDev() && !warned.has(command.id)) {
        warned.add(command.id)
        reportDiagnostic({
          code: DIAGNOSTIC_WARN,
          level: 'warn',
          scope: 'designer-commands',
          message: `命令 ${command.id} 是弹层命令，菜单条目当不了弹层的锚点，它不进菜单栏；从排列里去掉它，或放在工具栏上`,
          detail: { id: command.id },
        })
      }
      return undefined
    }
    const node: MenubarNode = { value, label: commandLabel(command, context) }
    if (command.icon)
      node.icon = command.icon
    if (command.menu) {
      const sub = commandMenuData(command.menu(context), commands, context, `${value}/`)
      for (const child of sub.collection) {
        const raw = child.value.slice(value.length + 1)
        actions.set(child.value, raw.startsWith(MENU_COMMAND_PREFIX)
          ? { kind: 'command', id: raw.slice(MENU_COMMAND_PREFIX.length) }
          : { kind: 'item', command: command.id, value: raw.slice(MENU_ITEM_PREFIX.length) })
      }
      // 子层的勾选写成受控值，勾选条目选中即收起：受控的子层不另外上报勾选改动，靠根上的 item-select 执行
      node.children = sub.collection.map(child => (child.kind === 'checkbox' ? { ...child, closeOnSelect: true } : child))
      node.checkboxValue = sub.checkboxValue
      node.radioValue = sub.radioValue
    }
    else {
      actions.set(value, { kind: 'command', id: command.id })
      if (command.checked) {
        node.kind = 'checkbox'
        node.closeOnSelect = true
      }
      if (command.shortcut)
        node.shortcut = formatShortcut(command.shortcut, platform)
      const keyshortcuts = commandKeyshortcuts(command, platform)
      if (keyshortcuts !== undefined)
        node.keyshortcuts = keyshortcuts
    }
    if (!commandEnabled(command, context))
      node.disabled = true
    if (command.tone)
      node.tone = command.tone
    return node
  }

  const build = (menus: readonly ArrangedMenubarMenu<Ctx>[], commands: DesignerCommandTable<Ctx>, context: Ctx): MenubarData => {
    const actions = new Map<string, MenubarAction>()
    const checkboxValue: string[] = []
    const collection = menus.map(({ menu: entry, groups }): MenubarNode => {
      const items: MenubarNode[] = []
      groups.forEach((group) => {
        let first = true
        for (const id of group) {
          const command = commands.get(id)
          if (!command)
            throw new TypeError(`[xh] 菜单栏里的 ${id} 不是登记过的命令`)
          const node = itemOf(command, `${entry.id}/${id}`, context, commands, actions)
          if (!node)
            continue
          if (first && items.length > 0)
            node.separatorBefore = true
          first = false
          if (node.kind === 'checkbox' && command.checked?.(context))
            checkboxValue.push(node.value)
          items.push(node)
        }
      })
      return { value: entry.id, label: labelOf(entry, context), items }
    })
    return { collection: collection.filter(node => (node.items?.length ?? 0) > 0), checkboxValue, actions }
  }

  /** 窄屏菜单的数据：每张菜单一个子菜单入口，里面是同一份条目，勾选值是这张菜单里勾上的那几条。 */
  const paintCompact = (host: MenuHost): void => {
    const checked = new Set(data.checkboxValue)
    const nodes = data.collection.map((node): MenuNode => ({
      value: `${COMPACT_MENU_PREFIX}${node.value}`,
      label: node.label ?? node.value,
      children: (node.items ?? []) as MenuNode[],
      checkboxValue: (node.items ?? []).filter(item => checked.has(item.value)).map(item => item.value),
    }))
    const key = JSON.stringify(nodes)
    if (key === compactKey)
      return
    compactKey = key
    host.collection = nodes
  }

  /** 按此刻的数据铺菜单栏与窄屏菜单：数据没变时不重设，开着的菜单不受打扰。 */
  const paint = (): void => {
    if (!current)
      return
    data = build(current.menus, current.commands, current.context)
    const key = JSON.stringify(data.collection)
    if (key !== collectionKey) {
      collectionKey = key
      menubar.collection = data.collection
    }
    const checked = JSON.stringify(data.checkboxValue)
    if (checked !== checkedKey) {
      checkedKey = checked
      menubar.checkboxValue = data.checkboxValue
    }
    if (menu?.open)
      paintCompact(menu)
  }

  const choose = (value: string): void => {
    const action = data.actions.get(value)
    if (!action || !current)
      return
    if (action.kind === 'command') {
      runCommand(current.commands, action.id, current.context)
    }
    else {
      const command = current.commands.get(action.command)
      if (command && commandEnabled(command, current.context))
        command.select?.(action.value, current.context)
    }
    // 选中改的状态不一定让设计器重新刷新菜单栏：按此刻的状态重铺
    paint()
  }
  menubar.addEventListener('item-select', event => choose((event as CustomEvent<{ value: string }>).detail.value))
  // 打开或换一张菜单时按此刻的状态重铺：状态变了设计器不一定刷新菜单栏（如外框变窄收起面板）
  menubar.addEventListener('value-change', (event) => {
    if ((event as CustomEvent<{ value: string | null }>).detail.value != null)
      paint()
  })

  const ensureMenu = (): MenuHost => {
    if (menu)
      return menu
    const host = createAuthoredElement(doc, 'xh-menu', { 'data-scope': 'designer-menubar' }) as MenuHost
    host.anchor = trigger
    host.open = false
    host.placement = 'bottom-start'
    host.addEventListener('open-change', (event) => {
      host.open = (event as CustomEvent<{ open: boolean }>).detail.open
    })
    host.addEventListener('item-select', event => choose((event as CustomEvent<{ value: string }>).detail.value))
    compact.append(host)
    menu = host
    return host
  }
  trigger.addEventListener('click', () => {
    const host = ensureMenu()
    if (host.open) {
      host.open = false
      return
    }
    paint()
    compactKey = undefined
    paintCompact(host)
    host.open = true
  })

  return {
    element,
    menubar,
    update(menus, commands, context, labels) {
      current = { menus, commands, context, labels }
      if (!menubar.translations || menubar.translations.root !== labels.menubar)
        menubar.translations = { root: labels.menubar }
      setText(triggerLabel, labels.menu)
      paint()
    },
  }
}

/** 菜单入口上的文字。 */
function labelOf<Ctx>(menu: DesignerMenubarMenu<Ctx>, context: Ctx): string {
  return typeof menu.label === 'function' ? menu.label(context) : menu.label
}
