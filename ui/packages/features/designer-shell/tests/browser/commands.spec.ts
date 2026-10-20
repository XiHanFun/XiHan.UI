// 命令工具栏在真实布局与真实指针下：一个委托提示管整条工具栏，悬停按钮显示命令的文字与快捷键，
// macOS 与其余平台的快捷键写法不同；禁用的按钮悬停照出提示；只显示图标时有图标的按钮是方钮；三种显示方式切换不重铺按钮，放不下的条目跟着重新收放；
// 开关式命令只有图标时按下态看得出来。
import type { DesignerCommand } from '@xihan-ui/designer-kit'
import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { createCommandToolbar, defineDesignerShell } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'
import '../../style.css'

defineDesignerShell()

const LINE = { name: 'line', viewBox: '0 0 24 24', nodes: [{ tag: 'path' as const, attrs: { d: 'M4 12h16' } }] }

function command(id: string, extra: Partial<DesignerCommand<null>> = {}): DesignerCommand<null> {
  return { id, label: id, icon: LINE, run: () => {}, ...extra }
}

const COMMANDS = new Map<string, DesignerCommand<null>>([
  ['undo', command('undo', { label: 'Undo', shortcut: ['Mod', 'z'] })],
  ['redo', command('redo', { label: 'Redo', shortcut: ['Mod', 'Shift', 'z'], enabled: () => false })],
  ['grid', command('grid', { label: 'Show grid', checked: () => true })],
  ['snap', command('snap', { label: 'Snap to grid', checked: () => false })],
  ['plain', command('plain', { label: 'No icon', icon: undefined })],
])

let host: HTMLElement | null = null

afterEach(async () => {
  await userEvent.hover(document.querySelector<HTMLElement>('[data-test-park-pointer]')!)
  host?.remove()
  host = null
})

async function until(check: () => boolean): Promise<void> {
  const start = performance.now()
  while (!check()) {
    if (performance.now() - start > 2000)
      throw new Error('等了 2 秒仍没到期望的状态')
    await new Promise(resolve => requestAnimationFrame(resolve))
  }
}

async function settle(): Promise<void> {
  for (let round = 0; round < 3; round++) {
    for (const el of document.querySelectorAll<HTMLElement & { updateComplete?: Promise<unknown> }>('xh-tooltip, xh-toolbar, xh-icon'))
      await el.updateComplete
    await new Promise(resolve => requestAnimationFrame(resolve))
  }
}

function mount(options: Parameters<typeof createCommandToolbar>[1] = {}, width = '640px'): ReturnType<typeof createCommandToolbar<null>> {
  host = document.createElement('div')
  host.style.cssText = `inline-size: ${width}; padding: 96px 48px`
  const bar = createCommandToolbar<null>(document, options)
  host.append(bar.element)
  document.body.append(host)
  bar.update([['undo', 'redo'], ['grid', 'snap', 'plain']], COMMANDS, null, 'Designer actions')
  return bar
}

function button(id: string): HTMLButtonElement {
  return host!.querySelector<HTMLButtonElement>(`button[data-xh-part='item'][value='${id}']`)!
}

function tooltipText(part: string): string | null {
  return document.querySelector(`[data-scope="tooltip"][data-part="${part}"]`)?.textContent ?? null
}

function content(): HTMLElement {
  return document.querySelector<HTMLElement>('[data-scope="tooltip"][data-part="content"]')!
}

describe('命令工具栏（Chromium）', () => {
  it.each([
    ['other', 'Control+Z', 'Ctrl+Z'],
    ['mac', 'Meta+Z', '⌘Z'],
  ] as const)('%s：按钮写规范的 aria-keyshortcuts，悬停时提示显示命令的文字与本平台的快捷键', async (platform, written, shown) => {
    mount({ platform })
    await settle()
    expect(button('undo').getAttribute('aria-keyshortcuts')).toBe(written)
    await userEvent.hover(button('undo'))
    await until(() => content().dataset.state === 'open')
    expect([tooltipText('text'), tooltipText('shortcut')]).toEqual(['Undo', shown])
  })

  it('禁用的按钮悬停照出提示；从一个按钮挪到另一个时提示直接换过去', async () => {
    mount({ platform: 'other' })
    await settle()
    await userEvent.hover(button('undo'))
    await until(() => content().dataset.state === 'open')
    expect(button('redo').disabled).toBe(true)
    await userEvent.hover(button('redo'))
    await until(() => tooltipText('text') === 'Redo')
    expect(tooltipText('shortcut')).toBe('Ctrl+Shift+Z')
    expect(content().dataset.state).toBe('open')
  })

  it('只显示图标时文字收起、名字仍在按钮上；没有图标的命令照样显示文字', async () => {
    mount()
    await settle()
    const label = (id: string): HTMLElement => button(id).querySelector<HTMLElement>('[data-part="label"]')!
    const icon = (id: string): HTMLElement => button(id).querySelector<HTMLElement>('[data-part="icon"]')!
    expect(getComputedStyle(label('undo')).display).toBe('none')
    expect(icon('undo').getBoundingClientRect().width).toBeGreaterThan(8)
    expect(button('undo').getAttribute('aria-label')).toBe('Undo')
    expect(getComputedStyle(label('plain')).display).not.toBe('none')
    expect(getComputedStyle(icon('plain')).display).toBe('none')
  })

  it('只显示图标时有图标的按钮是方钮，宽等于高；没有图标的、图标加文字与只显示文字的不是；换显示方式时同一颗按钮跟着换', async () => {
    const bar = mount({}, '960px')
    await settle()
    const box = (id: string): DOMRect => button(id).getBoundingClientRect()
    const square = (id: string): boolean => Math.abs(box(id).width - box(id).height) < 0.5
    for (const id of ['undo', 'redo', 'grid', 'snap']) {
      expect(button(id).hasAttribute('data-icon-only')).toBe(true)
      expect(square(id)).toBe(true)
      expect(Math.abs(box(id).height - box('plain').height)).toBeLessThan(0.5)
    }
    expect(button('plain').hasAttribute('data-icon-only')).toBe(false)
    expect(box('plain').width).toBeGreaterThan(box('plain').height)
    const first = button('undo')
    for (const display of ['both', 'text'] as const) {
      bar.setDisplay(display)
      await settle()
      expect(button('undo')).toBe(first)
      for (const id of ['undo', 'grid', 'plain']) {
        expect(button(id).hasAttribute('data-icon-only')).toBe(false)
        expect(box(id).width).toBeGreaterThan(box(id).height)
      }
    }
    bar.setDisplay('icon')
    await settle()
    expect(square('undo')).toBe(true)
  })

  it('换显示方式不重铺按钮，放不下的条目按新宽度重新收放', async () => {
    const bar = mount({}, '260px')
    await settle()
    const first = button('undo')
    const shown = (): number => host!.querySelectorAll('button[data-xh-part="item"]:not([hidden])').length
    await until(() => shown() > 0)
    const iconCount = shown()
    bar.setDisplay('both')
    await settle()
    await until(() => shown() < iconCount)
    expect(button('undo')).toBe(first)
    expect(getComputedStyle(first.querySelector('[data-part="label"]')!).display).not.toBe('none')
    bar.setDisplay('icon')
    await settle()
    await until(() => shown() === iconCount)
  })

  it('开关式命令只有图标时，按下态与未按下的面分得开', async () => {
    mount()
    await settle()
    const pressed = getComputedStyle(button('grid')).backgroundColor
    const idle = getComputedStyle(button('snap')).backgroundColor
    expect(button('grid').getAttribute('aria-pressed')).toBe('true')
    expect(pressed).not.toBe(idle)
  })
})

/** 视图菜单的状态与选中记录：菜单按它现算勾选，select 记下点了哪一项。 */
const viewState: { grid: boolean, layout: string, chosen: string[] } = { grid: true, layout: 'a', chosen: [] }

const POPUP_COMMANDS = new Map<string, DesignerCommand<null>>([
  ...COMMANDS,
  ['page-setup', { id: 'page-setup', label: 'Page setup', icon: LINE, panel: () => {
    const element = document.createElement('div')
    element.style.cssText = 'inline-size: 160px; block-size: 80px'
    element.innerHTML = '<button type="button">Paper</button>'
    return { element }
  } }],
  ['page-menu', { id: 'page-menu', label: 'Page 1 of 2', icon: LINE, menu: () => [
    { value: '0', label: 'Cover', checked: true, group: 'page' },
    { value: '1', label: 'Details', checked: false, group: 'page' },
  ] }],
  ['view-menu', { id: 'view-menu', label: 'View', icon: LINE, menu: () => [
    { value: 'grid', label: 'Grid', checked: viewState.grid },
    'separator',
    { value: 'a', label: 'Layout A', checked: viewState.layout === 'a', group: 'layout' },
    { value: 'b', label: 'Layout B', checked: viewState.layout === 'b', group: 'layout' },
    'separator',
    'undo',
  ], select: value => void viewState.chosen.push(value) }],
])

function mountPopups(options: Parameters<typeof createCommandToolbar>[1], style: string, groups: string[][]): ReturnType<typeof createCommandToolbar<null>> {
  host = document.createElement('div')
  host.style.cssText = style
  const bar = createCommandToolbar<null>(document, options)
  host.append(bar.element)
  document.body.append(host)
  bar.update(groups, POPUP_COMMANDS, null, 'Designer actions')
  return bar
}

function positioner(scope: string): HTMLElement | null {
  return document.querySelector<HTMLElement>(`[data-scope="${scope}"][data-part="positioner"][data-positioned]`)
}

function overflowTrigger(): HTMLButtonElement {
  return host!.querySelector<HTMLButtonElement>('button[data-xh-part="overflow-trigger"]')!
}

describe('弹层命令、菜单命令与竖排（Chromium）', () => {
  it('竖排：按钮上下排，提示在左边弹出；高度不够时放不下的收进「更多」', async () => {
    mountPopups({ orientation: 'vertical', platform: 'other' }, 'block-size: 150px; inline-size: 48px; margin-inline-start: 320px; margin-block-start: 48px; display: flex', [['undo', 'redo'], ['grid', 'snap', 'plain']])
    await settle()
    const undo = button('undo').getBoundingClientRect()
    const redo = button('redo').getBoundingClientRect()
    expect([redo.top >= undo.bottom - 1, Math.abs(redo.left - undo.left) <= 1]).toEqual([true, true])
    await until(() => host!.querySelectorAll('button[data-xh-part="item"][hidden]').length > 0)
    expect(overflowTrigger().hidden).toBe(false)
    await userEvent.hover(button('undo'))
    await until(() => content().dataset.state === 'open')
    const tip = document.querySelector<HTMLElement>('[data-scope="tooltip"][data-part="positioner"]')!.getBoundingClientRect()
    expect(tip.right).toBeLessThanOrEqual(button('undo').getBoundingClientRect().left + 1)
  })

  it('弹层命令贴着按钮下边弹出；工具栏变窄把它收进「更多」时弹层挪到「更多」下面；Escape 收起后焦点回到「更多」', async () => {
    const bar = mountPopups({ platform: 'other' }, 'inline-size: 640px; padding: 48px', [['undo', 'redo'], ['grid', 'snap', 'plain', 'page-setup']])
    await settle()
    await userEvent.click(button('page-setup'))
    await until(() => positioner('popover') !== null)
    expect(bar.opened()).toBe('page-setup')
    const anchor = button('page-setup').getBoundingClientRect()
    const panel = positioner('popover')!.getBoundingClientRect()
    expect([panel.top >= anchor.bottom, panel.top - anchor.bottom <= 12, Math.abs(panel.left - anchor.left) <= 1]).toEqual([true, true, true])
    expect(button('page-setup').getAttribute('aria-expanded')).toBe('true')

    host!.style.inlineSize = '150px'
    await until(() => button('page-setup').hidden === true)
    await until(() => Math.abs(positioner('popover')!.getBoundingClientRect().left - overflowTrigger().getBoundingClientRect().left) <= 1)
    expect([bar.opened(), overflowTrigger().getAttribute('aria-controls')]).toEqual(['page-setup', document.querySelector('[data-scope="popover"][data-part="content"]')!.id])

    document.querySelector<HTMLElement>('[data-scope="popover"][data-part="content"] button')!.focus()
    await userEvent.keyboard('{Escape}')
    await until(() => bar.opened() === undefined)
    await until(() => document.activeElement === overflowTrigger())
  })

  it('收在「更多」里的菜单命令：从「更多」菜单里点它，打开同一份菜单、锚在「更多」上，焦点落进菜单', async () => {
    const bar = mountPopups({ platform: 'other' }, 'inline-size: 150px; padding: 48px', [['undo', 'redo'], ['grid', 'snap', 'plain', 'page-menu']])
    await settle()
    await until(() => button('page-menu').hidden === true)
    await userEvent.click(overflowTrigger())
    const entry = (): HTMLElement | null => document.querySelector<HTMLElement>('[data-scope="menu"][data-part="item"][data-value="page-menu"]')
    await until(() => entry() !== null && entry()!.getBoundingClientRect().width > 0)
    await userEvent.click(entry()!)
    await until(() => bar.opened() === 'page-menu')
    const item = (): HTMLElement | null => document.querySelector<HTMLElement>('[data-scope="menu"][data-part="item"][data-value="item:0"]')
    await until(() => item() !== null && document.activeElement === item())
    expect(item()!.getAttribute('aria-checked')).toBe('true')
    const menu = item()!.closest<HTMLElement>('[data-scope="menu"][data-part="positioner"]')!.getBoundingClientRect()
    expect(menu.top).toBeGreaterThanOrEqual(overflowTrigger().getBoundingClientRect().bottom)
  })

  it('从右往左写时，竖排的提示与弹层在右边', async () => {
    const bar = mountPopups({ orientation: 'vertical', platform: 'other' }, 'block-size: 320px; inline-size: 48px; margin-inline-start: 320px; margin-block-start: 48px; display: flex', [['undo'], ['page-setup']])
    host!.dir = 'rtl'
    bar.update([['undo'], ['page-setup']], POPUP_COMMANDS, null, 'Designer actions')
    await settle()
    expect(bar.element.getAttribute('placement')).toBe('right')
    await userEvent.click(button('page-setup'))
    await until(() => positioner('popover') !== null)
    expect(positioner('popover')!.getBoundingClientRect().left).toBeGreaterThanOrEqual(button('page-setup').getBoundingClientRect().right)
    bar.close()
  })

  it('画布右侧中间的竖条不超出画布区：里面竖排的命令工具栏放不下时按高度收进「更多」', async () => {
    const frame = document.createElement('xh-designer-frame')
    frame.style.cssText = 'position:fixed;left:20px;top:20px;width:800px;height:200px'
    frame.append(document.createElement('div'))
    document.body.append(frame)
    await frame.updateComplete
    const line = { name: 'line', viewBox: '0 0 24 24', nodes: [{ tag: 'path' as const, attrs: { d: 'M4 12h16' } }] }
    const ids = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j']
    const commands = new Map(ids.map(id => [id, { id, label: id, icon: line, run: () => {} }]))
    const bar = createCommandToolbar<null>(document, { orientation: 'vertical' })
    bar.element.slot = 'canvas-end'
    frame.append(bar.element)
    bar.update([ids.slice(0, 5), ids.slice(5)], commands, null, 'Pages')
    const hidden = (): number => bar.element.querySelectorAll('button[data-xh-part="item"][hidden]').length
    const start = performance.now()
    while (hidden() === 0 && performance.now() - start < 2000)
      await new Promise(resolve => requestAnimationFrame(resolve))
    expect(hidden()).toBeGreaterThan(0)
    const canvas = frame.querySelector('[data-part="region"][data-region="canvas"]')!.getBoundingClientRect()
    const strip = frame.querySelector('[data-part="overlay"][data-overlay="end"]')!.getBoundingClientRect()
    expect([strip.top >= canvas.top, strip.bottom <= canvas.bottom]).toEqual([true, true])
    frame.remove()
  })

  it('真实指针点菜单命令的各种条目：复选不收起、单选收起，都调 select；写成命令 id 的项执行那条命令', async () => {
    viewState.chosen = []
    let undone = 0
    const commands = new Map(POPUP_COMMANDS).set('undo', command('undo', { label: 'Undo', run: () => void undone++ }))
    host = document.createElement('div')
    host.style.cssText = 'inline-size: 640px; padding: 48px'
    const bar = createCommandToolbar<null>(document, { platform: 'other' })
    host.append(bar.element)
    document.body.append(host)
    bar.update([['undo', 'view-menu']], commands, null, 'Designer actions')
    await settle()
    const entry = (value: string): HTMLElement | null => document.querySelector<HTMLElement>(`[data-scope="menu"][data-part="item"][data-value="${value}"]`)
    const open = async (): Promise<void> => {
      await userEvent.click(button('view-menu'))
      await until(() => entry('item:grid') !== null && entry('item:grid')!.getBoundingClientRect().width > 0)
    }
    await open()
    expect(entry('item:grid')!.getAttribute('aria-checked')).toBe('true')
    await userEvent.click(entry('item:grid')!)
    await until(() => viewState.chosen.length === 1)
    expect([viewState.chosen, bar.opened()]).toEqual([['grid'], 'view-menu'])
    await userEvent.click(entry('item:b')!)
    await until(() => bar.opened() === undefined)
    expect(viewState.chosen).toEqual(['grid', 'b'])
    await open()
    await userEvent.click(entry('command:undo')!)
    await until(() => undone === 1)
    expect(viewState.chosen).toEqual(['grid', 'b'])
  })
})
