// 密码强度条：填充铺满轨道、按档位比例平移，由轨道裁掉未完成的那一截（数值角色 move / continuous），
// 不改 inline-size；换档时底色走 micro 淡变；rtl 下从行首（右侧）长出。
import type { App, Ref } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick, ref } from 'vue'
import {
  XhPasswordInputControl,
  XhPasswordInputInput,
  XhPasswordInputRoot,
  XhPasswordInputStrengthMeter,
} from '../../src'
import { pseudoBox } from './pseudo-box'
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

async function mount(strength: Ref<number>, dir: 'ltr' | 'rtl'): Promise<HTMLElement> {
  host = document.createElement('div')
  host.dir = dir
  host.style.inlineSize = '320px'
  document.body.append(host)
  app = createApp({
    render: () => h(XhPasswordInputRoot, { strength: strength.value }, () => [
      h(XhPasswordInputControl, null, () => [h(XhPasswordInputInput)]),
      h(XhPasswordInputStrengthMeter),
    ]),
  })
  app.mount(host)
  await nextTick()
  return host.querySelector<HTMLElement>(`[data-part='strength-meter']`)!
}

function resolve(property: string, value: string): string {
  const probe = document.createElement('div')
  probe.style.setProperty(property, value)
  host!.append(probe)
  const out = getComputedStyle(probe).getPropertyValue(property)
  probe.remove()
  return out
}

function channel(el: HTMLElement, property: string): { duration: string, easing: string } {
  const style = getComputedStyle(el, '::before')
  const index = style.transitionProperty.split(', ').indexOf(property)
  expect(index, `填充要过渡 ${property}`).toBeGreaterThanOrEqual(0)
  const easings = style.transitionTimingFunction.match(/(?:cubic-bezier|linear|steps)\([^)]*\)|[a-z-]+/g)!
  return { duration: style.transitionDuration.split(', ')[index]!, easing: easings[index]! }
}

function finish(): void {
  for (const animation of document.getAnimations())
    animation.finish()
}

describe('密码强度条', () => {
  it.each(['ltr', 'rtl'] as const)('%s：填充铺满轨道、按档位平移，行首起长', async (dir) => {
    const strength = ref(1)
    const meter = await mount(strength, dir)
    const track = meter.getBoundingClientRect()
    for (const [level, ratio] of [[1, 0.25], [2, 0.5], [3, 0.75], [4, 1]] as const) {
      strength.value = level
      await nextTick()
      finish()
      const fill = pseudoBox(meter, '::before')
      // 不改宽度：填充恒为轨道全宽
      expect(fill.width).toBeCloseTo(track.width, 0)
      // 露在轨道里的那一截从行首起、占档位的比例
      const visibleStart = dir === 'ltr' ? track.left : track.right - ratio * track.width
      const visibleEnd = dir === 'ltr' ? track.left + ratio * track.width : track.right
      const start = Math.max(fill.x, track.left)
      const end = Math.min(fill.x + fill.width, track.right)
      expect(start, `${dir} 档 ${level} 起点`).toBeCloseTo(visibleStart, 0)
      expect(end, `${dir} 档 ${level} 终点`).toBeCloseTo(visibleEnd, 0)
    }
  })

  it('换档时位移走 move / continuous，底色走 micro 淡变', async () => {
    const strength = ref(1)
    const meter = await mount(strength, 'ltr')
    expect(channel(meter, 'translate')).toEqual({
      duration: resolve('transition-duration', 'var(--xh-motion-duration-move)'),
      easing: resolve('transition-timing-function', 'var(--xh-motion-ease-continuous)'),
    })
    expect(channel(meter, 'background-color').duration).toBe(resolve('transition-duration', 'var(--xh-motion-duration-micro)'))

    strength.value = 3
    await nextTick()
    const running = meter.getAnimations({ subtree: true }).map(animation => (animation as CSSTransition).transitionProperty)
    expect(running).toEqual(expect.arrayContaining(['translate', 'background-color']))
  })
})
