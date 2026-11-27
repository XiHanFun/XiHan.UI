// 级联选择的 lazyMount / unmountOnExit 要在真浏览器里验：打开前触发器里的选中文字照旧在、各列不在；
// Enter 展开那一帧各列才挂上，焦点照样落到选中路径的末项；退场动画得真播完才卸。
import type { Root } from 'react-dom/client'
import type { XhCascaderRootProps } from '../../src'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { XhCascaderRoot } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

const globals = globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }

let root: Root | null = null
let host: HTMLElement | null = null

async function inAct(fn: () => void | Promise<void>): Promise<void> {
  const previous = globals.IS_REACT_ACT_ENVIRONMENT
  globals.IS_REACT_ACT_ENVIRONMENT = true
  try {
    await act(fn)
  }
  finally {
    globals.IS_REACT_ACT_ENVIRONMENT = previous
  }
}

afterEach(async () => {
  await inAct(() => root?.unmount())
  root = null
  host?.remove()
  host = null
})

const COLLECTION = [
  { value: 'zj', label: '浙江', children: [{ value: 'hz', label: '杭州' }, { value: 'nb', label: '宁波' }] },
  { value: 'js', label: '江苏', children: [{ value: 'nj', label: '南京' }] },
]

function part(name: string): HTMLElement | null {
  return document.querySelector<HTMLElement>(`[data-scope='cascader'][data-part='${name}']`)
}

const items = (): HTMLElement[] => [...document.querySelectorAll<HTMLElement>(`[data-scope='cascader'][data-part='item']`)]

async function render(props: XhCascaderRootProps): Promise<(next: XhCascaderRootProps) => Promise<void>> {
  host = document.createElement('div')
  document.body.append(host)
  root = createRoot(host)
  await inAct(() => root!.render(<XhCascaderRoot {...props} collection={COLLECTION} label="地区" />))
  return next => inAct(() => root!.render(<XhCascaderRoot {...next} collection={COLLECTION} label="地区" />))
}

describe('级联选择 lazyMount', () => {
  it('第一次展开前选中文字在、各列不在；Enter 展开后各列挂上、焦点落在选中路径末项，收起后留着', async () => {
    await render({ lazyMount: true, defaultValue: [['zj', 'hz']] })
    expect(part('value-text')!.textContent).toBe('浙江 / 杭州')
    expect(part('content')).not.toBeNull()
    expect(items()).toHaveLength(0)

    part('trigger')!.focus()
    await userEvent.keyboard('{Enter}')
    await expect.poll(() => document.activeElement?.getAttribute('data-value')).toBe('hz')
    expect(items().length).toBeGreaterThan(0)

    await userEvent.keyboard('{Escape}')
    await expect.poll(() => getComputedStyle(part('content')!).display).toBe('none')
    expect(items().length).toBeGreaterThan(0)
  })
})

describe('级联选择 unmountOnExit', () => {
  it('退场播完才撤各列，下次展开重新铺上', async () => {
    const rerender = await render({ unmountOnExit: true, open: true })
    await expect.poll(() => items().length).toBeGreaterThan(0)
    const first = items()[0]
    await expect.poll(() => part('positioner')!.hasAttribute('data-positioned')).toBe(true)

    await rerender({ unmountOnExit: true, open: false })
    // 退场正在播：各列还在
    expect(items()[0]).toBe(first)
    await expect.poll(() => items().length).toBe(0)
    expect(getComputedStyle(part('content')!).display).toBe('none')

    await rerender({ unmountOnExit: true, open: true })
    await expect.poll(() => items().length).toBeGreaterThan(0)
    expect(items()[0]).not.toBe(first)
  })
})
