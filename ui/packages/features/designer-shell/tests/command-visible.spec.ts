// @vitest-environment jsdom

// 此刻不存在的命令（visible 返回 false）：工具栏、菜单栏、右键菜单、菜单命令里写成 id 的项、设置的工具栏按钮表与快捷键表都不列它，
// runCommand 不执行；内置的编辑 JSON 只在开发者模式开着时出现。
import type { DesignerCommand } from '@xihan-ui/designer-kit'
import { afterEach, describe, expect, it } from 'vitest'
import {
  arrangeMenubar,
  createCommandMenubar,
  createCommandToolbar,
  defineDesignerShell,
  DESIGNER_COMMANDS_EN_US,
  DESIGNER_SETTING_KEYS,
  designerMenubarMenus,
  designerShellCommands,
  developerModeOf,
  renderCommandMenu,
  runCommand,
  shortcutSettingsSource,
  toolbarSettingsSource,
} from '../src'
import { commandMenuData } from '../src/extensions/commands'

defineDesignerShell()

afterEach(() => {
  document.body.replaceChildren()
})

interface Ctx { readonly debug: boolean }

const ran: string[] = []
const cmd = (id: string, extra: Partial<DesignerCommand<Ctx>> = {}): DesignerCommand<Ctx> => ({ id, label: id, run: () => void ran.push(id), ...extra })
const commands = new Map<string, DesignerCommand<Ctx>>([
  ['undo', cmd('undo', { shortcut: ['Mod', 'Z'] })],
  ['inspect', cmd('inspect', { shortcut: ['Mod', 'Shift', 'I'], visible: ctx => ctx.debug })],
  ['tools', cmd('tools', { run: undefined, menu: () => ['undo', 'inspect'] })],
])
const off: Ctx = { debug: false }
const on: Ctx = { debug: true }

describe('visible 返回 false 的命令此刻不存在', () => {
  it('工具栏不铺它的按钮；runCommand 不执行；打开时照常铺、照常执行', async () => {
    const bar = createCommandToolbar<Ctx>(document, { platform: 'other' })
    document.body.append(bar.element)
    const buttons = (): string[] => [...bar.element.querySelectorAll('button[value]')].map(button => button.getAttribute('value')!)
    bar.update([['undo', 'inspect']], commands, off, 'Toolbar')
    expect(buttons()).toEqual(['undo'])
    expect(runCommand(commands, 'inspect', off)).toBe(false)
    bar.update([['undo', 'inspect']], commands, on, 'Toolbar')
    expect(buttons()).toEqual(['undo', 'inspect'])
    ran.length = 0
    expect(runCommand(commands, 'inspect', on)).toBe(true)
    expect(ran).toEqual(['inspect'])
  })

  it('菜单栏、右键菜单与菜单命令里写成 id 的项都不列它', () => {
    const menubar = createCommandMenubar<Ctx>(document, { platform: 'other' })
    const menus = designerMenubarMenus<Ctx>({ translations: () => DESIGNER_COMMANDS_EN_US })
    menubar.update(arrangeMenubar(menus, commands, { edit: [['undo', 'inspect']] }), commands, off, { menubar: 'Menu bar', menu: 'Menu' })
    const items = (menubar.menubar as HTMLElement & { collection?: { items?: { value: string }[] }[] }).collection![0]!.items!.map(item => item.value)
    expect(items).toEqual(['edit/undo'])
    const content = document.createElement('div')
    renderCommandMenu(content, [['undo', 'inspect']], commands, off)
    expect([...content.querySelectorAll('[value]')].map(item => item.getAttribute('value'))).toEqual(['undo'])
    expect(commandMenuData(['undo', 'inspect'], commands, off).collection.map(node => node.value)).toEqual(['command:undo'])
    expect(commandMenuData(['undo', 'inspect'], commands, on).collection.map(node => node.value)).toEqual(['command:undo', 'command:inspect'])
  })

  it('设置的工具栏按钮表与快捷键表都不列它', () => {
    expect(toolbarSettingsSource([['undo', 'inspect']], commands, off).commands.map(item => item.id)).toEqual(['undo'])
    const rows = (ctx: Ctx): number => shortcutSettingsSource(commands, ctx).groups.flatMap(group => group.rows).length
    expect([rows(off), rows(on)]).toEqual([1, 2])
  })
})

describe('开发者模式', () => {
  it('developerModeOf 只认 general.developer 为 true；内置的编辑 JSON 在给了 settings 时只在开发者模式下出现', () => {
    expect(DESIGNER_SETTING_KEYS.developer).toBe('general.developer')
    expect([developerModeOf(undefined), developerModeOf({ 'general.developer': 1 }), developerModeOf({ 'general.developer': true })]).toEqual([false, false, true])
    let settings: Record<string, boolean> = {}
    const table = new Map(designerShellCommands<Ctx>({
      translations: () => DESIGNER_COMMANDS_EN_US,
      openJsonEditor: () => void ran.push('json'),
      settings: { read: () => settings, change: () => {} },
    }).map(command => [command.id, command]))
    const json = table.get('edit-json')!
    expect(json.visible?.(off)).toBe(false)
    ran.length = 0
    expect(runCommand(table, 'edit-json', off)).toBe(false)
    settings = { 'general.developer': true }
    expect([json.visible?.(off), runCommand(table, 'edit-json', off), ran]).toEqual([true, true, ['json']])
    const plain = designerShellCommands<Ctx>({ translations: () => DESIGNER_COMMANDS_EN_US, openJsonEditor: () => {} }).find(command => command.id === 'edit-json')!
    expect(plain.visible).toBeUndefined()
  })
})
