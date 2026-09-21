import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { cdp, userEvent } from 'vitest/browser'
import { createApp, h, nextTick } from 'vue'
import { XhBackTopRoot, XhBackTopTrigger } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

const THEMES = ['light', 'dark'] as const

let app: App | null = null
let host: HTMLElement | null = null
let scroller: HTMLDivElement | null = null
let scrollTop = 0
let scrollCalls: ScrollToOptions[] = []
let keyboardModality = false

function root(): HTMLElement {
  const element = document.querySelector<HTMLElement>('[data-scope=\'back-top\'][data-part=\'root\']')
  if (!element)
    throw new Error('找不到 back-top/root')
  return element
}

function trigger(): HTMLButtonElement {
  const element = document.querySelector<HTMLButtonElement>('[data-scope=\'back-top\'][data-part=\'trigger\']')
  if (!element)
    throw new Error('找不到 back-top/trigger')
  return element
}

async function settle(): Promise<void> {
  await nextTick()
  await new Promise(resolve => requestAnimationFrame(resolve))
  await nextTick()
}

async function finishMotion(): Promise<void> {
  for (const animation of document.getAnimations()) {
    try {
      animation.finish()
    }
    catch {}
  }
  await settle()
}

async function mount(): Promise<void> {
  host = document.createElement('div')
  // 用有明暗细节的画布确认触发器不是退回普通实体面；滚动行为仍由真实组件负责。
  host.style.cssText = 'min-block-size:240px;background:linear-gradient(135deg,var(--xh-bg-canvas),var(--xh-bg-subtle))'
  scroller = document.createElement('div')
  Object.defineProperty(scroller, 'scrollTop', {
    configurable: true,
    get: () => scrollTop,
    set: (value) => { scrollTop = Number(value) },
  })
  scroller.scrollTo = (options) => {
    if (typeof options === 'object')
      scrollCalls.push(options)
  }
  host.append(scroller)
  document.body.append(host)
  app = createApp({
    render: () => h(XhBackTopRoot, { target: scroller, visibilityHeight: 200 }, () => h(XhBackTopTrigger)),
  })
  app.mount(host)
  await settle()
  // 机器先接观察器再量值；这里模拟真实容器已经滚过阈值后的 scroll 事件。
  scrollTop = 240
  scroller.dispatchEvent(new Event('scroll'))
  await settle()
}

/** 在同一继承边界下解析令牌，避免把字面色值写进组件验收。 */
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
  await finishMotion()
}

afterEach(async () => {
  app?.unmount()
  host?.remove()
  app = null
  host = null
  scroller = null
  scrollTop = 0
  scrollCalls = []
  keyboardModality = false
  delete document.documentElement.dataset.theme
  delete document.documentElement.dataset.contrast
  await cdp().send('Emulation.setEmulatedMedia', { media: '', features: [] })
})

describe('back-top 的 M2 磨砂皮肤', () => {
  it('真实滚动监听仍按阈值露面，点击仍请求平滑回顶', async () => {
    await mount()

    expect(root().dataset.state).toBe('visible')
    trigger().click()
    expect(scrollCalls).toEqual([{ top: 0, behavior: 'smooth' }])
  })

  it.each(THEMES)('%s：默认触发器从 material.frosted 同源消费背景、边缘、高光、柔影与磨砂', async (theme) => {
    document.documentElement.dataset.theme = theme
    await mount()

    const element = trigger()
    const style = getComputedStyle(element)
    // 不传 variant 时连接层显式落 outline：描边 + 磨砂面的中性圆钮
    expect(root().getAttribute('data-variant')).toBe('outline')
    expect(element.getAttribute('data-xh-action-variant')).toBe('outline')
    // floating 档 md：48px 圆形，与 float-button 同档
    expect(element.getBoundingClientRect().width).toBe(48)
    expect(element.getBoundingClientRect().height).toBe(48)
    expect(style.backgroundColor).toBe(resolve(element, 'background-color', 'var(--xh-material-frosted-bg)'))
    expect(style.borderTopColor).toBe(resolve(element, 'border-top-color', 'var(--xh-material-frosted-border)'))
    expect(style.color).toBe(resolve(element, 'color', 'var(--xh-material-frosted-fg)'))
    expect(style.boxShadow).toBe(resolve(element, 'box-shadow', 'var(--xh-material-frosted-shadow)'))
    expect(style.backdropFilter).toBe(resolve(element, 'backdrop-filter', 'var(--xh-material-frosted-backdrop)'))
    expect(style.backgroundImage).toBe(resolve(element, 'background-image', 'linear-gradient(to bottom, var(--xh-material-frosted-highlight) 0 var(--xh-stroke-thin), transparent var(--xh-stroke-thin))'))
  })

  it.each(THEMES)('%s：键盘焦点铺配方的实体焦点面，公共焦点环不改几何', async (theme) => {
    document.documentElement.dataset.theme = theme
    await mount()

    const element = trigger()
    const before = element.getBoundingClientRect()
    await focus(element)
    const style = getComputedStyle(element)
    const after = element.getBoundingClientRect()
    expect(element.matches(':focus-visible')).toBe(true)
    expect(style.backgroundColor).toBe(resolve(element, 'background-color', 'var(--xh-material-frosted-focus-surface)'))
    expect(style.outlineColor).toBe(resolve(element, 'outline-color', 'var(--xh-ring-focus)'))
    expect(style.outlineStyle).toBe('solid')
    expect(after.width).toBe(before.width)
    expect(after.height).toBe(before.height)
  })

  it.each(THEMES)('%s：增强对比让磨砂实体化，边界、焦点与键盘环仍独立可见', async (theme) => {
    document.documentElement.dataset.theme = theme
    document.documentElement.dataset.contrast = 'more'
    await mount()

    const element = trigger()
    const rest = getComputedStyle(element)
    expect(alpha(rest.backgroundColor)).toBe(255)
    expect(rest.backdropFilter).toBe('none')
    // M2 在增强对比下只实体化并加强边界，浮层投影保留
    expect(rest.boxShadow).toBe(resolve(element, 'box-shadow', 'var(--xh-material-frosted-shadow)'))
    expect(rest.borderTopStyle).toBe('solid')
    await focus(element)
    const focused = getComputedStyle(element)
    expect(focused.outlineStyle).toBe('solid')
    expect(focused.outlineColor).toBe(resolve(element, 'outline-color', 'var(--xh-ring-focus)'))
  })

  it.each(THEMES)('%s：系统减少透明度时关闭 blur、实体化背景，保留 M2 浮层投影与实体焦点面', async (theme) => {
    await cdp().send('Emulation.setEmulatedMedia', {
      media: '',
      features: [{ name: 'prefers-reduced-transparency', value: 'reduce' }],
    })
    expect(matchMedia('(prefers-reduced-transparency: reduce)').matches).toBe(true)
    document.documentElement.dataset.theme = theme
    await mount()

    const element = trigger()
    const rest = getComputedStyle(element)
    expect(alpha(rest.backgroundColor)).toBe(255)
    expect(rest.backdropFilter).toBe('none')
    expect(rest.boxShadow).toBe(resolve(element, 'box-shadow', 'var(--xh-material-frosted-shadow)'))
    await focus(element)
    expect(getComputedStyle(element).backgroundColor)
      .toBe(resolve(element, 'background-color', 'var(--xh-material-frosted-focus-surface)'))
  })

  it('forced-colors：磨砂光学效果退出，触发器和键盘焦点仍由系统色可见呈现', async () => {
    await cdp().send('Emulation.setEmulatedMedia', {
      media: '',
      features: [{ name: 'forced-colors', value: 'active' }],
    })
    expect(matchMedia('(forced-colors: active)').matches).toBe(true)
    await mount()

    const element = trigger()
    const rest = getComputedStyle(element)
    expect(rest.getPropertyValue('--xh-material-frosted-bg').trim()).toBe('Canvas')
    expect(rest.getPropertyValue('--xh-material-frosted-fg').trim()).toBe('CanvasText')
    expect(rest.backdropFilter).toBe('none')
    expect(rest.boxShadow).toBe('none')
    expect(alpha(rest.backgroundColor)).toBe(255)
    await focus(element)
    const focused = getComputedStyle(element)
    expect(focused.outlineStyle).toBe('solid')
    expect(focused.outlineColor).not.toBe(focused.backgroundColor)
  })
})
