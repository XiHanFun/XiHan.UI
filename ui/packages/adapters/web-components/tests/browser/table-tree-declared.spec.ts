// 声明树形 tree：四行平铺、一行 parentId 都没有。根节点报 treegrid，行写 aria-level；
// 真实键盘 Alt + 右键把 b 缩进到 a 下面，宿主写回后 b 报第 2 层；真实鼠标把 d 拖到叶子行 c 的中段，是「放进去」。
import type { TableRowDef, TableRowMoveDetails } from '@xihan-ui/headless'
import type { XhTableElement } from '../../src/elements/table'
import { afterEach, describe, expect, it } from 'vitest'
import { cdp, userEvent } from 'vitest/browser'
import { defineXhElements } from '../../src/define'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

defineXhElements()

afterEach(() => {
  document.body.replaceChildren()
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
  document.body.innerHTML = `
    <div style="inline-size: 360px">
      <button type="button" data-test-start>起点</button>
      <xh-table tree row-reorderable aria-label="选项">
        <div data-xh-part="root">
          <div data-xh-part="body">
            ${FLAT.map(row => `<div data-xh-part="row" value="${row.id}"><div data-xh-part="cell" value="name">${row.id} 名称</div></div>`).join('')}
          </div>
        </div>
      </xh-table>
    </div>
  `
  const table = document.querySelector<XhTableElement>('xh-table')!
  table.columns = [{ id: 'name', label: '名称' }]
  table.rows = FLAT
  table.defaultExpandedValue = ['a', 'b', 'c', 'd']
  // 宿主按 ids 重排、把这一行的 parentId 设成 parent；行序不变，节点不用挪
  table.addEventListener('row-move', (event) => {
    const details = (event as CustomEvent<TableRowMoveDetails>).detail
    moves.push(details)
    const byId = new Map((table.rows ?? []).map(row => [row.id, row]))
    table.rows = details.ids.map(id => (id === details.id ? { ...byId.get(id)!, parentId: details.parent ?? undefined } : byId.get(id)!))
  })
  await table.updateComplete
  await frames()
  return moves
}

function row(id: string): HTMLElement {
  return document.querySelector<HTMLElement>(`[data-scope="table"][data-part="row"][data-value="${id}"]`)!
}

describe('表格声明树形（Web Components）', () => {
  it('平铺的行报 treegrid 与 aria-level；真实键盘 Alt + 右键把 b 缩进到 a 下面，写回后 b 是第 2 层', async () => {
    const moves = await mount()
    const grid = document.querySelector('[data-scope="table"][data-part="root"]')!
    expect(grid.getAttribute('role')).toBe('treegrid')
    expect(row('b').getAttribute('aria-level')).toBe('1')
    expect(row('b').hasAttribute('aria-expanded')).toBe(false)
    document.querySelector<HTMLElement>('[data-test-start]')!.focus()
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
