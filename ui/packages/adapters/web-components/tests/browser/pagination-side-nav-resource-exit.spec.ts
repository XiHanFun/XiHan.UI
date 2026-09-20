import { getLayerRegistry } from '@xihan-ui/core'
import { afterEach, describe, expect, it } from 'vitest'
import { defineXhElements } from '../../src/define'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

defineXhElements()

interface SideNavElement extends HTMLElement {
  collection: Array<{ value: string, children: Array<{ value: string }> }>
}

async function settle(): Promise<void> {
  await Promise.resolve()
  await new Promise(resolve => requestAnimationFrame(resolve))
  await Promise.resolve()
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

/**
 * 浮层展开即把 positioner 整段搬进 Portal 目标（body 末尾的 portal 落点），content / branch-content
 * 不再在宿主子树里；按 scope + part（外加调用方给的限定）在整个文档里取，一次只挂一个宿主，取到的就是它的。
 */
function portalPart(scope: 'pagination' | 'side-nav', part: 'content' | 'branch-content', qualifier = ''): HTMLElement {
  const matches = document.querySelectorAll<HTMLElement>(`[data-scope="${scope}"][data-part="${part}"]${qualifier}`)
  if (matches.length !== 1)
    throw new Error(`找不到唯一的 ${scope} ${part}${qualifier}，命中 ${matches.length} 个`)
  return matches[0]!
}

afterEach(() => {
  document.body.innerHTML = ''
})

describe('wc 特殊浮层真实退场资源', () => {
  it('pagination 省略位退出完成前保留 Layer，逻辑关闭立即失活', async () => {
    installLongExit('pagination', 'content')
    const host = document.createElement('div')
    host.innerHTML = `<xh-pagination count="2000" default-page="100">
      <nav data-xh-part="root">
        <button data-xh-part="item" value="100">100</button>
        <button data-xh-part="ellipsis-trigger" side="start">更多</button>
        <div data-xh-part="positioner"><div data-xh-part="content"></div></div>
      </nav>
    </xh-pagination>`
    document.body.append(host)
    await settle()
    const trigger = host.querySelector<HTMLElement>('[data-xh-part="ellipsis-trigger"]')!
    trigger.click()
    await settle()
    expect(getLayerRegistry(document).list()).toHaveLength(1)

    trigger.click()
    await settle()
    const content = portalPart('pagination', 'content')
    expect(content.inert).toBe(true)
    expect(content.getAttribute('aria-hidden')).toBe('true')
    expect(getLayerRegistry(document).list()).toHaveLength(1)
    finite(content)[0]!.finish()
    await settle()
    expect(getLayerRegistry(document).list()).toHaveLength(0)
  })

  it('side-nav 换枝时保留两份资源，旧退出就绪后等待栈顶再安全释放', async () => {
    installLongExit('side-nav', 'branch-content')
    const host = document.createElement('div')
    host.innerHTML = `<xh-side-nav collapsed>
      <nav data-xh-part="root"><ul data-xh-part="list">
        <li data-xh-part="branch" value="products">
          <button data-xh-part="branch-trigger">产品</button>
          <div data-xh-part="positioner"><ul data-xh-part="branch-content"><li data-xh-part="item"><a data-xh-part="link" value="product-a">产品一</a></li></ul></div>
        </li>
        <li data-xh-part="branch" value="docs">
          <button data-xh-part="branch-trigger">文档</button>
          <div data-xh-part="positioner"><ul data-xh-part="branch-content"><li data-xh-part="item"><a data-xh-part="link" value="doc-a">文档一</a></li></ul></div>
        </li>
      </ul></nav>
    </xh-side-nav>`
    document.body.append(host)
    const element = host.querySelector<SideNavElement>('xh-side-nav')!
    element.collection = [
      { value: 'products', children: [{ value: 'product-a' }] },
      { value: 'docs', children: [{ value: 'doc-a' }] },
    ]
    await settle()
    const productsTrigger = element.querySelector<HTMLElement>('[data-part="branch-trigger"][data-value="products"]')!
    const docsTrigger = element.querySelector<HTMLElement>('[data-part="branch-trigger"][data-value="docs"]')!
    productsTrigger.click()
    await settle()
    expect(getLayerRegistry(document).list()).toHaveLength(1)

    docsTrigger.click()
    await settle()
    const products = portalPart('side-nav', 'branch-content', '[id$="content-products"]')
    expect(products.inert).toBe(true)
    expect(products.getAttribute('aria-hidden')).toBe('true')
    expect(getLayerRegistry(document).list()).toHaveLength(2)
    finite(products)[0]!.finish()
    await settle()
    expect(getLayerRegistry(document).list()).toHaveLength(2)

    docsTrigger.click()
    await settle()
    const docs = portalPart('side-nav', 'branch-content', '[id$="content-docs"]')
    expect(docs.inert).toBe(true)
    finite(docs)[0]!.finish()
    await settle()
    expect(getLayerRegistry(document).list()).toHaveLength(0)
  })
})
