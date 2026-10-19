/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 设置对话框「布局」页的面板表：逐块面板一行，列出显示、位置、顺序与收起，改的是外框的布局（外框派发 layout-change，
// 设计器照常写进设置）。表下一颗「恢复默认布局」。画布浮动件只能显隐；锁定的面板与整页只读时控件都不可用。

import type { DesignerPanelEntry, XhDesignerFrameElement } from '../frame/frame-element'
import type { DesignerLayoutDock } from '../frame/layout'
import type { DesignerSettingsTranslations } from '../translations'
import { createAuthoredElement, setText } from '@xihan-ui/web-components/authoring'

/** 「布局」页改的外框：列面板、改显隐与位置、恢复默认。设计器把自己的外框交给设置对话框的 frame。 */
export type DesignerSettingsFrame = Pick<XhDesignerFrameElement, 'panelEntries' | 'resolvedLayout' | 'setPanelVisible' | 'movePanel' | 'setPanelMinimized' | 'floatPanel' | 'dockPanel' | 'resetLayout'>

/** 面板表这一刻的状态。 */
export interface PanelLayoutState {
  readonly translations: DesignerSettingsTranslations
  /** 整页只读（宿主锁定了 layout.panels）。 */
  readonly readonly: boolean
  /** 从右往左写：左右两栏的叫法对调。 */
  readonly rtl: boolean
}

export interface PanelLayoutEditor {
  readonly element: HTMLElement
  readonly update: (state: PanelLayoutState) => void
}

const SCOPE = 'designer-settings'
/** 位置下拉的取值：三栏加浮动。 */
const PLACES = ['start', 'end', 'bottom', 'float'] as const
type Place = typeof PLACES[number]
/** 表的五列；表头与单元格都带 data-column，窄屏按它重排。 */
const PANEL_COLUMNS = ['panel', 'visible', 'dock', 'order', 'minimized'] as const
type PanelColumn = typeof PANEL_COLUMNS[number]

type SwitchElement = HTMLElement & { checked?: boolean, disabled?: boolean }
type SelectElement = HTMLElement & { value?: unknown, disabled?: boolean }
type ButtonElement = HTMLElement & { disabled?: boolean }

interface PanelRow {
  readonly element: HTMLElement
  readonly icon: HTMLElement & { icon?: unknown }
  readonly label: HTMLElement
  readonly visible: SwitchElement
  readonly place: SelectElement
  readonly placeTexts: ReadonlyMap<Place, HTMLElement>
  readonly placeItems: ReadonlyMap<Place, HTMLElement>
  readonly overlay: HTMLElement
  readonly up: ButtonElement
  readonly down: ButtonElement
  readonly minimized: SwitchElement
}

function switchControl(doc: Document, part: string, onChange: (checked: boolean) => void): SwitchElement {
  const element: SwitchElement = createAuthoredElement(doc, 'xh-switch', { 'size': 'sm', 'data-scope': SCOPE, 'data-part': part }, [
    createAuthoredElement(doc, 'button', { 'data-xh-part': 'root', 'type': 'button' }, [createAuthoredElement(doc, 'span', { 'data-xh-part': 'thumb' })]),
  ])
  element.addEventListener('checked-change', (event) => {
    event.stopPropagation()
    const { checked } = (event as CustomEvent<{ checked: boolean }>).detail
    element.checked = checked
    onChange(checked)
  })
  return element
}

function moveButton(doc: Document, direction: 'up' | 'down', onClick: () => void): ButtonElement {
  const element: ButtonElement = createAuthoredElement(doc, 'xh-button', { 'variant': 'ghost', 'size': 'sm', 'icon-only': true, 'data-scope': SCOPE, 'data-part': `panel-move-${direction}` }, [
    createAuthoredElement(doc, 'button', { 'data-xh-part': 'root', 'type': 'button' }, [
      createAuthoredElement(doc, 'span', { 'data-scope': SCOPE, 'data-part': 'panel-move-glyph', 'data-glyph': direction }),
    ]),
  ])
  element.addEventListener('click', onClick)
  return element
}

/** 建「布局」页的面板表；frame 每次现取，没有外框时表是空的。 */
export function createPanelLayoutEditor(doc: Document, frame: () => DesignerSettingsFrame | undefined): PanelLayoutEditor {
  const cell = (column: PanelColumn, children: Node[], part?: string): HTMLElement => createAuthoredElement(doc, 'div', { 'role': 'cell', 'data-scope': SCOPE, 'data-column': column, ...(part ? { 'data-part': part } : {}) }, children)
  const headers = PANEL_COLUMNS.map(column => createAuthoredElement(doc, 'div', { 'role': 'columnheader', 'data-scope': SCOPE, 'data-part': 'panel-column', 'data-column': column }))
  const head = createAuthoredElement(doc, 'div', { 'role': 'row', 'data-scope': SCOPE, 'data-part': 'panel-row', 'data-head': '' }, headers)
  const table = createAuthoredElement(doc, 'div', { 'role': 'table', 'data-scope': SCOPE, 'data-part': 'panel-table' }, [head])
  const resetText = createAuthoredElement(doc, 'span', {})
  const reset: ButtonElement = createAuthoredElement(doc, 'xh-button', { 'variant': 'outline', 'size': 'sm', 'data-scope': SCOPE, 'data-part': 'layout-reset' }, [
    createAuthoredElement(doc, 'button', { 'data-xh-part': 'root', 'type': 'button' }, [resetText]),
  ])
  const element = createAuthoredElement(doc, 'div', { 'data-scope': SCOPE, 'data-part': 'panel-layout' }, [table, reset])
  const rows = new Map<string, PanelRow>()
  let state: PanelLayoutState | undefined

  /** 改完外框立刻按它重铺；设计器随后赋回 settings 时再刷一遍也只是同样的结果。 */
  const act = (change: (target: DesignerSettingsFrame) => void): void => {
    const target = frame()
    if (!target || state?.readonly)
      return
    change(target)
    render()
  }
  reset.addEventListener('click', () => act(target => target.resetLayout()))

  const createRow = (name: string): PanelRow => {
    const icon = createAuthoredElement(doc, 'xh-icon', { 'data-scope': SCOPE, 'data-part': 'panel-icon', 'aria-hidden': 'true' }) as PanelRow['icon']
    const label = createAuthoredElement(doc, 'span', { 'data-scope': SCOPE, 'data-part': 'panel-label' })
    const visible = switchControl(doc, 'panel-visible', checked => act(target => target.setPanelVisible(name, checked)))
    const minimized = switchControl(doc, 'panel-minimized', checked => act(target => target.setPanelMinimized(name, checked)))
    const placeTexts = new Map<Place, HTMLElement>()
    const placeItems = new Map<Place, HTMLElement>()
    for (const place of PLACES) {
      const text = createAuthoredElement(doc, 'span', { 'data-xh-part': 'item-text' })
      placeTexts.set(place, text)
      placeItems.set(place, createAuthoredElement(doc, 'div', { 'data-xh-part': 'item', 'value': place }, [text, createAuthoredElement(doc, 'span', { 'data-xh-part': 'item-indicator' })]))
    }
    const place: SelectElement = createAuthoredElement(doc, 'xh-select', { 'size': 'sm', 'data-scope': SCOPE, 'data-part': 'panel-dock' }, [
      createAuthoredElement(doc, 'div', { 'data-xh-part': 'root' }, [
        createAuthoredElement(doc, 'div', { 'data-xh-part': 'control' }, [
          createAuthoredElement(doc, 'button', { 'data-xh-part': 'trigger', 'type': 'button' }, [
            createAuthoredElement(doc, 'span', { 'data-xh-part': 'value-text' }),
            createAuthoredElement(doc, 'span', { 'data-xh-part': 'indicator' }),
          ]),
        ]),
        createAuthoredElement(doc, 'div', { 'data-xh-part': 'positioner' }, [
          createAuthoredElement(doc, 'div', { 'data-xh-part': 'content' }, [createAuthoredElement(doc, 'div', { 'data-xh-part': 'list' }, [...placeItems.values()])]),
        ]),
      ]),
    ])
    place.addEventListener('value-change', (event) => {
      event.stopPropagation()
      const next = (event as CustomEvent<{ value: string[] }>).detail.value[0] as Place | undefined
      if (next === undefined)
        return
      place.value = [next]
      act((target) => {
        const entry = target.panelEntries().find(item => item.name === name)
        if (!entry)
          return
        if (next === 'float')
          target.floatPanel(name)
        else if (entry.floating && entry.dock === next)
          target.dockPanel(name)
        else
          target.movePanel(name, next)
      })
    })
    const overlay = createAuthoredElement(doc, 'span', { 'data-scope': SCOPE, 'data-part': 'panel-overlay' })
    const step = (delta: number): void => act((target) => {
      const entry = target.panelEntries().find(item => item.name === name)
      if (entry?.dock === undefined)
        return
      target.movePanel(name, entry.dock, target.resolvedLayout.docks[entry.dock].indexOf(name) + delta)
    })
    const up = moveButton(doc, 'up', () => step(-1))
    const down = moveButton(doc, 'down', () => step(1))
    const row = createAuthoredElement(doc, 'div', { 'role': 'row', 'data-scope': SCOPE, 'data-part': 'panel-row', 'data-panel': name }, [
      cell('panel', [icon, label], 'panel-name'),
      cell('visible', [visible]),
      cell('dock', [place, overlay]),
      cell('order', [up, down], 'panel-order'),
      cell('minimized', [minimized]),
    ])
    return { element: row, icon, label, visible, place, placeTexts, placeItems, overlay, up, down, minimized }
  }

  const paintRow = (row: PanelRow, entry: DesignerPanelEntry, siblings: readonly string[], t: DesignerSettingsTranslations, readonly: boolean, rtl: boolean): void => {
    const locked = readonly || entry.locked
    const hidden = frame()?.resolvedLayout.hidden.includes(entry.name) ?? false
    row.icon.icon = entry.icon
    row.icon.hidden = entry.icon === undefined
    setText(row.label, entry.label)
    row.visible.setAttribute('aria-label', t.layoutVisible(entry.label))
    row.visible.checked = !hidden
    row.visible.disabled = locked
    const docked = entry.dock !== undefined
    row.place.hidden = !docked
    row.overlay.hidden = docked
    setText(row.overlay, t.layoutDocks.overlay)
    const names: Record<Place, string> = { start: rtl ? t.layoutDocks.right : t.layoutDocks.left, end: rtl ? t.layoutDocks.left : t.layoutDocks.right, bottom: t.layoutDocks.bottom, float: t.layoutDocks.floating }
    for (const place of PLACES) {
      setText(row.placeTexts.get(place)!, names[place])
      row.placeItems.get(place)!.hidden = place === 'float' ? !entry.floatable && !entry.floating : !entry.movable && entry.dock !== place
    }
    row.place.setAttribute('aria-label', t.layoutDock(entry.label))
    const place: Place | undefined = entry.floating ? 'float' : entry.dock
    if (place !== undefined && JSON.stringify(row.place.value ?? []) !== JSON.stringify([place]))
      row.place.value = [place]
    row.place.disabled = locked || !(entry.movable || entry.floatable)
    const index = entry.dock === undefined ? -1 : siblings.indexOf(entry.name)
    const fixed = locked || !entry.movable || entry.floating || index < 0
    // 只有图形的钮，名字写在里面的 button 上
    row.up.querySelector('button')!.setAttribute('aria-label', t.layoutMoveUp(entry.label))
    row.down.querySelector('button')!.setAttribute('aria-label', t.layoutMoveDown(entry.label))
    row.up.disabled = fixed || index === 0
    row.down.disabled = fixed || index === siblings.length - 1
    row.up.hidden = !docked
    row.down.hidden = !docked
    row.minimized.setAttribute('aria-label', t.layoutMinimized(entry.label))
    row.minimized.checked = entry.minimized
    row.minimized.disabled = locked || !entry.minimizable
    row.minimized.hidden = !docked
  }

  function render(): void {
    if (!state)
      return
    const t = state.translations
    const target = frame()
    const entries = target?.panelEntries() ?? []
    const layout = target?.resolvedLayout
    const docks: readonly DesignerLayoutDock[] = ['start', 'end', 'bottom']
    // 三栏按布局里的先后，画布浮动件排在最后
    const ordered = [
      ...docks.flatMap(dock => (layout?.docks[dock] ?? []).flatMap(name => entries.filter(entry => entry.name === name))),
      ...entries.filter(entry => entry.dock === undefined),
    ]
    const columns: Record<string, string> = t.layoutColumns
    for (const header of headers)
      setText(header, columns[header.getAttribute('data-column')!]!)
    table.setAttribute('aria-label', t.layoutPanels)
    setText(resetText, t.layoutReset)
    reset.disabled = state.readonly || target === undefined || entries.every(entry => entry.locked)
    const focused = doc.activeElement instanceof HTMLElement && table.contains(doc.activeElement) ? doc.activeElement : undefined
    const wanted = new Set(ordered.map(entry => entry.name))
    for (const [name, row] of rows) {
      if (!wanted.has(name)) {
        row.element.remove()
        rows.delete(name)
      }
    }
    let previous: Element = head
    for (const entry of ordered) {
      let row = rows.get(entry.name)
      if (!row) {
        row = createRow(entry.name)
        rows.set(entry.name, row)
      }
      const siblings = entry.dock === undefined ? [] : (layout?.docks[entry.dock] ?? []).filter(name => wanted.has(name))
      paintRow(row, entry, siblings, t, state.readonly, state.rtl)
      if (previous.nextElementSibling !== row.element)
        previous.after(row.element)
      previous = row.element
    }
    // 换了先后的行挪过位置，焦点留在原来那颗钮上；钮到了头、不可用时换到同一行的另一颗
    if (focused && doc.activeElement !== focused && focused.isConnected) {
      const host = focused.closest<ButtonElement>('xh-button')
      const fallback = host?.getAttribute('data-part') === 'panel-move-up' ? host.nextElementSibling : host?.previousElementSibling
      const target = host?.disabled && fallback instanceof HTMLElement ? fallback.querySelector<HTMLElement>('button') : focused
      target?.focus()
    }
  }

  return {
    element,
    update(next) {
      state = next
      render()
    },
  }
}
