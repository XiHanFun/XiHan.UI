// @vitest-environment jsdom
// 不写默认插槽时照 anchorStructure 铺：铺出的 DOM 与手写全套部件逐节点相同，href 由 id 派生，末尾是指示条。
import { describe, expect, it } from 'vitest'
import { h } from 'vue'
import { XhAnchorIndicator, XhAnchorItem, XhAnchorLink, XhAnchorList, XhAnchorRoot } from '../src'
import { mountRender, structureSnapshot } from './structure-snapshot'

const SECTIONS = [
  { value: 'anchor-overview', label: '概览' },
  { value: 'anchor-install', label: '安装' },
  { value: 'anchor-theme' },
]

describe('anchor 的标准结构', () => {
  it('只给 collection 铺出的树与手写全套部件逐节点相同：nav 地标里一个 ul，链接 href 指向区块', () => {
    const props = { collection: SECTIONS, defaultValue: 'anchor-install' }
    const auto = mountRender(() => h(XhAnchorRoot, props))
    const manual = mountRender(() => h(XhAnchorRoot, props, () => h(XhAnchorList, () => [
      h(XhAnchorItem, () => h(XhAnchorLink, { value: 'anchor-overview' }, () => '概览')),
      h(XhAnchorItem, () => h(XhAnchorLink, { value: 'anchor-install' }, () => '安装')),
      h(XhAnchorItem, () => h(XhAnchorLink, { value: 'anchor-theme' }, () => 'anchor-theme')),
      h(XhAnchorIndicator),
    ])))
    expect(structureSnapshot(auto)).toEqual(structureSnapshot(manual))
    expect(Array.from(auto.querySelectorAll('a'), el => el.getAttribute('href'))).toEqual(['#anchor-overview', '#anchor-install', '#anchor-theme'])
    expect(auto.querySelector('[aria-current="location"]')?.textContent).toBe('安装')
    expect(auto.querySelector('ul > li:last-child')?.getAttribute('data-part')).toBe('indicator')
  })
})
