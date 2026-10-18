// 表尾吸底：root 自己滚动时，stickyFooter 把表尾钉在 root 的下沿，滚过的行从它底下经过；两行表尾一起钉住，行号按 level 接在数据行之后。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import { XhTableBody, XhTableCell, XhTableColumnHeader, XhTableColumnLabel, XhTableFooter, XhTableHeader, XhTableRoot, XhTableRow } from '../../src'
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

const ROWS = Array.from({ length: 30 }, (_, i) => ({ id: `r${i}` }))

async function mount(stickyFooter: boolean): Promise<{ root: HTMLElement, footer: HTMLElement }> {
  host = document.createElement('div')
  host.style.inlineSize = '360px'
  document.body.append(host)
  app = createApp({
    render: () => h(XhTableRoot, { columns: [{ id: 'name', label: '名称' }], rows: ROWS, footerRows: 2, stickyFooter, style: '--xh-table-max-h: 240px' }, () => [
      h(XhTableHeader, null, () => [h(XhTableRow, null, () => [h(XhTableColumnHeader, { value: 'name' }, () => [h(XhTableColumnLabel, null, () => '名称')])])]),
      h(XhTableBody, null, () => ROWS.map((row, i) => h(XhTableRow, { key: row.id, value: row.id }, () => [h(XhTableCell, { value: 'name' }, () => `第 ${i + 1} 行`)]))),
      h(XhTableFooter, null, () => [
        h(XhTableRow, { level: 1 }, () => [h(XhTableCell, { value: 'name' }, () => '小计')]),
        h(XhTableRow, { level: 2 }, () => [h(XhTableCell, { value: 'name' }, () => '合计')]),
      ]),
    ]),
  })
  app.mount(host)
  await nextTick()
  for (let i = 0; i < 3; i++)
    await new Promise(resolve => requestAnimationFrame(resolve))
  return {
    root: host.querySelector<HTMLElement>('[data-scope="table"][data-part="root"]')!,
    footer: host.querySelector<HTMLElement>('[data-scope="table"][data-part="footer"]')!,
  }
}

/** 计算出的颜色的不透明度：rgb() / rgba() 与 color(srgb … / a) 两种写法都认。 */
function alphaOf(color: string): number {
  const slash = /\/\s*([\d.]+%?)\s*\)$/.exec(color)
  if (slash)
    return slash[1]!.endsWith('%') ? Number.parseFloat(slash[1]!) / 100 : Number(slash[1])
  const rgba = /^rgba\(([^)]+)\)$/.exec(color)
  if (rgba)
    return Number(rgba[1]!.split(',')[3])
  return /^(?:rgb|color)\(/.test(color) ? 1 : Number.NaN
}

describe('表格表尾吸底（Vue）', () => {
  it('stickyFooter：滚到顶时表尾已贴在 root 下沿，两行表尾的行号接在数据行之后', async () => {
    const { root, footer } = await mount(true)
    expect(root.scrollHeight).toBeGreaterThan(root.clientHeight)
    root.scrollTop = 0
    const rootBox = root.getBoundingClientRect()
    expect(Math.abs(footer.getBoundingClientRect().bottom - (rootBox.top + root.clientTop + root.clientHeight))).toBeLessThan(1.5)
    expect(getComputedStyle(footer).position).toBe('sticky')
    expect([...footer.querySelectorAll('[data-part="row"]')].map(row => row.getAttribute('aria-rowindex'))).toEqual(['32', '33'])
    expect(root.getAttribute('aria-rowcount')).toBe('33')
  })

  it('吸底的表尾底色是实色：滚过的行不会从底下透出来', async () => {
    const { footer } = await mount(true)
    expect(alphaOf(getComputedStyle(footer).backgroundColor)).toBe(1)
  })

  it('表尾的冻结格是实色：横向滚动时被它压住的格子不从底下透出来，吸不吸底都一样', async () => {
    for (const stickyFooter of [true, false]) {
      app?.unmount()
      host?.remove()
      host = document.createElement('div')
      host.style.inlineSize = '320px'
      document.body.append(host)
      const columns = [
        { id: 'name', label: '名称', width: 120, sticky: 'start' as const },
        { id: 'q1', label: 'Q1', width: 160 },
        { id: 'q2', label: 'Q2', width: 160 },
      ]
      app = createApp({
        render: () => h(XhTableRoot, { columns, rows: [{ id: 'r0' }], footerRows: 1, stickyFooter }, () => [
          h(XhTableHeader, null, () => [h(XhTableRow, null, () => columns.map(c => h(XhTableColumnHeader, { key: c.id, value: c.id }, () => [h(XhTableColumnLabel, null, () => c.label)])))]),
          h(XhTableBody, null, () => [h(XhTableRow, { value: 'r0' }, () => columns.map(c => h(XhTableCell, { key: c.id, value: c.id }, () => c.label)))]),
          h(XhTableFooter, null, () => [h(XhTableRow, null, () => columns.map(c => h(XhTableCell, { key: c.id, value: c.id }, () => (c.id === 'name' ? '合计' : '100'))))]),
        ]),
      })
      app.mount(host)
      await nextTick()
      for (let i = 0; i < 3; i++)
        await new Promise(resolve => requestAnimationFrame(resolve))
      const root = host.querySelector<HTMLElement>('[data-scope="table"][data-part="root"]')!
      const frozen = host.querySelector<HTMLElement>('[data-scope="table"][data-part="footer"] [data-scope="table"][data-part="cell"][data-value="name"]')!
      expect(frozen.getAttribute('data-frozen')).toBe('start')
      expect(alphaOf(getComputedStyle(frozen).backgroundColor), String(stickyFooter)).toBe(1)
      root.scrollLeft = 80
      await new Promise(resolve => requestAnimationFrame(resolve))
      const box = frozen.getBoundingClientRect()
      expect(root.scrollLeft).toBeGreaterThan(0)
      // 冻结格的中心点被 q1 那一格从底下滑过：最上面的仍是冻结格自己
      const hit = document.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2)
      expect(frozen.contains(hit), String(stickyFooter)).toBe(true)
    }
  })

  it('不写 stickyFooter：表尾跟着内容走，滚到顶时在可视区之外', async () => {
    const { root, footer } = await mount(false)
    root.scrollTop = 0
    expect(footer.getBoundingClientRect().top).toBeGreaterThan(root.getBoundingClientRect().bottom)
  })
})
