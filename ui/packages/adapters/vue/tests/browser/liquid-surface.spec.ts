// 液态面的动态部分：真组件挂在不同的下层上，状态机把触发器挂进液态面。
// 钉住：按下层写墨色域（浅 / 深色调）与通透档；声明与杂乱下层不换通透档；材质轴随时切换随时生效；
// Chromium 下边缘折射；细指针移动时亮边转向，减弱动效下不跟随；卸载后写过的东西全部撤回。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { cdp } from 'vitest/browser'
import { createApp, h, nextTick } from 'vue'
import { XhFloatButtonRoot, XhFloatButtonTrigger } from '../../src'
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

/**
 * 测试页的 iframe 被缩放进窗口，CDP 的坐标与页面坐标差一个比例：先派一次移动量出这个比例。
 */
async function mouseScale(): Promise<number> {
  const seen = new Promise<number>(resolve => document.addEventListener('pointermove', event => resolve(event.clientX / 20), { once: true }))
  await cdp().send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 20, y: 20 })
  return seen
}

async function moveMouse(x: number, y: number): Promise<void> {
  const scale = await mouseScale()
  await cdp().send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: x / scale, y: y / scale })
}

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

/** 铺一层全视口的下层，再把浮动钮挂上去：浮动钮是 fixed 定位，压在这层下层上。 */
async function mount(under: { style: string, attrs?: Record<string, string>, text?: string }, material: string | null = 'liquid'): Promise<HTMLElement> {
  if (material)
    document.documentElement.setAttribute('data-material', material)
  backdrop = document.createElement('div')
  backdrop.style.cssText = `position: fixed; inset: 0; ${under.style}`
  for (const [k, v] of Object.entries(under.attrs ?? {}))
    backdrop.setAttribute(k, v)
  if (under.text)
    backdrop.innerHTML = `<p style="margin: 0; font-size: 64px; line-height: 1; word-break: break-all">${under.text.repeat(200)}</p>`
  document.body.append(backdrop)
  host = document.createElement('div')
  document.body.append(host)
  app = createApp({ render: () => h(XhFloatButtonRoot, null, () => h(XhFloatButtonTrigger, { 'aria-label': '新建' })) })
  app.mount(host)
  await nextTick()
  await frames()
  return host.querySelector<HTMLElement>('[data-scope="float-button"][data-part="trigger"]')!
}

describe('液态面按下层取色调与通透档', () => {
  it('均匀的浅下层：黑墨域（浅色调）+ 通透档', async () => {
    const trigger = await mount({ style: 'background: oklch(0.96 0.02 100)' })
    expect(trigger.getAttribute('data-xh-ink')).toBe('dark')
    expect(trigger.getAttribute('data-xh-liquid-clarity')).toBe('clear')
  })

  it('均匀的深下层：白墨域（深色调）+ 通透档', async () => {
    const trigger = await mount({ style: 'background: oklch(0.3 0.1 258)' })
    expect(trigger.getAttribute('data-xh-ink')).toBe('light')
    expect(trigger.getAttribute('data-xh-liquid-clarity')).toBe('clear')
  })

  it('作者声明的深色杂乱区域（图片）：深色调，不换通透档', async () => {
    const trigger = await mount({ style: 'background: linear-gradient(oklch(0.8 0.1 40), oklch(0.3 0.1 300))', attrs: { 'data-xh-backdrop': 'dark', 'data-xh-backdrop-busy': '' } })
    expect(trigger.getAttribute('data-xh-ink')).toBe('light')
    expect(trigger.hasAttribute('data-xh-liquid-clarity')).toBe(false)
  })

  it('下层有文字：按杂乱算，不换通透档', async () => {
    const trigger = await mount({ style: 'background: oklch(1 0 0)', text: '文字' })
    expect(trigger.getAttribute('data-xh-ink')).toBe('dark')
    expect(trigger.hasAttribute('data-xh-liquid-clarity')).toBe(false)
  })
})

describe('材质轴', () => {
  it('standard 档下什么都不写；切到 liquid 随即生效，切回去全部撤回', async () => {
    const trigger = await mount({ style: 'background: oklch(0.3 0.1 258)' }, null)
    expect(trigger.hasAttribute('data-xh-ink')).toBe(false)
    document.documentElement.setAttribute('data-material', 'liquid')
    await frames()
    expect(trigger.getAttribute('data-xh-ink')).toBe('light')
    document.documentElement.setAttribute('data-material', 'standard')
    await frames()
    expect(trigger.hasAttribute('data-xh-ink')).toBe(false)
    expect(trigger.style.backdropFilter).toBe('')
  })
})

describe('折射、光源与卸载', () => {
  it('chromium 下边缘折射：背景滤镜换成文档里的一段 SVG 位移滤镜；减弱透明下不折射', async () => {
    const trigger = await mount({ style: 'background: oklch(0.96 0.02 100)' })
    const id = /url\("?#([\w-]+)"?\)/.exec(trigger.style.backdropFilter)?.[1]
    expect(id).toBeTruthy()
    expect(document.getElementById(id!)?.tagName.toLowerCase()).toBe('filter')

    document.documentElement.setAttribute('data-transparency', 'reduce')
    window.dispatchEvent(new Event('resize'))
    await frames()
    expect(trigger.style.backdropFilter).toBe('')
    document.documentElement.removeAttribute('data-transparency')
  })

  it('细指针移动时亮边转向指针；减弱动效下光源留在缺省方向', async () => {
    const trigger = await mount({ style: 'background: oklch(0.96 0.02 100)' })
    const rect = trigger.getBoundingClientRect()
    await moveMouse(rect.left - 100, rect.top + rect.height / 2)
    await frames()
    expect(Number(trigger.style.getPropertyValue('--xh-_liquid-light-x'))).toBeLessThan(-0.9)

    host!.dataset.motion = 'reduce'
    await moveMouse(rect.left - 100, rect.top + 4)
    await frames()
    expect(trigger.style.getPropertyValue('--xh-_liquid-light-x')).toBe('')
  })

  it('按住时面朝手指鼓出、拖远拉得更长，松手弹回后撤掉形变；减弱动效下不形变', async () => {
    const trigger = await mount({ style: 'background: oklch(0.96 0.02 100)' })
    const rect = trigger.getBoundingClientRect()
    const scale = await mouseScale()
    const at = (x: number, y: number) => ({ x: x / scale, y: y / scale })
    const stretchOf = (): number => {
      const match = /scale\(([\d.]+),/.exec(trigger.style.getPropertyValue('--xh-_liquid-deform'))
      return match ? Number(match[1]) : 1
    }
    const centerY = rect.top + rect.height / 2
    await cdp().send('Input.dispatchMouseEvent', { type: 'mouseMoved', ...at(rect.right - 4, centerY) })
    await cdp().send('Input.dispatchMouseEvent', { type: 'mousePressed', button: 'left', clickCount: 1, ...at(rect.right - 4, centerY) })
    await frames()
    const pressed = stretchOf()
    expect(pressed).toBeGreaterThan(1)
    // 往外拖：拉得更长，但有上限
    await cdp().send('Input.dispatchMouseEvent', { type: 'mouseMoved', button: 'left', ...at(rect.right + 120, centerY) })
    await frames()
    const pulled = stretchOf()
    expect(pulled).toBeGreaterThan(pressed)
    expect(pulled).toBeLessThanOrEqual(1.35)
    await cdp().send('Input.dispatchMouseEvent', { type: 'mouseReleased', button: 'left', clickCount: 1, ...at(rect.right + 120, centerY) })
    // 欠阻尼回弹会越过零点，越零那一帧形变也是空的：连续几帧都空才算停稳
    await expect.poll(async () => {
      const seen: string[] = []
      for (let i = 0; i < 4; i++) {
        seen.push(trigger.style.getPropertyValue('--xh-_liquid-deform'))
        await frames(1)
      }
      return seen.join('')
    }, { timeout: 2000 }).toBe('')

    host!.dataset.motion = 'reduce'
    await cdp().send('Input.dispatchMouseEvent', { type: 'mousePressed', button: 'left', clickCount: 1, ...at(rect.right - 4, centerY) })
    await frames()
    expect(trigger.style.getPropertyValue('--xh-_liquid-deform')).toBe('')
    await cdp().send('Input.dispatchMouseEvent', { type: 'mouseReleased', button: 'left', clickCount: 1, ...at(rect.right - 4, centerY) })
  })

  it('卸载后写过的属性、行内样式与滤镜库全部撤回', async () => {
    const trigger = await mount({ style: 'background: oklch(0.96 0.02 100)' })
    expect(trigger.hasAttribute('data-xh-ink')).toBe(true)
    app!.unmount()
    app = null
    expect(trigger.hasAttribute('data-xh-ink')).toBe(false)
    expect(trigger.style.backdropFilter).toBe('')
    expect(document.querySelector('svg[data-xh-liquid-lenses]')).toBeNull()
  })
})
