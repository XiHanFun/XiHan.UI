// @vitest-environment jsdom

// 菜单栏：内置四张菜单与缺省排列，按命令表排出各菜单（缺省排列、placement 追加、宿主的整份排列），扩展登记的菜单与查重，
// 命令铺成 <xh-menubar> 的数据：图标、快捷键提示、不可用、开关式的勾选、菜单命令的子菜单，选中执行；窄屏那颗「菜单」钮的数据。
import type { DiagnosticRecord } from '@xihan-ui/core'
import type { DesignerCommand } from '@xihan-ui/designer-kit'
import type { DesignerMenubarMenu } from '../src'
import { onDiagnostic, resetDiagnostics, setDiagnosticsConsoleOutput, setDiagnosticsDedupe, setDiagnosticsLevel } from '@xihan-ui/core'
import { DesignerExtensionError } from '@xihan-ui/designer-kit'
import { afterEach, describe, expect, it } from 'vitest'
import {
  arrangeMenubar,
  collectMenubarMenus,
  createCommandMenubar,
  defineDesignerShell,
  DESIGNER_COMMANDS_EN_US,
  DESIGNER_MENUBAR_MENUS,
  designerMenubarLayout,
  designerMenubarMenus,
} from '../src'

defineDesignerShell()

interface Ctx { readonly selected: number }

const GLYPH = { name: 'line', viewBox: '0 0 24 24', nodes: [{ tag: 'path' as const, attrs: { d: 'M4 12h16' } }] }

afterEach(() => {
  document.body.replaceChildren()
})

const ran: string[] = []
const cmd = (id: string, extra: Partial<DesignerCommand<Ctx>> = {}): DesignerCommand<Ctx> => ({ id, label: id.toUpperCase(), run: () => ran.push(id), ...extra })

function table(...commands: DesignerCommand<Ctx>[]): Map<string, DesignerCommand<Ctx>> {
  return new Map(commands.map(command => [command.id, command]))
}

const MENUS = designerMenubarMenus<Ctx>({ translations: () => DESIGNER_COMMANDS_EN_US })

describe('内置菜单与缺省排列', () => {
  it('四张内置菜单：文件、编辑、视图、帮助，名字取 xh-designer-commands，先后 0、10、20、90', () => {
    expect(DESIGNER_MENUBAR_MENUS).toEqual({ file: 'file', edit: 'edit', view: 'view', help: 'help' })
    expect(MENUS.map(menu => [menu.id, typeof menu.label === 'function' ? menu.label({ selected: 0 }) : menu.label, menu.order])).toEqual([
      ['file', DESIGNER_COMMANDS_EN_US.menuFile, 0],
      ['edit', DESIGNER_COMMANDS_EN_US.menuEdit, 10],
      ['view', DESIGNER_COMMANDS_EN_US.menuView, 20],
      ['help', DESIGNER_COMMANDS_EN_US.menuHelp, 90],
    ])
  })

  it('designerMenubarLayout：外壳认得的命令按四张菜单排好，只留命令表里有的，空组去掉', () => {
    const all = table(...[
      'save',
      'open-file',
      'settings',
      'undo',
      'redo',
      'cut',
      'copy',
      'paste',
      'delete',
      'duplicate',
      'select-all',
      'edit-json',
      'design',
      'preview',
      'zoom-in',
      'zoom-out',
      'zoom-to-fit',
      'zoom-to-actual',
      'pan-tool',
      'panels',
      'show-toolbar',
      'show-status-bar',
      'appearance',
      'start-tour',
      'help',
      'shortcuts',
      'about',
    ].map(id => cmd(id)))
    expect(designerMenubarLayout(all)).toEqual({
      file: [['save'], ['open-file'], ['settings']],
      edit: [['undo', 'redo'], ['cut', 'copy', 'paste', 'delete', 'duplicate'], ['select-all'], ['edit-json']],
      view: [['design', 'preview'], ['zoom-in', 'zoom-out', 'zoom-to-fit', 'zoom-to-actual'], ['pan-tool'], ['panels', 'appearance']],
      help: [['start-tour', 'help', 'shortcuts'], ['about']],
    })
    expect(designerMenubarLayout(table(cmd('undo'), cmd('delete'), cmd('settings')))).toEqual({
      file: [['settings']],
      edit: [['undo'], ['delete']],
      view: [],
      help: [],
    })
  })
})

describe('arrangeMenubar', () => {
  const commands = table(
    cmd('save'),
    cmd('settings'),
    cmd('undo'),
    cmd('help'),
    cmd('about'),
    cmd('flow.export-png', { placement: ['toolbar', 'menubar:file'] }),
    cmd('flow.auto-layout', { placement: ['menubar:view'] }),
    cmd('print.page-setup', { placement: ['menubar:page'] }),
  )

  it('按先后排菜单；缺省排列在前，placement 落在这张菜单又不在缺省排列里的命令成一组，排在缺省排列的最后一组之前；没有命令的菜单不显示', () => {
    const page: DesignerMenubarMenu<Ctx> = { id: 'page', label: '页面', order: 40 }
    const arranged = arrangeMenubar([...MENUS, page], commands, { file: [['save'], ['settings']], edit: [['undo']], help: [['help'], ['about']] })
    expect(arranged.map(item => [item.menu.id, item.groups])).toEqual([
      ['file', [['save'], ['flow.export-png'], ['settings']]],
      ['edit', [['undo']]],
      ['view', [['flow.auto-layout']]],
      ['page', [['print.page-setup']]],
      ['help', [['help'], ['about']]],
    ])
    // 缺省排列只有一组时追加在它后面
    expect(arrangeMenubar(MENUS, commands, { file: [['save']] })[0]!.groups).toEqual([['save'], ['flow.export-png']])
  })

  it('不写 order 的菜单按 50 排，同值按登记顺序', () => {
    const a: DesignerMenubarMenu<Ctx> = { id: 'a', label: 'A' }
    const b: DesignerMenubarMenu<Ctx> = { id: 'b', label: 'B', order: 50 }
    const own = table(cmd('x', { placement: ['menubar:a', 'menubar:b'] }), cmd('y', { placement: ['menubar:view'] }))
    expect(arrangeMenubar([b, ...MENUS, a], own, {}).map(item => item.menu.id)).toEqual(['view', 'b', 'a'])
  })

  it('宿主的 commandLayout 写了 menubar:<菜单> 就只用它，给空数组就不要这张菜单；写错的 id 抛错', () => {
    expect(arrangeMenubar(MENUS, commands, { file: [['save'], ['settings']] }, { 'menubar:file': [['settings', 'save']], 'menubar:help': [] }).map(item => [item.menu.id, item.groups])).toEqual([
      ['file', [['settings', 'save']]],
      ['view', [['flow.auto-layout']]],
    ])
    expect(() => arrangeMenubar(MENUS, commands, {}, { 'menubar:file': [['new']] })).toThrow('不是登记过的命令')
    expect(() => arrangeMenubar(MENUS, commands, { file: [['new']] })).toThrow('不是登记过的命令')
  })
})

describe('collectMenubarMenus', () => {
  it('内置菜单在前，扩展的按登记顺序在后；菜单 id 重名抛 DesignerExtensionError，名字空间 menubar-menu', () => {
    const insert: DesignerMenubarMenu<Ctx> = { id: 'insert', label: '插入', order: 30 }
    expect(collectMenubarMenus(MENUS, [{ id: 'print' }, { id: 'print.pages', menubarMenus: [insert] }]).map(menu => menu.id)).toEqual(['file', 'edit', 'view', 'help', 'insert'])
    const error = (() => {
      try {
        collectMenubarMenus(MENUS, [{ id: 'acme', menubarMenus: [{ id: 'view', label: '看' }] }])
      }
      catch (caught) {
        return caught
      }
      return undefined
    })() as DesignerExtensionError
    expect(error).toBeInstanceOf(DesignerExtensionError)
    expect([error.space, error.key, error.extensions]).toEqual(['menubar-menu', 'view', ['@xihan-ui/designer-shell', 'acme']])
    expect(() => collectMenubarMenus(MENUS, [{ id: 'a', menubarMenus: [insert] }, { id: 'b', menubarMenus: [insert] }])).toThrow(DesignerExtensionError)
  })
})

interface MenubarHost extends HTMLElement {
  collection?: { value: string, label?: string, items?: { value: string, label?: string, kind?: string, icon?: unknown, shortcut?: string, disabled?: boolean, separatorBefore?: boolean, closeOnSelect?: boolean, checkboxValue?: string[], children?: { value: string, label?: string, kind?: string, separatorBefore?: boolean }[] }[] }[]
  checkboxValue?: string[]
  translations?: { root?: string }
}

interface MenuHost extends HTMLElement {
  collection?: { value: string, label?: string, children?: { value: string }[], checkboxValue?: string[] }[]
}

describe('createCommandMenubar', () => {
  const panels = (on: boolean): DesignerCommand<Ctx> => cmd('panels', {
    run: undefined,
    menu: () => [{ value: 'palette', label: 'Palette', checked: on }, 'separator', 'undo'],
    select: value => ran.push(`panels:${value}`),
  })
  const commands = table(
    cmd('save', { icon: GLYPH, shortcut: ['Mod', 'S'], alternateShortcuts: [['F2']] }),
    cmd('settings'),
    cmd('undo', { label: ctx => `Undo ${ctx.selected}`, enabled: ctx => ctx.selected > 0 }),
    cmd('pan-tool', { checked: ctx => ctx.selected > 1 }),
    panels(true),
    cmd('ruler', { checked: ctx => ctx.selected > 0 }),
    cmd('appearance', { run: undefined, menu: () => ['ruler'] }),
  )
  const arranged = (): ReturnType<typeof arrangeMenubar<Ctx>> => arrangeMenubar(MENUS, commands, { file: [['save'], ['settings']], edit: [['undo']], view: [['pan-tool'], ['panels', 'appearance']] })
  const LABELS = { menubar: 'Menu bar', menu: 'Menu' }

  function mount(context: Ctx = { selected: 0 }): ReturnType<typeof createCommandMenubar<Ctx>> {
    const bar = createCommandMenubar<Ctx>(document, { platform: 'other' })
    document.body.append(bar.element)
    bar.update(arranged(), commands, context, LABELS)
    return bar
  }

  it('一条 <xh-menubar>：每张菜单一个入口，条目带图标、快捷键提示、读屏念的 aria-keyshortcuts（都按平台写，后者含第二快捷键）与不可用，组与组之间一道分隔线；整条的名字取 labels.menubar', () => {
    const bar = mount()
    const host = bar.menubar as MenubarHost
    expect([bar.element.getAttribute('data-scope'), bar.element.getAttribute('data-part'), host.localName]).toEqual(['designer-menubar', 'root', 'xh-menubar'])
    expect(host.translations).toEqual({ root: 'Menu bar' })
    const collection = host.collection!
    expect(collection.map(menu => [menu.value, menu.label])).toEqual([['file', 'File'], ['edit', 'Edit'], ['view', 'View']])
    expect(collection[0]!.items).toEqual([
      { value: 'file/save', label: 'SAVE', icon: GLYPH, shortcut: 'Ctrl+S', keyshortcuts: 'Control+S F2' },
      { value: 'file/settings', label: 'SETTINGS', separatorBefore: true },
    ])
    expect(collection[1]!.items).toEqual([{ value: 'edit/undo', label: 'Undo 0', disabled: true }])
    const mac = createCommandMenubar<Ctx>(document, { platform: 'mac' })
    mac.update(arranged(), commands, { selected: 0 }, LABELS)
    expect((mac.menubar as MenubarHost).collection![0]!.items![0]).toMatchObject({ shortcut: '⌘S', keyshortcuts: 'Meta+S F2' })
  })

  it('开关式命令是勾选条目（选中即收起），勾不勾随上下文；菜单命令是子菜单，里面的条目与写成命令 id 的项照菜单命令的铺，写成 id 的开关式命令也是勾选条目', () => {
    const bar = mount({ selected: 2 })
    const host = bar.menubar as MenubarHost
    const view = host.collection![2]!.items!
    expect(view[0]).toEqual({ value: 'view/pan-tool', label: 'PAN-TOOL', kind: 'checkbox', closeOnSelect: true })
    expect(host.checkboxValue).toEqual(['view/pan-tool'])
    expect(view[1]).toEqual({
      value: 'view/panels',
      label: 'PANELS',
      separatorBefore: true,
      children: [
        { value: 'view/panels/item:palette', label: 'Palette', kind: 'checkbox', closeOnSelect: true },
        { value: 'view/panels/command:undo', label: 'Undo 2', separatorBefore: true, disabled: false },
      ],
      checkboxValue: ['view/panels/item:palette'],
      radioValue: {},
    })
    expect(view[2]).toEqual({
      value: 'view/appearance',
      label: 'APPEARANCE',
      children: [{ value: 'view/appearance/command:ruler', label: 'RULER', disabled: false, kind: 'checkbox', closeOnSelect: true }],
      checkboxValue: ['view/appearance/command:ruler'],
      radioValue: {},
    })
    bar.update(arranged(), commands, { selected: 1 }, LABELS)
    expect(host.checkboxValue).toEqual([])
    bar.update(arranged(), commands, { selected: 0 }, LABELS)
    expect(host.collection![2]!.items![2]!.checkboxValue).toEqual([])
  })

  it('选中条目执行：普通与开关式命令跑命令（不可用的不跑），子菜单的条目交给菜单命令的 select，写成命令 id 的项跑那条命令', () => {
    ran.length = 0
    const bar = mount({ selected: 0 })
    const select = (menu: string, value: string): void => {
      bar.menubar.dispatchEvent(new CustomEvent('item-select', { detail: { menu, value }, bubbles: true }))
    }
    select('file', 'file/save')
    select('edit', 'edit/undo')
    select('view', 'view/pan-tool')
    select('view', 'view/panels/item:palette')
    bar.update(arranged(), commands, { selected: 3 }, LABELS)
    select('view', 'view/panels/command:undo')
    select('view', 'view/appearance/command:ruler')
    select('view', 'view/nothing')
    expect(ran).toEqual(['save', 'pan-tool', 'panels:palette', 'undo', 'ruler'])
  })

  it('数据没变时不重设 collection；文字、可用或排列变了才换', () => {
    const bar = mount({ selected: 0 })
    const host = bar.menubar as MenubarHost
    const first = host.collection
    bar.update(arranged(), commands, { selected: 0 }, LABELS)
    expect(host.collection).toBe(first)
    bar.update(arranged(), commands, { selected: 1 }, LABELS)
    expect(host.collection).not.toBe(first)
  })

  it('弹层命令不进菜单栏：开发期报一条告警，一条命令只报一次', () => {
    const seen: DiagnosticRecord[] = []
    resetDiagnostics()
    setDiagnosticsConsoleOutput(false)
    setDiagnosticsLevel('warn')
    setDiagnosticsDedupe(false)
    const off = onDiagnostic(record => void seen.push(record))
    try {
      const own = table(cmd('save'), cmd('color', { run: undefined, panel: () => ({ element: document.createElement('div') }) }))
      const bar = createCommandMenubar<Ctx>(document, { platform: 'other' })
      const menus = arrangeMenubar(MENUS, own, { file: [['save', 'color']] })
      bar.update(menus, own, { selected: 0 }, LABELS)
      bar.update(menus, own, { selected: 1 }, LABELS)
      expect((bar.menubar as MenubarHost).collection![0]!.items!.map(item => item.value)).toEqual(['file/save'])
      expect(seen.map(record => [record.code, record.scope, (record.detail as { id: string }).id])).toEqual([['core.warn', 'designer-commands', 'color']])
    }
    finally {
      off()
      resetDiagnostics()
    }
  })

  it('窄屏的「菜单」钮：文字取 labels.menu，点开一张 <xh-menu>，每张菜单是它的一个子菜单，子层的勾照命令的状态；从里面选中照样执行', () => {
    ran.length = 0
    const bar = mount({ selected: 2 })
    const trigger = bar.element.querySelector<HTMLButtonElement>('[data-scope="designer-menubar"][data-part="menu-trigger"]')!
    expect([trigger.textContent, trigger.getAttribute('aria-haspopup')]).toEqual(['Menu', 'menu'])
    trigger.click()
    const menu = bar.element.ownerDocument.querySelector<MenuHost>('xh-menu[data-scope="designer-menubar"]')!
    expect(menu.collection!.map(node => [node.value, node.label, node.children!.map(child => child.value)])).toEqual([
      ['menu:file', 'File', ['file/save', 'file/settings']],
      ['menu:edit', 'Edit', ['edit/undo']],
      ['menu:view', 'View', ['view/pan-tool', 'view/panels', 'view/appearance']],
    ])
    expect(menu.collection!.map(node => node.checkboxValue)).toEqual([[], [], ['view/pan-tool']])
    menu.dispatchEvent(new CustomEvent('item-select', { detail: { value: 'edit/undo' }, bubbles: true }))
    expect(ran).toEqual(['undo'])
  })
})
