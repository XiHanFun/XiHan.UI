// @vitest-environment jsdom
import type { AccordionNode } from '@xihan-ui/headless'
import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import { defineComponent, h } from 'vue'
import {
  XhAccordionContent,
  XhAccordionHeader,
  XhAccordionIndicator,
  XhAccordionItem,
  XhAccordionRoot,
  XhAccordionTrigger,
} from '../src'

const COLLECTION: AccordionNode[] = [
  { value: 'install', label: '怎么安装', content: '装两个包，皮肤单独引一次。' },
  { value: 'theme', label: '怎么换皮肤', content: '覆写同名令牌即可。' },
  { value: 'legacy', label: '旧版迁移', content: '这一项展不开。', disabled: true },
]

afterEach(() => {
  document.body.innerHTML = ''
})

/** 只交数据，结构由组件铺开 */
function mountFromCollection(value: string[]) {
  return mount(defineComponent({
    setup: () => () => h(XhAccordionRoot, { value, collection: COLLECTION }),
  }), { attachTo: document.body })
}

/** 手写全套部件，条目只报 value，标题文本、正文与禁用交给 collection */
function mountFromParts(value: string[]) {
  return mount(defineComponent({
    setup: () => () => h(XhAccordionRoot, { value, collection: COLLECTION }, () => COLLECTION.map(node =>
      h(XhAccordionItem, { key: node.value, value: node.value }, () => [
        h(XhAccordionHeader, () => [
          h(XhAccordionTrigger, () => [h('span', null, node.label), h(XhAccordionIndicator)]),
        ]),
        h(XhAccordionContent, () => node.content),
      ]),
    )),
  }), { attachTo: document.body })
}

/** 部件树：只取身份与无障碍属性，忽略逐实例生成的 id 与它的引用 */
function skeleton(root: Element): string[] {
  return [...root.querySelectorAll('[data-scope="accordion"][data-part]')].map((el) => {
    const attrs = ['data-part', 'role', 'aria-level', 'aria-expanded', 'aria-disabled', 'data-state', 'data-disabled', 'hidden']
      .map(name => (el.hasAttribute(name) ? `${name}=${el.getAttribute(name)}` : null))
      .filter(Boolean)
    return `${attrs.join(' ')}|${el.textContent}`
  })
}

function partsOf(root: Element): (string | null)[] {
  return [...root.querySelectorAll('[data-scope="accordion"][data-part]')].map(el => el.getAttribute('data-part'))
}

describe('accordion 的 collection', () => {
  it('不写插槽时按数据铺开整套部件', () => {
    const w = mountFromCollection([])
    expect(partsOf(w.element)).toEqual([
      'item',
      'header',
      'trigger',
      'indicator',
      'content',
      'item',
      'header',
      'trigger',
      'indicator',
      'content',
      'item',
      'header',
      'trigger',
      'indicator',
      'content',
    ])
    w.unmount()
  })

  it('标题文本取自 label，缺省退回 value', () => {
    const w = mount(defineComponent({
      setup: () => () => h(XhAccordionRoot, {
        collection: [{ value: 'install', label: '怎么安装' }, { value: 'plain' }],
      }),
    }), { attachTo: document.body })
    const texts = [...w.element.querySelectorAll('[data-part="trigger"]')].map(el => el.textContent)
    expect(texts).toEqual(['怎么安装', 'plain'])
    w.unmount()
  })

  it('正文取自 content，写 content 插槽即由作者接管', () => {
    const auto = mountFromCollection(['install'])
    expect(auto.element.querySelector('[data-part="content"]')?.textContent).toBe('装两个包，皮肤单独引一次。')
    auto.unmount()

    const custom = mount(defineComponent({
      setup: () => () => h(XhAccordionRoot, { value: ['install'], collection: COLLECTION }, {
        content: (node: { value: string }) => [h('p', `正文：${node.value}`)],
      }),
    }), { attachTo: document.body })
    expect(custom.element.querySelector('[data-part="content"]')?.textContent).toBe('正文：install')
    custom.unmount()
  })

  it('数据里的禁用落成条目的 aria-disabled 与 data-disabled', () => {
    const w = mountFromCollection([])
    const flags = [...w.element.querySelectorAll('[data-part="trigger"]')].map(el => el.getAttribute('aria-disabled'))
    expect(flags).toEqual(['false', 'false', 'true'])
    const marks = [...w.element.querySelectorAll('[data-part="item"]')].map(el => el.hasAttribute('data-disabled'))
    expect(marks).toEqual([false, false, true])
    w.unmount()
  })

  it('铺开的结构与手写全套部件完全一致', () => {
    const auto = mountFromCollection(['install'])
    const manual = mountFromParts(['install'])
    expect(skeleton(auto.element)).toEqual(skeleton(manual.element))
    auto.unmount()
    manual.unmount()
  })

  it('条目上写的 disabled 压过数据里的', () => {
    const w = mount(defineComponent({
      setup: () => () => h(XhAccordionRoot, { collection: COLLECTION }, () => [
        // 数据里 legacy 是禁用的，这里逐条改口
        h(XhAccordionItem, { value: 'legacy', disabled: false }, () => [
          h(XhAccordionHeader, () => [h(XhAccordionTrigger, () => '旧版迁移')]),
        ]),
        // 数据里 install 不禁用，这里逐条禁掉
        h(XhAccordionItem, { value: 'install', disabled: true }, () => [
          h(XhAccordionHeader, () => [h(XhAccordionTrigger, () => '怎么安装')]),
        ]),
      ]),
    }), { attachTo: document.body })
    const flags = [...w.element.querySelectorAll('[data-part="trigger"]')].map(el => el.getAttribute('aria-disabled'))
    expect(flags).toEqual(['false', 'true'])
    w.unmount()
  })

  it('不给 collection 就照旧：根下只有作者自己写的部件', () => {
    const bare = mount(defineComponent({
      setup: () => () => h(XhAccordionRoot),
    }), { attachTo: document.body })
    expect(partsOf(bare.element)).toEqual([])
    bare.unmount()

    const w = mount(defineComponent({
      setup: () => () => h(XhAccordionRoot, { value: ['one'] }, () => [
        h(XhAccordionItem, { value: 'one' }, () => [
          h(XhAccordionHeader, () => [h(XhAccordionTrigger, () => '标题')]),
          h(XhAccordionContent, () => '正文'),
        ]),
      ]),
    }), { attachTo: document.body })
    expect(partsOf(w.element)).toEqual(['item', 'header', 'trigger', 'content'])
    expect(w.element.querySelector('[data-part="trigger"]')?.getAttribute('aria-disabled')).toBe('false')
    w.unmount()
  })
})
