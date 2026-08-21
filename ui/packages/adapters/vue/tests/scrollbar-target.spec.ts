// @vitest-environment jsdom
//
// 滚动条挂的是作者的滚动容器，而模板 ref 在挂载那一拍才有值。
// 这里钉住「用模板 ref 交容器」这条最常见的写法真能接上——机器只在挂载那一拍挂一次监听器，
// 早一步查就永远是 null，症状是滚动条一动不动而控制台一声不吭。
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, defineComponent, h, nextTick, ref } from 'vue'
import { XhScrollbarRoot, XhScrollbarThumb, XhScrollbarTrack } from '../src'

let unmount: (() => void) | null = null

/** jsdom 不做布局：可视区 100、内容 400、轨道 100，于是滑块占四分之一。 */
function stubBox(el: HTMLElement): void {
  let top = 0
  Object.defineProperties(el, {
    clientHeight: { configurable: true, get: () => 100 },
    clientWidth: { configurable: true, get: () => 100 },
    scrollHeight: { configurable: true, get: () => 400 },
    scrollWidth: { configurable: true, get: () => 400 },
    scrollTop: { configurable: true, get: () => top, set: (v: number) => { top = Math.min(Math.max(v, 0), 300) } },
  })
}

function stubTrack(el: HTMLElement): void {
  Object.defineProperties(el, {
    clientHeight: { configurable: true, get: () => 100 },
    clientWidth: { configurable: true, get: () => 10 },
  })
}

afterEach(() => {
  unmount?.()
  unmount = null
  document.body.innerHTML = ''
})

describe('滚动条与作者的滚动容器', () => {
  it('模板 ref 交出来的容器接得上：量得到尺寸，滚动后滑块跟着走', async () => {
    const host = document.createElement('div')
    document.body.appendChild(host)

    const box = ref<HTMLElement | null>(null)
    const app = createApp(defineComponent({
      setup: () => () => [
        h('div', { ref: box }, '一段很长的内容'),
        h(XhScrollbarRoot, { scrollable: box.value, type: 'always' }, () => [
          h(XhScrollbarTrack, () => [h(XhScrollbarThumb)]),
        ]),
      ],
    }))
    app.mount(host)
    unmount = () => {
      app.unmount()
      host.remove()
    }

    // 尺寸桩要在机器量之前打上；ref 这时已经有值（挂载补丁期赋的）
    expect(box.value).not.toBeNull()
    stubBox(box.value!)
    stubTrack(host.querySelector<HTMLElement>('[data-part="track"]')!)

    // 效应推迟一拍才挂监听器与首次测量
    await nextTick()
    await new Promise<void>(resolve => queueMicrotask(resolve))
    await nextTick()

    const thumb = host.querySelector<HTMLElement>('[data-part="thumb"]')!
    expect(thumb.style.blockSize).toBe('25%')
    expect(thumb.style.insetBlockStart).toBe('0%')

    box.value!.scrollTop = 150
    box.value!.dispatchEvent(new Event('scroll'))
    await nextTick()
    // 150/300 × (1 − 0.25) = 0.375
    expect(thumb.style.insetBlockStart).toBe('37.5%')
  })
})
