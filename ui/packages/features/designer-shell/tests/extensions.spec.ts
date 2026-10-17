// @vitest-environment jsdom

// 扩展的面板与命令：面板登记到外框的区、按引用比对创建与撤掉、区名冲突抛错；命令按排列分组，
// 铺成工具栏按钮与菜单条目，点击与选中执行命令。
import type { DesignerCommand } from '@xihan-ui/designer-kit'
import type { DesignerPanel, DesignerShellExtension, XhDesignerFrameElement } from '../src'
import { DesignerExtensionError } from '@xihan-ui/designer-kit'
import { afterEach, describe, expect, it } from 'vitest'
import { arrangeCommands, createCommandToolbar, createPanelHost, defineDesignerShell, renderCommandMenu, runCommand } from '../src'

defineDesignerShell()

interface Ctx { readonly selected: number }

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

    expect(frame.regions!.map(region => region.name)).toEqual(['toolbar', 'palette', 'canvas', 'properties', 'issues', 'layers', 'simulation'])
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
    expect(frame.regions!.map(region => region.name)).toEqual(['toolbar', 'palette', 'canvas', 'properties', 'issues'])
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
    const toolbar = createCommandToolbar<Ctx>(document)
    document.body.append(toolbar.element)
    toolbar.update([['undo', 'delete'], ['sim.run']], commands, { selected: 0 }, '工具')
    const buttons = () => [...toolbar.element.querySelectorAll<HTMLButtonElement>('[data-xh-part="item"]')]
    expect(buttons().map(button => [button.value, button.textContent, button.disabled, button.getAttribute('aria-pressed')])).toEqual([
      ['undo', 'UNDO', false, null],
      ['delete', 'DELETE', true, null],
      ['sim.run', '运行 0', false, 'true'],
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
    expect(runCommand(commands, 'delete', { selected: 0 })).toBe(false)
    expect(runCommand(commands, 'delete', { selected: 1 })).toBe(true)
    expect(runCommand(commands, 'missing', { selected: 1 })).toBe(false)
    expect(ran).toEqual(['delete'])
  })
})
