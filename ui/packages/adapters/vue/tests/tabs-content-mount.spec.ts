// @vitest-environment jsdom
import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import { h, nextTick } from 'vue'
import { XhTabsCloseTrigger, XhTabsContent, XhTabsList, XhTabsRoot, XhTabsTrigger } from '../src'

const VALUES = ['one', 'two', 'three'] as const

afterEach(() => {
  document.body.innerHTML = ''
})

function mountTabs(props: Record<string, unknown>) {
  return mount(XhTabsRoot, {
    props: { defaultValue: 'one', ...props },
    attachTo: document.body,
    slots: {
      default: () => [
        h(XhTabsList, null, () => VALUES.map(v => h(XhTabsTrigger, { key: v, value: v }, () => v))),
        ...VALUES.map(v => h(XhTabsContent, { key: v, value: v }, () => h('span', { 'data-testid': `panel-${v}` }, v))),
      ],
    },
  })
}

function rendered(wrapper: ReturnType<typeof mountTabs>): string[] {
  return VALUES.filter(v => wrapper.find(`[data-testid="panel-${v}"]`).exists())
}

describe('tabs 面板内容的挂载时机', () => {
  it('缺省三块面板内容都在', () => {
    const wrapper = mountTabs({})
    expect(rendered(wrapper)).toEqual(['one', 'two', 'three'])
    wrapper.unmount()
  })

  it('lazyMount：第一次选中才渲染，之后一直留着；面板节点本身常在', async () => {
    const wrapper = mountTabs({ lazyMount: true })
    expect(rendered(wrapper)).toEqual(['one'])
    expect(wrapper.findAll('[data-part="content"]')).toHaveLength(3)

    await wrapper.findAll('[data-part="trigger"]')[2]!.trigger('click')
    await nextTick()
    expect(rendered(wrapper)).toEqual(['one', 'three'])
    wrapper.unmount()
  })

  it('unmountOnExit + lazyMount：只有选中面板有内容', async () => {
    const wrapper = mountTabs({ lazyMount: true, unmountOnExit: true })
    await wrapper.findAll('[data-part="trigger"]')[1]!.trigger('click')
    await nextTick()
    expect(rendered(wrapper)).toEqual(['two'])
    wrapper.unmount()
  })
})

describe('tabs 关闭钮', () => {
  it('按 collection 铺开且可关闭时每个标签后面跟一枚关闭钮，点它发 tab-close', async () => {
    const wrapper = mount(XhTabsRoot, {
      props: { collection: VALUES.map(value => ({ value })), closable: true, defaultValue: 'one' },
      attachTo: document.body,
    })
    const list = wrapper.find('[data-part="list"]').element
    expect([...list.children].map(el => el.getAttribute('data-part'))).toEqual([
      'trigger',
      'close-trigger',
      'trigger',
      'close-trigger',
      'trigger',
      'close-trigger',
    ])
    await wrapper.findAll('[data-part="close-trigger"]')[0]!.trigger('click')
    expect(wrapper.emitted('tab-close')).toEqual([[{ value: 'one', values: ['two', 'three'] }]])
    wrapper.unmount()
  })

  it('手写的关闭钮在 closable 关闭时收起', () => {
    const wrapper = mount(XhTabsRoot, {
      attachTo: document.body,
      slots: {
        default: () => h(XhTabsList, null, () => [
          h(XhTabsTrigger, { value: 'one' }, () => 'one'),
          h(XhTabsCloseTrigger, { value: 'one' }),
        ]),
      },
    })
    expect(wrapper.find('[data-part="close-trigger"]').attributes('hidden')).toBeDefined()
    wrapper.unmount()
  })
})
