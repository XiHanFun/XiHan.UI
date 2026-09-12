import type { App } from 'vue'
import { cdp, userEvent } from '@vitest/browser/context'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h } from 'vue'
import { XhToggleGroupItem, XhToggleGroupRoot } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null
let pointer = { x: 1, y: 1 }
let pressed = false

function mount(props: Record<string, unknown> = {}): void {
  host = document.createElement('div')
  document.body.append(host)
  app = createApp({
    setup: () => () => h(XhToggleGroupRoot, { defaultValue: 'left', ...props }, () => {
      const items = [
        h(XhToggleGroupItem, { value: 'left' }, () => '左'),
        h(XhToggleGroupItem, { value: 'center' }, () => '中'),
        h(XhToggleGroupItem, { value: 'right' }, () => '右'),
      ]
      return items
    }),
  })
  app.mount(host)
}

async function release(): Promise<void> {
  if (!pressed)
    return
  await cdp().send('Input.dispatchMouseEvent', {
    type: 'mouseReleased',
    ...pointer,
    button: 'left',
    buttons: 0,
    clickCount: 1,
  })
  pressed = false
}

afterEach(async () => {
  await release()
  app?.unmount()
  app = null
  host?.remove()
  host = null
  await userEvent.hover(document.querySelector<HTMLElement>('[data-test-park-pointer]')!)
})

describe('切换按钮组视觉', () => {
  it('默认使用胶囊端点、淡色选中态和覆盖接缝的半高分隔线', () => {
    mount()
    const root = host!.querySelector<HTMLElement>(`[data-scope='toggle-group'][data-part='root']`)!
    const items = [...root.querySelectorAll<HTMLElement>(`[data-part='item']`)]
    const separators = [...root.querySelectorAll<HTMLElement>(`[data-xh-toggle-group-separator]`)]
    const rootHeight = root.getBoundingClientRect().height

    expect(separators).toHaveLength(2)
    expect(Number.parseFloat(getComputedStyle(items[0]!).borderStartStartRadius)).toBeGreaterThanOrEqual(rootHeight / 2)
    expect(getComputedStyle(items[1]!).borderRadius).toBe('0px')
    expect(Number.parseFloat(getComputedStyle(items[2]!).borderEndEndRadius)).toBeGreaterThanOrEqual(rootHeight / 2)
    expect(getComputedStyle(items[0]!).backgroundColor).not.toBe(getComputedStyle(items[1]!).backgroundColor)
    expect(items[0]!.getBoundingClientRect().right).toBeCloseTo(items[1]!.getBoundingClientRect().left, 4)
    expect(items[1]!.getBoundingClientRect().right).toBeCloseTo(items[2]!.getBoundingClientRect().left, 4)
    for (const separator of separators) {
      expect(getComputedStyle(separator).backgroundColor).toBe(getComputedStyle(items[1]!).color)
      expect(separator.getBoundingClientRect().height).toBeCloseTo(rootHeight / 2, 1)
      expect(getComputedStyle(separator).marginInlineStart).toBe('-1px')
    }
  })

  it('按压条目不缩放组内接缝', async () => {
    mount()
    const item = host!.querySelector<HTMLElement>(`[data-part='item'][data-value='center']`)
      ?? host!.querySelectorAll<HTMLElement>(`[data-part='item']`)[1]!
    await userEvent.hover(item)
    const rect = item.getBoundingClientRect()
    pointer = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
    await cdp().send('Input.dispatchMouseEvent', {
      type: 'mousePressed',
      ...pointer,
      button: 'left',
      buttons: 1,
      clickCount: 1,
    })
    pressed = true

    expect(item.matches(':active')).toBe(true)
    expect(getComputedStyle(item).scale).toBe('none')
  })

  it('outline 由根绘制连续外框，条目只保留显式半高分隔线', () => {
    mount({ variant: 'outline' })
    const root = host!.querySelector<HTMLElement>(`[data-scope='toggle-group'][data-part='root']`)!
    const items = [...root.querySelectorAll<HTMLElement>(`[data-part='item']`)]
    const separator = root.querySelector<HTMLElement>(`[data-xh-toggle-group-separator]`)!
    const outline = getComputedStyle(root, '::after')

    expect(outline.borderTopWidth).toBe('1px')
    expect(outline.borderTopColor).not.toBe('rgba(0, 0, 0, 0)')
    for (const item of items)
      expect(getComputedStyle(item).borderTopColor).toBe('rgba(0, 0, 0, 0)')
    expect(separator.getBoundingClientRect().height).toBeCloseTo(root.getBoundingClientRect().height / 2, 1)
  })

  it('separators=false 时不生成分隔线', () => {
    mount({ separators: false })
    expect(host!.querySelector('[data-xh-toggle-group-separator]')).toBeNull()
  })
})
