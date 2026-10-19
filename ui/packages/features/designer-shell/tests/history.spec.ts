// @vitest-environment jsdom

import type { ApplyOperation, DesignerCommand, History } from '@xihan-ui/designer-kit'
import type { DesignerHistoryAdapter, DesignerHistoryConfirm, DesignerHistoryEventMap, XhDesignerHistoryElement } from '../src'
import { createHistory, snapshotHistory } from '@xihan-ui/designer-kit'
import { setXhConfig } from '@xihan-ui/web-components'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createHistoryPanel, defineDesignerShell, DESIGNER_COMMANDS_EN_US, DESIGNER_HISTORY_COMMANDS, DESIGNER_HISTORY_EN_US, designerHistoryCommands } from '../src'
import { designerShellZhCN } from '../src/locale'

defineDesignerShell()

afterEach(() => {
  document.body.innerHTML = ''
  setXhConfig({})
})

type Doc = readonly string[]
type Op = { readonly type: 'push', readonly value: string } | { readonly type: 'pop' }

const apply: ApplyOperation<Doc, Op> = (doc, op) => (op.type === 'push'
  ? { document: [...doc, op.value], inverse: [{ type: 'pop' }] }
  : { document: doc.slice(0, -1), inverse: [{ type: 'push', value: doc.at(-1)! }] })

/** 加了 a、b、c 三步，撤销了 c，在 a 之后存过盘。 */
function sample(): History<Doc, Op> {
  const history = createHistory<Doc, Op>({ document: [], apply })
  history.execute([{ type: 'push', value: 'a' }], { label: '加 a' })
  history.markSaved()
  history.execute([{ type: 'push', value: 'b' }], { label: '加 b' })
  history.execute([{ type: 'push', value: 'c' }])
  history.undo()
  return history
}

type Panel = XhDesignerHistoryElement

async function mount(history: History<Doc, Op>, setup: (panel: Panel) => void = () => {}): Promise<Panel> {
  const panel = document.createElement('xh-designer-history')
  panel.snapshot = snapshotHistory(history)
  setup(panel)
  document.body.append(panel)
  await panel.updateComplete
  return panel
}

function list(panel: Element): HTMLElement & { value?: string | string[] } {
  return panel.querySelector('xh-listbox')!
}

function rows(panel: Element): HTMLElement[] {
  return [...panel.querySelectorAll<HTMLElement>('[data-scope="listbox"][data-part="item"]')]
}

function texts(panel: Element): string[] {
  return rows(panel).map(row => [row.querySelector('[data-part="item-text"]')!.textContent, row.querySelector('[data-part="item-description"]')!.textContent].filter(Boolean).join(' | '))
}

function pick(panel: Element, position: number): void {
  list(panel).dispatchEvent(new CustomEvent('value-change', { detail: { value: [String(position)] }, bubbles: true }))
}

function record<K extends keyof DesignerHistoryEventMap>(panel: Element, type: K): DesignerHistoryEventMap[K]['detail'][] {
  const seen: DesignerHistoryEventMap[K]['detail'][] = []
  panel.addEventListener(type, event => seen.push((event as DesignerHistoryEventMap[K]).detail))
  return seen
}

describe('<xh-designer-history>', () => {
  it('列出起点与各步：没写说明的写「编辑」，已撤销与保存点带副文本，当前位置那一行选中；列表以标题命名', async () => {
    const history = sample()
    const panel = await mount(history)
    expect(texts(panel)).toEqual(['Opened', '加 a | Saved', '加 b', 'Edit | Undone'])
    expect(rows(panel).map(row => row.getAttribute('data-history'))).toEqual(['origin', 'done', 'done', 'undone'])
    expect(list(panel).value).toBe(String(history.position))
    const title = panel.querySelector('[data-part="title"]')!
    expect([title.textContent, list(panel).getAttribute('aria-label'), list(panel).hasAttribute('aria-labelledby')]).toEqual(['History', 'History', false])
    expect(list(panel).querySelector('[role="listbox"]')!.getAttribute('aria-label')).toBe('History')
  })

  it('选一行派发 history-go，列表仍选在当前位置等设计器交来新快照；选当前那一行或只读时不派发', async () => {
    const history = sample()
    const panel = await mount(history)
    const go = record(panel, 'history-go')
    pick(panel, history.origin)
    expect(go).toEqual([{ position: history.origin }])
    expect(list(panel).value).toBe(String(history.position))
    pick(panel, history.position)
    panel.readonly = true
    await panel.updateComplete
    pick(panel, history.entries[0]!.position)
    expect(go).toHaveLength(1)
    expect(list(panel).hasAttribute('read-only')).toBe(true)
  })

  it('从这里请求的跳转到了就经 announce 读一句：到达那一行的说明与走了几步；别处来的变化不播', async () => {
    const history = sample()
    const announce = vi.fn()
    const panel = await mount(history, (element) => {
      element.announce = announce
    })
    pick(panel, history.origin)
    history.goTo(history.origin)
    panel.snapshot = snapshotHistory(history)
    await panel.updateComplete
    expect(announce.mock.calls).toEqual([['Went to: Opened, 2 steps']])
    history.redo()
    panel.snapshot = snapshotHistory(history)
    await panel.updateComplete
    expect(announce).toHaveBeenCalledTimes(1)
  })

  it('换语言后文字跟着变；起点前丢过步时起点写「更早的步骤已丢弃」；没有步骤时显示空态', async () => {
    const limited = createHistory<Doc, Op>({ document: [], apply, limit: 1 })
    limited.execute([{ type: 'push', value: 'a' }], { label: () => '加 a' })
    limited.execute([{ type: 'push', value: 'b' }], { label: () => '加 b' })
    const panel = await mount(limited)
    setXhConfig(designerShellZhCN)
    panel.snapshot = snapshotHistory(limited)
    await panel.updateComplete
    expect(texts(panel)).toEqual(['更早的步骤已丢弃', '加 b'])
    expect(panel.querySelector('[data-part="title"]')!.textContent).toBe('历史记录')
    const empty = panel.querySelector<HTMLElement>('[data-part="empty"]')!
    expect(empty.hidden).toBe(true)
    limited.clear()
    panel.snapshot = snapshotHistory(limited)
    await panel.updateComplete
    expect([texts(panel), empty.hidden, empty.textContent]).toEqual([['打开时'], false, '还没有修改'])
  })

  it('头部的清空钮：有步骤且可编辑时派发 history-clear；没有步骤或只读时禁用；headless 时头部收起', async () => {
    const history = sample()
    const panel = await mount(history)
    const cleared = record(panel, 'history-clear')
    const clear = panel.querySelector<HTMLElement>('[data-part="clear-trigger"]')!
    clear.querySelector('button')!.click()
    expect([cleared.length, clear.hasAttribute('disabled'), clear.textContent]).toEqual([1, false, 'Clear history'])
    panel.readonly = true
    await panel.updateComplete
    expect(clear.hasAttribute('disabled')).toBe(true)
    panel.readonly = false
    history.clear()
    panel.snapshot = snapshotHistory(history)
    await panel.updateComplete
    expect(clear.hasAttribute('disabled')).toBe(true)
    panel.headless = true
    await panel.updateComplete
    expect(panel.querySelector<HTMLElement>('[data-part="header"]')!.hidden).toBe(true)
  })

  it('快照换了，同一位置号的行节点照旧复用，只改文字与状态', async () => {
    const history = sample()
    const panel = await mount(history)
    const [, a, b] = rows(panel)
    history.goTo(history.entries[0]!.position)
    panel.snapshot = snapshotHistory(history)
    await panel.updateComplete
    expect([rows(panel)[1], rows(panel)[2]]).toEqual([a, b])
    expect(b!.getAttribute('data-history')).toBe('undone')
  })
})

describe('designerHistoryCommands', () => {
  interface Ctx {
    readonly history: History<Doc, Op> | undefined
    readonly readonly?: boolean
  }

  function commands(confirm: (options: DesignerHistoryConfirm) => Promise<boolean> = async () => true, announce = vi.fn()): { table: Map<string, DesignerCommand<Ctx>>, announce: typeof announce } {
    const list = designerHistoryCommands<Ctx>({
      history: context => context.history,
      disabled: context => context.readonly === true,
      translations: () => DESIGNER_COMMANDS_EN_US,
      historyTranslations: () => DESIGNER_HISTORY_EN_US,
      confirm: (_context, options) => confirm(options),
      announce: (_context, message) => announce(message),
    })
    return { table: new Map(list.map(command => [command.id, command])), announce }
  }

  const text = (value: DesignerCommand<Ctx>['label'] | undefined, context: Ctx): string | undefined => (typeof value === 'function' ? value(context) : value)

  it('撤销、重做的全名带上下一步的说明，短文字不带；快捷键与第二快捷键；clear-history 不上工具栏', () => {
    const { table } = commands()
    const context: Ctx = { history: sample() }
    const undo = table.get(DESIGNER_HISTORY_COMMANDS.undo)!
    const redo = table.get(DESIGNER_HISTORY_COMMANDS.redo)!
    const clear = table.get('clear-history')!
    expect([text(undo.label, context), text(undo.shortLabel, context), text(redo.label, context), text(redo.shortLabel, context)]).toEqual(['Undo: 加 b', 'Undo', 'Redo', 'Redo'])
    expect([undo.shortcut, redo.shortcut, redo.alternateShortcuts]).toEqual([['Mod', 'Z'], ['Mod', 'Shift', 'Z'], [['Ctrl', 'Y']]])
    expect([undo.placement, redo.placement, clear.placement, clear.tone]).toEqual([['toolbar'], ['toolbar'], undefined, 'danger'])
  })

  it('执行后经 announce 读一句；只读、事务中、没有历史时三条都不可用', () => {
    const { table, announce } = commands()
    const history = sample()
    const context: Ctx = { history }
    const undo = table.get('undo')!
    const redo = table.get('redo')!
    undo.run!(context)
    redo.run!(context)
    expect(announce.mock.calls).toEqual([['Undid: 加 b'], ['Redid: 加 b']])
    expect([undo, redo, table.get('clear-history')!].map(command => command.enabled!({ history, readonly: true }))).toEqual([false, false, false])
    history.begin()
    expect([undo.enabled!(context), table.get('clear-history')!.enabled!(context)]).toEqual([false, false])
    history.rollback()
    expect([undo.enabled!({ history: undefined }), undo.enabled!(context)]).toEqual([false, true])
  })

  it('清空先弹确认框，确定后才清空并播报；取消不清；没有步骤时不可用', async () => {
    const asked: DesignerHistoryConfirm[] = []
    let answer = false
    const { table, announce } = commands(async (options) => {
      asked.push(options)
      return answer
    })
    const history = sample()
    const clear = table.get('clear-history')!
    clear.run!({ history })
    await Promise.resolve()
    await Promise.resolve()
    expect([asked, history.entries.length]).toEqual([[{ title: 'Clear history?', content: DESIGNER_HISTORY_EN_US.clearConfirmContent, okText: 'Clear', tone: 'danger' }], 3])
    answer = true
    clear.run!({ history })
    await Promise.resolve()
    await Promise.resolve()
    expect([history.entries.length, announce.mock.calls]).toEqual([0, [['History cleared']]])
    expect(clear.enabled!({ history })).toBe(false)
  })
})

describe('createHistoryPanel', () => {
  interface Host {
    readonly history: History<Doc, Op>
    readonly readonly: boolean
    readonly log: string[]
  }

  const icon = { name: 'history', viewBox: '0 0 24 24', nodes: [{ tag: 'path', attrs: { d: 'M3 12a9 9 0 1 0 3-6.7L3 8' } }] } as const

  function adapter(): DesignerHistoryAdapter<Host> {
    return {
      snapshot: host => snapshotHistory(host.history),
      goTo: (host, position) => {
        host.log.push(`go:${position}`)
        host.history.goTo(position)
      },
      announce: (host, message) => void host.log.push(`announce:${message}`),
    }
  }

  it('登记缺省是右栏、缺省隐藏的 history，面板头是 clear-history；区的其余项可换；标题与帮助是零件文案，读的时候按全局配置现取', () => {
    const panel = createHistoryPanel(adapter(), { region: { icon } })
    expect([panel.region.name, panel.region.position, panel.region.defaultHidden, panel.region.icon, panel.headerCommands]).toEqual(['history', 'end', true, icon, [DESIGNER_HISTORY_COMMANDS.clearHistory]])
    expect([panel.region.title, panel.region.help]).toEqual([DESIGNER_HISTORY_EN_US.title, DESIGNER_HISTORY_EN_US.help])
    expect(createHistoryPanel(adapter(), { region: { position: 'start', defaultHidden: false } }).region).toMatchObject({ name: 'history', position: 'start', defaultHidden: false })
    setXhConfig(designerShellZhCN)
    expect([panel.region.title, JSON.parse(JSON.stringify(panel.region)).title]).toEqual(['历史记录', '历史记录'])
    expect(panel.region.help).toContain('点一步回到那里')
  })

  it('建出无头的零件，交上快照；内容没变时不重设，只读时只能看', async () => {
    const history = sample()
    const host: Host = { history, readonly: false, log: [] }
    const instance = createHistoryPanel(adapter(), { readonly: context => context.readonly }).create(host)
    const element = instance.element as Panel
    document.body.append(element)
    await element.updateComplete
    expect([element.localName, element.headless, element.snapshot, element.readonly]).toEqual(['xh-designer-history', true, snapshotHistory(history), false])
    const before = element.snapshot
    instance.update!({ ...host })
    expect(element.snapshot).toBe(before)
    history.redo()
    instance.update!({ ...host, readonly: true })
    expect([element.snapshot!.position, element.readonly]).toEqual([history.position, true])
    expect(createHistoryPanel(adapter()).create(host).element).toHaveProperty('readonly', false)
  })

  it('选一行转给适配器的 goTo，到了以后经适配器的 announce 播报；用的是最近一次刷新的上下文', async () => {
    const history = sample()
    const first: Host = { history, readonly: false, log: [] }
    const panel = createHistoryPanel(adapter())
    const instance = panel.create(first)
    const element = instance.element as Panel
    document.body.append(element)
    await element.updateComplete
    const later: Host = { history, readonly: false, log: [] }
    instance.update!(later)
    pick(element, history.origin)
    instance.update!(later)
    await element.updateComplete
    expect(later.log).toEqual([`go:${history.origin}`, 'announce:Went to: Opened, 2 steps'])
    expect(first.log).toEqual([])
  })
})
