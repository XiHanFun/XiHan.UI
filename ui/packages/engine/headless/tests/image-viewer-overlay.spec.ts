// @vitest-environment jsdom
// 展开期的两个消解开关：Escape 与层外交互。要真 DOM，因此走 jsdom——
// 机器把 config/registerLayer/getContentEl 塞进 refs 后，trackOverlay 才会装配消解层。
import type { Service } from '@xihan-ui/core'
import type { ImageViewerOpenChangeDetails, ImageViewerSchema } from '../src/image-viewer'
import { createRuntimeConfig, createService } from '@xihan-ui/core'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'
import { afterEach, describe, expect, it } from 'vitest'
import { imageViewerMachine } from '../src/image-viewer'

interface DomHarness {
  service: Service<ImageViewerSchema>
  content: HTMLElement
  /** 铺满视口、图片之外的那一圈；点空白落在它上面，是层外交互的实际来路。 */
  positioner: HTMLElement
  /** 收到的每一次 onOpenChange，按先后排列。 */
  changes: ImageViewerOpenChangeDetails[]
  /** 宿主改 prop：机器下一次读到的就是新值。 */
  setProps: (patch: ImageViewerSchema['props']) => void
  stop: () => void
}

const live: DomHarness[] = []

function makeDomHarness(initial: ImageViewerSchema['props'] = {}): DomHarness {
  // 浮层落点的结构照适配器：遮罩与视口层并排，内容住在视口层里
  const portal = document.createElement('div')
  const backdrop = document.createElement('div')
  const positioner = document.createElement('div')
  const content = document.createElement('div')
  content.tabIndex = -1
  positioner.append(content)
  portal.append(backdrop, positioner)
  document.body.append(portal)

  const config = createRuntimeConfig()
  const changes: ImageViewerOpenChangeDetails[] = []

  let props: ImageViewerSchema['props'] = { ...initial, onOpenChange: d => changes.push(d) }
  const runtime = createVanillaRuntime()
  const service = createService(imageViewerMachine, { props: () => props, runtime })
  service.refs.set('config', config)
  service.refs.set('registerLayer', () => config.layerRegistry.register({
    kind: 'modal',
    node: () => content,
    branches: () => [],
    isModal: () => true,
    setModal: () => {},
    surfaces: () => [backdrop],
  }))
  service.refs.set('getContentEl', () => content)
  runtime.start()

  const harness: DomHarness = {
    service,
    content,
    positioner,
    changes,
    setProps: (patch) => {
      props = { ...props, ...patch }
    },
    // 停运行时即拆掉所有效应，消解层与层注册一并撤销
    stop: () => runtime.stop(),
  }
  live.push(harness)
  return harness
}

afterEach(() => {
  for (const h of live.splice(0)) h.stop()
  document.body.innerHTML = ''
})

/** 展开并等到消解层的监听器注册上（它延后一拍，避开打开自己的那一次交互）。 */
async function open(h: DomHarness): Promise<void> {
  h.service.send({ type: 'OPEN' })
  await new Promise(resolve => setTimeout(resolve, 0))
}

function press(el: HTMLElement, key: string): void {
  el.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }))
}

function pointerDown(el: HTMLElement): void {
  el.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true, button: 0 }))
}

function focusIn(el: HTMLElement): void {
  el.dispatchEvent(new FocusEvent('focusin', { bubbles: true }))
}

describe('imageViewer 展开期的消解开关', () => {
  it('缺省下 Escape 关闭，回调报 esc', async () => {
    const h = makeDomHarness()
    await open(h)
    press(h.content, 'Escape')
    expect(h.service.state.get()).toBe('closed')
    expect(h.changes).toEqual([{ open: true }, { open: false, reason: 'esc' }])
  })

  it('展开之后把 closeOnEscape 改成 false：Escape 不再关，改回 true 又关得掉', async () => {
    const h = makeDomHarness()
    await open(h)

    // 开着的时候才改：走的是宿主在展开途中改 prop 这条路
    h.setProps({ closeOnEscape: false })
    press(h.content, 'Escape')
    expect(h.service.state.get()).toBe('open')
    expect(h.changes).toEqual([{ open: true }])

    h.setProps({ closeOnEscape: true })
    press(h.content, 'Escape')
    expect(h.service.state.get()).toBe('closed')
    expect(h.changes).toEqual([{ open: true }, { open: false, reason: 'esc' }])
  })

  it('缺省下点图片之外那一圈关闭，回调报 interact-outside', async () => {
    const h = makeDomHarness()
    await open(h)
    pointerDown(h.positioner)
    expect(h.service.state.get()).toBe('closed')
    expect(h.changes).toEqual([{ open: true }, { open: false, reason: 'interact-outside' }])
  })

  it('展开之后把 closeOnInteractOutside 改成 false：点层外不再关，改回 true 又关得掉', async () => {
    const h = makeDomHarness()
    await open(h)

    h.setProps({ closeOnInteractOutside: false })
    pointerDown(h.positioner)
    expect(h.service.state.get()).toBe('open')
    expect(h.changes).toEqual([{ open: true }])

    h.setProps({ closeOnInteractOutside: true })
    pointerDown(h.positioner)
    expect(h.service.state.get()).toBe('closed')
  })

  it('焦点落到层外这一路同样归 closeOnInteractOutside 管', async () => {
    const h = makeDomHarness({ closeOnInteractOutside: false })
    await open(h)
    focusIn(h.positioner)
    expect(h.service.state.get()).toBe('open')

    h.setProps({ closeOnInteractOutside: true })
    focusIn(h.positioner)
    expect(h.service.state.get()).toBe('closed')
    expect(h.changes.at(-1)).toEqual({ open: false, reason: 'interact-outside' })
  })
})
