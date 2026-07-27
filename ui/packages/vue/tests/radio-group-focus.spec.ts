// @vitest-environment jsdom
import type { Ref } from 'vue'
import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import { defineComponent, h, nextTick, ref } from 'vue'
import { XhRadioGroupItem, XhRadioGroupItemText, XhRadioGroupRoot } from '../src'

afterEach(() => {
  document.body.innerHTML = ''
})

interface MountedGroup {
  /** 改这个数组即增删条目，走真实的挂载/卸载。 */
  values: Ref<string[]>
  unmount: () => void
}

function mountGroup(initial: readonly string[], defaultValue?: string): MountedGroup {
  const values = ref<string[]>([...initial])
  const Harness = defineComponent({
    setup() {
      return () => h(XhRadioGroupRoot, { defaultValue }, {
        default: () => values.value.map(v => h(XhRadioGroupItem, { key: v, value: v }, {
          default: () => h(XhRadioGroupItemText, null, { default: () => v }),
        })),
      })
    },
  })
  const w = mount(Harness, { attachTo: document.body })
  return { values, unmount: () => w.unmount() }
}

function rootEl(): HTMLElement {
  return document.body.querySelector<HTMLElement>('[role="radiogroup"]')!
}

function itemEl(value: string): HTMLElement {
  return document.body.querySelector<HTMLElement>(`[role="radio"][data-value="${value}"]`)!
}

/** 键盘用户能 Tab 停进本组的位置：容器的兜底位与条目的 roving 位。 */
function tabStops(): HTMLElement[] {
  const nodes = [...document.body.querySelectorAll<HTMLElement>('[role="radiogroup"], [role="radio"]')]
  return nodes.filter(node => node.getAttribute('tabindex') === '0')
}

// 卸载条目时 Chrome 与 jsdom 都不派 focusout，机器收不到失焦；
// 条目不补报的话焦点锚点就停在一个已消失的值上，整组退出 Tab 序列。
describe('xhRadioGroup 焦点条目卸载', () => {
  it('卸载持有焦点的条目后，整组仍有恰好一个 Tab 停靠点', async () => {
    const group = mountGroup(['a', 'b', 'c'])
    await nextTick()

    const focused = itemEl('b')
    focused.focus()
    await nextTick()
    expect(document.activeElement).toBe(focused)
    expect(tabStops()).toHaveLength(1)
    expect(tabStops()[0]).toBe(focused)

    group.values.value = ['a', 'c']
    await nextTick()
    await nextTick()

    // 锚点仍指着已消失的 'b' 的话：容器认为焦点在组内退到 -1，余下条目也没人认领 0
    expect(tabStops()).toHaveLength(1)
    expect(rootEl().getAttribute('tabindex')).toBe('0')

    group.unmount()
  })

  it('有选中值时，锚点回落到选中条目', async () => {
    const group = mountGroup(['a', 'b', 'c'], 'a')
    await nextTick()

    const focused = itemEl('b')
    focused.focus()
    await nextTick()
    expect(tabStops()[0]).toBe(focused)

    group.values.value = ['a', 'c']
    await nextTick()
    await nextTick()

    // 焦点离场后光标清空，锚点回落到选中值：选中条目认领 0；
    // 同时容器按既有规则重新兜底进 Tab 序列（focusedValue == null ⇒ 0），
    // 于是停靠点是"容器 + 选中条目"两个。容器只是入口，onFocus 会立刻把焦点转投给条目、
    // 自己随即让位，所以对用户仍是一次停靠。
    expect(tabStops()).toEqual([rootEl(), itemEl('a')])
    expect(rootEl().getAttribute('tabindex')).toBe('0')

    group.unmount()
  })

  it('卸载非焦点条目不动光标：焦点条目仍独占停靠点，方向键起点不变', async () => {
    const group = mountGroup(['a', 'b', 'c', 'd'])
    await nextTick()

    const focused = itemEl('b')
    focused.focus()
    await nextTick()

    group.values.value = ['a', 'b', 'c']
    await nextTick()
    await nextTick()

    expect(tabStops()).toHaveLength(1)
    expect(tabStops()[0]).toBe(focused)
    expect(rootEl().getAttribute('tabindex')).toBe('-1')

    // 光标真在 'b' 上才会走到 'c'；被清掉的话方向键会从头起步落到 'a'
    focused.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true }))
    await nextTick()
    expect(document.activeElement).toBe(itemEl('c'))

    group.unmount()
  })
})
