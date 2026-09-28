// 浮动面板最大化与还原：位置与尺寸按指示档补过去，圆角与描边同步收放，不再瞬切；
// 拖动、改尺寸照旧跟手，不挂过渡。过渡有没有起、盒子走到哪儿只有真实浏览器量得出。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { page } from 'vitest/browser'
import { createApp, h, nextTick } from 'vue'
import {
  XhFloatingPanelBody,
  XhFloatingPanelContent,
  XhFloatingPanelHeader,
  XhFloatingPanelPositioner,
  XhFloatingPanelRoot,
  XhFloatingPanelTitle,
  XhFloatingPanelWindowStateTrigger,
} from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

afterEach(() => {
  app?.unmount()
  app = null
  host?.remove()
  host = null
})

function part(name: string): HTMLElement {
  return document.querySelector<HTMLElement>(`[data-scope='floating-panel'][data-part='${name}']`)!
}

async function mount(): Promise<void> {
  await page.viewport(900, 700)
  host = document.createElement('div')
  document.body.append(host)
  app = createApp({
    render: () => h(XhFloatingPanelRoot, { defaultOpen: true, defaultPosition: { x: 120, y: 80 }, defaultDimensions: { width: 320, height: 240 } }, () => [
      h(XhFloatingPanelPositioner, null, () => [
        h(XhFloatingPanelContent, null, () => [
          h(XhFloatingPanelHeader, null, () => [
            h(XhFloatingPanelTitle, null, () => '调试面板'),
            h(XhFloatingPanelWindowStateTrigger, { windowState: 'maximized' }),
          ]),
          h(XhFloatingPanelBody, null, () => '正文'),
        ]),
      ]),
    ]),
  })
  app.mount(host)
  await nextTick()
  // 等进场播完：量的是静止的面板
  await Promise.all(part('positioner').getAnimations().map(a => a.finished))
}

function transitioning(el: HTMLElement): string[] {
  return el.getAnimations().map(a => (a as CSSTransition).transitionProperty).filter(Boolean).sort()
}

describe('floating-panel 最大化', () => {
  it('最大化：位置与尺寸补过去、圆角同步收掉；播完撤掉过渡，还原同样补回来', async () => {
    await mount()
    const positioner = part('positioner')
    const content = part('content')
    const before = positioner.getBoundingClientRect()
    // 静止时不挂过渡：拖动与改尺寸要跟手
    expect(getComputedStyle(positioner).transitionDuration).toBe('0s')

    part('window-state-trigger').click()
    await nextTick()
    await nextTick()
    expect(positioner.dataset.windowState).toBe('maximized')
    expect(positioner.hasAttribute('data-animating')).toBe(true)
    expect(transitioning(positioner)).toEqual(expect.arrayContaining(['height', 'left', 'top', 'width']))
    expect(transitioning(content)).toContain('border-top-left-radius')

    const moves = positioner.getAnimations()
    moves.forEach(a => a.pause())
    moves.forEach((a) => {
      a.currentTime = Number(a.effect!.getComputedTiming().duration) / 2
    })
    const middle = positioner.getBoundingClientRect()
    expect(middle.width).toBeGreaterThan(before.width + 10)
    expect(middle.width).toBeLessThan(window.innerWidth - 10)
    moves.forEach(a => a.finish())

    await expect.poll(() => positioner.hasAttribute('data-animating')).toBe(false)
    expect(positioner.getBoundingClientRect().width).toBe(window.innerWidth)
    expect(getComputedStyle(content).borderTopLeftRadius).toBe('0px')

    part('window-state-trigger').click()
    await nextTick()
    await nextTick()
    expect(positioner.dataset.windowState).toBe('default')
    expect(transitioning(positioner)).toEqual(expect.arrayContaining(['height', 'left', 'top', 'width']))
    await expect.poll(() => positioner.hasAttribute('data-animating'), { timeout: 2000 }).toBe(false)
    expect(positioner.getBoundingClientRect().width).toBeCloseTo(before.width, 0)
  })
})
