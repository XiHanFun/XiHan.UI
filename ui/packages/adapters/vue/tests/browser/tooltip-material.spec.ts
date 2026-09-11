import type { Placement, Tone } from '@xihan-ui/core'
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import {
  XhTooltipArrow,
  XhTooltipContent,
  XhTooltipPositioner,
  XhTooltipRoot,
  XhTooltipTrigger,
} from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

function part(name: string): HTMLElement {
  const element = document.querySelector<HTMLElement>(`[data-scope='tooltip'][data-part='${name}']`)
  if (!element)
    throw new Error(`找不到 tooltip/${name}`)
  return element
}

interface MountOptions {
  contrast?: 'more'
  maxWidth?: string
  placement?: Placement
  text?: string
  theme?: 'light' | 'dark'
  tone?: Tone
}

async function mountTooltip(options: MountOptions = {}): Promise<void> {
  host = document.createElement('div')
  host.dataset.theme = options.theme ?? 'light'
  if (options.contrast)
    host.dataset.contrast = options.contrast
  host.style.cssText = 'min-height:320px;padding:120px;background:repeating-linear-gradient(135deg,#fff 0 8px,#111 8px 16px)'
  document.body.append(host)
  app = createApp({
    render: () => h(XhTooltipRoot, {
      open: true,
      placement: options.placement ?? 'top',
      tone: options.tone,
    }, () => [
      h(XhTooltipTrigger, null, () => '说明目标'),
      h(XhTooltipPositioner, null, () => [
        h(XhTooltipContent, {
          style: options.maxWidth ? { '--xh-tooltip-max-w': options.maxWidth } : undefined,
        }, () => [
          options.text ?? '简短提示',
          h(XhTooltipArrow),
        ]),
      ]),
    ]),
  })
  app.mount(host)
  await nextTick()
  await nextTick()
}

afterEach(() => {
  app?.unmount()
  host?.remove()
  document.getElementById('xh-portal-root')?.remove()
  app = null
  host = null
})

describe('tooltip 紧凑反白 M2', () => {
  it('以高遮蔽反白 tint、8px blur 和同面箭头绘制小型提示', async () => {
    await mountTooltip()
    const content = getComputedStyle(part('content'))
    const surface = getComputedStyle(part('content'), '::before')
    const arrow = getComputedStyle(part('arrow'))

    expect(surface.opacity).toBe('0.94')
    expect(content.color).not.toContain('/ 0.')
    expect(content.backdropFilter || content.getPropertyValue('-webkit-backdrop-filter')).toContain('blur(8px)')
    expect(content.borderTopWidth).toBe('1px')
    expect(content.borderRadius).toBe('6px')
    expect(content.boxShadow).not.toBe('none')
    expect(arrow.backgroundColor).toBe(surface.backgroundColor)
    expect(arrow.opacity).toBe(surface.opacity)
    const visibleArrowEdges = [
      [arrow.borderTopWidth, arrow.borderTopColor],
      [arrow.borderRightWidth, arrow.borderRightColor],
      [arrow.borderBottomWidth, arrow.borderBottomColor],
      [arrow.borderLeftWidth, arrow.borderLeftColor],
    ].filter(([width]) => width !== '0px')
    expect(visibleArrowEdges.length).toBe(2)
    expect(visibleArrowEdges.every(([, color]) => color === content.borderTopColor)).toBe(true)
  })

  it('高对比暗色 tone 使用同语气实体面，不让背景继续参与文字合成', async () => {
    await mountTooltip({ contrast: 'more', theme: 'dark', tone: 'danger' })
    const content = getComputedStyle(part('content'))
    const surface = getComputedStyle(part('content'), '::before')
    const arrow = getComputedStyle(part('arrow'))

    expect(surface.opacity).toBe('1')
    expect(content.backdropFilter || content.getPropertyValue('-webkit-backdrop-filter')).toBe('none')
    expect(content.borderTopColor).toBe(content.color)
    expect(arrow.backgroundColor).toBe(surface.backgroundColor)
  })

  it('共享短位移动作只启用实际 placement 的一侧，连续长词留在窄面内', async () => {
    await mountTooltip({
      maxWidth: '180px',
      placement: 'top',
      text: '这是一个没有空格而且必须在窄屏提示面内断行的连续超长说明文字ABCDEFGHIJKLMN',
    })
    const positioner = part('positioner')
    const contentElement = part('content')
    const positionerStyle = getComputedStyle(positioner)
    const content = getComputedStyle(contentElement)
    const placement = positioner.dataset.placement?.split('-')[0]
    const activeDirection = {
      top: 'down',
      bottom: 'up',
      left: 'right',
      right: 'left',
    }[placement ?? '']

    expect(activeDirection).toBeTruthy()
    for (const direction of ['up', 'down', 'left', 'right']) {
      expect(positionerStyle.getPropertyValue(`--xh-_overlay-enter-${direction}`).trim())
        .toBe(direction === activeDirection ? '1' : '0')
    }
    expect(content.animationName).toBe('xh-overlay-slide-in')
    expect(content.animationDuration).toBe('0.12s')
    expect(content.willChange.split(',').map(value => value.trim())).toEqual(['opacity', 'translate'])
    expect(contentElement.getBoundingClientRect().width).toBeLessThanOrEqual(180)
    expect(contentElement.scrollWidth).toBeLessThanOrEqual(contentElement.clientWidth)
    expect(contentElement.getBoundingClientRect().height).toBeGreaterThan(32)
  })
})
