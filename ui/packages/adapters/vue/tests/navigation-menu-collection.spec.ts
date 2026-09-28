// @vitest-environment jsdom
import type { NavigationMenuNode, NavigationMenuNodeMeta } from '@xihan-ui/headless'
import type { VNode } from 'vue'
import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import { defineComponent, h, nextTick } from 'vue'
import {
  XhNavigationMenuBranchContent,
  XhNavigationMenuBranchIndicator,
  XhNavigationMenuBranchTrigger,
  XhNavigationMenuContent,
  XhNavigationMenuIndicator,
  XhNavigationMenuItem,
  XhNavigationMenuLink,
  XhNavigationMenuList,
  XhNavigationMenuRoot,
  XhNavigationMenuTrigger,
} from '../src'

const COLLECTION: NavigationMenuNode[] = [
  { value: 'products', label: '产品' },
  { value: 'docs', label: '文档' },
  { value: 'about', label: '关于', disabled: true },
  // 没有下级的去处：铺成一条直达链接，不带面板
  { value: 'changelog', label: '更新日志', href: '#/changelog', current: true },
]

const PANELS: Record<string, Array<{ href: string, label: string }>> = {
  products: [{ href: '#/products/runtime', label: '运行时内核' }],
  docs: [{ href: '#/docs/guide', label: '上手指南' }, { href: '#/docs/anatomy', label: '部件解剖' }],
  about: [{ href: '#/about/team', label: '团队' }],
}

/** 面板内容：两棵树共用同一份，比对时才只剩结构差异 */
function panelLinks(node: NavigationMenuNodeMeta): VNode[] {
  return (PANELS[node.value] ?? []).map(l =>
    h(XhNavigationMenuLink, { key: l.href, href: l.href }, () => l.label),
  )
}

afterEach(() => {
  document.body.innerHTML = ''
})

/** 只交数据，结构由组件铺开 */
function mountFromCollection(defaultValue?: string, withPanel = true) {
  return mount(defineComponent({
    setup: () => () => (withPanel
      ? h(
          XhNavigationMenuRoot,
          { collection: COLLECTION, defaultValue },
          { panel: (node: NavigationMenuNodeMeta) => panelLinks(node) },
        )
      : h(XhNavigationMenuRoot, { collection: COLLECTION, defaultValue })),
  }), { attachTo: document.body })
}

/** 手写全套部件，trigger 只报 value，入口文本与禁用交给 collection */
function mountFromParts(defaultValue?: string) {
  return mount(defineComponent({
    setup: () => () => h(XhNavigationMenuRoot, { collection: COLLECTION, defaultValue }, () => [
      h(XhNavigationMenuList, () => [
        ...COLLECTION.map(node => h(XhNavigationMenuItem, { key: node.value }, () => (
          node.href != null
            ? [h(XhNavigationMenuLink, { href: node.href, current: node.current }, () => node.label)]
            : [
                h(XhNavigationMenuTrigger, { value: node.value }, () => node.label),
                h(XhNavigationMenuContent, { value: node.value }, () => panelLinks({
                  value: node.value,
                  label: node.label ?? node.value,
                  disabled: !!node.disabled,
                  current: !!node.current,
                  children: [],
                })),
              ]
        ))),
        h(XhNavigationMenuIndicator),
      ]),
    ]),
  }), { attachTo: document.body })
}

/** 挂载点自己就是 root 部件，querySelectorAll 不含它，这里补回来 */
const PART_SELECTOR = '[data-scope="navigation-menu"][data-part]'
function partElements(root: Element): Element[] {
  const descendants = [...root.querySelectorAll(PART_SELECTOR)]
  return root.matches(PART_SELECTOR) ? [root, ...descendants] : descendants
}

/** 部件树：只取身份与无障碍属性，忽略生成的 id 与量出来的坐标 */
function skeleton(root: Element): string[] {
  return partElements(root).map((el) => {
    const attrs = [
      'data-part',
      'data-value',
      'role',
      'aria-expanded',
      'aria-disabled',
      'aria-current',
      'aria-hidden',
      'data-state',
      'data-disabled',
      'data-current',
      'data-orientation',
      'href',
      'hidden',
    ]
      .map(name => (el.hasAttribute(name) ? `${name}=${el.getAttribute(name)}` : null))
      .filter(Boolean)
    return `${attrs.join(' ')}|${el.textContent}`
  })
}

function partsOf(root: Element): Array<string | null> {
  return partElements(root).map(el => el.getAttribute('data-part'))
}

describe('navigation-menu 的 collection', () => {
  it('不写插槽时按数据铺开整套部件', () => {
    const w = mountFromCollection(undefined, false)
    expect(partsOf(w.element)).toEqual([
      'root',
      'list',
      'item',
      'trigger',
      'content',
      'item',
      'trigger',
      'content',
      'item',
      'trigger',
      'content',
      // 带 href 的那一项没有 trigger 也没有面板
      'item',
      'link',
      'indicator',
    ])
    w.unmount()
  })

  it('入口文本取自 label，缺省退回 value', () => {
    const w = mount(defineComponent({
      setup: () => () => h(XhNavigationMenuRoot, {
        collection: [{ value: 'docs', label: '文档' }, { value: 'plain' }],
      }),
    }), { attachTo: document.body })
    const texts = [...w.element.querySelectorAll('[data-part="trigger"]')].map(el => el.textContent)
    expect(texts).toEqual(['文档', 'plain'])
    w.unmount()
  })

  it('数据里的禁用落成入口的 aria-disabled', () => {
    const w = mountFromCollection()
    const flags = [...w.element.querySelectorAll('[data-part="trigger"]')]
      .map(el => el.getAttribute('aria-disabled'))
    expect(flags).toEqual(['false', 'false', 'true'])
    w.unmount()
  })

  it('带 href 的入口铺成 link，current 落成 aria-current', () => {
    const w = mountFromCollection()
    const links = [...w.element.querySelectorAll('[data-part="item"] > [data-part="link"]')]
    expect(links.map(el => el.getAttribute('href'))).toEqual(['#/changelog'])
    expect(links.map(el => el.getAttribute('aria-current'))).toEqual(['page'])
    expect(links.map(el => el.textContent)).toEqual(['更新日志'])
    w.unmount()
  })

  it('铺开的结构与手写全套部件完全一致', () => {
    const auto = mountFromCollection('docs')
    const manual = mountFromParts('docs')
    expect(skeleton(auto.element)).toEqual(skeleton(manual.element))
    auto.unmount()
    manual.unmount()
  })

  it('入口上写的 disabled 压过数据里的', () => {
    const w = mount(defineComponent({
      setup: () => () => h(XhNavigationMenuRoot, { collection: COLLECTION }, () => [
        h(XhNavigationMenuList, () => [
          // 数据里 about 是禁用的，这里逐条改口
          h(XhNavigationMenuItem, () => [h(XhNavigationMenuTrigger, { value: 'about', disabled: false }, () => '关于')]),
          // 数据里 docs 不禁用，这里逐条禁掉
          h(XhNavigationMenuItem, () => [h(XhNavigationMenuTrigger, { value: 'docs', disabled: true }, () => '文档')]),
        ]),
      ]),
    }), { attachTo: document.body })
    const flags = [...w.element.querySelectorAll('[data-part="trigger"]')]
      .map(el => el.getAttribute('aria-disabled'))
    expect(flags).toEqual(['false', 'true'])
    w.unmount()
  })

  it('不给 collection 时手写部件照旧，禁用只认部件上写的', () => {
    const w = mount(defineComponent({
      setup: () => () => h(XhNavigationMenuRoot, null, () => [
        h(XhNavigationMenuList, () => [
          h(XhNavigationMenuItem, () => [h(XhNavigationMenuTrigger, { value: 'docs' }, () => '文档')]),
          h(XhNavigationMenuItem, () => [h(XhNavigationMenuTrigger, { value: 'about', disabled: true }, () => '关于')]),
        ]),
      ]),
    }), { attachTo: document.body })
    const triggers = [...w.element.querySelectorAll('[data-part="trigger"]')]
    expect(triggers.map(el => el.getAttribute('aria-disabled'))).toEqual(['false', 'true'])
    expect(triggers.map(el => el.textContent)).toEqual(['文档', '关于'])
    w.unmount()
  })
})

describe('navigation-menu 的 collection 子级', () => {
  const NESTED: NavigationMenuNode[] = [
    {
      value: 'products',
      label: '产品',
      children: [
        { value: 'overview', label: '概览', href: '#/products' },
        {
          value: 'frameworks',
          label: '框架',
          children: [
            { value: 'vue', label: 'Vue', href: '#/vue' },
            { value: 'react', label: 'React', href: '#/react', current: true },
          ],
        },
        { value: 'tools', label: '工具', disabled: true, children: [{ value: 'cli', label: 'CLI', href: '#/cli' }] },
      ],
    },
    { value: 'changelog', label: '更新日志', href: '#/changelog' },
  ]

  /** 手写全套部件：面板条目带 children 的写成开关 + 箭头 + 子级容器，其余写成链接 */
  function mountNestedParts(defaultValue?: string) {
    return mount(defineComponent({
      setup: () => () => h(XhNavigationMenuRoot, { collection: NESTED, defaultValue }, () => [
        h(XhNavigationMenuList, () => [
          h(XhNavigationMenuItem, { key: 'products' }, () => [
            h(XhNavigationMenuTrigger, { value: 'products' }, () => '产品'),
            h(XhNavigationMenuContent, { value: 'products' }, () => [
              h(XhNavigationMenuLink, { href: '#/products' }, () => '概览'),
              h(XhNavigationMenuBranchTrigger, { value: 'frameworks' }, () => ['框架', h(XhNavigationMenuBranchIndicator, { value: 'frameworks' })]),
              h(XhNavigationMenuBranchContent, { value: 'frameworks' }, () => [
                h(XhNavigationMenuLink, { href: '#/vue' }, () => 'Vue'),
                h(XhNavigationMenuLink, { href: '#/react', current: true }, () => 'React'),
              ]),
              h(XhNavigationMenuBranchTrigger, { value: 'tools' }, () => ['工具', h(XhNavigationMenuBranchIndicator, { value: 'tools' })]),
              h(XhNavigationMenuBranchContent, { value: 'tools' }, () => [
                h(XhNavigationMenuLink, { href: '#/cli' }, () => 'CLI'),
              ]),
            ]),
          ]),
          h(XhNavigationMenuItem, { key: 'changelog' }, () => [
            h(XhNavigationMenuLink, { href: '#/changelog' }, () => '更新日志'),
          ]),
          h(XhNavigationMenuIndicator),
        ]),
      ]),
    }), { attachTo: document.body })
  }

  it('不写插槽时面板按 children 铺开：带 href 的铺为链接，带 children 的铺为一枝子级', () => {
    const w = mount(defineComponent({
      setup: () => () => h(XhNavigationMenuRoot, { collection: NESTED }),
    }), { attachTo: document.body })
    const content = w.element.querySelector('[data-part="content"]')!
    expect(partsOf(content)).toEqual([
      'content',
      'link',
      'branch-trigger',
      'branch-indicator',
      'branch-content',
      'link',
      'link',
      'branch-trigger',
      'branch-indicator',
      'branch-content',
      'link',
    ])
    const branchTriggers = [...content.querySelectorAll('[data-part="branch-trigger"]')]
    expect(branchTriggers.map(el => el.textContent)).toEqual(['框架', '工具'])
    // 数据里的禁用落到子级开关上
    expect(branchTriggers.map(el => el.getAttribute('aria-disabled'))).toEqual(['false', 'true'])
    const current = content.querySelector('[aria-current="page"]')
    expect(current?.getAttribute('href')).toBe('#/react')
    w.unmount()
  })

  it('给了 panel 插槽就由插槽提供面板内容，children 不再铺', () => {
    const w = mount(defineComponent({
      setup: () => () => h(XhNavigationMenuRoot, { collection: NESTED }, {
        panel: (node: NavigationMenuNodeMeta) => [h(XhNavigationMenuLink, { href: `#/${node.value}` }, () => `${node.label}（${node.children.length}）`)],
      }),
    }), { attachTo: document.body })
    const content = w.element.querySelector('[data-part="content"]')!
    expect(partsOf(content)).toEqual(['content', 'link'])
    expect(content.textContent).toBe('产品（3）')
    w.unmount()
  })

  it('铺开的结构与手写全套部件完全一致，挂载即展开时当前页所在的那一枝同样展开', async () => {
    const auto = mount(defineComponent({
      setup: () => () => h(XhNavigationMenuRoot, { collection: NESTED, defaultValue: 'products' }),
    }), { attachTo: document.body })
    const manual = mountNestedParts('products')
    await nextTick()
    await nextTick()
    expect(skeleton(auto.element)).toEqual(skeleton(manual.element))
    const frameworks = auto.element.querySelector('[data-part="branch-content"]')!
    expect(frameworks.hasAttribute('hidden')).toBe(false)
    auto.unmount()
    manual.unmount()
  })
})
