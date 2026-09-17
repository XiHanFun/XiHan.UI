import type { App } from 'vue'
import { cdp, userEvent } from '@vitest/browser/context'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import { XhFloatButtonList, XhFloatButtonRoot, XhFloatButtonTrigger } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

const THEMES = ['light', 'dark'] as const

let app: App | null = null
let host: HTMLElement | null = null
let keyboardModality = false

function trigger(): HTMLButtonElement {
  const element = document.querySelector<HTMLButtonElement>('[data-scope=\'float-button\'][data-part=\'trigger\']')
  if (!element)
    throw new Error('找不到 float-button/trigger')
  return element
}

function action(): HTMLButtonElement {
  const element = document.querySelector<HTMLButtonElement>('[data-scope=\'float-button\'][data-part=\'list\'] > button')
  if (!element)
    throw new Error('找不到 float-button 原生动作项')
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
  // 用有明暗细节的画布确认触发器不是退回普通实体面；定位行为仍由真实组件负责。
  host.style.cssText = 'min-block-size:240px;background:linear-gradient(135deg,var(--xh-bg-canvas),var(--xh-bg-subtle))'
  document.body.append(host)
  app = createApp({
    render: () => h(XhFloatButtonRoot, null, () => [
      h(XhFloatButtonTrigger, null, () => '＋'),
      h(XhFloatButtonList, null, () => h('button', { type: 'button' }, '编辑')),
    ]),
  })
  app.mount(host)
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
  keyboardModality = false
  delete document.documentElement.dataset.theme
  delete document.documentElement.dataset.contrast
  await cdp().send('Emulation.setEmulatedMedia', { media: '', features: [] })
})

describe('float-button 的 M2 磨砂皮肤', () => {
  it.each(THEMES)('%s：默认触发器从 material.frosted 同源消费背景、边缘、高光、柔影与磨砂', async (theme) => {
    document.documentElement.dataset.theme = theme
    await mount()

    const element = trigger()
    const style = getComputedStyle(element)
    // 不传 variant 时连接层显式落 outline：描边 + 磨砂面的中性圆钮
    expect(element.closest('[data-part=\'root\']')!.getAttribute('data-variant')).toBe('outline')
    expect(element.getAttribute('data-xh-action-variant')).toBe('outline')
    // floating 档 md：48px 圆形
    expect(element.getBoundingClientRect().width).toBe(48)
    expect(element.getBoundingClientRect().height).toBe(48)
    expect(style.backgroundColor).toBe(resolve(element, 'background-color', 'var(--xh-material-frosted-bg)'))
    expect(style.borderTopColor).toBe(resolve(element, 'border-top-color', 'var(--xh-material-frosted-border)'))
    expect(style.color).toBe(resolve(element, 'color', 'var(--xh-material-frosted-fg)'))
    expect(style.boxShadow).toBe(resolve(element, 'box-shadow', 'var(--xh-material-frosted-shadow)'))
    expect(style.backdropFilter).toBe(resolve(element, 'backdrop-filter', 'var(--xh-material-frosted-backdrop)'))
    expect(style.backgroundImage).toBe(resolve(element, 'background-image', 'linear-gradient(to bottom, var(--xh-material-frosted-highlight) 0 var(--xh-stroke-thin), transparent var(--xh-stroke-thin))'))
  })

  it.each(THEMES)('%s：原生动作项与触发器共享磨砂面、尺寸和键盘焦点', async (theme) => {
    document.documentElement.dataset.theme = theme
    await mount()
    await userEvent.click(trigger())
    await finishMotion()
    await userEvent.hover(document.querySelector<HTMLElement>('[data-test-park-pointer]')!)
    await finishMotion()

    const item = action()
    const itemStyle = getComputedStyle(item)
    const triggerStyle = getComputedStyle(trigger())
    expect(item.getBoundingClientRect().width).toBeCloseTo(trigger().getBoundingClientRect().width, 4)
    expect(item.getBoundingClientRect().height).toBeCloseTo(trigger().getBoundingClientRect().height, 4)
    expect(itemStyle.backgroundColor).toBe(triggerStyle.backgroundColor)
    expect(itemStyle.borderTopColor).toBe(triggerStyle.borderTopColor)
    expect(itemStyle.borderRadius).toBe(triggerStyle.borderRadius)
    expect(itemStyle.boxShadow).toBe(triggerStyle.boxShadow)
    expect(itemStyle.backdropFilter).toBe(triggerStyle.backdropFilter)

    await focus(item)
    expect(item.matches(':focus-visible')).toBe(true)
    expect(getComputedStyle(item).outlineStyle).toBe('solid')
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
