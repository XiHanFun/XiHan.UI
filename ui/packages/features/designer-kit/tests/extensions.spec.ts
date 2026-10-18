import type { JsonObject } from '@xihan-ui/core/json'
import type { DesignerCommand, DesignerExtensionBase } from '../src'
import { describe, expect, it, vi } from 'vitest'
import {
  applyPathOperation,
  checkExtensionData,
  commandForShortcut,
  createExtensionHost,
  DesignerExtensionError,
  extensionCommands,
  extensionControls,
  extensionEditors,
  extensionIssuePrefix,
  findImporter,
  formatShortcut,
  getExtensionData,
  mergeExtensions,
  runExtensionRules,
  setExtensionData,
  shortcutKey,
} from '../src'

type Ext = DesignerExtensionBase<{ readonly n: number }, string> & { readonly nodeTypes?: readonly string[] }

function command(id: string, shortcut?: readonly string[]): DesignerCommand<{ readonly n: number }> {
  return { id, label: id, run: () => {}, ...(shortcut ? { shortcut } : {}) }
}

/** 按键事件里匹配要读的字段。 */
function key(init: { key: string, code?: string, ctrlKey?: boolean, metaKey?: boolean, altKey?: boolean, shiftKey?: boolean }): KeyboardEvent {
  return { code: '', ctrlKey: false, metaKey: false, altKey: false, shiftKey: false, ...init } as KeyboardEvent
}

function conflictOf(run: () => unknown): DesignerExtensionError {
  try {
    run()
  }
  catch (error) {
    if (error instanceof DesignerExtensionError)
      return error
    throw error
  }
  throw new Error('没有抛冲突')
}

describe('mergeExtensions', () => {
  it('内置在前、传入的按顺序在后', () => {
    const builtin: Ext = { id: 'builtin' }
    const a: Ext = { id: 'a' }
    const b: Ext = { id: 'b' }
    expect(mergeExtensions([builtin], [a, b])).toEqual([builtin, a, b])
  })

  it('扩展 id、命令 id、快捷键、编辑方式与各款的名字重名都抛错，报出名字与两个扩展', () => {
    const extension = conflictOf(() => mergeExtensions<Ext>([{ id: 'x' }], [{ id: 'x' }]))
    expect([extension.code, extension.space, extension.key, extension.extensions]).toEqual(['designer.extension-conflict', 'extension', 'x', ['x', 'x']])

    const cmd = conflictOf(() => mergeExtensions<Ext>([{ id: 'a', commands: [command('run')] }], [{ id: 'b', commands: [command('run')] }]))
    expect([cmd.space, cmd.key, cmd.extensions]).toEqual(['command', 'run', ['a', 'b']])

    // Mod 在 Windows 与 Linux 上就是 Ctrl：两种写法算同一个快捷键
    const shortcut = conflictOf(() => mergeExtensions<Ext>([{ id: 'a', commands: [command('one', ['Mod', 'S'])] }], [{ id: 'b', commands: [command('two', ['ctrl', 's'])] }]))
    expect([shortcut.space, shortcut.key]).toEqual(['shortcut', 'Control+s'])

    const control = conflictOf(() => mergeExtensions<Ext>([], [{ id: 'a', controls: { text: {} } }]))
    expect([control.space, control.key, control.extensions]).toEqual(['control', 'text', ['builtin', 'a']])

    const kind = conflictOf(() => mergeExtensions<Ext>([{ id: 'builtin', nodeTypes: ['task'] }], [{ id: 'a', nodeTypes: ['task'] }], {
      'node-type': extension => extension.nodeTypes ?? [],
    }))
    expect([kind.space, kind.key, kind.extensions]).toEqual(['node-type', 'task', ['builtin', 'a']])
  })

  it('命令的形状在登记时查：panel 与 menu 同时给、普通命令没有 run 都抛 TypeError', () => {
    const element = {} as HTMLElement
    const both: DesignerCommand<{ readonly n: number }> = { id: 'page', label: 'page', panel: () => ({ element }), menu: () => [] }
    expect(() => mergeExtensions<Ext>([], [{ id: 'a', commands: [both] }])).toThrow(/page 同时给了 panel 与 menu/)
    const bare: DesignerCommand<{ readonly n: number }> = { id: 'noop', label: 'noop' }
    expect(() => mergeExtensions<Ext>([{ id: 'a', commands: [bare] }], [])).toThrow(/noop 没有 run/)
    // 弹层命令与菜单命令可以不给 run
    const panel: DesignerCommand<{ readonly n: number }> = { id: 'setup', label: 'setup', panel: () => ({ element }) }
    const menu: DesignerCommand<{ readonly n: number }> = { id: 'pages', label: 'pages', menu: () => ['separator'], select: () => {} }
    expect(mergeExtensions<Ext>([], [{ id: 'a', commands: [panel, menu] }])).toHaveLength(1)
  })
})

describe('合并后的登记表', () => {
  it('编辑器表按顺序逐键合并，后面的压前面的', () => {
    const table = extensionEditors({ byControl: { text: 'base-text', number: 'base-number' } }, [
      { editors: { byControl: { text: 'a-text' }, byTarget: { node: { label: 'a-label' } } } },
      { editors: { byPath: { 'data.rules': 'b-rules' }, byTarget: { node: { owner: 'b-owner' } } } },
    ])
    expect(table).toEqual({
      byControl: { text: 'a-text', number: 'base-number' },
      byPath: { 'data.rules': 'b-rules' },
      byTarget: { node: { label: 'a-label', owner: 'b-owner' } },
    })
  })

  it('编辑方式合成一张表，命令按登记顺序排成一张表', () => {
    const check = (): undefined => undefined
    expect(extensionControls([{ controls: { assignees: { check } } }, {}, { controls: { cron: {} } }])).toEqual({ assignees: { check }, cron: {} })
    const commands = extensionCommands<{ readonly n: number }>([{ commands: [command('undo'), command('redo')] }, { commands: [command('a.run')] }])
    expect([...commands.keys()]).toEqual(['undo', 'redo', 'a.run'])
  })

  it('findImporter：来源按先后、导入器按先后问，第一个接下的连同来源返回；都不接时为 undefined', () => {
    const asked: string[] = []
    const importer = (id: string, mime: string) => ({
      id,
      accepts: (source: { readonly mime?: string }): boolean => {
        asked.push(`${id}:${source.mime}`)
        return source.mime === mime
      },
    })
    const image = importer('image', 'image/png')
    const html = importer('html', 'text/html')
    const sources = [{ kind: 'drop', mime: 'text/plain', text: 'a' }, { kind: 'drop', mime: 'text/html', text: '<b>a</b>' }] as const
    expect(findImporter([image, html], sources)).toEqual({ importer: html, source: sources[1] })
    expect(asked).toEqual(['image:text/plain', 'html:text/plain', 'image:text/html', 'html:text/html'])
    expect(findImporter([image], sources)).toBeUndefined()
    expect(findImporter([], sources)).toBeUndefined()
  })
})

describe('runExtensionRules', () => {
  it('按扩展顺序逐条跑，问题码要以扩展 id 的末段加点开头', () => {
    const doc = { nodes: 2 }
    const rules = vi.fn((d: typeof doc, ctx: string) => [{ code: 'simulation.too-many', path: ['nodes'], params: { count: d.nodes, ctx } }])
    expect(extensionIssuePrefix('@xihan-flow-pro/simulation')).toBe('simulation')
    expect(runExtensionRules([{ id: 'builtin' }, { id: '@xihan-flow-pro/simulation', rules: [rules] }], doc, 'c')).toEqual([
      { code: 'simulation.too-many', path: ['nodes'], params: { count: 2, ctx: 'c' } },
    ])
    expect(() => runExtensionRules([{ id: 'xihan-workflow', rules: [() => [{ code: 'decision-no-default', path: [] }]] }], doc, 'c'))
      .toThrow('要以 xihan-workflow. 开头')
  })
})

describe('createExtensionHost', () => {
  it('按 id 比对装上与卸下：去掉的清理、新加的 setup、换了引用的卸下再装上', () => {
    const log: string[] = []
    const make = (id: string): Ext => ({
      id,
      setup: (ctx) => {
        log.push(`setup ${id} ${ctx.n}`)
        return () => log.push(`cleanup ${id}`)
      },
    })
    let n = 0
    const builtin = make('builtin')
    const host = createExtensionHost<Ext, { readonly n: number }>({ builtins: [builtin], context: () => ({ n: ++n }) })
    const a = make('a')
    const b = make('b')
    host.assign([a, b])
    expect(log.splice(0)).toEqual(['setup builtin 1', 'setup a 2', 'setup b 3'])

    const a2 = make('a')
    host.assign([a2])
    expect(log.splice(0)).toEqual(['cleanup a', 'cleanup b', 'setup a 4'])
    expect(host.list).toEqual([builtin, a2])

    host.dispose()
    expect(log.splice(0)).toEqual(['cleanup a', 'cleanup builtin'])
    expect(host.list).toEqual([])
  })

  it('冲突时抛错，什么都不变', () => {
    const setup = vi.fn()
    const host = createExtensionHost<Ext, { readonly n: number }>({ context: { n: 0 } })
    const a: Ext = { id: 'a', setup }
    host.assign([a])
    expect(() => host.assign([{ id: 'b', setup }, { id: 'b' }])).toThrow(DesignerExtensionError)
    expect(host.list).toEqual([a])
    expect(setup).toHaveBeenCalledTimes(1)
  })
})

describe('快捷键', () => {
  it('比较用写法、显示文字与按键命中', () => {
    expect(shortcutKey(['Mod', 'Shift', 'p'])).toBe('Control+Shift+p')
    expect(formatShortcut(['Mod', 'Shift', 'P'], 'mac')).toBe('⌘⇧P')
    expect(formatShortcut(['Mod', 'Shift', 'P'], 'other')).toBe('Ctrl+Shift+P')

    const save = command('save', ['Mod', 'S'])
    const locked = { ...command('lock', ['Mod', 'L']), enabled: () => false }
    expect(commandForShortcut([save, locked], key({ key: 's', metaKey: true }), { n: 0 }, 'mac')).toBe(save)
    expect(commandForShortcut([save, locked], key({ key: 's', ctrlKey: true }), { n: 0 }, 'mac')).toBeUndefined()
    expect(commandForShortcut([save, locked], key({ key: 'l', ctrlKey: true }), { n: 0 }, 'other')).toBeUndefined()
    // 没有 run 的弹层命令不由快捷键触发
    const setup: DesignerCommand<{ readonly n: number }> = { id: 'setup', label: 'setup', shortcut: ['Mod', 'P'], panel: () => ({ element: {} as HTMLElement }) }
    expect(commandForShortcut([setup], key({ key: 'p', ctrlKey: true }), { n: 0 }, 'other')).toBeUndefined()
    const opener = { ...setup, run: () => {} }
    expect(commandForShortcut([opener], key({ key: 'p', ctrlKey: true }), { n: 0 }, 'other')).toBe(opener)
  })
})

describe('模板里的扩展数据', () => {
  it('读、写、去掉与检查都只碰自己 id 下的那一块', () => {
    const node: JsonObject = { id: 'n1', extensions: { 'other': { keep: true }, '@x/sim': { speed: 2 } } }
    expect(getExtensionData(node, '@x/sim')).toEqual({ speed: 2 })
    expect(getExtensionData({ id: 'n2' }, '@x/sim')).toBeUndefined()

    const set = applyPathOperation({ nodes: [{ id: 'n2' }] }, setExtensionData('@x/sim', { speed: 3 }, ['nodes', 0]))
    expect(set.document).toEqual({ nodes: [{ id: 'n2', extensions: { '@x/sim': { speed: 3 } } }] })
    const removed = applyPathOperation({ nodes: [node] }, setExtensionData('@x/sim', undefined, ['nodes', 0]))
    expect(removed.document).toEqual({ nodes: [{ id: 'n1', extensions: { other: { keep: true } } }] })

    expect(checkExtensionData(node, ['nodes', 0])).toEqual([])
    expect(checkExtensionData({ extensions: [] }, ['doc'])).toEqual([{ code: 'invalid-type', path: ['doc', 'extensions'] }])
    expect(checkExtensionData({ extensions: { a: 1, b: {} } })).toEqual([{ code: 'invalid-type', path: ['extensions', 'a'] }])
  })
})
