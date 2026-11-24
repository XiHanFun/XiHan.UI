// 头部带的底：Table 的表头、Transfer 的面板标头、Descriptions 描边档的标签格同取一支令牌 --xh-bg-header。
//
// 它是淡底的 55% 兑进承载面的实色：比表体里悬停与斑马纹用的淡底浅一档（表头再取同一档就压得比数据还重），
// 两端都是实色，吸顶时滚过去的行不会从它底下透出来。此前 Table 自己兑这一档，另两家取淡底本身，三处深浅不一。
import { afterEach, describe, expect, it } from 'vitest'
import { page } from 'vitest/browser'
import { tokenValue } from './design-token'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let host: HTMLElement | null = null

afterEach(() => {
  host?.remove()
  host = null
})

function node(scope: string, part: string, attrs = '', inner = ''): string {
  return `<div data-scope="${scope}" class="xh-scope-${scope}" data-part="${part}" ${attrs}>${inner}</div>`
}

function mount(markup: string, selector: string): Element {
  host = document.createElement('div')
  host.innerHTML = markup
  document.body.append(host)
  return host.querySelector(selector)!
}

describe('头部带的底', () => {
  it.each([
    ['table 的表头', node('table', 'root', '', node('table', 'header')), '[data-part="header"]'],
    ['transfer 的面板标头', node('transfer', 'panel-header'), '[data-part="panel-header"]'],
    // 标签格与取值格左右并排（视口 ≥ 768px）时标签格才铺底
    ['descriptions 描边档的标签格', node('descriptions', 'root', 'data-variant="outline" data-placement="left"', node('descriptions', 'item', '', node('descriptions', 'label'))), '[data-part="label"]'],
  ])('%s', async (_, markup, selector) => {
    await page.viewport(1024, 640)
    const band = mount(markup, selector)
    expect(getComputedStyle(band).backgroundColor).toBe(tokenValue('background-color', '--xh-bg-header', band))
  })
})
