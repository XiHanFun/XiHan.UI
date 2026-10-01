// 轻提示预设的 sheet 三件套面、文本列与悬停显现的关闭入口依赖真实布局和媒体查询。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { createApp, h, nextTick } from 'vue'
import {
  XhNotificationItem,
  XhNotificationItemActionTrigger,
  XhNotificationItemCloseTrigger,
  XhNotificationItemContent,
  XhNotificationItemDescription,
  XhNotificationItemIndicator,
  XhNotificationItemTitle,
} from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

afterEach(async () => {
  app?.unmount()
  host?.remove()
  app = null
  host = null
  await userEvent.hover(document.querySelector<HTMLElement>('[data-test-park-pointer]')!)
})

async function mount(duration = 0, actionLabel?: string): Promise<HTMLElement> {
  host = document.createElement('div')
  document.body.append(host)
  app = createApp({
    render: () => h(XhNotificationItem, {
      preset: 'toast',
      tone: 'success',
      title: '更改已保存',
      description: '内容已同步到云端',
      duration,
    }, () => [
      h(XhNotificationItemIndicator),
      h(XhNotificationItemContent, () => [h(XhNotificationItemTitle), h(XhNotificationItemDescription)]),
      ...(actionLabel ? [h(XhNotificationItemActionTrigger, null, () => actionLabel)] : []),
      h(XhNotificationItemCloseTrigger),
    ]),
  })
  app.mount(host)
  await nextTick()
  return host.querySelector<HTMLElement>('[data-scope="notification"][data-part="item"]')!
}

/** 单独摆放的卡片挂上即播面板的进场（带一点缩放），几何要等它落定再量。 */
async function settled(element: HTMLElement): Promise<void> {
  await Promise.all(element.getAnimations().map(animation => animation.finished))
}

function resolvedColor(root: HTMLElement, property: 'background' | 'color', value: string): string {
  const probe = document.createElement('span')
  probe.style.setProperty(property, value)
  root.append(probe)
  const resolved = getComputedStyle(probe)[property === 'background' ? 'backgroundColor' : 'color']
  probe.remove()
  return resolved
}

function resolvedWidth(root: HTMLElement, value: string): number {
  const probe = document.createElement('span')
  probe.style.cssText = `position:absolute;inline-size:${value}`
  root.append(probe)
  const resolved = probe.getBoundingClientRect().width
  probe.remove()
  return resolved
}

describe('轻提示预设的中性浮层', () => {
  it('一行排开的 sheet 三件套浮层（描边 + 落影），语气只落在标题和指示符', async () => {
    const item = await mount()
    await settled(item)
    const style = getComputedStyle(item)
    const title = item.querySelector<HTMLElement>('[data-part="item-title"]')!
    const description = item.querySelector<HTMLElement>('[data-part="item-description"]')!
    const indicator = item.querySelector<HTMLElement>('[data-part="item-indicator"]')!

    expect(style.display).toBe('flex')
    expect(item.getBoundingClientRect().width).toBe(Math.min(
      resolvedWidth(item, 'var(--xh-overlay-toast-w)'),
      item.parentElement!.getBoundingClientRect().width,
    ))
    expect(style.paddingBlock).toBe('12px')
    expect(style.paddingInline).toBe('16px')
    expect(style.borderRadius).toBe('12px')
    expect(style.backgroundColor).toBe(resolvedColor(item, 'background', 'var(--xh-material-elevated-bg)'))
    expect(style.borderTopColor).toBe(resolvedColor(item, 'color', 'var(--xh-material-elevated-border)'))
    expect(style.borderTopColor).not.toBe('rgba(0, 0, 0, 0)')
    expect(style.boxShadow).not.toBe('none')
    expect(getComputedStyle(title).fontWeight).toBe('600')
    expect(getComputedStyle(description).fontSize).toBe(`${resolvedWidth(item, 'var(--xh-text-secondary-size)')}px`)
    expect(getComputedStyle(indicator).opacity).toBe('1')
    expect(getComputedStyle(title).opacity).toBe('1')
    expect(title.textContent).toBe('更改已保存')
    expect(getComputedStyle(title).color).toBe(resolvedColor(item, 'color', 'var(--xh-_tone-fg)'))
    expect(getComputedStyle(description).color).toBe(resolvedColor(item, 'color', 'var(--xh-fg-muted)'))
    expect(indicator.getBoundingClientRect().width).toBe(resolvedWidth(
      item,
      'calc(var(--xh-glyph-size-md) + var(--xh-space-1) + var(--xh-space-1))',
    ))
  })

  it('有悬停能力时关闭入口静默，键盘焦点进入后显现', async () => {
    const item = await mount()
    await settled(item)
    const close = item.querySelector<HTMLButtonElement>('[data-part="item-close-trigger"]')!

    // 有悬停能力时只压 opacity 与 pointer-events，不收 visibility：这颗叉占 Tab 位，键盘要够得到
    expect(close.dataset.xhActionProfile).toBe('icon')
    expect(close.dataset.xhActionVariant).toBe('ghost')
    if (matchMedia('(hover: hover)').matches) {
      expect(getComputedStyle(close).opacity).toBe('0')
      expect(getComputedStyle(close).visibility).toBe('visible')
    }

    close.focus()
    await new Promise(resolve => setTimeout(resolve, 200))
    const itemRect = item.getBoundingClientRect()
    const closeRect = close.getBoundingClientRect()
    expect(getComputedStyle(close).opacity).toBe('1')
    expect(getComputedStyle(close).visibility).toBe('visible')
    // icon ghost xs：24px 正方盒、静息透明无影，排在行尾并在行里垂直居中
    expect(closeRect.width).toBe(24)
    expect(closeRect.height).toBe(24)
    expect(getComputedStyle(close).backgroundColor).toBe('rgba(0, 0, 0, 0)')
    expect(getComputedStyle(close).boxShadow).toBe('none')
    expect(closeRect.left).toBeGreaterThanOrEqual(itemRect.left)
    expect(closeRect.right).toBeLessThanOrEqual(itemRect.right)
    expect(Math.abs((closeRect.top + closeRect.bottom - itemRect.top - itemRect.bottom) / 2)).toBeLessThan(1)
  })

  it('操作钮走 text outline 档：透明底 + 控件描边、32px 高，悬停落白面阶梯的 100', async () => {
    const item = await mount(0, '撤销')
    const action = item.querySelector<HTMLButtonElement>('[data-part="item-action-trigger"]')!
    const style = getComputedStyle(action)

    expect(action.dataset.xhActionProfile).toBe('text')
    expect(action.dataset.xhActionVariant).toBe('outline')
    expect(action.getBoundingClientRect().height).toBe(resolvedWidth(item, 'var(--xh-control-h-sm)'))
    expect(style.backgroundColor).toBe('rgba(0, 0, 0, 0)')
    expect(style.borderTopColor).toBe(resolvedColor(item, 'color', 'var(--xh-border-control)'))
    expect(style.boxShadow).toBe('none')
    expect(style.fontWeight).toBe('500')

    await userEvent.hover(action)
    await expect.poll(() => getComputedStyle(action).backgroundColor).toBe(resolvedColor(item, 'background', 'var(--xh-bg-subtle)'))
    expect(getComputedStyle(action).borderTopColor).toBe(resolvedColor(item, 'color', 'var(--xh-border-control-hover)'))
  })

  it('没渲染指示符部件时，在途的行首环只由轻提示画，卡片预设自己身上不出这一格', async () => {
    host = document.createElement('div')
    document.body.append(host)
    app = createApp({
      render: () => ['toast', 'card'].map(preset => h(XhNotificationItem, {
        'preset': preset as 'toast' | 'card',
        'loading': true,
        'title': '正在上传',
        'duration': 0,
        'data-test-preset': preset,
      }, () => [
        h(XhNotificationItemContent, () => [h(XhNotificationItemTitle)]),
      ])),
    })
    app.mount(host)
    await nextTick()
    const toast = host.querySelector<HTMLElement>('[data-test-preset="toast"]')!
    const card = host.querySelector<HTMLElement>('[data-test-preset="card"]')!
    await settled(toast)

    expect(toast.hasAttribute('data-xh-loading-ring')).toBe(true)
    expect(card.hasAttribute('data-xh-loading-ring')).toBe(true)
    const ring = getComputedStyle(toast, '::before')
    expect(ring.content).not.toBe('none')
    await expect.poll(() => getComputedStyle(toast, '::before').opacity).toBe('1')
    expect(ring.width).toBe(`${resolvedWidth(toast, 'var(--xh-glyph-size-md)')}px`)
    expect(getComputedStyle(card, '::before').content).toBe('none')
    expect(getComputedStyle(card, '::after').content).toBe('none')
  })

  it('关闭钮的描边槽两种预设都认：静息透明，写了槽就按槽画出 1px 描边', async () => {
    host = document.createElement('div')
    document.body.append(host)
    app = createApp({
      render: () => ['toast', 'card'].map(preset => h(XhNotificationItem, {
        'preset': preset as 'toast' | 'card',
        'title': '已保存',
        'duration': 0,
        'data-test-preset': preset,
      }, () => [
        h(XhNotificationItemContent, () => [h(XhNotificationItemTitle)]),
        h(XhNotificationItemCloseTrigger),
      ])),
    })
    app.mount(host)
    await nextTick()

    // 描边算在正方盒以内：卡片的叉仍是 sm 档 32px，轻提示的仍是 xs 档 24px
    const boxes = { toast: 'var(--xh-control-action-size)', card: 'var(--xh-control-h-sm)' }
    for (const preset of ['toast', 'card'] as const) {
      const item = host.querySelector<HTMLElement>(`[data-test-preset="${preset}"]`)!
      const close = item.querySelector<HTMLElement>('[data-part="item-close-trigger"]')!
      await settled(item)
      expect(close.getBoundingClientRect().width).toBe(resolvedWidth(item, boxes[preset]))
      expect(close.getBoundingClientRect().height).toBe(resolvedWidth(item, boxes[preset]))
      expect(getComputedStyle(close).borderTopColor).toBe('rgba(0, 0, 0, 0)')
      item.style.setProperty('--xh-notification-close-border', 'rgb(255, 0, 0)')
      // 描边色带过渡：等它走完
      await expect.poll(() => getComputedStyle(close).borderTopColor).toBe('rgb(255, 0, 0)')
      expect(getComputedStyle(close).borderTopWidth).toBe('1px')
    }
  })

  it('单独摆放（不在叠放的一摞里）时到点走面板的退场动画，再进入 unmounted', async () => {
    const item = await mount(80)
    await new Promise(resolve => setTimeout(resolve, 120))
    expect(item.dataset.state).toBe('dismissing')
    expect(getComputedStyle(item).animationName).toBe('xh-sheet-out')
    await new Promise(resolve => setTimeout(resolve, 320))
    expect(item.dataset.state).toBe('unmounted')
    expect(item.hidden).toBe(true)
  })
})
