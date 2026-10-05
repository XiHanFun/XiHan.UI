// @vitest-environment jsdom
// 菜单栏、侧栏弹出面板与名称提示、引用悬停卡：关着时 Portal 壳不建视觉桥，展开时建、收起后撤。
// 这几个部件的定位层随组件常驻（菜单栏每项一个、折叠侧栏每个分支一个、正文每处引用一个），
// 关着也各建一台桥就是在来源祖先链上各挂一套观察。

import type { App, VNode } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createApp, h, nextTick, ref } from 'vue'
import {
  XhCitationPositioner,
  XhCitationPreview,
  XhCitationRoot,
  XhCitationText,
  XhCitationTrigger,
  XhMenubarContent,
  XhMenubarPositioner,
  XhMenubarRoot,
  XhSideNavBranch,
  XhSideNavBranchContent,
  XhSideNavBranchText,
  XhSideNavBranchTrigger,
  XhSideNavItem,
  XhSideNavLink,
  XhSideNavLinkText,
  XhSideNavList,
  XhSideNavRoot,
  XhSideNavTooltip,
} from '../src'

let app: App | null = null

async function tick(): Promise<void> {
  await nextTick()
  await nextTick()
  await new Promise(r => setTimeout(r, 0))
  await nextTick()
}

/** 挂在一个 data-theme="dark" 的来源作用域里：建了桥的壳会带上这一轴。 */
async function mount(render: () => VNode): Promise<void> {
  const scope = document.createElement('section')
  scope.setAttribute('data-theme', 'dark')
  const host = document.createElement('div')
  scope.append(host)
  document.body.append(scope)
  app = createApp({ setup: () => render })
  app.mount(host)
  await tick()
}

function shellOf(node: Element | null): HTMLElement {
  const shell = node?.closest<HTMLElement>('[data-xh-portal-shell]')
  if (!shell)
    throw new Error('节点不在 Portal 实例壳里')
  return shell
}

/** 壳上带着来源的主题即已建桥。 */
const bridged = (node: Element | null): boolean => shellOf(node).getAttribute('data-theme') === 'dark'

afterEach(() => {
  app?.unmount()
  app = null
  document.body.innerHTML = ''
  document.getElementById('xh-portal-root')?.remove()
})

describe('常驻定位层的 Portal 关着时不建视觉桥', () => {
  it('菜单栏：哪项展开哪项的壳才桥接，收起后撤掉', async () => {
    const value = ref<string | null>(null)
    await mount(() => h(XhMenubarRoot, {
      'collection': [{ value: 'file', label: '文件' }, { value: 'edit', label: '编辑' }],
      'value': value.value,
      'onUpdate:value': (next: string | null) => { value.value = next },
    }, () => [
      h(XhMenubarPositioner, { value: 'file' }, () => h(XhMenubarContent)),
      h(XhMenubarPositioner, { value: 'edit' }, () => h(XhMenubarContent)),
    ]))
    const [file, edit] = document.querySelectorAll(`[data-scope='menubar'][data-part='positioner']`)
    expect(bridged(file!)).toBe(false)
    expect(bridged(edit!)).toBe(false)

    value.value = 'file'
    await tick()
    expect(bridged(file!)).toBe(true)
    expect(bridged(edit!)).toBe(false)

    value.value = null
    await tick()
    expect(bridged(file!)).toBe(false)
  })

  it('折叠侧栏：弹出面板展开才桥接；名称提示关着不建桥', async () => {
    const branch = (v: string): VNode => h(XhSideNavBranch, { value: v }, () => [
      h(XhSideNavBranchTrigger, () => [h(XhSideNavBranchText, () => v)]),
      h(XhSideNavBranchContent, null, () => [
        h(XhSideNavItem, () => [h(XhSideNavLink, { value: `${v}-leaf` }, () => [h(XhSideNavLinkText, () => `${v}-leaf`)])]),
      ]),
    ])
    await mount(() => h(XhSideNavRoot, {
      collection: [
        { value: 'docs', label: '文档', children: [{ value: 'docs-leaf', label: '指南' }] },
        { value: 'blog', label: '博客', children: [{ value: 'blog-leaf', label: '第一篇' }] },
      ],
      collapsed: true,
    }, () => [h(XhSideNavList, null, () => [branch('docs'), branch('blog')]), h(XhSideNavTooltip)]))
    const trigger = (v: string): HTMLElement => document.querySelector<HTMLElement>(`[data-scope='side-nav'][data-part='branch-trigger'][data-value='${v}']`)!
    const panelOf = (v: string): HTMLElement => document.getElementById(trigger(v).getAttribute('aria-controls')!)!
    expect(bridged(panelOf('docs'))).toBe(false)
    expect(bridged(panelOf('blog'))).toBe(false)
    expect(bridged(document.querySelector(`[data-scope='tooltip'][data-part='positioner']`))).toBe(false)

    trigger('docs').click()
    await tick()
    expect(panelOf('docs').hasAttribute('hidden')).toBe(false)
    expect(bridged(panelOf('docs'))).toBe(true)
    expect(bridged(panelOf('blog'))).toBe(false)
  })

  it('引用悬停卡：卡片露面才桥接，收起后撤掉', async () => {
    const open = ref(false)
    await mount(() => h(XhCitationRoot, {
      sources: [{ type: 'source-url', sourceId: 'report', title: '报告', url: 'https://example.com/report', anchors: [{ sourceId: 'report', quote: '引文' }] }],
      previewMode: 'hover',
      openDelay: 0,
      closeDelay: 0,
      open: open.value,
    }, () => [
      h(XhCitationText, null, () => ['正文', h(XhCitationTrigger, { sourceId: 'report', citationId: 'c1' }, () => '1')]),
      h(XhCitationPositioner, null, () => [h(XhCitationPreview, { sourceId: 'report' })]),
    ]))
    const positioner = document.querySelector<HTMLElement>(`[data-scope='citation'][data-part='positioner']`)!
    expect(positioner.hidden).toBe(true)
    expect(bridged(positioner)).toBe(false)

    document.querySelector<HTMLElement>(`[data-scope='citation'][data-part='trigger']`)!.click()
    open.value = true
    await tick()
    await vi.waitFor(() => expect(positioner.hidden).toBe(false))
    expect(bridged(positioner)).toBe(true)

    open.value = false
    await tick()
    await vi.waitFor(() => expect(positioner.hidden).toBe(true))
    expect(bridged(positioner)).toBe(false)
  })
})
