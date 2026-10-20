// 设置对话框在真实 Chromium 与组件皮肤下：左边竖排分区、右边条目，换页时对话框不跳高；
// 主题写在设计器根上，搬到浮层根的对话框经视觉桥跟着变暗；设计器外面包一层局部 <xh-config> 时，搬到浮层根的
// 标题、字段与对话框自己的文案都取这一层的语言；没有 wc.* 诊断，axe 也没有违规。「工具栏」页的按钮表用真实指针跨组拖命令、
// 用键盘挪组。
import type { DiagnosticRecord } from '@xihan-ui/core'
import type { DesignerSettingsEventMap, DesignerSettingsSection, XhDesignerSettingsElement } from '../../src'
import { onDiagnostic, resetDiagnostics, setDiagnosticsConsoleOutput, setDiagnosticsDedupe, setDiagnosticsLevel } from '@xihan-ui/core'
import { expectNoAxeViolations } from '@xihan-ui/testing/a11y'
import { BRAND_PRESET_COLORS, BRAND_PRESETS } from '@xihan-ui/tokens'
import { mergeXhConfig } from '@xihan-ui/web-components'
import { defineXhElement, XhConfigElement } from '@xihan-ui/web-components/define'
import { zhCN } from '@xihan-ui/web-components/locale'
import { afterEach, describe, expect, it } from 'vitest'
import { cdp, page, userEvent } from 'vitest/browser'
import { createDesignerSettingsHost, defineDesignerShell, shortcutSettingsSource, toolbarSettingsSource } from '../../src'
import { designerShellZhCN } from '../../src/locale'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'
import '../../style.css'

defineDesignerShell()
defineXhElement('xh-config', XhConfigElement)

const flowSection: DesignerSettingsSection = {
  id: 'flow',
  label: '流程',
  order: 100,
  items: [
    { path: ['grid'], label: '网格', control: { kind: 'boolean' }, default: true, meta: { description: '画布上显示网格' } },
    { path: ['snap'], label: '吸附距离', control: { kind: 'number', min: 0, unit: 'px' }, default: 8 },
  ],
}

let root: HTMLElement | undefined

afterEach(() => {
  root?.remove()
  root = undefined
})

async function frames(count = 2): Promise<void> {
  for (let i = 0; i < count; i++)
    await new Promise(resolve => requestAnimationFrame(resolve))
}

/** 等进场与换页的动画播完：缩放与淡入会改量出来的高度与颜色。 */
async function settle(): Promise<void> {
  await frames()
  const finite = document.getAnimations().filter(animation => animation.effect?.getComputedTiming().endTime !== Infinity)
  await Promise.all(finite.map(animation => animation.finished.catch(() => {})))
  await frames()
}

async function mount(): Promise<XhDesignerSettingsElement> {
  root = document.createElement('div')
  const element = document.createElement('xh-designer-settings')
  element.sections = [flowSection]
  root.append(element)
  document.body.append(root)
  await element.updateComplete
  return element
}

function content(): HTMLElement {
  return document.querySelector<HTMLElement>('xh-dialog [data-part="content"], [data-scope="dialog"][data-part="content"]')!
}

describe('设置对话框', () => {
  it('帮助页的钮：对话框先收起、焦点回到打开它的那颗钮，再派发 settings-command', async () => {
    const element = await mount()
    element.help = { notes: ['把物料拖到画布上。'], actions: [{ command: 'start-tour', label: '开始引导' }] }
    const opener = document.createElement('button')
    opener.textContent = '设置'
    root!.prepend(opener)
    opener.addEventListener('click', () => element.show('help'))
    const seen: [string, Element | null, boolean][] = []
    element.addEventListener('settings-command', event => void seen.push([(event as DesignerSettingsEventMap['settings-command']).detail.command, document.activeElement, element.open === true]))
    await userEvent.click(opener)
    await element.updateComplete
    await settle()
    const action = Array.from(document.querySelectorAll<HTMLButtonElement>('[data-scope="designer-settings"] button')).find(button => button.textContent === '开始引导')!
    await userEvent.click(action)
    for (let round = 0; round < 20 && seen.length === 0; round++)
      await frames()
    expect(seen).toEqual([['start-tour', opener, false]])
  })

  it('左边竖排分区、右边条目；换页时对话框高度不变；点分区切页', async () => {
    const element = await mount()
    element.show()
    await element.updateComplete
    await settle()
    const list = document.querySelector<HTMLElement>('xh-tabs [data-xh-part="list"]')!.getBoundingClientRect()
    const items = document.querySelector<HTMLElement>('[data-scope="designer-settings"][data-part="items"]')!.getBoundingClientRect()
    expect(list.right).toBeLessThanOrEqual(items.left + 1)
    const before = content().getBoundingClientRect().height
    await userEvent.click(document.querySelector<HTMLElement>('xh-tabs [data-xh-part="list"] > button[value="flow"]')!)
    await element.updateComplete
    await settle()
    expect(element.section).toBe('flow')
    const grid = document.querySelector<HTMLElement>('[data-setting="flow.grid"]')!
    expect(grid.getBoundingClientRect().width).toBeGreaterThan(0)
    expect(Math.abs(content().getBoundingClientRect().height - before)).toBeLessThanOrEqual(1)
  })

  it('主题写在设计器根上：对话框搬到浮层根后经视觉桥跟着变暗', async () => {
    const element = await mount()
    const host = createDesignerSettingsHost({ root: root! })
    element.show()
    await element.updateComplete
    await settle()
    const light = getComputedStyle(content()).backgroundColor
    host.apply({ 'general.theme': 'dark' })
    await settle()
    expect(root!.contains(content())).toBe(false)
    expect(getComputedStyle(content()).backgroundColor).not.toBe(light)
    host.dispose()
  })

  const presetCases = (['light', 'dark'] as const).flatMap(theme => BRAND_PRESETS.map(preset => [theme, preset] as const))

  it.each(presetCases)('宿主是 %s，主题跟随页面、选预设 %s：设计器里的品牌令牌换成那一档，外面的不变', async (theme, preset) => {
    const page = document.createElement('div')
    page.setAttribute('data-theme', theme)
    root = document.createElement('div')
    page.append(root)
    document.body.append(page)
    const tokenColor = (scope: Element, token: string): string => {
      const probe = document.createElement('span')
      probe.style.setProperty('color', `var(${token})`)
      scope.append(probe)
      const value = getComputedStyle(probe).color
      probe.remove()
      return value
    }
    const literal = (color: string): string => {
      const probe = document.createElement('span')
      probe.style.setProperty('color', color)
      document.body.append(probe)
      const value = getComputedStyle(probe).color
      probe.remove()
      return value
    }
    const before = tokenColor(root, '--xh-bg-brand')
    const host = createDesignerSettingsHost({ root })
    host.apply({ 'general.brand': preset })
    expect(root.getAttribute('data-theme')).toBe(theme)
    expect(tokenColor(root, '--xh-color-brand-600')).toBe(literal(BRAND_PRESET_COLORS[preset]))
    expect(tokenColor(root, '--xh-bg-brand')).not.toBe(before)
    expect(tokenColor(root, '--xh-bg-brand')).toBe(tokenColor(root, theme === 'light' ? '--xh-color-brand-600' : '--xh-color-brand-500'))
    expect(tokenColor(page, '--xh-bg-brand')).toBe(before)
    host.dispose()
    expect(tokenColor(root, '--xh-bg-brand')).toBe(before)
    page.remove()
  })

  it('设计器外面包一层局部 <xh-config>：对话框搬到浮层根以后，标题、字段与关闭钮的文案都取这一层的语言', async () => {
    const scope = document.createElement('xh-config') as HTMLElement & { translations?: unknown }
    scope.translations = mergeXhConfig(zhCN, designerShellZhCN).translations
    root = scope
    const element = document.createElement('xh-designer-settings')
    element.sections = [flowSection]
    scope.append(element)
    document.body.append(scope)
    element.show()
    await element.updateComplete
    await settle()
    const dialog = content()
    // 内容确实搬离了设计器所在的位置
    expect(scope.contains(dialog)).toBe(false)
    const brand = dialog.querySelector<HTMLElement>('[data-setting="general.brand"]')!
    const names = Array.from(brand.querySelectorAll('[aria-label]'), node => node.getAttribute('aria-label'))
    const close = dialog.querySelector<HTMLElement>('[data-xh-part="close-trigger"], [data-part="close-trigger"]')!
    expect([dialog.querySelector('[data-xh-part="title"], [data-part="title"]')!.textContent, names.includes('自定义颜色'), close.getAttribute('aria-label')])
      .toEqual(['设置', true, '关闭'])
  })

  it('打开时没有 wc.* 诊断，axe 也没有违规', async () => {
    const records: DiagnosticRecord[] = []
    resetDiagnostics()
    setDiagnosticsLevel('warn')
    setDiagnosticsDedupe(false)
    setDiagnosticsConsoleOutput(false)
    const off = onDiagnostic(record => void records.push(record))
    try {
      const element = await mount()
      element.show()
      await element.updateComplete
      await settle()
      expect(records.filter(record => record.code.startsWith('wc.')).map(record => record.code)).toEqual([])
      await expectNoAxeViolations(content())
    }
    finally {
      off()
      resetDiagnostics()
    }
  })

  it('「布局」页：面板表各列对齐、不出横向滚动，画布浮动件那一行只有显示开关；没有 wc.* 诊断，axe 也没有违规', async () => {
    const records: DiagnosticRecord[] = []
    resetDiagnostics()
    setDiagnosticsLevel('warn')
    setDiagnosticsDedupe(false)
    setDiagnosticsConsoleOutput(false)
    const off = onDiagnostic(record => void records.push(record))
    const frame = document.createElement('xh-designer-frame')
    try {
      frame.style.cssText = 'position:fixed;left:0;top:0;width:900px;height:600px'
      frame.regions = [
        { name: 'palette', position: 'start', title: '物料' },
        { name: 'canvas', position: 'center' },
        { name: 'properties', position: 'end', title: '属性' },
        { name: 'issues', position: 'bottom', title: '问题' },
        { name: 'minimap', position: 'overlay', title: '小地图' },
      ]
      document.body.append(frame)
      await frame.updateComplete
      const element = await mount()
      element.frame = frame
      element.show('layout')
      await element.updateComplete
      await settle()
      const table = document.querySelector<HTMLElement>('[data-scope="designer-settings"][data-part="panel-table"]')!
      expect(table.scrollWidth).toBeLessThanOrEqual(table.clientWidth)
      const left = (name: string, part: string): number => Math.round(document.querySelector<HTMLElement>(`[data-part="panel-row"][data-panel="${name}"] [data-part="${part}"]`)!.getBoundingClientRect().left)
      expect(new Set(['palette', 'properties', 'issues', 'minimap'].map(name => left(name, 'panel-visible'))).size).toBe(1)
      expect(new Set(['palette', 'properties', 'issues'].map(name => left(name, 'panel-dock'))).size).toBe(1)
      const minimap = document.querySelector<HTMLElement>('[data-part="panel-row"][data-panel="minimap"]')!
      expect(['panel-dock', 'panel-move-up', 'panel-move-down', 'panel-minimized'].map(part => getComputedStyle(minimap.querySelector(`[data-part="${part}"]`)!).display)).toEqual(['none', 'none', 'none', 'none'])
      expect(records.filter(record => record.code.startsWith('wc.')).map(record => record.code)).toEqual([])
      await expectNoAxeViolations(content())
    }
    finally {
      off()
      resetDiagnostics()
      frame.remove()
    }
  })

  it('「布局」页在 375 宽的窄屏下：面板名整行写全，控件排在名字下面不压住它，表头不折行，表不出横向滚动', async () => {
    const frame = document.createElement('xh-designer-frame')
    try {
      await page.viewport(375, 700)
      frame.style.cssText = 'position:fixed;left:0;top:0;width:375px;height:600px'
      frame.regions = [
        { name: 'palette', position: 'start', title: '物料' },
        { name: 'canvas', position: 'center' },
        { name: 'properties', position: 'end', title: '属性面板' },
        { name: 'issues', position: 'bottom', title: '问题' },
        { name: 'minimap', position: 'overlay', title: '小地图' },
      ]
      document.body.append(frame)
      await frame.updateComplete
      const element = await mount()
      element.frame = frame
      element.show('layout')
      await element.updateComplete
      await settle()
      const table = document.querySelector<HTMLElement>('[data-scope="designer-settings"][data-part="panel-table"]')!
      expect(table.scrollWidth).toBeLessThanOrEqual(table.clientWidth)
      const overlaps = (a: DOMRect, b: DOMRect): boolean => a.left < b.right - 1 && b.left < a.right - 1 && a.top < b.bottom - 1 && b.top < a.bottom - 1
      for (const name of ['palette', 'properties', 'issues', 'minimap']) {
        const row = document.querySelector<HTMLElement>(`[data-part="panel-row"][data-panel="${name}"]`)!
        const label = row.querySelector<HTMLElement>('[data-part="panel-label"]')!
        expect(label.scrollWidth).toBeLessThanOrEqual(label.clientWidth + 1)
        expect(label.getBoundingClientRect().width).toBeGreaterThan(0)
        const nameBox = row.querySelector<HTMLElement>('[data-part="panel-name"]')!.getBoundingClientRect()
        expect(overlaps(nameBox, row.querySelector<HTMLElement>('[data-part="panel-visible"]')!.getBoundingClientRect())).toBe(false)
      }
      const lines = (element: HTMLElement): number => {
        const range = document.createRange()
        range.selectNodeContents(element)
        return new Set(Array.from(range.getClientRects(), rect => Math.round(rect.top))).size
      }
      // 位置下拉写得全当前那一栏，不缩成只剩箭头、不截成省略号（scrollWidth 取整会吞掉不足一像素的截断，按字量）
      for (const name of ['palette', 'properties', 'issues']) {
        const text = document.querySelector<HTMLElement>(`[data-part="panel-row"][data-panel="${name}"] [data-scope="select"][data-part="value-text"]`)!
        expect(text.textContent).not.toBe('')
        const range = document.createRange()
        range.selectNodeContents(text)
        expect(range.getBoundingClientRect().width).toBeGreaterThan(0)
        expect(range.getBoundingClientRect().width).toBeLessThanOrEqual(text.getBoundingClientRect().width + 0.5)
      }
      expect(lines(document.querySelector<HTMLElement>('[data-part="panel-row"][data-panel="minimap"] [data-part="panel-overlay"]')!)).toBe(1)
      for (const header of table.querySelectorAll<HTMLElement>('[role="columnheader"]')) {
        if (header.getClientRects().length === 0)
          continue
        const range = document.createRange()
        range.selectNodeContents(header)
        expect(new Set(Array.from(range.getClientRects(), rect => Math.round(rect.top))).size).toBeLessThanOrEqual(1)
      }
    }
    finally {
      frame.remove()
      await page.viewport(1280, 800)
    }
  })
})

describe('「工具栏」页的按钮表', () => {
  const commands = new Map([
    ['undo', { id: 'undo', label: '撤销', shortcut: ['Mod', 'Z'], run: () => {} }],
    ['redo', { id: 'redo', label: '重做', run: () => {} }],
    ['delete', { id: 'delete', label: '删除', run: () => {} }],
    ['zoom-in', { id: 'zoom-in', label: '放大', run: () => {} }],
  ])

  async function mountToolbar(): Promise<{ element: XhDesignerSettingsElement, values: unknown[] }> {
    const element = await mount()
    element.toolbar = toolbarSettingsSource([['undo', 'redo'], ['delete', 'zoom-in']], commands, {})
    const values: unknown[] = []
    element.addEventListener('settings-change', (event) => {
      const detail = (event as DesignerSettingsEventMap['settings-change']).detail
      values.push(detail.value)
      element.settings = detail.settings
    })
    element.show('toolbar')
    await element.updateComplete
    await settle()
    return { element, values }
  }

  function handle(item: Element): HTMLElement {
    return item.querySelector<HTMLElement>(':scope > [data-toolbar-handle], :scope > [data-scope="designer-settings"][data-part="toolbar-group-head"] > [data-toolbar-handle]')!
  }

  function command(id: string): HTMLElement {
    return document.querySelector<HTMLElement>(`[data-toolbar-command="${id}"]`)!
  }

  function groups(): string[][] {
    return Array.from(document.querySelectorAll('[data-toolbar-group]'), group => Array.from(group.querySelectorAll('[data-toolbar-command]'), node => node.getAttribute('data-toolbar-command')!))
  }

  async function mouseScale(): Promise<number> {
    const seen = new Promise<number>(resolve => document.addEventListener('pointermove', event => resolve(event.clientX / 20), { once: true }))
    await cdp().send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 20, y: 20 })
    return seen
  }

  /** 按住 from 的中心，分十步拖到 to，松开。 */
  async function drag(from: HTMLElement, to: { x: number, y: number }): Promise<void> {
    const scale = await mouseScale()
    const at = (x: number, y: number): { x: number, y: number } => ({ x: x / scale, y: y / scale })
    const box = from.getBoundingClientRect()
    const start = { x: box.left + box.width / 2, y: box.top + box.height / 2 }
    await cdp().send('Input.dispatchMouseEvent', { type: 'mouseMoved', ...at(start.x, start.y) })
    await cdp().send('Input.dispatchMouseEvent', { type: 'mousePressed', button: 'left', clickCount: 1, ...at(start.x, start.y) })
    for (let i = 1; i <= 10; i++) {
      await frames(1)
      await cdp().send('Input.dispatchMouseEvent', { type: 'mouseMoved', button: 'left', ...at(start.x + ((to.x - start.x) * i) / 10, start.y + ((to.y - start.y) * i) / 10) })
    }
    await frames(1)
    await cdp().send('Input.dispatchMouseEvent', { type: 'mouseReleased', button: 'left', clickCount: 1, ...at(to.x, to.y) })
    await frames(4)
  }

  it('真实指针把第一组的「撤销」拖到第二组「删除」下面：只挪这一条，整份写进 toolbar.layout', async () => {
    const { values } = await mountToolbar()
    const target = command('delete').getBoundingClientRect()
    await drag(handle(command('undo')), { x: target.left + target.width / 2, y: target.bottom - 4 })
    await settle()
    expect(groups()).toEqual([['redo'], ['delete', 'undo', 'zoom-in']])
    expect(values.at(-1)).toEqual({ groups: [['redo'], ['delete', 'undo', 'zoom-in']] })
  })

  it('键盘拿起第二组的把手往上挪一格：组换了位置，焦点留在把手上；勾掉一条后组头是半选', async () => {
    const { values } = await mountToolbar()
    const second = document.querySelectorAll('[data-toolbar-group]')[1]!
    const grip = handle(second)
    grip.focus()
    await userEvent.keyboard(' {ArrowUp} ')
    await settle()
    expect(groups()).toEqual([['delete', 'zoom-in'], ['undo', 'redo']])
    expect(values.at(-1)).toEqual({ groups: [['delete', 'zoom-in'], ['undo', 'redo']] })
    expect(document.activeElement).toBe(grip)
    await userEvent.click(command('zoom-in').querySelector('[data-part="toolbar-command-toggle"] button, [data-scope="checkbox"][data-part="root"]')!)
    await settle()
    expect(values.at(-1)).toEqual({ groups: [['delete', 'zoom-in'], ['undo', 'redo']], hidden: ['zoom-in'] })
    expect(document.querySelector('[data-toolbar-group] [data-part="toolbar-group-toggle"] [data-scope="checkbox"][data-part="root"]')!.getAttribute('aria-checked')).toBe('mixed')
  })

  it('打开这一页时没有 wc.* 诊断，axe 也没有违规', async () => {
    const records: DiagnosticRecord[] = []
    resetDiagnostics()
    setDiagnosticsLevel('warn')
    setDiagnosticsDedupe(false)
    setDiagnosticsConsoleOutput(false)
    const off = onDiagnostic(record => void records.push(record))
    try {
      await mountToolbar()
      expect(records.filter(record => record.code.startsWith('wc.')).map(record => record.code)).toEqual([])
      await expectNoAxeViolations(content())
    }
    finally {
      off()
      resetDiagnostics()
    }
  })
})

describe('帮助、快捷键与关于', () => {
  it('三页在真实皮肤下：快捷键铺成 xh-kbd、键名看得见，关于两列不出横向滚动；三页都没有 wc.* 诊断，axe 也没有违规', async () => {
    const records: DiagnosticRecord[] = []
    resetDiagnostics()
    setDiagnosticsLevel('warn')
    setDiagnosticsDedupe(false)
    setDiagnosticsConsoleOutput(false)
    const off = onDiagnostic(record => void records.push(record))
    try {
      const element = await mount()
      const commands = new Map([
        ['undo', { id: 'undo', label: '撤销', shortcut: ['Mod', 'Z'], run: () => {} }],
        ['redo', { id: 'redo', label: '重做', shortcut: ['Mod', 'Shift', 'Z'], alternateShortcuts: [['Ctrl', 'Y']], run: () => {} }],
      ])
      element.help = { notes: ['把物料拖到画布上。', '按住端口拖出连线。'], actions: [{ command: 'start-tour', label: '开始引导' }] }
      element.shortcuts = shortcutSettingsSource(commands, {})
      element.about = { product: '流程设计器', version: '1.0.0', license: 'MIT' }
      for (const section of ['help', 'shortcuts', 'about']) {
        element.show(section)
        await element.updateComplete
        await settle()
        expect(records.filter(record => record.code.startsWith('wc.')).map(record => record.code)).toEqual([])
        await expectNoAxeViolations(content())
      }
      element.show('shortcuts')
      await element.updateComplete
      await settle()
      const redo = Array.from(document.querySelectorAll<HTMLElement>('[data-scope="designer-settings"][data-part="shortcut-row"]')).find(row => row.textContent!.includes('重做'))!
      expect(redo.querySelectorAll('xh-kbd')).toHaveLength(2)
      expect(redo.querySelector('kbd')!.getBoundingClientRect().width).toBeGreaterThan(0)
      element.show('about')
      await element.updateComplete
      await settle()
      const info = document.querySelector<HTMLElement>('[data-scope="designer-settings"][data-part="info"]')!
      expect(info.scrollWidth).toBeLessThanOrEqual(info.clientWidth)
      const [label, value] = [...info.querySelectorAll<HTMLElement>('[data-part="info-label"], [data-part="info-value"]')].map(node => node.getBoundingClientRect())
      expect(Math.abs(label!.top - value!.top)).toBeLessThanOrEqual(2)
      expect(label!.right).toBeLessThan(value!.left)
    }
    finally {
      off()
      resetDiagnostics()
    }
  })
})
