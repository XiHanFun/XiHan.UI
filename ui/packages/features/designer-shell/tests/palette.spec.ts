// @vitest-environment jsdom

import type { DiagnosticRecord } from '@xihan-ui/core'
import type { DesignerPaletteEventMap, DesignerPaletteGroup, XhDesignerPaletteElement } from '../src'
import { onDiagnostic, resetDiagnostics, setDiagnosticsConsoleOutput, setDiagnosticsDedupe, setDiagnosticsLevel } from '@xihan-ui/core'
import { setXhConfig } from '@xihan-ui/web-components'
import { afterEach, describe, expect, it } from 'vitest'
import { defineDesignerShell } from '../src'
import { designerShellZhCN } from '../src/locale'

defineDesignerShell()

afterEach(() => {
  document.body.innerHTML = ''
  setXhConfig({})
})

const check = { name: 'check', viewBox: '0 0 24 24', nodes: [{ tag: 'path', attrs: { d: 'M5 12l5 5L20 7' } }] } as const

const groups: DesignerPaletteGroup[] = [
  {
    id: 'human',
    label: '人工处理',
    items: [
      { id: 'approve', label: '审批', icon: check, description: '一人或多人审批', payload: { type: 'approve' } },
      { id: 'notify', label: '抄送', disabled: true },
    ],
  },
  {
    id: 'control',
    label: '流程控制',
    items: [
      { id: 'start', label: '开始' },
      { id: 'branch', label: '条件分支', payload: { type: 'branch' } },
    ],
  },
]

/** 收集这一段里的 wc.* 诊断：部件契约不全的库内元素会在这里报出来。 */
function recordWcDiagnostics(): { readonly codes: () => string[], readonly stop: () => void } {
  const seen: DiagnosticRecord[] = []
  resetDiagnostics()
  setDiagnosticsConsoleOutput(false)
  setDiagnosticsLevel('warn')
  setDiagnosticsDedupe(false)
  const off = onDiagnostic(record => void seen.push(record))
  return {
    codes: () => seen.filter(record => record.code.startsWith('wc.')).map(record => `${record.code} ${record.scope ?? ''}/${record.part ?? ''}`),
    stop: () => {
      off()
      resetDiagnostics()
    },
  }
}

async function mount(setup: (palette: XhDesignerPaletteElement) => void = () => {}): Promise<XhDesignerPaletteElement> {
  const palette = document.createElement('xh-designer-palette')
  setup(palette)
  document.body.append(palette)
  await palette.updateComplete
  return palette
}

function items(palette: Element): HTMLButtonElement[] {
  return Array.from(palette.querySelectorAll<HTMLButtonElement>('button[data-part="item"]'))
}

function item(palette: Element, id: string): HTMLButtonElement {
  return palette.querySelector<HTMLButtonElement>(`button[data-part="item"][data-id="${id}"]`)!
}

function record(palette: Element): DesignerPaletteEventMap['item-activate']['detail'][] {
  const seen: DesignerPaletteEventMap['item-activate']['detail'][] = []
  palette.addEventListener('item-activate', event => seen.push((event as DesignerPaletteEventMap['item-activate']).detail))
  return seen
}

function key(target: Element, name: string): void {
  target.dispatchEvent(new KeyboardEvent('keydown', { key: name, bubbles: true }))
}

async function search(palette: XhDesignerPaletteElement, text: string): Promise<void> {
  const field = palette.querySelector('xh-text-field')!
  field.dispatchEvent(new CustomEvent('value-change', { detail: { value: text }, bubbles: true }))
  await palette.updateComplete
}

describe('<xh-designer-palette>', () => {
  it('按分组列出物料：图标、名称与说明，分组带标题', async () => {
    setXhConfig(designerShellZhCN)
    const palette = await mount(element => element.groups = groups)
    expect(Array.from(palette.children, child => [child.getAttribute('data-part'), child.hasAttribute('data-xh-gen')])).toEqual([['header', true], ['body', true], ['empty', true]])
    expect(palette.querySelector('[data-part="title"]')!.textContent).toBe('物料')
    const sections = Array.from(palette.querySelectorAll<HTMLElement>('[data-part="group"]'))
    expect(sections.map(section => section.querySelector('[data-part="group-label"]')!.textContent)).toEqual(['人工处理', '流程控制'])
    expect(sections[0]!.getAttribute('role')).toBe('group')
    expect(sections[0]!.getAttribute('aria-labelledby')).toBe(sections[0]!.querySelector('[data-part="group-label"]')!.id)
    const approve = item(palette, 'approve')
    expect(approve.querySelector('xh-icon svg [data-xh-part="glyph"] path')).not.toBeNull()
    expect(approve.querySelector('[data-part="item-label"]')!.textContent).toBe('审批')
    const description = approve.querySelector('[data-part="item-description"]')!
    expect(description.textContent).toBe('一人或多人审批')
    expect(approve.getAttribute('aria-describedby')).toBe(description.id)
    expect(item(palette, 'notify').getAttribute('aria-disabled')).toBe('true')
    expect(palette.querySelector<HTMLElement>('[data-part="empty"]')!.hidden).toBe(true)
    expect(palette.querySelector<HTMLElement>('xh-text-field')!.hidden).toBe(true)
  })

  it('没有物料时显示空状态', async () => {
    setXhConfig(designerShellZhCN)
    const palette = await mount()
    const empty = palette.querySelector<HTMLElement>('[data-part="empty"]')!
    expect(empty.hidden).toBe(false)
    expect(empty.textContent).toBe('没有物料')
  })

  it('点击与回车（原生按钮的点击）派发 item-activate；禁用与只读时不派发', async () => {
    const palette = await mount(element => element.groups = groups)
    const activated = record(palette)
    item(palette, 'branch').click()
    item(palette, 'notify').click()
    expect(activated).toEqual([{ id: 'branch', payload: { type: 'branch' } }])
    palette.readonly = true
    await palette.updateComplete
    expect(items(palette).every(button => button.getAttribute('aria-disabled') === 'true')).toBe(true)
    item(palette, 'branch').click()
    expect(activated).toHaveLength(1)
  })

  it('方向键、Home、End 在物料间移动焦点，Tab 位跟着走；禁用的物料也能停留', async () => {
    const palette = await mount(element => element.groups = groups)
    const all = items(palette)
    expect(all.map(button => button.tabIndex)).toEqual([0, -1, -1, -1])
    all[0]!.focus()
    key(all[0]!, 'ArrowDown')
    expect(document.activeElement).toBe(all[1])
    key(all[1]!, 'ArrowRight')
    expect(document.activeElement).toBe(all[2])
    key(all[2]!, 'End')
    expect(document.activeElement).toBe(all[3])
    expect(all.map(button => button.tabIndex)).toEqual([-1, -1, -1, 0])
    key(all[3]!, 'ArrowUp')
    key(all[2]!, 'Home')
    expect(document.activeElement).toBe(all[0])
  })

  it('searchable 时按名称过滤，没有结果显示提示；分组只留有匹配的', async () => {
    setXhConfig(designerShellZhCN)
    const palette = await mount((element) => {
      element.groups = groups
      element.searchable = true
    })
    const field = palette.querySelector<HTMLElement>('xh-text-field')!
    expect(field.hidden).toBe(false)
    expect(field.querySelector('input')!.getAttribute('aria-label')).toBe('搜索物料')
    const changes: unknown[] = []
    document.body.addEventListener('value-change', event => changes.push(event))
    await search(palette, '分支')
    expect(changes).toEqual([])
    expect(items(palette).map(button => button.dataset.id)).toEqual(['branch'])
    expect(palette.querySelectorAll('[data-part="group"]')).toHaveLength(1)
    await search(palette, '没有这个')
    expect(items(palette)).toEqual([])
    const empty = palette.querySelector<HTMLElement>('[data-part="empty"]')!
    expect(empty.hidden).toBe(false)
    expect(empty.textContent).toBe('没有匹配的物料')
    await search(palette, '')
    expect(items(palette)).toHaveLength(4)
  })

  it('collapsible 时分组用手风琴，正文是组而非地标，折叠状态保留，搜索时匹配的分组展开', async () => {
    const palette = await mount((element) => {
      element.groups = groups
      element.collapsible = true
      element.searchable = true
    })
    const accordion = (): HTMLElement & { value?: string[] } => palette.querySelector('xh-accordion')!
    expect(accordion().value).toEqual(['human', 'control'])
    // 分组正文是以分组标题命名的组，不当地标
    const contents = Array.from(accordion().querySelectorAll('[data-scope="accordion"][data-part="content"]'))
    expect(contents.map(content => content.getAttribute('role'))).toEqual(['group', 'group'])
    expect(contents.every(content => content.getAttribute('aria-labelledby'))).toBe(true)
    expect(accordion().querySelector('[role="region"]')).toBeNull()
    accordion().dispatchEvent(new CustomEvent('value-change', { detail: { value: ['control'] }, bubbles: true }))
    palette.groups = [...groups]
    await palette.updateComplete
    expect(accordion().value).toEqual(['control'])
    await search(palette, '审')
    expect(accordion().value).toEqual(['human'])
    await search(palette, '')
    expect(accordion().value).toEqual(['control'])
  })

  it('collapsible 时一个分组都没有（空数据或搜索无结果）不建手风琴，没有 wc.* 诊断', async () => {
    const diagnostics = recordWcDiagnostics()
    const palette = await mount((element) => {
      element.collapsible = true
      element.searchable = true
      element.groups = []
    })
    expect(palette.querySelector('xh-accordion')).toBeNull()
    palette.groups = groups
    await palette.updateComplete
    expect(palette.querySelector('xh-accordion')).not.toBeNull()
    const search = palette.querySelector('[data-part="search"]')!
    search.dispatchEvent(new CustomEvent('value-change', { detail: { value: '没有这一项' }, bubbles: true }))
    await palette.updateComplete
    expect(palette.querySelector('xh-accordion')).toBeNull()
    await new Promise(resolve => setTimeout(resolve))
    expect(diagnostics.codes()).toEqual([])
    diagnostics.stop()
  })

  it('换了 groups 后焦点回到原来那一项', async () => {
    const palette = await mount(element => element.groups = groups)
    item(palette, 'start').focus()
    palette.groups = [...groups]
    await palette.updateComplete
    expect(document.activeElement).toBe(item(palette, 'start'))
    expect(item(palette, 'start').tabIndex).toBe(0)
  })

  it('元素自己的 translations 压在全局文案之上', async () => {
    setXhConfig(designerShellZhCN)
    const palette = await mount(element => element.translations = { title: '节点' })
    expect(palette.querySelector('[data-part="title"]')!.textContent).toBe('节点')
    expect(palette.querySelector('[data-part="empty"]')!.textContent).toBe('没有物料')
  })
})
