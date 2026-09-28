// 水印的全屏档、防篡改与地址形式的图片：印子固定铺满视口、压在模态层之上；删掉根节点被原位放回、卸载则不；
// blob 地址的图片取回后转成内联图片进图样。几何、层叠与取图只有真实 Chromium 做得到。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick, ref } from 'vue'
import { XhWatermarkContent, XhWatermarkRoot } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

afterEach(() => {
  app?.unmount()
  app = null
  host?.remove()
  host = null
  document.body.innerHTML = ''
})

async function mount(props: Record<string, unknown>, show = ref(true)) {
  host = document.createElement('div')
  document.body.append(host)
  app = createApp({
    render: () => show.value
      ? h(XhWatermarkRoot, props, () => h(XhWatermarkContent, null, () => '合同正文'))
      : null,
  })
  app.mount(host)
  await nextTick()
  await new Promise(resolve => requestAnimationFrame(() => resolve(undefined)))
  return { root: host.querySelector<HTMLElement>('[data-scope="watermark"][data-part="root"]'), show }
}

async function settle(): Promise<void> {
  await nextTick()
  await new Promise(resolve => setTimeout(resolve, 0))
  await nextTick()
}

describe('watermark 全屏档', () => {
  it('印子固定铺满整个视口，层号压过模态层', async () => {
    const { root } = await mount({ text: '曦寒', fullscreen: true })
    const layer = getComputedStyle(root!, '::after')
    expect(layer.position).toBe('fixed')
    expect(Number.parseFloat(layer.width)).toBeCloseTo(window.innerWidth, 0)
    expect(Number.parseFloat(layer.height)).toBeCloseTo(window.innerHeight, 0)
    const probe = document.createElement('span')
    probe.style.zIndex = 'var(--xh-layer-modal)'
    probe.style.position = 'relative'
    document.body.append(probe)
    expect(Number(layer.zIndex)).toBeGreaterThan(Number(getComputedStyle(probe).zIndex))
    expect(getComputedStyle(root!).isolation).toBe('auto')
  })

  it('缺省档仍只盖根自己那块地', async () => {
    const { root } = await mount({ text: '曦寒' })
    expect(getComputedStyle(root!, '::after').position).toBe('absolute')
    expect(getComputedStyle(root!).isolation).toBe('isolate')
  })
})

describe('watermark 防篡改', () => {
  it('删掉根节点：原位放回；改掉图样变量：改回', async () => {
    const { root } = await mount({ text: '曦寒' })
    const parent = root!.parentNode
    const image = root!.style.getPropertyValue('--xh-watermark-image')
    root!.remove()
    root!.style.removeProperty('--xh-watermark-image')
    await settle()
    expect(root!.parentNode).toBe(parent)
    expect(root!.style.getPropertyValue('--xh-watermark-image')).toBe(image)
    expect(getComputedStyle(root!, '::after').maskImage).toContain('data:image/svg+xml')
  })

  it('组件正常卸载：根节点不被放回', async () => {
    const { root, show } = await mount({ text: '曦寒' })
    show.value = false
    await settle()
    expect(root!.isConnected).toBe(false)
    expect(host!.querySelector('[data-scope="watermark"]')).toBeNull()
  })
})

describe('watermark 地址形式的图片', () => {
  it('blob 地址取回后转成内联图片进图样', async () => {
    const canvas = document.createElement('canvas')
    canvas.width = 8
    canvas.height = 8
    canvas.getContext('2d')!.fillRect(0, 0, 8, 8)
    const blob = await new Promise<Blob>(resolve => canvas.toBlob(b => resolve(b!), 'image/png'))
    const url = URL.createObjectURL(blob)
    const { root } = await mount({ text: '曦寒', image: url })
    await expect.poll(() => decodeURIComponent(root!.style.getPropertyValue('--xh-watermark-image')), { timeout: 3000 })
      .toContain('<image href="data:image/png')
    URL.revokeObjectURL(url)
  })
})
