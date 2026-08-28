// @vitest-environment jsdom
// 展开期的两个消解开关：Escape 与层外交互。要真 DOM，因此走 jsdom——
// 机器把 config/registerLayer/getContentEl 塞进 refs 后，trackOverlay 才会装配消解层。
import type { Service } from '@xihan-ui/machine'
import type { ImageViewerSchema } from '../src/image-viewer'
import { createRuntimeConfig } from '@xihan-ui/kernel'
import { createService } from '@xihan-ui/machine'
import { createVanillaRuntime } from '@xihan-ui/machine/vanilla'
import { afterEach, describe, expect, it } from 'vitest'
import { imageViewerMachine } from '../src/image-viewer'

interface DomHarness {
  service: Service<ImageViewerSchema>
  content: HTMLElement
  outside: HTMLElement
  /** 宿主改 prop：机器下一次读到的就是新值。 */
  setProps: (patch: ImageViewerSchema['props']) => void
  stop: () => void
}

const live: DomHarness[] = []

function makeDomHarness(initial: ImageViewerSchema['props'] = {}): DomHarness {
  const outside = document.createElement('div')
  outside.textContent = '页面正文'
  document.body.appendChild(outside)

  const host = document.createElement('div')
  const content = document.createElement('div')
  content.tabIndex = -1
  host.append(content)
  document.body.appendChild(host)

  const config = createRuntimeConfig()

  let props = initial
  const runtime = createVanillaRuntime()
  const service = createService(imageViewerMachine, { props: () => props, runtime })
  service.refs.set('config', config)
  service.refs.set('registerLayer', () => config.layerRegistry.register({
    kind: 'modal',
    node: () => content,
    branches: () => [],
    isModal: () => true,
    setModal: () => {},
    surfaces: () => [],
  }))
  service.refs.set('getContentEl', () => content)
  runtime.start()

  const harness: DomHarness = {
    service,
    content,
    outside,
    setProps: (patch) => {
      props = { ...props, ...patch }
    },
    stop: () => {
      // 先关掉，让 trackOverlay 拆干净：层留在文档级注册表里会顶掉下一条用例的栈顶
      service.send({ type: 'CLOSE' })
      runtime.stop()
    },
  }
  live.push(harness)
  return harness
}

afterEach(() => {
  for (const h of live.splice(0)) h.stop()
  document.body.innerHTML = ''
})

/** 消解层的监听器延后一拍才注册（避开打开自己的那一次交互）。 */
const settle = (): Promise<void> => new Promise(resolve => setTimeout(resolve, 0))

function press(el: HTMLElement, key: string): void {
  el.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }))
}

/** pointerdown 用 MouseEvent 合成：jsdom 里它同样带 button。 */
function pointerDown(el: HTMLElement): void {
  el.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true, cancelable: true, button: 0 }))
}

describe('imageViewer 展开期的消解开关', () => {
  it('缺省下 Escape 关闭', async () => {
    const h = makeDomHarness()
    h.service.send({ type: 'OPEN' })
    await settle()
    press(h.content, 'Escape')
    expect(h.service.state.get()).toBe('closed')
  })

  it('展开之后把 closeOnEscape 改成 false：Escape 不再关', async () => {
    const h = makeDomHarness()
    h.service.send({ type: 'OPEN' })
    await settle()
    // 开着的时候才改：走的是宿主在展开途中改 prop 这条路
    h.setProps({ closeOnEscape: false })
    press(h.content, 'Escape')
    expect(h.service.state.get()).toBe('open')
  })

  it('缺省下点层外关闭', async () => {
    const h = makeDomHarness()
    h.service.send({ type: 'OPEN' })
    await settle()
    pointerDown(h.outside)
    expect(h.service.state.get()).toBe('closed')
  })

  it('展开之后把 closeOnInteractOutside 改成 false：点层外不再关', async () => {
    const h = makeDomHarness()
    h.service.send({ type: 'OPEN' })
    await settle()
    h.setProps({ closeOnInteractOutside: false })
    pointerDown(h.outside)
    expect(h.service.state.get()).toBe('open')
  })

  it('改回 true 立刻恢复：同一次展开里来回切都算数', async () => {
    const h = makeDomHarness({ closeOnEscape: false })
    h.service.send({ type: 'OPEN' })
    await settle()
    press(h.content, 'Escape')
    expect(h.service.state.get()).toBe('open')

    h.setProps({ closeOnEscape: true })
    press(h.content, 'Escape')
    expect(h.service.state.get()).toBe('closed')
  })
})
