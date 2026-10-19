// 声明树形 tree：四行平铺、一行 parentId 都没有。根节点报 treegrid，行写 aria-level；
// 真实键盘 Alt + 右键把 b 缩进到 a 下面，宿主写回后 b 报第 2 层；真实鼠标把 d 拖到叶子行 c 的中段，是「放进去」。
import type { TableRowDef, TableRowMoveDetails } from '@xihan-ui/headless'
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { cdp, userEvent } from 'vitest/browser'
import { createApp, h, ref } from 'vue'
import { XhTableBody, XhTableCell, XhTableRoot, XhTableRow } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

afterEach(() => {
  app?.unmount()
  host?.remove()
  app = null
  host = null
})

const FLAT: TableRowDef[] = [{ id: 'a' }, { id: 'b' }, { id: 'c' }, { id: 'd' }]

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
  const start = { x: box.left + 40, y: box.top + box.height / 2 }
  await cdp().send('Input.dispatchMouseEvent', { type: 'mouseMoved', ...at(start.x, start.y) })
  await cdp().send('Input.dispatchMouseEvent', { type: 'mousePressed', button: 'left', clickCount: 1, ...at(start.x, start.y) })
  for (let i = 1; i <= 10; i++) {
    await frames(1)
    await cdp().send('Input.dispatchMouseEvent', { type: 'mouseMoved', button: 'left', ...at(start.x + ((to.x - start.x) * i) / 10, start.y + ((to.y - start.y) * i) / 10) })
  }
  await frames(1)
  await cdp().send('Input.dispatchMouseEvent', { type: 'mouseReleased', button: 'left', clickCount: 1, ...at(to.x, to.y) })
  await frames(3)
}

async function mount(): Promise<TableRowMoveDetails[]> {
  const moves: TableRowMoveDetails[] = []
  host = document.createElement('div')
  host.style.inlineSize = '360px'
  document.body.append(host)
  const rows = ref<TableRowDef[]>(FLAT)
  app = createApp({
    render: () => h('div', [
      h('button', { 'type': 'button', 'data-test-start': '' }, '起点'),
      h(XhTableRoot, {
        'columns': [{ id: 'name', label: '名称' }],
        'rows': rows.value,
        'tree': true,
        'rowReorderable': true,
        'defaultExpandedValue': ['a', 'b', 'c', 'd'],
        'aria-label': '选项',
        'onRowMove': (details: TableRowMoveDetails) => {
          moves.push(details)
          const byId = new Map(rows.value.map(row => [row.id, row]))
          rows.value = details.ids.map(id => (id === details.id ? { ...byId.get(id)!, parentId: details.parent ?? undefined } : byId.get(id)!))
        },
      }, () => h(XhTableBody, null, () => rows.value.map(row => h(XhTableRow, { key: row.id, value: row.id }, () => h(XhTableCell, { value: 'name' }, () => `${row.id} 名称`))))),
    ]),
  })
  app.mount(host)
  await frames()
  return moves
}

function row(id: string): HTMLElement {
  return host!.querySelector<HTMLElement>(`[data-scope="table"][data-part="row"][data-value="${id}"]`)!
}

describe('表格声明树形（Vue）', () => {
  it('平铺的行报 treegrid 与 aria-level；真实键盘 Alt + 右键把 b 缩进到 a 下面，写回后 b 是第 2 层', async () => {
    const moves = await mount()
    const grid = host!.querySelector('[data-scope="table"][data-part="root"]')!
    expect(grid.getAttribute('role')).toBe('treegrid')
    expect(row('b').getAttribute('aria-level')).toBe('1')
    expect(row('b').hasAttribute('aria-expanded')).toBe(false)
    host!.querySelector<HTMLElement>('[data-test-start]')!.focus()
    await userEvent.tab()
    await userEvent.keyboard('{ArrowDown}')
    await frames()
    expect(document.activeElement).toBe(row('b'))
    await userEvent.keyboard('{Alt>}{ArrowRight}{/Alt}')
    await frames(3)
    expect(moves).toEqual([{ id: 'b', parent: 'a', index: 0, ids: ['a', 'b', 'c', 'd'] }])
    expect(row('b').getAttribute('aria-level')).toBe('2')
    expect(row('a').getAttribute('aria-expanded')).toBe('true')
  })

  it('真实鼠标把 d 拖到叶子行 c 的中段：落点是「放进去」，宿主收到 parent 为 c', async () => {
    const moves = await mount()
    const target = row('c').getBoundingClientRect()
    await drag(row('d'), { x: target.left + 40, y: target.top + target.height / 2 })
    expect(moves).toEqual([{ id: 'd', parent: 'c', index: 0, ids: ['a', 'b', 'c', 'd'] }])
  })
})
