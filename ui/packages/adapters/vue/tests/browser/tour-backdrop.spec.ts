// 遮罩让位只能在真实浏览器里验：判据是计算后的背景色与 Spotlight 阴影槽。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick, ref } from 'vue'
import {
  XhTourBackdrop,
  XhTourContent,
  XhTourPositioner,
  XhTourRoot,
  XhTourSpotlight,
  XhTourTitle,
} from '../../src'
// 皮肤要一起加载：这里查的就是皮肤给出的背景色
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

const TRANSPARENT = 'rgba(0, 0, 0, 0)'

let app: App | null = null
let host: HTMLElement | null = null

afterEach(() => {
  app?.unmount()
  app = null
  host?.remove()
  host = null
  document.body.innerHTML = ''
})

/** 挂一份两步引导：首步锚定页面上的真实元素，末步不锚定。返回控制步序的 ref。 */
function mountTour(showBackdrop = true): { step: { value: number } } {
  const step = ref(0)
  host = document.createElement('div')
  host.innerHTML = '<button id="tour-backdrop-target">目标</button>'
  document.body.append(host)
  app = createApp({
    setup: () => () => h(XhTourRoot, {
      'open': true,
      'showBackdrop': showBackdrop,
      'value': step.value,
      'steps': [
        { id: 'a', target: '#tour-backdrop-target', title: '锚定步' },
        { id: 'b', target: null, title: '居中步' },
      ],
      'onUpdate:value': (next: number) => { step.value = next },
    }, {
      default: () => [
        h(XhTourBackdrop),
        h(XhTourSpotlight),
        h(XhTourPositioner, null, () => [h(XhTourContent, null, () => [h(XhTourTitle)])]),
      ],
    }),
  })
  app.mount(host)
  return { step }
}

function part(name: string): HTMLElement {
  const el = document.querySelector<HTMLElement>(`[data-scope='tour'][data-part='${name}']`)
  if (!el)
    throw new Error(`tour 的 ${name} 不在文档里`)
  return el
}

/** 等两拍：定位与量测的效应是 flush: 'post'，要等渲染队列排空之后才跑。 */
async function settle(): Promise<void> {
  await nextTick()
  await nextTick()
}

describe('tour 遮罩让位', () => {
  it('锚定步：高亮框自带那圈暗幕，遮罩必须让位成透明', async () => {
    mountTour()
    await settle()

    expect(part('spotlight').hasAttribute('hidden'), '锚定步应画高亮框').toBe(false)
    expect(getComputedStyle(part('backdrop')).backgroundColor).toBe(TRANSPARENT)
  })

  it('居中步：没有高亮框，遮罩照常压暗', async () => {
    const { step } = mountTour()
    await settle()
    step.value = 1
    await settle()

    expect(part('spotlight').hasAttribute('hidden'), '居中步不画高亮框').toBe(true)
    expect(getComputedStyle(part('backdrop')).backgroundColor).not.toBe(TRANSPARENT)
  })

  it('showBackdrop=false：保留高亮环，但不再用阴影压暗页面', async () => {
    mountTour(false)
    await settle()

    const spotlight = part('spotlight')
    expect(spotlight.hasAttribute('hidden')).toBe(false)
    expect(spotlight.hasAttribute('data-dimmed')).toBe(false)
    expect(getComputedStyle(spotlight).getPropertyValue('--xh-_tour-spotlight-shroud').trim()).toBe('transparent')
  })
})

/** 暗幕那层投影的扩散距离（px）：box-shadow 的最后一层是暗幕，扩散是它的最后一个长度 */
function shroudSpread(spotlight: HTMLElement): number {
  const layers = getComputedStyle(spotlight).boxShadow.split(/,(?![^(]*\))/)
  const lengths = layers.at(-1)!.match(/-?[\d.]+px/g) ?? []
  return Number.parseFloat(lengths.at(-1) ?? '0')
}

describe('tour 暗幕铺满视口', () => {
  // 高亮框同步目标的圆角：圆形目标的圆角随扩散一起放大，暗幕整个变成以目标为圆心的圆，
  // 半径不够时离目标最远的视口角会漏出一块没压暗的页面
  it('圆形目标贴在视口一角：暗幕的圆盖得到对角最远的那个角', async () => {
    host = document.createElement('div')
    host.innerHTML = '<button id="tour-round-target" style="position: fixed; inset-block-start: 8px; inset-inline-end: 8px; inline-size: 36px; block-size: 36px; border-radius: 9999px">目标</button>'
    document.body.append(host)
    app = createApp({
      setup: () => () => h(XhTourRoot, {
        open: true,
        steps: [{ id: 'a', target: '#tour-round-target', title: '圆形目标' }],
      }, {
        default: () => [
          h(XhTourBackdrop),
          h(XhTourSpotlight),
          h(XhTourPositioner, null, () => [h(XhTourContent, null, () => [h(XhTourTitle)])]),
        ],
      }),
    })
    app.mount(host)
    await settle()

    const spotlight = part('spotlight')
    expect(spotlight.hasAttribute('data-dimmed'), '锚定步应由高亮框压暗').toBe(true)
    const rect = spotlight.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    const farthest = Math.max(
      ...[[0, 0], [innerWidth, 0], [0, innerHeight], [innerWidth, innerHeight]]
        .map(([x, y]) => Math.hypot(x! - centerX, y! - centerY)),
    )
    const covered = Math.min(rect.width, rect.height) / 2 + shroudSpread(spotlight)

    expect(covered, `暗幕半径 ${covered}px 要盖到 ${farthest}px 外的视口角`).toBeGreaterThanOrEqual(farthest)
  })
})
