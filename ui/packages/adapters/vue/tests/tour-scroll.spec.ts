// @vitest-environment jsdom
// tour 的滚动跟随：展开与换步把目标滚进视口、滚动事件按帧重量高亮框、remeasure 手动校准。
// jsdom 不做布局也没有 scrollIntoView，目标矩形与滚动行为都由测试自己钉。
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import { XhTourContent, XhTourRoot, XhTourSpotlight, XhTourTitle } from '../src'

interface TourHandle {
  goToNextStep: () => void
  remeasure: () => void
}

async function tick(): Promise<void> {
  await nextTick()
  await nextTick()
  await new Promise(r => setTimeout(r, 0))
  await nextTick()
}

interface Mounted {
  handle: () => TourHandle
  targets: [HTMLElement, HTMLElement]
  unmount: () => void
}

function rect(x: number, y: number): DOMRect {
  return { x, y, width: 50, height: 20, top: y, left: x, right: x + 50, bottom: y + 20, toJSON: () => ({}) } as DOMRect
}

function mountTour(): Mounted {
  const t1 = document.createElement('button')
  t1.id = 'tour-t1'
  const t2 = document.createElement('button')
  t2.id = 'tour-t2'
  document.body.append(t1, t2)
  t1.getBoundingClientRect = () => rect(100, 200)
  t2.getBoundingClientRect = () => rect(300, 400)

  let scope: TourHandle | null = null
  const host = document.createElement('div')
  document.body.appendChild(host)
  const app = createApp({
    setup: () => () =>
      h(XhTourRoot, {
        defaultOpen: true,
        steps: [
          { id: 'a', target: '#tour-t1', title: '第一步' },
          { id: 'b', target: '#tour-t2', title: '第二步' },
        ],
      }, {
        default: (slot: TourHandle) => {
          scope = slot
          return [
            h(XhTourSpotlight),
            h(XhTourContent, null, () => [h(XhTourTitle)]),
          ]
        },
      }),
  })
  app.mount(host)
  return {
    handle: () => {
      if (!scope)
        throw new Error('插槽作用域未就绪')
      return scope
    },
    targets: [t1, t2],
    unmount: () => {
      app.unmount()
      host.remove()
      t1.remove()
      t2.remove()
    },
  }
}

function spotlightStyle(): CSSStyleDeclaration {
  const el = document.querySelector<HTMLElement>('[data-scope="tour"][data-part="spotlight"]')
  if (!el)
    throw new Error('找不到 spotlight')
  return el.style
}

let scrollSpy: ReturnType<typeof vi.fn>

function stubScrollIntoView(): void {
  scrollSpy = vi.fn()
  Element.prototype.scrollIntoView = scrollSpy as unknown as typeof Element.prototype.scrollIntoView
}

afterEach(() => {
  delete (Element.prototype as { scrollIntoView?: unknown }).scrollIntoView
  vi.unstubAllGlobals()
  document.body.innerHTML = ''
})

describe('tour 滚动跟随', () => {
  it('展开即把当前步目标滚进视口，换步滚下一个', async () => {
    stubScrollIntoView()
    const t = mountTour()
    await tick()
    expect(scrollSpy).toHaveBeenCalled()
    expect(scrollSpy.mock.instances.at(0)).toBe(t.targets[0])

    scrollSpy.mockClear()
    t.handle().goToNextStep()
    await tick()
    expect(scrollSpy.mock.instances.at(-1)).toBe(t.targets[1])
    t.unmount()
  })

  it('autoScroll=false 时不滚', async () => {
    stubScrollIntoView()
    const host = document.createElement('div')
    const t1 = document.createElement('button')
    t1.id = 'tour-quiet'
    document.body.append(t1, host)
    const app = createApp({
      setup: () => () =>
        h(XhTourRoot, {
          defaultOpen: true,
          autoScroll: false,
          steps: [{ id: 'a', target: '#tour-quiet', title: '第一步' }],
        }, () => [h(XhTourContent, null, () => [h(XhTourTitle)])]),
    })
    app.mount(host)
    await tick()
    expect(scrollSpy).not.toHaveBeenCalled()
    app.unmount()
  })

  it('滚动事件按帧重量高亮框（捕获段，嵌套容器的滚动也算）', async () => {
    stubScrollIntoView()
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback): number => {
      cb(0)
      return 1
    })
    const t = mountTour()
    await tick()
    // spotlightPadding 默认 8：x=100 → 92px
    expect(spotlightStyle().insetInlineStart).toBe('92px')

    t.targets[0].getBoundingClientRect = () => rect(40, 200)
    window.dispatchEvent(new Event('scroll'))
    await tick()
    expect(spotlightStyle().insetInlineStart).toBe('32px')
    t.unmount()
  })

  it('remeasure 手动校准高亮框', async () => {
    stubScrollIntoView()
    const t = mountTour()
    await tick()
    expect(spotlightStyle().insetInlineStart).toBe('92px')

    t.targets[0].getBoundingClientRect = () => rect(160, 200)
    t.handle().remeasure()
    await tick()
    expect(spotlightStyle().insetInlineStart).toBe('152px')
    t.unmount()
  })
})
