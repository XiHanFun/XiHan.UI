// @vitest-environment jsdom
//
// 消息条目被移出 DOM 时浏览器不派 focusout，焦点无声地掉到 body 上。
// 机器那一侧仍记着「焦点在某某条目上」：root 不再兜底进 Tab 序列，而那个锚点已经不存在，
// 于是整份消息流一个 Tab 停靠点都没有，键盘再也进不来。适配器要在卸载时如实上报这件事。
//
// 一致性套件核不到这一路：它的 fixture 是一份固定的条目表，不会在中途摘掉持有焦点的那一条。
import type { Ref } from 'vue'
import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import { defineComponent, h, nextTick, ref } from 'vue'
import { XhMessageFeedItem, XhMessageFeedList, XhMessageFeedRoot, XhMessageFeedViewport } from '../src'

afterEach(() => {
  document.body.innerHTML = ''
})

interface Mounted {
  /** 改这个数组即增删条目或改写条目身份。 */
  ids: Ref<string[]>
  unmount: () => void
}

function mountFeed(initial: readonly string[]): Mounted {
  const ids = ref<string[]>([...initial])
  const harness = defineComponent({
    setup: () => () => h(XhMessageFeedRoot, { count: ids.value.length }, {
      default: () => h(XhMessageFeedViewport, null, {
        default: () => h(XhMessageFeedList, null, {
          // key 取位次而不是 itemId：itemId 换掉时 Vue 复用同一个 DOM 节点，
          // 「节点还在、身份变了」这一路才演得出来
          default: () => ids.value.map((id, i) =>
            h(XhMessageFeedItem, { key: i, itemId: id, itemIndex: i }, { default: () => id }),
          ),
        }),
      }),
    }),
  })
  const wrapper = mount(harness, { attachTo: document.body })
  return { ids, unmount: () => wrapper.unmount() }
}

function part(name: string): HTMLElement {
  return document.body.querySelector<HTMLElement>(`[data-scope="message-feed"][data-part="${name}"]`)!
}

function items(): HTMLElement[] {
  return [...document.body.querySelectorAll<HTMLElement>('[data-scope="message-feed"][data-part="item"]')]
}

describe('xhMessageFeed 的焦点落点如实上报', () => {
  it('持有焦点的条目被摘掉：焦点锚点当场清空，root 重新兜底进 Tab 序列', async () => {
    const { ids, unmount } = mountFeed(['m1', 'm2'])

    items()[1]!.focus()
    await nextTick()
    // 焦点已在流内：root 让位，停靠点归焦点条目
    expect(part('root').getAttribute('tabindex')).toBe('-1')
    expect(items()[1]!.getAttribute('tabindex')).toBe('0')

    ids.value = ['m1']
    await nextTick()
    await nextTick()

    expect(items()).toHaveLength(1)
    // 锚点若还停在已消失的 'm2' 上，root 与条目会同时是 -1，整份流零停靠点
    expect(part('root').getAttribute('tabindex')).toBe('0')

    unmount()
  })

  it('持有焦点的条目换了身份：锚点跟着改记新值', async () => {
    const { ids, unmount } = mountFeed(['m1', 'm2'])

    items()[1]!.focus()
    await nextTick()
    expect(items()[1]!.getAttribute('tabindex')).toBe('0')

    // 同一个 DOM 节点复用，只是 itemId 换了：机器不重报就还记着已经不在场的旧值，
    // 那个锚点没有条目认领，整份消息流于是一个 Tab 停靠点都没有
    ids.value = ['m1', 'm3']
    await nextTick()
    await nextTick()

    const list = items()
    expect(list[1]!.getAttribute('data-value')).toBe('m3')
    expect(list[1]!.getAttribute('tabindex')).toBe('0')

    unmount()
  })

  it('摘掉的不是焦点条目时，锚点原地不动', async () => {
    const { ids, unmount } = mountFeed(['m1', 'm2', 'm3'])

    items()[0]!.focus()
    await nextTick()

    ids.value = ['m1', 'm2']
    await nextTick()
    await nextTick()

    // 锚点仍在 'm1'：root 不该被抬回 Tab 序列，方向键的起点也还在
    expect(items()).toHaveLength(2)
    expect(part('root').getAttribute('tabindex')).toBe('-1')
    expect(items()[0]!.getAttribute('tabindex')).toBe('0')
    expect(document.activeElement).toBe(items()[0])

    unmount()
  })
})
