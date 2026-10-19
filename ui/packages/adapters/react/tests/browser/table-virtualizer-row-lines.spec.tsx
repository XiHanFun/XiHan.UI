// 虚拟滚动的表体里行包在虚拟条目里：行间线照样画在后一行的上沿，与普通表体同一条线；
// 完整行序里的第一行不画，滚动之后窗口里的第一行照画；条目里跟在数据行后面的详情行也画（React）。
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, describe, expect, it } from 'vitest'
import {
  XhTableBody,
  XhTableCell,
  XhTableColumnHeader,
  XhTableColumnLabel,
  XhTableExpandedRow,
  XhTableHeader,
  XhTableRoot,
  XhTableRow,
  XhVirtualizerContent,
  XhVirtualizerItem,
  XhVirtualizerRoot,
  XhVirtualizerViewport,
} from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

const ROW = 36
const COUNT = 200
const columns = [{ id: 'name', label: '姓名' }]
const rows = Array.from({ length: COUNT }, (_, i) => ({ id: `r${i}`, expandable: i === 1 }))
const plainRows = [{ id: 'p0' }, { id: 'p1' }]

let unmount: (() => void) | null = null
let host: HTMLElement | null = null

afterEach(() => {
  unmount?.()
  host?.remove()
  unmount = null
  host = null
})

async function settle(): Promise<void> {
  for (let i = 0; i < 3; i++)
    await act(() => new Promise(resolve => requestAnimationFrame(resolve)))
}

async function mount(): Promise<void> {
  host = document.createElement('div')
  host.style.inlineSize = '420px'
  document.body.append(host)
  const root = createRoot(host)
  await act(async () => {
    root.render(
      <>
        {/* 普通表体作对照：第二行上沿的那条线 */}
        <XhTableRoot columns={columns} rows={plainRows} aria-label="对照" data-test="plain">
          <XhTableBody>
            {plainRows.map(row => <XhTableRow key={row.id} value={row.id}><XhTableCell value="name">{row.id}</XhTableCell></XhTableRow>)}
          </XhTableBody>
        </XhTableRoot>
        <XhVirtualizerRoot count={COUNT} estimateSize={ROW} scrollContainer="ancestor">
          {({ virtualItems, collectionVirtualizer }) => (
            <XhTableRoot columns={columns} rows={rows} defaultExpandedValue={['r1']} virtualizer={collectionVirtualizer} aria-label="虚拟" data-test="virtual">
              <XhTableHeader>
                <XhTableRow>
                  <XhTableColumnHeader value="name"><XhTableColumnLabel>姓名</XhTableColumnLabel></XhTableColumnHeader>
                </XhTableRow>
              </XhTableHeader>
              <XhTableBody>
                <XhVirtualizerViewport>
                  <XhVirtualizerContent>
                    {virtualItems.map((item) => {
                      const row = rows[item.index]!
                      return (
                        <XhVirtualizerItem key={item.key} value={item.index}>
                          <XhTableRow value={row.id}><XhTableCell value="name">{row.id}</XhTableCell></XhTableRow>
                          {row.expandable ? <XhTableExpandedRow value={row.id}><XhTableCell value="name">{`${row.id} 明细`}</XhTableCell></XhTableExpandedRow> : null}
                        </XhVirtualizerItem>
                      )
                    })}
                  </XhVirtualizerContent>
                </XhVirtualizerViewport>
              </XhTableBody>
            </XhTableRoot>
          )}
        </XhVirtualizerRoot>
      </>,
    )
  })
  unmount = () => act(() => root.unmount())
  await settle()
}

function line(el: Element): string {
  const style = getComputedStyle(el)
  return `${style.borderBlockStartWidth} ${style.borderBlockStartStyle} ${style.borderBlockStartColor}`
}

function plainLine(): string {
  return line(host!.querySelectorAll('[data-test="plain"] [data-scope="table"][data-part="row"]')[1]!)
}

function virtualRows(): HTMLElement[] {
  return [...host!.querySelectorAll<HTMLElement>('[data-test="virtual"] [data-scope="table"][data-part="row"][data-section="body"]')]
}

function virtualRow(id: string): HTMLElement | undefined {
  return virtualRows().find(el => el.getAttribute('data-value') === id)
}

describe('虚拟滚动表体的行间线（React）', () => {
  it('后一行上沿画线，与普通表体同一条；首行不画，条目里的详情行也画', async () => {
    await mount()
    await expect.poll(() => virtualRow('r3') != null).toBe(true)
    const plain = host!.querySelectorAll('[data-test="plain"] [data-scope="table"][data-part="row"]')
    const expected = plainLine()
    expect(expected).toMatch(/^[1-9][\d.]*px solid /)
    expect(line(plain[0]!)).toMatch(/^0px /)

    expect(line(virtualRow('r0')!)).toMatch(/^0px /)
    expect(line(virtualRow('r1')!)).toBe(expected)
    expect(line(virtualRow('r2')!)).toBe(expected)
    const detail = host!.querySelector('[data-test="virtual"] [data-scope="table"][data-part="expanded-row"]')!
    expect(detail.hasAttribute('hidden')).toBe(false)
    expect(line(detail)).toBe(expected)
  })

  it('滚动之后窗口里的第一行照画：线按完整行序判，不按窗口里的先后', async () => {
    await mount()
    await expect.poll(() => virtualRow('r3') != null).toBe(true)
    const expected = plainLine()
    const root = host!.querySelector<HTMLElement>('[data-test="virtual"]')!
    root.scrollTo({ top: 100 * ROW })
    root.dispatchEvent(new Event('scroll'))
    await settle()
    await expect.poll(() => virtualRow('r0') == null && virtualRow('r100') != null).toBe(true)
    expect(virtualRows().length).toBeGreaterThan(0)
    for (const row of virtualRows())
      expect(line(row)).toBe(expected)
  })
})
