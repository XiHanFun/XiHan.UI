// Web Components 下两层嵌套的排序：外层排组，每组里一层命令列表，两个命令列表同在一个 group 里、命令可以跨组挪。
// 钉住：内层的拿起、挪动、放下只归内层，外层不跟着拿起、不发事件；外层排组时内层列表不动、不发事件；
// 键盘与真实指针两条路径都一样。
import type { SortableDragStartDetails, SortableSortDetails, SortableTransferDetails } from '@xihan-ui/headless'
import { setDiagnosticsLevel } from '@xihan-ui/core'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { cdp, userEvent } from 'vitest/browser'
import { defineXhElements } from '../../src/define'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

interface SortableElement extends HTMLElement {
  ids?: string[]
  updateComplete: Promise<unknown>
}

defineXhElements()

beforeEach(() => setDiagnosticsLevel('silent'))
afterEach(() => {
  document.body.innerHTML = ''
  setDiagnosticsLevel('warn')
})

function frames(count = 2): Promise<void> {
  return new Promise<void>((resolve) => {
    const step = (left: number): void => {
      if (left === 0)
        resolve()
      else requestAnimationFrame(() => step(left - 1))
    }
    step(count)
  })
}

const GROUPS: Record<string, string[]> = { g1: ['c1', 'c2'], g2: ['c3', 'c4'] }

function commands(groupId: string, ids: string[]): string {
  const items = ids.map(id => `<div data-xh-part="item" item-id="${id}" style="block-size: 36px; box-sizing: border-box; display: flex; gap: 8px; align-items: center"><button data-xh-part="item-drag-trigger" item-id="${id}" aria-label="挪动 ${id}"></button>${id}</div>`).join('')
  return `<xh-sortable ids="${ids.join(',')}" group="commands" list-id="${groupId}" activation-distance="0" style="display: contents">
    <div data-xh-part="root" aria-label="${groupId} 的命令" style="inline-size: 200px; min-block-size: 36px">${items}<div data-xh-part="drop-indicator"></div><div data-xh-part="live-region"></div></div>
  </xh-sortable>`
}

function group(groupId: string): string {
  return `<div data-xh-part="item" item-id="${groupId}" style="box-sizing: border-box; padding: 8px; border: 1px solid #ccc">
    <div style="display: flex; gap: 8px; align-items: center"><button data-xh-part="item-drag-trigger" item-id="${groupId}" aria-label="挪动 ${groupId}"></button><strong>${groupId}</strong></div>
    ${commands(groupId, GROUPS[groupId]!)}
  </div>`
}

interface Log {
  outer: { starts: SortableDragStartDetails[], sorts: SortableSortDetails[] }
  inner: { starts: SortableDragStartDetails[], sorts: SortableSortDetails[], transfers: SortableTransferDetails[] }
}

async function mount(): Promise<Log> {
  const stage = document.createElement('div')
  stage.style.cssText = 'padding: 16px'
  stage.innerHTML = `<xh-sortable ids="g1,g2" list-id="groups" activation-distance="0" style="display: contents">
    <div data-xh-part="root" aria-label="分组" style="inline-size: 260px; display: grid; gap: 12px">${group('g1')}${group('g2')}<div data-xh-part="drop-indicator"></div><div data-xh-part="live-region"></div></div>
  </xh-sortable>`
  document.body.append(stage)
  const log: Log = { outer: { starts: [], sorts: [] }, inner: { starts: [], sorts: [], transfers: [] } }
  const outer = outerHost()
  // 事件冒泡：内层的事件也会经过外层宿主，按 target 分开记
  stage.addEventListener('drag-start', (event) => {
    const detail = (event as CustomEvent<SortableDragStartDetails>).detail
    ;(event.target === outer ? log.outer : log.inner).starts.push(detail)
  })
  stage.addEventListener('sort', (event) => {
    const detail = (event as CustomEvent<SortableSortDetails>).detail
    if (event.target === outer) {
      log.outer.sorts.push(detail)
      placeGroups(detail.ids)
    }
    else {
      log.inner.sorts.push(detail)
      placeCommands(event.target as SortableElement, detail.ids)
    }
  })
  stage.addEventListener('transfer', (event) => {
    const detail = (event as CustomEvent<SortableTransferDetails>).detail
    log.inner.transfers.push(detail)
    placeCommands(innerHost(detail.toList!), detail.toIds)
    placeCommands(innerHost(detail.fromList!), detail.fromIds)
  })
  for (const el of stage.querySelectorAll<SortableElement>('xh-sortable'))
    await el.updateComplete
  await frames()
  return log
}

function outerHost(): SortableElement {
  return document.querySelector<SortableElement>('xh-sortable[list-id="groups"]')!
}

function innerHost(groupId: string): SortableElement {
  return document.querySelector<SortableElement>(`xh-sortable[list-id="${groupId}"]`)!
}

/** 与文档示例同一种写法：按新顺序把项节点排进 root，写回 ids。 */
function placeGroups(ids: string[]): void {
  const host = outerHost()
  const root = host.querySelector(':scope > [data-xh-part="root"], :scope > [data-part="root"]')!
  for (const id of ids)
    root.insertBefore(root.querySelector(`:scope > [item-id="${id}"]`)!, root.querySelector(':scope > [data-part="drop-indicator"]'))
  host.ids = ids
}

function placeCommands(host: SortableElement, ids: string[]): void {
  const root = host.querySelector(':scope > [data-part="root"]')!
  for (const id of ids)
    root.insertBefore(document.querySelector(`[data-part="item"][item-id="${id}"]`)!, root.querySelector(':scope > [data-part="drop-indicator"]'))
  host.ids = ids
}

function handle(id: string): HTMLElement {
  return document.querySelector<HTMLElement>(`[data-part="item-drag-trigger"][item-id="${id}"]`)!
}

function commandsOf(groupId: string): string[] {
  return [...innerHost(groupId).querySelectorAll<HTMLElement>(':scope > [data-part="root"] > [data-part="item"]')].map(el => el.getAttribute('item-id') ?? '')
}

function groupsOrder(): string[] {
  return [...outerHost().querySelectorAll<HTMLElement>(':scope > [data-part="root"] > [data-part="item"]')].map(el => el.getAttribute('item-id') ?? '')
}

async function mouseScale(): Promise<number> {
  const seen = new Promise<number>(resolve => document.addEventListener('pointermove', event => resolve(event.clientX / 20), { once: true }))
  await cdp().send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 20, y: 20 })
  return seen
}

/** 按住 from 的中心，分十步拖到 to，松开。 */
async function drag(from: HTMLElement, to: { x: number, y: number }): Promise<void> {
  const scale = await mouseScale()
  const at = (x: number, y: number) => ({ x: x / scale, y: y / scale })
  const box = from.getBoundingClientRect()
  const start = { x: box.left + box.width / 2, y: box.top + box.height / 2 }
  await cdp().send('Input.dispatchMouseEvent', { type: 'mouseMoved', ...at(start.x, start.y) })
  await cdp().send('Input.dispatchMouseEvent', { type: 'mousePressed', button: 'left', clickCount: 1, ...at(start.x, start.y) })
  for (let i = 1; i <= 10; i++) {
    await frames(1)
    await cdp().send('Input.dispatchMouseEvent', { type: 'mouseMoved', button: 'left', ...at(start.x + ((to.x - start.x) * i) / 10, start.y + ((to.y - start.y) * i) / 10) })
  }
  await frames(1)
  await cdp().send('Input.dispatchMouseEvent', { type: 'mouseReleased', button: 'left', clickCount: 1, ...at(to.x, to.y) })
  await frames(4)
}

describe('web components 两层嵌套的排序', () => {
  it('键盘：内层拿起、组内挪、跨组挪都只归内层，外层不拿起、不发事件', async () => {
    const log = await mount()
    handle('c1').focus()
    await userEvent.keyboard(' ')
    await frames()
    expect(log.inner.starts).toHaveLength(1)
    expect(log.outer.starts).toHaveLength(0)
    expect(outerHost().querySelector('[data-part="item"][item-id="g1"]')!.hasAttribute('data-dragging')).toBe(false)
    await userEvent.keyboard('{ArrowDown} ')
    await frames()
    expect(commandsOf('g1')).toEqual(['c2', 'c1'])
    // 竖排列表的另一条轴（左右键）在组里相邻的列表间挪
    handle('c1').focus()
    await userEvent.keyboard(' {ArrowRight} ')
    await frames(4)
    expect(log.inner.transfers).toHaveLength(1)
    expect(log.inner.transfers[0]).toMatchObject({ id: 'c1', fromList: 'g1', toList: 'g2' })
    expect(commandsOf('g2')).toContain('c1')
    expect(log.outer.starts).toHaveLength(0)
    expect(log.outer.sorts).toHaveLength(0)
    expect(groupsOrder()).toEqual(['g1', 'g2'])
  })

  it('键盘：外层拿起组、往下挪一格放下，组换了位置；内层列表不动、不发事件', async () => {
    const log = await mount()
    handle('g1').focus()
    await userEvent.keyboard(' {ArrowDown} ')
    await frames(4)
    expect(log.outer.sorts).toHaveLength(1)
    expect(log.outer.sorts[0]!.ids).toEqual(['g2', 'g1'])
    expect(groupsOrder()).toEqual(['g2', 'g1'])
    expect([log.inner.starts, log.inner.sorts, log.inner.transfers]).toEqual([[], [], []])
    expect([commandsOf('g1'), commandsOf('g2')]).toEqual([['c1', 'c2'], ['c3', 'c4']])
  })

  it('真实指针：把 g1 的 c1 拖到 g2 的 c3 下面，只有内层发 transfer；外层不拿起', async () => {
    const log = await mount()
    const target = document.querySelector<HTMLElement>('[data-part="item"][item-id="c3"]')!.getBoundingClientRect()
    await drag(handle('c1'), { x: target.left + target.width / 2, y: target.bottom - 4 })
    expect(log.outer.starts).toHaveLength(0)
    expect(log.outer.sorts).toHaveLength(0)
    expect(log.inner.transfers).toHaveLength(1)
    expect(log.inner.transfers[0]).toMatchObject({ id: 'c1', fromList: 'g1', toList: 'g2' })
    expect(commandsOf('g2')).toEqual(['c3', 'c1', 'c4'])
    expect(groupsOrder()).toEqual(['g1', 'g2'])
  })

  it('真实指针：按住 g2 的组把手拖到 g1 上面，只有外层发 sort；内层不拿起', async () => {
    const log = await mount()
    const first = document.querySelector<HTMLElement>('[data-part="item"][item-id="g1"]')!.getBoundingClientRect()
    await drag(handle('g2'), { x: first.left + first.width / 2, y: first.top + 4 })
    expect(log.inner.starts).toHaveLength(0)
    expect(log.outer.sorts).toHaveLength(1)
    expect(log.outer.sorts[0]!.ids).toEqual(['g2', 'g1'])
    expect(groupsOrder()).toEqual(['g2', 'g1'])
    expect([commandsOf('g1'), commandsOf('g2')]).toEqual([['c1', 'c2'], ['c3', 'c4']])
  })
})
