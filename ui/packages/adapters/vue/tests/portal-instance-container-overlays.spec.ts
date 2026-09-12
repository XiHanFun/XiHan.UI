// @vitest-environment jsdom

import type { VNode } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, defineComponent, h, nextTick } from 'vue'
import {
  provideXhConfig,
  XhContextMenuContent,
  XhContextMenuPositioner,
  XhContextMenuRoot,
  XhHoverCardContent,
  XhHoverCardPositioner,
  XhHoverCardRoot,
  XhMenubarContent,
  XhMenubarPositioner,
  XhMenubarRoot,
  XhMenuContent,
  XhMenuPositioner,
  XhMenuRoot,
  XhPaginationContent,
  XhPaginationPageSizeSelect,
  XhPaginationPositioner,
  XhPaginationRoot,
  XhPopconfirmContent,
  XhPopconfirmPositioner,
  XhPopconfirmRoot,
  XhPopoverContent,
  XhPopoverPositioner,
  XhPopoverRoot,
  XhTooltipContent,
  XhTooltipPositioner,
  XhTooltipRoot,
} from '../src'

let unmount: (() => void) | undefined

afterEach(() => {
  unmount?.()
  unmount = undefined
  document.body.innerHTML = ''
})

type PortalCase = readonly [scope: string, render: (container: Element) => VNode]

const CASES: readonly PortalCase[] = [
  ['popover', container => h(XhPopoverRoot, { open: true }, () => h(XhPopoverPositioner, { container }, () => h(XhPopoverContent)))],
  ['popconfirm', container => h(XhPopconfirmRoot, { open: true }, () => h(XhPopconfirmPositioner, { container }, () => h(XhPopconfirmContent)))],
  ['hover-card', container => h(XhHoverCardRoot, { open: true }, () => h(XhHoverCardPositioner, { container }, () => h(XhHoverCardContent)))],
  ['tooltip', container => h(XhTooltipRoot, { open: true }, () => h(XhTooltipPositioner, { container }, () => h(XhTooltipContent)))],
  ['menu', container => h(XhMenuRoot, { open: true }, () => h(XhMenuPositioner, { container }, () => h(XhMenuContent)))],
  ['context-menu', container => h(XhContextMenuRoot, { open: true }, () => h(XhContextMenuPositioner, { container }, () => h(XhContextMenuContent)))],
  ['menubar', container => h(XhMenubarRoot, {
    collection: [{ value: 'main', label: '主菜单' }],
    value: 'main',
  }, () => h(XhMenubarPositioner, { value: 'main', container }, () => h(XhMenubarContent)))],
]

function mountWithConfig(render: (configured: Element) => VNode): Element {
  const configured = document.createElement('div')
  const host = document.createElement('div')
  document.body.append(configured, host)
  const app = createApp(defineComponent({
    setup() {
      provideXhConfig({ portalContainer: () => configured })
      return () => render(configured)
    },
  }))
  app.mount(host)
  unmount = () => app.unmount()
  return configured
}

describe.each(CASES)('vue %s 实例 Portal 容器', (scope, render) => {
  it('实例容器优先于应用级容器', async () => {
    const instance = document.createElement('div')
    document.body.append(instance)
    const configured = mountWithConfig(() => render(instance))
    await nextTick()
    await nextTick()

    const positioner = document.querySelector<HTMLElement>(`[data-scope="${scope}"][data-part="positioner"]`)!
    expect(instance.contains(positioner)).toBe(true)
    expect(configured.contains(positioner)).toBe(false)
  })
})

describe('vue pagination 实例 Portal 容器', () => {
  it('省略页与 PageSizeSelect 各自优先于应用级容器', async () => {
    const ellipsis = document.createElement('div')
    const pageSize = document.createElement('div')
    document.body.append(ellipsis, pageSize)
    const configured = mountWithConfig(() => h(XhPaginationRoot, {
      count: 100,
      pageSizeOptions: [10, 20],
    }, () => [
      h(XhPaginationPageSizeSelect, { container: pageSize }),
      h(XhPaginationPositioner, { container: ellipsis }, () => h(XhPaginationContent)),
    ]))
    await nextTick()
    await nextTick()

    const ellipsisPositioner = document.querySelector<HTMLElement>('[data-scope="pagination"][data-part="positioner"]')!
    const pageSizePositioner = document.querySelector<HTMLElement>('[data-scope="select"][data-part="positioner"]')!
    expect(ellipsis.contains(ellipsisPositioner)).toBe(true)
    expect(pageSize.contains(pageSizePositioner)).toBe(true)
    expect(configured.contains(ellipsisPositioner)).toBe(false)
    expect(configured.contains(pageSizePositioner)).toBe(false)
  })
})
