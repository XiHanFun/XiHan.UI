// 表格的可及名：放 caption 时根引用它；不放 caption 时沿用作者写在根上的命名；什么都不写时不留落空的引用。
// React 的 caption 部件在 effect 里登记：首帧（含服务端直出）还没登记，不写这条引用，挂载后的下一帧补上。
import { runAxe } from '@xihan-ui/testing/a11y'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, describe, expect, it } from 'vitest'
import { XhTableBody, XhTableCaption, XhTableCell, XhTableColumnHeader, XhTableColumnLabel, XhTableHeader, XhTableRoot, XhTableRow } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let unmount: (() => void) | null = null
let host: HTMLElement | null = null

afterEach(() => {
  unmount?.()
  host?.remove()
  unmount = null
  host = null
})

async function mount(rootAttrs: Record<string, string>, caption: boolean): Promise<{ box: HTMLElement, grid: HTMLElement }> {
  host = document.createElement('div')
  host.innerHTML = '<h3 id="table-heading">团队成员</h3>'
  const point = document.createElement('div')
  host.append(point)
  document.body.append(host)
  const root = createRoot(point)
  await act(async () => {
    root.render(
      <XhTableRoot columns={[{ id: 'name', label: '姓名' }]} rows={[{ id: 'u1' }]} {...rootAttrs}>
        {caption ? <XhTableCaption>团队成员</XhTableCaption> : null}
        <XhTableHeader>
          <XhTableRow>
            <XhTableColumnHeader value="name"><XhTableColumnLabel>姓名</XhTableColumnLabel></XhTableColumnHeader>
          </XhTableRow>
        </XhTableHeader>
        <XhTableBody>
          <XhTableRow value="u1"><XhTableCell value="name">赵一</XhTableCell></XhTableRow>
        </XhTableBody>
      </XhTableRoot>,
    )
  })
  unmount = () => act(() => root.unmount())
  for (let i = 0; i < 3; i++)
    await act(() => new Promise(resolve => requestAnimationFrame(resolve)))
  return { box: host, grid: host.querySelector('[data-scope="table"][data-part="root"]')! }
}

function gridName(grid: Element): string {
  const ids = grid.getAttribute('aria-labelledby')
  if (ids) {
    return ids.split(/\s+/).map((id) => {
      const target = document.getElementById(id)
      expect(target, `aria-labelledby 指向的 ${id} 不存在`).not.toBeNull()
      return target!.textContent!.trim()
    }).join(' ')
  }
  return grid.getAttribute('aria-label') ?? ''
}

async function refViolations(box: HTMLElement): Promise<string[]> {
  const { violations } = await runAxe(box)
  return violations.filter(v => ['aria-valid-attr-value', 'aria-prohibited-attr'].includes(v.id)).map(v => v.id)
}

describe('表格的可及名', () => {
  it('放 caption：根引用 caption', async () => {
    const { box, grid } = await mount({}, true)
    expect(gridName(grid)).toBe('团队成员')
    expect(await refViolations(box)).toEqual([])
  })

  it('不放 caption、根上写 aria-label：根念它，不再挂落空的引用', async () => {
    const { box, grid } = await mount({ 'aria-label': '团队成员' }, false)
    expect(grid.hasAttribute('aria-labelledby')).toBe(false)
    expect(gridName(grid)).toBe('团队成员')
    expect(await refViolations(box)).toEqual([])
  })

  it('不放 caption、根上写 aria-labelledby：根念被引用的标题', async () => {
    const { box, grid } = await mount({ 'aria-labelledby': 'table-heading' }, false)
    expect(gridName(grid)).toBe('团队成员')
    expect(await refViolations(box)).toEqual([])
  })

  it('什么都不写：根不写 aria-labelledby，不留落空的引用', async () => {
    const { box, grid } = await mount({}, false)
    expect(grid.hasAttribute('aria-labelledby')).toBe(false)
    expect(await refViolations(box)).toEqual([])
  })
})
