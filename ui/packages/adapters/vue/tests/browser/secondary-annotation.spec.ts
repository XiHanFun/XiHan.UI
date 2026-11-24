// 次级标注（计数、快捷键、时间戳、序号）：说明档 12px，次要字色 --xh-fg-muted。
// --xh-fg-subtle 留给占位字与禁用标签：拿来画计数，读起来像是这个数不可用。
// 计数做成一枚实心徽标时不另画：MessageFeed 回到底部钮上的未读数与 Badge 的 sm 档同一副
// （14px 盒、1px 承载面色描边、12px 中等字重、等宽数字）。
import { afterEach, describe, expect, it } from 'vitest'
import { tokenLength, tokenValue } from './design-token'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let host: HTMLElement | null = null

afterEach(() => {
  host?.remove()
  host = null
})

/** 颜色按画出来的像素比：同一种白可以写成 oklch(1 0 0)，也可以是语气层算式给出的 color(srgb-linear 1 1 1)。 */
function pixel(color: string): string {
  const context = new OffscreenCanvas(1, 1).getContext('2d')!
  context.fillStyle = color
  context.fillRect(0, 0, 1, 1)
  return [...context.getImageData(0, 0, 1, 1).data].join(',')
}

function mount(markup: string): HTMLElement {
  host = document.createElement('div')
  host.innerHTML = markup
  document.body.append(host)
  return host.firstElementChild as HTMLElement
}

describe('次级标注', () => {
  it.each([
    ['transfer', 'panel-count'],
    ['question-flow', 'counter'],
  ])('%s 的 %s：12px、次要字色', (scope, part) => {
    const style = getComputedStyle(mount(`<span data-scope="${scope}" class="xh-scope-${scope}" data-part="${part}">3 / 12</span>`))
    expect(style.fontSize).toBe(`${tokenLength('--xh-text-caption-size')}px`)
    expect(style.color).toBe(tokenValue('color', '--xh-fg-muted'))
  })

  it('message-feed：回到底部钮上的未读数与 Badge 的 sm 档同一副', () => {
    host = document.createElement('div')
    host.innerHTML = `
      <span data-scope="message-feed" class="xh-scope-message-feed" data-part="unread-count">12</span>
      <span data-scope="badge" class="xh-scope-badge" data-part="indicator" data-size="sm" data-tone="brand">12</span>`
    document.body.append(host)
    const [unread, badge] = [...host.children].map(node => getComputedStyle(node))
    for (const property of ['height', 'min-width', 'padding-left', 'font-size', 'font-weight', 'line-height', 'border-top-width'] as const)
      expect(unread!.getPropertyValue(property), property).toBe(badge!.getPropertyValue(property))
    for (const property of ['border-top-color', 'background-color', 'color'] as const)
      expect(pixel(unread!.getPropertyValue(property)), property).toBe(pixel(badge!.getPropertyValue(property)))
  })
})
