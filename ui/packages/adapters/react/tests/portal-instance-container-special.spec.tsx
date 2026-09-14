import { cleanup, render } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import {
  XhSideNavBranch,
  XhSideNavBranchContent,
  XhSideNavBranchTrigger,
  XhSideNavList,
  XhSideNavRoot,
  XhTourBackdrop,
  XhTourContent,
  XhTourPositioner,
  XhTourRoot,
  XhTourSpotlight,
} from '../src'

afterEach(() => {
  cleanup()
  document.body.innerHTML = ''
})

describe('react 特殊浮层实例 Portal 容器', () => {
  it('tour 根实例目标同时约束 backdrop、spotlight 与 positioner', () => {
    const target = document.createElement('div')
    document.body.append(target)
    render(
      <XhTourRoot open container={() => target} steps={[{ id: 'intro', title: '介绍' }]}>
        <XhTourBackdrop />
        <XhTourSpotlight />
        <XhTourPositioner><XhTourContent /></XhTourPositioner>
      </XhTourRoot>,
    )

    for (const part of ['backdrop', 'spotlight', 'positioner']) {
      const node = document.querySelector<HTMLElement>(`[data-scope="tour"][data-part="${part}"]`)!
      expect(target.contains(node)).toBe(true)
    }
  })

  it('side-nav 折叠分支使用自己的实例目标', () => {
    const target = document.createElement('div')
    document.body.append(target)
    render(
      <XhSideNavRoot collapsed collection={[{ value: 'docs', children: [{ value: 'guide' }] }]}>
        <XhSideNavList>
          <XhSideNavBranch value="docs">
            <XhSideNavBranchTrigger>文档</XhSideNavBranchTrigger>
            <XhSideNavBranchContent container={() => target} />
          </XhSideNavBranch>
        </XhSideNavList>
      </XhSideNavRoot>,
    )
    const positioner = document.querySelector<HTMLElement>('[data-scope="side-nav"][data-part="positioner"]')!
    expect(target.contains(positioner)).toBe(true)
  })
})
