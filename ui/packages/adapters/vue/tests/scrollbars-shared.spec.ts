// @vitest-environment jsdom
//
// 自绘条的共享层：条子由这一层建，宿主只交「谁在滚」与「摆哪几条轴」。
// 这里钉住四件事：条子是滚动层的兄弟、挂在壳上；建出来的节点一个 data-xh-part 都不带
// （带了会被 WC 侧宿主的 discoverParts 收进 partMap）；滚动容器被打上标记好让皮肤藏掉原生条；
// 双轴时交叉口只画在竖条里、让位跟着另一条轴的实测溢出走。
import type { Orientation } from '@xihan-ui/kernel'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, defineComponent, h, nextTick, ref } from 'vue'
import { XhComboboxRoot } from '../src'
import { useScrollbars } from '../src/runtime/use-scrollbars'

let unmount: (() => void) | null = null

afterEach(() => {
  unmount?.()
  unmount = null
  document.body.innerHTML = ''
})

/** jsdom 不做布局：两条轴的可视区与内容长度逐个钉死。 */
function stubBox(el: HTMLElement, vertical: [number, number], horizontal: [number, number]): void {
  let top = 0
  let left = 0
  Object.defineProperties(el, {
    clientHeight: { configurable: true, get: () => vertical[0] },
    scrollHeight: { configurable: true, get: () => vertical[1] },
    clientWidth: { configurable: true, get: () => horizontal[0] },
    scrollWidth: { configurable: true, get: () => horizontal[1] },
    scrollTop: { configurable: true, get: () => top, set: (v: number) => { top = v } },
    scrollLeft: { configurable: true, get: () => left, set: (v: number) => { left = v } },
  })
}

/** 效应推迟一拍才挂监听器与首次测量，跨轴的让位还要再等一轮重算。 */
async function settle(): Promise<void> {
  await nextTick()
  await new Promise<void>(resolve => queueMicrotask(resolve))
  await nextTick()
  await nextTick()
}

interface Mounted {
  shell: HTMLElement
  scroller: HTMLElement
}

/** 一个壳、一个滚动层、若干条子——最小的宿主形状。 */
function mountBars(options: {
  axes?: readonly Orientation[]
  vertical?: [number, number]
  horizontal?: [number, number]
} = {}): Mounted {
  const host = document.createElement('div')
  document.body.appendChild(host)
  const box = ref<HTMLElement | null>(null)
  const app = createApp(defineComponent({
    setup() {
      const bars = useScrollbars({
        scrollable: () => box.value,
        axes: options.axes,
        props: { type: 'auto' },
      })
      return () => h('div', { 'data-role': 'shell' }, [
        h('div', { 'ref': box, 'data-role': 'scroller' }, '一段很长的内容'),
        ...bars.render(),
      ])
    },
  }))
  app.mount(host)
  unmount = () => {
    app.unmount()
    host.remove()
  }
  stubBox(box.value!, options.vertical ?? [100, 400], options.horizontal ?? [100, 100])
  return {
    shell: host.querySelector<HTMLElement>('[data-role="shell"]')!,
    scroller: box.value!,
  }
}

function roots(shell: HTMLElement): HTMLElement[] {
  return [...shell.querySelectorAll<HTMLElement>('[data-scope="scrollbar"][data-part="root"]')]
}

describe('共享层建出来的条子', () => {
  it('挂在壳上、是滚动层的兄弟，三层齐全', async () => {
    const { shell, scroller } = mountBars()
    await settle()

    const [root] = roots(shell)
    expect(root).toBeDefined()
    expect(root!.parentElement).toBe(shell)
    expect(root!.previousElementSibling).toBe(scroller)
    expect(root!.querySelector('[data-scope="scrollbar"][data-part="track"]')).not.toBeNull()
    expect(root!.querySelector('[data-scope="scrollbar"][data-part="thumb"]')).not.toBeNull()
  })

  it('一个 data-xh-part 都不带', async () => {
    const { shell } = mountBars()
    await settle()

    const nodes = [...shell.querySelectorAll<HTMLElement>('[data-scope="scrollbar"]')]
    expect(nodes.length).toBeGreaterThan(0)
    for (const node of nodes)
      expect(node.hasAttribute('data-xh-part')).toBe(false)
  })

  it('滚动容器带上标记，原生条交给皮肤藏掉', async () => {
    const { scroller } = mountBars()
    await settle()

    expect(scroller.getAttribute('data-xh-scrollbar')).toBe('1')
  })

  it('滑块的长度按实测尺寸算，滚动后跟着走', async () => {
    const { shell, scroller } = mountBars()
    await settle()

    const thumb = shell.querySelector<HTMLElement>('[data-scope="scrollbar"][data-part="thumb"]')!
    expect(thumb.style.blockSize).toBe('25%')

    scroller.scrollTop = 150
    scroller.dispatchEvent(new Event('scroll'))
    await nextTick()
    // 150/300 × (1 − 0.25) = 0.375
    expect(thumb.style.insetBlockStart).toBe('37.5%')
  })
})

describe('两条轴一起摆', () => {
  it('交叉口只画在竖条里', async () => {
    const { shell } = mountBars({
      axes: ['vertical', 'horizontal'],
      vertical: [100, 400],
      horizontal: [100, 400],
    })
    await settle()

    const corners = [...shell.querySelectorAll<HTMLElement>('[data-scope="scrollbar"][data-part="corner"]')]
    expect(corners).toHaveLength(1)
    expect(corners[0]!.closest('[data-part="root"]')?.getAttribute('data-orientation')).toBe('vertical')
    expect(corners[0]!.hasAttribute('hidden')).toBe(false)
  })

  it('两条轴都溢出时各自让出交叉口那一格', async () => {
    const { shell } = mountBars({
      axes: ['vertical', 'horizontal'],
      vertical: [100, 400],
      horizontal: [100, 400],
    })
    await settle()

    expect(roots(shell).map(el => el.hasAttribute('data-gutter'))).toEqual([true, true])
  })

  it('只有一条轴溢出时两条都不让位，交叉口也收着', async () => {
    const { shell } = mountBars({
      axes: ['vertical', 'horizontal'],
      vertical: [100, 400],
      horizontal: [100, 100],
    })
    await settle()

    expect(roots(shell).map(el => el.hasAttribute('data-gutter'))).toEqual([false, false])
    const corner = shell.querySelector<HTMLElement>('[data-scope="scrollbar"][data-part="corner"]')!
    expect(corner.hasAttribute('hidden')).toBe(true)
  })
})

describe('接进宿主', () => {
  function mountCombobox(): HTMLElement {
    const host = document.createElement('div')
    document.body.appendChild(host)
    const app = createApp(defineComponent({
      setup: () => () => h(XhComboboxRoot, {
        defaultOpen: true,
        collection: [{ value: 'apple', label: '苹果' }],
      }),
    }))
    app.mount(host)
    unmount = () => {
      app.unmount()
      host.remove()
    }
    return host
  }

  it('组合框的条子落在 positioner 里，与 content 同级', async () => {
    mountCombobox()
    await settle()

    const positioner = document.querySelector<HTMLElement>('[data-scope="combobox"][data-part="positioner"]')!
    const root = positioner.querySelector<HTMLElement>('[data-scope="scrollbar"][data-part="root"]')!
    expect(root.parentElement).toBe(positioner)
    expect(positioner.querySelector('[data-scope="combobox"][data-part="content"]')?.parentElement).toBe(positioner)
    expect(root.hasAttribute('data-xh-part')).toBe(false)
  })

  it('按在条子上不会把浮层消解掉', async () => {
    mountCombobox()
    await settle()

    const content = document.querySelector<HTMLElement>('[data-scope="combobox"][data-part="content"]')!
    const track = document.querySelector<HTMLElement>('[data-scope="scrollbar"][data-part="track"]')!
    expect(content.getAttribute('data-state')).toBe('open')

    track.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true, composed: true }))
    await settle()

    expect(content.getAttribute('data-state')).toBe('open')
  })
})
