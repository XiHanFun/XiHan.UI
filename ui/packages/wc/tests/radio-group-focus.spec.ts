// @vitest-environment jsdom

import { describe, expect, it } from 'vitest'
import { defineXhElements } from '../src/define'

defineXhElements()

interface Updatable extends HTMLElement { updateComplete: Promise<unknown> }

// MutationObserver 回调是微任务，requestUpdate 之后还要等一帧 Lit 更新，故统一等两拍。
async function settle(el: Updatable): Promise<void> {
  await el.updateComplete
  await el.updateComplete
}

function mountGroup(values: readonly string[], defaultValue?: string): Updatable {
  const el = document.createElement('xh-radio-group') as Updatable
  if (defaultValue != null)
    el.setAttribute('default-value', defaultValue)
  const root = document.createElement('div')
  root.dataset.xhPart = 'root'
  for (const v of values) {
    const item = document.createElement('label')
    item.dataset.xhPart = 'item'
    item.setAttribute('value', v)
    const input = document.createElement('input')
    input.dataset.xhPart = 'hidden-input'
    item.appendChild(input)
    root.appendChild(item)
  }
  el.appendChild(root)
  document.body.appendChild(el)
  return el
}

function rootOf(el: HTMLElement): HTMLElement {
  return el.querySelector<HTMLElement>('[data-xh-part="root"]')!
}

function itemOf(el: HTMLElement, value: string): HTMLElement {
  return el.querySelector<HTMLElement>(`[data-xh-part="item"][value="${value}"]`)!
}

/** 键盘用户能 Tab 停进本组的位置：容器的兜底位与条目的 roving 位。 */
function tabStops(el: HTMLElement): HTMLElement[] {
  const nodes = [...el.querySelectorAll<HTMLElement>('[data-xh-part="root"], [data-xh-part="item"]')]
  return nodes.filter(node => node.getAttribute('tabindex') === '0')
}

// 移除条目时 Chrome 与 jsdom 都不派 focusout，机器收不到失焦；
// 宿主不补报的话焦点锚点就停在一个已消失的值上，整组退出 Tab 序列。
describe('xhRadioGroup 焦点条目离场', () => {
  it('移除持有焦点的条目后，整组仍有恰好一个 Tab 停靠点', async () => {
    const el = mountGroup(['a', 'b', 'c'])
    await settle(el)

    const focused = itemOf(el, 'b')
    focused.focus()
    await settle(el)
    expect(document.activeElement).toBe(focused)
    expect(tabStops(el)).toHaveLength(1)
    expect(tabStops(el)[0]).toBe(focused)

    focused.remove()
    await settle(el)

    // 锚点仍指着已消失的 'b' 的话：容器认为焦点在组内退到 -1，余下条目也没人认领 0
    expect(tabStops(el)).toHaveLength(1)
    expect(rootOf(el).getAttribute('tabindex')).toBe('0')

    el.remove()
  })

  it('有选中值时，锚点回落到选中条目', async () => {
    const el = mountGroup(['a', 'b', 'c'], 'a')
    await settle(el)

    const focused = itemOf(el, 'b')
    focused.focus()
    await settle(el)
    expect(tabStops(el)[0]).toBe(focused)

    focused.remove()
    await settle(el)

    // 焦点离场后光标清空，锚点回落到选中值：选中条目认领 0；
    // 同时容器按既有规则重新兜底进 Tab 序列（focusedValue == null ⇒ 0），
    // 于是停靠点是"容器 + 选中条目"两个。容器只是入口，onFocus 会立刻把焦点转投给条目、
    // 自己随即让位，所以对用户仍是一次停靠。
    expect(tabStops(el)).toEqual([rootOf(el), itemOf(el, 'a')])
    expect(rootOf(el).getAttribute('tabindex')).toBe('0')

    el.remove()
  })

  it('移除非焦点条目不动光标：焦点条目仍独占停靠点，方向键起点不变', async () => {
    const el = mountGroup(['a', 'b', 'c', 'd'])
    await settle(el)

    const focused = itemOf(el, 'b')
    focused.focus()
    await settle(el)

    itemOf(el, 'd').remove()
    await settle(el)

    expect(tabStops(el)).toHaveLength(1)
    expect(tabStops(el)[0]).toBe(focused)
    expect(rootOf(el).getAttribute('tabindex')).toBe('-1')

    // 光标真在 'b' 上才会走到 'c'；被清掉的话方向键会从头起步落到 'a'
    focused.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true }))
    await settle(el)
    expect(document.activeElement).toBe(itemOf(el, 'c'))

    el.remove()
  })
})
