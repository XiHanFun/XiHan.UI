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

async function mountCascader(options: { authoredLoading?: boolean, theme?: 'light' | 'dark' } = {}): Promise<{
  collection: Ref<CascaderNode[]>
  loading: Ref<boolean>
}> {
  const collection = ref<CascaderNode[]>([])
  const loading = ref(true)
  host = document.createElement('div')
  host.dataset.theme = options.theme ?? 'light'
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
  it.each(['light', 'dark'] as const)('%s：触发框实体、唯一状态面磨砂，增强对比度关闭透明光效', async (theme) => {
    await mountCascader({ theme })
    const control = getComputedStyle(part('control'))
    const content = part('content')
    const style = getComputedStyle(content)
    expect(colorAlpha(control.backgroundColor)).toBe(255)
    expect(control.backdropFilter).toBe('none')
    expect(style.backdropFilter).toContain('blur(16px)')
    expect(colorAlpha(style.backgroundColor)).toBeLessThan(255)
    expect(colorAlpha(style.backgroundColor)).toBeGreaterThan(220)
    expect(style.boxShadow).not.toBe('none')
    expect(colorAlpha(getComputedStyle(content, '::before').backgroundColor)).toBeGreaterThan(0)
    expect(getComputedStyle(content, '::before').pointerEvents).toBe('none')
    part('positioner').dataset.contrast = 'more'
    expect(getComputedStyle(content).backdropFilter).toBe('none')
    expect(colorAlpha(getComputedStyle(content).backgroundColor)).toBe(255)
    expect(colorAlpha(getComputedStyle(content, '::before').backgroundColor)).toBe(0)
  })

  it('加载与空态共用材质次要文字，视图切换不额外产生表面', async () => {
    const state = await mountCascader({ theme: 'dark' })
    const probe = document.createElement('span')
    probe.style.color = 'var(--xh-material-frosted-fg-muted)'
    part('content').append(probe)
    const muted = getComputedStyle(probe).color
    probe.remove()
    expect(getComputedStyle(part('loading')).color).toBe(muted)
    state.loading.value = false
    await settle()
    expect(getComputedStyle(part('empty')).color).toBe(muted)
    expect([part('content'), part('empty'), part('loading')].filter(paintsSurface)).toEqual([part('content')])
  })

  it('嵌套方向互不叠加，进出场无缩放且服从减弱动效通道', async () => {
    await mountCascader()
    const outer = part('positioner')
    outer.dataset.placement = 'bottom-start'
    const nested = document.createElement('div')
    nested.dataset.scope = 'cascader'
    nested.dataset.part = 'positioner'
    nested.dataset.placement = 'right-start'
    outer.append(nested)
    const nestedStyle = getComputedStyle(nested)
    expect(['up', 'down', 'left', 'right'].map(side =>
      nestedStyle.getPropertyValue(`--xh-_overlay-enter-${side}`).trim())).toEqual(['0', '0', '1', '0'])
    const content = part('content')
    expect(getComputedStyle(content).animationName).toBe('xh-overlay-slide-in')
    expect(getComputedStyle(content).scale).toBe('none')
    outer.dataset.motion = 'reduce'
    for (const state of ['open', 'closed']) {
      content.dataset.state = state
      const style = getComputedStyle(content)
      expect(style.animationName).toBe(`xh-overlay-slide-${state === 'open' ? 'in' : 'out'}`)
      expect(style.animationDuration).toBe('0.001s')
      expect(style.scale).toBe('none')
      expect(style.getPropertyValue('--xh-motion-distance-sm').trim()).toBe('0px')
    }
  })

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
    expect(getComputedStyle(item).animationName).toBe('xh-fade-in')
    expect(getComputedStyle(item).scale).toBe('none')

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
