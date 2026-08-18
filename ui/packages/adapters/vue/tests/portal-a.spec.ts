// @vitest-environment jsdom
// positioner 部件搬到 portal 落点：宿主祖先建了层叠上下文也压不住浮层。
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { createApp, defineComponent, h, nextTick } from 'vue'
import {
  provideXhConfig,
  XhCascaderContent,
  XhCascaderPositioner,
  XhCascaderRoot,
  XhColorPickerContent,
  XhColorPickerPositioner,
  XhColorPickerRoot,
  XhComboboxContent,
  XhComboboxPositioner,
  XhComboboxRoot,
  XhContextMenuContent,
  XhContextMenuPositioner,
  XhContextMenuRoot,
  XhDatePickerContent,
  XhDatePickerPositioner,
  XhDatePickerRoot,
  XhHoverCardContent,
  XhHoverCardPositioner,
  XhHoverCardRoot,
} from '../src'

const PORTAL_ID = 'xh-portal-a'

let mounted: Array<() => void> = []

beforeEach(() => {
  const portal = document.createElement('div')
  portal.id = PORTAL_ID
  document.body.appendChild(portal)
})

afterEach(() => {
  for (const un of mounted) un()
  mounted = []
  document.body.innerHTML = ''
})

/** 挂一套「根 + positioner + content」，全局配置把落点指到 PORTAL_ID 那个容器。 */
async function mountOverlay(
  root: unknown,
  positioner: unknown,
  content: unknown,
  rootProps: Record<string, unknown> = {},
): Promise<HTMLElement> {
  const host = document.createElement('div')
  document.body.appendChild(host)
  const app = createApp(defineComponent({
    setup() {
      provideXhConfig({ portalContainer: () => document.getElementById(PORTAL_ID) })
      return () => h(root as never, rootProps, () => [
        h(positioner as never, null, () => [h(content as never, null, () => '正文')]),
      ])
    },
  }))
  app.mount(host)
  mounted.push(() => {
    app.unmount()
    host.remove()
  })
  await nextTick()
  await nextTick()
  return host
}

function positionerOf(scope: string): HTMLElement | null {
  return document.querySelector<HTMLElement>(`[data-scope="${scope}"][data-part="positioner"]`)
}

/** 落在落点里、且不在作者那棵树里。 */
function expectPortaled(host: HTMLElement, scope: string): void {
  const positioner = positionerOf(scope)
  expect(positioner).not.toBeNull()
  expect(document.getElementById(PORTAL_ID)?.contains(positioner!)).toBe(true)
  expect(host.contains(positioner!)).toBe(false)
}

describe('positioner 落在 portal 落点', () => {
  it('cascader', async () => {
    const host = await mountOverlay(XhCascaderRoot, XhCascaderPositioner, XhCascaderContent, { open: true })
    expectPortaled(host, 'cascader')
  })

  it('color-picker', async () => {
    const host = await mountOverlay(XhColorPickerRoot, XhColorPickerPositioner, XhColorPickerContent, { open: true })
    expectPortaled(host, 'color-picker')
  })

  it('combobox', async () => {
    const host = await mountOverlay(XhComboboxRoot, XhComboboxPositioner, XhComboboxContent, { open: true })
    expectPortaled(host, 'combobox')
  })

  it('context-menu', async () => {
    const host = await mountOverlay(XhContextMenuRoot, XhContextMenuPositioner, XhContextMenuContent, {})
    expectPortaled(host, 'context-menu')
  })

  it('date-picker', async () => {
    const host = await mountOverlay(XhDatePickerRoot, XhDatePickerPositioner, XhDatePickerContent, { open: true })
    expectPortaled(host, 'date-picker')
  })

  it('hover-card', async () => {
    const host = await mountOverlay(XhHoverCardRoot, XhHoverCardPositioner, XhHoverCardContent, { open: true })
    expectPortaled(host, 'hover-card')
  })
})

describe('收起态的 positioner 常驻落点', () => {
  it('收起时 positioner 留在落点里，content 靠内联 display 收起', async () => {
    const host = await mountOverlay(XhHoverCardRoot, XhHoverCardPositioner, XhHoverCardContent)
    expectPortaled(host, 'hover-card')
    const positioner = positionerOf('hover-card')!
    expect(positioner.getAttribute('data-state')).toBe('closed')
    const content = positioner.querySelector<HTMLElement>('[data-part="content"]')!
    expect(content.style.display).toBe('none')
  })

  it('卸载后落点里不留残骸', async () => {
    await mountOverlay(XhHoverCardRoot, XhHoverCardPositioner, XhHoverCardContent)
    for (const un of mounted) un()
    mounted = []
    await nextTick()
    expect(document.getElementById(PORTAL_ID)?.childElementCount).toBe(0)
    expect(positionerOf('hover-card')).toBeNull()
  })
})
