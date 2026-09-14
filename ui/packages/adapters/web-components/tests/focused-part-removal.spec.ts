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

function mountTabs(values: readonly string[]): Updatable {
  const el = document.createElement('xh-tabs') as Updatable
  el.setAttribute('default-value', values[0]!)
  const root = document.createElement('div')
  root.dataset.xhPart = 'root'
  const list = document.createElement('div')
  list.dataset.xhPart = 'list'
  root.appendChild(list)
  for (const v of values) {
    const trigger = document.createElement('button')
    trigger.dataset.xhPart = 'trigger'
    trigger.setAttribute('value', v)
    trigger.textContent = v
    list.appendChild(trigger)
    const content = document.createElement('div')
    content.dataset.xhPart = 'content'
    content.setAttribute('value', v)
    root.appendChild(content)
  }
  el.appendChild(root)
  document.body.appendChild(el)
  return el
}

function trigger(el: HTMLElement, value: string): HTMLElement {
  return el.querySelector<HTMLElement>(`[data-xh-part="trigger"][value="${value}"]`)!
}

/**
 * 整组对键盘用户的入口：容器与条目里 tabindex=0 的那些。
 * 容器是焦点在组外时的兜底入口，条目里只有 roving 锚点那个留在 Tab 序列内；
 * 两者同时是 -1 就意味着这组再也 Tab 不进去了。
 */
function tabStops(el: HTMLElement): HTMLElement[] {
  const nodes = [
    el.querySelector<HTMLElement>('[data-xh-part="list"]')!,
    ...el.querySelectorAll<HTMLElement>('[data-xh-part="trigger"]'),
  ]
  return nodes.filter(node => node.getAttribute('tabindex') === '0')
}

// 可关闭的 tab 会把"当前有焦点的那个条目"直接从 DOM 里摘掉。
// 此时 Chrome 与 jsdom 都不派 focusout（Firefox 才派），机器收不到焦点离场，
// 焦点锚点会停在一个已消失的值上——适配器须替 DOM 补报。
describe('xh-tabs 焦点条目离场', () => {
  it('移除持有焦点的条目后，整组仍有 Tab 入口', async () => {
    const el = mountTabs(['one', 'two', 'three'])
    await settle(el)

    const focused = trigger(el, 'two')
    focused.focus()
    await settle(el)
    // 焦点已在组内：容器让位，停靠点归焦点条目
    expect(tabStops(el).map(n => n.getAttribute('data-value'))).toEqual(['two'])

    focused.remove()
    await settle(el)

    // 锚点若还停在已消失的 'two' 上，容器与条目会同时是 -1，整组零停靠点
    expect(tabStops(el).length).toBeGreaterThan(0)
    expect(trigger(el, 'one').getAttribute('tabindex')).toBe('0')

    // 兜底入口回来了，键盘能重新进组并被转投给条目
    const list = el.querySelector<HTMLElement>('[data-xh-part="list"]')!
    expect(list.getAttribute('tabindex')).toBe('0')
    list.focus()
    await settle(el)
    expect(document.activeElement?.getAttribute('data-xh-part')).toBe('trigger')

    el.remove()
  })

  it('移除的不是焦点条目时，光标原地不动', async () => {
    const el = mountTabs(['one', 'two', 'three'])
    await settle(el)

    trigger(el, 'two').focus()
    await settle(el)

    trigger(el, 'three').remove()
    await settle(el)

    // 光标仍在 'two'：停靠点没被清掉，方向键的起点也就还在
    expect(tabStops(el).map(n => n.getAttribute('data-value'))).toEqual(['two'])
    expect(el.querySelector<HTMLElement>('[data-xh-part="list"]')!.getAttribute('tabindex')).toBe('-1')
    expect(document.activeElement).toBe(trigger(el, 'two'))

    el.remove()
  })

  it('条目连同焦点被挪走后，原组不再把锚点记在离场条目上', async () => {
    const from = mountTabs(['a1', 'a2'])
    const to = mountTabs(['b1', 'b2'])
    await settle(from)
    await settle(to)

    const moved = trigger(from, 'a2')
    moved.focus()
    await settle(from)

    to.querySelector<HTMLElement>('[data-xh-part="list"]')!.appendChild(moved)
    await settle(from)
    await settle(to)

    expect(tabStops(from).length).toBeGreaterThan(0)

    from.remove()
    to.remove()
  })
})
