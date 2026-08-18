// @vitest-environment jsdom
// positioner 部件搬到 portal 落点：宿主祖先建了层叠上下文也压不住浮层。
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { createApp, defineComponent, h, nextTick } from 'vue'
import {
  provideXhConfig,
  XhSelectContent,
  XhSelectPositioner,
  XhSelectRoot,
  XhTimePickerContent,
  XhTimePickerPositioner,
  XhTimePickerRoot,
  XhTooltipContent,
  XhTooltipPositioner,
  XhTooltipRoot,
  XhTourBackdrop,
  XhTourContent,
  XhTourPositioner,
  XhTourRoot,
  XhTourSpotlight,
  XhTreeSelectContent,
  XhTreeSelectPositioner,
  XhTreeSelectRoot,
} from '../src'

const PORTAL_ID = 'xh-portal-c'

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
  extra: (() => unknown[]) | null = null,
): Promise<HTMLElement> {
  const host = document.createElement('div')
  document.body.appendChild(host)
  const app = createApp(defineComponent({
    setup() {
      provideXhConfig({ portalContainer: () => document.getElementById(PORTAL_ID) })
      return () => h(root as never, rootProps, () => [
        ...(extra?.() ?? []),
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

function partOf(scope: string, part: string): HTMLElement | null {
  return document.querySelector<HTMLElement>(`[data-scope="${scope}"][data-part="${part}"]`)
}

/** 落在落点里、且不在作者那棵树里。 */
function expectPortaled(host: HTMLElement, scope: string, part = 'positioner'): void {
  const el = partOf(scope, part)
  expect(el).not.toBeNull()
  expect(document.getElementById(PORTAL_ID)?.contains(el!)).toBe(true)
  expect(host.contains(el!)).toBe(false)
}

describe('positioner 落在 portal 落点', () => {
  it('select', async () => {
    const host = await mountOverlay(XhSelectRoot, XhSelectPositioner, XhSelectContent, { open: true })
    expectPortaled(host, 'select')
  })

  it('time-picker', async () => {
    const host = await mountOverlay(XhTimePickerRoot, XhTimePickerPositioner, XhTimePickerContent, { open: true })
    expectPortaled(host, 'time-picker')
  })

  it('tooltip', async () => {
    const host = await mountOverlay(XhTooltipRoot, XhTooltipPositioner, XhTooltipContent, { open: true })
    expectPortaled(host, 'tooltip')
  })

  it('tree-select', async () => {
    const host = await mountOverlay(XhTreeSelectRoot, XhTreeSelectPositioner, XhTreeSelectContent, { open: true })
    expectPortaled(host, 'tree-select')
  })

  it('tour：遮罩与高亮框跟着一起搬', async () => {
    const host = await mountOverlay(
      XhTourRoot,
      XhTourPositioner,
      XhTourContent,
      { open: true, steps: [{ id: 'a', title: '一' }] },
      () => [h(XhTourBackdrop), h(XhTourSpotlight)],
    )
    expectPortaled(host, 'tour')
    expectPortaled(host, 'tour', 'backdrop')
    expectPortaled(host, 'tour', 'spotlight')
  })
})
