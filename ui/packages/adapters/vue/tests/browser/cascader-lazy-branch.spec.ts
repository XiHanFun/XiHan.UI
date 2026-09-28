// 懒分支那一列：条目还没取回时列里只有一句次要文字，失败时下面跟一颗重试钮，取回后条目照常铺进来。
// 提示得真的在那一列里露面、居中、不撑破列；重试钮是 Action Control 家族的一颗文字钮，点它再取。
//
// 只有真实浏览器量得出来：谁在那一列里、盒子是否落在列的范围内、按钮的盒与指针手势都是布局与计算样式的结果。
import type { CascaderApi, CascaderNode } from '@xihan-ui/headless'
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import {
  XhCascaderColumn,
  XhCascaderContent,
  XhCascaderControl,
  XhCascaderItem,
  XhCascaderPositioner,
  XhCascaderRoot,
  XhCascaderTrigger,
} from '../../src'
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

const REGIONS: CascaderNode[] = [
  { value: 'zhejiang', label: '浙江', hasChildren: true },
  { value: 'macau', label: '澳门' },
]
const CITIES: CascaderNode[] = [
  { value: 'hangzhou', label: '杭州' },
  { value: 'ningbo', label: '宁波' },
]

interface Pending { resolve: (children: CascaderNode[]) => void, reject: (error: unknown) => void }

async function mount(): Promise<Pending[]> {
  const calls: Pending[] = []
  host = document.createElement('div')
  document.body.append(host)
  app = createApp({
    render: () => h(XhCascaderRoot, {
      collection: REGIONS,
      defaultOpen: true,
      loadChildren: () => new Promise<CascaderNode[]>((resolve, reject) => calls.push({ resolve, reject })),
    }, {
      default: ({ levels }: Pick<CascaderApi, 'levels'>) => [
        h(XhCascaderControl, null, () => h(XhCascaderTrigger, null, () => '选择地区')),
        h(XhCascaderPositioner, null, () => h(XhCascaderContent, null, () => levels.map(level =>
          h(XhCascaderColumn, { key: level.level, level: level.level }, () => level.items.map(node =>
            h(XhCascaderItem, { key: node.value, value: node.value }, () => node.label)))))),
      ],
    }),
  })
  app.mount(host)
  await nextTick()
  await expect.poll(() => part('content').getBoundingClientRect().height).toBeGreaterThan(0)
  return calls
}

function part(name: string): HTMLElement {
  const el = document.querySelector<HTMLElement>(`[data-scope='cascader'][data-part='${name}']`)
  if (!el)
    throw new Error(`缺少级联部件：${name}`)
  return el
}

function column(level: number): HTMLElement {
  return document.querySelector<HTMLElement>(`[data-scope='cascader'][data-part='column'][data-level='${level}']`)!
}

function inside(inner: DOMRect, outer: DOMRect): boolean {
  return inner.left >= outer.left - 0.5 && inner.right <= outer.right + 0.5 && inner.top >= outer.top - 0.5 && inner.bottom <= outer.bottom + 0.5
}

describe('级联懒分支那一列', () => {
  it('在途：右边那一列露面，列里一句提示落在列内；失败换成提示加重试钮，点重试钮再取，取回后条目铺进来', async () => {
    const calls = await mount()
    document.querySelector<HTMLElement>(`[data-scope='cascader'][data-part='item'][data-value='zhejiang']`)!.click()
    await expect.poll(() => calls.length).toBe(1)
    await nextTick()

    const loading = part('branch-loading')
    expect(column(1).contains(loading)).toBe(true)
    expect(getComputedStyle(loading).display).not.toBe('none')
    expect(loading.getBoundingClientRect().height).toBeGreaterThan(0)
    expect(inside(loading.getBoundingClientRect(), column(1).getBoundingClientRect())).toBe(true)
    expect(getComputedStyle(part('branch-retry-trigger')).display).toBe('none')

    calls[0]!.reject(new Error('offline'))
    await expect.poll(() => getComputedStyle(part('branch-error')).display).not.toBe('none')
    expect(getComputedStyle(loading).display).toBe('none')
    const retry = part('branch-retry-trigger')
    expect(getComputedStyle(retry).display).not.toBe('none')
    expect(getComputedStyle(retry).cursor).toBe('pointer')
    expect(inside(retry.getBoundingClientRect(), column(1).getBoundingClientRect())).toBe(true)

    retry.click()
    await expect.poll(() => calls.length).toBe(2)
    await expect.poll(() => getComputedStyle(part('branch-loading')).display).not.toBe('none')
    calls[1]!.resolve(CITIES)
    await expect.poll(() => [...column(1).querySelectorAll<HTMLElement>(`[data-part='item']:not([hidden])`)].map(el => el.textContent)).toEqual(['杭州', '宁波'])
    expect(getComputedStyle(part('branch-loading')).display).toBe('none')
    expect(getComputedStyle(part('branch-error')).display).toBe('none')
  })
})
