// Cascader 首次加载由 Content 自动装配一枚状态区；已有候选刷新时状态区让位，列保持可用。
import type { CascaderLevel, CascaderNode } from '@xihan-ui/headless'
import type { App, Ref } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick, ref } from 'vue'
import {
  XhCascaderColumn,
  XhCascaderContent,
  XhCascaderControl,
  XhCascaderItem,
  XhCascaderItemText,
  XhCascaderLoading,
  XhCascaderPositioner,
  XhCascaderRoot,
  XhCascaderTrigger,
  XhCascaderValueText,
} from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

async function settle(): Promise<void> {
  await nextTick()
  await nextTick()
  await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
}

function part(name: string): HTMLElement {
  const hit = document.querySelector<HTMLElement>(`[data-scope='cascader'][data-part='${name}']`)
  if (!hit)
    throw new Error(`找不到 cascader/${name}`)
  return hit
}

function colorAlpha(color: string): number {
  const canvas = document.createElement('canvas')
  canvas.width = 1
  canvas.height = 1
  const context = canvas.getContext('2d')!
  context.fillStyle = color
  context.fillRect(0, 0, 1, 1)
  return context.getImageData(0, 0, 1, 1).data[3]!
}

function paintsSurface(element: HTMLElement): boolean {
  if (element.hidden || getComputedStyle(element).display === 'none')
    return false
  const style = getComputedStyle(element)
  return colorAlpha(style.backgroundColor) > 0
    || Number.parseFloat(style.borderTopWidth) > 0
    || style.boxShadow !== 'none'
}

async function mountCascader(options: { authoredLoading?: boolean } = {}): Promise<{
  collection: Ref<CascaderNode[]>
  loading: Ref<boolean>
}> {
  const collection = ref<CascaderNode[]>([])
  const loading = ref(true)
  host = document.createElement('div')
  document.body.append(host)
  app = createApp({
    render: () => h(XhCascaderRoot, {
      collection: collection.value,
      loading: loading.value,
      open: true,
      translations: { loading: '正在读取地区' },
    }, {
      default: ({ levels }: { levels: CascaderLevel[] }) => [
        h(XhCascaderControl, null, () => [
          h(XhCascaderTrigger, null, () => h(XhCascaderValueText)),
        ]),
        h(XhCascaderPositioner, null, () => [
          h(XhCascaderContent, null, () => [
            ...levels.map(level => h(XhCascaderColumn, { key: level.level, level: level.level }, () =>
              level.items.map(node => h(XhCascaderItem, { key: node.value, value: node.value }, () =>
                h(XhCascaderItemText, null, () => node.label))))),
            ...(options.authoredLoading
              ? [h(XhCascaderLoading, { 'data-testid': 'author-loading' }, () => '作者正在同步')]
              : []),
          ]),
        ]),
      ],
    }),
  })
  app.mount(host)
  await settle()
  return { collection, loading }
}

afterEach(() => {
  app?.unmount()
  host?.remove()
  document.getElementById('xh-portal-root')?.remove()
  app = null
  host = null
})

describe('级联选择首次加载表面', () => {
  it('零候选时自动 Loading 填满有效状态区，只有 Content 绘制表面', async () => {
    await mountCascader()
    const content = part('content')
    const empty = part('empty')
    const loading = part('loading')

    expect(document.querySelectorAll(`[data-scope='cascader'][data-part='loading']`)).toHaveLength(1)
    expect(loading.textContent).toBe('正在读取地区')
    expect(loading.getAttribute('role')).toBe('status')
    expect(loading.hidden).toBe(false)
    expect(empty.hidden).toBe(true)
    expect(content.getAttribute('aria-busy')).toBe('true')
    expect(loading.getBoundingClientRect().height).toBeGreaterThan(0)
    expect([content, empty, loading].filter(paintsSurface)).toEqual([content])
  })

  it('候选到达但后台仍在刷新时隐藏 Loading，列和条目继续占据可用区域', async () => {
    const state = await mountCascader()
    state.collection.value = [{ value: 'zhejiang', label: '浙江' }]
    await settle()

    const loading = part('loading')
    const column = part('column')
    const item = part('item')
    expect(part('content').getAttribute('aria-busy')).toBe('true')
    expect(loading.hidden).toBe(true)
    expect(column.hidden).toBe(false)
    expect(item.hidden).toBe(false)
    expect(item.getBoundingClientRect().height).toBeGreaterThan(0)

    state.loading.value = false
    await settle()
    expect(part('content').hasAttribute('aria-busy')).toBe(false)
    expect(item.hidden).toBe(false)
  })

  it('作者显式 Loading 时不再追加默认节点，作者文案与单一表面均保留', async () => {
    await mountCascader({ authoredLoading: true })
    const loadings = document.querySelectorAll<HTMLElement>(`[data-scope='cascader'][data-part='loading']`)
    expect(loadings).toHaveLength(1)
    expect(loadings[0]!.dataset.testid).toBe('author-loading')
    expect(loadings[0]!.textContent).toBe('作者正在同步')
    expect([part('content'), part('empty'), loadings[0]!].filter(paintsSurface)).toEqual([part('content')])
  })
})
