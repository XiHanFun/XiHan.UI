// Toast 的 sheet 三件套浮层、文本列与悬停关闭入口依赖真实布局和媒体查询。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { createApp, h, nextTick } from 'vue'
import {
  XhToastActionTrigger,
  XhToastCloseTrigger,
  XhToastContent,
  XhToastDescription,
  XhToastIndicator,
  XhToastRoot,
  XhToastTitle,
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
    render: () => h(XhToastRoot, {
      type: 'success',
      title: '更改已保存',
      description: '内容已同步到云端',
      actionLabel,
      duration,
    }, () => [
      h(XhToastIndicator),
      h(XhToastContent, () => [h(XhToastTitle), h(XhToastDescription)]),
      ...(actionLabel ? [h(XhToastActionTrigger, null, () => actionLabel)] : []),
      h(XhToastCloseTrigger),
    ]),
  })
  app.mount(host)
  await nextTick()
  return host.querySelector<HTMLElement>('[data-scope="toast"][data-part="root"]')!
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

describe('轻提示的 Hero 风格中性浮层', () => {
  it('使用 384px sheet 三件套浮层（描边 + 落影），语气只落在标题和指示符', async () => {
    const root = await mount()
    const rootStyle = getComputedStyle(root)
    const title = root.querySelector<HTMLElement>('[data-part="title"]')!
    const description = root.querySelector<HTMLElement>('[data-part="description"]')!
    const indicator = root.querySelector<HTMLElement>('[data-part="indicator"]')!

    expect(root.getBoundingClientRect().width).toBe(Math.min(
      resolvedWidth(root, '28.75rem'),
      root.parentElement!.getBoundingClientRect().width,
    ))
    expect(rootStyle.paddingBlock).toBe('12px')
    expect(rootStyle.paddingInline).toBe('16px')
    expect(rootStyle.borderRadius).toBe('12px')
    expect(rootStyle.backgroundColor).toBe(resolvedColor(root, 'background', 'var(--xh-material-elevated-bg)'))
    expect(rootStyle.borderTopColor).toBe(resolvedColor(root, 'color', 'var(--xh-material-elevated-border)'))
    expect(rootStyle.borderTopColor).not.toBe('rgba(0, 0, 0, 0)')
    expect(rootStyle.boxShadow).not.toBe('none')
    expect(getComputedStyle(title).fontWeight).toBe('600')
    expect(getComputedStyle(description).fontSize).toBe(`${resolvedWidth(root, 'var(--xh-text-secondary-size)')}px`)
    expect(getComputedStyle(indicator).opacity).toBe('1')
    expect(getComputedStyle(title).opacity).toBe('1')
    expect(title.textContent).toBe('更改已保存')
    expect(getComputedStyle(title).color).toBe(resolvedColor(root, 'color', 'var(--xh-_tone-fg)'))
    expect(getComputedStyle(description).color).toBe(resolvedColor(root, 'color', 'var(--xh-fg-muted)'))
    expect(indicator.getBoundingClientRect().width).toBe(resolvedWidth(
      root,
      'calc(var(--xh-glyph-size-md) + var(--xh-space-1) + var(--xh-space-1))',
    ))
  })

  it('有悬停能力时关闭入口静默，键盘焦点进入后显现', async () => {
    const root = await mount()
    const close = root.querySelector<HTMLButtonElement>('[data-part="close-trigger"]')!

    // 有悬停能力时只压 opacity 与 pointer-events，不收 visibility：这颗叉占 Tab 位，键盘要够得到
    expect(close.dataset.xhActionProfile).toBe('icon')
    expect(close.dataset.xhActionVariant).toBe('ghost')
    if (matchMedia('(hover: hover)').matches) {
      expect(getComputedStyle(close).opacity).toBe('0')
      expect(getComputedStyle(close).visibility).toBe('visible')
    }

    close.focus()
    await new Promise(resolve => setTimeout(resolve, 200))
    const rootRect = root.getBoundingClientRect()
    const closeRect = close.getBoundingClientRect()
    expect(getComputedStyle(close).opacity).toBe('1')
    expect(getComputedStyle(close).visibility).toBe('visible')
    // icon ghost xs：24px 正方盒、静息透明无影
    expect(closeRect.width).toBe(24)
    expect(closeRect.height).toBe(24)
    expect(getComputedStyle(close).backgroundColor).toBe('rgba(0, 0, 0, 0)')
    expect(getComputedStyle(close).boxShadow).toBe('none')
    expect(closeRect.left).toBeGreaterThanOrEqual(rootRect.left)
    expect(closeRect.right).toBeLessThanOrEqual(rootRect.right)
    expect(Math.abs((closeRect.top + closeRect.bottom - rootRect.top - rootRect.bottom) / 2)).toBeLessThan(1)
  })

  it('操作钮走 text outline 档：透明底 + 控件描边、32px 高，悬停落白面阶梯的 100', async () => {
    const root = await mount(0, '撤销')
    const action = root.querySelector<HTMLButtonElement>('[data-part="action-trigger"]')!
    const style = getComputedStyle(action)

    expect(action.dataset.xhActionProfile).toBe('text')
    expect(action.dataset.xhActionVariant).toBe('outline')
    expect(action.getBoundingClientRect().height).toBe(resolvedWidth(root, 'var(--xh-control-h-sm)'))
    expect(style.backgroundColor).toBe('rgba(0, 0, 0, 0)')
    expect(style.borderTopColor).toBe(resolvedColor(root, 'color', 'var(--xh-border-control)'))
    expect(style.boxShadow).toBe('none')
    expect(style.fontWeight).toBe('500')

    await userEvent.hover(action)
    await expect.poll(() => getComputedStyle(action).backgroundColor).toBe(resolvedColor(root, 'background', 'var(--xh-bg-subtle)'))
    expect(getComputedStyle(action).borderTopColor).toBe(resolvedColor(root, 'color', 'var(--xh-border-control-hover)'))
  })

  it('到点后沿堆叠方向播放退场动画，再进入 unmounted', async () => {
    const root = await mount(80)
    await new Promise(resolve => setTimeout(resolve, 120))
    expect(root.dataset.state).toBe('dismissing')
    expect(getComputedStyle(root).animationName).toBe('xh-toast-out')
    await new Promise(resolve => setTimeout(resolve, 320))
    expect(root.dataset.state).toBe('unmounted')
    expect(root.hidden).toBe(true)
  })
})
