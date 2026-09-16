// 贴在滚动层上的条子：几个滚动层并排共用一个定位壳时，每层各自一套条子贴在自己的盒子上。
//
// 位置由连接层按 offsetLeft / offsetTop 写成内联几何，只有真实浏览器量得出来。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick, ref } from 'vue'
import { XhScrollbarRoot, XhScrollbarThumb, XhScrollbarTrack } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

// 几何断言容差 1px：连接层按 offsetLeft / offsetTop / offsetWidth / offsetHeight 写内联几何，它们是取整的整数，
// 层的真实盒子可以落在半像素上

let app: App | null = null
let host: HTMLElement | null = null

afterEach(() => {
  app?.unmount()
  host?.remove()
  app = null
  host = null
})

async function tick(times = 3): Promise<void> {
  for (let i = 0; i < times; i++) {
    await nextTick()
    await new Promise(r => requestAnimationFrame(() => r(null)))
  }
}

function bars(): HTMLElement[] {
  return [...host!.querySelectorAll<HTMLElement>('[data-scope="scrollbar"][data-part="root"]')]
}

function layers(): HTMLElement[] {
  return [...host!.querySelectorAll<HTMLElement>('[data-layer]')]
}

/**
 * 壳：position: relative 的横排盒；两列各自定高、竖向溢出；每列后面跟一条贴层的竖条。
 * 第二列比第一列宽，两列的右缘因此不在同一处：条子贴的得是各自那一列。
 */
function mount(dir: 'ltr' | 'rtl' = 'ltr', orientation: 'vertical' | 'horizontal' = 'vertical'): void {
  host = document.createElement('div')
  host.dir = dir
  document.body.append(host)
  const refs = [ref<HTMLElement | null>(null), ref<HTMLElement | null>(null)]
  const widths = [120, 180]
  app = createApp({
    setup: () => () => h('div', {
      style: 'position: relative; display: flex; gap: 8px; padding: 6px; inline-size: 400px; --xh-scrollbar-track-bg: transparent',
    }, refs.flatMap((layerRef, index) => [
      h('div', {
        'data-layer': index,
        'ref': (el: unknown) => { layerRef.value = el as HTMLElement },
        'style': orientation === 'vertical'
          ? `flex: none; inline-size: ${widths[index]}px; block-size: 100px; overflow-y: auto`
          : `flex: none; inline-size: ${widths[index]}px; block-size: 100px; overflow-x: auto`,
      }, [h('div', { style: orientation === 'vertical' ? 'block-size: 600px' : 'inline-size: 900px; block-size: 20px' })]),
      h(XhScrollbarRoot, {
        scrollable: () => layerRef.value,
        anchor: 'layer',
        orientation,
        type: 'always',
        size: 'sm',
        dir,
      }, () => h(XhScrollbarTrack, null, () => h(XhScrollbarThumb))),
    ])),
  })
  app.mount(host)
}

describe('贴在滚动层上的条子', () => {
  it('竖条贴各自那一列的右缘，长度与列同高；条子是列的后一个兄弟', async () => {
    mount()
    await tick()
    const [a, b] = layers()
    const [barA, barB] = bars()
    expect(barA!.getAttribute('data-anchor')).toBe('layer')
    expect(a!.nextElementSibling).toBe(barA)
    expect(b!.nextElementSibling).toBe(barB)
    for (const [layer, bar] of [[a, barA], [b, barB]] as const) {
      const box = layer!.getBoundingClientRect()
      const rect = bar!.getBoundingClientRect()
      expect(Math.abs(rect.right - box.right)).toBeLessThanOrEqual(1)
      expect(Math.abs(rect.top - box.top)).toBeLessThanOrEqual(1)
      expect(Math.abs(rect.height - box.height)).toBeLessThanOrEqual(1)
      expect(rect.width).toBe(4)
      expect(getComputedStyle(bar!).visibility).toBe('visible')
    }
    // 两列宽度不同：两条条子不在同一竖线上
    expect(Math.abs(barA!.getBoundingClientRect().right - barB!.getBoundingClientRect().right)).toBeGreaterThan(1)
  })

  it('从右到左排版时竖条贴列的左缘', async () => {
    mount('rtl')
    await tick()
    const [a] = layers()
    const [barA] = bars()
    const box = a!.getBoundingClientRect()
    const rect = barA!.getBoundingClientRect()
    expect(Math.abs(rect.left - box.left)).toBeLessThanOrEqual(1)
    expect(Math.abs(rect.height - box.height)).toBeLessThanOrEqual(1)
  })

  it('横条贴各自那一列的底缘，长度与列同宽', async () => {
    mount('ltr', 'horizontal')
    await tick()
    const [a, b] = layers()
    const [barA, barB] = bars()
    for (const [layer, bar] of [[a, barA], [b, barB]] as const) {
      const box = layer!.getBoundingClientRect()
      const rect = bar!.getBoundingClientRect()
      expect(Math.abs(rect.bottom - box.bottom)).toBeLessThanOrEqual(1)
      expect(Math.abs(rect.left - box.left)).toBeLessThanOrEqual(1)
      expect(Math.abs(rect.width - box.width)).toBeLessThanOrEqual(1)
      expect(rect.height).toBe(4)
    }
  })

  it('列在壳内挪位后重量：条子跟着列走', async () => {
    mount()
    await tick()
    const [a, b] = layers()
    const [, barB] = bars()
    a!.style.inlineSize = '200px'
    await tick()
    await new Promise(resolve => setTimeout(resolve, 60))
    await tick()
    expect(Math.abs(barB!.getBoundingClientRect().right - b!.getBoundingClientRect().right)).toBeLessThanOrEqual(1)
  })
})
