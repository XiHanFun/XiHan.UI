// JSON 视图的搜索：命中片段有自己的底色（不是浏览器给 mark 的固定亮黄），停住的那一条换成实心并被滚进视野。
// 滚动位置与计算后的底色只有真实浏览器量得出来。
import type { App } from 'vue'
import type { JsonViewerToolbarSlotProps } from '../../src'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import { XhJsonViewerRoot } from '../../src'
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

// 一长串成员，命中项排在最末：不滚动就看不见
const VALUE = Object.fromEntries([
  ...Array.from({ length: 40 }, (_, i) => [`field${i}`, i]),
  ['target', 'needle'],
])

async function mount(): Promise<JsonViewerToolbarSlotProps> {
  host = document.createElement('div')
  document.body.append(host)
  let payload!: JsonViewerToolbarSlotProps
  app = createApp({
    render: () => h(XhJsonViewerRoot, { 'value': VALUE, 'search': 'needle', 'style': { blockSize: '160px', overflow: 'auto' }, 'data-xh-scroll': '' }, {
      toolbar: (p: JsonViewerToolbarSlotProps) => {
        payload = p
        return [h('span', 'toolbar')]
      },
    }),
  })
  app.mount(host)
  await nextTick()
  return payload
}

function part(name: string): HTMLElement {
  const element = host!.querySelector<HTMLElement>(`[data-scope="json-viewer"][data-part="${name}"]`)
  if (!element)
    throw new Error(`缺少 json-viewer 部件：${name}`)
  return element
}

describe('json-viewer 搜索', () => {
  it('命中片段取主题里的淡底，停住后换成实心并滚进视野', async () => {
    const payload = await mount()
    const mark = part('mark')
    expect(mark.textContent).toBe('needle')
    const rest = getComputedStyle(mark).backgroundColor
    expect(rest).not.toBe('rgba(0, 0, 0, 0)')
    // 浏览器给 mark 的缺省亮黄不能漏出来
    expect(rest).not.toBe('rgb(255, 255, 0)')

    const root = part('root')
    const row = mark.closest<HTMLElement>('[data-part="item"]')!
    expect(row.getBoundingClientRect().top).toBeGreaterThan(root.getBoundingClientRect().bottom)

    payload.nextMatch()
    await nextTick()
    await nextTick()
    expect(row.getAttribute('data-current')).toBe('')
    expect(getComputedStyle(part('mark')).backgroundColor).not.toBe(rest)
    const rowRect = row.getBoundingClientRect()
    const rootRect = root.getBoundingClientRect()
    expect(rowRect.top).toBeGreaterThanOrEqual(rootRect.top - 1)
    expect(rowRect.bottom).toBeLessThanOrEqual(rootRect.bottom + 1)
  })
})
