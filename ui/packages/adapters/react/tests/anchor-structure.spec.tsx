// @vitest-environment jsdom
// 不给 children 时照 anchorStructure 铺：铺出的 DOM 与手写全套部件逐节点相同，href 由 id 派生，末尾是指示条。
import { describe, expect, it } from 'vitest'
import { XhAnchorIndicator, XhAnchorItem, XhAnchorLink, XhAnchorList, XhAnchorRoot } from '../src'
import { renderInto, structureSnapshot } from './structure-snapshot'

const SECTIONS = [
  { value: 'anchor-overview', label: '概览' },
  { value: 'anchor-install', label: '安装' },
  { value: 'anchor-theme' },
]

describe('anchor 的标准结构', () => {
  it('只给 collection 铺出的树与手写全套部件逐节点相同：nav 地标里一个 ul，链接 href 指向区块', async () => {
    const auto = await renderInto(<XhAnchorRoot collection={SECTIONS} defaultValue="anchor-install" />)
    const hand = await renderInto(
      <XhAnchorRoot collection={SECTIONS} defaultValue="anchor-install">
        <XhAnchorList>
          <XhAnchorItem><XhAnchorLink value="anchor-overview">概览</XhAnchorLink></XhAnchorItem>
          <XhAnchorItem><XhAnchorLink value="anchor-install">安装</XhAnchorLink></XhAnchorItem>
          <XhAnchorItem><XhAnchorLink value="anchor-theme">anchor-theme</XhAnchorLink></XhAnchorItem>
          <XhAnchorIndicator />
        </XhAnchorList>
      </XhAnchorRoot>,
    )
    expect(structureSnapshot(auto.host)).toEqual(structureSnapshot(hand.host))
    expect(Array.from(auto.host.querySelectorAll('a'), el => el.getAttribute('href'))).toEqual(['#anchor-overview', '#anchor-install', '#anchor-theme'])
    expect(auto.host.querySelector('[aria-current="location"]')?.textContent).toBe('安装')
    expect(auto.host.querySelector('ul > li:last-child')?.getAttribute('data-part')).toBe('indicator')
  })
})
