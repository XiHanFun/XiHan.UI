import type { App } from 'vue'
import { cdp, userEvent } from '@vitest/browser/context'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import {
  XhFloatingPanelBody,
  XhFloatingPanelCloseTrigger,
  XhFloatingPanelContent,
  XhFloatingPanelHeader,
  XhFloatingPanelPositioner,
  XhFloatingPanelRoot,
  XhFloatingPanelTitle,
  XhFloatingPanelWindowStateTrigger,
} from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

const THEMES = ['light', 'dark'] as const

let app: App | null = null
let host: HTMLElement | null = null
let keyboardModality = false

function part(name: string): HTMLElement {
  const element = document.querySelector<HTMLElement>(`[data-scope='floating-panel'][data-part='${name}']`)
  if (!element)
    throw new Error(`找不到 floating-panel/${name}`)
  return element
}

async function settle(): Promise<void> {
  await nextTick()
  await new Promise(resolve => requestAnimationFrame(resolve))
  await nextTick()
}

async function mount(): Promise<void> {
  host = document.createElement('div')
  host.style.cssText = 'min-block-size:240px;background:linear-gradient(135deg,var(--xh-bg-canvas),var(--xh-bg-subtle))'
  document.body.append(host)
  app = createApp({
    render: () => h(XhFloatingPanelRoot, { defaultOpen: true }, () => [
      h(XhFloatingPanelPositioner, null, () => [
        h(XhFloatingPanelContent, null, () => [
          h(XhFloatingPanelHeader, null, () => [
            h(XhFloatingPanelTitle, null, () => '调试面板'),
            h(XhFloatingPanelWindowStateTrigger, { windowState: 'minimized' }),
            h(XhFloatingPanelCloseTrigger),
          ]),
          h(XhFloatingPanelBody, null, () => '可持续查看的辅助信息。'),
        ]),
      ]),
    ]),
  })
  app.mount(host)
  await settle()
}

/** 在同一继承边界下解析令牌，避免把配方字面色值复制进组件验收。 */
function resolve(element: HTMLElement, property: string, value: string): string {
  const probe = document.createElement('span')
  probe.style.setProperty(property, value)
  element.append(probe)
  const resolved = getComputedStyle(probe).getPropertyValue(property)
  probe.remove()
  return resolved
}

function alpha(color: string): number {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = 1
  const context = canvas.getContext('2d')!
  context.fillStyle = color
  context.fillRect(0, 0, 1, 1)
  return context.getImageData(0, 0, 1, 1).data[3]!
}

/** 先以真实按键进入键盘模态，程序化聚焦才会命中 :focus-visible。 */
async function focus(element: HTMLElement): Promise<void> {
  if (!keyboardModality) {
    await userEvent.keyboard('{Tab}')
    keyboardModality = true
  }
  element.focus()
  await settle()
}

afterEach(async () => {
  app?.unmount()
  host?.remove()
  app = null
  host = null
  keyboardModality = false
  document.body.innerHTML = ''
  delete document.documentElement.dataset.theme
  delete document.documentElement.dataset.contrast
  await cdp().send('Emulation.setEmulatedMedia', { media: '', features: [] })
})

describe('floating-panel 的 M3 桌面玻璃皮肤', () => {
  it.each(THEMES)('%s：内容面、标题栏和操作文本消费同一张玻璃配方', async (theme) => {
    document.documentElement.dataset.theme = theme
    await mount()

    const content = part('content')
    const header = part('header')
    const action = part('close-trigger')
    const style = getComputedStyle(content)
    expect(style.backgroundColor).toBe(resolve(content, 'background-color', 'var(--xh-material-glass-bg)'))
    expect(style.backgroundImage).toContain(resolve(content, 'background-image', 'linear-gradient(to bottom, var(--xh-material-glass-highlight) 0 var(--xh-stroke-thin), transparent var(--xh-stroke-thin))'))
    expect(style.borderTopColor).toBe(resolve(content, 'border-top-color', 'var(--xh-material-glass-border)'))
    expect(style.color).toBe(resolve(content, 'color', 'var(--xh-material-glass-fg)'))
    expect(style.boxShadow).toBe(resolve(content, 'box-shadow', 'var(--xh-material-glass-shadow)'))
    expect(style.backdropFilter).toBe(resolve(content, 'backdrop-filter', 'var(--xh-material-glass-backdrop)'))
    expect(getComputedStyle(header).backgroundColor).toBe(resolve(header, 'background-color', 'var(--xh-material-glass-bg)'))
    expect(getComputedStyle(header).borderBottomColor).toBe(resolve(header, 'border-bottom-color', 'var(--xh-material-glass-separator)'))
    expect(getComputedStyle(action).color).toBe(resolve(action, 'color', 'var(--xh-material-glass-fg-muted)'))
  })

  it.each(THEMES)('%s：标题栏按钮键盘聚焦先铺实体隔离底，几何不变', async (theme) => {
    document.documentElement.dataset.theme = theme
    await mount()

    const action = part('close-trigger')
    const before = getComputedStyle(action)
    const width = before.width
    const height = before.height
    await focus(action)
    const style = getComputedStyle(action)
    expect(action.matches(':focus-visible')).toBe(true)
    expect(style.backgroundColor).toBe(resolve(action, 'background-color', 'var(--xh-material-glass-focus-surface)'))
    expect(style.outlineStyle).toBe('solid')
    expect(style.width).toBe(width)
    expect(style.height).toBe(height)
  })

  it.each(THEMES)('%s：高对比度原位改为实体表面，边缘与键盘焦点仍可见', async (theme) => {
    document.documentElement.dataset.theme = theme
    document.documentElement.dataset.contrast = 'more'
    await mount()

    const content = part('content')
    const rest = getComputedStyle(content)
    expect(alpha(rest.backgroundColor)).toBe(255)
    expect(rest.backdropFilter).toBe('none')
    expect(rest.boxShadow).toBe('none')
    expect(rest.borderTopStyle).toBe('solid')
    await focus(part('window-state-trigger'))
    expect(getComputedStyle(part('window-state-trigger')).outlineStyle).toBe('solid')
  })

  it('减少透明度：令牌关闭光学采样，保留原有 M3 深度与实体表面', async () => {
    await cdp().send('Emulation.setEmulatedMedia', {
      media: '',
      features: [{ name: 'prefers-reduced-transparency', value: 'reduce' }],
    })
    expect(matchMedia('(prefers-reduced-transparency: reduce)').matches).toBe(true)
    await mount()

    const content = part('content')
    const style = getComputedStyle(content)
    expect(alpha(style.backgroundColor)).toBe(255)
    expect(style.backdropFilter).toBe('none')
    expect(style.boxShadow).toBe(resolve(content, 'box-shadow', 'var(--xh-material-glass-shadow)'))
    expect(style.borderTopWidth).toBe('1px')
  })

  it('强制色：令牌取消光学效果与投影，系统色仍保留实体边界', async () => {
    await cdp().send('Emulation.setEmulatedMedia', {
      media: '',
      features: [{ name: 'forced-colors', value: 'active' }],
    })
    expect(matchMedia('(forced-colors: active)').matches).toBe(true)
    await mount()

    const style = getComputedStyle(part('content'))
    expect(style.getPropertyValue('--xh-material-glass-bg').trim()).toBe('Canvas')
    expect(style.getPropertyValue('--xh-material-glass-fg').trim()).toBe('CanvasText')
    expect(alpha(style.backgroundColor)).toBe(255)
    expect(style.backgroundImage).toBe('none')
    expect(style.backdropFilter).toBe('none')
    expect(style.boxShadow).toBe('none')
    expect(style.borderTopWidth).toBe('1px')
  })

  it('打印：令牌取消玻璃滤镜与投影，面板仍保留实体结构', async () => {
    await cdp().send('Emulation.setEmulatedMedia', { media: 'print', features: [] })
    await mount()

    const style = getComputedStyle(part('content'))
    expect(alpha(style.backgroundColor)).toBe(255)
    expect(style.backdropFilter).toBe('none')
    expect(style.boxShadow).toBe('none')
    expect(style.borderTopWidth).toBe('1px')
  })
})
