// 语气色画成细线与色条时取保证 3:1 的那一档，不取裸主色。
//
// 进度填充、转圈的弧、面的语气描边都是非文字图形，同样要对承载面 3:1（WCAG 1.4.11）。
// 裸主色 --xh-_tone 在浅色档下的黄（warning）只有 2.70:1：tone.css 按主题兜底的是
// --xh-_tone-border-control（与它同值的 --xh-_tone-soft），绕过它的几家就漏了这一档。
// Icon 的描边框与 Tag 的描边档同是「语气淡底 + 语气描边的小盒」，同取控件描边那一档。
import { afterEach, describe, expect, it } from 'vitest'
import { tokenValue } from './design-token'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let host: HTMLElement | null = null

afterEach(() => {
  host?.remove()
  host = null
})

function mount(markup: string): HTMLElement {
  host = document.createElement('div')
  host.dataset.theme = 'light'
  host.innerHTML = markup
  document.body.append(host)
  return host
}

/** 在写了 data-tone 的节点上解出某支语气私有槽的颜色。 */
function toneColor(on: Element, slot: string): string {
  return tokenValue('color', slot, on)
}

describe('语气细线取保证 3:1 的那一档（浅色档 warning）', () => {
  it('progress：线形的填充', () => {
    const root = mount(`<div data-scope="progress" class="xh-scope-progress" data-part="root" data-tone="warning">
      <div data-scope="progress" class="xh-scope-progress" data-part="track"><div data-scope="progress" class="xh-scope-progress" data-part="range"></div></div></div>`)
    const tone = root.querySelector('[data-tone]')!
    expect(getComputedStyle(root.querySelector('[data-part="range"]')!).backgroundColor).toBe(toneColor(tone, '--xh-_tone-soft'))
    expect(toneColor(tone, '--xh-_tone-soft')).not.toBe(toneColor(tone, '--xh-_tone'))
  })

  it('progress：环形的填充', () => {
    const root = mount(`<svg data-scope="progress" class="xh-scope-progress" data-part="root" data-tone="warning">
      <circle data-scope="progress" class="xh-scope-progress" data-part="range" data-variant="circle"></circle></svg>`)
    const tone = root.querySelector('[data-tone]')!
    expect(getComputedStyle(root.querySelector('[data-part="range"]')!).stroke).toBe(toneColor(tone, '--xh-_tone-soft'))
  })

  it('spinner：环档的弧', () => {
    const root = mount(`<div data-scope="spinner" class="xh-scope-spinner" data-part="root" data-tone="warning"></div>`)
    const spinner = root.firstElementChild!
    expect(getComputedStyle(spinner, '::before').borderRightColor).toBe(toneColor(spinner, '--xh-_tone-soft'))
  })

  it('approval：写了语气、待决的面，描边取控件描边档', () => {
    const root = mount(`<div data-scope="approval" class="xh-scope-approval" data-part="root" data-state="pending" data-tone="warning"></div>`)
    const approval = root.firstElementChild!
    expect(getComputedStyle(approval).borderTopColor).toBe(toneColor(approval, '--xh-_tone-border-control'))
  })

  it('icon：描边框与 Tag 的描边档同取控件描边那一档', () => {
    const root = mount(`<span data-scope="icon" class="xh-scope-icon" data-part="root" data-frame="outline" data-tone="warning"></span>
      <span data-scope="tag" class="xh-scope-tag" data-part="root" data-variant="outline" data-tone="warning"></span>`)
    const [icon, tag] = root.children
    expect(getComputedStyle(icon!).borderTopColor).toBe(toneColor(icon!, '--xh-_tone-border-control'))
    expect(getComputedStyle(icon!).borderTopColor).toBe(getComputedStyle(tag!).borderTopColor)
  })
})
