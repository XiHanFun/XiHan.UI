// 虚拟滚动表格用 estimateFromMeasured：不写估算值，没量过的行按已量行的实测平均估。
// 大跨度设 scrollTop 之后读回的偏差在一行以内；切 compact、comfortable 之后再核一次（Web Components）。
import type { XhTableElement } from '../../src/elements/table'
import type { XhVirtualizerElement } from '../../src/elements/virtualizer'
import { afterEach, describe, expect, it } from 'vitest'
import { defineXhElements } from '../../src/define'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

defineXhElements()

const COUNT = 5000
const columns = [
  { id: 'no', label: '编号' },
  { id: 'name', label: '姓名' },
]
const rows = Array.from({ length: COUNT }, (_, i) => ({ id: `r${i}` }))

let stage: HTMLElement | null = null

afterEach(() => {
  stage?.remove()
  stage = null
})

async function settle(): Promise<void> {
  for (let i = 0; i < 4; i++)
    await new Promise(resolve => requestAnimationFrame(resolve))
}

async function mount(): Promise<HTMLElement> {
  stage = document.createElement('div')
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
          <xh-virtualizer count="${COUNT}" estimate-from-measured scroll-container="ancestor">
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
      shell.setAttribute('measure', '')
      const row = document.createElement('div')
      row.dataset.xhPart = 'row'
      row.dataset.xhPartOwner = 'table'
      row.setAttribute('value', `r${item.index}`)
      row.append(...columns.map((c) => {
        const cell = document.createElement('div')
        cell.dataset.xhPart = 'cell'
        cell.setAttribute('value', c.id)
        cell.textContent = c.id === 'no' ? `#${item.index + 1}` : `员工 ${item.index + 1}`
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

async function scrollRoot(root: HTMLElement, top: number): Promise<void> {
  root.scrollTo({ top })
  root.dispatchEvent(new Event('scroll'))
  await settle()
}

/** 窗口里渲着的行，最高的那一行的高度。 */
function rowHeight(root: HTMLElement): number {
  const items = [...root.querySelectorAll<HTMLElement>('[data-scope="virtualizer"][data-part="item"]:not([hidden])')]
  return Math.max(...items.map(item => item.offsetHeight))
}

async function setDensity(density: 'compact' | 'comfortable'): Promise<void> {
  stage!.setAttribute('data-density', density)
  await settle()
}

describe('虚拟滚动表格按实测估算行高（Web Components）', () => {
  it('没写估算值：大跨度设 scrollTop，读回的偏差在一行以内', async () => {
    const root = await mount()
    const row = rowHeight(root)
    expect(row).toBeGreaterThan(0)
    for (const top of [3000, 60000, 12000]) {
      await scrollRoot(root, top)
      expect(Math.abs(root.scrollTop - top)).toBeLessThan(row)
    }
  })

  it('切 compact、comfortable 之后估算跟着新的实测走，读回的偏差仍在一行以内', async () => {
    const root = await mount()
    const base = rowHeight(root)
    await scrollRoot(root, 3000)

    await setDensity('compact')
    const compact = rowHeight(root)
    expect(compact).toBeLessThan(base)
    await scrollRoot(root, 60000)
    expect(Math.abs(root.scrollTop - 60000)).toBeLessThan(compact)

    await setDensity('comfortable')
    const comfortable = rowHeight(root)
    expect(comfortable).toBeGreaterThan(compact)
    await scrollRoot(root, 9000)
    expect(Math.abs(root.scrollTop - 9000)).toBeLessThan(comfortable)
  })
})
