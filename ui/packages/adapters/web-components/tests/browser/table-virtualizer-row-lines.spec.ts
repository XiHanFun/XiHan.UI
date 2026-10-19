// 虚拟滚动的表体里行包在虚拟条目里：行间线照样画在后一行的上沿，与普通表体同一条线；
// 完整行序里的第一行不画，滚动之后窗口里的第一行照画；条目里跟在数据行后面的详情行也画（Web Components）。
import type { XhTableElement } from '../../src/elements/table'
import type { XhVirtualizerElement } from '../../src/elements/virtualizer'
import { afterEach, describe, expect, it } from 'vitest'
import { defineXhElements } from '../../src/define'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

defineXhElements()

const ROW = 36
const COUNT = 200
const columns = [{ id: 'name', label: '姓名' }]
const rows = Array.from({ length: COUNT }, (_, i) => ({ id: `r${i}`, expandable: i === 1 }))

afterEach(() => {
  document.body.querySelectorAll('[data-test="table-virtualizer-row-lines"]').forEach(node => node.remove())
})

async function settle(): Promise<void> {
  for (let i = 0; i < 4; i++)
    await new Promise(resolve => requestAnimationFrame(resolve))
}

function part(name: string, value: string, text?: string): HTMLElement {
  const el = document.createElement('div')
  el.dataset.xhPart = name
  el.setAttribute('value', value)
  if (text != null)
    el.textContent = text
  return el
}

async function mount(): Promise<HTMLElement> {
  const stage = document.createElement('div')
  stage.dataset.test = 'table-virtualizer-row-lines'
  stage.style.inlineSize = '420px'
  // 普通表体作对照：第二行上沿的那条线
  stage.innerHTML = `
    <xh-table data-test-plain aria-label="对照">
      <div data-xh-part="root">
        <div data-xh-part="body">
          <div data-xh-part="row" value="p0"><div data-xh-part="cell" value="name">p0</div></div>
          <div data-xh-part="row" value="p1"><div data-xh-part="cell" value="name">p1</div></div>
        </div>
      </div>
    </xh-table>
    <xh-table data-test-virtual aria-label="虚拟">
      <div data-xh-part="root">
        <div data-xh-part="header">
          <div data-xh-part="row">
            <div data-xh-part="column-header" value="name"><span data-xh-part="column-label">姓名</span></div>
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
  const plain = stage.querySelector<XhTableElement>('[data-test-plain]')!
  plain.columns = columns
  plain.rows = [{ id: 'p0' }, { id: 'p1' }]
  const table = stage.querySelector<XhTableElement>('[data-test-virtual]')!
  const virtualizer = stage.querySelector<XhVirtualizerElement>('xh-virtualizer')!
  const content = virtualizer.querySelector<HTMLElement>('[data-xh-part="content"]')!
  table.columns = columns
  table.rows = rows
  table.defaultExpandedValue = ['r1']

  const render = (items: readonly { index: number }[]): void => {
    content.replaceChildren(...items.map((item) => {
      const row = rows[item.index]!
      const shell = part('item', String(item.index))
      const rowEl = part('row', row.id)
      rowEl.dataset.xhPartOwner = 'table'
      rowEl.append(part('cell', 'name', row.id))
      shell.append(rowEl)
      if (row.expandable) {
        const detail = part('expanded-row', row.id)
        detail.dataset.xhPartOwner = 'table'
        detail.append(part('cell', 'name', `${row.id} 明细`))
        shell.append(detail)
      }
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
  return stage
}

function line(el: Element): string {
  const style = getComputedStyle(el)
  return `${style.borderBlockStartWidth} ${style.borderBlockStartStyle} ${style.borderBlockStartColor}`
}

function plainLine(stage: HTMLElement): string {
  return line(stage.querySelectorAll('[data-test-plain] [data-scope="table"][data-part="row"]')[1]!)
}

function virtualRows(stage: HTMLElement): HTMLElement[] {
  return [...stage.querySelectorAll<HTMLElement>('[data-test-virtual] [data-scope="table"][data-part="row"][data-section="body"]')]
}

function virtualRow(stage: HTMLElement, id: string): HTMLElement | undefined {
  return virtualRows(stage).find(el => el.getAttribute('data-value') === id)
}

describe('虚拟滚动表体的行间线（Web Components）', () => {
  it('后一行上沿画线，与普通表体同一条；首行不画，条目里的详情行也画', async () => {
    const stage = await mount()
    await expect.poll(() => virtualRow(stage, 'r3') != null).toBe(true)
    const plain = stage.querySelectorAll('[data-test-plain] [data-scope="table"][data-part="row"]')
    const expected = plainLine(stage)
    expect(expected).toMatch(/^[1-9][\d.]*px solid /)
    expect(line(plain[0]!)).toMatch(/^0px /)

    expect(line(virtualRow(stage, 'r0')!)).toMatch(/^0px /)
    expect(line(virtualRow(stage, 'r1')!)).toBe(expected)
    expect(line(virtualRow(stage, 'r2')!)).toBe(expected)
    const detail = stage.querySelector('[data-test-virtual] [data-scope="table"][data-part="expanded-row"]')!
    expect(detail.hasAttribute('hidden')).toBe(false)
    expect(line(detail)).toBe(expected)
  })

  it('滚动之后窗口里的第一行照画：线按完整行序判，不按窗口里的先后', async () => {
    const stage = await mount()
    await expect.poll(() => virtualRow(stage, 'r3') != null).toBe(true)
    const expected = plainLine(stage)
    const root = stage.querySelector<HTMLElement>('[data-test-virtual] [data-scope="table"][data-part="root"]')!
    root.scrollTo({ top: 100 * ROW })
    root.dispatchEvent(new Event('scroll'))
    await settle()
    await expect.poll(() => virtualRow(stage, 'r0') == null && virtualRow(stage, 'r100') != null).toBe(true)
    expect(virtualRows(stage).length).toBeGreaterThan(0)
    for (const row of virtualRows(stage))
      expect(line(row)).toBe(expected)
  })
})
