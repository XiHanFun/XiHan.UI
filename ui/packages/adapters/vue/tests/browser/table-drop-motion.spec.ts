// 表格的行换位落下：库只报 onRowMove，宿主按 ids 重排行之后，行从旧位置滑到新位置（translate 过渡，
// 时长 move），不是在重渲那一刻瞬移；落定之后不留位移。translate 的中间帧只有真实浏览器量得出来。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { createApp, defineComponent, h, nextTick, ref } from 'vue'
import {
  XhTableBody,
  XhTableCell,
  XhTableColumnHeader,
  XhTableColumnLabel,
  XhTableHeader,
  XhTableRoot,
  XhTableRow,
} from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

const columns = [{ id: 'name', label: '名称' }]

let app: App | null = null
let host: HTMLElement | null = null

afterEach(() => {
  app?.unmount()
  host?.remove()
  app = null
  host = null
})

function row(value: string): HTMLElement {
  const el = host?.querySelector<HTMLElement>(`[data-scope='table'][data-part='body'] [data-part='row'][data-value='${value}']`)
  if (!el)
    throw new Error(`缺少 table 行：${value}`)
  return el
}

function translateY(el: HTMLElement): number {
  const value = getComputedStyle(el).translate
  return value === 'none' ? 0 : Number.parseFloat(value.split(' ')[1] ?? '0')
}

async function mount(): Promise<void> {
  host = document.createElement('div')
  host.style.inlineSize = '320px'
  document.body.append(host)
  const Demo = defineComponent(() => {
    const ids = ref(['a', 'b', 'c'])
    return () => h(XhTableRoot, {
      columns,
      rows: ids.value.map(id => ({ id })),
      rowReorderable: true,
      onRowMove: (details: { ids: string[] }) => {
        ids.value = details.ids
      },
    }, () => [
      h(XhTableHeader, null, () => h(XhTableRow, null, () => columns.map(column => h(XhTableColumnHeader, { key: column.id, value: column.id }, () => h(XhTableColumnLabel, null, () => column.label))))),
      h(XhTableBody, null, () => ids.value.map(id => h(XhTableRow, { key: id, value: id }, () => h(XhTableCell, { value: 'name' }, () => id)))),
    ])
  })
  app = createApp(Demo)
  app.mount(host)
  await nextTick()
}

describe('table 行换位落下', () => {
  it('键盘换位（Alt + 下键）：宿主按 ids 重排后行从旧位置滑到新位置，落定后不留位移', async () => {
    await mount()
    expect(getComputedStyle(row('a')).transitionProperty).toContain('translate')
    row('a').focus()
    await userEvent.keyboard('{Alt>}{ArrowDown}{/Alt}')
    await nextTick()
    expect([...host!.querySelectorAll(`[data-part='body'] [data-part='row']`)].map(el => el.getAttribute('data-value'))).toEqual(['b', 'a', 'c'])
    expect(translateY(row('a'))).toBeLessThan(0)
    expect(translateY(row('b'))).toBeGreaterThan(0)
    await expect.poll(() => getComputedStyle(row('a')).translate).toBe('none')
    await expect.poll(() => getComputedStyle(row('b')).translate).toBe('none')
  })
})
