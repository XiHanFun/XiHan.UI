// 排序的放下归位：真指针拖动，放下后那一项从松手位置由弹簧收进重排后的新位置。
// 钉住：宿主接了这次排序时，那一项先停在松手处、再逐帧收到零位移并撤掉 data-animating；
// 宿主不接时照样从松手处收回原位；减弱动效下放下直接落位。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { cdp } from 'vitest/browser'
import { createApp, h, nextTick, ref } from 'vue'
import { XhSortableItem, XhSortableRoot } from '../../src'
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

function frames(count = 3): Promise<void> {
  return new Promise<void>((resolve) => {
    const step = (left: number): void => {
      if (left === 0)
        resolve()
      else requestAnimationFrame(() => step(left - 1))
    }
    step(count)
  })
}

async function mount(accept = true): Promise<() => HTMLElement> {
  host = document.createElement('div')
  host.style.cssText = 'inline-size: 240px'
  document.body.append(host)
  const ids = ref(['a', 'b', 'c', 'd'])
  app = createApp({
    render: () => h(XhSortableRoot, {
      'ids': ids.value,
      'activationDistance': 0,
      'onUpdate:ids': (next: string[]) => {
        if (accept)
          ids.value = next
      },
    }, () => ids.value.map(id => h(XhSortableItem, { key: id, itemId: id, style: 'block-size: 40px; box-sizing: border-box' }, () => id))),
  })
  app.mount(host)
  await nextTick()
  await frames()
  return () => host!.querySelector<HTMLElement>('[data-part="item"][data-value="a"], [data-part="item"][data-xh-value="a"]')
    ?? [...host!.querySelectorAll<HTMLElement>('[data-part="item"]')].find(el => el.textContent === 'a')!
}

async function mouseScale(): Promise<number> {
  const seen = new Promise<number>(resolve => document.addEventListener('pointermove', event => resolve(event.clientX / 20), { once: true }))
  await cdp().send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 20, y: 20 })
  return seen
}

/** 按住那一项、分几步往下拖 dy、松手；每步隔一帧，最后几步决定松手速度。 */
async function drag(el: HTMLElement, dy: number, steps = 6): Promise<void> {
  const scale = await mouseScale()
  const rect = el.getBoundingClientRect()
  const x = rect.left + rect.width / 2
  const y = rect.top + rect.height / 2
  const at = (py: number) => ({ x: x / scale, y: py / scale })
  await cdp().send('Input.dispatchMouseEvent', { type: 'mouseMoved', ...at(y) })
  await cdp().send('Input.dispatchMouseEvent', { type: 'mousePressed', button: 'left', clickCount: 1, ...at(y) })
  for (let i = 1; i <= steps; i++) {
    await frames(1)
    await cdp().send('Input.dispatchMouseEvent', { type: 'mouseMoved', button: 'left', ...at(y + (dy * i) / steps) })
  }
  await cdp().send('Input.dispatchMouseEvent', { type: 'mouseReleased', button: 'left', clickCount: 1, ...at(y + dy) })
}

describe('排序放下归位', () => {
  it('宿主接了这次排序：那一项先停在松手处，再由弹簧收进新位置', async () => {
    const itemA = await mount()
    const rects = [...host!.querySelectorAll<HTMLElement>('[data-part="item"]')].map(el => el.getBoundingClientRect())
    const start = rects[0]!.top
    // 拖过 c 的中心一点：落到第三位
    const dy = rects[2]!.top + rects[2]!.height / 2 - (rects[0]!.top + rects[0]!.height / 2) + 6
    await drag(itemA(), dy)
    await nextTick()
    await frames(1)
    const moved = itemA()
    // 已经重排到第三位，但画面上还停在松手处附近
    expect([...moved.parentElement!.children].map(el => el.textContent).join('')).toBe('bcad')
    expect(moved.hasAttribute('data-animating')).toBe(true)
    expect(Math.abs(moved.getBoundingClientRect().top - (start + dy))).toBeLessThan(20)
    await expect.poll(() => moved.hasAttribute('data-animating'), { timeout: 2000 }).toBe(false)
    expect(moved.style.transform).toBe('')
    // 新位置：b、c 两项让出来的地方
    expect(moved.getBoundingClientRect().top).toBeCloseTo(rects[2]!.bottom - rects[0]!.height, 0)
  })

  it('宿主不接这次排序：从松手处收回原位', async () => {
    const itemA = await mount(false)
    const start = itemA().getBoundingClientRect().top
    await drag(itemA(), 95)
    await nextTick()
    await frames(1)
    const back = itemA()
    expect(back.parentElement!.children[0]).toBe(back)
    expect(back.hasAttribute('data-animating')).toBe(true)
    expect(back.getBoundingClientRect().top).toBeGreaterThan(start + 50)
    await expect.poll(() => back.hasAttribute('data-animating'), { timeout: 2000 }).toBe(false)
    expect(back.getBoundingClientRect().top).toBeCloseTo(start, 0)
  })

  it('减弱动效：放下直接落位', async () => {
    const itemA = await mount()
    host!.dataset.motion = 'reduce'
    await drag(itemA(), 95)
    await nextTick()
    await frames(1)
    expect(itemA().hasAttribute('data-animating')).toBe(false)
    expect(itemA().style.transform).toBe('')
  })
})
