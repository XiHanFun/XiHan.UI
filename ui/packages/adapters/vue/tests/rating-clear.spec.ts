// @vitest-environment jsdom
// rating allowClear（默认开）：再点当前档位清零，键盘在最低档再往下走一步同样清零；
// 设为 false 回到「再点不清」，命令式 setValue 不受影响。
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import { XhRatingControl, XhRatingItem, XhRatingRoot } from '../src'

async function tick(): Promise<void> {
  await nextTick()
  await nextTick()
  await new Promise(r => setTimeout(r, 0))
  await nextTick()
}

let cleanup: Array<() => void> = []

afterEach(() => {
  for (const fn of cleanup) fn()
  cleanup = []
  document.body.innerHTML = ''
})

async function mountRating(props: Record<string, unknown>): Promise<void> {
  const host = document.createElement('div')
  document.body.appendChild(host)
  const app = createApp({
    setup: () => () =>
      h(XhRatingRoot, props, {
        default: ({ items }: { items: number[] }) => [
          h(XhRatingControl, () => items.map(i => h(XhRatingItem, { key: i, value: i }, () => '★'))),
        ],
      }),
  })
  app.mount(host)
  cleanup.push(() => {
    app.unmount()
    host.remove()
  })
  await tick()
}

function star(n: number): HTMLElement {
  const hit = document.querySelector<HTMLElement>(`[data-scope="rating"][data-part="item"][data-value="${n}"]`)
  if (!hit)
    throw new Error(`找不到第 ${n} 颗星`)
  return hit
}

function checkedValue(): string | null {
  return document.querySelector('[data-scope="rating"][data-part="item"][aria-checked="true"]')?.getAttribute('data-value') ?? null
}

describe('rating allowClear', () => {
  it('再点当前档位清零；点别的档照常落值', async () => {
    await mountRating({ defaultValue: 3 })
    expect(checkedValue()).toBe('3')
    star(3).click()
    await tick()
    expect(checkedValue()).toBeNull()
    star(2).click()
    await tick()
    expect(checkedValue()).toBe('2')
  })

  it('键盘：在最低档再往下走一步清零', async () => {
    await mountRating({ defaultValue: 1 })
    const control = document.querySelector<HTMLElement>('[data-scope="rating"][data-part="control"]')!
    control.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }))
    await tick()
    expect(checkedValue()).toBeNull()
  })

  it('allowClear=false：再点当前档位不清', async () => {
    await mountRating({ 'defaultValue': 3, 'allow-clear': false })
    star(3).click()
    await tick()
    expect(checkedValue()).toBe('3')
  })
})
