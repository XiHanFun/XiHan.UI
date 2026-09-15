import { afterEach, describe, expect, it } from 'vitest'
import { page } from 'vitest/browser'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let host: HTMLElement | null = null
let originalViewport: { width: number, height: number } | null = null

afterEach(async () => {
  if (originalViewport)
    await page.viewport(originalViewport.width, originalViewport.height)
  host?.remove()
  host = null
  originalViewport = null
})

function mountOneWay(): { root: HTMLElement, trigger: HTMLButtonElement } {
  host = document.createElement('div')
  host.innerHTML = `
    <div data-scope="transfer" data-part="root" data-one-way style="inline-size: 520px">
      <section data-scope="transfer" data-part="source-panel" style="block-size: 240px"></section>
      <button data-scope="transfer" data-part="to-target-trigger" type="button"></button>
      <section data-scope="transfer" data-part="target-panel" style="block-size: 240px"></section>
    </div>`
  document.body.append(host)
  return {
    root: host.querySelector<HTMLElement>('[data-part="root"]')!,
    trigger: host.querySelector<HTMLButtonElement>('[data-part="to-target-trigger"]')!,
  }
}

describe('transfer 单向布局', () => {
  it('宽档只有一颗搬运按钮时跨越两行并垂直居中', async () => {
    originalViewport = { width: innerWidth, height: innerHeight }
    await page.viewport(800, 600)
    expect(innerWidth).toBeGreaterThanOrEqual(640)
    const { root, trigger } = mountOneWay()
    const rootRect = root.getBoundingClientRect()
    const triggerRect = trigger.getBoundingClientRect()

    expect(getComputedStyle(trigger).gridRowStart).toBe('1')
    expect(getComputedStyle(trigger).gridRowEnd).toBe('3')
    expect(triggerRect.top + triggerRect.height / 2).toBeCloseTo(rootRect.top + rootRect.height / 2, 0)
  })
})
