// 虚拟滚动表格让根节点自己滚：Virtualizer 写 scrollContainer="ancestor"，表头、冻结列与行在同一个滚动面里。
// 列宽之和超过容器时表头与行同列对齐、冻结列两处都留在行首、表头吸顶；视口不滚动、不占 Tab 位，axe 不报结构问题（Web Components）。
import type { XhTableElement } from '../../src/elements/table'
import type { XhVirtualizerElement } from '../../src/elements/virtualizer'
import { runAxe } from '@xihan-ui/testing/a11y'
import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { defineXhElements } from '../../src/define'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

defineXhElements()

const ROW = 36
const COUNT = 5000
const columns = Array.from({ length: 6 }, (_, i) => ({
  id: `c${i}`,
  label: `第 ${i + 1} 列`,
  width: 160,
  minWidth: 160,
  maxWidth: 160,
  ...(i === 0 ? { sticky: 'start' as const } : {}),
}))
const rows = Array.from({ length: COUNT }, (_, i) => ({ id: `r${i}` }))

afterEach(() => {
  document.body.querySelectorAll('[data-test="table-virtualizer-ancestor"]').forEach(node => node.remove())
})

async function settle(): Promise<void> {
  for (let i = 0; i < 4; i++)
    await new Promise(resolve => requestAnimationFrame(resolve))
}

async function mount(): Promise<HTMLElement> {
  const stage = document.createElement('div')
  stage.dataset.test = 'table-virtualizer-ancestor'
  stage.style.inlineSize = '375px'
  stage.innerHTML = `
    <xh-table sticky-header>
      <div data-xh-part="root">
        <div data-xh-part="header">
          <div data-xh-part="row">
            ${columns.map(c => `<div data-xh-part="column-header" value="${c.id}"><span data-xh-part="column-label">${c.label}</span></div>`).join('')}
          </div>
        </div>
        <div data-xh-part="body">
          <xh-virtualizer count="${COUNT}" estimate-size="${ROW}" scroll-container="ancestor">
            <div data-xh-part="root">
              <div data-xh-part="viewport">
                <div data-xh-part="content"></div>
              </div>
            </div>
          </xh-virtualizer>
        </div>
      </div>
    </xh-table>
  `
  document.body.append(stage)
  const table = stage.querySelector<XhTableElement>('xh-table')!
  const virtualizer = stage.querySelector<XhVirtualizerElement>('xh-virtualizer')!
  const content = virtualizer.querySelector<HTMLElement>('[data-xh-part="content"]')!
  table.columns = columns
  table.rows = rows

  const render = (items: readonly { index: number }[]): void => {
    content.replaceChildren(...items.map((item) => {
      const shell = document.createElement('div')
      shell.dataset.xhPart = 'item'
      shell.setAttribute('value', String(item.index))
      const row = document.createElement('div')
      row.dataset.xhPart = 'row'
      row.dataset.xhPartOwner = 'table'
      row.setAttribute('value', `r${item.index}`)
      row.style.blockSize = `${ROW}px`
      row.append(...columns.map((c) => {
        const cell = document.createElement('div')
        cell.dataset.xhPart = 'cell'
        cell.setAttribute('value', c.id)
        cell.textContent = `${item.index + 1}-${c.id}`
        return cell
      }))
      shell.append(row)
      return shell
    }))
    virtualizer.requestUpdate()
    const bridge = virtualizer.collectionVirtualizer
    if (bridge) {
      table.virtualizer = bridge
      table.requestUpdate()
    }
  }
  virtualizer.addEventListener('range-change', event => render((event as CustomEvent).detail.virtualItems))
  await expect.poll(() => virtualizer.collectionVirtualizer != null).toBe(true)
  render(virtualizer.virtualItems)
  await settle()
  return stage.querySelector<HTMLElement>('[data-scope="table"][data-part="root"]')!
}

async function scrollRoot(root: HTMLElement, to: { top?: number, left?: number }): Promise<void> {
  root.scrollTo(to)
  root.dispatchEvent(new Event('scroll'))
  await settle()
}

function headerCell(root: HTMLElement, id: string): HTMLElement {
  return root.querySelector<HTMLElement>(`[data-part="header"] [data-part="column-header"][data-value="${id}"]`)!
}

/** 视口里看得见的数据行：在表头下沿之下、根的下沿之上。 */
function visibleRows(root: HTMLElement): HTMLElement[] {
  const header = root.querySelector<HTMLElement>('[data-part="header"]')!.getBoundingClientRect()
  const box = root.getBoundingClientRect()
  return [...root.querySelectorAll<HTMLElement>('[data-part="body"] [data-scope="table"][data-part="row"]')]
    .filter((row) => {
      const r = row.getBoundingClientRect()
      return r.bottom > header.bottom + 1 && r.top < box.bottom - 1
    })
}

describe('虚拟滚动表格：根节点自己滚（Web Components）', () => {
  it('滚动面是表格根节点：视口不滚动、不占 Tab 位，写 data-scroll-container="ancestor"', async () => {
    const root = await mount()
    const viewport = root.querySelector<HTMLElement>('[data-scope="virtualizer"][data-part="viewport"]')!
    expect(viewport.getAttribute('data-scroll-container')).toBe('ancestor')
    expect(viewport.hasAttribute('tabindex')).toBe(false)
    expect(viewport.scrollHeight).toBe(viewport.clientHeight)
    expect(root.scrollHeight).toBeGreaterThan(root.clientHeight)
    expect(root.scrollWidth).toBeGreaterThan(root.clientWidth)
    expect(visibleRows(root).length).toBeGreaterThan(0)
  })

  it('横向滚动后表头与各行同列左右边缘一致，冻结列在表头与表体都留在行首', async () => {
    const root = await mount()
    await scrollRoot(root, { left: 300 })
    expect(root.scrollLeft).toBe(300)
    const box = root.getBoundingClientRect()
    for (const id of ['c0', 'c3', 'c5']) {
      const head = headerCell(root, id).getBoundingClientRect()
      for (const row of visibleRows(root)) {
        const cell = row.querySelector<HTMLElement>(`[data-part="cell"][data-value="${id}"]`)!.getBoundingClientRect()
        expect(cell.left).toBeCloseTo(head.left, 0)
        expect(cell.width).toBeCloseTo(head.width, 0)
      }
    }
    expect(headerCell(root, 'c0').getBoundingClientRect().left).toBeCloseTo(box.left + root.clientLeft, 0)
    const firstRow = visibleRows(root)[0]!
    expect(firstRow.querySelector<HTMLElement>('[data-value="c0"]')!.getBoundingClientRect().left).toBeCloseTo(box.left + root.clientLeft, 0)
  })

  it('纵向滚到中段与底部：表头吸顶，窗口里的行与行号按完整行序', async () => {
    const root = await mount()
    await scrollRoot(root, { top: ROW * 2500 })
    const box = root.getBoundingClientRect()
    expect(root.querySelector<HTMLElement>('[data-part="header"]')!.getBoundingClientRect().top).toBeCloseTo(box.top + root.clientTop, 0)
    const middle = visibleRows(root)
    expect(middle.length).toBeGreaterThan(0)
    const first = Number(middle[0]!.getAttribute('aria-rowindex'))
    // 表头算第 1 行，数据行第 i 条的行号是 i + 2
    expect(first).toBeGreaterThanOrEqual(2500)
    expect(first).toBeLessThanOrEqual(2504)
    expect(middle[0]!.getAttribute('data-value')).toBe(`r${first - 2}`)

    await scrollRoot(root, { top: root.scrollHeight })
    const last = visibleRows(root).at(-1)!
    expect(last.getAttribute('data-value')).toBe(`r${COUNT - 1}`)
    expect(last.getAttribute('aria-rowindex')).toBe(String(COUNT + 1))
  })

  it('axe 不报结构与引用问题：rowgroup 直接拥有行，中间几层不占 Tab 位', async () => {
    const root = await mount()
    const { violations } = await runAxe(root)
    const ids = violations.map(v => v.id)
    for (const rule of ['aria-required-children', 'aria-required-parent', 'aria-valid-attr-value', 'scrollable-region-focusable'])
      expect(ids).not.toContain(rule)
  })

  it('方向键在完整行序里走：End 落到最后一行，先滚进来再交焦点', async () => {
    const root = await mount()
    visibleRows(root)[0]!.focus()
    await userEvent.keyboard('{ArrowDown}')
    await settle()
    expect(document.activeElement?.getAttribute('data-value')).toBe('r1')
    await userEvent.keyboard('{End}')
    await expect.poll(() => document.activeElement?.getAttribute('data-value')).toBe(`r${COUNT - 1}`)
    expect(root.scrollTop).toBeGreaterThan(ROW * (COUNT - 20))
  })
})
