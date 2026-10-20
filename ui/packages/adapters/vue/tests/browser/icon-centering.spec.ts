// 行首图标与正文上下居中：图标中线与正文中线相差不超过 0.5px。菜单族的 item-icon 盒按图标尺取高，不靠行高撑，
// 里面的图标居中；子菜单入口的图标同样。listbox、select、combobox、command、mention 的 item-prefix 里的图标同样居中。
// 菜单族按 sm、md 两档各量一次（sm 的图标比行高矮一截，md 的图标与行高差不多）；打开的那一层再装进有层与无层产物各量一次。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { createApp, h, nextTick } from 'vue'
import { XhContextMenuRoot, XhIcon, XhListboxContent, XhListboxItem, XhListboxItemPrefix, XhListboxItemText, XhListboxRoot, XhMenubarRoot, XhMenuRoot } from '../../src'
import { closeSheetFrame, serialize, SHEET_NAMES, stageSheet } from './sheet-frame'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

const LINE = { name: 'line', viewBox: '0 0 24 24', nodes: [{ tag: 'path' as const, attrs: { d: 'M4 12h16' } }] }

/** 一条带图标的普通条目、一条带图标的子菜单入口。 */
const ITEMS = [
  { value: 'tour', label: '开始引导', icon: LINE },
  { value: 'keys', label: '快捷键' },
  { value: 'more', label: '更多', icon: LINE, children: [{ value: 'docs', label: '文档' }] },
]

const SIZES = ['sm', 'md'] as const

/** 每一家的「层」与层外面那一层（私有槽声明在那里，静态标记照真实结构包一层）。 */
const LISTS = {
  listbox: { layer: 'content', wrapper: 'root' },
  select: { layer: 'list', wrapper: 'positioner' },
  combobox: { layer: 'content', wrapper: 'positioner' },
  command: { layer: 'list', wrapper: null },
  mention: { layer: 'content', wrapper: 'positioner' },
} as const

let app: App | null = null
let host: HTMLElement | null = null

afterEach(() => {
  closeSheetFrame()
  app?.unmount()
  host?.remove()
  document.getElementById('xh-portal-root')?.remove()
  app = null
  host = null
})

async function settle(): Promise<void> {
  for (let round = 0; round < 3; round++) {
    await nextTick()
    await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
  }
}

async function mount(view: () => ReturnType<typeof h>): Promise<void> {
  host = document.createElement('div')
  host.style.inlineSize = '240px'
  document.body.append(host)
  app = createApp({ setup: () => view })
  app.mount(host)
  await settle()
}

function middle(element: Element): number {
  const box = element.getBoundingClientRect()
  return box.top + box.height / 2
}

/**
 * 条目里的图标中线与正文中线相差不超过 0.5px。菜单族的图标盒高等于图标尺：ruler 那一条的图标按图标尺画出，
 * 盒高与它相同（作者放进大一号的图标时，盒子也不跟着长）。
 */
function expectCentered(doc: Document, value: string, cell: 'item-icon' | 'item-prefix', ruler = value): void {
  const entry = doc.querySelector<HTMLElement>(`[data-part='item'][data-value='${value}']`)!
  const box = entry.querySelector<HTMLElement>(`[data-part='${cell}']`)!
  const svg = box.querySelector('svg')!
  expect(svg.getBoundingClientRect().height).toBeGreaterThan(8)
  expect(Math.abs(middle(svg) - middle(entry.querySelector(`[data-part='item-text']`)!))).toBeLessThanOrEqual(0.5)
  if (cell === 'item-icon') {
    const scale = doc.querySelector(`[data-part='item'][data-value='${ruler}'] [data-part='item-icon'] svg`)!
    expect(box.getBoundingClientRect().height).toBeCloseTo(scale.getBoundingClientRect().height, 1)
  }
}

async function expectMenuCentered(scope: string, values: readonly string[] = ['tour', 'more'], ruler?: string): Promise<void> {
  for (const value of values)
    expectCentered(document, value, 'item-icon', ruler)
  const markup = document.querySelector<HTMLElement>(`[data-scope='${scope}'][data-part='content']:not([hidden])`)!.outerHTML
  for (const sheet of SHEET_NAMES) {
    const doc = await stageSheet(`<div style="inline-size: 280px">${markup}</div>`, sheet)
    for (const value of values)
      expectCentered(doc, value, 'item-icon', ruler)
  }
  closeSheetFrame()
}

/** 一条集合行，行首格里是一枚 XhIcon（取条目的图标尺）；部件都挂上组件的挂载类，皮肤按挂载类选中。 */
function row(scope: string, value: string, icon: string): string {
  return `<div class="xh-scope-${scope}" data-scope="${scope}" data-part="item" data-value="${value}" data-xh-collection-item="" data-xh-collection-context="overlay" data-xh-collection-size="sm">`
    + `<span class="xh-scope-${scope}" data-scope="${scope}" data-part="item-prefix" data-xh-collection-slot="prefix">${icon}</span>`
    + `<span class="xh-scope-${scope}" data-scope="${scope}" data-part="item-text" data-xh-collection-slot="text">${value}</span></div>`
}

describe('vue 行首图标与正文上下居中', () => {
  for (const size of SIZES) {
    it(`menu（${size}）`, async () => {
      await mount(() => h(XhMenuRoot, { label: '帮助', size, collection: ITEMS }))
      document.querySelector<HTMLElement>(`[data-scope='menu'][data-part='trigger']`)!.focus()
      await userEvent.keyboard('{ArrowDown}')
      await settle()
      await expectMenuCentered('menu')
    })

    it(`context-menu（${size}）`, async () => {
      await mount(() => h(XhContextMenuRoot, { size, collection: ITEMS }, { trigger: () => '画布' }))
      document.querySelector<HTMLElement>(`[data-scope='context-menu'][data-part='trigger']`)!.focus()
      await userEvent.keyboard('{Shift>}{F10}{/Shift}')
      await settle()
      await expectMenuCentered('context-menu')
    })

    it(`menubar（${size}）`, async () => {
      await mount(() => h(XhMenubarRoot, { size, collection: [{ value: 'help', label: '帮助', items: ITEMS }] }))
      document.querySelector<HTMLElement>(`[data-scope='menubar'][data-part='trigger'][data-value='help']`)!.focus()
      await userEvent.keyboard('{ArrowDown}')
      await settle()
      await expectMenuCentered('menubar')
    })
  }

  it('menu：item-prefix 放进大一号的图标，图标格仍按图标尺取高，图标与正文居中', async () => {
    await mount(() => h(XhMenuRoot, { label: '编辑', size: 'sm', collection: [{ value: 'small', label: '复制' }, { value: 'big', label: '粘贴' }] }, {
      'item-prefix': (node: { value: string }) => node.value === 'big'
        ? [h('svg', { viewBox: '0 0 24 24', width: '24', height: '24' }, [h('path', { d: 'M4 12h16', stroke: 'currentColor' })])]
        : [h(XhIcon, { icon: LINE })],
    }))
    document.querySelector<HTMLElement>(`[data-scope='menu'][data-part='trigger']`)!.focus()
    await userEvent.keyboard('{ArrowDown}')
    await settle()
    await expectMenuCentered('menu', ['small', 'big'], 'small')
  })

  it('listbox：item-prefix 里的图标与正文居中', async () => {
    await mount(() => h(XhListboxRoot, { label: '水果', size: 'sm' }, () => h(XhListboxContent, () => [
      h(XhListboxItem, { value: 'apple' }, () => [h(XhListboxItemPrefix, () => h(XhIcon, { icon: LINE })), h(XhListboxItemText, () => '苹果')]),
    ])))
    expectCentered(document, 'apple', 'item-prefix')
  })

  for (const [scope, { layer, wrapper }] of Object.entries(LISTS)) {
    it(`${scope}：item-prefix 里的图标在有层与无层产物里都与正文居中`, async () => {
      const icon = await serialize(() => h(XhIcon, { icon: LINE }))
      const inner = `<div class="xh-scope-${scope}" data-scope="${scope}" data-part="${layer}">${row(scope, 'apple', icon)}</div>`
      const markup = wrapper ? `<div class="xh-scope-${scope}" data-scope="${scope}" data-part="${wrapper}" data-size="sm">${inner}</div>` : inner
      for (const sheet of SHEET_NAMES)
        expectCentered(await stageSheet(`<div style="inline-size: 240px">${markup}</div>`, sheet), 'apple', 'item-prefix')
    })
  }
})
