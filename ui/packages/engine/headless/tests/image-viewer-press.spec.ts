// @vitest-environment jsdom
// 按压通道：十颗按钮共用一台机器，按 part 键记按住的那一颗。指针会话的效应要一份 document，故走 jsdom；按钮的属性只比对 connect 的返回值。
import type { ImageViewerSchema } from '../src/image-viewer'
import { createService, normalizeProps } from '@xihan-ui/core'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'
import { describe, expect, it } from 'vitest'
import { connectImageViewer, imageViewerMachine } from '../src/image-viewer'

type Props = ImageViewerSchema['props']
type Dict = Record<string, unknown>

const THREE: Props = { collection: [{ src: 'a.png' }, { src: 'b.png' }, { src: 'c.png' }] }

const key = (name: string): KeyboardEvent => ({ key: name, repeat: false, isComposing: false, keyCode: 0 } as KeyboardEvent)
const fire = (attrs: Dict, name: string, event: unknown): void => (attrs[name] as (e: unknown) => void)(event)

/** 按压通道要盯 transform / index / props 的 watch，props 走 signal 才会复查。 */
function makeViewer(initial: Props = {}) {
  const runtime = createVanillaRuntime()
  const props = runtime.signal<Props>({ ...THREE, defaultOpen: true, ...initial })
  const service = createService(imageViewerMachine, { props: () => props.get(), runtime })
  runtime.start()
  const api = () => connectImageViewer(service, normalizeProps)
  return {
    service,
    api,
    state: () => service.state.get(),
    close: () => api().getCloseTriggerProps() as Dict,
    zoomIn: () => api().getZoomInTriggerProps() as Dict,
    zoomOut: () => api().getZoomOutTriggerProps() as Dict,
    rotateLeft: () => api().getRotateLeftTriggerProps() as Dict,
    reset: () => api().getResetTriggerProps() as Dict,
    prev: () => api().getPrevTriggerProps() as Dict,
    next: () => api().getNextTriggerProps() as Dict,
    setProps: (next: Props) => props.set({ ...props.get(), ...next }),
    stop: () => runtime.stop(),
  }
}

describe('connectImageViewer 按压通道：Space / Enter 与触屏按住投影 data-pressed', () => {
  it('keydown 在场、keyup 撤下；触屏按下在场、抬起 / 取消撤下；失焦撤下；鼠标按下不走这一路；变换不动', () => {
    const v = makeViewer()
    expect(v.rotateLeft()['data-pressed']).toBeUndefined()
    fire(v.rotateLeft(), 'onKeyDown', key(' '))
    expect(v.rotateLeft()['data-pressed']).toBe('')
    fire(v.rotateLeft(), 'onKeyUp', key(' '))
    expect(v.rotateLeft()['data-pressed']).toBeUndefined()
    fire(v.rotateLeft(), 'onKeyDown', key('Enter'))
    expect(v.rotateLeft()['data-pressed']).toBe('')
    fire(v.rotateLeft(), 'onBlur', {})
    expect(v.rotateLeft()['data-pressed']).toBeUndefined()
    fire(v.rotateLeft(), 'onPointerDown', { pointerType: 'touch' })
    expect(v.rotateLeft()['data-pressed']).toBe('')
    fire(v.rotateLeft(), 'onPointerCancel', {})
    expect(v.rotateLeft()['data-pressed']).toBeUndefined()
    fire(v.rotateLeft(), 'onPointerDown', { pointerType: 'touch' })
    expect(v.rotateLeft()['data-pressed']).toBe('')
    fire(v.rotateLeft(), 'onPointerUp', {})
    expect(v.rotateLeft()['data-pressed']).toBeUndefined()
    fire(v.rotateLeft(), 'onPointerDown', { pointerType: 'mouse' })
    expect(v.rotateLeft()['data-pressed']).toBeUndefined()
    expect(v.api().transform.rotate).toBe(0)
    v.stop()
  })

  it('十颗按钮共用一台机器：只亮按住的那一颗，另一颗的 keyup 松不开它；按住途中激活（旋转 / 复位）按压面不丢', () => {
    const v = makeViewer()
    fire(v.close(), 'onKeyDown', key('Enter'))
    expect(v.close()['data-pressed']).toBe('')
    expect(v.zoomIn()['data-pressed']).toBeUndefined()
    expect(v.reset()['data-pressed']).toBeUndefined()
    fire(v.reset(), 'onKeyUp', key('Enter'))
    expect(v.close()['data-pressed']).toBe('')
    fire(v.close(), 'onKeyUp', key('Enter'))
    expect(v.close()['data-pressed']).toBeUndefined()

    fire(v.rotateLeft(), 'onPointerDown', { pointerType: 'touch' })
    ;(v.rotateLeft().onClick as () => void)()
    expect(v.api().transform.rotate).toBe(-90)
    expect(v.rotateLeft()['data-pressed']).toBe('')
    fire(v.rotateLeft(), 'onPointerUp', {})
    expect(v.rotateLeft()['data-pressed']).toBeUndefined()
    v.stop()
  })

  it('禁用不进：贴住端点的缩放钮、不回绕时到边界的翻页钮；loop 缺省开着两端都进', () => {
    const v = makeViewer({ maxScale: 1, loop: false })
    expect(v.zoomIn().disabled).toBe(true)
    fire(v.zoomIn(), 'onKeyDown', key(' '))
    expect(v.zoomIn()['data-pressed']).toBeUndefined()
    fire(v.zoomIn(), 'onPointerDown', { pointerType: 'touch' })
    expect(v.zoomIn()['data-pressed']).toBeUndefined()
    expect(v.prev().disabled).toBe(true)
    fire(v.prev(), 'onKeyDown', key(' '))
    expect(v.prev()['data-pressed']).toBeUndefined()
    v.stop()

    const looped = makeViewer()
    fire(looped.prev(), 'onKeyDown', key(' '))
    expect(looped.prev()['data-pressed']).toBe('')
    fire(looped.prev(), 'onKeyUp', key(' '))
    looped.stop()
  })

  it('按住途中转禁用自收：按住 Enter 一路放大到 maxScale、翻到末张、宿主关掉 loop 或收紧端点', () => {
    const v = makeViewer({ maxScale: 1.5, zoomStep: 0.5, loop: false })
    fire(v.zoomIn(), 'onKeyDown', key('Enter'))
    expect(v.zoomIn()['data-pressed']).toBe('')
    ;(v.zoomIn().onClick as () => void)()
    expect(v.api().transform.scale).toBe(1.5)
    expect(v.zoomIn().disabled).toBe(true)
    expect(v.zoomIn()['data-pressed']).toBeUndefined()

    v.service.send({ type: 'INDEX.SET', index: 1 })
    fire(v.next(), 'onKeyDown', key('Enter'))
    expect(v.next()['data-pressed']).toBe('')
    ;(v.next().onClick as () => void)()
    expect(v.api().index).toBe(2)
    expect(v.next().disabled).toBe(true)
    expect(v.next()['data-pressed']).toBeUndefined()
    v.stop()

    const looped = makeViewer()
    fire(looped.prev(), 'onKeyDown', key(' '))
    expect(looped.prev()['data-pressed']).toBe('')
    looped.setProps({ loop: false })
    expect(looped.prev().disabled).toBe(true)
    expect(looped.prev()['data-pressed']).toBeUndefined()
    fire(looped.zoomOut(), 'onKeyDown', key(' '))
    expect(looped.zoomOut()['data-pressed']).toBe('')
    looped.setProps({ minScale: 1 })
    expect(looped.zoomOut().disabled).toBe(true)
    expect(looped.zoomOut()['data-pressed']).toBeUndefined()
    looped.stop()
  })

  it('收起即松开：按住 Enter 关掉浮层，关闭钮随内容藏起不会再来 keyup；收起态按住不进', () => {
    const v = makeViewer()
    fire(v.close(), 'onKeyDown', key('Enter'))
    expect(v.close()['data-pressed']).toBe('')
    ;(v.close().onClick as () => void)()
    expect(v.state()).toBe('closed')
    expect(v.close()['data-pressed']).toBeUndefined()
    fire(v.close(), 'onKeyDown', key('Enter'))
    expect(v.close()['data-pressed']).toBeUndefined()
    v.service.send({ type: 'OPEN' })
    fire(v.close(), 'onKeyDown', key('Enter'))
    expect(v.close()['data-pressed']).toBe('')
    v.stop()
  })
})
