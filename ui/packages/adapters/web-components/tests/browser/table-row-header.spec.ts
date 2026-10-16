// 行表头列：列定义标了 rowHeader 的那一列，表体与脚注里的格子报 rowheader，列头仍是 columnheader，角色结构 axe 不报。
import { runAxe } from '@xihan-ui/testing/a11y'
import { afterEach, describe, expect, it } from 'vitest'
import { defineXhElements } from '../../src/define'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

defineXhElements()

let host: HTMLElement | null = null

afterEach(() => {
  host?.remove()
  host = null
})

const ROLE_RULES = ['aria-required-children', 'aria-required-parent', 'aria-allowed-role', 'aria-valid-attr-value']

async function mount(rowHeader: boolean): Promise<HTMLElement> {
  host = document.createElement('div')
  host.innerHTML = `
    <xh-table footer-rows="1">
      <div data-xh-part="root" aria-label="采购清单">
        <div data-xh-part="header"><div data-xh-part="row">
          <div data-xh-part="column-header" value="item"><span data-xh-part="column-label">条目</span></div>
          <div data-xh-part="column-header" value="count"><span data-xh-part="column-label">数量</span></div>
        </div></div>
        <div data-xh-part="body">
          <div data-xh-part="row" value="l1"><div data-xh-part="cell" value="item">键盘</div><div data-xh-part="cell" value="count">2</div></div>
          <div data-xh-part="row" value="l2"><div data-xh-part="cell" value="item">鼠标</div><div data-xh-part="cell" value="count">3</div></div>
        </div>
        <div data-xh-part="footer"><div data-xh-part="row">
          <div data-xh-part="cell" value="item">合计</div><div data-xh-part="cell" value="count">5</div>
        </div></div>
      </div>
    </xh-table>`
  document.body.append(host)
  const table = host.querySelector('xh-table') as unknown as Record<string, unknown>
  table.columns = [{ id: 'item', label: '条目', rowHeader }, { id: 'count', label: '数量' }]
  table.rows = [{ id: 'l1' }, { id: 'l2' }]
  await Promise.resolve()
  for (let i = 0; i < 3; i++)
    await new Promise(resolve => requestAnimationFrame(resolve))
  return host
}

function roles(box: HTMLElement, selector: string): (string | null)[] {
  return [...box.querySelectorAll(selector)].map(el => el.getAttribute('role'))
}

describe('行表头列', () => {
  it('标了 rowHeader 的列：表体与脚注里的格子是 rowheader，其余是 gridcell，列头不变', async () => {
    const box = await mount(true)
    expect(roles(box, '[data-scope="table"][data-part="cell"][data-value="item"]')).toEqual(['rowheader', 'rowheader', 'rowheader'])
    expect(roles(box, '[data-scope="table"][data-part="cell"][data-value="count"]')).toEqual(['gridcell', 'gridcell', 'gridcell'])
    expect(roles(box, '[data-scope="table"][data-part="column-header"]')).toEqual(['columnheader', 'columnheader'])
    const { violations } = await runAxe(box)
    expect(violations.filter(v => ROLE_RULES.includes(v.id)).map(v => v.id)).toEqual([])
  })

  it('没标时格子一律是 gridcell', async () => {
    const box = await mount(false)
    expect(roles(box, '[data-scope="table"][data-part="cell"]')).toEqual(Array.from({ length: 6 }).fill('gridcell'))
  })
})
