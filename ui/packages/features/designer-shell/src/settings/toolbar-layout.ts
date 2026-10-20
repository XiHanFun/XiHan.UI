/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 设置对话框「工具栏」页的按钮表：一组一块，组头是三态勾选框与拖动把手，下面每条命令一行（勾选框、图标、名字、
// 快捷键、拖动把手）。组这一层是一个 <xh-sortable>，组里的命令各是一个同 group 的 <xh-sortable>，命令能跨组挪。
// 改动写成 toolbar.layout 的整份值（DesignerToolbarCustomization）；表下一颗「恢复默认」删掉这个键。sortable 的 root、item 与
// 手柄由它写 data-scope / data-part，这几处另用 data-toolbar-* 标出。

import type { IconRecord } from '@xihan-ui/core'
import type { JsonValue } from '@xihan-ui/core/json'
import type { DesignerCommandTable } from '../extensions/commands'
import type { DesignerToolbarCustomization } from '../extensions/toolbar-customization'
import type { DesignerSettingsTranslations } from '../translations'
import { detectKbdPlatform } from '@xihan-ui/core/hotkey'
import { formatShortcut } from '@xihan-ui/designer-kit'
import { createAuthoredElement, setText } from '@xihan-ui/web-components/authoring'
import { commandShortLabel, visibleGroups } from '../extensions/commands'
import { mergeToolbarCustomization, toolbarCustomizationOf } from '../extensions/toolbar-customization'
import { DESIGNER_SETTING_KEYS } from './model'

/** 按钮表里一条命令的短文字、图标与快捷键。 */
export interface DesignerToolbarCommandInfo {
  readonly id: string
  readonly label: string
  readonly icon?: IconRecord
  readonly shortcut?: readonly string[]
}

/** 「工具栏」页按钮表要的数据：缺省排列（arrangeCommands('toolbar', …) 的结果）与其中各条命令的文字、图标与快捷键。 */
export interface DesignerToolbarSettingsSource {
  readonly defaults: readonly (readonly string[])[]
  readonly commands: readonly DesignerToolbarCommandInfo[]
}

/** 从命令表现算按钮表要的数据：defaults 里的命令取短文字（commandShortLabel：撤销这类文字随下一步变的命令写固定的短名），命令表里没有的跳过。各款每轮更新时交给设置对话框的 toolbar。 */
export function toolbarSettingsSource<Ctx>(defaults: readonly (readonly string[])[], commands: DesignerCommandTable<Ctx>, context: Ctx): DesignerToolbarSettingsSource {
  const known = visibleGroups(defaults, commands, context).map(group => group.filter(id => commands.has(id))).filter(group => group.length > 0)
  return {
    defaults: known,
    commands: known.flat().flatMap((id) => {
      const command = commands.get(id)
      return command ? [{ id, label: commandShortLabel(command, context), ...(command.icon ? { icon: command.icon } : {}), ...(command.shortcut ? { shortcut: command.shortcut } : {}) }] : []
    }),
  }
}

export interface ToolbarLayoutState {
  /** 设置里此刻的 toolbar.layout。 */
  readonly value: JsonValue | undefined
  readonly source: DesignerToolbarSettingsSource | undefined
  readonly translations: DesignerSettingsTranslations
  readonly readonly: boolean
}

export interface ToolbarLayoutEditor {
  readonly element: HTMLElement
  readonly update: (state: ToolbarLayoutState) => void
}

const SCOPE = 'designer-settings'

type SortableHost = HTMLElement & { ids?: string[], disabled?: boolean, group?: string, listId?: string, translations?: Record<string, unknown> }
type CheckboxHost = HTMLElement & { checked?: boolean | 'indeterminate', disabled?: boolean }
type ButtonHost = HTMLElement & { disabled?: boolean }

interface CommandView {
  readonly element: HTMLElement
  readonly checkbox: CheckboxHost
  readonly root: HTMLElement
  readonly icon: HTMLElement & { icon?: unknown }
  readonly text: HTMLElement
  readonly shortcut: HTMLElement
  readonly handle: HTMLElement
}

interface GroupView {
  readonly id: string
  readonly element: HTMLElement
  readonly sortable: SortableHost
  readonly list: HTMLElement
  readonly checkbox: CheckboxHost
  readonly root: HTMLElement
  readonly text: HTMLElement
  readonly handle: HTMLElement
  commands: string[]
}

let editors = 0

function checkbox(doc: Document, label: HTMLElement[]): { host: CheckboxHost, root: HTMLElement } {
  const root = createAuthoredElement(doc, 'button', { 'data-xh-part': 'root', 'type': 'button' }, [createAuthoredElement(doc, 'span', { 'data-xh-part': 'indicator' })])
  const host: CheckboxHost = createAuthoredElement(doc, 'xh-checkbox', { size: 'sm' }, [
    createAuthoredElement(doc, 'label', { 'data-xh-part': 'label' }, [root, ...label]),
  ])
  return { host, root }
}

/** 建「工具栏」页的按钮表；write 收新的定制，undefined 即删掉这个键（回到缺省排列）。 */
export function createToolbarLayoutEditor(doc: Document, write: (value: DesignerToolbarCustomization | undefined) => void): ToolbarLayoutEditor {
  editors += 1
  const prefix = `xh-designer-toolbar-${editors}`
  const platform = detectKbdPlatform()
  const outerRoot = createAuthoredElement(doc, 'div', { 'data-xh-part': 'root', 'data-toolbar-groups': '' })
  const outerDrop = createAuthoredElement(doc, 'div', { 'data-xh-part': 'drop-indicator' })
  const outerLive = createAuthoredElement(doc, 'div', { 'data-xh-part': 'live-region' })
  outerRoot.append(outerDrop, outerLive)
  const outer: SortableHost = createAuthoredElement(doc, 'xh-sortable', { 'list-id': `${prefix}-groups`, 'data-scope': SCOPE, 'data-part': 'toolbar-sortable' }, [outerRoot])
  const resetText = createAuthoredElement(doc, 'span', {})
  const reset: ButtonHost = createAuthoredElement(doc, 'xh-button', { 'variant': 'outline', 'size': 'sm', 'data-scope': SCOPE, 'data-part': 'toolbar-layout-reset' }, [
    createAuthoredElement(doc, 'button', { 'data-xh-part': 'root', 'type': 'button' }, [resetText]),
  ])
  const element = createAuthoredElement(doc, 'div', { 'data-scope': SCOPE, 'data-part': 'toolbar-layout' }, [outer, reset])
  let groups: GroupView[] = []
  let hidden = new Set<string>()
  const commandViews = new Map<string, CommandView>()
  let state: ToolbarLayoutState | undefined
  let groupIds = 0

  const infoOf = (id: string): DesignerToolbarCommandInfo | undefined => state?.source?.commands.find(command => command.id === id)
  const label = (id: string): string => infoOf(id)?.label ?? id
  const groupIndex = (id: string): number => groups.findIndex(group => group.id === id) + 1

  /** 此刻的定制：空组去掉，藏起的只留还在表里的。 */
  const current = (): DesignerToolbarCustomization => {
    const listed = groups.map(group => group.commands).filter(group => group.length > 0)
    const kept = listed.flat().filter(id => hidden.has(id))
    return { groups: listed, ...(kept.length > 0 ? { hidden: kept } : {}) }
  }
  const commit = (): void => {
    if (!state?.readonly)
      write(current())
  }

  /** 挪了节点以后焦点留在原来那颗手柄上。 */
  const keepFocus = (move: () => void): void => {
    const focused = doc.activeElement instanceof HTMLElement && element.contains(doc.activeElement) ? doc.activeElement : undefined
    move()
    if (focused && focused.isConnected && doc.activeElement !== focused)
      focused.focus()
  }

  const placeCommands = (group: GroupView, ids: string[]): void => {
    const drop = group.list.querySelector(':scope > [data-xh-part="drop-indicator"], :scope > [data-part="drop-indicator"]')
    for (const id of ids)
      group.list.insertBefore(commandViews.get(id)!.element, drop)
    group.commands = [...ids]
    group.sortable.ids = [...ids]
  }

  const createCommand = (id: string): CommandView => {
    const icon = createAuthoredElement(doc, 'xh-icon', { 'data-scope': SCOPE, 'data-part': 'toolbar-command-icon', 'aria-hidden': 'true' }) as CommandView['icon']
    const text = createAuthoredElement(doc, 'span', { 'data-xh-part': 'text' })
    const box = checkbox(doc, [icon, text])
    box.host.setAttribute('data-scope', SCOPE)
    box.host.setAttribute('data-part', 'toolbar-command-toggle')
    box.host.addEventListener('checked-change', (event) => {
      event.stopPropagation()
      if (state?.readonly)
        return
      const { checked } = (event as CustomEvent<{ checked: boolean }>).detail
      if (checked)
        hidden.delete(id)
      else
        hidden.add(id)
      paint()
      commit()
    })
    const shortcut = createAuthoredElement(doc, 'span', { 'data-scope': SCOPE, 'data-part': 'toolbar-command-shortcut' })
    const handle = createAuthoredElement(doc, 'button', { 'data-xh-part': 'item-drag-trigger', 'item-id': id, 'type': 'button', 'data-toolbar-handle': '' })
    const row = createAuthoredElement(doc, 'div', { 'data-xh-part': 'item', 'item-id': id, 'data-toolbar-command': id }, [box.host, shortcut, handle])
    const view = { element: row, checkbox: box.host, root: box.root, icon, text, shortcut, handle }
    commandViews.set(id, view)
    return view
  }

  const createGroup = (ids: readonly string[]): GroupView => {
    groupIds += 1
    const id = `${prefix}-g${groupIds}`
    const text = createAuthoredElement(doc, 'span', { 'data-xh-part': 'text' })
    const box = checkbox(doc, [text])
    box.host.setAttribute('data-scope', SCOPE)
    box.host.setAttribute('data-part', 'toolbar-group-toggle')
    const handle = createAuthoredElement(doc, 'button', { 'data-xh-part': 'item-drag-trigger', 'item-id': id, 'type': 'button', 'data-toolbar-handle': '' })
    const list = createAuthoredElement(doc, 'div', { 'data-xh-part': 'root', 'data-toolbar-commands': '' }, [
      createAuthoredElement(doc, 'div', { 'data-xh-part': 'drop-indicator' }),
      createAuthoredElement(doc, 'div', { 'data-xh-part': 'live-region' }),
    ])
    const sortable: SortableHost = createAuthoredElement(doc, 'xh-sortable', { 'group': `${prefix}-commands`, 'list-id': id, 'data-scope': SCOPE, 'data-part': 'toolbar-sortable' }, [list])
    const head = createAuthoredElement(doc, 'div', { 'data-scope': SCOPE, 'data-part': 'toolbar-group-head' }, [box.host, handle])
    const groupElement = createAuthoredElement(doc, 'div', { 'data-xh-part': 'item', 'item-id': id, 'data-toolbar-group': '' }, [head, sortable])
    const view: GroupView = { id, element: groupElement, sortable, list, checkbox: box.host, root: box.root, text, handle, commands: [] }
    box.host.addEventListener('checked-change', (event) => {
      event.stopPropagation()
      if (state?.readonly)
        return
      const { checked } = (event as CustomEvent<{ checked: boolean }>).detail
      for (const command of view.commands) {
        if (checked)
          hidden.delete(command)
        else
          hidden.add(command)
      }
      paint()
      commit()
    })
    for (const command of ids)
      createCommand(command)
    placeCommands(view, [...ids])
    return view
  }

  outer.addEventListener('sort', (event) => {
    if (event.target !== outer)
      return
    event.stopPropagation()
    const ids = (event as CustomEvent<{ ids: string[] }>).detail.ids
    keepFocus(() => {
      groups = ids.map(id => groups.find(group => group.id === id)!)
      for (const group of groups)
        outerRoot.insertBefore(group.element, outerDrop)
      outer.ids = [...ids]
    })
    paint()
    commit()
  })
  outerRoot.addEventListener('sort', (event) => {
    const host = event.target as SortableHost
    const group = groups.find(item => item.sortable === host)
    if (!group)
      return
    event.stopPropagation()
    keepFocus(() => placeCommands(group, (event as CustomEvent<{ ids: string[] }>).detail.ids))
    commit()
  })
  outerRoot.addEventListener('transfer', (event) => {
    const detail = (event as CustomEvent<{ fromList: string, toList: string, fromIds: string[], toIds: string[] }>).detail
    const from = groups.find(group => group.id === detail.fromList)
    const to = groups.find(group => group.id === detail.toList)
    if (!from || !to)
      return
    event.stopPropagation()
    keepFocus(() => {
      placeCommands(to, detail.toIds)
      placeCommands(from, detail.fromIds)
    })
    paint()
    commit()
  })
  reset.addEventListener('click', () => {
    if (!state?.readonly)
      write(undefined)
  })

  /** 按设置里的值整份重铺。 */
  const build = (merged: readonly (readonly string[])[], nextHidden: ReadonlySet<string>): void => {
    for (const group of groups)
      group.element.remove()
    commandViews.clear()
    hidden = new Set(nextHidden)
    groups = merged.map(ids => createGroup(ids))
    for (const group of groups)
      outerRoot.insertBefore(group.element, outerDrop)
    outer.ids = groups.map(group => group.id)
  }

  function paint(): void {
    if (!state)
      return
    const t = state.translations
    const readonly = state.readonly
    outerRoot.setAttribute('aria-label', t.toolbarGroups)
    outer.translations = { root: t.toolbarGroups, item: (id: string) => t.toolbarGroup(groupIndex(id)), itemDragTrigger: (name: string) => t.toolbarMove(name) }
    outer.disabled = readonly
    setText(resetText, t.toolbarLayoutReset)
    reset.disabled = readonly || state.value === undefined
    groups.forEach((group, index) => {
      const name = t.toolbarGroup(index + 1)
      setText(group.text, name)
      group.root.setAttribute('aria-label', t.toolbarGroupToggle(index + 1))
      group.list.setAttribute('aria-label', t.toolbarCommands(index + 1))
      group.sortable.translations = { root: t.toolbarCommands(index + 1), item: (id: string) => label(id), itemDragTrigger: (labelText: string) => t.toolbarMove(labelText) }
      group.sortable.disabled = readonly
      const shown = group.commands.filter(id => !hidden.has(id)).length
      group.checkbox.checked = shown === 0 ? false : shown === group.commands.length ? true : 'indeterminate'
      group.checkbox.disabled = readonly || group.commands.length === 0
      for (const id of group.commands) {
        const view = commandViews.get(id)!
        const command = infoOf(id)
        const text = label(id)
        setText(view.text, text)
        view.root.setAttribute('aria-label', t.toolbarCommandToggle(text))
        view.icon.icon = command?.icon
        view.icon.hidden = command?.icon === undefined
        const keys = command?.shortcut
        setText(view.shortcut, keys === undefined ? '' : formatShortcut(keys, platform))
        view.shortcut.hidden = keys === undefined
        view.checkbox.checked = !hidden.has(id)
        view.checkbox.disabled = readonly
      }
    })
  }

  return {
    element,
    update(next) {
      state = next
      const source = next.source
      if (!source) {
        build([], new Set())
        paint()
        return
      }
      const value = next.value === undefined ? undefined : toolbarCustomizationOf({ [DESIGNER_SETTING_KEYS.toolbarLayout]: next.value })
      const merged = mergeToolbarCustomization(source.defaults, value)
      const nextHidden = new Set((value?.hidden ?? []).filter(id => merged.some(group => group.includes(id))))
      const mine = current()
      // 自己刚写出去的值回来时不重铺，免得拖动后的焦点丢掉
      if (JSON.stringify([merged, [...nextHidden].sort()]) !== JSON.stringify([mine.groups, [...(mine.hidden ?? [])].sort()]))
        build(merged, nextHidden)
      paint()
    },
  }
}
