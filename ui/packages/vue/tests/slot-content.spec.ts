// @vitest-environment jsdom
// 「插槽里有没有内容」是四个组件共用的判据：有内容才用作者的，没有才走默认字形 / 按数据铺开 / 不挖空。
// 这里盯的是判错的那一档——`v-if` 为假时假分支留下的注释节点占着数组的位置，只看长度就会当成有内容。
import type { IconRecord } from '@xihan-ui/core'
import type { NavigationMenuNode, TabsNode } from '@xihan-ui/headless'
import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createCommentVNode, createTextVNode, defineComponent, Fragment, h } from 'vue'
import { XhIcon, XhNavigationMenuRoot, XhQrCode, XhQrCodeLogo, XhTabsRoot } from '../src'
import { slotPaints } from '../src/runtime/slot-content'

const CHECK: IconRecord = {
  name: 'check',
  viewBox: '0 0 24 24',
  nodes: [{ tag: 'path', attrs: { d: 'M20 6 9 17l-5-5' } }],
}

const MENU: NavigationMenuNode[] = [
  { value: 'docs', label: '文档' },
  { value: 'about', label: '关于' },
]

const TABS: TabsNode[] = [
  { value: 'overview', label: '概览' },
  { value: 'usage', label: '用法' },
]

/** 作者自己画的那一笔，与记录里的图元用不同的 d，好分清渲染的是哪一份 */
const AUTHORED_PATH = 'M0 0h24'

beforeEach(() => {
  // jsdom 无 matchMedia，桩掉供 RuntimeConfig.reducedMotion 使用
  vi.stubGlobal('matchMedia', (q: string) => ({ matches: false, media: q, addEventListener: () => {}, removeEventListener: () => {} }))
})

afterEach(() => {
  document.body.innerHTML = ''
  vi.unstubAllGlobals()
})

/**
 * 用真模板挂载，插槽内容交给编译器编。
 * `show` 为假时编译器在假分支留下的注释节点，就是这一组用例要喂进去的输入。
 */
function mountTemplate(template: string, show: boolean) {
  return mount(defineComponent({
    components: { XhIcon, XhNavigationMenuRoot, XhQrCode, XhQrCodeLogo, XhTabsRoot },
    setup: () => ({ show, icon: CHECK, menu: MENU, tabs: TABS, authoredPath: AUTHORED_PATH }),
    template,
  }), { attachTo: document.body })
}

/** 用渲染函数挂载，插槽产出逐字给定 */
function mountSlot(component: unknown, props: Record<string, unknown>, slot: () => unknown) {
  return mount(defineComponent({
    setup: () => () => h(component as never, props, { default: slot as never }),
  }), { attachTo: document.body })
}

describe('slotPaints 逐类节点', () => {
  it('没有插槽、空产出都算没内容', () => {
    expect(slotPaints(undefined)).toBe(false)
    expect(slotPaints([])).toBe(false)
  })

  it('注释节点不算内容', () => {
    expect(slotPaints([createCommentVNode('v-if', true)])).toBe(false)
  })

  it('纯空白文本不算内容，非空文本算', () => {
    expect(slotPaints([createTextVNode('  \n\t')])).toBe(false)
    expect(slotPaints([createTextVNode('文档')])).toBe(true)
  })

  it('片段递归到底：只装注释的片段不算，装了元素的算', () => {
    expect(slotPaints([h(Fragment, null, [createCommentVNode('v-if', true), createTextVNode(' ')])])).toBe(false)
    expect(slotPaints([h(Fragment, null, [h(Fragment, null, [h('path')])])])).toBe(true)
  })

  it('元素节点算内容', () => {
    expect(slotPaints([h('path', { d: AUTHORED_PATH })])).toBe(true)
  })
})

describe('xhIcon 的默认插槽', () => {
  const TEMPLATE = `<XhIcon :icon="icon"><path v-if="show" :d="authoredPath" /></XhIcon>`

  /** 记录里的图元有没有画出来：画出来说明走的是默认字形 */
  function glyphPath(root: Element): string | null {
    return root.querySelector('[data-part="glyph"] path')?.getAttribute('d') ?? null
  }

  it('v-if 为假留下的注释节点不算作者接管，默认字形照旧画出来', () => {
    const w = mountTemplate(TEMPLATE, false)
    expect(glyphPath(w.element)).toBe('M20 6 9 17l-5-5')
    expect(w.element.querySelector(`path[d="${AUTHORED_PATH}"]`)).toBeNull()
    w.unmount()
  })

  it('纯空白文本不算作者接管，默认字形照旧画出来', () => {
    const w = mountSlot(XhIcon, { icon: CHECK }, () => ['\n  '])
    expect(glyphPath(w.element)).toBe('M20 6 9 17l-5-5')
    w.unmount()
  })

  it('插槽里有真图元才由作者接管，元素不再生成 glyph', () => {
    const w = mountTemplate(TEMPLATE, true)
    expect(w.element.querySelector('[data-part="glyph"]')).toBeNull()
    expect(w.element.querySelector('path')!.getAttribute('d')).toBe(AUTHORED_PATH)
    w.unmount()
  })
})

describe('navigation-menu 的默认插槽', () => {
  const TEMPLATE = `<XhNavigationMenuRoot :collection="menu"><span v-if="show" data-authored>自己写的</span></XhNavigationMenuRoot>`

  function triggerTexts(root: Element): Array<string | null> {
    return [...root.querySelectorAll('[data-part="trigger"]')].map(el => el.textContent)
  }

  it('v-if 为假留下的注释节点不算写了插槽，collection 照旧铺开', () => {
    const w = mountTemplate(TEMPLATE, false)
    expect(triggerTexts(w.element)).toEqual(['文档', '关于'])
    w.unmount()
  })

  it('纯空白文本不算写了插槽，collection 照旧铺开', () => {
    const w = mountSlot(XhNavigationMenuRoot, { collection: MENU }, () => ['\n  '])
    expect(triggerTexts(w.element)).toEqual(['文档', '关于'])
    w.unmount()
  })

  it('插槽里有真节点才交给作者，不再按数据铺开', () => {
    const w = mountTemplate(TEMPLATE, true)
    expect(triggerTexts(w.element)).toEqual([])
    expect(w.element.querySelector('[data-authored]')!.textContent).toBe('自己写的')
    w.unmount()
  })
})

describe('tabs 的默认插槽', () => {
  const TEMPLATE = `<XhTabsRoot :collection="tabs" default-value="overview"><span v-if="show" data-authored>自己写的</span></XhTabsRoot>`

  function triggerTexts(root: Element): Array<string | null> {
    return [...root.querySelectorAll('[data-part="trigger"]')].map(el => el.textContent)
  }

  it('v-if 为假留下的注释节点不算写了插槽，collection 照旧铺开', () => {
    const w = mountTemplate(TEMPLATE, false)
    expect(triggerTexts(w.element)).toEqual(['概览', '用法'])
    w.unmount()
  })

  it('纯空白文本不算写了插槽，collection 照旧铺开', () => {
    const w = mountSlot(XhTabsRoot, { collection: TABS, defaultValue: 'overview' }, () => ['\n  '])
    expect(triggerTexts(w.element)).toEqual(['概览', '用法'])
    w.unmount()
  })

  it('插槽里有真节点才交给作者，不再按数据铺开', () => {
    const w = mountTemplate(TEMPLATE, true)
    expect(triggerTexts(w.element)).toEqual([])
    expect(w.element.querySelector('[data-authored]')!.textContent).toBe('自己写的')
    w.unmount()
  })
})

describe('xhQrCode 的 logo 插槽', () => {
  const TEMPLATE = `<XhQrCode value="https://ui.xihanfun.com" level="H"><XhQrCodeLogo v-if="show"><rect /></XhQrCodeLogo></XhQrCode>`

  function dug(root: Element): boolean {
    return root.querySelector('[data-xh-geom="logo-clear"]') != null
  }

  it('v-if 为假留下的注释节点不算放了 logo，一格都不挖', () => {
    const w = mountTemplate(TEMPLATE, false)
    expect(dug(w.element)).toBe(false)
    expect(w.element.getAttribute('data-logo')).toBeNull()
    w.unmount()
  })

  it('纯空白文本不算放了 logo，一格都不挖', () => {
    const w = mountSlot(XhQrCode, { value: 'https://ui.xihanfun.com', level: 'H' }, () => ['\n  '])
    expect(dug(w.element)).toBe(false)
    expect(w.element.getAttribute('data-logo')).toBeNull()
    w.unmount()
  })

  it('真放了 logo 才挖空', () => {
    const w = mountTemplate(TEMPLATE, true)
    expect(dug(w.element)).toBe(true)
    expect(w.element.getAttribute('data-logo')).toBe('')
    w.unmount()
  })
})
