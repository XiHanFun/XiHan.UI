// 命令工具栏在真实布局与真实指针下：一个委托提示管整条工具栏，悬停按钮显示命令的文字与快捷键，
// macOS 与其余平台的快捷键写法不同；禁用的按钮悬停照出提示；三种显示方式切换不重铺按钮，放不下的条目跟着重新收放；
// 开关式命令只有图标时按下态看得出来。
import type { DesignerCommand } from '@xihan-ui/designer-kit'
import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { createCommandToolbar } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'
import '../../style.css'

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
