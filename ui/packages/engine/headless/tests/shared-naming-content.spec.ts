// @vitest-environment jsdom
// 一段内容能不能给节点提供名字或描述：文字与带名字的后代算，对读屏隐藏的子树不算，节点自身的属性不参与。
import { describe, expect, it } from 'vitest'
import { hasNamingContent } from '../src/shared/naming-content'

function node(html: string, attrs: Record<string, string> = {}): HTMLElement {
  const el = document.createElement('span')
  for (const [name, value] of Object.entries(attrs))
    el.setAttribute(name, value)
  el.innerHTML = html
  return el
}

describe('没有能提供名字的内容', () => {
  it('空节点、只有空白、只有注释', () => {
    expect(hasNamingContent(node(''))).toBe(false)
    expect(hasNamingContent(node('  \n\t  '))).toBe(false)
    expect(hasNamingContent(node('<!-- v-if -->'))).toBe(false)
  })

  it('只有不带名字的元素：图形、空容器', () => {
    expect(hasNamingContent(node('<svg viewBox="0 0 24 24"><path d="M0 0h24v24H0z"/></svg>'))).toBe(false)
    expect(hasNamingContent(node('<span><i></i></span>'))).toBe(false)
    expect(hasNamingContent(node('<img src="x.png">'))).toBe(false)
  })

  it('命名属性给了空值或纯空白不算', () => {
    expect(hasNamingContent(node('<img alt="">'))).toBe(false)
    expect(hasNamingContent(node('<i title="  "></i>'))).toBe(false)
    expect(hasNamingContent(node('<span aria-label=""></span>'))).toBe(false)
  })

  it('aria-hidden="true" 的子树整棵不算，里面的文字与带名字的节点都跳过', () => {
    expect(hasNamingContent(node('<span aria-hidden="true">★</span>'))).toBe(false)
    expect(hasNamingContent(node('<svg aria-hidden="true"><title>心</title></svg>'))).toBe(false)
    expect(hasNamingContent(node('<span aria-hidden="true"><img alt="一星"><b>很差</b></span>'))).toBe(false)
  })

  it('hidden 的子树整棵不算', () => {
    expect(hasNamingContent(node('<span hidden>很差</span>'))).toBe(false)
    expect(hasNamingContent(node('<div hidden><img alt="一星"></div>'))).toBe(false)
  })
})

describe('有能提供名字的内容', () => {
  it('非空文字，直接写或嵌在后代里', () => {
    expect(hasNamingContent(node('很差'))).toBe(true)
    expect(hasNamingContent(node('<span><b>很差</b></span>'))).toBe(true)
    expect(hasNamingContent(node('  0  '))).toBe(true)
  })

  it('带非空 aria-label / aria-labelledby / alt / title 的后代', () => {
    expect(hasNamingContent(node('<svg role="img" aria-label="一颗心"></svg>'))).toBe(true)
    expect(hasNamingContent(node('<span aria-labelledby="hint"></span>'))).toBe(true)
    expect(hasNamingContent(node('<img alt="一星">'))).toBe(true)
    expect(hasNamingContent(node('<i title="一星"></i>'))).toBe(true)
  })

  it('隐藏子树旁边的可见内容照样算；aria-hidden="false" 不算隐藏', () => {
    expect(hasNamingContent(node('<svg aria-hidden="true"></svg><span>很好</span>'))).toBe(true)
    expect(hasNamingContent(node('<span hidden>藏起</span>可见'))).toBe(true)
    expect(hasNamingContent(node('<span aria-hidden="false">很好</span>'))).toBe(true)
  })
})

describe('只看后代，节点自身的属性不参与', () => {
  it('节点自己的 aria-label / title 不算内容', () => {
    expect(hasNamingContent(node('', { 'aria-label': '1 of 5 stars' }))).toBe(false)
    expect(hasNamingContent(node('<svg aria-hidden="true"></svg>', { title: '一星' }))).toBe(false)
  })

  it('节点自己带 aria-hidden 或 hidden 时照样看它的后代', () => {
    expect(hasNamingContent(node('很差', { 'aria-hidden': 'true' }))).toBe(true)
    expect(hasNamingContent(node('很差', { hidden: '' }))).toBe(true)
  })
})
