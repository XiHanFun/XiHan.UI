// 集合行里的次级文字（第 2 行的说明、行尾的快捷键）随尺寸档走，比同档主文字低一级：sm / md / lg = 12 / 13 / 14。
//
// 此前一律钉在 13px：sm 行的正文也是 13px，说明与正文一样大，读不出主次；lg 行正文 16px、说明仍 13px，差得又太远。
import { afterEach, describe, expect, it } from 'vitest'
import { tokenLength } from './design-token'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

const SIZES = ['sm', 'md', 'lg'] as const

let host: HTMLElement | null = null

afterEach(() => {
  host?.remove()
  host = null
})

/** 一行集合条目：按连接层的投影写好配方标记与尺寸档。 */
function row(scope: string, part: string, size: string, slot: 'description' | 'shortcut'): HTMLElement {
  host = document.createElement('div')
  host.innerHTML = `<div data-scope="${scope}" class="xh-scope-${scope}" data-part="item" data-xh-collection-item data-xh-collection-context="overlay" data-xh-collection-size="${size}">
    <span data-scope="${scope}" class="xh-scope-${scope}" data-part="item-text" data-xh-collection-slot="text">复制</span>
    <span data-scope="${scope}" class="xh-scope-${scope}" data-part="${part}" data-xh-collection-slot="${slot}">说明</span>
  </div>`
  document.body.append(host)
  return host.querySelector<HTMLElement>(`[data-part='${part}']`)!
}

describe('集合行的次级文字随尺寸档低一级', () => {
  it.each(SIZES)('配方：%s 档的说明与快捷键取同档的控件次级字号', (size) => {
    const want = `${tokenLength(`--xh-control-caption-${size}`)}px`
    expect(getComputedStyle(row('select', 'item-description', size, 'description')).fontSize).toBe(want)
    host!.remove()
    expect(getComputedStyle(row('command', 'item-shortcut', size, 'shortcut')).fontSize).toBe(want)
  })

  it.each(['menu', 'context-menu', 'menubar'].flatMap(scope => SIZES.map(size => [scope, size])))('%s：%s 档条目的说明', (scope, size) => {
    expect(getComputedStyle(row(scope, 'item-description', size, 'description')).fontSize).toBe(`${tokenLength(`--xh-control-caption-${size}`)}px`)
  })

  it.each(SIZES)('grid-list：%s 档行的说明', (size) => {
    const description = row('grid-list', 'row-description', size, 'description')
    expect(getComputedStyle(description).fontSize).toBe(`${tokenLength(`--xh-control-caption-${size}`)}px`)
  })
})
