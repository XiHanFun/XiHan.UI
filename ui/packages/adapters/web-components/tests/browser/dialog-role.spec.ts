// 对话框与抽屉的语义角色写在 dialog-role 上、落在 content 上：宿主不带 role，读屏不会把宿主和里面的触发钮当成对话框。
// 无障碍树只在 Chromium 里可信，经 CDP 取；对话框服务关掉之后树里也不剩没有名字的对话框。
import { afterEach, beforeAll, describe, expect, it } from 'vitest'
import { cdp } from 'vitest/browser'
import { defineXhElements } from '../../src/define'
import { createDialogService } from '../../src/services'
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
}

const DIALOG_ROLES = ['dialog', 'alertdialog']

async function settle(): Promise<void> {
  await Promise.resolve()
  await new Promise(resolve => requestAnimationFrame(resolve))
  await new Promise(resolve => requestAnimationFrame(resolve))
  await Promise.resolve()
}

interface DOMNode {
  readonly nodeId: number
  readonly frameId?: string
  readonly contentDocument?: DOMNode
  readonly children?: readonly DOMNode[]
}

/**
 * 用例所在的那一帧：用例跑在 iframe 里，CDP 会话连的是外层页面。
 * 给本文档根打一个记号，在穿透各帧的文档树里找出带记号的那一份文档，交出它的节点 id 与帧 id。
 */
async function testFrame(): Promise<{ readonly doc: number, readonly frameId?: string }> {
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
      return candidate
  }
  throw new Error('无障碍树里找不到用例所在的文档')
}

/** 选择器命中的元素与它在无障碍树里的各层祖先的角色，由近及远；被忽略的层不算。 */
async function axRoles(selector: string): Promise<string[]> {
  const frame = await testFrame()
  const { nodeId } = await cdp().send('DOM.querySelector', { nodeId: frame.doc, selector }) as { nodeId: number }
  const { node } = await cdp().send('DOM.describeNode', { nodeId }) as { node: { backendNodeId: number } }
  const { nodes } = await cdp().send('Accessibility.getAXNodeAndAncestors' as never, { backendNodeId: node.backendNodeId } as never) as { nodes: AXNode[] }
  return nodes.filter(node => !node.ignored).map(node => node.role?.value ?? '')
}

/** 用例所在那一帧的整棵无障碍树里角色是对话框的节点：角色与名字。 */
async function axDialogs(): Promise<{ role: string, name: string }[]> {
  const frame = await testFrame()
  const { nodes } = await cdp().send('Accessibility.getFullAXTree' as never, (frame.frameId ? { frameId: frame.frameId } : {}) as never) as { nodes: AXNode[] }
  return nodes
    .filter(node => !node.ignored && DIALOG_ROLES.includes(node.role?.value ?? ''))
    .map(node => ({ role: node.role!.value!, name: node.name?.value ?? '' }))
}

function mount(tag: 'xh-dialog' | 'xh-drawer'): HTMLElement {
  const host = document.createElement('div')
  host.innerHTML = `
    <${tag} dialog-role="alertdialog">
      <button data-xh-part="trigger" data-ax="trigger">删除项目</button>
      <div data-xh-part="backdrop"></div>
      <div data-xh-part="positioner">
        <div data-xh-part="content">
          <h2 data-xh-part="title">确认删除</h2>
          <button data-xh-part="close-trigger" data-ax="close">取消</button>
        </div>
      </div>
    </${tag}>
  `
  document.body.append(host)
  return host.firstElementChild as HTMLElement
}

afterEach(() => {
  document.body.replaceChildren()
})

describe.each(['xh-dialog', 'xh-drawer'] as const)('%s 的 dialog-role', (tag) => {
  it('宿主不带 role，收起时触发钮不在任何对话框里；打开后 content 是有名字的警示对话框', async () => {
    const element = mount(tag)
    await settle()
    expect(element.hasAttribute('role')).toBe(false)
    expect((await axRoles('[data-ax="trigger"]')).filter(role => DIALOG_ROLES.includes(role))).toEqual([])
    expect(await axDialogs()).toEqual([])

    ;(element as HTMLElement & { open?: boolean }).open = true
    await settle()
    expect(element.hasAttribute('role')).toBe(false)
    const content = document.querySelector(`[data-part='content'][data-scope='${tag.slice(3)}']`)!
    expect(content.getAttribute('role')).toBe('alertdialog')
    expect((await axRoles('[data-ax="close"]')).filter(role => DIALOG_ROLES.includes(role))).toEqual(['alertdialog'])
    expect(await axDialogs()).toEqual([{ role: 'alertdialog', name: '确认删除' }])
  })
})

describe('对话框服务', () => {
  it('确认框关掉后宿主不带 role，树里不剩没有名字的对话框', async () => {
    const service = createDialogService()
    const pending = service.confirm({ title: '确认删除' })
    await settle()
    expect(await axDialogs()).toEqual([{ role: 'alertdialog', name: '确认删除' }])
    const ok = [...document.querySelectorAll<HTMLElement>('[data-scope="button"][data-part="root"]')].at(-1)!
    ok.click()
    await pending
    await settle()
    expect([...document.querySelectorAll('xh-dialog')].map(dialog => dialog.getAttribute('role'))).toEqual([null])
    expect(await axDialogs()).toEqual([])
  })
})
