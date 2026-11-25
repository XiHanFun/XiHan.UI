// 加载指示器的遮罩形态：遮罩与外框等大、转圈居中，露面时挡住内容的点击与焦点；撤下后内容恢复可用；
// fullscreen 时遮罩钉满视口。几何、命中与 inert 只有真实 Chromium 量得出。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick, ref } from 'vue'
import { XhSpinner } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null
const loading = ref(true)

async function mount(props: Record<string, unknown> = {}): Promise<void> {
  loading.value = true
  host = document.createElement('div')
  host.style.inlineSize = '360px'
  document.body.append(host)
  app = createApp({
    render: () => h(XhSpinner, { overlay: true, loading: loading.value, label: '正在加载', ...props }, () => [
      h('div', { style: 'block-size: 160px' }, [h('button', { type: 'button', id: 'inner' }, '内容里的按钮')]),
    ]),
  })
  app.mount(host)
  await nextTick()
}

function part(name: string): HTMLElement {
  const element = host!.querySelector<HTMLElement>(`[data-scope='spinner'][data-part='${name}']`)
  if (!element)
    throw new Error(`找不到 spinner/${name}`)
  return element
}

function center(element: Element): { x: number, y: number } {
  const rect = element.getBoundingClientRect()
  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
}

/** 等过遮罩撤下的那段淡出（换色时长），visibility 才落。 */
function settle(): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, 400))
}

afterEach(() => {
  app?.unmount()
  host?.remove()
  app = null
  host = null
})

describe('spinner 遮罩形态', () => {
  it('遮罩与外框等大，转圈在遮罩正中', async () => {
    await mount()
    const container = part('container').getBoundingClientRect()
    const mask = part('mask').getBoundingClientRect()
    expect(mask.width).toBeCloseTo(container.width, 0)
    expect(mask.height).toBeCloseTo(container.height, 0)
    expect(mask.top).toBeCloseTo(container.top, 0)
    const root = center(part('root'))
    const middle = center(part('mask'))
    expect(Math.abs(root.x - middle.x)).toBeLessThanOrEqual(1)
    expect(Math.abs(root.y - middle.y)).toBeLessThanOrEqual(1)
  })

  it('露面时挡住内容：点不到里面的按钮，也聚焦不到它', async () => {
    await mount()
    const button = host!.querySelector<HTMLButtonElement>('#inner')!
    const { x, y } = center(button)
    expect(button.contains(document.elementFromPoint(x, y))).toBe(false)
    button.focus()
    expect(document.activeElement).not.toBe(button)
  })

  it('loading 改成 false：遮罩淡出后藏起，内容恢复可点可聚焦', async () => {
    await mount()
    loading.value = false
    await nextTick()
    await settle()
    expect(getComputedStyle(part('mask')).visibility).toBe('hidden')
    const button = host!.querySelector<HTMLButtonElement>('#inner')!
    const { x, y } = center(button)
    expect(button.contains(document.elementFromPoint(x, y))).toBe(true)
    button.focus()
    expect(document.activeElement).toBe(button)
  })

  it('fullscreen：遮罩钉满视口', async () => {
    await mount({ fullscreen: true })
    const mask = part('mask')
    expect(getComputedStyle(mask).position).toBe('fixed')
    const rect = mask.getBoundingClientRect()
    expect(rect.left).toBe(0)
    expect(rect.top).toBe(0)
    expect(rect.width).toBeCloseTo(document.documentElement.clientWidth, 0)
    expect(rect.height).toBeCloseTo(window.innerHeight, 0)
  })
})
