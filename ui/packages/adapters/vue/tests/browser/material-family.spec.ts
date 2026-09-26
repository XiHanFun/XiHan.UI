// 材质家族配方（family/material.css）：投影了 data-xh-material="frosted" 的部件从同一份配方取面。
// 钉住：面由配方画四件套与 1px 顶光（顶光在背景最上一层，不随内容滚动），使用者槽照常优先；
// 圆钮的面归 Action Control，配方只补背景滤镜；liquid 档由配方把同一组私有槽换成液态面；
// 各浮动钮的交互阶梯一致（回到底部与回到顶部、浮动钮、轮播控制同一套）。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import { XhMessageFeedItem, XhMessageFeedList, XhMessageFeedRoot, XhMessageFeedScrollToEndTrigger, XhMessageFeedViewport } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let host: HTMLElement | null = null
let app: App | null = null

afterEach(() => {
  app?.unmount()
  app = null
  host?.remove()
  host = null
  document.documentElement.removeAttribute('data-material')
})

function probe(attrs: Record<string, string>, parent: HTMLElement = document.body): HTMLElement {
  host ??= Object.assign(document.createElement('div'), { style: 'position: relative' })
  if (!host.isConnected)
    document.body.append(host)
  const el = document.createElement('div')
  for (const [k, v] of Object.entries(attrs))
    el.setAttribute(k, v)
  ;(parent === document.body ? host : parent).append(el)
  return el
}

/** 在同一元素上把一支令牌解成计算色，好与部件的计算值逐字比。 */
function tokenColor(el: HTMLElement, token: string): string {
  const swatch = document.createElement('span')
  swatch.style.color = `var(${token})`
  el.append(swatch)
  const color = getComputedStyle(swatch).color
  swatch.remove()
  return color
}

function highlightOf(el: Element): string {
  const image = getComputedStyle(el).backgroundImage
  return /linear-gradient\((?:to [a-z ]+,\s*)?([a-z]+\([^)]*\)|[a-z]+)/.exec(image)?.[1] ?? 'rgba(0, 0, 0, 0)'
}

describe('材质家族配方', () => {
  it('面：描边、底、前景、投影、背景滤镜与 1px 顶光都从配方取', () => {
    const surface = probe({ 'data-xh-material': 'frosted' })
    const style = getComputedStyle(surface)
    expect(style.borderTopStyle).toBe('solid')
    expect(style.borderTopWidth).toBe('1px')
    expect(style.borderTopColor).toBe(tokenColor(surface, '--xh-material-frosted-border'))
    expect(style.backgroundColor).toBe(tokenColor(surface, '--xh-material-frosted-bg'))
    expect(style.color).toBe(tokenColor(surface, '--xh-material-frosted-fg'))
    expect(style.boxShadow).not.toBe('none')
    expect(style.backdropFilter).toContain('blur(16px)')
    expect(highlightOf(surface)).toBe(tokenColor(surface, '--xh-material-frosted-highlight'))
    expect(getComputedStyle(surface, '::before').content).toBe('none')
  })

  it('使用者经桥接槽覆盖的值排在配方缺省之前', () => {
    const surface = probe({ 'data-xh-material': 'frosted' })
    surface.style.setProperty('--xh-frosted-bg', 'rgb(1, 2, 3)')
    surface.style.setProperty('--xh-frosted-border', 'rgb(4, 5, 6)')
    const style = getComputedStyle(surface)
    expect(style.backgroundColor).toBe('rgb(1, 2, 3)')
    expect(style.borderTopColor).toBe('rgb(4, 5, 6)')
  })

  it('圆钮：面归 Action Control，配方不画描边与底，只补背景滤镜', () => {
    const button = probe({ 'data-xh-material': 'frosted', 'data-xh-action-control': '', 'data-xh-action-variant': 'ghost', 'data-xh-action-profile': 'floating' })
    const style = getComputedStyle(button)
    expect(style.backdropFilter).toContain('blur(16px)')
    // 描边与底来自 Action Control 的 ghost 档（透明），不是 frosted 的面
    expect(style.backgroundColor).toBe('rgba(0, 0, 0, 0)')
    expect(style.borderTopColor).not.toBe(tokenColor(button, '--xh-material-frosted-border'))
  })

  it('liquid 档：投影了 data-xh-liquid 的部件把私有槽换成液态面；没投影的仍是磨砂', () => {
    document.documentElement.setAttribute('data-material', 'liquid')
    const liquid = probe({ 'data-xh-material': 'frosted', 'data-xh-liquid': '' })
    const frosted = probe({ 'data-xh-material': 'frosted' })
    expect(getComputedStyle(liquid).backdropFilter).toContain('blur(8px)')
    expect(getComputedStyle(liquid).backgroundColor).toBe(tokenColor(liquid, '--xh-material-liquid-bg'))
    expect(highlightOf(liquid)).toBe('rgba(0, 0, 0, 0)')
    expect(getComputedStyle(frosted).backdropFilter).toContain('blur(16px)')
  })
})

describe('浮动钮的交互阶梯一致', () => {
  it('回到底部：悬停 / 按下换不透明淡底，键盘聚焦铺 focus surface，带 1px 顶光', async () => {
    host = document.createElement('div')
    document.body.append(host)
    const lines = Array.from({ length: 40 }, (_, i) => `第 ${i + 1} 行`)
    app = createApp({
      render: () => h(XhMessageFeedRoot, { count: lines.length, style: 'block-size: 200px' }, () => [
        h(XhMessageFeedViewport, () => h(XhMessageFeedList, () => lines.map((text, index) => h(XhMessageFeedItem, { itemId: `m${index}`, itemIndex: index }, () => text)))),
        h(XhMessageFeedScrollToEndTrigger),
      ]),
    })
    app.mount(host)
    await nextTick()
    const trigger = host.querySelector<HTMLElement>('[data-part="scroll-to-end-trigger"]')!
    expect(trigger.getAttribute('data-xh-material')).toBe('frosted')
    const read = (name: string): string => {
      const swatch = document.createElement('span')
      swatch.style.color = `var(${name})`
      trigger.append(swatch)
      const color = getComputedStyle(swatch).color
      swatch.remove()
      return color
    }
    expect(read('--xh-action-bg-hover')).toBe(read('--xh-bg-subtle-opaque'))
    expect(read('--xh-action-bg-pressed')).toBe(read('--xh-bg-subtle-hover-opaque'))
    expect(read('--xh-action-bg-focus-visible')).toBe(read('--xh-material-frosted-focus-surface'))
    expect(read('--xh-action-highlight-rest')).toBe(read('--xh-material-frosted-highlight'))
  })
})
