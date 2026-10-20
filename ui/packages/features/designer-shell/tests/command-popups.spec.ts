// @vitest-environment jsdom

// 弹层命令与菜单命令：工具栏上点开锚在按钮上的 <xh-popover> 与 <xh-menu>，按钮收在「更多」里时锚在「更多」上，
// 开着的时候命令被收进「更多」或放回来，锚点跟着换；菜单的条目按上下文现算，选中调 select 或执行写成 id 的那条命令；
// 内置的「面板」命令列出外框能开关的面板；竖排工具栏的提示与弹层在行首一侧弹出。
import type { DesignerCommand, DesignerCommandPanel } from '@xihan-ui/designer-kit'
import type { DesignerPanelEntry, XhDesignerFrameElement } from '../src'
import { afterEach, describe, expect, it } from 'vitest'
import { createCommandToolbar, defineDesignerShell, DESIGNER_COMMANDS_EN_US, designerPanelCommands, designerShellCommands, renderCommandMenu, runCommand } from '../src'

defineDesignerShell()

interface Ctx { readonly page: number, readonly log: string[] }

type PopoverHost = HTMLElement & { open?: boolean, anchor?: HTMLElement | null, placement?: string, updateComplete?: Promise<unknown> }
type MenuHost = HTMLElement & {
  open?: boolean
  anchor?: HTMLElement | null
  placement?: string
  collection?: readonly Record<string, unknown>[]
  checkboxValue?: readonly string[]
  radioValue?: Readonly<Record<string, string>>
  translations?: { content?: string }
}

afterEach(() => {
  document.body.replaceChildren()
})

function setupPanel(log: string[]): DesignerCommandPanel<Ctx> {
  const element = document.createElement('form')
  element.textContent = '纸张'
  log.push('create')
  return { element, update: context => void log.push(`update ${context.page}`), destroy: () => void log.push('destroy') }
}

function commandTable(): Map<string, DesignerCommand<Ctx>> {
  return new Map<string, DesignerCommand<Ctx>>([
    ['undo', { id: 'undo', label: '撤销', run: context => void context.log.push('undo') }],
    ['page-setup', { id: 'page-setup', label: '页面设置', panel: context => setupPanel(context.log) }],
    ['move-up', { id: 'move-up', label: '上移页面', enabled: context => context.page > 0, run: context => void context.log.push('move-up') }],
    ['page-menu', {
      id: 'page-menu',
      label: context => `第 ${context.page + 1} 页`,
      menu: context => [
        { value: '0', label: '封面', checked: context.page === 0, group: 'page' },
        { value: '1', label: '明细', checked: context.page === 1, group: 'page' },
        'separator',
        { value: 'grid', label: '网格', checked: true },
        'move-up',
        'separator',
      ],
      select: (value, context) => void context.log.push(`select ${value}`),
    }],
  ])
}

function mount(context: Ctx, options: Parameters<typeof createCommandToolbar>[1] = {}) {
  const bar = createCommandToolbar<Ctx>(document, { platform: 'other', ...options })
  document.body.append(bar.element)
  const commands = commandTable()
  bar.update([['undo', 'page-setup', 'page-menu']], commands, context, '页面')
  const button = (id: string): HTMLButtonElement => bar.element.querySelector<HTMLButtonElement>(`button[data-xh-part='item'][value='${id}']`)!
  const overflow = (): HTMLButtonElement => bar.element.querySelector<HTMLButtonElement>('button[data-xh-part=\'overflow-trigger\']')!
  const popover = (): PopoverHost => bar.element.querySelector<PopoverHost>('xh-popover')!
  const menu = (): MenuHost => bar.element.querySelector<MenuHost>('xh-menu')!
  return { bar, commands, button, overflow, popover, menu }
}

const tick = (): Promise<void> => new Promise(resolve => setTimeout(resolve, 0))

describe('弹层命令', () => {
  it('点它打开锚在按钮上的弹层，面板放进 content 并以命令文字命名；开着时 update 刷新面板，再点收起并撤掉面板', () => {
    const log: string[] = []
    const t = mount({ page: 0, log })
    t.button('page-setup').click()
    expect(t.bar.opened()).toBe('page-setup')
    expect([t.popover().open, t.popover().anchor, t.popover().placement]).toEqual([true, t.button('page-setup'), 'bottom-start'])
    const content = t.popover().querySelector('[data-xh-part="content"]')!
    expect([content.getAttribute('aria-label'), content.firstElementChild?.textContent]).toEqual(['页面设置', '纸张'])
    t.bar.update([['undo', 'page-setup', 'page-menu']], t.commands, { page: 2, log }, '页面')
    t.button('page-setup').click()
    expect(t.bar.opened()).toBeUndefined()
    expect(t.popover().open).toBe(false)
    expect(content.childElementCount).toBe(0)
    expect(log).toEqual(['create', 'update 2', 'destroy'])
  })

  it('弹层自己收起（Escape、点在外面）派发 open-change 时一并撤掉面板；点别的弹层或菜单命令是换过去', () => {
    const log: string[] = []
    const t = mount({ page: 0, log })
    t.button('page-setup').click()
    t.popover().dispatchEvent(new CustomEvent('open-change', { detail: { open: false } }))
    expect([t.bar.opened(), log]).toEqual([undefined, ['create', 'destroy']])
    t.button('page-setup').click()
    t.button('page-menu').click()
    expect([t.bar.opened(), t.popover().open, t.menu().open]).toEqual(['page-menu', false, true])
    expect(log).toEqual(['create', 'destroy', 'create', 'destroy'])
  })

  it('收在「更多」里时锚在「更多」上；开着的时候被收进去或放回来，锚点跟着换', async () => {
    const t = mount({ page: 0, log: [] })
    t.button('page-setup').hidden = true
    expect(t.bar.open('page-setup')).toBe(true)
    expect(t.popover().anchor).toBe(t.overflow())
    t.button('page-setup').hidden = false
    await tick()
    expect(t.popover().anchor).toBe(t.button('page-setup'))
    t.button('page-setup').hidden = true
    await tick()
    expect(t.popover().anchor).toBe(t.overflow())
  })

  it('open 给快捷键用：不是弹层或菜单命令、或此刻不可用时返回 false；重铺按钮与命令变得不可用时关掉', () => {
    const log: string[] = []
    const t = mount({ page: 0, log })
    expect(t.bar.open('undo')).toBe(false)
    expect(t.bar.open('missing')).toBe(false)
    expect(t.bar.open('page-setup')).toBe(true)
    expect(t.bar.open('page-setup')).toBe(true)
    expect(log).toEqual(['create'])
    t.bar.update([['undo', 'page-setup', 'page-menu']], t.commands, { page: 0, log }, '页面')
    expect(t.bar.opened()).toBe('page-setup')
    t.bar.update([['page-setup']], t.commands, { page: 0, log }, '页面')
    expect([t.bar.opened(), log]).toEqual([undefined, ['create', 'update 0', 'destroy']])
    t.bar.open('page-setup')
    const locked = new Map(t.commands).set('page-setup', { ...t.commands.get('page-setup')!, enabled: () => false })
    t.bar.update([['page-setup']], locked, { page: 0, log }, '页面')
    expect(t.bar.opened()).toBeUndefined()
    expect(t.bar.open('page-setup')).toBe(false)
  })
})

describe('菜单命令', () => {
  it('点它打开锚在按钮上的菜单：条目、命令与分隔线按上下文现算，单选与复选的勾写进菜单的值，名字取命令文字', () => {
    const t = mount({ page: 1, log: [] })
    t.button('page-menu').click()
    const menu = t.menu()
    expect([menu.open, menu.anchor, menu.translations?.content]).toEqual([true, t.button('page-menu'), '第 2 页'])
    expect(menu.collection).toEqual([
      { value: 'item:0', label: '封面', kind: 'radio', group: 'page', closeOnSelect: true },
      { value: 'item:1', label: '明细', kind: 'radio', group: 'page', closeOnSelect: true },
      { separatorBefore: true, value: 'item:grid', label: '网格', kind: 'checkbox' },
      { value: 'command:move-up', label: '上移页面', disabled: false },
    ])
    expect([menu.radioValue, menu.checkboxValue]).toEqual([{ page: 'item:1' }, ['item:grid']])
    t.bar.update([['undo', 'page-setup', 'page-menu']], t.commands, { page: 0, log: [] }, '页面')
    expect(menu.radioValue).toEqual({ page: 'item:0' })
    expect(menu.collection?.[3]).toMatchObject({ value: 'command:move-up', disabled: true })
  })

  it('选中条目调命令的 select，选中写成 id 的项执行那条命令；菜单收起即关', () => {
    const log: string[] = []
    const t = mount({ page: 1, log })
    t.button('page-menu').click()
    t.menu().dispatchEvent(new CustomEvent('item-select', { detail: { value: 'item:0' } }))
    t.menu().dispatchEvent(new CustomEvent('item-select', { detail: { value: 'command:move-up' } }))
    expect(log).toEqual(['select 0', 'move-up'])
    t.menu().dispatchEvent(new CustomEvent('open-change', { detail: { open: false } }))
    expect([t.bar.opened(), t.menu().open]).toEqual([undefined, false])
  })

  it('复选条目只派发 checkbox-value-change：与此刻的勾选比出点的那一条，调 select', () => {
    const log: string[] = []
    const t = mount({ page: 1, log })
    t.button('page-menu').click()
    expect(t.menu().checkboxValue).toEqual(['item:grid'])
    t.menu().dispatchEvent(new CustomEvent('checkbox-value-change', { detail: { value: [] } }))
    expect(log).toEqual(['select grid'])
  })

  it('菜单命令的项写了没登记的命令 id 时抛错；没有 run 的弹层与菜单命令放进右键菜单时抛错', () => {
    const t = mount({ page: 0, log: [] })
    const broken = new Map(t.commands).set('page-menu', { ...t.commands.get('page-menu')!, menu: () => ['nope'] })
    t.bar.update([['page-menu']], broken, { page: 0, log: [] }, '页面')
    expect(() => t.bar.open('page-menu')).toThrow('nope 不是登记过的命令')
    const content = document.createElement('div')
    expect(() => renderCommandMenu(content, [['page-setup']], t.commands, { page: 0, log: [] })).toThrow('只能放在工具栏上')
    expect(runCommand(t.commands, 'page-setup', { page: 0, log: [] })).toBe(false)
  })
})

describe('竖排', () => {
  // 行首在哪一侧要读计算样式里的书写方向，jsdom 不从 dir 推出它；从右往左写的那一侧在浏览器用例里验
  it('xh-toolbar 竖排，提示与弹层在行首一侧（从左往右写时在左边）', () => {
    const t = mount({ page: 0, log: [] }, { orientation: 'vertical' })
    expect([t.bar.toolbar.getAttribute('orientation'), t.bar.element.getAttribute('data-orientation'), t.bar.element.getAttribute('placement')]).toEqual(['vertical', 'vertical', 'left'])
    t.bar.open('page-setup')
    expect(t.popover().placement).toBe('left-start')
    t.bar.open('page-menu')
    expect(t.menu().placement).toBe('left-start')
  })

  it('横排不写提示的方向，xh-toolbar 不带 orientation', () => {
    const t = mount({ page: 0, log: [] })
    expect([t.bar.toolbar.hasAttribute('orientation'), t.bar.element.hasAttribute('placement'), t.bar.element.getAttribute('data-orientation')]).toEqual([false, false, 'horizontal'])
  })
})

describe('内置的「面板」命令', () => {
  function fakeFrame(entries: DesignerPanelEntry[]) {
    const calls: string[] = []
    const frame = {
      panelEntries: () => entries,
      togglePanel: (name: string) => void calls.push(`toggle:${name}`),
      toggleAllPanels: () => void calls.push('toggle-all'),
      restorePanels: () => void calls.push('restore'),
      resetLayout: () => void calls.push('reset'),
      canvasTool: 'select' as 'select' | 'pan',
    } satisfies Pick<XhDesignerFrameElement, 'panelEntries' | 'togglePanel' | 'toggleAllPanels' | 'restorePanels' | 'resetLayout' | 'canvasTool'>
    return { frame, calls }
  }

  const ENTRIES: DesignerPanelEntry[] = [
    { name: 'palette', label: '物料', shown: true, dock: 'start', minimized: false, floating: false, locked: false, movable: true, floatable: true, minimizable: true },
    { name: 'issues', label: '问题', shown: false, dock: 'bottom', minimized: false, floating: false, locked: true, movable: false, floatable: false, minimizable: false },
  ]

  it('给了 frame 才有 panels：菜单逐块面板一项（勾选显示着的，锁定的不可点），分隔线后是全部显隐、还原、恢复默认；选中调外框的 togglePanel', () => {
    const { frame, calls } = fakeFrame(ENTRIES)
    expect(designerShellCommands<Ctx>({ translations: () => DESIGNER_COMMANDS_EN_US }).map(command => command.id)).toEqual([])
    const commands = designerShellCommands<Ctx>({ translations: () => DESIGNER_COMMANDS_EN_US, frame: () => frame })
    expect(commands.map(command => command.id)).toEqual(['panels', 'panels-toggle-all', 'panels-restore', 'layout-reset', 'pan-tool'])
    const [panels] = commands
    const context: Ctx = { page: 0, log: [] }
    expect([panels!.id, panels!.placement, panels!.run, panels!.enabled?.(context)]).toEqual(['panels', ['toolbar'], undefined, true])
    expect(panels!.menu?.(context)).toEqual([
      { value: 'palette', label: '物料', checked: true },
      { value: 'issues', label: '问题', checked: false, disabled: true },
      'separator',
      'panels-toggle-all',
      'panels-restore',
      'layout-reset',
    ])
    panels!.select?.('issues', context)
    expect(calls).toEqual(['toggle:issues'])
    const [none] = designerShellCommands<Ctx>({ translations: () => DESIGNER_COMMANDS_EN_US, frame: () => undefined })
    expect(none!.enabled?.(context)).toBe(false)
  })

  it('全部显隐与还原带快捷键，三条都不上工具栏；全部面板都锁定时不可用', () => {
    const { frame, calls } = fakeFrame(ENTRIES)
    const [, all, restore, reset] = designerShellCommands<Ctx>({ translations: () => DESIGNER_COMMANDS_EN_US, frame: () => frame })
    const context: Ctx = { page: 0, log: [] }
    expect([all!.shortcut, restore!.shortcut, reset!.shortcut]).toEqual([['Mod', '\\'], ['Mod', 'Shift', '\\'], undefined])
    expect([all!.placement, restore!.placement, reset!.placement]).toEqual([undefined, undefined, undefined])
    expect([all, restore, reset].map(command => typeof command!.label === 'function' ? command!.label(context) : command!.label)).toEqual(['Show or hide all panels', 'Restore panel visibility', 'Reset layout'])
    for (const command of [all, restore, reset])
      command!.run?.(context)
    expect(calls).toEqual(['toggle-all', 'restore', 'reset'])
    const locked = fakeFrame(ENTRIES.map(entry => ({ ...entry, locked: true }))).frame
    const [, lockedAll] = designerShellCommands<Ctx>({ translations: () => DESIGNER_COMMANDS_EN_US, frame: () => locked })
    expect([all!.enabled?.(context), lockedAll!.enabled?.(context)]).toEqual([true, false])
  })

  it('每块面板一条开关命令 panel:<id>：文字取面板标题，checked 是看得见，执行即 togglePanel；外框里没有或锁定时不可用', () => {
    const { frame, calls } = fakeFrame(ENTRIES)
    const commands = designerPanelCommands<Ctx>({ panels: ['palette', 'issues', 'ghost'], frame: () => frame })
    const context: Ctx = { page: 0, log: [] }
    expect(commands.map(command => [command.id, typeof command.label === 'function' ? command.label(context) : command.label, command.checked?.(context), command.enabled?.(context), command.placement, command.shortcut])).toEqual([
      ['panel:palette', '物料', true, true, undefined, undefined],
      ['panel:issues', '问题', false, false, undefined, undefined],
      ['panel:ghost', 'ghost', false, false, undefined, undefined],
    ])
    commands[0]!.run?.(context)
    expect(calls).toEqual(['toggle:palette'])
  })
})
