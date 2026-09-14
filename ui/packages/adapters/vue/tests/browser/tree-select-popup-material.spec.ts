import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { createApp, h, nextTick } from 'vue'
import {
  XhTreeSelectContent,
  XhTreeSelectControl,
  XhTreeSelectEmpty,
  XhTreeSelectFooter,
  XhTreeSelectItem,
  XhTreeSelectLoading,
  XhTreeSelectPositioner,
  XhTreeSelectRoot,
  XhTreeSelectTree,
  XhTreeSelectTrigger,
} from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

function part(name: string): HTMLElement {
  const element = document.querySelector<HTMLElement>(`[data-scope='tree-select'][data-part='${name}']`)
  if (!element)
    throw new Error(`缺少树选择部件：${name}`)
  return element
}

function alpha(color: string): number {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = 1
  const context = canvas.getContext('2d')!
  context.fillStyle = color
  context.fillRect(0, 0, 1, 1)
  return context.getImageData(0, 0, 1, 1).data[3]!
}

async function mount(theme: 'light' | 'dark', empty = false, loading = false): Promise<void> {
  host = document.createElement('div')
  host.dataset.theme = theme
  document.body.append(host)
  app = createApp({ render: () => h(XhTreeSelectRoot, {
    collection: empty ? [] : [{ value: 'one', label: '设计团队' }],
    loading,
    defaultOpen: true,
  }, () => [
    h(XhTreeSelectControl, null, () => h(XhTreeSelectTrigger, null, () => '选择团队')),
    h(XhTreeSelectPositioner, null, () => h(XhTreeSelectContent, null, () => [
      h(XhTreeSelectTree, null, () => empty ? [] : [h(XhTreeSelectItem, { value: 'one' }, () => '设计团队')]),
      h(XhTreeSelectEmpty, null, () => '没有可选项'),
      h(XhTreeSelectLoading, null, () => '加载中'),
      h(XhTreeSelectFooter, null, () => '团队说明'),
    ])),
  ]) })
  app.mount(host)
  await nextTick()
  await nextTick()
  await expect.poll(() => part('content').getBoundingClientRect().width).toBeGreaterThan(0)
}

afterEach(() => {
  app?.unmount()
  host?.remove()
  app = null
  host = null
})

describe('树选择 M2 浮层', () => {
  it.each(['light', 'dark'] as const)('%s：实体输入与单一磨砂浮层分层，局部主题跨 Portal 生效', async (theme) => {
    await mount(theme)
    const control = getComputedStyle(part('control'))
    const content = getComputedStyle(part('content'))
    expect(control.backdropFilter).toBe('none')
    expect(alpha(control.backgroundColor)).toBe(255)
    expect(part('positioner').closest<HTMLElement>('[data-theme]')?.dataset.theme).toBe(theme)
    expect(content.backdropFilter).toContain('blur(16px)')
    expect(alpha(content.backgroundColor)).toBeLessThan(255)
    expect(alpha(content.backgroundColor)).toBeGreaterThan(220)
    expect(content.boxShadow).not.toBe('none')
    const highlight = getComputedStyle(part('content'), '::before')
    expect(alpha(highlight.backgroundColor)).toBeGreaterThan(0)
    expect(highlight.pointerEvents).toBe('none')
    const tree = getComputedStyle(part('tree'))
    expect(tree.backdropFilter).toBe('none')
    expect(tree.borderTopWidth).toBe('0px')
    expect(alpha(tree.backgroundColor)).toBe(0)
  })

  it.each(['light', 'dark'] as const)('%s：增强对比度使用实体表面与清晰边界', async (theme) => {
    await mount(theme)
    part('positioner').dataset.contrast = 'more'
    const content = getComputedStyle(part('content'))
    expect(content.backdropFilter).toBe('none')
    expect(alpha(content.backgroundColor)).toBe(255)
    expect(content.borderTopStyle).toBe('solid')
    expect(alpha(getComputedStyle(part('content'), '::before').backgroundColor)).toBe(0)
  })

  it.each([false, true])('loading=%s：状态面仅承载文字，不新增边框或滤镜', async (loading) => {
    await mount('dark', true, loading)
    const status = part(loading ? 'loading' : 'empty')
    expect(status.hidden).toBe(false)
    expect(status.textContent?.trim()).not.toBe('')
    expect(part(loading ? 'empty' : 'loading').hidden).toBe(true)
    const style = getComputedStyle(status)
    expect(style.borderTopWidth).toBe('0px')
    expect(style.boxShadow).toBe('none')
    expect(style.backdropFilter).toBe('none')
    const expected = document.createElement('span')
    expected.style.color = 'var(--xh-material-frosted-fg-muted)'
    part('content').append(expected)
    expect(style.color).toBe(getComputedStyle(expected).color)
    expect(getComputedStyle(part('footer')).color).toBe(getComputedStyle(expected).color)
    expected.remove()
  })

  it('可用空间小于锚点和静态下界时，面板仍能收窄', async () => {
    await mount('light')
    const content = part('content')
    // 固定定位引擎输出，隔离 CSS 的 min/max 优先级；不依赖窗口尺寸和浮层重新定位相位。
    content.style.setProperty('--xh-_tree-select-available-w', '160px')
    content.style.setProperty('--xh-_tree-select-anchor-w', '360px')
    content.style.animation = 'none'
    expect(content.getBoundingClientRect().width).toBeLessThanOrEqual(160)
  })

  it('四向短位移不缩放，嵌套层不继承父层方向', async () => {
    await mount('light')
    const outer = part('positioner')
    const inner = document.createElement('div')
    inner.dataset.scope = 'tree-select'
    inner.dataset.part = 'positioner'
    outer.dataset.placement = 'bottom-start'
    outer.append(inner)
    const sides = ['up', 'down', 'left', 'right']
    for (const [placement, expected] of [
      ['top-start', ['0', '1', '0', '0']],
      ['bottom-start', ['1', '0', '0', '0']],
      ['left-start', ['0', '0', '0', '1']],
      ['right-start', ['0', '0', '1', '0']],
    ] as const) {
      inner.dataset.placement = placement
      const style = getComputedStyle(inner)
      expect(sides.map(side => style.getPropertyValue(`--xh-_overlay-enter-${side}`).trim())).toEqual(expected)
    }
    const content = part('content')
    expect(getComputedStyle(content).animationName).toBe('xh-overlay-slide-in')
    expect(getComputedStyle(content).scale).toBe('none')
    content.dataset.state = 'closed'
    expect(getComputedStyle(content).animationName).toBe('xh-overlay-slide-out')
    expect(getComputedStyle(content).scale).toBe('none')
  })

  it('减弱动效沿用令牌通道，进出场缩至 1ms 且没有空间位移', async () => {
    await mount('light')
    part('positioner').dataset.motion = 'reduce'
    const content = part('content')
    for (const state of ['open', 'closed']) {
      content.dataset.state = state
      const style = getComputedStyle(content)
      expect(style.animationDuration).toBe('0.001s')
      expect(style.getPropertyValue('--xh-motion-distance-sm').trim()).toBe('0px')
      expect(style.scale).toBe('none')
    }
  })

  it('增加磨砂后仍由 content 滚动，Esc 关闭并归还触发器焦点', async () => {
    await mount('light')
    const content = part('content')
    content.style.setProperty('--xh-tree-select-content-max-h', '100px')
    part('tree').style.minBlockSize = '400px'
    expect(content.scrollHeight).toBeGreaterThan(content.clientHeight)
    content.scrollTop = 80
    expect(content.scrollTop).toBe(80)
    part('item').focus()
    await userEvent.keyboard('{Escape}')
    await expect.poll(() => content.getBoundingClientRect().height).toBe(0)
    expect(document.activeElement).toBe(part('trigger'))
  })
})
