// @vitest-environment jsdom
// 宿主离场（被移除 / 被移动）时角色节点的交还，以及已断开的宿主不得再动别人接管的节点。

import { beforeEach, describe, expect, it } from 'vitest'
import { defineXhElements } from '../src/define'

defineXhElements()

interface Updatable extends HTMLElement { updateComplete: Promise<unknown> }

// MutationObserver 回调是微任务，requestUpdate 之后还要等一帧更新，故统一等两拍。
async function settle(el: Updatable): Promise<void> {
  await el.updateComplete
  await el.updateComplete
}

// 断开后的交还排在微任务里，等一拍让它跑到。
async function tick(): Promise<void> {
  await Promise.resolve()
}

interface Switch {
  el: Updatable
  root: HTMLElement
  thumb: HTMLElement
}

/** 造一台还没入档的 xh-switch，角色节点在挂载前就拿得到，便于装监听器计数。 */
function makeSwitch(defaultChecked = false): Switch {
  const el = document.createElement('xh-switch') as Updatable
  if (defaultChecked)
    el.setAttribute('default-checked', '')
  const root = document.createElement('button')
  root.dataset.xhPart = 'root'
  const thumb = document.createElement('span')
  thumb.dataset.xhPart = 'thumb'
  root.appendChild(thumb)
  el.appendChild(root)
  return { el, root, thumb }
}

/** 数这个节点上当前还挂着几个监听器：add 记一条、remove 销一条，按 (事件名, 函数) 去重。 */
function trackListeners(node: HTMLElement): () => number {
  const live = new Set<string>()
  const ids = new WeakMap<object, number>()
  let seq = 0
  const idOf = (fn: object): number => {
    let id = ids.get(fn)
    if (id === undefined) {
      id = ++seq
      ids.set(fn, id)
    }
    return id
  }
  const originAdd = node.addEventListener.bind(node)
  const originRemove = node.removeEventListener.bind(node)
  node.addEventListener = (type: string, fn: EventListenerOrEventListenerObject | null, opts?: unknown): void => {
    if (fn)
      live.add(`${type}#${idOf(fn as object)}`)
    originAdd(type, fn as EventListener, opts as AddEventListenerOptions)
  }
  node.removeEventListener = (type: string, fn: EventListenerOrEventListenerObject | null, opts?: unknown): void => {
    if (fn)
      live.delete(`${type}#${idOf(fn as object)}`)
    originRemove(type, fn as EventListener, opts as EventListenerOptions)
  }
  return () => live.size
}

function attrNames(el: Element): string[] {
  return [...el.attributes].map(a => a.name).sort()
}

beforeEach(() => {
  document.body.innerHTML = ''
})

// 宿主断开后没有观察器再触发更新，refreshParts 那条交还路径够不着；
// 节点被挪进别处仍活着时，没摘的监听器闭包会一路钉住旧宿主的整棵游离子树与机器。
describe('xhElement 宿主断开后交还角色节点', () => {
  it('宿主被移除后，角色节点上不再留本宿主的监听器与属性', async () => {
    const { el, root } = makeSwitch()
    const listeners = trackListeners(root)
    document.body.appendChild(el)
    await settle(el)
    expect(listeners()).toBeGreaterThan(0)
    expect(root.getAttribute('role')).toBe('switch')

    el.remove()
    await tick()

    expect(listeners()).toBe(0)
    expect(root.getAttribute('role')).toBeNull()
    expect(root.getAttribute('data-scope')).toBeNull()
  })

  it('角色节点被挪进另一台存活宿主后，只剩接管方的监听器', async () => {
    const a = makeSwitch()
    const b = makeSwitch()
    const listeners = trackListeners(a.root)
    document.body.appendChild(a.el)
    document.body.appendChild(b.el)
    await settle(a.el)
    await settle(b.el)
    const wired = listeners()
    expect(wired).toBeGreaterThan(0)

    a.el.remove()
    b.el.replaceChildren(a.root)
    await settle(b.el)

    // 旧宿主没交还的话，节点上会同时挂着两台机器的处理器（一次点击驱动两台）
    expect(listeners()).toBe(wired)
  })

  it('已断开的宿主收属性变化，不把交还掉的监听器重新挂回去', async () => {
    const { el, root } = makeSwitch()
    const listeners = trackListeners(root)
    document.body.appendChild(el)
    await settle(el)
    expect(listeners()).toBeGreaterThan(0)

    el.remove()
    await tick()
    expect(listeners()).toBe(0)

    // 断开态再接线等于把交还撤销，节点随后被挪进别处就又钉住这台已停机的宿主
    el.setAttribute('disabled', '')
    await settle(el)

    expect(listeners()).toBe(0)
    expect(root.getAttribute('role')).toBeNull()
  })

  it('挪走后点击只驱动接管方，旧宿主收不到', async () => {
    const a = makeSwitch()
    const b = makeSwitch()
    document.body.appendChild(a.el)
    document.body.appendChild(b.el)
    await settle(a.el)
    await settle(b.el)

    const aEvents: unknown[] = []
    const bEvents: unknown[] = []
    a.el.addEventListener('checked-change', e => aEvents.push((e as CustomEvent).detail))
    b.el.addEventListener('checked-change', e => bEvents.push((e as CustomEvent).detail))

    a.el.remove()
    b.el.replaceChildren(a.root)
    await settle(b.el)

    a.root.click()
    await settle(b.el)

    expect(aEvents).toEqual([])
    expect(bEvents).toEqual([{ checked: true }])
  })
})

// 移动 = remove 后同步 append 到别处，走的也是 disconnect，不能把它当离场处理。
describe('xhElement 元素被移动时不交还', () => {
  it('移动那一拍属性不被撤掉，落定后接线仍是新机器的', async () => {
    const { el, root } = makeSwitch()
    document.body.appendChild(el)
    await settle(el)

    const box = document.createElement('section')
    document.body.appendChild(box)
    el.remove()
    box.appendChild(el)

    // 同步就撤属性的话，移动过程中节点会短暂失去 role / type，表单里还会变成提交按钮
    expect(root.getAttribute('role')).toBe('switch')
    expect(root.getAttribute('type')).toBe('button')

    await settle(el)
    expect(root.getAttribute('role')).toBe('switch')
    expect(root.isConnected).toBe(true)

    root.click()
    await settle(el)
    expect(root.getAttribute('aria-checked')).toBe('true')
  })

  it('一拍内来回搬三次，交互仍然有效', async () => {
    const { el, root } = makeSwitch()
    const boxA = document.createElement('section')
    const boxB = document.createElement('section')
    document.body.append(boxA, boxB)
    boxA.appendChild(el)
    await settle(el)

    boxB.appendChild(el)
    boxA.appendChild(el)
    boxB.appendChild(el)
    await settle(el)

    expect(root.getAttribute('role')).toBe('switch')
    root.click()
    await settle(el)
    expect(root.getAttribute('aria-checked')).toBe('true')
  })
})

// 已断开的宿主照样收属性变化并跑整轮更新，接线会写在已经归别人管的节点上。
describe('xhElement 已断开的宿主不动别人接管的节点', () => {
  it('对已游离的宿主写属性，不改动接管方的角色节点', async () => {
    const a = makeSwitch()
    const b = makeSwitch()
    document.body.appendChild(a.el)
    document.body.appendChild(b.el)
    await settle(a.el)
    await settle(b.el)

    a.el.remove()
    b.el.replaceChildren(a.root)
    await settle(b.el)
    const taken = attrNames(a.root)
    expect(taken).toContain('role')
    expect(taken).toContain('aria-checked')
    expect(taken).toContain('type')

    a.el.setAttribute('disabled', '')
    await settle(a.el)
    await settle(b.el)

    expect(attrNames(a.root)).toEqual(taken)
    expect(a.root.getAttribute('role')).toBe('switch')
    expect(a.root.getAttribute('type')).toBe('button')
  })

  it('旧宿主重新连接，也不撤接管方写的属性', async () => {
    const a = makeSwitch()
    const b = makeSwitch()
    document.body.appendChild(a.el)
    document.body.appendChild(b.el)
    await settle(a.el)
    await settle(b.el)

    a.el.remove()
    b.el.replaceChildren(a.root)
    await settle(b.el)
    const taken = attrNames(a.root)

    document.body.appendChild(a.el)
    await settle(a.el)
    await settle(b.el)

    expect(attrNames(a.root)).toEqual(taken)

    // 接管方仍能驱动它
    a.root.click()
    await settle(b.el)
    expect(a.root.getAttribute('aria-checked')).toBe('true')
  })
})

// 两台宿主写在同一个角色节点上的属性完全同名，交还只该撤自己那份。
describe('xhElement 角色节点在宿主之间转手', () => {
  it('转手后原宿主交还，不撤接管方写的属性', async () => {
    const a = makeSwitch()
    const b = makeSwitch()
    // 接管方先入档：它的观察器排在原宿主前面，接管方先接线、原宿主后交还
    document.body.appendChild(b.el)
    document.body.appendChild(a.el)
    await settle(a.el)
    await settle(b.el)

    // a 全程连接：两边的观察器都会响，谁后跑到就决定节点上剩什么
    b.el.replaceChildren(a.root)
    await settle(a.el)
    await settle(b.el)
    await settle(a.el)

    expect(a.root.getAttribute('role')).toBe('switch')
    expect(a.root.getAttribute('type')).toBe('button')
    a.root.click()
    await settle(b.el)
    expect(a.root.getAttribute('aria-checked')).toBe('true')
  })
})
