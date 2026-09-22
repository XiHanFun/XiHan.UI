// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from 'vitest'
import { focusFirst, focusSafely, getTabbables, removeLinks, tabbableEdges } from '../src/behavior/focus-scope/tabbable'

afterEach(() => {
  document.body.innerHTML = ''
})

/** 建一棵 depth 层容器、末层挂 count 个按钮的树。 */
function buttonTree(depth: number, count: number): { root: HTMLElement, leaf: HTMLElement, buttons: HTMLButtonElement[] } {
  const root = document.createElement('div')
  let leaf = root
  for (let level = 0; level < depth; level++) {
    const wrap = document.createElement('div')
    leaf.append(wrap)
    leaf = wrap
  }
  const buttons = Array.from({ length: count }, () => document.createElement('button'))
  leaf.append(...buttons)
  document.body.append(root)
  return { root, leaf, buttons }
}

describe('焦点工具的所属根与窗口', () => {
  it('shadow root 内首个候选聚焦成功后立即停止', () => {
    const host = document.createElement('div')
    document.body.appendChild(host)
    const shadow = host.attachShadow({ mode: 'open' })
    const first = document.createElement('button')
    const second = document.createElement('button')
    shadow.append(first, second)

    expect(focusFirst([first, second])).toBe(true)
    expect(shadow.activeElement).toBe(first)
  })

  it('shadow root 内已经聚焦的节点不会被重复聚焦', () => {
    const host = document.createElement('div')
    document.body.appendChild(host)
    const shadow = host.attachShadow({ mode: 'open' })
    const input = document.createElement('input')
    shadow.appendChild(input)
    input.focus()
    const focus = vi.spyOn(input, 'focus')

    focusSafely(input)
    expect(focus).not.toHaveBeenCalled()
  })

  it('iframe 输入框使用所属 Window 的构造器判断并选中文本', () => {
    const frame = document.createElement('iframe')
    document.body.appendChild(frame)
    const doc = frame.contentDocument!
    const input = doc.createElement('input')
    input.value = 'XiHan.UI'
    doc.body.appendChild(input)
    const select = vi.spyOn(input, 'select')

    focusSafely(input, { select: true })
    expect(doc.activeElement).toBe(input)
    expect(select).toHaveBeenCalledTimes(1)
  })

  it('跨窗口创建后 adopt 到主文档的输入框仍可选中文本', () => {
    const frame = document.createElement('iframe')
    document.body.appendChild(frame)
    const foreignInput = frame.contentDocument!.createElement('input')
    foreignInput.value = 'XiHan.UI'
    const input = document.adoptNode(foreignInput)
    document.body.appendChild(input)
    const select = vi.spyOn(input, 'select')

    focusSafely(input, { select: true })
    expect(document.activeElement).toBe(input)
    expect(select).toHaveBeenCalledTimes(1)
  })

  it('html 与 svg 的链接都从无链接焦点候选中移除', () => {
    const htmlLink = document.createElement('a')
    const svgLink = document.createElementNS('http://www.w3.org/2000/svg', 'a')
    const button = document.createElement('button')

    expect(removeLinks([htmlLink, svgLink, button])).toEqual([button])
  })

  it('公开焦点工具直接接受可聚焦 svg', () => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    svg.setAttribute('tabindex', '0')
    document.body.appendChild(svg)

    focusSafely(svg)
    expect(document.activeElement).toBe(svg)
  })
})

describe('可 tab 候选的渲染判定', () => {
  it('祖先 display: none 与 hidden 整棵子树都不算候选，自身 visibility 只看本层', () => {
    const { root, leaf, buttons } = buttonTree(3, 3)
    const style = document.createElement('style')
    style.textContent = '.gone { display: none; }'
    document.head.append(style)
    leaf.className = 'gone'
    expect(getTabbables(root)).toEqual([])

    leaf.className = ''
    leaf.parentElement!.hidden = true
    expect(getTabbables(root)).toEqual([])

    leaf.parentElement!.hidden = false
    buttons[1]!.style.visibility = 'hidden'
    expect(getTabbables(root)).toEqual([buttons[0], buttons[2]])

    buttons[1]!.style.visibility = ''
    buttons[2]!.tabIndex = -1
    expect(getTabbables(root)).toEqual([buttons[0], buttons[1]])
    style.remove()
  })

  it('同一次查询共享祖先判定，不按「候选数 × 容器层数」查计算样式', () => {
    const { root } = buttonTree(15, 200)
    const computed = vi.spyOn(window, 'getComputedStyle')

    getTabbables(root)
    // 每个候选自己一次，加上共用的那条祖先链；逐个从头查会是 200 × 16 次
    expect(computed.mock.calls.length).toBeLessThan(200 + 40)
    computed.mockRestore()
  })

  it('取首尾两个候选时只从两端各扫到第一个命中', () => {
    const { root, buttons } = buttonTree(15, 200)
    buttons[0]!.tabIndex = -1
    buttons[199]!.tabIndex = -1
    const computed = vi.spyOn(window, 'getComputedStyle')

    expect(tabbableEdges(root)).toEqual({ first: buttons[1], last: buttons[198] })
    expect(computed.mock.calls.length).toBeLessThan(40)
    computed.mockRestore()
  })

  it('没有可 tab 元素时取首尾返回 null，只有一个时首尾同一个', () => {
    const { root, buttons } = buttonTree(2, 2)
    for (const button of buttons) button.tabIndex = -1
    expect(tabbableEdges(root)).toBeNull()

    buttons[1]!.tabIndex = 0
    expect(tabbableEdges(root)).toEqual({ first: buttons[1], last: buttons[1] })
  })
})
