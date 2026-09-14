import type { App } from 'vue'
import { getLayerRegistry } from '@xihan-ui/core'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
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

let app: App | null = null
let host: HTMLElement | null = null

async function settle(): Promise<void> {
  await nextTick()
  await new Promise(resolve => requestAnimationFrame(resolve))
  await nextTick()
}

function mount(render: () => ReturnType<typeof h>): void {
  host = document.createElement('div')
  document.body.append(host)
  app = createApp({ setup: () => render })
  app.mount(host)
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

afterEach(() => {
  app?.unmount()
  app = null
  host?.remove()
  host = null
  document.body.innerHTML = ''
})

describe('vue 特殊浮层真实退场资源', () => {
  it('pagination 省略位退出完成前保留 Layer，逻辑关闭立即失活', async () => {
    installLongExit('pagination', 'content')
    mount(() => h(XhPaginationRoot, { count: 2000, defaultPage: 100 }, () => [
      h(XhPaginationEllipsisTrigger, { side: 'start' }, () => '更多'),
      h(XhPaginationPositioner, null, () => h(XhPaginationContent)),
    ]))
    await settle()
    const trigger = document.querySelector<HTMLElement>('[data-scope="pagination"][data-part="ellipsis-trigger"]')!
    trigger.click()
    await settle()
    expect(getLayerRegistry(document).list()).toHaveLength(1)

    trigger.click()
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
    mount(() => h(XhSideNavRoot, {
      collapsed: true,
      collection: [
        { value: 'products', children: [{ value: 'product-a' }] },
        { value: 'docs', children: [{ value: 'doc-a' }] },
      ],
    }, () => h(XhSideNavList, null, () => [
      h(XhSideNavBranch, { value: 'products' }, () => [
        h(XhSideNavBranchTrigger, null, () => '产品'),
        h(XhSideNavBranchContent, null, () => h(XhSideNavLink, { value: 'product-a' }, () => '产品一')),
      ]),
      h(XhSideNavBranch, { value: 'docs' }, () => [
        h(XhSideNavBranchTrigger, null, () => '文档'),
        h(XhSideNavBranchContent, null, () => h(XhSideNavLink, { value: 'doc-a' }, () => '文档一')),
      ]),
    ])))
    await settle()
    const productsTrigger = document.querySelector<HTMLElement>('[data-part="branch-trigger"][data-value="products"]')!
    const docsTrigger = document.querySelector<HTMLElement>('[data-part="branch-trigger"][data-value="docs"]')!
    productsTrigger.click()
    await settle()
    expect(getLayerRegistry(document).list()).toHaveLength(1)

    docsTrigger.click()
    await settle()
    const products = document.querySelector<HTMLElement>('[data-part="branch-content"][id$="content-products"]')!
    expect(products.inert).toBe(true)
    expect(products.getAttribute('aria-hidden')).toBe('true')
    expect(getLayerRegistry(document).list()).toHaveLength(2)
    finite(products)[0]!.finish()
    await settle()
    expect(getLayerRegistry(document).list()).toHaveLength(2)

    docsTrigger.click()
    await settle()
    const docs = document.querySelector<HTMLElement>('[data-part="branch-content"][id$="content-docs"]')!
    expect(docs.inert).toBe(true)
    finite(docs)[0]!.finish()
    await settle()
    expect(getLayerRegistry(document).list()).toHaveLength(0)
  })
})
