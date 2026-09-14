// @vitest-environment jsdom

import { afterEach, describe, expect, it } from 'vitest'
import { createApp, defineComponent, h, nextTick } from 'vue'
import {
  provideXhConfig,
  XhCommandContent,
  XhCommandRoot,
  XhDialogContent,
  XhDialogRoot,
  XhFloatingPanelContent,
  XhFloatingPanelPositioner,
  XhFloatingPanelRoot,
  XhImageViewerContent,
  XhImageViewerRoot,
  XhSideNavBranch,
  XhSideNavBranchContent,
  XhSideNavBranchTrigger,
  XhSideNavList,
  XhSideNavRoot,
  XhTourBackdrop,
  XhTourContent,
  XhTourPositioner,
  XhTourRoot,
  XhTourSpotlight,
} from '../src'

let cleanup: Array<() => void> = []

afterEach(() => {
  for (const dispose of cleanup) dispose()
  cleanup = []
  document.body.innerHTML = ''
})

async function mount(render: (target: Element) => unknown): Promise<{ configured: HTMLElement, instance: HTMLElement }> {
  const configured = document.createElement('div')
  const instance = document.createElement('div')
  const host = document.createElement('div')
  document.body.append(configured, instance, host)
  const app = createApp(defineComponent({
    setup() {
      provideXhConfig({ portalContainer: () => configured })
      return () => render(instance) as never
    },
  }))
  app.mount(host)
  cleanup.push(() => app.unmount())
  await nextTick()
  await nextTick()
  return { configured, instance }
}

describe('vue 特殊浮层实例 Portal 容器', () => {
  it.each([
    ['dialog', (target: Element) => h(XhDialogRoot, { open: true }, () => h(XhDialogContent, { container: target }))],
    ['command', (target: Element) => h(XhCommandRoot, { open: true }, () => h(XhCommandContent, { container: target }))],
    ['image-viewer', (target: Element) => h(XhImageViewerRoot, { open: true }, () => h(XhImageViewerContent, { container: target }))],
    ['floating-panel', (target: Element) => h(XhFloatingPanelRoot, { open: true }, () => h(XhFloatingPanelPositioner, { container: target }, () => h(XhFloatingPanelContent)))],
  ] as const)('%s 的部件实例目标优先于应用配置', async (scope, fixture) => {
    const { configured, instance } = await mount(fixture)
    const root = document.querySelector<HTMLElement>(`[data-scope="${scope}"][data-part="${scope === 'floating-panel' ? 'positioner' : 'content'}"]`)!
    expect(instance.contains(root)).toBe(true)
    expect(configured.contains(root)).toBe(false)
  })

  it('tour 根实例目标同时约束 backdrop、spotlight 与 positioner', async () => {
    const { configured, instance } = await mount(target => h(XhTourRoot, {
      open: true,
      container: target,
      steps: [{ id: 'intro', title: '介绍' }],
    }, () => [
      h(XhTourBackdrop),
      h(XhTourSpotlight),
      h(XhTourPositioner, null, () => h(XhTourContent)),
    ]))

    for (const part of ['backdrop', 'spotlight', 'positioner']) {
      const node = document.querySelector<HTMLElement>(`[data-scope="tour"][data-part="${part}"]`)!
      expect(instance.contains(node)).toBe(true)
      expect(configured.contains(node)).toBe(false)
    }
  })

  it('side-nav 折叠分支使用自己的实例目标', async () => {
    const { configured, instance } = await mount(target => h(XhSideNavRoot, {
      collapsed: true,
      collection: [{ value: 'docs', children: [{ value: 'guide' }] }],
    }, () => h(XhSideNavList, null, () => h(XhSideNavBranch, { value: 'docs' }, () => [
      h(XhSideNavBranchTrigger, null, () => '文档'),
      h(XhSideNavBranchContent, { container: target }),
    ]))))
    const positioner = document.querySelector<HTMLElement>('[data-scope="side-nav"][data-part="positioner"]')!
    expect(instance.contains(positioner)).toBe(true)
    expect(configured.contains(positioner)).toBe(false)
  })
})
