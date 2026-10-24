// 标准结构的虚拟化开关：一万条选项只写 virtual，浮层里只铺滚到的那一屏，键盘仍跨完整 collection。
//
// 只有真实浏览器量得出来：视口要靠浮层外壳的高度上限收住才会滚，jsdom 不排版，内核会以为一屏装得下全部。
import type { SelectNode, SelectValueChangeDetails } from '@xihan-ui/headless'
import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { defineXhElements } from '../../src/define'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

defineXhElements()

const OPTIONS: SelectNode[] = Array.from({ length: 10_000 }, (_, index) => ({ value: `option-${index + 1}`, label: `选项 ${index + 1}` }))

/** 窗口里能铺的上限：浮层一屏十来条，加上前后的预渲染，远小于一万。 */
const WINDOW_LIMIT = 60

type SelectHost = HTMLElement & { collection?: SelectNode[] }

afterEach(() => {
  document.body.innerHTML = ''
})

function items(): HTMLElement[] {
  return [...document.querySelectorAll<HTMLElement>('[data-scope="select"][data-part="item"]')].filter(el => !el.closest('[hidden]'))
}

function highlighted(): string | null {
  const el = items().find(item => item.hasAttribute('data-highlighted'))
  return el?.getAttribute('data-value') ?? el?.getAttribute('value') ?? null
}

function mount(attrs: string, collection: SelectNode[]): SelectHost {
  const host = document.createElement('div')
  host.innerHTML = `<xh-select ${attrs} placeholder="请选择"><div data-xh-part="root"></div></xh-select>`
  document.body.append(host)
  const select = host.querySelector<SelectHost>('xh-select')!
  select.collection = collection
  return select
}

async function trigger(): Promise<HTMLElement> {
  await expect.poll(() => document.querySelector('[data-scope="select"][data-part="trigger"]')).not.toBeNull()
  return document.querySelector<HTMLElement>('[data-scope="select"][data-part="trigger"]')!
}

describe('xh-select 的 virtual 开关', () => {
  it('一万条只铺一屏；视口被浮层收住、由它来滚；End 跨完整 collection 选到末项', async () => {
    const select = mount('virtual label="长列表"', OPTIONS)
    const values: string[][] = []
    select.addEventListener('value-change', event => values.push((event as CustomEvent<SelectValueChangeDetails>).detail.value))
    // 挂载即展开：虚拟化那一块还在路上，展开那一刻的落焦会扑空，要靠它到了之后补回来
    ;(await trigger()).click()
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
    await expect.poll(() => document.querySelector('[data-scope="select"][data-part="value-text"]')!.textContent).toBe('选项 10000')
  })

  it('lazy-mount：第一次展开才铺列表，虚拟化那一块随之加载，焦点照样落进列表', async () => {
    mount('virtual lazy-mount', OPTIONS)
    const button = await trigger()
    expect(items()).toEqual([])
    button.click()
    await expect.poll(() => items().length).toBeGreaterThan(0)
    expect(items().length).toBeLessThanOrEqual(WINDOW_LIMIT)
    await expect.poll(() => document.querySelector('[data-scope="select"][data-part="content"]')!.contains(document.activeElement)).toBe(true)
    await userEvent.keyboard('{End}')
    await expect.poll(highlighted).toBe('option-10000')
  })

  it('没开 virtual 时照旧铺全部条目', async () => {
    mount('', OPTIONS.slice(0, 200))
    ;(await trigger()).click()
    await expect.poll(() => items().length).toBe(200)
    expect(document.querySelector('[data-scope="virtualizer"]')).toBeNull()
  })
})
