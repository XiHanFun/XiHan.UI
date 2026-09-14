// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from 'vitest'
import { focusFirst, focusSafely, removeLinks } from '../src/behavior/focus-scope/tabbable'

afterEach(() => {
  document.body.innerHTML = ''
})

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
