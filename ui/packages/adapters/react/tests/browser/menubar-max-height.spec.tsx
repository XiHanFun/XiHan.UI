// 菜单栏的下拉与它的子菜单只按可用高度封顶，和桌面应用的菜单栏一样：可用高度够时 13 条不出滚动条，
// 不再叠 20rem 的固定上限。子菜单的定位层搬进 Portal，上限经子菜单机器跟着菜单栏走。Menu 照旧守 20rem。
import type { MenuNode } from '@xihan-ui/headless'
import type { ReactNode } from 'react'
import type { Root } from 'react-dom/client'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { XhMenubarRoot, XhMenuRoot } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

const CHILDREN: MenuNode[] = Array.from({ length: 13 }, (_, index) => ({ value: `sub-${index}`, label: `子项 ${index + 1}` }))
const ITEMS: MenuNode[] = [
  ...Array.from({ length: 12 }, (_, index) => ({ value: `item-${index}`, label: `条目 ${index + 1}` })),
  { value: 'more', label: '更多', children: CHILDREN },
]

/** 20rem：菜单族的固定上限。 */
const MENU_CAP = 320

let root: Root | null = null
let host: HTMLElement | null = null

afterEach(() => {
  act(() => root?.unmount())
  host?.remove()
  document.getElementById('xh-portal-root')?.remove()
  root = null
  host = null
})

async function settle(): Promise<void> {
  for (let round = 0; round < 3; round++)
    await act(() => new Promise<void>(resolve => requestAnimationFrame(() => resolve())))
}

async function mount(view: ReactNode): Promise<void> {
  host = document.createElement('div')
  document.body.append(host)
  root = createRoot(host)
  act(() => root!.render(view))
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

describe('react menubar：下拉只按可用高度封顶', () => {
  it('可用高度够时 13 条不出滚动条，子菜单同样', async () => {
    await mount(<XhMenubarRoot collection={[{ value: 'insert', label: '插入', items: ITEMS }]} />)
    act(() => document.querySelector<HTMLElement>(`[data-scope='menubar'][data-part='trigger'][data-value='insert']`)!.focus())
    await userEvent.keyboard('{ArrowDown}')
    await settle()
    expectNoScroll(openContent('menubar'))

    await userEvent.keyboard('{End}')
    await settle()
    await userEvent.keyboard('{ArrowRight}')
    await settle()
    expectNoScroll(openContent('menu'))
  })

  it('menu 照旧守 20rem：13 条在菜单里滚动', async () => {
    await mount(<XhMenuRoot label="插入" collection={ITEMS.slice(0, 12).concat(CHILDREN.slice(0, 1))} />)
    act(() => document.querySelector<HTMLElement>(`[data-scope='menu'][data-part='trigger']`)!.focus())
    await userEvent.keyboard('{ArrowDown}')
    await settle()
    const content = openContent('menu')
    // 入场从 scale-enter 放大，播完再量变换后的高度
    await Promise.all(content.getAnimations().map(animation => animation.finished))
    expect(content.getBoundingClientRect().height).toBeCloseTo(MENU_CAP, 0)
    expect(content.scrollHeight).toBeGreaterThan(content.clientHeight)
  })
})
