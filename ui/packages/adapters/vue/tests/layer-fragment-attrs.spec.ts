// @vitest-environment jsdom
// 贴层接自绘条的列部件以片段作根（层节点 + 条子节点）：Vue 只在根 vnode 是元素或组件时才合并直通属性，
// 所以作者写在标签上的 class、内联 style 与 data-* 必须由组件自己接住并落到层节点上，且不触发
// "Extraneous non-props attributes" 开发态告警。
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import {
  XhCascaderColumn,
  XhCascaderContent,
  XhCascaderInput,
  XhCascaderItem,
  XhCascaderItemText,
  XhCascaderPositioner,
  XhCascaderRoot,
  XhCascaderSearchList,
  XhCascaderTrigger,
} from '../src'

let cleanup: Array<() => void> = []

afterEach(() => {
  for (const fn of cleanup) fn()
  cleanup = []
  document.body.innerHTML = ''
  vi.restoreAllMocks()
})

async function tick(): Promise<void> {
  await nextTick()
  await nextTick()
  await new Promise(r => setTimeout(r, 0))
  await nextTick()
}

function mount(render: () => unknown): void {
  const host = document.createElement('div')
  document.body.appendChild(host)
  const app = createApp({ setup: () => render as never })
  app.mount(host)
  cleanup.push(() => {
    app.unmount()
    host.remove()
  })
}

function el(selector: string): HTMLElement {
  const hit = document.querySelector<HTMLElement>(selector)
  if (!hit)
    throw new Error(`找不到 ${selector}`)
  return hit
}

const REGIONS = [
  { value: 'zj', label: '浙江', children: [{ value: 'hz', label: '杭州' }] },
]

const AUTHORED = { 'class': 'authored', 'style': '--authored: 1px', 'data-testid': 'authored' }

describe('cascader 片段作根的列部件接住直通属性', () => {
  it('column 收下 class、内联 style 与 data-*，落到列节点，且没有直通属性告警', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    mount(() => h(XhCascaderRoot, { collection: REGIONS, open: true }, {
      default: ({ levels }: { levels: Array<{ level: number, items: Array<{ value: string, label: string }> }> }) => [
        h(XhCascaderTrigger),
        h(XhCascaderPositioner, null, () => [
          h(XhCascaderContent, null, () => levels.map(lv =>
            h(XhCascaderColumn, { key: lv.level, level: lv.level, ...AUTHORED }, () =>
              lv.items.map(node => h(XhCascaderItem, { key: node.value, value: node.value }, () => [
                h(XhCascaderItemText, () => node.label),
              ]))),
          )),
        ]),
      ],
    }))
    await tick()

    const column = el('[data-scope=\'cascader\'][data-part=\'column\']')
    expect(column.classList.contains('authored')).toBe(true)
    expect(column.style.getPropertyValue('--authored')).toBe('1px')
    expect(column.getAttribute('data-testid')).toBe('authored')
    // 皮肤自己的标记不被直通属性挤掉
    expect(column.getAttribute('data-level')).toBe('0')
    expect(warn.mock.calls.flat().some(arg => String(arg).includes('Extraneous non-props attributes'))).toBe(false)
  })

  it('search-list 收下 class、内联 style 与 data-*，落到列表节点，且没有直通属性告警', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    mount(() => h(XhCascaderRoot, { collection: REGIONS, searchable: true, open: true }, {
      default: () => [
        h(XhCascaderTrigger),
        h(XhCascaderPositioner, null, () => [
          h(XhCascaderContent, null, () => [
            h(XhCascaderInput),
            h(XhCascaderSearchList, AUTHORED),
          ]),
        ]),
      ],
    }))
    await tick()

    const list = el('[data-scope=\'cascader\'][data-part=\'search-list\']')
    expect(list.classList.contains('authored')).toBe(true)
    expect(list.style.getPropertyValue('--authored')).toBe('1px')
    expect(list.getAttribute('data-testid')).toBe('authored')
    expect(warn.mock.calls.flat().some(arg => String(arg).includes('Extraneous non-props attributes'))).toBe(false)
  })
})
