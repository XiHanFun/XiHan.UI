// 标准结构的虚拟化开关：一万条选项只写 virtual，浮层里只铺滚到的那一屏，键盘仍跨完整 collection。
//
// 只有真实浏览器量得出来：视口要靠浮层外壳的高度上限收住才会滚，jsdom 不排版，内核会以为一屏装得下全部。
import type { Root } from 'react-dom/client'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { XhSelectRoot } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

const OPTIONS = Array.from({ length: 10_000 }, (_, index) => ({ value: `option-${index + 1}`, label: `选项 ${index + 1}` }))

/** 窗口里能铺的上限：浮层一屏十来条，加上前后的预渲染，远小于一万。 */
const WINDOW_LIMIT = 60

let root: Root | null = null
let host: HTMLElement | null = null

afterEach(() => {
  act(() => root?.unmount())
  host?.remove()
  root = null
  host = null
})

function items(): HTMLElement[] {
  return [...document.querySelectorAll<HTMLElement>('[data-scope="select"][data-part="item"]')]
}

function highlighted(): string | null {
  const el = items().find(item => item.hasAttribute('data-highlighted'))
  return el?.getAttribute('data-value') ?? el?.getAttribute('value') ?? null
}

async function mount(element: React.ReactNode): Promise<void> {
  host = document.createElement('div')
  document.body.append(host)
  root = createRoot(host)
  await act(async () => {
    root!.render(element)
  })
}

describe('选择器的 virtual 开关', () => {
  it('一万条只铺一屏；视口被浮层收住、由它来滚；End 跨完整 collection 选到末项', async () => {
    const values: string[][] = []
    await mount(<XhSelectRoot collection={OPTIONS} virtual label="长列表" placeholder="请选择" onValueChange={details => values.push(details.value)} />)

    await act(async () => {
      document.querySelector<HTMLElement>('[data-scope="select"][data-part="trigger"]')!.click()
    })
    await expect.poll(() => items().length).toBeGreaterThan(0)

    expect(items().length).toBeLessThanOrEqual(WINDOW_LIMIT)
    const viewport = document.querySelector<HTMLElement>('[data-scope="select"][data-part="content"] > [data-scope="virtualizer"][data-part="viewport"]')!
    expect(viewport).not.toBeNull()
    expect(viewport.clientHeight).toBeGreaterThan(0)
    expect(viewport.clientHeight).toBeLessThan(600)
    expect(viewport.scrollHeight).toBeGreaterThan(OPTIONS.length * 20)
    expect(document.querySelector('[data-scope="select"][data-part="list"]')!.getAttribute('role')).toBe('listbox')

    // 虚拟化那一块到了才补落焦：等焦点进了浮层再按键，之前按下的键本来就落空
    await expect.poll(() => document.querySelector('[data-scope="select"][data-part="content"]')!.contains(document.activeElement)).toBe(true)
    await userEvent.keyboard('{End}')
    await expect.poll(highlighted).toBe('option-10000')
    expect(items().length).toBeLessThanOrEqual(WINDOW_LIMIT)
    await userEvent.keyboard('{Enter}')
    await expect.poll(() => values.at(-1)).toEqual(['option-10000'])
    expect(document.querySelector('[data-scope="select"][data-part="value-text"]')!.textContent).toBe('选项 10000')
  })

  it('lazyMount：第一次展开才铺列表，虚拟化那一块随之加载，焦点照样落进列表', async () => {
    await mount(<XhSelectRoot collection={OPTIONS} virtual lazyMount placeholder="请选择" />)
    expect(items()).toEqual([])
    await act(async () => {
      document.querySelector<HTMLElement>('[data-scope="select"][data-part="trigger"]')!.click()
    })
    await expect.poll(() => items().length).toBeGreaterThan(0)
    expect(items().length).toBeLessThanOrEqual(WINDOW_LIMIT)
    await expect.poll(() => document.querySelector('[data-scope="select"][data-part="content"]')!.contains(document.activeElement)).toBe(true)
    await userEvent.keyboard('{End}')
    await expect.poll(highlighted).toBe('option-10000')
  })

  it('没开 virtual 时照旧铺全部条目', async () => {
    await mount(<XhSelectRoot collection={OPTIONS.slice(0, 200)} placeholder="请选择" />)
    await act(async () => {
      document.querySelector<HTMLElement>('[data-scope="select"][data-part="trigger"]')!.click()
    })
    await expect.poll(() => items().length).toBe(200)
    expect(document.querySelector('[data-scope="virtualizer"]')).toBeNull()
  })
})
