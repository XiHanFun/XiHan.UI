// @vitest-environment jsdom
import type { Ref } from 'vue'
import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import { defineComponent, h, nextTick, ref } from 'vue'
import { XhTabsContent, XhTabsList, XhTabsRoot, XhTabsTrigger } from '../src'

afterEach(() => {
  document.body.innerHTML = ''
})

interface Mounted {
  /** 改这个数组即增删条目，走的是组件真实的挂载/卸载。 */
  values: Ref<string[]>
  unmount: () => void
}

function mountTabs(initial: readonly string[]): Mounted {
  const values = ref<string[]>([...initial])
  const harness = defineComponent({
    setup: () => () => h(XhTabsRoot, { defaultValue: initial[0]! }, {
      default: () => [
        h(XhTabsList, null, {
          // 逐条带 key：无 key 的就地复用会把"卸载的是哪一个"改写成末位条目
          default: () => values.value.map(v => h(XhTabsTrigger, { key: v, value: v }, { default: () => v })),
        }),
        ...values.value.map(v => h(XhTabsContent, { key: v, value: v }, { default: () => v })),
      ],
    }),
  })
  const wrapper = mount(harness, { attachTo: document.body })
  return { values, unmount: () => wrapper.unmount() }
}

function list(): HTMLElement {
  return document.body.querySelector<HTMLElement>('[role="tablist"]')!
}

function triggers(): HTMLElement[] {
  return [...document.body.querySelectorAll<HTMLElement>('[role="tab"]')]
}

function trigger(value: string): HTMLElement {
  return document.body.querySelector<HTMLElement>(`[role="tab"][data-value="${value}"]`)!
}

/**
 * 整组对键盘用户的入口：容器与条目里 tabindex=0 的那些。
 * 容器是焦点在组外时的兜底入口，条目里只有 roving 锚点那个留在 Tab 序列内；
 * 两者同时是 -1 就意味着这组再也 Tab 不进来了。
 */
function tabStops(): HTMLElement[] {
  return [list(), ...triggers()].filter(node => node.getAttribute('tabindex') === '0')
}

// 可关闭的 tab 会把"当前有焦点的那个条目"直接卸载掉。
// 浏览器此时不派 focusout，机器收不到焦点离场，焦点锚点会停在一个已消失的值上。
describe('xhTabs 焦点条目卸载', () => {
  it('卸载持有焦点的条目后，整组仍有 Tab 入口', async () => {
    const { values, unmount } = mountTabs(['one', 'two', 'three'])

    trigger('two').focus()
    await nextTick()
    // 焦点已在组内：容器让位，停靠点归焦点条目
    expect(tabStops().map(n => n.getAttribute('data-value'))).toEqual(['two'])

    values.value = values.value.filter(v => v !== 'two')
    await nextTick()
    await nextTick()

    expect(triggers()).toHaveLength(2)
    // 锚点若还停在已消失的 'two' 上，容器与条目会同时是 -1，整组零停靠点
    expect(tabStops().length).toBeGreaterThan(0)
    expect(list().getAttribute('tabindex')).toBe('0')
    expect(trigger('one').getAttribute('tabindex')).toBe('0')

    unmount()
  })

  it('卸载的不是焦点条目时，光标原地不动', async () => {
    const { values, unmount } = mountTabs(['one', 'two', 'three'])

    trigger('two').focus()
    await nextTick()

    values.value = values.value.filter(v => v !== 'three')
    await nextTick()
    await nextTick()

    // 光标仍在 'two'：停靠点没被清掉，方向键的起点也就还在
    expect(triggers()).toHaveLength(2)
    expect(tabStops().map(n => n.getAttribute('data-value'))).toEqual(['two'])
    expect(list().getAttribute('tabindex')).toBe('-1')
    expect(document.activeElement).toBe(trigger('two'))

    unmount()
  })
})
