// AspectRatio 的盒子：宽随容器、高由比例算出，直接子元素铺满，内容再高也不撑开盒子。
// 这些都是布局结果，jsdom 量不出来，只能在真实 Chromium 里量。
import type { App, VNode } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, defineComponent, h, nextTick, ref } from 'vue'
import { provideXhConfig, XhAspectRatio } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

afterEach(() => {
  app?.unmount()
  app = null
  host?.remove()
  host = null
})

/** 一张 4:3 的内联示例图：比例与盒子不同，裁切才看得出来。 */
const PICTURE = 'data:image/svg+xml,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20viewBox=%220%200%204%203%22%3E%3Crect%20width=%224%22%20height=%223%22%20fill=%22%23475569%22/%3E%3C/svg%3E'

function roots(): HTMLElement[] {
  return [...document.querySelectorAll<HTMLElement>(`[data-scope='aspect-ratio'][data-part='root']`)]
}

function root(): HTMLElement {
  const [first] = roots()
  if (!first)
    throw new Error('找不到 aspect-ratio/root')
  return first
}

async function frame(): Promise<void> {
  await nextTick()
  await new Promise(resolve => requestAnimationFrame(resolve))
}

/** 挂进一个定宽的宿主：宿主宽 480px，盒宽随它。 */
async function mount(render: () => VNode | VNode[], hostStyle = 'inline-size: 480px'): Promise<void> {
  host = document.createElement('div')
  host.style.cssText = hostStyle
  document.body.prepend(host)
  app = createApp({ render })
  app.mount(host)
  await frame()
}

function size(el: Element): { width: number, height: number } {
  const rect = el.getBoundingClientRect()
  return { width: rect.width, height: rect.height }
}

describe('aspect-ratio 盒子', () => {
  it('缺省比例为 1：宽随容器，高与宽相等', async () => {
    await mount(() => h(XhAspectRatio, null, () => h('div', '画面')))
    const box = size(root())
    expect(box.width).toBeCloseTo(480, 0)
    expect(box.height).toBeCloseTo(480, 0)
  })

  it('16 / 9：高等于宽乘 9/16，直接子元素铺满整个盒子', async () => {
    await mount(() => h(XhAspectRatio, { ratio: 16 / 9 }, () => h('div', { 'data-testid': 'content' }, '画面')))
    const box = root().getBoundingClientRect()
    expect(box.width).toBeCloseTo(480, 0)
    expect(box.height).toBeCloseTo(480 * 9 / 16, 0)

    const content = document.querySelector('[data-testid="content"]')!.getBoundingClientRect()
    expect(content.left).toBeCloseTo(box.left, 0)
    expect(content.top).toBeCloseTo(box.top, 0)
    expect(content.width).toBeCloseTo(box.width, 0)
    expect(content.height).toBeCloseTo(box.height, 0)
  })

  it('内容比盒子高也不撑开：盒子仍是这个比例，多出的部分被裁掉', async () => {
    await mount(() => h(XhAspectRatio, { ratio: 2 }, () =>
      h('div', null, h('div', { style: 'block-size: 960px' }, '很高的内容'))))
    const box = size(root())
    expect(box.height).toBeCloseTo(240, 0)
    expect(getComputedStyle(root()).overflow).toBe('hidden')
  })

  it('图片铺满并按 cover 裁切：不留边也不变形', async () => {
    await mount(() => h(XhAspectRatio, { ratio: 16 / 9 }, () => h('img', { src: PICTURE, alt: '示例图' })))
    const img = document.querySelector('img')!
    const box = size(root())
    const picture = size(img)
    expect(picture.width).toBeCloseTo(box.width, 0)
    expect(picture.height).toBeCloseTo(box.height, 0)
    expect(getComputedStyle(img).objectFit).toBe('cover')
  })

  it('改 ratio：盒子当场换成新比例', async () => {
    const ratio = ref(1)
    await mount(() => h(XhAspectRatio, { ratio: ratio.value }, () => h('div', '画面')))
    expect(size(root()).height).toBeCloseTo(480, 0)
    ratio.value = 3
    await frame()
    expect(size(root()).height).toBeCloseTo(160, 0)
  })

  it('非法值按 1：盒子是正方形，不塌成零高', async () => {
    await mount(() => h(XhAspectRatio, { ratio: 0 }, () => h('div', '画面')))
    expect(size(root()).height).toBeCloseTo(480, 0)
  })

  it('全局配置的组件级缺省落得下来，实例自己写的照样胜出', async () => {
    const Scoped = defineComponent({
      setup(_, { slots }) {
        provideXhConfig({ defaults: { 'aspect-ratio': { ratio: 2 } } })
        return () => slots.default?.()
      },
    })
    await mount(() => h(Scoped, null, () => [
      h(XhAspectRatio, null, () => h('div', '缺省')),
      h(XhAspectRatio, { ratio: 4 }, () => h('div', '实例')),
    ]))
    const [preset, own] = roots()
    expect(size(preset!).height).toBeCloseTo(240, 0)
    expect(size(own!).height).toBeCloseTo(120, 0)
  })

  it('放进弹性行：几个盒子平分行宽，各按自己的比例定高', async () => {
    await mount(() => [
      h(XhAspectRatio, { ratio: 1 }, () => h('div', '1:1')),
      h(XhAspectRatio, { ratio: 2 }, () => h('div', '2:1')),
    ], 'display: flex; gap: 0; inline-size: 480px')
    const [square, wide] = roots().map(size)
    expect(square!.width).toBeCloseTo(240, 0)
    expect(square!.height).toBeCloseTo(240, 0)
    expect(wide!.width).toBeCloseTo(240, 0)
    expect(wide!.height).toBeCloseTo(120, 0)
  })

  it('使用者槽：定宽与圆角都改得了', async () => {
    await mount(() => h(XhAspectRatio, {
      ratio: 16 / 9,
      style: '--xh-aspect-ratio-w: 320px; --xh-aspect-ratio-radius: var(--xh-shape-surface)',
    }, () => h('div', '画面')))
    const box = size(root())
    expect(box.width).toBeCloseTo(320, 0)
    expect(box.height).toBeCloseTo(180, 0)
    expect(getComputedStyle(root()).borderTopLeftRadius).toBe('8px')
  })

  it('root 写了 hidden 就收起，不被皮肤的 display 掀开', async () => {
    await mount(() => h(XhAspectRatio, { hidden: true }, () => h('div', '画面')))
    expect(getComputedStyle(root()).display).toBe('none')
  })
})
