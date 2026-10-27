// 菜单栏的下拉与它的子菜单只按可用高度封顶，和桌面应用的菜单栏一样：可用高度够时 13 条不出滚动条，
// 不再叠 20rem 的固定上限。Menu 照旧守 20rem。打开的那一层再装进有层与无层产物，各核一次上限取的是可用高度。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { createApp, h, nextTick } from 'vue'
import { XhMenubarRoot, XhMenuRoot } from '../../src'
import { closeSheetFrame, SHEET_NAMES, stageSheet } from './sheet-frame'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

const CHILDREN = Array.from({ length: 13 }, (_, index) => ({ value: `sub-${index}`, label: `子项 ${index + 1}` }))
const ITEMS = [
  ...Array.from({ length: 12 }, (_, index) => ({ value: `item-${index}`, label: `条目 ${index + 1}` })),
  { value: 'more', label: '更多', children: CHILDREN },
]

/** 20rem：菜单族的固定上限。 */
const MENU_CAP = 320

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
  document.body.append(host)
  app = createApp({ setup: () => view })
  app.mount(host)
  await settle()
}

function openContent(scope: string): HTMLElement {
  return [...document.querySelectorAll<HTMLElement>(`[data-scope='${scope}'][data-part='content']`)].find(el => !el.hidden)!
}

/** 整层不出滚动条，且比 20rem 高：上限取的是可用高度。 */
function expectNoScroll(content: HTMLElement): void {
  expect(content.scrollHeight).toBeLessThanOrEqual(content.clientHeight + 1)
  expect(content.getBoundingClientRect().height).toBeGreaterThan(MENU_CAP)
}

describe('vue menubar：下拉只按可用高度封顶', () => {
  it('可用高度够时 13 条不出滚动条，子菜单同样；有层与无层产物的上限都取可用高度', async () => {
    await mount(() => h(XhMenubarRoot, { collection: [{ value: 'insert', label: '插入', items: ITEMS }] }))
    document.querySelector<HTMLElement>(`[data-scope='menubar'][data-part='trigger'][data-value='insert']`)!.focus()
    await userEvent.keyboard('{ArrowDown}')
    await settle()
    const content = openContent('menubar')
    expectNoScroll(content)

    const positioner = content.closest<HTMLElement>(`[data-scope='menubar'][data-part='positioner']`)!
    const available = positioner.style.getPropertyValue('--xh-_menubar-available-h')
    expect(Number.parseFloat(available)).toBeGreaterThan(MENU_CAP)
    for (const sheet of SHEET_NAMES) {
      const doc = await stageSheet(positioner.outerHTML, sheet)
      const staged = doc.querySelector<HTMLElement>(`[data-scope='menubar'][data-part='content']`)!
      expect(doc.defaultView!.getComputedStyle(staged).maxBlockSize).toBe(available)
    }
    closeSheetFrame()

    await userEvent.keyboard('{End}')
    await settle()
    await userEvent.keyboard('{ArrowRight}')
    await settle()
    expectNoScroll(openContent('menu'))
  })

  it('menu 照旧守 20rem：13 条在菜单里滚动', async () => {
    await mount(() => h(XhMenuRoot, { label: '插入', collection: ITEMS.slice(0, 12).concat(CHILDREN.slice(0, 1)) }))
    document.querySelector<HTMLElement>(`[data-scope='menu'][data-part='trigger']`)!.focus()
    await userEvent.keyboard('{ArrowDown}')
    await settle()
    const content = openContent('menu')
    // 入场从 scale-enter 放大，播完再量变换后的高度
    await Promise.all(content.getAnimations().map(animation => animation.finished))
    expect(content.getBoundingClientRect().height).toBeCloseTo(MENU_CAP, 0)
    expect(content.scrollHeight).toBeGreaterThan(content.clientHeight)
  })
})
