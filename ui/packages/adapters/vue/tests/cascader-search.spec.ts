// @vitest-environment jsdom
// cascader 搜索：输入即过滤（整条路径连缀匹配、候选替换列视图），
// 上下键走候选 + Enter 选中整条路径，Escape 先清词；禁用整条不落值。
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

async function tick(): Promise<void> {
  await nextTick()
  await nextTick()
  await new Promise(r => setTimeout(r, 0))
  await nextTick()
}

let cleanup: Array<() => void> = []

afterEach(() => {
  for (const fn of cleanup) fn()
  cleanup = []
  document.body.innerHTML = ''
})

const REGIONS = [
  {
    value: 'zj',
    label: '浙江',
    children: [
      { value: 'hz', label: '杭州', children: [{ value: 'xh', label: '西湖' }, { value: 'bj', label: '滨江' }] },
    ],
  },
  {
    value: 'js',
    label: '江苏',
    children: [
      { value: 'nj', label: '南京', children: [{ value: 'gl', label: '鼓楼', disabled: true }] },
    ],
  },
]

function mountCascader(props: Record<string, unknown> = {}): { change: ReturnType<typeof vi.fn> } {
  const change = vi.fn()
  const host = document.createElement('div')
  document.body.appendChild(host)
  const app = createApp({
    setup: () => () =>
      h(XhCascaderRoot, { 'collection': REGIONS, 'searchable': true, 'onValue-change': change, ...props }, {
        default: ({ levels }: { levels: Array<{ level: number, items: Array<{ value: string, label: string }> }> }) => [
          h(XhCascaderTrigger),
          h(XhCascaderPositioner, null, () => [
            h(XhCascaderContent, null, () => [
              h(XhCascaderInput),
              h(XhCascaderSearchList),
              ...levels.map(lv => h(XhCascaderColumn, { key: lv.level, level: lv.level }, () =>
                lv.items.map(node => h(XhCascaderItem, { key: node.value, value: node.value }, () => [
                  h(XhCascaderItemText, () => node.label),
                ])))),
            ]),
          ]),
        ],
      }),
  })
  app.mount(host)
  cleanup.push(() => {
    app.unmount()
    host.remove()
  })
  return { change }
}

function el(selector: string): HTMLElement {
  const hit = document.querySelector<HTMLElement>(selector)
  if (!hit)
    throw new Error(`找不到 ${selector}`)
  return hit
}

const INPUT = '[data-scope="cascader"][data-part="input"]'
const LIST = '[data-scope="cascader"][data-part="search-list"]'
const CONTENT = '[data-scope="cascader"][data-part="content"]'

async function openAndType(query: string): Promise<void> {
  el('[data-scope="cascader"][data-part="trigger"]').click()
  await tick()
  const input = el(INPUT) as HTMLInputElement
  input.value = query
  input.dispatchEvent(new Event('input', { bubbles: true }))
  await tick()
}

describe('cascader 搜索', () => {
  it('输入即过滤：候选替换列视图，整条路径连缀成一行', async () => {
    mountCascader()
    await tick()
    await openAndType('西湖')
    expect(el(CONTENT).hasAttribute('data-searching')).toBe(true)
    expect(el(LIST).hasAttribute('hidden')).toBe(false)
    const items = [...document.querySelectorAll<HTMLElement>('[data-part="search-item"]')]
    expect(items.map(i => i.textContent)).toEqual(['浙江 / 杭州 / 西湖'])
  })

  it('上下键走候选、Enter 选中整条路径并收起清词', async () => {
    const m = mountCascader()
    await tick()
    await openAndType('江')
    const input = el(INPUT) as HTMLInputElement
    // 「江」命中：浙江系两条 + 滨江 + 江苏系一条（按树序）
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }))
    await tick()
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
    await tick()
    expect(m.change).toHaveBeenCalledTimes(1)
    const picked = m.change.mock.calls[0]![0].value
    expect(Array.isArray(picked[0])).toBe(true)
    expect(el(CONTENT).hasAttribute('hidden')).toBe(true)
  })

  it('点候选选中；禁用整条不落值', async () => {
    const m = mountCascader()
    await tick()
    await openAndType('鼓楼')
    const item = el('[data-part="search-item"]')
    expect(item.hasAttribute('data-disabled')).toBe(true)
    item.click()
    await tick()
    expect(m.change).not.toHaveBeenCalled()

    const input = el(INPUT) as HTMLInputElement
    input.value = '滨江'
    input.dispatchEvent(new Event('input', { bubbles: true }))
    await tick()
    el('[data-part="search-item"]').click()
    await tick()
    expect(m.change).toHaveBeenCalledWith({ value: [['zj', 'hz', 'bj']] })
  })

  it('escape 先清词回列视图，浮层不收', async () => {
    mountCascader()
    await tick()
    await openAndType('西湖')
    const input = el(INPUT) as HTMLInputElement
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    await tick()
    expect(input.value).toBe('')
    expect(el(CONTENT).hasAttribute('data-searching')).toBe(false)
    expect(el(CONTENT).hasAttribute('hidden')).toBe(false)
  })

  it('changeOnSelect：分支路径也算候选', async () => {
    mountCascader({ changeOnSelect: true })
    await tick()
    await openAndType('杭州')
    const items = [...document.querySelectorAll<HTMLElement>('[data-part="search-item"]')]
    expect(items.map(i => i.textContent)).toContain('浙江 / 杭州')
  })
})
