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

    expect(frame.regions!.map(region => region.name)).toEqual(['header', 'toolbar', 'palette', 'canvas', 'properties', 'issues', 'status', 'layers', 'simulation'])
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
    expect(frame.regions!.map(region => region.name)).toEqual(['header', 'toolbar', 'palette', 'canvas', 'properties', 'issues', 'status'])
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

  it('顶栏位置 header 与工具栏一样排；短文字没给时用 label，可以是函数', () => {
    const header = new Map<string, DesignerCommand<Ctx>>([
      ['add-task', cmd('add-task', { placement: ['header'], label: '添加任务节点', shortLabel: '任务' })],
      ['add-end', cmd('add-end', { placement: ['header'], shortLabel: ctx => `结束 ${ctx.selected}` })],
      ['undo', cmd('undo', { placement: ['toolbar'] })],
    ])
    expect(arrangeCommands('header', header, [])).toEqual([['add-task', 'add-end']])
    expect([...header.values()].map(command => commandShortLabel(command, { selected: 2 }))).toEqual(['任务', '结束 2', 'UNDO'])
  })

  it('工具栏 stacked：按钮上看得见的是短文字，名字仍是全名，提示管每个按钮；换回 both 显示全名', () => {
    const header = new Map<string, DesignerCommand<Ctx>>([['add-task', cmd('add-task', { icon: GLYPH, label: '添加任务节点', shortLabel: '任务' })]])
    const bar = createCommandToolbar<Ctx>(document, { display: 'stacked', platform: 'other' })
    document.body.append(bar.element)
    bar.update([['add-task']], header, { selected: 0 }, '插入')
    const item = bar.toolbar.querySelector<HTMLButtonElement>('[data-xh-part="item"]')!
    const label = item.querySelector('[data-part="label"]')!
    expect([label.textContent, item.getAttribute('aria-label'), bar.element.getAttribute('delegate')]).toEqual(['任务', '添加任务节点', 'button[data-xh-part=\'item\']'])
    bar.setDisplay('both')
    expect(label.textContent).toBe('添加任务节点')
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

  it('内置命令：给了 openSettings 有 settings、给了 helpUrl 有 help，文案取 xh-designer-commands，图标由各款给', () => {
    expect(designerShellCommands<Ctx>({ translations: () => DESIGNER_COMMANDS_EN_US })).toEqual([])
    const opened: Ctx[] = []
    let url: string | undefined = 'https://flow.docs.xihanfun.com/guide/designer'
    const built = designerShellCommands<Ctx>({
      translations: () => ({ ...DESIGNER_COMMANDS_EN_US, settings: '设置' }),
      openSettings: context => void opened.push(context),
      helpUrl: () => url,
      icons: { settings: GLYPH },
    })
    const table = new Map(built.map(command => [command.id, command]))
    expect([...table.keys()]).toEqual(['settings', 'help'])
    expect([commandShortLabel(table.get('settings')!, { selected: 0 }), table.get('settings')!.icon, table.get('help')!.icon]).toEqual(['设置', GLYPH, undefined])
    expect(built.map(command => command.placement)).toEqual([['toolbar'], ['toolbar']])
    runCommand(table, 'settings', { selected: 3 })
    expect(opened).toEqual([{ selected: 3 }])
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
