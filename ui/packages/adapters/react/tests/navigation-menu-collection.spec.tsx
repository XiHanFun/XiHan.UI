// @vitest-environment jsdom
//
// 只给 collection 时，面板按每一项的 children 铺开：带 href 的条目铺为链接，带 children 的铺为一枝子级
// （开关 + 箭头 + 子级容器里的链接），与手写全套部件产出同一副 DOM。
import type { NavigationMenuNode } from '@xihan-ui/headless'
import type { ReactNode } from 'react'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, describe, expect, it } from 'vitest'
import {
  XhNavigationMenuBranchContent,
  XhNavigationMenuBranchIndicator,
  XhNavigationMenuBranchTrigger,
  XhNavigationMenuContent,
  XhNavigationMenuIndicator,
  XhNavigationMenuItem,
  XhNavigationMenuLink,
  XhNavigationMenuList,
  XhNavigationMenuRoot,
  XhNavigationMenuTrigger,
} from '../src'

const NESTED: NavigationMenuNode[] = [
  {
    value: 'products',
    label: '产品',
    children: [
      { value: 'overview', label: '概览', href: '#/products' },
      {
        value: 'frameworks',
        label: '框架',
        children: [
          { value: 'vue', label: 'Vue', href: '#/vue' },
          { value: 'react', label: 'React', href: '#/react', current: true },
        ],
      },
      { value: 'tools', label: '工具', disabled: true, children: [{ value: 'cli', label: 'CLI', href: '#/cli' }] },
    ],
  },
  { value: 'changelog', label: '更新日志', href: '#/changelog' },
]

const hosts: Array<{ host: HTMLElement, root: ReturnType<typeof createRoot> }> = []

afterEach(async () => {
  for (const { host, root } of hosts.splice(0)) {
    await act(async () => {
      root.unmount()
    })
    host.remove()
  }
})

/** 机器的效应排在提交之后，多催几拍让 DOM 落定。 */
async function settle(): Promise<void> {
  for (let i = 0; i < 5; i++) {
    await act(async () => {
      await Promise.resolve()
    })
  }
}

async function mount(tree: ReactNode): Promise<HTMLElement> {
  const host = document.createElement('div')
  document.body.append(host)
  const root = createRoot(host)
  hosts.push({ host, root })
  ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
  await act(async () => {
    root.render(tree)
  })
  await settle()
  return host
}

const PART_SELECTOR = '[data-scope="navigation-menu"][data-part]'

/** 部件树：只取身份与无障碍属性，忽略生成的 id 与量出来的坐标。 */
function skeleton(host: Element): string[] {
  return [...host.querySelectorAll(PART_SELECTOR)].map((el) => {
    const attrs = ['data-part', 'data-value', 'role', 'aria-expanded', 'aria-disabled', 'aria-current', 'aria-hidden', 'data-state', 'data-disabled', 'data-current', 'href', 'hidden']
      .map(name => (el.hasAttribute(name) ? `${name}=${el.getAttribute(name)}` : null))
      .filter(Boolean)
    return `${attrs.join(' ')}|${el.textContent}`
  })
}

function NestedParts(): ReactNode {
  return (
    <XhNavigationMenuRoot collection={NESTED} defaultValue="products">
      <XhNavigationMenuList>
        <XhNavigationMenuItem>
          <XhNavigationMenuTrigger value="products">产品</XhNavigationMenuTrigger>
          <XhNavigationMenuContent value="products">
            <XhNavigationMenuLink href="#/products">概览</XhNavigationMenuLink>
            <XhNavigationMenuBranchTrigger value="frameworks">
              框架
              <XhNavigationMenuBranchIndicator value="frameworks" />
            </XhNavigationMenuBranchTrigger>
            <XhNavigationMenuBranchContent value="frameworks">
              <XhNavigationMenuLink href="#/vue">Vue</XhNavigationMenuLink>
              <XhNavigationMenuLink href="#/react" current>React</XhNavigationMenuLink>
            </XhNavigationMenuBranchContent>
            <XhNavigationMenuBranchTrigger value="tools">
              工具
              <XhNavigationMenuBranchIndicator value="tools" />
            </XhNavigationMenuBranchTrigger>
            <XhNavigationMenuBranchContent value="tools">
              <XhNavigationMenuLink href="#/cli">CLI</XhNavigationMenuLink>
            </XhNavigationMenuBranchContent>
          </XhNavigationMenuContent>
        </XhNavigationMenuItem>
        <XhNavigationMenuItem>
          <XhNavigationMenuLink href="#/changelog">更新日志</XhNavigationMenuLink>
        </XhNavigationMenuItem>
        <XhNavigationMenuIndicator />
      </XhNavigationMenuList>
    </XhNavigationMenuRoot>
  )
}

describe('navigation-menu 的 collection 子级', () => {
  it('不给 renderPanel 时面板按 children 铺开；数据里的禁用落到子级开关上', async () => {
    const host = await mount(<XhNavigationMenuRoot collection={NESTED} />)
    const content = host.querySelector('[data-part="content"]')!
    expect([...content.querySelectorAll(PART_SELECTOR)].map(el => el.getAttribute('data-part'))).toEqual([
      'link',
      'branch-trigger',
      'branch-indicator',
      'branch-content',
      'link',
      'link',
      'branch-trigger',
      'branch-indicator',
      'branch-content',
      'link',
    ])
    const branchTriggers = [...content.querySelectorAll('[data-part="branch-trigger"]')]
    expect(branchTriggers.map(el => el.textContent)).toEqual(['框架', '工具'])
    expect(branchTriggers.map(el => el.getAttribute('aria-disabled'))).toEqual(['false', 'true'])
  })

  it('给了 renderPanel 就由它提供面板内容，children 不再铺', async () => {
    const host = await mount(
      <XhNavigationMenuRoot
        collection={NESTED}
        renderPanel={node => <XhNavigationMenuLink href={`#/${node.value}`}>{`${node.label}（${node.children.length}）`}</XhNavigationMenuLink>}
      />,
    )
    const content = host.querySelector('[data-part="content"]')!
    expect(content.querySelectorAll(PART_SELECTOR)).toHaveLength(1)
    expect(content.textContent).toBe('产品（3）')
  })

  it('铺开的结构与手写全套部件完全一致，挂载即展开时当前页所在的那一枝同样展开', async () => {
    const auto = await mount(<XhNavigationMenuRoot collection={NESTED} defaultValue="products" />)
    const manual = await mount(<NestedParts />)
    expect(skeleton(auto)).toEqual(skeleton(manual))
    expect(auto.querySelector('[data-part="branch-content"]')!.hasAttribute('hidden')).toBe(false)
  })
})
