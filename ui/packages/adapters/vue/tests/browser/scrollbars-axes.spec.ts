// 双轴宿主与非浮层宿主的自绘条：贴壳的盒、两轴各让一格、不占宽高、静止后收起。
//
// 这几件只有真实浏览器量得出来：jsdom 不排版，clientWidth 与 getBoundingClientRect 恒是 0，
// 原生条占不占位、退场那支过渡播不播得出来，都要真皮肤真布局。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import { XhJsonViewerRoot } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

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

/** 等某个条件成立，最多等 ms 毫秒。 */
async function waitUntil(ok: () => boolean, ms = 2000): Promise<void> {
  const deadline = Date.now() + ms
  while (!ok() && Date.now() < deadline)
    await new Promise<void>(resolve => setTimeout(resolve, 30))
}

function mount(node: () => unknown): void {
  host = document.createElement('div')
  document.body.append(host)
  app = createApp({ setup: () => () => node() })
  app.mount(host)
}

function part(scope: string, name: string): HTMLElement {
  return host!.querySelector<HTMLElement>(`[data-scope="${scope}"][data-part="${name}"]`)!
}

/** 壳里那几条条子，按摆出来的先后。 */
function bars(shell: HTMLElement): HTMLElement[] {
  return [...shell.querySelectorAll<HTMLElement>('[data-scope="scrollbar"][data-part="root"]')]
}

/** 真的滚一次并等它派完 scroll 事件。 */
async function scrollTo(el: HTMLElement, top: number, left = 0): Promise<void> {
  const settled = new Promise<void>((resolve) => {
    const done = (): void => {
      el.removeEventListener('scroll', done)
      resolve()
    }
    el.addEventListener('scroll', done)
    setTimeout(done, 500)
  })
  el.scrollTop = top
  el.scrollLeft = left
  await settled
  await nextTick()
}

/**
 * 容器限高 120px、键多到装不下：竖轴溢出。
 * 横轴用原文档——树档的行是 nowrap 的弹性盒、值那格自己省略号收边，横向本就撑不破。
 */
async function mountViewer(view?: 'text'): Promise<HTMLElement> {
  const value: Record<string, unknown> = { note: `长串-${'x'.repeat(200)}` }
  for (let i = 0; i < 30; i++)
    value[`key${i}`] = i
  mount(() => h(XhJsonViewerRoot, {
    value,
    view,
    style: '--xh-json-viewer-max-h: 120px; inline-size: 240px',
  }))
  await tick()
  return part('json-viewer', view === 'text' ? 'text' : 'tree')
}

/** 边框占的那几像素不是滚动条留的槽，量让位时要先减掉。 */
function gutterOf(el: HTMLElement): { inline: number, block: number } {
  const style = getComputedStyle(el)
  const inline = Number.parseFloat(style.borderLeftWidth) + Number.parseFloat(style.borderRightWidth)
  const block = Number.parseFloat(style.borderTopWidth) + Number.parseFloat(style.borderBottomWidth)
  return {
    inline: el.offsetWidth - el.clientWidth - inline,
    block: el.offsetHeight - el.clientHeight - block,
  }
}

describe('json-viewer 的双轴自绘条', () => {
  it('两条轴各摆一条，交叉口只画在竖条里', async () => {
    await mountViewer()

    const roots = bars(part('json-viewer', 'root'))
    expect(roots.map(el => el.getAttribute('data-orientation'))).toEqual(['vertical', 'horizontal'])
    const corners = part('json-viewer', 'root')
      .querySelectorAll('[data-scope="scrollbar"][data-part="corner"]')
    expect(corners).toHaveLength(1)
    expect(roots[0]!.contains(corners[0]!)).toBe(true)
  })

  it('两条轴都溢出：各让出交叉口那一格，交叉口露面', async () => {
    const layer = await mountViewer('text')
    expect(layer.scrollHeight).toBeGreaterThan(layer.clientHeight)
    expect(layer.scrollWidth).toBeGreaterThan(layer.clientWidth)

    const roots = bars(part('json-viewer', 'root'))
    await waitUntil(() => roots.every(el => el.hasAttribute('data-gutter')))
    expect(roots.map(el => el.hasAttribute('data-gutter'))).toEqual([true, true])
    expect(part('json-viewer', 'root')
      .querySelector<HTMLElement>('[data-scope="scrollbar"][data-part="corner"]')!
      .hasAttribute('hidden')).toBe(false)
  })

  it('只有竖轴溢出时两条都不让位，交叉口收着', async () => {
    await mountViewer()

    const roots = bars(part('json-viewer', 'root'))
    expect(roots.map(el => el.hasAttribute('data-gutter'))).toEqual([false, false])
    expect(part('json-viewer', 'root')
      .querySelector<HTMLElement>('[data-scope="scrollbar"][data-part="corner"]')!
      .hasAttribute('hidden')).toBe(true)
  })

  it('不占宽高：原生条已藏，容器一格槽都不留', async () => {
    const layer = await mountViewer('text')

    expect(layer.getAttribute('data-xh-scrollbar')).toBe('2')
    expect(gutterOf(layer)).toEqual({ inline: 0, block: 0 })
  })

  it('条子贴壳的内边距盒：竖条在行末缘，横条在下缘', async () => {
    const layer = await mountViewer('text')
    // 露出来再量：收着时 visibility 是 hidden，但盒子照样在
    layer.dispatchEvent(new PointerEvent('pointerenter'))
    await tick()

    const shell = part('json-viewer', 'root').getBoundingClientRect()
    const [vertical, horizontal] = bars(part('json-viewer', 'root')).map(el => el.getBoundingClientRect())
    expect(vertical!.right).toBeCloseTo(shell.right, 1)
    expect(horizontal!.bottom).toBeCloseTo(shell.bottom, 1)
    // 都落在壳之内：条子浮在内容上，不是排在内容外边
    expect(vertical!.left).toBeGreaterThanOrEqual(shell.left - 1)
    expect(horizontal!.top).toBeGreaterThanOrEqual(shell.top - 1)
  })

  it('滚到底连跑两轮，内容尺寸不长大', async () => {
    const layer = await mountViewer('text')
    const before = { h: layer.scrollHeight, w: layer.scrollWidth }
    for (let round = 0; round < 2; round++) {
      await scrollTo(layer, layer.scrollHeight - layer.clientHeight, layer.scrollWidth - layer.clientWidth)
      await scrollTo(layer, 0, 0)
    }
    expect({ h: layer.scrollHeight, w: layer.scrollWidth }).toEqual(before)
  })

  it('缺省档滚一下露出，停下再收回', async () => {
    const layer = await mountViewer()
    const bar = bars(part('json-viewer', 'root'))[0]!
    expect(bar.getAttribute('data-state')).toBe('hidden')

    await scrollTo(layer, 60)
    expect(bar.getAttribute('data-state')).toBe('visible')
    expect(getComputedStyle(bar).visibility).toBe('visible')

    // 退场是一支过渡，visibility 落到 hidden 比状态改口晚一段
    await waitUntil(() => getComputedStyle(bar).visibility === 'hidden')
    expect(bar.getAttribute('data-state')).toBe('hidden')
  })
})
