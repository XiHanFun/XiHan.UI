// 集合行尾的已选对号：常驻在 indicator 列，按选中态以 opacity 淡变（micro），不再按 visibility 瞬切。
// 页内（Listbox）与浮层（Select）两种语境走同一条家族规则。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { createApp, h, nextTick } from 'vue'
import { XhListboxRoot, XhSelectRoot } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

const COLLECTION = [
  { value: 'apple', label: '苹果' },
  { value: 'banana', label: '香蕉' },
]

afterEach(() => {
  app?.unmount()
  host?.remove()
  document.getElementById('xh-portal-root')?.remove()
  app = null
  host = null
})

function micro(): string {
  const probe = document.createElement('div')
  probe.style.transitionDuration = 'var(--xh-motion-duration-micro)'
  host!.append(probe)
  const value = getComputedStyle(probe).transitionDuration
  probe.remove()
  return value
}

function mark(scope: string, value: string): HTMLElement {
  const el = document.querySelector<HTMLElement>(`[data-scope='${scope}'][data-part='item'][data-value='${value}'] [data-part='item-indicator']`)
  if (!el)
    throw new Error(`找不到 ${scope}/${value} 的对号`)
  return el
}

/** 对号上正在跑的 opacity 过渡。 */
function opacityTransitions(el: HTMLElement): Animation[] {
  return el.getAnimations().filter(animation => (animation as CSSTransition).transitionProperty === 'opacity')
}

function expectFadeChannel(el: HTMLElement): void {
  const style = getComputedStyle(el)
  const properties = style.transitionProperty.split(', ')
  const index = properties.indexOf('opacity')
  expect(index, '对号的过渡要列 opacity').toBeGreaterThanOrEqual(0)
  expect(style.transitionDuration.split(', ')[index]).toBe(micro())
  // 常驻：不再用 visibility 收起
  expect(style.visibility).toBe('visible')
}

async function settle(): Promise<void> {
  await nextTick()
  await nextTick()
}

describe('集合行尾对号常驻淡变', () => {
  it('listbox：未选中的对号 opacity 0，改选时新旧两枚各走一段 opacity 过渡', async () => {
    host = document.createElement('div')
    host.style.inlineSize = '240px'
    document.body.append(host)
    app = createApp({ render: () => h(XhListboxRoot, { collection: COLLECTION, defaultValue: ['apple'] }) })
    app.mount(host)
    await settle()

    const apple = mark('listbox', 'apple')
    const banana = mark('listbox', 'banana')
    expectFadeChannel(apple)
    expectFadeChannel(banana)
    expect(getComputedStyle(apple).opacity).toBe('1')
    expect(getComputedStyle(banana).opacity).toBe('0')
    // 首帧直接呈现，不播淡入
    expect(opacityTransitions(apple)).toHaveLength(0)

    await userEvent.click(host.querySelector<HTMLElement>(`[data-part='item'][data-value='banana']`)!)
    await settle()
    expect(opacityTransitions(banana)).toHaveLength(1)
    expect(opacityTransitions(apple)).toHaveLength(1)
    for (const animation of document.getAnimations())
      animation.finish()
    expect(getComputedStyle(banana).opacity).toBe('1')
    expect(getComputedStyle(apple).opacity).toBe('0')
  })

  it('select：浮层里的对号同一条规则', async () => {
    host = document.createElement('div')
    document.body.append(host)
    app = createApp({ render: () => h(XhSelectRoot, { collection: COLLECTION, defaultOpen: true, defaultValue: 'apple' }) })
    app.mount(host)
    await settle()
    for (const animation of document.getAnimations())
      animation.finish()

    const apple = mark('select', 'apple')
    const banana = mark('select', 'banana')
    expectFadeChannel(apple)
    expectFadeChannel(banana)
    expect(getComputedStyle(apple).opacity).toBe('1')
    expect(getComputedStyle(banana).opacity).toBe('0')
  })
})
