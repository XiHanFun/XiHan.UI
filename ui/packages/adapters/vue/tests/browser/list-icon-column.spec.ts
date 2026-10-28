// 竖排选项列表的行首格（item-prefix）：同一层里只要有一条带行首格，没写行首格的条目也空出这一格，正文左缘对齐；
// 整层都没有就不留。listbox 真实挂载核一次；listbox、select、combobox、command、mention 的皮肤再用同一份
// 静态标记装进有层与无层产物各量一次（跨分组算一层）。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import { XhIcon, XhListboxContent, XhListboxGroup, XhListboxItem, XhListboxItemPrefix, XhListboxItemText, XhListboxRoot } from '../../src'
import { closeSheetFrame, SHEET_NAMES, stageSheet } from './sheet-frame'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

const LINE = { name: 'line', viewBox: '0 0 24 24', nodes: [{ tag: 'path' as const, attrs: { d: 'M4 12h16' } }] }

/** 每一家的「层」：listbox、combobox、mention 是 content，select、command 是 list。 */
const LAYERS = { listbox: 'content', select: 'list', combobox: 'content', command: 'list', mention: 'content' } as const

/** 层外面那一层：间距等私有槽声明在 root（下拉类在 root 与 positioner）上，静态标记照真实结构包一层。 */
const WRAPPERS: Record<string, string | null> = { listbox: 'root', select: 'positioner', combobox: 'positioner', command: null, mention: 'positioner' }

let app: App | null = null
let host: HTMLElement | null = null

afterEach(() => {
  closeSheetFrame()
  app?.unmount()
  host?.remove()
  app = null
  host = null
})

function item(doc: Document, value: string): HTMLElement {
  return doc.querySelector<HTMLElement>(`[data-part='item'][data-value='${value}']`)!
}

function textLeft(doc: Document, value: string): number {
  return item(doc, value).querySelector<HTMLElement>(`[data-part='item-text']`)!.getBoundingClientRect().left
}

function contentStart(doc: Document, value: string): number {
  const entry = item(doc, value)
  return entry.getBoundingClientRect().left + Number.parseFloat(doc.defaultView!.getComputedStyle(entry).paddingInlineStart)
}

/** 一条集合行：带行首格时里面是一枚 18px 的图形（md 档控件内图标）。部件都挂上组件的挂载类，皮肤按挂载类选中。 */
function row(scope: string, value: string, prefix: boolean): string {
  const lead = prefix
    ? `<span class="xh-scope-${scope}" data-scope="${scope}" data-part="item-prefix" data-xh-collection-slot="prefix"><svg viewBox="0 0 24 24" width="18" height="18"><path d="M4 12h16" stroke="currentColor"/></svg></span>`
    : ''
  return `<div class="xh-scope-${scope}" data-scope="${scope}" data-part="item" data-value="${value}" data-xh-collection-item="" data-xh-collection-context="overlay" data-xh-collection-size="md">${lead}<span class="xh-scope-${scope}" data-scope="${scope}" data-part="item-text" data-xh-collection-slot="text">${value}</span></div>`
}

/** 一层：第一条带行首格，其余不带，后两条在一个分组里（mention 没有分组，平铺）；另一层整层都没有行首格。 */
function markup(scope: string, layer: string): string {
  const grouped = `${row(scope, 'grouped', false)}${row(scope, 'grouped-2', false)}`
  const group = scope === 'mention' ? grouped : `<div class="xh-scope-${scope}" data-scope="${scope}" data-part="group">${grouped}</div>`
  const wrap = (inner: string): string => WRAPPERS[scope] ? `<div class="xh-scope-${scope}" data-scope="${scope}" data-part="${WRAPPERS[scope]}" data-size="md">${inner}</div>` : inner
  return `<div style="inline-size: 240px">
    ${wrap(`<div class="xh-scope-${scope}" data-scope="${scope}" data-part="${layer}">${row(scope, 'iconed', true)}${row(scope, 'plain', false)}${group}</div>`)}
    ${wrap(`<div class="xh-scope-${scope}" data-scope="${scope}" data-part="${layer}">${row(scope, 'bare', false)}${row(scope, 'bare-2', false)}</div>`)}
  </div>`
}

function expectColumn(doc: Document): void {
  const anchor = textLeft(doc, 'iconed')
  expect(anchor).toBeGreaterThan(contentStart(doc, 'iconed') + 8)
  for (const value of ['plain', 'grouped', 'grouped-2'])
    expect(textLeft(doc, value)).toBeCloseTo(anchor, 0)
  for (const value of ['bare', 'bare-2'])
    expect(textLeft(doc, value)).toBeCloseTo(contentStart(doc, value), 0)
}

describe('vue 竖排选项列表：同层有行首格就整层留这一格', () => {
  it('listbox 真实挂载：带行首格的一条、不带的几条（含分组里的）正文左缘对齐', async () => {
    host = document.createElement('div')
    host.style.inlineSize = '240px'
    document.body.append(host)
    app = createApp({
      render: () => h(XhListboxRoot, { 'aria-label': '水果' }, () => h(XhListboxContent, null, () => [
        h(XhListboxItem, { value: 'iconed' }, () => [h(XhListboxItemPrefix, null, () => h(XhIcon, { icon: LINE })), h(XhListboxItemText, () => '带图标')]),
        h(XhListboxItem, { value: 'plain' }, () => h(XhListboxItemText, () => '不带')),
        h(XhListboxGroup, { value: 'more' }, () => [
          h(XhListboxItem, { value: 'grouped' }, () => h(XhListboxItemText, () => '分组里的')),
        ]),
      ])),
    })
    app.mount(host)
    await nextTick()
    await new Promise(resolve => requestAnimationFrame(resolve))
    const anchor = textLeft(document, 'iconed')
    expect(anchor).toBeGreaterThan(contentStart(document, 'iconed') + 8)
    for (const value of ['plain', 'grouped'])
      expect(textLeft(document, value)).toBeCloseTo(anchor, 0)
  })

  for (const [scope, layer] of Object.entries(LAYERS)) {
    it(`${scope} 的皮肤：有层与无层产物都整层留这一格，整层没有就不留`, async () => {
      for (const sheet of SHEET_NAMES)
        expectColumn(await stageSheet(markup(scope, layer), sheet))
    })
  }
})
