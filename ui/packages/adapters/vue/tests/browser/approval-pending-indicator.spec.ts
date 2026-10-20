// 待决的呼吸点是图形，不是文字：颜色取非文字的警告色，不跟着警告文字色走，对承载面的对比度按非文字的 3:1 算。
// 没写语气时与 warning 语气同档；写了语气时取语气层给图形用的那一支（--xh-_tone-soft），六族在亮暗两态都要够 3:1。
import type { Tone } from '@xihan-ui/core'
import type { App } from 'vue'
import { colorParse } from '@xihan-ui/core/color'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h } from 'vue'
import { XhApprovalPendingIndicator, XhApprovalRoot, XhApprovalTitle } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

afterEach(() => {
  app?.unmount()
  app = null
  host?.remove()
  host = null
  delete document.documentElement.dataset.theme
})

const TONES: readonly Tone[] = ['brand', 'neutral', 'success', 'warning', 'danger', 'info']

function mount(tone?: Tone): void {
  host = document.createElement('div')
  document.body.append(host)
  app = createApp({
    setup: () => () => h(XhApprovalRoot, { tone }, () => [
      h(XhApprovalTitle, null, () => '要写文件'),
      h(XhApprovalPendingIndicator),
    ]),
  })
  app.mount(host)
}

function part(name: string): HTMLElement {
  const element = host?.querySelector<HTMLElement>(`[data-scope='approval'][data-part='${name}']`)
  if (!element)
    throw new Error(`找不到 ${name}`)
  return element
}

/** 把令牌放到 within 里解析成与 getComputedStyle 同格式的颜色值（私有槽要在声明它的节点里才解析得出）。 */
function resolveColor(token: string, within: HTMLElement = host!): string {
  const probe = document.createElement('span')
  probe.style.backgroundColor = `var(${token})`
  within.append(probe)
  const value = getComputedStyle(probe).backgroundColor
  probe.remove()
  return value
}

function luminance(color: string): number {
  const rgba = colorParse(color)
  if (!rgba)
    throw new Error(`解析不了的颜色 ${color}`)
  const channel = (v: number): number => {
    const c = v / 255
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * channel(rgba.r) + 0.7152 * channel(rgba.g) + 0.0722 * channel(rgba.b)
}

function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi! + 0.05) / (lo! + 0.05)
}

/** 圆点身后实际看得见的底：沿祖先往上找第一层不透明的背景，找不到就是页面画布。 */
function backdrop(el: HTMLElement): string {
  for (let node = el.parentElement; node; node = node.parentElement) {
    const bg = getComputedStyle(node).backgroundColor
    const rgba = colorParse(bg)
    if (rgba && rgba.a > 0)
      return bg
  }
  return resolveColor('--xh-bg-canvas')
}

describe('approval：待决呼吸点的颜色', () => {
  it.each([['light', '--xh-color-warning-700'], ['dark', '--xh-color-warning-600']] as const)('%s：没写语气时与 warning 语气同档（%s），不跟警告文字色，对承载面不低于 3:1', (theme, token) => {
    if (theme === 'dark')
      document.documentElement.dataset.theme = 'dark'
    mount('warning')
    const toned = getComputedStyle(part('pending-indicator')).backgroundColor
    app?.unmount()
    host?.remove()
    mount()
    const indicator = part('pending-indicator')
    const fill = getComputedStyle(indicator).backgroundColor
    expect(fill).toBe(resolveColor(token))
    expect(fill).toBe(toned)
    expect(fill).not.toBe(resolveColor('--xh-fg-warning'))
    expect(contrast(fill, backdrop(indicator))).toBeGreaterThanOrEqual(3)
  })

  it.each(['light', 'dark'] as const)('%s：写了语气时六族都取语气层的图形色，对承载面不低于 3:1', (theme) => {
    if (theme === 'dark')
      document.documentElement.dataset.theme = 'dark'
    for (const tone of TONES) {
      mount(tone)
      const indicator = part('pending-indicator')
      const fill = getComputedStyle(indicator).backgroundColor
      expect(getComputedStyle(part('root')).getPropertyValue('--xh-_tone-soft').trim(), tone).not.toBe('')
      expect(fill, tone).toBe(resolveColor('--xh-_tone-soft', part('root')))
      expect(contrast(fill, backdrop(indicator)), tone).toBeGreaterThanOrEqual(3)
      app?.unmount()
      host?.remove()
    }
  })
})
