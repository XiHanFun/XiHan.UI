// 粗指针下数字输入的两颗增减钮：横排在末端、常显，命中区由家族伪元素外扩。要开触屏仿真，单独成份：
// Linux 无头 Chromium 关过一次触屏仿真，同一页面的 (hover) / (pointer) 就再也回不到精细指针，
// 精细指针下的叠放钮在 number-field-control-detail.spec.ts。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { cdp } from 'vitest/browser'
import { createApp, h, nextTick } from 'vue'
import {
  XhNumberFieldControl,
  XhNumberFieldDecrementTrigger,
  XhNumberFieldIncrementTrigger,
  XhNumberFieldInput,
  XhNumberFieldRoot,
} from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

function mountField(density: 'comfortable' | 'compact', width: number): void {
  host = document.createElement('div')
  host.style.inlineSize = `${width}px`
  if (density === 'compact')
    host.dataset.density = 'compact'
  document.body.append(host)
  app = createApp({
    render: () => h(XhNumberFieldRoot, { defaultValue: '5' }, () => [
      h(XhNumberFieldControl, null, () => [
        h(XhNumberFieldDecrementTrigger),
        h(XhNumberFieldInput),
        h(XhNumberFieldIncrementTrigger),
      ]),
    ]),
  })
  app.mount(host)
}

async function settle(): Promise<void> {
  await nextTick()
  await nextTick()
  await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
}

function part(name: string): HTMLElement {
  const element = document.querySelector<HTMLElement>(`[data-scope='number-field'][data-part='${name}']`)
  if (!element)
    throw new Error(`找不到 number-field/${name}`)
  return element
}

function centerY(element: HTMLElement): number {
  const rect = element.getBoundingClientRect()
  return rect.top + rect.height / 2
}

/** 令牌在某个容器里的像素值：放进探针的 inline-size 读回计算值。 */
function px(token: string, within: HTMLElement): number {
  const probe = document.createElement('span')
  probe.style.setProperty('inline-size', `var(${token})`)
  within.append(probe)
  const out = Number.parseFloat(getComputedStyle(probe).inlineSize)
  probe.remove()
  return out
}

afterEach(async () => {
  app?.unmount()
  host?.remove()
  app = null
  host = null
  await cdp().send('Emulation.setTouchEmulationEnabled', { enabled: false, maxTouchPoints: 1 })
})

describe('数字输入的粗指针目标', () => {
  it.each(['comfortable', 'compact'] as const)('%s：两颗 field-inset 正方钮横排在末端、常显，视觉盒不放大，各自由家族伪元素外扩到 44px 命中区', async (density) => {
    await cdp().send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 })
    expect(matchMedia('(pointer: coarse)').matches).toBe(true)
    mountField(density, 160)
    await settle()
    const controlEl = part('control')
    const control = controlEl.getBoundingClientRect()
    const decrement = part('decrement-trigger').getBoundingClientRect()
    const input = part('input').getBoundingClientRect()
    const increment = part('increment-trigger').getBoundingClientRect()
    const trigger = px('--xh-control-h-sm', controlEl)

    expect(control.height).toBe(px('--xh-control-h-md', controlEl))
    expect(decrement.width).toBe(trigger)
    expect(increment.width).toBe(trigger)
    expect(decrement.height).toBe(trigger)
    expect(getComputedStyle(part('increment-trigger')).visibility).toBe('visible')
    expect(centerY(part('increment-trigger'))).toBeCloseTo(centerY(controlEl), 1)
    expect(input.width).toBeGreaterThan(0)
    expect(input.right).toBeLessThanOrEqual(decrement.left)
    expect(decrement.right).toBeLessThanOrEqual(increment.left)
    for (const name of ['decrement-trigger', 'increment-trigger']) {
      const target = getComputedStyle(part(name), '::after')
      expect(target.content).toBe('""')
      expect(Number.parseFloat(target.minInlineSize)).toBeGreaterThanOrEqual(44)
      expect(Number.parseFloat(target.minBlockSize)).toBeGreaterThanOrEqual(44)
    }
    // 热区伪元素不能被视觉盒裁掉，否则外扩只是纸面上的
    expect(getComputedStyle(controlEl).overflow).toBe('visible')
  })
})
