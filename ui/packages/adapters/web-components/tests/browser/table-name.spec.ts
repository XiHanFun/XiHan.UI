// 表格的可及名：放 caption 时根引用它；不放 caption 时沿用作者写在根上（或宿主上）的命名；什么都不写时不留落空的引用。
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

async function settle(): Promise<void> {
  await Promise.resolve()
  for (let i = 0; i < 3; i++)
    await new Promise(resolve => requestAnimationFrame(resolve))
}

const BODY = `
  <div data-xh-part="header"><div data-xh-part="row">
    <div data-xh-part="column-header" value="name"><span data-xh-part="column-label">姓名</span></div>
  </div></div>
  <div data-xh-part="body"><div data-xh-part="row" value="u1"><div data-xh-part="cell" value="name">赵一</div></div></div>`

async function mount(hostAttrs: string, rootAttrs: string, caption: boolean): Promise<{ box: HTMLElement, grid: HTMLElement }> {
  host = document.createElement('div')
  host.innerHTML = `
    <h3 id="table-heading">团队成员</h3>
    <xh-table ${hostAttrs}>
      <div data-xh-part="root" ${rootAttrs}>${caption ? '<div data-xh-part="caption">团队成员</div>' : ''}${BODY}</div>
    </xh-table>`
  document.body.append(host)
  const table = host.querySelector('xh-table') as unknown as Record<string, unknown>
  table.columns = [{ id: 'name', label: '姓名' }]
  table.rows = [{ id: 'u1' }]
  await settle()
  return { box: host, grid: host.querySelector('[data-scope="table"][data-part="root"]')! }
}

/** 表格按 aria-labelledby / aria-label 算出来的名字；引用要指向文档里真实存在的节点。 */
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
    const { box, grid } = await mount('', '', true)
    expect(gridName(grid)).toBe('团队成员')
    expect(await refViolations(box)).toEqual([])
  })

  it('不放 caption、根上写 aria-label：根念它，不再挂落空的引用', async () => {
    const { box, grid } = await mount('', 'aria-label="团队成员"', false)
    expect(grid.hasAttribute('aria-labelledby')).toBe(false)
    expect(gridName(grid)).toBe('团队成员')
    expect(await refViolations(box)).toEqual([])
  })

  it('不放 caption、根上写 aria-labelledby：根念被引用的标题', async () => {
    const { box, grid } = await mount('', 'aria-labelledby="table-heading"', false)
    expect(gridName(grid)).toBe('团队成员')
    expect(await refViolations(box)).toEqual([])
  })

  it('什么都不写：根不写 aria-labelledby，不留落空的引用', async () => {
    const { box, grid } = await mount('', '', false)
    expect(grid.hasAttribute('aria-labelledby')).toBe(false)
    expect(await refViolations(box)).toEqual([])
  })

  it('名字写在宿主上：转到根上，宿主上的命名改了跟着变', async () => {
    const { grid } = await mount('aria-label="团队成员"', '', false)
    expect(gridName(grid)).toBe('团队成员')
    host!.querySelector('xh-table')!.setAttribute('aria-label', '在职成员')
    await settle()
    expect(gridName(grid)).toBe('在职成员')
  })

  it('后补上 caption 时根改为引用它', async () => {
    const { grid } = await mount('', 'aria-label="团队成员"', false)
    const caption = document.createElement('div')
    caption.dataset.xhPart = 'caption'
    caption.textContent = '新标题'
    grid.prepend(caption)
    await settle()
    expect(grid.getAttribute('aria-labelledby')).toBe(caption.id)
    expect(gridName(grid)).toBe('新标题')
  })
})
