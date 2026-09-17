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

/** 语义色令牌在该元素上解到的颜色。 */
function resolveColor(token: string, scope: HTMLElement): string {
  const probe = document.createElement('span')
  probe.style.backgroundColor = `var(${token})`
  scope.append(probe)
  const value = getComputedStyle(probe).backgroundColor
  probe.remove()
  return value
}

/** 令过渡即时完成：这里断言的是稳定态的颜色与几何，不是过渡中间帧。 */
function freezeMotion(): void {
  host!.style.setProperty('--xh-motion-duration-micro', '0ms')
  host!.style.setProperty('--xh-motion-duration-press', '0ms')
  host!.style.setProperty('--xh-motion-duration-release', '0ms')
}

/** 在空白处松开：mousedown 与 mouseup 的目标不同，不会派 click，选中值不变。 */
async function releaseAway(): Promise<void> {
  if (!pressed)
    return
  await cdp().send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: 0, y: 0, button: 'left', buttons: 0, clickCount: 1 })
  pressed = false
}

async function press(item: HTMLElement): Promise<void> {
  const rect = item.getBoundingClientRect()
  pointer = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
  await cdp().send('Input.dispatchMouseEvent', { type: 'mousePressed', ...pointer, button: 'left', buttons: 1, clickCount: 1 })
  pressed = true
}

/** 语义形状令牌在该元素上解到的像素值。 */
function shapePx(element: HTMLElement, token: string): number {
  const probe = document.createElement('div')
  probe.style.borderTopLeftRadius = `var(${token})`
  element.append(probe)
  const value = Number.parseFloat(getComputedStyle(probe).borderTopLeftRadius)
  probe.remove()
  return value
}

describe('切换按钮组视觉', () => {
  it('默认使用 control 圆角端点、淡色选中态和覆盖接缝的半高分隔线', () => {
    mount()
    const root = host!.querySelector<HTMLElement>(`[data-scope='toggle-group'][data-part='root']`)!
    const items = [...root.querySelectorAll<HTMLElement>(`[data-part='item']`)]
    const separators = [...root.querySelectorAll<HTMLElement>(`[data-xh-toggle-group-separator]`)]
    const rootHeight = root.getBoundingClientRect().height

    expect(separators).toHaveLength(2)
    const control = shapePx(root, '--xh-shape-control')
    expect(control).toBeGreaterThan(0)
    expect(control).toBeLessThan(rootHeight / 2)
    expect(Number.parseFloat(getComputedStyle(items[0]!).borderStartStartRadius)).toBe(control)
    expect(getComputedStyle(items[1]!).borderRadius).toBe('0px')
    expect(Number.parseFloat(getComputedStyle(items[2]!).borderEndEndRadius)).toBe(control)
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

  it('段接 Action Control text 档：缺省淡底段 hover 200 / pressed 300 不缩放，选中段品牌淡底 + 淡底前景，悬停 20%', async () => {
    mount()
    freezeMotion()
    const root = host!.querySelector<HTMLElement>(`[data-scope='toggle-group'][data-part='root']`)!
    const [on, idle] = [...root.querySelectorAll<HTMLElement>(`[data-part='item']`)] as [HTMLElement, HTMLElement]
    expect(on.dataset.xhActionControl).toBe('')
    expect(on.dataset.xhActionProfile).toBe('text')
    expect(getComputedStyle(on).backgroundColor).toBe(resolveColor('--xh-bg-brand-subtle', root))
    expect(getComputedStyle(on).color).toBe(resolveColor('--xh-fg-on-brand-subtle', root))
    expect(getComputedStyle(idle).backgroundColor).toBe(resolveColor('--xh-bg-subtle', root))

    await userEvent.hover(idle)
    expect(getComputedStyle(idle).backgroundColor).toBe(resolveColor('--xh-bg-subtle-hover', root))
    await press(idle)
    expect(idle.matches(':active')).toBe(true)
    expect(getComputedStyle(idle).backgroundColor).toBe(resolveColor('--xh-bg-subtle-active', root))
    expect(getComputedStyle(idle).scale).toBe('none')
    await releaseAway()

    await userEvent.hover(on)
    expect(getComputedStyle(on).backgroundColor).toBe(resolveColor('--xh-bg-brand-subtle-hover', root))
    expect(getComputedStyle(on).color).toBe(resolveColor('--xh-fg-on-brand-subtle', root))
    await press(on)
    expect(getComputedStyle(on).backgroundColor).toBe(resolveColor('--xh-bg-brand-subtle-active', root))
    expect(getComputedStyle(on).scale).toBe('none')
  })

  it('outline 与 ghost 的段坐在画布上：hover 100 / pressed 200', async () => {
    for (const variant of ['outline', 'ghost'] as const) {
      mount({ variant })
      freezeMotion()
      const root = host!.querySelector<HTMLElement>(`[data-scope='toggle-group'][data-part='root']`)!
      const idle = root.querySelectorAll<HTMLElement>(`[data-part='item']`)[1]!
      expect(getComputedStyle(idle).backgroundColor).toBe('rgba(0, 0, 0, 0)')
      await userEvent.hover(idle)
      expect(getComputedStyle(idle).backgroundColor, `${variant} hover`).toBe(resolveColor('--xh-bg-subtle', root))
      await press(idle)
      expect(getComputedStyle(idle).backgroundColor, `${variant} pressed`).toBe(resolveColor('--xh-bg-subtle-hover', root))
      await releaseAway()
      app?.unmount()
      app = null
      host?.remove()
      host = null
      await userEvent.hover(document.querySelector<HTMLElement>('[data-test-park-pointer]')!)
    }
  })
})
