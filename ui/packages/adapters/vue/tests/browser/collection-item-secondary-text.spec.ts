// 集合行的两处次级文字：跨 text 槽第 2 行的说明，和行尾跨两行居中的快捷键提示（设计真源 §7.5）。
//
// 这份钉住三件事：两者同档同色、快捷键不换行、两者都不跟语气。判据取计算样式并与同一行的
// 主文字 / 语气探针对照，不写死字号与颜色字面量——令牌调档时这份测试跟着走。
import { afterEach, describe, expect, it } from 'vitest'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let host: HTMLElement | null = null

afterEach(() => {
  host?.remove()
  host = null
})

/** 挂一行带说明与快捷键的条目，返回三个槽算出来的样式。 */
function row(tone?: string): { text: CSSStyleDeclaration, description: CSSStyleDeclaration, shortcut: CSSStyleDeclaration } {
  if (!host) {
    host = document.createElement('div')
    document.body.append(host)
  }
  const wrap = document.createElement('div')
  wrap.innerHTML = `<div data-scope="menu" data-part="item" data-xh-collection-item data-xh-collection-size="md" data-xh-collection-context="overlay"${tone ? ` data-tone="${tone}"` : ''}><span data-xh-collection-slot="text">移到回收站</span><span data-xh-collection-slot="description">不可恢复</span><span data-xh-collection-slot="shortcut">⌘ ⌫</span></div>`
  const item = wrap.firstElementChild!
  host.append(item)
  const [text, description, shortcut] = [...item.children].map(child => getComputedStyle(child))
  return { text: text!, description: description!, shortcut: shortcut! }
}

/** 同一语气下语气层解出来的字色，用来免去写死颜色。 */
function toneFg(tone: string): string {
  const el = document.createElement('div')
  el.dataset.tone = tone
  el.innerHTML = `<i style="color: var(--xh-tone-fg)"></i>`
  document.body.append(el)
  const fg = getComputedStyle(el.firstElementChild!).color
  el.remove()
  return fg
}

describe('集合行的次级文字', () => {
  it('说明与快捷键同档同色，都比主文字小一级', () => {
    const { text, description, shortcut } = row()
    expect(shortcut.fontSize).toBe(description.fontSize)
    expect(shortcut.color).toBe(description.color)
    expect(Number.parseFloat(shortcut.fontSize)).toBeLessThan(Number.parseFloat(text.fontSize))
    expect(shortcut.color).not.toBe(text.color)
  })

  it('快捷键不换行：一串按键记号不该被折成两个组合', () => {
    expect(row().shortcut.whiteSpace).toBe('nowrap')
  })

  it('两处次级文字都不跟语气：一行里只有一种彩字', () => {
    const { text, description, shortcut } = row('danger')
    const fg = toneFg('danger')
    expect(text.color).toBe(fg)
    expect(description.color).not.toBe(fg)
    expect(shortcut.color).not.toBe(fg)
  })
})
