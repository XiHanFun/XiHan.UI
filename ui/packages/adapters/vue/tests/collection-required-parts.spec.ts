// @vitest-environment jsdom
import { mount } from '@vue/test-utils'
import {
  accordionMeta,
  checkboxGroupMeta,
  comboboxMeta,
  contextMenuMeta,
  listboxMeta,
  mentionMeta,
  menubarMeta,
  menuMeta,
  navigationMenuMeta,
  popselectMeta,
  radioGroupMeta,
  selectMeta,
  tabsMeta,
  toggleGroupMeta,
} from '@xihan-ui/headless'
import { afterEach, describe, expect, it } from 'vitest'
import { defineComponent, h } from 'vue'
import {
  XhAccordionRoot,
  XhCheckboxGroupRoot,
  XhComboboxRoot,
  XhContextMenuRoot,
  XhListboxRoot,
  XhMentionRoot,
  XhMenubarRoot,
  XhMenuRoot,
  XhNavigationMenuRoot,
  XhPopselectContent,
  XhPopselectPositioner,
  XhPopselectRoot,
  XhPopselectTrigger,
  XhRadioGroupRoot,
  XhSelectRoot,
  XhTabsRoot,
  XhToggleGroupRoot,
} from '../src'

const NODES = [
  { value: 'a', label: '甲', content: '甲的正文' },
  { value: 'b', label: '乙', content: '乙的正文' },
]

/** menubar 的条目挂在顶层节点的 items 上，只在顶层读。 */
const MENUBAR_NODES = [
  { value: 'a', label: '甲', items: [{ value: 'a1', label: '甲一' }] },
  { value: 'b', label: '乙', items: [{ value: 'b1', label: '乙一' }] },
]

/** navigation-menu 的节点给了 href 才是一条链接，否则是带面板的入口。 */
const NAV_NODES = [
  { value: 'a', label: '甲', href: '/a' },
  { value: 'b', label: '乙', href: '/b' },
]

/**
 * 只交 collection、不写任何部件时，铺开的结构必须凑齐该组件的必备部件。
 * 少一个就是渲染出一个看着正常、其实不工作的组件——浮层打不开、方向键找不到条目、读屏报缺件。
 */
const CASES: { name: string, root: unknown, requiredParts: readonly string[], props: Record<string, unknown> }[] = [
  { name: 'accordion', root: XhAccordionRoot, requiredParts: accordionMeta.requiredParts, props: { collection: NODES, defaultValue: ['a'] } },
  { name: 'checkbox-group', root: XhCheckboxGroupRoot, requiredParts: checkboxGroupMeta.requiredParts, props: { collection: NODES } },
  { name: 'combobox', root: XhComboboxRoot, requiredParts: comboboxMeta.requiredParts, props: { collection: NODES, defaultOpen: true } },
  { name: 'context-menu', root: XhContextMenuRoot, requiredParts: contextMenuMeta.requiredParts, props: { collection: NODES, defaultOpen: true } },
  { name: 'listbox', root: XhListboxRoot, requiredParts: listboxMeta.requiredParts, props: { collection: NODES } },
  { name: 'menu', root: XhMenuRoot, requiredParts: menuMeta.requiredParts, props: { collection: NODES, defaultOpen: true } },
  { name: 'menubar', root: XhMenubarRoot, requiredParts: menubarMeta.requiredParts, props: { collection: MENUBAR_NODES, defaultValue: 'a' } },
  { name: 'navigation-menu', root: XhNavigationMenuRoot, requiredParts: navigationMenuMeta.requiredParts, props: { collection: NAV_NODES, defaultValue: 'a' } },
  { name: 'radio-group', root: XhRadioGroupRoot, requiredParts: radioGroupMeta.requiredParts, props: { collection: NODES } },
  { name: 'select', root: XhSelectRoot, requiredParts: selectMeta.requiredParts, props: { collection: NODES, defaultOpen: true } },
  { name: 'tabs', root: XhTabsRoot, requiredParts: tabsMeta.requiredParts, props: { collection: NODES, defaultValue: 'a' } },
  { name: 'toggle-group', root: XhToggleGroupRoot, requiredParts: toggleGroupMeta.requiredParts, props: { collection: NODES } },
]

afterEach(() => {
  document.body.innerHTML = ''
})

describe('collection 铺开的结构凑齐必备部件', () => {
  for (const item of CASES) {
    it(item.name, () => {
      const wrapper = mount(defineComponent({
        setup: () => () => h(item.root as never, item.props),
      }), { attachTo: document.body })

      // 浮层内容被 portal 到 body，所以从整篇文档里找
      const rendered = new Set(
        [...document.querySelectorAll('[data-part]')].map(el => el.getAttribute('data-part')),
      )
      const missing = item.requiredParts.filter(part => !rendered.has(part))
      expect(missing, `${item.name} 铺开后缺部件：${missing.join(' / ')}`).toEqual([])

      wrapper.unmount()
    })
  }
})

describe('打字才开的那个', () => {
  /** mention 的候选浮层没有 defaultOpen，敲下前缀字符才出，所以单独钉一条。 */
  it('mention 敲 @ 之后铺开候选，必备部件齐', async () => {
    const wrapper = mount(defineComponent({
      setup: () => () => h(XhMentionRoot, { collection: NODES }),
    }), { attachTo: document.body })

    const input = document.querySelector('[data-part="input"]') as HTMLInputElement | null
    expect(input, 'mention 铺开后没有 input 部件').not.toBeNull()
    input!.value = '@'
    input!.dispatchEvent(new Event('input', { bubbles: true }))
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()

    const rendered = new Set(
      [...document.querySelectorAll('[data-part]')].map(el => el.getAttribute('data-part')),
    )
    const missing = mentionMeta.requiredParts.filter(part => !rendered.has(part))
    expect(missing, `mention 铺开后缺部件：${missing.join(' / ')}`).toEqual([])
    wrapper.unmount()
  })
})

describe('内容级铺开', () => {
  /**
   * popselect 的铺开落在 content 部件里而不是根上：只写 `<XhPopselectRoot :collection>` 什么都不出，
   * 浮层外壳仍要作者自己写。这一条钉住这个差别，改成根级铺开时它会红。
   */
  it('popselect 的根不铺开，content 才按 collection 铺条目', () => {
    const rootOnly = mount(defineComponent({
      setup: () => () => h(XhPopselectRoot, { collection: NODES, defaultOpen: true }),
    }), { attachTo: document.body })
    expect(document.querySelectorAll('[data-part="item"]')).toHaveLength(0)
    rootOnly.unmount()
    document.body.innerHTML = ''

    const withShell = mount(defineComponent({
      setup: () => () => h(XhPopselectRoot, { collection: NODES, defaultOpen: true }, () => [
        h(XhPopselectTrigger, () => '打开'),
        h(XhPopselectPositioner, () => [h(XhPopselectContent)]),
      ]),
    }), { attachTo: document.body })

    const rendered = new Set(
      [...document.querySelectorAll('[data-part]')].map(el => el.getAttribute('data-part')),
    )
    const missing = popselectMeta.requiredParts.filter(part => !rendered.has(part))
    expect(missing, `popselect 写了外壳仍缺部件：${missing.join(' / ')}`).toEqual([])
    withShell.unmount()
  })
})
