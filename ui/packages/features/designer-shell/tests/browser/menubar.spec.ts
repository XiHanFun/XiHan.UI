// 菜单栏在真实布局、真实指针与真实按键下：外框最上一条，点开菜单选中条目执行命令，开关式的条目带勾；
// F10 把焦点交给菜单栏、再按 F10 或 Esc 回到进来前的地方；窄屏收成一颗「菜单」钮，宽窄切换时焦点跟着落到看得见的入口上；
// 菜单开着时换一轮数据，菜单不收、焦点不丢。
import type { DesignerCommand } from '@xihan-ui/designer-kit'
import type { XhDesignerFrameElement } from '../../src'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { page, userEvent } from 'vitest/browser'
import { arrangeMenubar, createCommandMenubar, defineDesignerShell, DESIGNER_COMMANDS_EN_US, designerMenubarMenus } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'
import '../../style.css'

defineDesignerShell()

interface Ctx { readonly count: number }

let frame: XhDesignerFrameElement
let canvas: HTMLButtonElement
let context: Ctx = { count: 0 }
const ran: string[] = []

function command(id: string, extra: Partial<DesignerCommand<Ctx>> = {}): DesignerCommand<Ctx> {
  return { id, label: id, run: () => ran.push(id), ...extra }
}

let grid = false
const COMMANDS = new Map<string, DesignerCommand<Ctx>>([
  ['save', command('save', { label: 'Save', shortcut: ['Mod', 'S'] })],
  ['settings', command('settings', { label: 'Settings' })],
  ['undo', command('undo', { label: ctx => `Undo ${ctx.count}` })],
  ['grid', command('grid', { label: 'Show grid', checked: () => grid, run: () => void (grid = !grid) })],
  ['help', command('help', { label: 'Help' })],
  ['panels', command('panels', { label: 'Panels', run: undefined, menu: () => [{ value: 'palette', label: 'Palette' }, 'separator', 'undo'], select: value => ran.push(`panels:${value}`) })],
])
const MENUS = designerMenubarMenus<Ctx>({ translations: () => DESIGNER_COMMANDS_EN_US })
const LAYOUT = { file: [['save'], ['settings']], edit: [['undo']], view: [['grid'], ['panels']], help: [['help']] }

let bar: ReturnType<typeof createCommandMenubar<Ctx>>

function paint(): void {
  bar.update(arrangeMenubar(MENUS, COMMANDS, LAYOUT), COMMANDS, context, { menubar: 'Designer menu bar', menu: 'Menu' })
}

async function settle(): Promise<void> {
  for (let round = 0; round < 4; round++) {
    await frame.updateComplete
    for (const el of document.querySelectorAll<HTMLElement & { updateComplete?: Promise<unknown> }>('xh-menubar, xh-menu'))
      await el.updateComplete
    await new Promise(resolve => requestAnimationFrame(resolve))
  }
}

async function until(check: () => boolean): Promise<void> {
  const start = performance.now()
  while (!check()) {
    if (performance.now() - start > 2000)
      throw new Error('等了 2 秒仍没到期望的状态')
    await new Promise(resolve => requestAnimationFrame(resolve))
  }
}

function trigger(name: string): HTMLElement {
  return [...frame.querySelectorAll<HTMLElement>('[data-scope="menubar"][data-part="trigger"]')].find(el => el.textContent === name)!
}

function openMenuItems(): HTMLElement[] {
  return [...document.querySelectorAll<HTMLElement>('[data-scope="menubar"][data-part="content"]')]
    .filter(content => content.checkVisibility())
    .flatMap(content => [...content.querySelectorAll<HTMLElement>('[role^="menuitem"]')])
}

beforeEach(async () => {
  ran.length = 0
  grid = false
  context = { count: 0 }
  frame = document.createElement('xh-designer-frame')
  frame.style.cssText = 'position:fixed;inset:0'
  bar = createCommandMenubar<Ctx>(document, { platform: 'other' })
  bar.element.slot = 'menubar'
  const toolbar = document.createElement('div')
  toolbar.slot = 'toolbar'
  toolbar.style.blockSize = '40px'
  canvas = document.createElement('button')
  canvas.textContent = 'canvas'
  frame.append(bar.element, toolbar, canvas)
  document.body.prepend(frame)
  paint()
  await settle()
})

afterEach(async () => {
  frame.remove()
  await page.viewport(1280, 800)
})

describe('菜单栏（Chromium）', () => {
  it('在外框最上一条、工具栏上面；点开「文件」选中「保存」执行命令，菜单收起', async () => {
    const strip = frame.querySelector<HTMLElement>(':scope > [data-part="menubar"]')!
    const top = frame.querySelector<HTMLElement>(':scope > [data-part="top"]')!
    expect(strip.getBoundingClientRect().bottom).toBeLessThanOrEqual(top.getBoundingClientRect().top + 0.5)
    expect(strip.getBoundingClientRect().height).toBeGreaterThan(0)
    expect(frame.querySelector('[role="menubar"]')!.getAttribute('aria-label')).toBe('Designer menu bar')
    await userEvent.click(trigger('File'))
    await until(() => openMenuItems().length === 2)
    expect(openMenuItems().map(item => item.textContent)).toEqual(['SaveCtrl+S', 'Settings'])
    await userEvent.click(openMenuItems()[0]!)
    await until(() => openMenuItems().length === 0)
    expect(ran).toEqual(['save'])
  })

  it('开关式命令是带勾的条目：选中后执行，下次打开勾跟着命令的状态', async () => {
    await userEvent.click(trigger('View'))
    await until(() => openMenuItems().length >= 1)
    expect([openMenuItems()[0]!.getAttribute('role'), openMenuItems()[0]!.getAttribute('aria-checked')]).toEqual(['menuitemcheckbox', 'false'])
    await userEvent.click(openMenuItems()[0]!)
    await until(() => openMenuItems().length === 0)
    paint()
    await settle()
    await userEvent.click(trigger('View'))
    await until(() => openMenuItems().length >= 1)
    expect(openMenuItems()[0]!.getAttribute('aria-checked')).toBe('true')
  })

  it('菜单命令是子菜单：真实指针展开「面板」，点里面的条目交给菜单命令的 select，写成命令 id 的项跑那条命令', async () => {
    await userEvent.click(trigger('View'))
    const sub = (): HTMLElement => openMenuItems().find(item => item.textContent?.trim().startsWith('Panels'))!
    await until(() => sub() !== undefined)
    await userEvent.click(sub())
    const inner = (): HTMLElement[] => [...document.querySelectorAll<HTMLElement>('[data-scope="menu"][data-part="content"]')]
      .filter(content => content.checkVisibility())
      .flatMap(content => [...content.querySelectorAll<HTMLElement>('[role^="menuitem"]')])
    await until(() => inner().length === 2)
    expect(inner().map(item => item.textContent?.trim())).toEqual(['Palette', 'Undo 0'])
    await userEvent.click(inner()[0]!)
    await until(() => openMenuItems().length === 0)
    expect(ran).toEqual(['panels:palette'])
  })

  it('按 F10 把焦点交给第一个菜单入口；再按 F10 回到进来前的地方；入口上按 Esc 也回去', async () => {
    canvas.focus()
    await userEvent.keyboard('{F10}')
    expect(document.activeElement).toBe(trigger('File'))
    await userEvent.keyboard('{ArrowRight}')
    expect(document.activeElement).toBe(trigger('Edit'))
    await userEvent.keyboard('{F10}')
    expect(document.activeElement).toBe(canvas)
    await userEvent.keyboard('{F10}')
    expect(document.activeElement?.getAttribute('data-part')).toBe('trigger')
    await userEvent.keyboard('{Escape}')
    expect(document.activeElement).toBe(canvas)
  })

  it('菜单开着时换一轮数据（条目的文字变了）：菜单不收，焦点留在原来的条目上', async () => {
    trigger('Edit').focus()
    await userEvent.keyboard('{ArrowDown}')
    await until(() => openMenuItems().length === 1 && document.activeElement === openMenuItems()[0])
    context = { count: 3 }
    paint()
    await settle()
    expect(openMenuItems().map(item => item.textContent)).toEqual(['Undo 3'])
    expect(document.activeElement).toBe(openMenuItems()[0])
  })

  it('窄屏：整条收成一颗「菜单」钮，点开后每张菜单是一个子菜单；F10 落在这颗钮上；焦点在菜单栏里时变窄，焦点落到这颗钮上', async () => {
    trigger('File').focus()
    await page.viewport(375, 700)
    await until(() => frame.narrow)
    await settle()
    const button = frame.querySelector<HTMLButtonElement>('[data-scope="designer-menubar"][data-part="menu-trigger"]')!
    expect([button.checkVisibility(), frame.querySelector('[role="menubar"]')!.checkVisibility()]).toEqual([true, false])
    expect(document.activeElement).toBe(button)
    canvas.focus()
    await userEvent.keyboard('{F10}')
    expect(document.activeElement).toBe(button)
    await userEvent.click(button)
    const items = (): HTMLElement[] => [...document.querySelectorAll<HTMLElement>('[data-scope="menu"][data-part="content"]')]
      .filter(content => content.checkVisibility())
      .flatMap(content => [...content.querySelectorAll<HTMLElement>('[role^="menuitem"]')].filter(item => item.closest('[data-part="content"]') === content))
    await until(() => items().length === 4)
    expect(items().map(item => item.textContent?.trim())).toEqual(['File', 'Edit', 'View', 'Help'])
  })
})
