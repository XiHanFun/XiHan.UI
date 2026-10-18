// 通知条目的标题文案写在 title-text 上：宿主不带 HTML 全局属性 title，悬停不出浏览器原生提示，
// 无障碍树里也不会因此多出一段以标题为内容的描述；卡片的名字取标题部件，描述取说明部件。
// 原先的 title 不再当配置：写了也不填进标题部件。无障碍树只在 Chromium 里可信，经 CDP 取。
import { afterEach, beforeAll, describe, expect, it } from 'vitest'
import { cdp } from 'vitest/browser'
import { defineXhElements } from '../../src/define'
import { createNotificationService } from '../../src/services'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

defineXhElements()

beforeAll(async () => {
  await cdp().send('Accessibility.enable' as never)
})

interface AXNode {
  readonly ignored?: boolean
  readonly role?: { readonly value?: string }
  readonly name?: { readonly value?: string }
  readonly description?: { readonly value?: string }
}

interface DOMNode {
  readonly nodeId: number
  readonly frameId?: string
  readonly contentDocument?: DOMNode
  readonly children?: readonly DOMNode[]
}

async function settle(): Promise<void> {
  for (let i = 0; i < 3; i++) {
    await Promise.resolve()
    await new Promise(resolve => requestAnimationFrame(resolve))
  }
}

/** 用例所在的那一帧：用例跑在 iframe 里，CDP 会话连的是外层页面，按本文档根上的记号找出它的帧 id。 */
async function testFrameId(): Promise<string | undefined> {
  const marker = `ax-${Math.random().toString(36).slice(2)}`
  document.documentElement.setAttribute('data-ax-frame', marker)
  const { root } = await cdp().send('DOM.getDocument', { depth: -1, pierce: true }) as { root: DOMNode }
  const docs: { doc: number, frameId?: string }[] = [{ doc: root.nodeId }]
  const walk = (node: DOMNode): void => {
    if (node.contentDocument) {
      docs.push({ doc: node.contentDocument.nodeId, frameId: node.frameId })
      walk(node.contentDocument)
    }
    for (const child of node.children ?? [])
      walk(child)
  }
  walk(root)
  for (const candidate of docs) {
    const { nodeId } = await cdp().send('DOM.querySelector', { nodeId: candidate.doc, selector: `[data-ax-frame="${marker}"]` }) as { nodeId: number }
    if (nodeId)
      return candidate.frameId
  }
  throw new Error('无障碍树里找不到用例所在的文档')
}

/** 用例所在那一帧的整棵无障碍树里没被忽略的节点：角色、名字与描述。 */
async function axNodes(): Promise<{ role: string, name: string, description: string }[]> {
  const frameId = await testFrameId()
  const { nodes } = await cdp().send('Accessibility.getFullAXTree' as never, (frameId ? { frameId } : {}) as never) as { nodes: AXNode[] }
  return nodes
    .filter(node => !node.ignored)
    .map(node => ({ role: node.role?.value ?? '', name: node.name?.value ?? '', description: node.description?.value ?? '' }))
}

function mount(attrs: string): HTMLElement {
  const host = document.createElement('div')
  host.innerHTML = `
    <xh-notification-item ${attrs} description="草稿已同步到云端" duration="0">
      <div data-xh-part="item">
        <span data-xh-part="item-indicator"></span>
        <div data-xh-part="item-content">
          <div data-xh-part="item-title"></div>
          <div data-xh-part="item-description"></div>
        </div>
        <button data-xh-part="item-close-trigger"></button>
      </div>
    </xh-notification-item>
  `
  document.body.append(host)
  return host.firstElementChild as HTMLElement
}

function part(name: string): HTMLElement {
  return document.querySelector<HTMLElement>(`[data-scope='notification'][data-part='${name}']`)!
}

afterEach(() => {
  document.body.replaceChildren()
})

describe('xh-notification-item 的 title-text', () => {
  it('标题写在 title-text 上：宿主不带 title，卡片以标题为名、以说明为描述，树里没有以标题为内容的描述', async () => {
    const element = mount('title-text="已保存"')
    await settle()

    expect(element.hasAttribute('title')).toBe(false)
    expect(element.title).toBe('')
    expect(part('item-title').textContent).toBe('已保存')
    const nodes = await axNodes()
    expect(nodes.filter(node => node.role === 'status')).toEqual([{ role: 'status', name: '已保存', description: '草稿已同步到云端' }])
    expect(nodes.filter(node => node.description === '已保存')).toEqual([])
  })

  it('改 titleText 就地换标题，宿主照旧不带 title', async () => {
    const element = mount('title-text="上传中"') as HTMLElement & { titleText?: string }
    await settle()
    element.titleText = '上传完成'
    await settle()

    expect(element.hasAttribute('title')).toBe(false)
    expect(part('item-title').textContent).toBe('上传完成')
    expect((await axNodes()).filter(node => node.role === 'status').map(node => node.name)).toEqual(['上传完成'])
  })

  it('title 不再当配置：写了不填进标题部件，留在宿主上只是作者自己的原生提示', async () => {
    const element = mount('title="旧写法"')
    await settle()

    expect(element.getAttribute('title')).toBe('旧写法')
    expect(part('item-title').textContent).toBe('')
  })
})

describe('通知服务', () => {
  it('服务铺出的条目以标题为名，宿主不带 title', async () => {
    const notify = createNotificationService()
    try {
      notify.success('已复制', { description: '链接已放进剪贴板', duration: 0 })
      await settle()

      expect([...document.querySelectorAll('xh-notification-item')].map(item => item.getAttribute('title'))).toEqual([null])
      const nodes = await axNodes()
      expect(nodes.filter(node => node.role === 'status').map(node => [node.name, node.description])).toEqual([['已复制', '链接已放进剪贴板']])
      expect(nodes.filter(node => node.description === '已复制')).toEqual([])
    }
    finally {
      notify.dispose()
    }
  })
})
