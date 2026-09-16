// Cascader 的每一列与搜索列表各接一路贴层的自绘竖条：与 content 那条横的同一形态（浮层 4px 档）。
//
// 条子按列在 content 里的偏移盒定位，列之间的分隔线要绕过夹在中间的条子节点：都只有真实布局量得出来。
import type { CascaderLevel } from '@xihan-ui/headless'
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import {
  XhCascaderColumn,
  XhCascaderContent,
  XhCascaderControl,
  XhCascaderInput,
  XhCascaderItem,
  XhCascaderItemText,
  XhCascaderPositioner,
  XhCascaderRoot,
  XhCascaderSearchList,
  XhCascaderTrigger,
  XhCascaderValueText,
} from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

const CHILDREN = Array.from({ length: 30 }, (_, index) => ({ value: `city-${index}`, label: `城市 ${index}` }))
const COLLECTION = [
  { value: 'east', label: '华东', children: CHILDREN },
  { value: 'north', label: '华北', children: [{ value: 'beijing', label: '北京' }] },
]

let app: App | null = null
let host: HTMLElement | null = null

async function settle(): Promise<void> {
  for (let i = 0; i < 3; i++) {
    await nextTick()
    await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
  }
}

async function mountCascader(dir: 'ltr' | 'rtl' = 'ltr'): Promise<void> {
  host = document.createElement('div')
  document.body.append(host)
  app = createApp({
    render: () => h(XhCascaderRoot, {
      collection: COLLECTION,
      searchable: true,
      open: true,
      value: [['east', 'city-3']],
      dir,
    }, {
      default: ({ levels }: { levels: CascaderLevel[] }) => [
        h(XhCascaderControl, null, () => [
          h(XhCascaderTrigger, null, () => [h(XhCascaderValueText)]),
        ]),
        h(XhCascaderPositioner, null, () => [
          h(XhCascaderContent, null, () => [
            h(XhCascaderInput),
            h(XhCascaderSearchList),
            ...levels.map(level => h(XhCascaderColumn, { key: level.level, level: level.level }, () =>
              level.items.map(node => h(XhCascaderItem, { key: node.value, value: node.value }, () =>
                h(XhCascaderItemText, null, () => node.label))))),
          ]),
        ]),
      ],
    }),
  })
  app.mount(host)
  await settle()
}

function parts(name: string): HTMLElement[] {
  return [...document.querySelectorAll<HTMLElement>(`[data-scope='cascader'][data-part='${name}']`)]
}

function barAfter(el: HTMLElement): HTMLElement {
  const next = el.nextElementSibling
  if (!(next instanceof HTMLElement) || next.dataset.scope !== 'scrollbar' || next.dataset.part !== 'root')
    throw new Error(`${el.dataset.part} 后面没有紧跟着它的条子`)
  return next
}

afterEach(() => {
  app?.unmount()
  host?.remove()
  document.getElementById('xh-portal-root')?.remove()
  app = null
  host = null
})

describe('级联列与搜索列表的自绘条', () => {
  it('每列后面紧跟一条贴层的竖条，位置贴该列的行内末端、长度与列同高；分隔线仍只画在列与列之间', async () => {
    await mountCascader()
    const columns = parts('column').filter(el => !el.hidden)
    expect(columns.length).toBe(2)
    for (const column of columns) {
      const bar = barAfter(column)
      expect(bar.getAttribute('data-anchor')).toBe('layer')
      expect(bar.getAttribute('data-orientation')).toBe('vertical')
      expect(bar.getAttribute('data-size')).toBe('sm')
      expect(column.hasAttribute('data-xh-scrollbar')).toBe(true)
      const box = column.getBoundingClientRect()
      const rect = bar.getBoundingClientRect()
      expect(rect.right).toBeCloseTo(box.right, 0)
      expect(rect.top).toBeCloseTo(box.top, 0)
      expect(rect.height).toBeCloseTo(box.height, 0)
      expect(getComputedStyle(bar.querySelector<HTMLElement>('[data-part="track"]')!).backgroundColor).toBe('rgba(0, 0, 0, 0)')
    }
    // 第二列溢出：滚动后条子露面
    const second = columns[1]!
    expect(second.scrollHeight).toBeGreaterThan(second.clientHeight)
    second.scrollTop = 40
    second.dispatchEvent(new Event('scroll'))
    await settle()
    expect(barAfter(second).getAttribute('data-state')).toBe('visible')
    // 分隔线：第一列不画，第二列画在行内起始缘（条子节点夹在中间也接得上）
    expect(Number.parseFloat(getComputedStyle(columns[0]!).borderInlineStartWidth)).toBe(0)
    expect(Number.parseFloat(getComputedStyle(second).borderInlineStartWidth)).toBeGreaterThan(0)
    // content 自己那条横的仍挂在浮层壳上
    const positioner = parts('positioner')[0]!
    expect(positioner.querySelector(':scope > [data-scope="scrollbar"][data-part="root"][data-orientation="horizontal"]')).not.toBeNull()
  })

  it('搜索列表后面紧跟一条贴层的竖条', async () => {
    await mountCascader()
    const input = parts('input')[0] as HTMLInputElement
    input.value = '城市'
    input.dispatchEvent(new Event('input', { bubbles: true }))
    await settle()
    const list = parts('search-list')[0]!
    expect(list.hidden).toBe(false)
    const bar = barAfter(list)
    expect(bar.getAttribute('data-anchor')).toBe('layer')
    const box = list.getBoundingClientRect()
    const rect = bar.getBoundingClientRect()
    expect(rect.right).toBeCloseTo(box.right, 0)
    expect(rect.height).toBeCloseTo(box.height, 0)
    expect(list.scrollHeight).toBeGreaterThan(list.clientHeight)
  })

  it('从右到左排版时竖条贴列的左缘', async () => {
    await mountCascader('rtl')
    const column = parts('column').filter(el => !el.hidden)[1]!
    const bar = barAfter(column)
    expect(bar.getBoundingClientRect().left).toBeCloseTo(column.getBoundingClientRect().left, 0)
  })
})
