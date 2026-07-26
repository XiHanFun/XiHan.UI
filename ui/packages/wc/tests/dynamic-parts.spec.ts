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

/** 统计此后 updated() 跑了多少轮。 */
function countUpdates(el: HTMLElement): () => number {
  let n = 0
  const target = el as unknown as { updated: (...a: unknown[]) => void }
  const origin = target.updated
  target.updated = function patched(this: unknown, ...args: unknown[]) {
    n += 1
    return origin.apply(this, args)
  }
  return () => n
}

function addTrigger(el: HTMLElement, value: string): HTMLElement {
  const list = el.querySelector<HTMLElement>('[data-xh-part="list"]')!
  const trigger = document.createElement('button')
  trigger.dataset.xhPart = 'trigger'
  trigger.setAttribute('value', value)
  trigger.textContent = value
  list.appendChild(trigger)
  const content = document.createElement('div')
  content.dataset.xhPart = 'content'
  content.setAttribute('value', value)
  el.querySelector<HTMLElement>('[data-xh-part="root"]')!.appendChild(content)
  return trigger
}

// 作者在运行期直接改 Light DOM 是 WC 独有的用法（Vue 侧条目是组件、增删自带渲染）。
// 不观察子节点变动就会留下"死条目"。其余仍存在的适配器差异见 packages/wc/README.md。
describe('xhElement 运行期增删角色节点', () => {
  it('新增的条目会被接线：拿到 part 标记与身份，且能被点击切换', async () => {
    const el = mountTabs(['one', 'two'])
    await settle(el)

    const added = addTrigger(el, 'three')
    expect(added.getAttribute('role')).toBeNull() // 还没接线
    await settle(el)

    expect(added.getAttribute('role')).toBe('tab')
    expect(added.getAttribute('data-scope')).toBe('tabs')
    expect(added.getAttribute('data-value')).toBe('three')
    expect(added.getAttribute('aria-selected')).toBe('false')

    added.click()
    await settle(el)
    expect(added.getAttribute('aria-selected')).toBe('true')

    el.remove()
  })

  it('新增条目进入键盘导航序列（集合查询看得见它）', async () => {
    const el = mountTabs(['one', 'two'])
    await settle(el)
    addTrigger(el, 'three')
    await settle(el)

    const triggers = [...el.querySelectorAll<HTMLElement>('[data-xh-part="trigger"]')]
    // 聚焦会把锚点交给该条目，须等重新接线后再按键——否则处理器闭包里还是聚焦前的锚点
    triggers[1]!.focus()
    await settle(el)
    triggers[1]!.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true }))
    await settle(el)

    // 没接线的话第三个条目查不到，ArrowRight 会回绕到第一个
    expect(document.activeElement).toBe(triggers[2])
    expect(triggers[2]!.getAttribute('aria-selected')).toBe('true')

    el.remove()
  })

  it('删除条目后余下条目仍正常，不抛', async () => {
    const el = mountTabs(['one', 'two', 'three'])
    await settle(el)

    el.querySelector('[data-xh-part="trigger"][value="two"]')!.remove()
    await settle(el)

    const triggers = [...el.querySelectorAll<HTMLElement>('[data-xh-part="trigger"]')]
    expect(triggers).toHaveLength(2)
    triggers[1]!.click()
    await settle(el)
    expect(triggers[1]!.getAttribute('aria-selected')).toBe('true')

    el.remove()
  })

  it('业务内容增删不触发重新接线（观察器只认角色节点进出）', async () => {
    const el = mountTabs(['one', 'two'])
    await settle(el)
    const content = el.querySelector<HTMLElement>('[data-xh-part="content"]')!

    const updates = countUpdates(el)
    // 面板里塞业务 DOM：与角色节点集合无关，不该引发整元素重新接线
    for (let i = 0; i < 5; i++) {
      content.appendChild(document.createElement('li'))
      await settle(el)
    }
    expect(updates()).toBe(0)

    el.remove()
  })

  it('纯文本改动不触发重新接线（观察器只认元素进出）', async () => {
    const el = mountTabs(['one', 'two'])
    await settle(el)
    const content = el.querySelector<HTMLElement>('[data-xh-part="content"]')!

    let updates = 0
    const origin = (el as unknown as { updated: () => void }).updated
    ;(el as unknown as { updated: () => void }).updated = function patched(this: unknown, ...args: unknown[]) {
      updates += 1
      return (origin as (...a: unknown[]) => void).apply(this, args)
    }

    content.textContent = '改了文案'
    await settle(el)
    expect(updates).toBe(0)

    el.remove()
  })

  // wire() 会往角色节点写属性；观察器若一并观察 attributes 就会自触发成死循环。
  it('wire 写属性不会自触发成死循环', async () => {
    const el = mountTabs(['one', 'two'])
    await settle(el)

    let updates = 0
    const origin = (el as unknown as { updated: () => void }).updated
    ;(el as unknown as { updated: () => void }).updated = function patched(this: unknown, ...args: unknown[]) {
      updates += 1
      return (origin as (...a: unknown[]) => void).apply(this, args)
    }

    addTrigger(el, 'three')
    await settle(el)
    await settle(el)
    // 增一个条目只应引发一轮重新接线，而不是无限轮
    expect(updates).toBe(1)

    el.remove()
  })
})

// 角色节点本身是"属性一变就改写自己子节点"的自定义元素时，
// 接线写属性 → 该节点改子节点 → 观察器命中 → 又接线，会经由 DOM 闭成死循环。
// 两道防线：spread 写属性前先比值（值没变就不写）、观察器只认角色节点进出。
class SelfMutatingIcon extends HTMLElement {
  static get observedAttributes(): string[] {
    return ['data-state', 'aria-selected', 'tabindex']
  }

  attributeChangedCallback(): void {
    this.replaceChildren(document.createElement('i'))
  }
}
customElements.define('x-self-mutating-icon', SelfMutatingIcon)

describe('xhElement 不经 DOM 闭成死循环', () => {
  it('角色节点在属性变化时改写自身子树，接线仍收敛', async () => {
    const el = document.createElement('xh-tabs') as Updatable
    el.setAttribute('default-value', 'a')
    const root = document.createElement('div')
    root.dataset.xhPart = 'root'
    const list = document.createElement('div')
    list.dataset.xhPart = 'list'
    root.appendChild(list)
    for (const v of ['a', 'b']) {
      const trigger = document.createElement('x-self-mutating-icon')
      trigger.dataset.xhPart = 'trigger'
      trigger.setAttribute('value', v)
      list.appendChild(trigger)
    }
    el.appendChild(root)
    document.body.appendChild(el)
    await settle(el)

    const updates = countUpdates(el)
    await settle(el)
    await settle(el)
    // 收敛：不再有新一轮接线（旧实现在此处会一直攀升直到饿死微任务队列）
    expect(updates()).toBe(0)
    expect(list.querySelector('[data-xh-part="trigger"]')!.getAttribute('role')).toBe('tab')

    el.remove()
  })
})

describe('xhElement 交还离开宿主的角色节点', () => {
  it('条目被挪到另一台同类元素后，只受新宿主驱动', async () => {
    const a = mountTabs(['a1', 'a2'])
    const b = mountTabs(['b1', 'b2'])
    await settle(a)
    await settle(b)

    const aEvents: unknown[] = []
    const bEvents: unknown[] = []
    a.addEventListener('value-change', e => aEvents.push((e as CustomEvent).detail))
    b.addEventListener('value-change', e => bEvents.push((e as CustomEvent).detail))

    const moved = a.querySelector<HTMLElement>('[data-xh-part="trigger"][value="a2"]')!
    b.querySelector<HTMLElement>('[data-xh-part="list"]')!.appendChild(moved)
    moved.setAttribute('value', 'b2')
    await settle(a)
    await settle(b)

    moved.click()
    await settle(a)
    await settle(b)

    // 旧宿主必须彻底撒手：不再收到事件，也不该被这次点击改状态
    expect(aEvents).toEqual([])
    expect(bEvents).toEqual([{ value: 'b2' }])

    a.remove()
    b.remove()
  })

  it('被移除的条目不再驱动原宿主', async () => {
    const el = mountTabs(['one', 'two'])
    await settle(el)
    const events: unknown[] = []
    el.addEventListener('value-change', e => events.push((e as CustomEvent).detail))

    const gone = el.querySelector<HTMLElement>('[data-xh-part="trigger"][value="two"]')!
    gone.remove()
    await settle(el)

    gone.click()
    await settle(el)
    expect(events).toEqual([])
    // 交还时连本机器写过的属性一并撤掉，节点回到作者交给我们时的样子
    expect(gone.getAttribute('role')).toBeNull()
    expect(gone.getAttribute('data-scope')).toBeNull()

    el.remove()
  })
})

describe('xhElement 重连后重新接线', () => {
  it('元素在 DOM 中被移动后，处理器换成新机器的，交互仍然有效', async () => {
    const el = mountTabs(['one', 'two'])
    await settle(el)

    const host = document.createElement('section')
    document.body.appendChild(host)
    el.remove()
    host.appendChild(el)
    await settle(el)

    // 旧机器已停机；若没重新接线，这次点击会打在指向已停机器的旧处理器上
    const second = el.querySelector<HTMLElement>('[data-xh-part="trigger"][value="two"]')!
    second.click()
    await settle(el)
    expect(second.getAttribute('aria-selected')).toBe('true')

    host.remove()
  })

  it('重连后新增的条目照样会被接线（观察器已重新挂上）', async () => {
    const el = mountTabs(['one', 'two'])
    await settle(el)
    el.remove()
    document.body.appendChild(el)
    await settle(el)

    const added = addTrigger(el, 'three')
    await settle(el)
    expect(added.getAttribute('role')).toBe('tab')

    el.remove()
  })
})
