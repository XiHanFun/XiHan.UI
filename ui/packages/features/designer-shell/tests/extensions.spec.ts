// @vitest-environment jsdom

// 扩展的面板与命令：面板登记到外框的区、按引用比对创建与撤掉、区名冲突抛错；命令按排列分组，
// 铺成工具栏按钮与菜单条目，点击与选中执行命令；粘贴与拖放的数据列成导入来源。
import type { DiagnosticRecord } from '@xihan-ui/core'
import type { DesignerCommand } from '@xihan-ui/designer-kit'
import type { DesignerPanel, DesignerShellExtension, XhDesignerFrameElement } from '../src'
import { onDiagnostic, resetDiagnostics, setDiagnosticsConsoleOutput, setDiagnosticsDedupe, setDiagnosticsLevel } from '@xihan-ui/core'
import { DesignerExtensionError } from '@xihan-ui/designer-kit'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  arrangeCommands,
  commandShortLabel,
  createCommandToolbar,
  createPanelActions,
  createPanelHost,
  createStatusItem,
  defineDesignerShell,
  DESIGNER_COMMANDS_EN_US,
  designerShellCommands,
  importSources,
  renderCommandMenu,
  runCommand,
} from '../src'

defineDesignerShell()

interface Ctx { readonly selected: number }

const GLYPH = { name: 'line', viewBox: '0 0 24 24', nodes: [{ tag: 'path' as const, attrs: { d: 'M4 12h16' } }] }

afterEach(() => {
  document.body.replaceChildren()
})

async function mountFrame(): Promise<XhDesignerFrameElement> {
  const frame = document.createElement('xh-designer-frame')
  document.body.append(frame)
  await frame.updateComplete
  return frame
}

function panel(name: string, log: string[]): DesignerPanel<Ctx> {
  return {
    region: { name, position: 'end' },
    create: (context) => {
      log.push(`create ${name} ${context.selected}`)
      const element = document.createElement('section')
      element.textContent = name
      return {
        element,
        update: next => log.push(`update ${name} ${next.selected}`),
        destroy: () => log.push(`destroy ${name}`),
      }
    },
  }
}

describe('createPanelHost', () => {
  it('面板的区追加在内置区之后，元素进对应的区；去掉的面板撤掉，留下的不重建', async () => {
    const frame = await mountFrame()
    const log: string[] = []
    const layers = panel('layers', log)
    const sim = panel('simulation', log)
    const host = createPanelHost<Ctx>(frame)
    const extensions: DesignerShellExtension<Ctx>[] = [{ id: 'a', panels: [layers] }, { id: 'b', panels: [sim] }]
    host.assign(extensions, { selected: 1 })
    await frame.updateComplete

    expect(frame.regions!.map(region => region.name)).toEqual(['menubar', 'toolbar', 'palette', 'canvas', 'properties', 'issues', 'status', 'layers', 'simulation'])
    expect(frame.querySelector('[data-region="layers"]')!.textContent).toBe('layers')
    expect(log.splice(0)).toEqual(['create layers 1', 'create simulation 1'])

    host.update({ selected: 2 })
    expect(log.splice(0)).toEqual(['update layers 2', 'update simulation 2'])

    host.assign([{ id: 'a', panels: [layers] }], { selected: 3 })
    await frame.updateComplete
    expect(log.splice(0)).toEqual(['destroy simulation'])
    expect(frame.querySelector('[data-region="simulation"]')).toBeNull()

    host.dispose()
    await frame.updateComplete
    expect(log.splice(0)).toEqual(['destroy layers'])
    expect(frame.regions!.map(region => region.name)).toEqual(['menubar', 'toolbar', 'palette', 'canvas', 'properties', 'issues', 'status'])
  })

  it('区名与内置区或别的扩展重名时抛错，什么都不变', async () => {
    const frame = await mountFrame()
    const log: string[] = []
    const host = createPanelHost<Ctx>(frame)
    const error = (() => {
      try {
        host.assign([{ id: 'a', panels: [panel('properties', log)] }], { selected: 0 })
      }
      catch (caught) {
        return caught
      }
      return undefined
    })()
    expect(error).toBeInstanceOf(DesignerExtensionError)
    expect([(error as DesignerExtensionError).space, (error as DesignerExtensionError).extensions]).toEqual(['panel', ['builtin', 'a']])
    expect(() => host.assign([{ id: 'a', panels: [panel('x', log)] }, { id: 'b', panels: [panel('x', log)] }], { selected: 0 })).toThrow(DesignerExtensionError)
    expect(log).toEqual([])
    expect(frame.regions).toBeUndefined()
  })

  it('面板给了 headerCommands：按命令表铺成只显示图标的一小条，放进面板头的操作区，随上下文刷新，撤掉面板时一起撤', async () => {
    const frame = await mountFrame()
    const log: string[] = []
    const clear: DesignerCommand<Ctx> = { id: 'clear-history', label: '清空历史', icon: GLYPH, enabled: context => context.selected > 0, run: () => void log.push('clear') }
    const commands = new Map([[clear.id, clear]])
    const history: DesignerPanel<Ctx> = { ...panel('history', log), region: { name: 'history', position: 'end', title: '历史' }, headerCommands: ['clear-history', 'ghost'] }
    const host = createPanelHost<Ctx>(frame, { commands: () => commands, actionsLabel: (_context, title) => `${title}操作` })
    host.assign([{ id: 'a', panels: [history] }], { selected: 0 })
    await new Promise(resolve => setTimeout(resolve))
    await frame.updateComplete
    const actions = frame.querySelector<HTMLElement>('[data-region="history"] [data-part="panel-actions"]')!
    const button = actions.querySelector<HTMLButtonElement>('button[value="clear-history"]')!
    expect([actions.hidden, button.getAttribute('aria-label'), button.disabled]).toEqual([false, '清空历史', true])
    expect(actions.querySelector('xh-toolbar [data-xh-part="root"]')!.getAttribute('aria-label')).toBe('历史操作')
    host.update({ selected: 1 })
    await frame.updateComplete
    expect(button.disabled).toBe(false)
    button.click()
    expect(log.at(-1)).toBe('clear')
    host.dispose()
    await frame.updateComplete
    expect(frame.querySelector('button[value="clear-history"]')).toBeNull()
  })
})

describe('面板头命令条没有命令时', () => {
  it('不建 xh-toolbar、不报 wc.*，整条藏起；有了命令再建，命令又没了时再藏起、拿掉 xh-toolbar（内置面板与扩展面板都一样）', async () => {
    const seen: DiagnosticRecord[] = []
    resetDiagnostics()
    setDiagnosticsConsoleOutput(false)
    setDiagnosticsLevel('warn')
    setDiagnosticsDedupe(false)
    const off = onDiagnostic(record => void seen.push(record))
    try {
      const frame = await mountFrame()
      const clear: DesignerCommand<Ctx> = { id: 'clear-history', label: '清空历史', icon: GLYPH, run: () => {} }
      const commands = new Map([[clear.id, clear]])
      let ids: string[] = []
      const log: string[] = []
      const history: DesignerPanel<Ctx> = { ...panel('history', log), region: { name: 'history', position: 'end', title: '历史' }, headerCommands: () => ids }
      const builtin = createPanelActions<Ctx>(document, 'palette')
      builtin.update([], commands, { selected: 0 }, '物料操作')
      frame.append(builtin.element)
      const host = createPanelHost<Ctx>(frame, { regions: [{ name: 'palette', position: 'start', title: '物料' }, { name: 'canvas', position: 'center' }], commands: () => commands })
      host.assign([{ id: 'a', panels: [history] }], { selected: 0 })
      const settle = async (): Promise<void> => {
        await new Promise(resolve => setTimeout(resolve))
        await frame.updateComplete
      }
      const bars = (): HTMLElement[] => ['palette', 'history'].map(name => frame.querySelector<HTMLElement>(`[data-region="${name}"] [data-part="panel-actions"] > [slot="${name}-actions"]`)!)
      await settle()
      expect(bars().map(bar => [bar.hidden, bar.querySelector('xh-toolbar')])).toEqual([[true, null], [true, null]])
      ids = ['clear-history']
      host.update({ selected: 1 })
      builtin.update(['clear-history'], commands, { selected: 1 }, '物料操作')
      await settle()
      expect(bars().map(bar => [bar.hidden, bar.querySelectorAll('xh-toolbar button[value="clear-history"]').length])).toEqual([[false, 1], [false, 1]])
      ids = []
      host.update({ selected: 1 })
      builtin.update([], commands, { selected: 1 }, '物料操作')
      await settle()
      expect(bars().map(bar => [bar.hidden, bar.querySelector('xh-toolbar')])).toEqual([[true, null], [true, null]])
      expect(seen.filter(record => record.code.startsWith('wc.')).map(record => `${record.code} ${record.scope ?? ''}/${record.part ?? ''}`)).toEqual([])
    }
    finally {
      off()
      resetDiagnostics()
    }
  })
})

describe('命令', () => {
  const ran: string[] = []
  const cmd = (id: string, extra: Partial<DesignerCommand<Ctx>> = {}): DesignerCommand<Ctx> => ({ id, label: id.toUpperCase(), run: () => ran.push(id), ...extra })
  const commands = new Map<string, DesignerCommand<Ctx>>([
    ['undo', cmd('undo')],
    ['delete', cmd('delete', { enabled: ctx => ctx.selected > 0, placement: ['menu:node'], tone: 'danger' })],
    ['sim.run', cmd('sim.run', { label: ctx => `运行 ${ctx.selected}`, placement: ['toolbar'], checked: () => true, shortcut: ['Mod', 'R'] })],
  ])

  it('缺省排列在前、扩展按登记顺序追加成一组；写了 commandLayout 就只用它，写错的 id 抛错', () => {
    expect(arrangeCommands('toolbar', commands, [['undo']])).toEqual([['undo'], ['sim.run']])
    expect(arrangeCommands('menu:node', commands, [])).toEqual([['delete']])
    expect(arrangeCommands('toolbar', commands, [['undo']], { toolbar: [['sim.run', 'undo']] })).toEqual([['sim.run', 'undo']])
    expect(() => arrangeCommands('toolbar', commands, [['undo']], { toolbar: [['redo']] })).toThrow('不是登记过的命令')
  })

  it('选中工具条按主体排：selection:<主体> 与右键菜单同一种排法，宿主的 commandLayout 也能改', () => {
    const selection = new Map<string, DesignerCommand<Ctx>>([
      ['copy', cmd('copy')],
      ['duplicate', cmd('duplicate')],
      ['stamp.rotate', cmd('stamp.rotate', { placement: ['selection:element'] })],
    ])
    expect(arrangeCommands('selection:element', selection, [['copy', 'duplicate']])).toEqual([['copy', 'duplicate'], ['stamp.rotate']])
    expect(arrangeCommands('selection:text', selection, [['copy']])).toEqual([['copy']])
    expect(arrangeCommands('selection:element', selection, [['copy']], { 'selection:element': [['duplicate']] })).toEqual([['duplicate']])
  })

  it('工具栏：按分组铺按钮，文字、可用、选中状态与语气随上下文刷新，点击执行', async () => {
    ran.length = 0
    const toolbar = createCommandToolbar<Ctx>(document, { platform: 'other' })
    document.body.append(toolbar.element)
    toolbar.update([['undo', 'delete'], ['sim.run']], commands, { selected: 0 }, '工具')
    const buttons = () => [...toolbar.element.querySelectorAll<HTMLButtonElement>('[data-xh-part="item"]')]
    expect(buttons().map(button => [button.value, button.textContent, button.getAttribute('aria-label'), button.disabled, button.getAttribute('aria-pressed')])).toEqual([
      ['undo', 'UNDO', 'UNDO', false, null],
      ['delete', 'DELETE', 'DELETE', true, null],
      ['sim.run', '运行 0', '运行 0', false, 'true'],
    ])
    expect(buttons().map(button => button.getAttribute('data-tone'))).toEqual([null, 'danger', null])
    expect(toolbar.element.querySelectorAll('[data-xh-part="separator"]')).toHaveLength(1)

    const first = buttons()[0]
    toolbar.update([['undo', 'delete'], ['sim.run']], commands, { selected: 2 }, '工具')
    expect(buttons()[0]).toBe(first)
    buttons()[1]!.click()
    buttons()[2]!.click()
    expect(ran).toEqual(['delete', 'sim.run'])
  })

  it('工具栏：一个委托提示包着整条工具栏，按钮带图标、快捷键按平台写进 aria-keyshortcuts，收起的条目带图标', () => {
    const iconic = new Map<string, DesignerCommand<Ctx>>([
      ['undo', cmd('undo', { icon: GLYPH, shortcut: ['Mod', 'z'] })],
      ['delete', cmd('delete', { shortcut: ['Delete'] })],
    ])
    const written = (['other', 'mac'] as const).map((platform) => {
      const bar = createCommandToolbar<Ctx>(document, { platform })
      document.body.append(bar.element)
      bar.update([['undo', 'delete']], iconic, { selected: 1 }, '工具')
      expect([bar.element.localName, bar.toolbar.localName, bar.element.getAttribute('platform')]).toEqual(['xh-tooltip', 'xh-toolbar', platform])
      expect((bar.toolbar as HTMLElement & { itemIcons?: unknown }).itemIcons).toEqual({ undo: GLYPH })
      const items = [...bar.toolbar.querySelectorAll<HTMLButtonElement>('[data-xh-part="item"]')]
      expect(items.map(item => item.hasAttribute('data-icon'))).toEqual([true, false])
      expect((items[0]!.querySelector('xh-icon') as HTMLElement & { icon?: unknown }).icon).toBe(GLYPH)
      return items.map(item => item.getAttribute('aria-keyshortcuts'))
    })
    expect(written).toEqual([['Control+Z', 'Delete'], ['Meta+Z', 'Delete']])
  })

  it('工具栏：缺省只显示图标、提示管每个按钮；换显示方式不重铺按钮，文字看得见时提示只管带快捷键的按钮', () => {
    const bar = createCommandToolbar<Ctx>(document, { platform: 'other' })
    document.body.append(bar.element)
    bar.update([['undo', 'delete']], commands, { selected: 1 }, '工具')
    const first = bar.toolbar.querySelector('[data-xh-part="item"]')
    expect([bar.display(), bar.element.getAttribute('data-display'), bar.element.getAttribute('delegate')]).toEqual(['icon', 'icon', 'button[data-xh-part=\'item\']'])
    bar.setDisplay('both')
    expect([bar.display(), bar.element.getAttribute('data-display'), bar.element.getAttribute('delegate')]).toEqual(['both', 'both', 'button[data-xh-part=\'item\'][aria-keyshortcuts]'])
    expect(bar.toolbar.querySelector('[data-xh-part="item"]')).toBe(first)
    expect(createCommandToolbar<Ctx>(document, { display: 'text' }).element.getAttribute('data-display')).toBe('text')
  })

  it('工具栏 icon：没有图标的按钮写短文字，名字仍是全名；有图标的、换成 text 档写全名', () => {
    const pages = new Map<string, DesignerCommand<Ctx>>([
      ['page-menu', cmd('page-menu', { label: ctx => `第 ${ctx.selected} / 3 页：送货单`, shortLabel: ctx => `${ctx.selected} / 3` })],
      ['zoom', cmd('zoom', { label: '缩放' })],
      ['add-task', cmd('add-task', { icon: GLYPH, label: '添加任务节点', shortLabel: '任务' })],
    ])
    const bar = createCommandToolbar<Ctx>(document, { platform: 'other' })
    document.body.append(bar.element)
    bar.update([['page-menu', 'zoom', 'add-task']], pages, { selected: 1 }, '翻页')
    const painted = (): (string | null)[][] => [...bar.toolbar.querySelectorAll<HTMLButtonElement>('[data-xh-part="item"]')]
      .map(item => [item.querySelector('[data-part="label"]')!.textContent, item.getAttribute('aria-label')])
    expect(painted()).toEqual([['1 / 3', '第 1 / 3 页：送货单'], ['缩放', '缩放'], ['添加任务节点', '添加任务节点']])
    bar.update([['page-menu', 'zoom', 'add-task']], pages, { selected: 2 }, '翻页')
    expect(painted()[0]).toEqual(['2 / 3', '第 2 / 3 页：送货单'])
    bar.setDisplay('text')
    expect(painted()[0]).toEqual(['第 2 / 3 页：送货单', '第 2 / 3 页：送货单'])
  })

  it('开发期：shortLabel 不在 label 里时报一条告警，一条命令只报一次；在 label 里（不分大小写）不报', () => {
    const seen: DiagnosticRecord[] = []
    resetDiagnostics()
    setDiagnosticsConsoleOutput(false)
    setDiagnosticsLevel('warn')
    setDiagnosticsDedupe(false)
    const off = onDiagnostic(record => void seen.push(record))
    try {
      const format = new Map<string, DesignerCommand<Ctx>>([
        ['font-size', cmd('font-size', { label: 'Font size', shortLabel: ctx => String(10 + ctx.selected) })],
        ['add-task', cmd('add-task', { icon: GLYPH, label: 'Add task node', shortLabel: 'Task' })],
      ])
      const bar = createCommandToolbar<Ctx>(document, { platform: 'other' })
      document.body.append(bar.element)
      bar.update([['font-size', 'add-task']], format, { selected: 1 }, '格式')
      bar.update([['font-size', 'add-task']], format, { selected: 2 }, '格式')
      expect(seen.map(record => [record.code, record.scope, record.detail])).toEqual([
        ['core.warn', 'designer-commands', { id: 'font-size', label: 'Font size', shortLabel: '11' }],
      ])
    }
    finally {
      off()
      resetDiagnostics()
    }
  })

  it('内置命令：给了 openSettings 有 settings（Mod+,）与打开设置对应页的 shortcuts、about，给了 helpUrl 有 help，都落在菜单栏里、不上工具栏；文案取 xh-designer-commands，图标由各款给', () => {
    expect(designerShellCommands<Ctx>({ translations: () => DESIGNER_COMMANDS_EN_US })).toEqual([])
    const opened: [Ctx, string | undefined][] = []
    let url: string | undefined = 'https://flow.docs.xihanfun.com/guide/designer'
    const built = designerShellCommands<Ctx>({
      translations: () => ({ ...DESIGNER_COMMANDS_EN_US, settings: '设置' }),
      openSettings: (context, section) => void opened.push([context, section]),
      helpUrl: () => url,
      icons: { settings: GLYPH },
    })
    const table = new Map(built.map(command => [command.id, command]))
    expect([...table.keys()]).toEqual(['settings', 'shortcuts', 'about', 'help'])
    expect([commandShortLabel(table.get('settings')!, { selected: 0 }), table.get('settings')!.icon, table.get('help')!.icon]).toEqual(['设置', GLYPH, undefined])
    expect(built.map(command => [command.id, command.placement, command.shortcut])).toEqual([
      ['settings', ['menubar:file'], ['Mod', ',']],
      ['shortcuts', ['menubar:help'], undefined],
      ['about', ['menubar:help'], undefined],
      ['help', ['menubar:help'], undefined],
    ])
    expect([table.get('shortcuts')!.label, table.get('about')!.label].map(label => typeof label === 'function' ? label({ selected: 0 }) : label)).toEqual([DESIGNER_COMMANDS_EN_US.shortcuts, DESIGNER_COMMANDS_EN_US.about])
    runCommand(table, 'settings', { selected: 3 })
    runCommand(table, 'shortcuts', { selected: 4 })
    runCommand(table, 'about', { selected: 5 })
    expect(opened).toEqual([[{ selected: 3 }, undefined], [{ selected: 4 }, 'shortcuts'], [{ selected: 5 }, 'about']])
    const open = vi.spyOn(window, 'open').mockReturnValue(null)
    try {
      expect(runCommand(table, 'help', { selected: 0 })).toBe(true)
      expect(open).toHaveBeenCalledWith('https://flow.docs.xihanfun.com/guide/designer', '_blank', 'noopener,noreferrer')
      url = undefined
      expect(runCommand(table, 'help', { selected: 0 })).toBe(false)
      expect(open).toHaveBeenCalledTimes(1)
    }
    finally {
      open.mockRestore()
    }
  })

  it('给了 save 有 save（Mod+S，落在文件菜单）；start-tour 落在帮助菜单、edit-json 落在编辑菜单', () => {
    const saved: Ctx[] = []
    const built = designerShellCommands<Ctx>({
      translations: () => DESIGNER_COMMANDS_EN_US,
      save: context => void saved.push(context),
      startTour: () => true,
      openJsonEditor: () => {},
      icons: { save: GLYPH },
    })
    const table = new Map(built.map(command => [command.id, command]))
    expect([...table.values()].map(command => [command.id, command.placement, command.shortcut])).toEqual([
      ['save', ['menubar:file'], ['Mod', 'S']],
      ['edit-json', ['menubar:edit'], ['Mod', 'Shift', 'J']],
      ['start-tour', ['menubar:help'], undefined],
    ])
    expect([table.get('save')!.icon, commandShortLabel(table.get('save')!, { selected: 0 })]).toEqual([GLYPH, DESIGNER_COMMANDS_EN_US.save])
    runCommand(table, 'save', { selected: 7 })
    expect(saved).toEqual([{ selected: 7 }])
  })

  it('给了 settings 有三条显示开关 show-toolbar、show-status-bar、show-menubar，收在视图菜单的「外观」子菜单（appearance）里，自己不排位置；勾选读设置，执行时把那一条取反写回；宿主藏起或锁定那一条时不可用', () => {
    let settings: Record<string, unknown> = { 'toolbar.visible': false }
    let policy: Record<string, 'hidden' | 'locked'> = {}
    const changes: [string, unknown][] = []
    const built = designerShellCommands<Ctx>({
      translations: () => DESIGNER_COMMANDS_EN_US,
      settings: {
        read: () => settings as never,
        change: (_context, key, value) => {
          changes.push([key, value])
          settings = { ...settings, [key]: value }
        },
        policy: () => policy,
      },
    })
    const table = new Map(built.map(command => [command.id, command]))
    const ctx = { selected: 0 }
    expect([...table.keys()]).toEqual(['show-toolbar', 'show-status-bar', 'show-menubar', 'appearance'])
    expect(['show-toolbar', 'show-status-bar', 'show-menubar'].map(id => table.get(id)!).map(command => [command.id, command.placement, command.checked!(ctx), command.enabled!(ctx)])).toEqual([
      ['show-toolbar', undefined, false, true],
      ['show-status-bar', undefined, true, true],
      ['show-menubar', undefined, true, true],
    ])
    const appearance = table.get('appearance')!
    expect([appearance.placement, commandShortLabel(appearance, ctx), appearance.menu!(ctx), appearance.run]).toEqual([
      ['menubar:view'],
      DESIGNER_COMMANDS_EN_US.appearance,
      ['show-toolbar', 'show-status-bar', 'show-menubar'],
      undefined,
    ])
    runCommand(table, 'show-toolbar', ctx)
    runCommand(table, 'show-status-bar', ctx)
    runCommand(table, 'show-menubar', ctx)
    expect(changes).toEqual([['toolbar.visible', true], ['general.statusBar', false], ['toolbar.menubar', false]])
    policy = { 'toolbar.menubar': 'locked', 'general': 'hidden' }
    expect(['show-toolbar', 'show-status-bar', 'show-menubar'].map(id => table.get(id)!.enabled!(ctx))).toEqual([true, false, false])
  })

  it('给了 frame 有拖动工具 pan-tool：快捷键 H、上工具栏也落在视图菜单、开关式，勾选跟着外框的 canvasTool，执行时在 select 与 pan 之间切换；panels 也落在视图菜单', () => {
    const frame = { canvasTool: 'select' as 'select' | 'pan', panelEntries: () => [], togglePanel: () => {}, toggleAllPanels: () => {}, restorePanels: () => {}, resetLayout: () => {} }
    const built = designerShellCommands<Ctx>({ translations: () => DESIGNER_COMMANDS_EN_US, frame: () => frame, icons: { panTool: GLYPH } })
    const table = new Map(built.map(command => [command.id, command]))
    const pan = table.get('pan-tool')!
    expect(table.get('panels')!.placement).toEqual(['toolbar', 'menubar:view'])
    expect([pan.shortcut, pan.placement, pan.icon, commandShortLabel(pan, { selected: 0 })]).toEqual([['H'], ['toolbar', 'menubar:view'], GLYPH, DESIGNER_COMMANDS_EN_US.panTool])
    expect(pan.checked!({ selected: 0 })).toBe(false)
    expect(runCommand(table, 'pan-tool', { selected: 0 })).toBe(true)
    expect([frame.canvasTool, pan.checked!({ selected: 0 })]).toEqual(['pan', true])
    runCommand(table, 'pan-tool', { selected: 0 })
    expect(frame.canvasTool).toBe('select')
  })

  it('菜单：铺条目与分隔线，不可用的写 aria-disabled，语气写 data-tone，带快捷键的写提示；runCommand 只执行可用的', () => {
    ran.length = 0
    const content = document.createElement('div')
    renderCommandMenu(content, [['delete'], ['sim.run']], commands, { selected: 0 }, { platform: 'other' })
    expect([...content.children].map(item => [item.getAttribute('data-xh-part'), item.getAttribute('value'), item.getAttribute('aria-disabled'), item.textContent])).toEqual([
      ['item', 'delete', 'true', 'DELETE'],
      ['separator', null, null, ''],
      ['item', 'sim.run', null, '运行 0Ctrl+R'],
    ])
    expect([...content.children].map(item => item.getAttribute('data-tone'))).toEqual(['danger', null, null])
    expect([...content.children].map(item => item.getAttribute('aria-keyshortcuts'))).toEqual([null, null, 'Control+R'])
    expect(runCommand(commands, 'delete', { selected: 0 })).toBe(false)
    expect(runCommand(commands, 'delete', { selected: 1 })).toBe(true)
    expect(runCommand(commands, 'missing', { selected: 1 })).toBe(false)
    expect(ran).toEqual(['delete'])
  })

  it('菜单：带图标的命令在文字前铺 item-icon，macOS 上快捷键写 Meta', () => {
    const content = document.createElement('div')
    const iconic = new Map<string, DesignerCommand<Ctx>>([['undo', cmd('undo', { icon: GLYPH, shortcut: ['Mod', 'z'] })]])
    renderCommandMenu(content, [['undo']], iconic, { selected: 0 }, { platform: 'mac' })
    const item = content.firstElementChild!
    expect([...item.children].map(child => child.getAttribute('data-xh-part'))).toEqual(['item-icon', 'item-text', 'item-shortcut'])
    expect((item.querySelector('xh-icon') as HTMLElement & { icon?: unknown }).icon).toBe(GLYPH)
    expect([item.getAttribute('aria-keyshortcuts'), item.querySelector('[data-xh-part="item-shortcut"]')!.textContent]).toEqual(['Meta+Z', '⌘Z'])
  })

  it('第二快捷键接在主快捷键后面写进 aria-keyshortcuts，菜单行尾与提示只显示主快捷键', () => {
    const redo = new Map<string, DesignerCommand<Ctx>>([['redo', cmd('redo', { shortcut: ['Mod', 'Shift', 'z'], alternateShortcuts: [['Ctrl', 'y']] })]])
    const bar = createCommandToolbar<Ctx>(document, { platform: 'mac' })
    document.body.append(bar.element)
    bar.update([['redo']], redo, { selected: 1 }, '工具')
    expect(bar.toolbar.querySelector('[data-xh-part="item"]')!.getAttribute('aria-keyshortcuts')).toBe('Meta+Shift+Z Control+Y')
    const content = document.createElement('div')
    renderCommandMenu(content, [['redo']], redo, { selected: 0 }, { platform: 'other' })
    const item = content.firstElementChild!
    expect([item.getAttribute('aria-keyshortcuts'), item.querySelector('[data-xh-part="item-shortcut"]')!.textContent]).toEqual(['Control+Shift+Z Control+Y', 'Ctrl+Shift+Z'])
  })
})

describe('createStatusItem', () => {
  it('一段文字：标签弱一档、值按语气着色，update 换内容；不给标签时标签收起', () => {
    const item = createStatusItem(document, { label: '已选', value: '2 个节点' })
    const label = item.element.querySelector<HTMLElement>('[data-part="status-label"]')!
    const value = item.element.querySelector<HTMLElement>('[data-part="status-value"]')!
    expect([item.element.localName, item.element.getAttribute('data-part'), label.textContent, value.textContent, label.hidden]).toEqual(['span', 'status-item', '已选', '2 个节点', false])
    item.update({ value: '保存失败', tone: 'danger' })
    expect([label.hidden, value.textContent, value.getAttribute('data-tone')]).toEqual([true, '保存失败', 'danger'])
  })

  it('给了 action 是一颗 ghost 小按钮，点了调用它', () => {
    let clicks = 0
    const item = createStatusItem(document, { label: '缩放', value: '80%', action: () => void clicks++ })
    document.body.append(item.element)
    expect([item.element.localName, item.element.getAttribute('variant'), item.element.getAttribute('size')]).toEqual(['xh-button', 'ghost', 'sm'])
    item.element.querySelector('button')!.click()
    expect(clicks).toBe(1)
  })
})

describe('importSources', () => {
  it('先列文件，再按链接、HTML、纯文本列出不为空的文本', () => {
    const file = new File(['<svg/>'], 'logo.svg', { type: 'image/svg+xml' })
    const texts: Record<string, string> = { 'text/plain': 'https://example.com/a.png', 'text/uri-list': 'https://example.com/a.png' }
    const sources = importSources({ files: [file] as unknown as FileList, getData: mime => texts[mime] ?? '' }, 'drop')
    expect(sources).toEqual([
      { kind: 'drop', mime: 'image/svg+xml', name: 'logo.svg', file },
      { kind: 'drop', mime: 'text/uri-list', text: 'https://example.com/a.png' },
      { kind: 'drop', mime: 'text/plain', text: 'https://example.com/a.png' },
    ])
  })

  it('什么都没有时是空列表', () => {
    expect(importSources({ files: [] as unknown as FileList, getData: () => '' }, 'clipboard')).toEqual([])
  })
})
