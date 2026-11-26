// @vitest-environment jsdom
// xh-anchor 不写部件时按标准结构生成：生成的节点与作者手写全套部件逐节点相同，href 由 id 派生，末尾是指示条。
import { describe, expect, it } from 'vitest'
import { defineXhElements } from '../src/define'
import { mountElement, settle, structureSnapshot } from './structure-snapshot'

defineXhElements()

const SECTIONS = [
  { value: 'anchor-overview', label: '概览' },
  { value: 'anchor-install', label: '安装' },
  { value: 'anchor-theme' },
]

const MANUAL = `<nav data-xh-part="root"><ul data-xh-part="list">${[
  '<li data-xh-part="item"><a data-xh-part="link" value="anchor-overview">概览</a></li>',
  '<li data-xh-part="item"><a data-xh-part="link" value="anchor-install">安装</a></li>',
  '<li data-xh-part="item"><a data-xh-part="link" value="anchor-theme">anchor-theme</a></li>',
  '<li data-xh-part="indicator"></li>',
].join('')}</ul></nav>`

describe('xh-anchor 生成结构', () => {
  it('只给 collection 生成的节点与手写全套部件逐节点相同：nav 地标里一个 ul，链接 href 指向区块', async () => {
    const auto = mountElement('xh-anchor', { attrs: { 'default-value': 'anchor-install' }, props: { collection: SECTIONS } })
    const hand = mountElement('xh-anchor', { attrs: { 'default-value': 'anchor-install' }, props: { collection: SECTIONS }, inner: MANUAL })
    await settle(auto.container)
    await settle(hand.container)
    expect(structureSnapshot(auto.container)).toEqual(structureSnapshot(hand.container))
    expect(Array.from(auto.container.querySelectorAll('a'), el => el.getAttribute('href'))).toEqual(['#anchor-overview', '#anchor-install', '#anchor-theme'])
    expect(auto.container.querySelector('[aria-current="location"]')?.textContent).toBe('安装')
  })
})
