// Web Components 的标签输入：标签节点由作者脚本增删。删掉的标签由替身在原处播完退场——
// 替身不带 data-xh-part，作者脚本按部件声明查不到它，元素的下一轮接线也不会碰它；
// 作者新插进来、还没接线的标签照样按到达播进场。
import { setDiagnosticsLevel } from '@xihan-ui/core'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { defineXhElements } from '../../src/define'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

interface TagsInputElement extends HTMLElement {
  updateComplete: Promise<unknown>
}

defineXhElements()

beforeEach(() => setDiagnosticsLevel('silent'))
afterEach(() => {
  document.body.innerHTML = ''
  setDiagnosticsLevel('warn')
})

async function settle(element: TagsInputElement): Promise<void> {
  for (let round = 0; round < 3; round++) {
    await Promise.resolve()
    await element.updateComplete
  }
  await new Promise(resolve => requestAnimationFrame(() => resolve(undefined)))
}

function tag(value: string): HTMLElement {
  const item = document.createElement('div')
  item.dataset.xhPart = 'item'
  item.setAttribute('value', value)
  item.innerHTML = `<div data-xh-part="item-preview"><span data-xh-part="item-text">${value}</span><button data-xh-part="item-delete-trigger"></button></div>`
  return item
}

function mount(values: string[]): { element: TagsInputElement, control: HTMLElement } {
  const host = document.createElement('div')
  host.style.inlineSize = '360px'
  host.innerHTML = `<xh-tags-input value="${values.join(',')}">
    <div data-xh-part="root"><div data-xh-part="control"><input data-xh-part="input" /></div></div>
  </xh-tags-input>`
  document.body.append(host)
  const control = host.querySelector<HTMLElement>('[data-xh-part="control"]')!
  const input = control.querySelector('input')!
  for (const value of values)
    control.insertBefore(tag(value), input)
  return { element: host.firstElementChild as TagsInputElement, control }
}

function running(el: Element): string[] {
  return el.getAnimations().filter(a => a instanceof CSSAnimation).map(a => (a as CSSAnimation).animationName)
}

describe('web components 标签输入的列表动效', () => {
  it('首帧的标签直接呈现；作者新插进来的标签播进场', async () => {
    const { element, control } = mount(['Vue', 'React'])
    await settle(element)
    for (const el of control.querySelectorAll('[data-xh-part="item"]'))
      expect(running(el)).toEqual([])

    const added = tag('Svelte')
    control.insertBefore(added, control.querySelector('input'))
    await settle(element)
    expect(running(added)).toEqual(['xh-item-in'])
  })

  it('作者删掉的标签由替身在原处淡出：作者脚本查不到它，接线之后它的外观也不变', async () => {
    const { element, control } = mount(['第一枚标签', '二', '三'])
    await settle(element)
    const [gone, next] = control.querySelectorAll<HTMLElement>('[data-xh-part="item"]')
    const rect = gone!.getBoundingClientRect()
    const radius = getComputedStyle(gone!.querySelector('[data-scope="tag"][data-part="root"]')!).borderTopLeftRadius

    gone!.remove()
    await settle(element)

    const ghost = control.querySelector<HTMLElement>('[data-state="closed"]')!
    expect(ghost).not.toBeNull()
    expect(running(ghost)).toEqual(['xh-fade-out'])
    expect(Math.abs(ghost.getBoundingClientRect().left - rect.left)).toBeLessThan(1)
    // 作者脚本按部件声明找在场的标签：替身不在其中
    const live = control.querySelectorAll('[data-xh-part="item"]')
    expect(live).toHaveLength(2)
    expect(live[0]).toBe(next)
    // 元素的下一轮接线已经跑过：替身身上的部件属性与标签外观都还在
    expect(ghost.dataset.scope).toBe('tags-input')
    const pill = ghost.querySelector('[data-scope="tag"][data-part="root"]')
    expect(pill).not.toBeNull()
    expect(getComputedStyle(pill!).borderTopLeftRadius).toBe(radius)

    await expect.poll(() => ghost.isConnected, { timeout: 2000 }).toBe(false)
  })
})
