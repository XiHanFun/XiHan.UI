// 换面节奏：底色、描边、字色这类「换面」一律走 micro，只有按压缩放回到 1 走释放时长。
// 集合行的悬停进入与按压释放共用同一条 transition，CSS 分不出这两种来路，所以换面只能取一个时长；
// 取 micro 让悬停与离散控件同一节奏，释放的「回弹感」只留给缩放。
import { afterEach, describe, expect, it } from 'vitest'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let host: HTMLElement | null = null

afterEach(() => {
  host?.remove()
  host = null
})

function mountRaw(attrs: Record<string, string>): HTMLElement {
  host ??= document.body.appendChild(document.createElement('div'))
  const element = document.createElement('div')
  for (const [name, value] of Object.entries(attrs))
    element.setAttribute(name, value)
  element.textContent = 'Row'
  host.append(element)
  return element
}

function durationOf(element: HTMLElement, property: string): string {
  const style = getComputedStyle(element)
  const properties = style.transitionProperty.split(',').map(p => p.trim())
  const durations = style.transitionDuration.split(',').map(d => d.trim())
  const index = properties.indexOf(property)
  if (index < 0)
    throw new Error(`${property} 不在过渡列表里：${style.transitionProperty}`)
  return durations[index % durations.length]!
}

function micro(): string {
  const probe = mountRaw({})
  probe.style.transition = 'opacity var(--xh-motion-duration-micro)'
  const value = getComputedStyle(probe).transitionDuration
  probe.remove()
  return value
}

describe('换面节奏', () => {
  it.each([
    ['集合行', { 'data-xh-collection-item': '', 'data-xh-collection-size': 'md' }],
    ['树行', { 'data-scope': 'tree', 'data-part': 'item' }],
    ['表单汇总条目', { 'data-scope': 'form', 'data-part': 'error-summary-item' }],
  ])('%s的底色与字色同走 micro', (_name, attrs) => {
    const element = mountRaw(attrs)
    expect(durationOf(element, 'background-color')).toBe(micro())
    expect(durationOf(element, 'color')).toBe(micro())
  })

  it('按钮换面走 micro，只有缩放走释放时长', () => {
    const element = mountRaw({ 'data-xh-action-control': '', 'data-xh-action-profile': 'text', 'data-xh-action-size': 'md', 'data-xh-action-display': 'always' })
    expect(durationOf(element, 'background-color')).toBe(micro())
    expect(durationOf(element, 'color')).toBe(micro())
    expect(durationOf(element, 'scale')).not.toBe(micro())
  })
})
