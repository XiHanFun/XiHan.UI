// @vitest-environment jsdom
// 收起态也能换下标：缩略图墙上点哪一张，先把下标换过去再展开，看片层一打开就是那一张。
// 此前收起态不收 INDEX.SET，适配器先换下标再展开时换下标被丢掉，点哪张都从第一张打开；
// 只能先展开、再换下标，展开那一瞬间先闪一下上次看的那张。
import type { ImageViewerSchema } from '../src/image-viewer'
import { createService, normalizeProps } from '@xihan-ui/core'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'
import { afterEach, describe, expect, it } from 'vitest'
import { connectImageViewer, imageViewerMachine } from '../src/image-viewer'

type Props = ImageViewerSchema['props']

const THREE: Props = { collection: [{ src: 'a.png' }, { src: 'b.png' }, { src: 'c.png' }] }
const stops: Array<() => void> = []

afterEach(() => {
  for (const stop of stops.splice(0)) stop()
})

function makeViewer(initial: Props = {}) {
  const runtime = createVanillaRuntime()
  const props = runtime.signal<Props>({ ...THREE, ...initial })
  const service = createService(imageViewerMachine, { props: () => props.get(), runtime })
  runtime.start()
  stops.push(() => runtime.stop())
  return { service, api: () => connectImageViewer(service, normalizeProps) }
}

describe('imageViewer 收起态换下标', () => {
  it('收起时 setIndex 生效，展开后看的就是那一张', () => {
    const v = makeViewer()
    expect(v.service.state.get()).toBe('closed')
    v.api().setIndex(2)
    expect(v.api().index).toBe(2)
    v.api().setOpen(true)
    expect(v.service.state.get()).toBe('open')
    expect(v.api().index).toBe(2)
  })

  it('收起时换下标同样报 onIndexChange，越界照旧夹到末张', () => {
    const changes: number[] = []
    const v = makeViewer({ onIndexChange: ({ index }) => changes.push(index) })
    v.api().setIndex(9)
    expect(v.api().index).toBe(2)
    expect(changes).toEqual([2])
  })
})
