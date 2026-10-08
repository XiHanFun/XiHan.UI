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
  size?: 'sm' | 'md' | 'lg'
  text?: string
  theme?: 'light' | 'dark'
  tone?: Tone
}

/**
 * 在定位层里放一个探针，按气泡所在的主题解出某个颜色令牌。
 * 不放进气泡：反白面内是墨色域，域里的正文色已被改写成墨色。
 */
function resolvedColor(token: string): string {
  const probe = document.createElement('span')
  probe.style.color = `var(${token})`
  part('positioner').append(probe)
  const color = getComputedStyle(probe).color
  probe.remove()
  return color
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
      size: options.size,
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

describe('tooltip 反白实底', () => {
  it.each(['light', 'dark'] as const)('%s：反色中性实底、白面字色，14px 字、控件圆角，箭头与气泡同面同边', async (theme) => {
    await mountTooltip({ theme })
    const content = getComputedStyle(part('content'))
    const surface = getComputedStyle(part('content'), '::before')
    const arrow = getComputedStyle(part('arrow'))

    // 底取正文色、字取承载面色：浅色主题下是深底白字，深色主题下整块翻过来
    expect(surface.opacity).toBe('1')
    expect(surface.backgroundColor).toBe(resolvedColor('--xh-fg-default'))
    expect(content.color).toBe(resolvedColor('--xh-bg-surface'))
    expect(content.backdropFilter || content.getPropertyValue('-webkit-backdrop-filter')).toBe('none')
    expect(content.fontSize).toBe('14px')
    expect(content.paddingTop).toBe('8px')
    expect(content.paddingBottom).toBe('8px')
    expect(content.paddingLeft).toBe('12px')
    expect(content.paddingRight).toBe('12px')
    expect(content.borderTopWidth).toBe('1px')
    expect(content.borderRadius).toBe('2px')
    expect(content.boxShadow).not.toBe('none')
    // 不用顶部高光：内描边式顶光缺省透明，只剩海拔那一层影
    expect(content.boxShadow.startsWith('rgba(0, 0, 0, 0) 0px 1px 0px 0px inset')).toBe(true)
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

  it('小号档只收纵向内距：纵 4 横 12，字号仍是 14px', async () => {
    await mountTooltip({ size: 'sm' })
    const content = getComputedStyle(part('content'))

    expect(content.paddingTop).toBe('4px')
    expect(content.paddingBottom).toBe('4px')
    expect(content.paddingLeft).toBe('12px')
    expect(content.paddingRight).toBe('12px')
    expect(content.fontSize).toBe('14px')
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
    // 挂载即开的这一段属于首帧、不播进场；撤掉首帧标记，量的是用户打开时的进场
    delete contentElement.dataset.instant
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
    // 入场走 enter 档（--xh-motion-duration-enter = duration-normal 200ms），不再借退场的 120ms
    expect(content.animationDuration).toBe('0.2s')
    // 打开态不常驻合成层：常驻的 will-change 会让静止画面沿用入场动画中途的栅格而发虚
    expect(content.willChange).toBe('auto')
    expect(contentElement.getBoundingClientRect().width).toBeLessThanOrEqual(180)
    expect(contentElement.scrollWidth).toBeLessThanOrEqual(contentElement.clientWidth)
    expect(contentElement.getBoundingClientRect().height).toBeGreaterThan(32)
  })
})
