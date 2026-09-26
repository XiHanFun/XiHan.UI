// 液态组：液态档下浮动钮的触发器与展开的动作共用一层色块，靠近时边缘连起来。
// 钉住：滤镜与色块层在宿主最前、每块一个色块且贴合各块；触发器的面、细线、亮边与投影交给色块层画；展开时动作从触发器里分离、
// 收起时融回、融回落定才藏起展开组；减弱动效下不分离；材质轴随时切换随时生效；展开组跟触发器同一墨色域。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { cdp } from 'vitest/browser'
import { createApp, h, nextTick } from 'vue'
import { XhFloatButtonList, XhFloatButtonRoot, XhFloatButtonTrigger } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let backdrop: HTMLElement | null = null
let host: HTMLElement | null = null
let app: App | null = null

afterEach(() => {
  app?.unmount()
  app = null
  host?.remove()
  host = null
  backdrop?.remove()
  backdrop = null
  document.documentElement.removeAttribute('data-material')
})

function frames(count = 3) {
  return new Promise<void>((resolve) => {
    const step = (left: number): void => {
      if (left === 0)
        resolve()
      else requestAnimationFrame(() => step(left - 1))
    }
    step(count)
  })
}

interface Rig {
  root: HTMLElement
  trigger: HTMLElement
  list: HTMLElement
  items: HTMLElement[]
  layer: () => HTMLElement | null
  blobOf: (el: HTMLElement) => HTMLElement
}

async function mount(background = 'oklch(0.96 0.02 100)', material: string | null = 'liquid'): Promise<Rig> {
  if (material)
    document.documentElement.setAttribute('data-material', material)
  backdrop = document.createElement('div')
  backdrop.style.cssText = `position: fixed; inset: 0; background: ${background}`
  document.body.append(backdrop)
  host = document.createElement('div')
  document.body.append(host)
  app = createApp({
    render: () => h(XhFloatButtonRoot, null, () => [
      h(XhFloatButtonTrigger, { 'aria-label': '新建' }),
      h(XhFloatButtonList, null, () => ['拍照', '上传', '相册'].map(label => h('button', { 'type': 'button', 'aria-label': label }))),
    ]),
  })
  app.mount(host)
  await nextTick()
  await frames()
  const root = host.querySelector<HTMLElement>('[data-scope="float-button"][data-part="root"]')!
  const list = root.querySelector<HTMLElement>('[data-part="list"]')!
  const layer = (): HTMLElement | null => root.querySelector<HTMLElement>(':scope > [data-xh-liquid-goo-layer]')
  return {
    root,
    trigger: root.querySelector<HTMLElement>('[data-part="trigger"]')!,
    list,
    items: [...list.children] as HTMLElement[],
    layer,
    // 色块按组员次序排：触发器在前，动作依次在后
    blobOf: (el) => {
      const members = [root.querySelector<HTMLElement>('[data-part="trigger"]')!, ...list.children]
      return layer()!.children[members.indexOf(el)] as HTMLElement
    },
  }
}

function expectCovers(blob: HTMLElement, el: HTMLElement): void {
  const a = blob.getBoundingClientRect()
  const b = el.getBoundingClientRect()
  for (const key of ['left', 'top', 'width', 'height'] as const)
    expect(Math.abs(a[key] - b[key]), key).toBeLessThan(1.5)
}

const settled = (items: HTMLElement[]): boolean => items.every(item => item.style.translate === '')

describe('液态组的结构', () => {
  it('滤镜与色块层在宿主最前、对读屏隐藏，每块一个色块；触发器的面、细线与投影交给色块层画', async () => {
    const rig = await mount()
    const layer = rig.layer()!
    const [svg] = rig.root.children
    expect(rig.root.hasAttribute('data-xh-liquid-goo')).toBe(true)
    expect(svg!.hasAttribute('data-xh-liquid-goo-filter')).toBe(true)
    expect(svg!.nextElementSibling).toBe(layer)
    expect(layer.getAttribute('aria-hidden')).toBe('true')
    expect(getComputedStyle(layer).filter).toBe(`url("#${svg!.querySelector('filter')!.id}")`)
    expect(layer.children).toHaveLength(1 + rig.items.length)
    expectCovers(rig.blobOf(rig.trigger), rig.trigger)
    // 收起时动作藏着，它们的色块也不画
    expect(getComputedStyle(rig.blobOf(rig.items[0]!)).display).toBe('none')
    const face = getComputedStyle(rig.trigger)
    expect(face.backgroundColor).toBe('rgba(0, 0, 0, 0)')
    expect(face.borderTopColor).toBe('rgba(0, 0, 0, 0)')
    expect(face.boxShadow).toBe('none')
    // 滤镜里的底色与细线取液态令牌
    const fill = getComputedStyle(svg!.querySelector('[data-xh-goo-paint="fill"]')!)
    expect(fill.getPropertyValue('flood-color')).toBe(getComputedStyle(layer).getPropertyValue('--xh-material-liquid-tint').trim())
  })

  it('standard 档不结组；切到 liquid 随即结组，切回去撤掉色块层与标记', async () => {
    const rig = await mount(undefined, null)
    expect(rig.layer()).toBeNull()
    document.documentElement.setAttribute('data-material', 'liquid')
    await frames()
    expect(rig.layer()).not.toBeNull()
    document.documentElement.setAttribute('data-material', 'standard')
    await frames()
    expect(rig.layer()).toBeNull()
    expect(rig.root.querySelector('[data-xh-liquid-goo-filter]')).toBeNull()
    expect(rig.root.hasAttribute('data-xh-liquid-goo')).toBe(false)
    expect(rig.list.hasAttribute('data-xh-ink')).toBe(false)
  })

  it('深色下层：滤镜、色块层与展开组跟触发器同一墨色域', async () => {
    const rig = await mount('oklch(0.3 0.1 258)')
    expect(rig.trigger.getAttribute('data-xh-ink')).toBe('light')
    expect(rig.layer()!.getAttribute('data-xh-ink')).toBe('light')
    expect(rig.root.querySelector('[data-xh-liquid-goo-filter]')!.getAttribute('data-xh-ink')).toBe('light')
    expect(rig.list.getAttribute('data-xh-ink')).toBe('light')
  })

  it('按住触发器时色块跟着一起形变，松手弹回后色块也回到原形', async () => {
    const rig = await mount()
    const rect = rig.trigger.getBoundingClientRect()
    // 测试页的 iframe 被缩放进窗口，CDP 坐标与页面坐标差一个比例：先派一次移动量出这个比例
    const seen = new Promise<number>(resolve => document.addEventListener('pointermove', event => resolve(event.clientX / 20), { once: true }))
    await cdp().send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 20, y: 20 })
    const scale = await seen
    const at = { x: (rect.right - 4) / scale, y: (rect.top + rect.height / 2) / scale }
    await cdp().send('Input.dispatchMouseEvent', { type: 'mousePressed', button: 'left', clickCount: 1, ...at })
    await frames(4)
    const pressed = getComputedStyle(rig.trigger).transform
    expect(pressed).not.toBe('none')
    expect(getComputedStyle(rig.blobOf(rig.trigger)).transform).toBe(pressed)
    await cdp().send('Input.dispatchMouseEvent', { type: 'mouseReleased', button: 'left', clickCount: 1, ...at })
    await expect.poll(() => getComputedStyle(rig.blobOf(rig.trigger)).transform, { timeout: 2000 }).toBe('none')
  })
})

describe('分离与融回', () => {
  it('展开：动作从触发器里分离，途中朝触发器偏、半透明；落定后撤掉行内姿态，色块贴合各自的动作，不重播 CSS 进场', async () => {
    const rig = await mount()
    rig.trigger.click()
    await nextTick()
    await frames(2)
    const far = rig.items.at(-1)!
    expect(far.style.translate).not.toBe('')
    expect(Number(far.style.opacity)).toBeLessThan(1)
    // 色块跟着动作一起走
    expect(rig.blobOf(far).style.translate).toBe(getComputedStyle(far).translate)

    await expect.poll(() => settled(rig.items), { timeout: 3000 }).toBe(true)
    await frames(4)
    for (const item of rig.items) {
      expectCovers(rig.blobOf(item), item)
      // 撤掉行内 scale 会碰上按钮自己的 scale 过渡（1 → none，看不出来）；要钉的是逐条冒出的关键帧没重播
      expect(item.getAnimations().filter(animation => animation instanceof CSSAnimation)).toHaveLength(0)
      expect(getComputedStyle(item).opacity).toBe('1')
    }
  })

  it('收起：展开组留着、不可交互，动作融回触发器，落定才藏起来', async () => {
    const rig = await mount()
    rig.trigger.click()
    await nextTick()
    await expect.poll(() => settled(rig.items), { timeout: 3000 }).toBe(true)

    rig.trigger.click()
    await nextTick()
    expect(rig.trigger.getAttribute('aria-expanded')).toBe('false')
    expect(rig.list.hidden).toBe(false)
    expect(rig.list.inert).toBe(true)
    await frames(3)
    expect(rig.items[0]!.style.translate).not.toBe('')

    await expect.poll(() => rig.list.hidden, { timeout: 3000 }).toBe(true)
    await frames(2)
    expect(getComputedStyle(rig.blobOf(rig.items[0]!)).display).toBe('none')
  })

  it('减弱动效：展开与收起都不分离，收起只剩条目各自那段淡出，播完藏起来', async () => {
    const rig = await mount()
    host!.dataset.motion = 'reduce'
    rig.trigger.click()
    await nextTick()
    await frames(2)
    expect(rig.items.every(item => item.style.translate === '')).toBe(true)
    rig.trigger.click()
    await nextTick()
    await frames(1)
    // 减弱档的退场只剩淡变，不位移、不缩放；列表等这段淡出播完才藏
    expect(rig.items.every(item => item.style.translate === '')).toBe(true)
    await expect.poll(() => rig.list.hidden, { timeout: 2000 }).toBe(true)
  })
})
