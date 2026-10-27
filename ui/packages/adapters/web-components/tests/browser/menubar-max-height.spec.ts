// 菜单栏的下拉与它的子菜单只按可用高度封顶，和桌面应用的菜单栏一样：可用高度够时 13 条不出滚动条，
// 不再叠 20rem 的固定上限。子菜单的定位层同样搬进 Portal，上限跟着菜单栏走。<xh-menu> 照旧守 20rem。
import { setDiagnosticsLevel } from '@xihan-ui/core'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { defineXhElements } from '../../src/define'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

defineXhElements()

const CHILDREN = Array.from({ length: 13 }, (_, index) => ({ value: `sub-${index}`, label: `子项 ${index + 1}` }))
const ITEMS = [
  ...Array.from({ length: 12 }, (_, index) => ({ value: `item-${index}`, label: `条目 ${index + 1}` })),
  { value: 'more', label: '更多', children: CHILDREN },
]

/** 20rem：菜单族的固定上限。 */
const MENU_CAP = 320

async function settle(): Promise<void> {
  for (let round = 0; round < 4; round++) {
    await Promise.resolve()
    await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
  }
}

function openContent(scope: string): HTMLElement {
  return [...document.querySelectorAll<HTMLElement>(`[data-scope='${scope}'][data-part='content']`)].find(el => !el.hidden)!
}

/** 整层不出滚动条，且比 20rem 高：上限取的是可用高度。 */
function expectNoScroll(content: HTMLElement): void {
  expect(content.scrollHeight).toBeLessThanOrEqual(content.clientHeight + 1)
  expect(content.getBoundingClientRect().height).toBeGreaterThan(MENU_CAP)
}

beforeEach(() => setDiagnosticsLevel('silent'))

afterEach(() => {
  document.body.innerHTML = ''
  setDiagnosticsLevel('warn')
})

describe('wc menubar：下拉只按可用高度封顶', () => {
  it('可用高度够时 13 条不出滚动条，子菜单同样', async () => {
    const menubar = document.createElement('xh-menubar') as HTMLElement & { collection?: unknown }
    menubar.collection = [{ value: 'insert', label: '插入', items: ITEMS }]
    document.body.append(menubar)
    await settle()
    document.querySelector<HTMLElement>(`[data-scope='menubar'][data-part='trigger'][value='insert']`)!.focus()
    await userEvent.keyboard('{ArrowDown}')
    await settle()
    expectNoScroll(openContent('menubar'))

    await userEvent.keyboard('{End}')
    await settle()
    await userEvent.keyboard('{ArrowRight}')
    await settle()
    expectNoScroll(openContent('menu'))
  })

  it('xh-menu 照旧守 20rem：13 条在菜单里滚动', async () => {
    const menu = document.createElement('xh-menu') as HTMLElement & { collection?: unknown }
    menu.setAttribute('label', '插入')
    menu.collection = ITEMS.slice(0, 12).concat(CHILDREN.slice(0, 1))
    document.body.append(menu)
    await settle()
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
