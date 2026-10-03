// 浮动按钮的拖动与贴边：按住触发器移动过激活距离才跟手，松手按 snap 贴到视口的边上，
// 弹簧落定后由样式层按提交的位置接手，像素位置与弹簧终点重合；贴边位置按比例记，
// 展开组朝页面中间长。固定定位的包含块、安全区夹取与真实指针事件只有真实浏览器量得出来。
import type { FloatButtonPosition } from '@xihan-ui/headless'
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import { XhFloatButtonList, XhFloatButtonRoot, XhFloatButtonTrigger } from '../../src'
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

function part(name: string): HTMLElement {
  const el = host?.querySelector<HTMLElement>(`[data-scope='float-button'][data-part='${name}']`)
  if (!el)
    throw new Error(`找不到 float-button 的 ${name}`)
  return el
}

interface Mounted { positions: FloatButtonPosition[] }

async function mount(props: Record<string, unknown> = {}, options: { motion?: 'reduce', dir?: 'rtl' } = {}): Promise<Mounted> {
  host = document.createElement('div')
  if (options.motion)
    host.dataset.motion = options.motion
  if (options.dir)
    host.dir = options.dir
  document.body.append(host)
  const positions: FloatButtonPosition[] = []
  app = createApp({
    setup: () => () => h(XhFloatButtonRoot, {
      ...props,
      'onPosition-change': (details: { position: FloatButtonPosition }) => positions.push(details.position),
    }, () => [
      h(XhFloatButtonTrigger),
      h(XhFloatButtonList, null, () => [
        h('button', { 'type': 'button', 'aria-label': '编辑' }, '✎'),
        h('button', { 'type': 'button', 'aria-label': '分享' }, '↗'),
      ]),
    ]),
  })
  app.mount(host)
  await nextTick()
  return { positions }
}

/** 包含块：固定定位按视口去掉滚动条的那一块排。 */
function viewport(): { width: number, height: number } {
  return { width: document.documentElement.clientWidth, height: document.documentElement.clientHeight }
}

function pointer(type: string, target: EventTarget, x: number, y: number): void {
  target.dispatchEvent(new PointerEvent(type, { pointerId: 7, pointerType: 'mouse', button: 0, buttons: type === 'pointerup' ? 0 : 1, clientX: x, clientY: y, bubbles: true, composed: true, isPrimary: true }))
}

/** 从触发器中心按下，分几步移到 (x, y)，停一会儿再松手：松手速度归零，落点只看放手处。 */
async function drag(toX: number, toY: number): Promise<void> {
  const trigger = part('trigger')
  const rect = trigger.getBoundingClientRect()
  const fromX = rect.left + rect.width / 2
  const fromY = rect.top + rect.height / 2
  pointer('pointerdown', trigger, fromX, fromY)
  for (let step = 1; step <= 6; step++)
    pointer('pointermove', document, fromX + (toX - fromX) * step / 6, fromY + (toY - fromY) * step / 6)
  await nextTick()
  await new Promise(resolve => setTimeout(resolve, 120))
  pointer('pointerup', document, toX, toY)
  // 浏览器在同一元素上按下又抬起，会补派一次 click
  trigger.dispatchEvent(new MouseEvent('click', { bubbles: true, clientX: toX, clientY: toY }))
}

async function settled(): Promise<void> {
  await expect.poll(() => part('root').hasAttribute('data-moving'), { timeout: 3000 }).toBe(false)
  await nextTick()
}

describe('float-button 拖动与贴边', () => {
  it('松手贴到近的那条左右边，沿边停在放手处；样式层接手后像素与落点重合，并通知按比例记的贴边位置', async () => {
    const { positions } = await mount({ draggable: true }, { motion: 'reduce' })
    const { width, height } = viewport()
    await drag(width / 4, 300)
    await settled()
    const rect = part('trigger').getBoundingClientRect()
    expect(rect.left).toBeCloseTo(24, 0)
    expect(rect.top + rect.height / 2).toBeCloseTo(300, 0)
    expect(part('root').dataset.edge).toBe('inline-start')
    expect(positions).toHaveLength(1)
    const [position] = positions as Array<{ edge: string, ratio: number }>
    expect(position!.edge).toBe('inline-start')
    expect(position!.ratio * height).toBeCloseTo(300, 0)
  })

  it('拖完补派的那次 click 不开合；起拖时展开着的动作组先收起', async () => {
    await mount({ draggable: true, defaultOpen: true }, { motion: 'reduce' })
    expect(part('list').hidden).toBe(false)
    await drag(viewport().width / 4, 300)
    await settled()
    expect(part('trigger').getAttribute('aria-expanded')).toBe('false')
    part('trigger').click()
    await nextTick()
    expect(part('trigger').getAttribute('aria-expanded')).toBe('true')
  })

  it('不减弱动效时弹簧带过去：途中投影 data-moving，落定后同样贴在边上', async () => {
    await mount({ draggable: true })
    const { width } = viewport()
    await drag(width - 200, 260)
    expect(part('root').hasAttribute('data-moving')).toBe(true)
    await settled()
    const rect = part('trigger').getBoundingClientRect()
    expect(width - rect.right).toBeCloseTo(24, 0)
    expect(rect.top + rect.height / 2).toBeCloseTo(260, 0)
  })

  it('defaultPosition 按比例贴边：右边 75% 高处，展开组朝上长', async () => {
    await mount({ defaultPosition: { edge: 'inline-end', ratio: 0.75 }, defaultOpen: true })
    const { width, height } = viewport()
    const trigger = part('trigger').getBoundingClientRect()
    expect(width - trigger.right).toBeCloseTo(24, 0)
    expect(trigger.top + trigger.height / 2).toBeCloseTo(height * 0.75, 0)
    expect(part('list').getBoundingClientRect().bottom).toBeLessThanOrEqual(trigger.top)
  })

  it('比例落在两端时收回到离边 offset 处，钮不出视口', async () => {
    await mount({ defaultPosition: { edge: 'inline-start', ratio: 0 } })
    expect(part('trigger').getBoundingClientRect().top).toBeCloseTo(24, 0)
  })

  it('snap 为 none 时停在放手处并提交像素坐标', async () => {
    const { positions } = await mount({ draggable: true, snap: 'none' }, { motion: 'reduce' })
    const x = viewport().width / 2
    await drag(x, 300)
    await settled()
    const rect = part('trigger').getBoundingClientRect()
    expect(rect.left + rect.width / 2).toBeCloseTo(x, 0)
    expect(rect.top + rect.height / 2).toBeCloseTo(300, 0)
    expect(positions).toEqual([{ x: rect.left, y: rect.top }])
  })

  it('停在一点时按视口高度定展开组朝向：挂载就在下半屏的朝上长，拖到下半屏的同样朝上长', async () => {
    const { height } = viewport()
    await mount({ defaultPosition: { x: 40, y: height - 120 }, defaultOpen: true })
    // 视口在挂载后量：量得的高度再渲一拍，仍在首帧之前
    await nextTick()
    let trigger = part('trigger').getBoundingClientRect()
    expect(part('root').dataset.placement).toBe('bottom-start')
    expect(part('list').getBoundingClientRect().bottom).toBeLessThanOrEqual(trigger.top)
    app?.unmount()
    host?.remove()

    // 挂载时没停在一点、不量视口；换到一点的那一刻才量
    await mount({ draggable: true, snap: 'none' }, { motion: 'reduce' })
    await drag(viewport().width / 2, height - 120)
    await settled()
    expect(part('root').dataset.placement).toBe('bottom-start')
    part('trigger').click()
    await nextTick()
    trigger = part('trigger').getBoundingClientRect()
    expect(part('list').getBoundingClientRect().bottom).toBeLessThanOrEqual(trigger.top)
  })

  it('从右到左（RTL）下拖到左边贴的是行尾', async () => {
    const { positions } = await mount({ draggable: true }, { motion: 'reduce', dir: 'rtl' })
    await drag(viewport().width / 4, 300)
    await settled()
    expect(part('trigger').getBoundingClientRect().left).toBeCloseTo(24, 0)
    expect(positions[0]).toMatchObject({ edge: 'inline-end' })
  })

  it('不写 draggable 时按住移动不跟手', async () => {
    await mount()
    const before = part('trigger').getBoundingClientRect()
    await drag(viewport().width / 4, 300)
    await nextTick()
    expect(part('root').hasAttribute('data-moving')).toBe(false)
    expect(part('trigger').getBoundingClientRect().left).toBe(before.left)
  })
})
