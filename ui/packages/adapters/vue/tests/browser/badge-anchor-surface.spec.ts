// Badge 的尺寸与角标探出比例依赖真实布局，只在 Chromium 中验证。
import type { Size } from '@xihan-ui/core'
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import { XhBadge, XhButton } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

async function mount(size?: Size): Promise<void> {
  host = document.createElement('div')
  host.style.padding = '40px'
  document.body.append(host)
  app = createApp({
    render: () => h(XhBadge, { count: 8, size }, () => h(XhButton, { variant: 'outline' }, () => '收件箱')),
  })
  app.mount(host)
  await nextTick()
  await nextTick()
}

function part(name: string): HTMLElement {
  const element = document.querySelector<HTMLElement>(`[data-scope='badge'][data-part='${name}']`)
  if (!element)
    throw new Error(`找不到 badge/${name}`)
  return element
}

function teardown(): void {
  app?.unmount()
  host?.remove()
  app = null
  host = null
}

afterEach(teardown)

describe('徽标的计数盒与附着位置', () => {
  it.each([
    { size: 'sm', edge: 16 },
    { size: undefined, edge: 28 },
    { size: 'lg', edge: 32 },
  ] as const)('$size 档的最小计数盒为 $edge px', async ({ size, edge }) => {
    await mount(size)
    const indicator = part('indicator')
    const rect = indicator.getBoundingClientRect()

    expect(rect.width).toBeGreaterThanOrEqual(edge)
    expect(rect.height).toBe(edge)
    expect(indicator.dataset.tone).toBe('neutral')
    expect(getComputedStyle(indicator).boxShadow).toBe('none')
  })

  it('右上角只探出角标自身四分之一', async () => {
    await mount()
    const root = part('root').getBoundingClientRect()
    const indicator = part('indicator').getBoundingClientRect()

    expect(indicator.right - root.right).toBeCloseTo(indicator.width / 4, 1)
    expect(root.top - indicator.top).toBeCloseTo(indicator.height / 4, 1)
  })
})
