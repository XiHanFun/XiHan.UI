import type { ReactNode } from 'react'
import type { Root } from 'react-dom/client'
import { getLayerRegistry } from '@xihan-ui/core'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, describe, expect, it } from 'vitest'
import {
  XhPaginationContent,
  XhPaginationEllipsisTrigger,
  XhPaginationPositioner,
  XhPaginationRoot,
  XhSideNavBranch,
  XhSideNavBranchContent,
  XhSideNavBranchTrigger,
  XhSideNavLink,
  XhSideNavList,
  XhSideNavRoot,
} from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let root: Root | null = null
let host: HTMLElement | null = null
const globals = globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }

async function inAct(fn: () => void | Promise<void>): Promise<void> {
  const previous = globals.IS_REACT_ACT_ENVIRONMENT
  globals.IS_REACT_ACT_ENVIRONMENT = true
  try {
    await act(fn)
  }
  finally {
    globals.IS_REACT_ACT_ENVIRONMENT = previous
  }
}

async function settle(): Promise<void> {
  for (let index = 0; index < 4; index++) {
    await inAct(async () => {
      await Promise.resolve()
    })
  }
}

async function mount(node: ReactNode): Promise<void> {
  host = document.createElement('div')
  document.body.append(host)
  root = createRoot(host)
  await inAct(() => root!.render(node))
  await settle()
}

function installLongExit(scope: 'pagination' | 'side-nav', part: 'content' | 'branch-content'): void {
  const style = document.createElement('style')
  style.textContent = `
    @keyframes test-special-overlay-exit { from { opacity: 1 } to { opacity: 0 } }
    [data-scope='${scope}'][data-part='${part}'][data-state='closed'] {
      animation: test-special-overlay-exit 60s linear forwards;
    }
  `
  document.body.append(style)
}

function finite(node: HTMLElement): Animation[] {
  return node.getAnimations().filter(animation => Number.isFinite(animation.effect?.getComputedTiming().endTime))
}

afterEach(async () => {
  if (root)
    await inAct(() => root!.unmount())
  root = null
  host?.remove()
  host = null
  document.body.innerHTML = ''
})

describe('react 特殊浮层真实退场资源', () => {
  it('pagination 省略位退出完成前保留 Layer，逻辑关闭立即失活', async () => {
    installLongExit('pagination', 'content')
    await mount(
      <XhPaginationRoot count={2000} defaultPage={100}>
        <XhPaginationEllipsisTrigger side="start">更多</XhPaginationEllipsisTrigger>
        <XhPaginationPositioner><XhPaginationContent /></XhPaginationPositioner>
      </XhPaginationRoot>,
    )
    const trigger = document.querySelector<HTMLElement>('[data-scope="pagination"][data-part="ellipsis-trigger"]')!
    await inAct(() => trigger.click())
    await settle()
    expect(getLayerRegistry(document).list()).toHaveLength(1)

    await inAct(() => trigger.click())
    await settle()
    const content = document.querySelector<HTMLElement>('[data-scope="pagination"][data-part="content"]')!
    expect(content.inert).toBe(true)
    expect(content.getAttribute('aria-hidden')).toBe('true')
    expect(getLayerRegistry(document).list()).toHaveLength(1)
    finite(content)[0]!.finish()
    await settle()
    expect(getLayerRegistry(document).list()).toHaveLength(0)
  })

  it('side-nav 换枝时保留两份资源，旧退出就绪后等待栈顶再安全释放', async () => {
    installLongExit('side-nav', 'branch-content')
    await mount(
      <XhSideNavRoot
        collapsed
        collection={[
          { value: 'products', children: [{ value: 'product-a' }] },
          { value: 'docs', children: [{ value: 'doc-a' }] },
        ]}
      >
        <XhSideNavList>
          <XhSideNavBranch value="products">
            <XhSideNavBranchTrigger>产品</XhSideNavBranchTrigger>
            <XhSideNavBranchContent><XhSideNavLink value="product-a">产品一</XhSideNavLink></XhSideNavBranchContent>
          </XhSideNavBranch>
          <XhSideNavBranch value="docs">
            <XhSideNavBranchTrigger>文档</XhSideNavBranchTrigger>
            <XhSideNavBranchContent><XhSideNavLink value="doc-a">文档一</XhSideNavLink></XhSideNavBranchContent>
          </XhSideNavBranch>
        </XhSideNavList>
      </XhSideNavRoot>,
    )
    const productsTrigger = document.querySelector<HTMLElement>('[data-part="branch-trigger"][data-value="products"]')!
    const docsTrigger = document.querySelector<HTMLElement>('[data-part="branch-trigger"][data-value="docs"]')!
    await inAct(() => productsTrigger.click())
    await settle()
    expect(getLayerRegistry(document).list()).toHaveLength(1)

    await inAct(() => docsTrigger.click())
    await settle()
    const products = document.querySelector<HTMLElement>('[data-part="branch-content"][id$="content-products"]')!
    expect(products.inert).toBe(true)
    expect(products.getAttribute('aria-hidden')).toBe('true')
    expect(getLayerRegistry(document).list()).toHaveLength(2)
    finite(products)[0]!.finish()
    await settle()
    expect(getLayerRegistry(document).list()).toHaveLength(2)

    await inAct(() => docsTrigger.click())
    await settle()
    const docs = document.querySelector<HTMLElement>('[data-part="branch-content"][id$="content-docs"]')!
    expect(docs.inert).toBe(true)
    finite(docs)[0]!.finish()
    await settle()
    expect(getLayerRegistry(document).list()).toHaveLength(0)
  })
})
