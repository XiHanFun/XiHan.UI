// @vitest-environment jsdom
//
// tour 的 boundary：引导限在一块区域里。遮罩与居中步铺满那块区域，高亮框按区域裁剪（clip-path 的四个值是区域相对
// 高亮框四条边的距离），对话框不标 aria-modal；没给或取不到时照旧整个视口。
import type { TourSchema } from '../src/tour'
import { createService, normalizeProps } from '@xihan-ui/core'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'
import { afterEach, describe, expect, it } from 'vitest'
import { connectTour, tourMachine } from '../src/tour'

type Props = TourSchema['props']
type Dict = Record<string, unknown>

function stubRect(el: HTMLElement, box: { x: number, y: number, width: number, height: number }): void {
  el.getBoundingClientRect = () => ({
    ...box,
    top: box.y,
    left: box.x,
    right: box.x + box.width,
    bottom: box.y + box.height,
    toJSON: () => ({}),
  }) as DOMRect
}

function make(props: Partial<Props>) {
  const runtime = createVanillaRuntime()
  const service = createService(tourMachine, { runtime, props: () => ({ defaultOpen: true, ...props }) as Props })
  runtime.start()
  return {
    api: () => connectTour(service, normalizeProps),
    stop: () => runtime.stop(),
  }
}

async function settle(): Promise<void> {
  await Promise.resolve()
  await Promise.resolve()
}

/** 一块 400×300 的区域（40, 60 起），里面一个 100×40 的目标（50, 80 起）。 */
function scene(): { area: HTMLElement, target: HTMLElement } {
  const area = document.createElement('div')
  const target = document.createElement('div')
  area.append(target)
  document.body.append(area)
  stubRect(area, { x: 40, y: 60, width: 400, height: 300 })
  stubRect(target, { x: 50, y: 80, width: 100, height: 40 })
  return { area, target }
}

afterEach(() => {
  document.body.innerHTML = ''
})

describe('引导 · boundary', () => {
  it('居中步：遮罩与定位层铺满区域，对话框不标 aria-modal', async () => {
    const { area } = scene()
    const t = make({ steps: [{ id: 'a' }], boundary: area })
    await settle()
    const api = t.api()
    const box = { left: '40px', top: '60px', right: 'auto', bottom: 'auto', inlineSize: '400px', blockSize: '300px' }
    expect((api.getBackdropProps() as Dict).style).toEqual(box)
    expect((api.getPositionerProps() as Dict).style).toMatchObject({ ...box, position: 'fixed' })
    expect((api.getContentProps() as Dict)['aria-modal']).toBeUndefined()
    t.stop()
  })

  it('锚定步：高亮框按区域裁剪，裁剪框是区域相对高亮框四条边的距离；定位层的坐标交给引擎、不铺区域', async () => {
    const { area, target } = scene()
    const t = make({ steps: [{ id: 'a', target }], boundary: () => area, spotlightPadding: 8 })
    await settle()
    const api = t.api()
    // 高亮框 (42, 72) 116×56；区域 (40, 60) 400×300
    expect((api.getSpotlightProps() as Dict).style).toMatchObject({ clipPath: 'inset(-12px -282px -232px -2px)' })
    expect((api.getPositionerProps() as Dict).style).toMatchObject({ right: '', bottom: '', inlineSize: '', blockSize: '' })
    t.stop()
  })

  it('没给 boundary 或取不到时照旧整个视口：几何写空串交回皮肤，对话框标 aria-modal', async () => {
    const { target } = scene()
    for (const boundary of [undefined, '#missing']) {
      const t = make({ steps: [{ id: 'a', target }], boundary })
      await settle()
      const api = t.api()
      expect((api.getBackdropProps() as Dict).style).toEqual({ left: '', top: '', right: '', bottom: '', inlineSize: '', blockSize: '' })
      expect((api.getSpotlightProps() as Dict).style).toMatchObject({ clipPath: '' })
      expect((api.getContentProps() as Dict)['aria-modal']).toBe('true')
      t.stop()
    }
  })
})
