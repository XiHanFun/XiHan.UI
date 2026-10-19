// 选择模式 extended：真实鼠标裸点击换选、按住 Ctrl 点击加选与取消、按住 Shift 点击从锚点选一段；
// 真实键盘确认键换成焦点节点、Ctrl+Space 只切换焦点节点。
import type { TreeNode, TreeSelectionChangeDetails } from '@xihan-ui/headless'
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { cdp, userEvent } from 'vitest/browser'
import { createApp, h } from 'vue'
import { XhTreeBranch, XhTreeBranchContent, XhTreeBranchControl, XhTreeBranchText, XhTreeBranchTrigger, XhTreeItem, XhTreeItemText, XhTreeRoot, XhTreeTree } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

afterEach(() => {
  app?.unmount()
  host?.remove()
  app = null
  host = null
})

const COLLECTION: TreeNode[] = [
  { value: 'pages', label: '页面', children: [{ value: 'header', label: '页眉' }, { value: 'body', label: '正文' }, { value: 'footer', label: '页脚' }] },
  { value: 'styles', label: '样式' },
]

function frames(count = 2): Promise<void> {
  return new Promise<void>((resolve) => {
    const step = (left: number): void => {
      if (left === 0)
        resolve()
      else requestAnimationFrame(() => step(left - 1))
    }
    step(count)
  })
}

async function mouseScale(): Promise<number> {
  const seen = new Promise<number>(resolve => document.addEventListener('pointermove', event => resolve(event.clientX / 20), { once: true }))
  await cdp().send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 20, y: 20 })
  return seen
}

/** CDP 修饰键位：Alt 1、Ctrl 2、Meta 4、Shift 8。 */
const CTRL = 2
const SHIFT = 8

/** 真实鼠标按修饰键点 el 那一行的左段。 */
async function clickRow(el: HTMLElement, modifiers = 0): Promise<void> {
  const scale = await mouseScale()
  const box = el.getBoundingClientRect()
  const point = { x: (box.left + 40) / scale, y: (box.top + box.height / 2) / scale }
  await cdp().send('Input.dispatchMouseEvent', { type: 'mouseMoved', modifiers, ...point })
  await cdp().send('Input.dispatchMouseEvent', { type: 'mousePressed', button: 'left', clickCount: 1, modifiers, ...point })
  await cdp().send('Input.dispatchMouseEvent', { type: 'mouseReleased', button: 'left', clickCount: 1, modifiers, ...point })
  await frames()
}

/** 分支点的是它那一行（branch-control），叶子点的是 item。 */
function rowOf(value: string): HTMLElement {
  const branch = document.querySelector<HTMLElement>(`[data-scope='tree'][data-part='branch'][data-value='${value}'] [data-part='branch-control']`)
  return branch ?? document.querySelector<HTMLElement>(`[data-scope='tree'][data-part='item'][data-value='${value}']`)!
}

/** 此刻报 aria-selected=true 的节点，按文档顺序。 */
function selectedNodes(): string[] {
  return [...document.querySelectorAll<HTMLElement>(`[data-scope='tree'][role='treeitem'][aria-selected='true']`)].map(el => el.getAttribute('data-value')!)
}

async function mount(): Promise<string[][]> {
  const changes: string[][] = []
  host = document.createElement('div')
  host.style.inlineSize = '320px'
  document.body.append(host)
  const leaf = (value: string, text: string) => h(XhTreeItem, { value }, () => h(XhTreeItemText, null, () => text))
  app = createApp({
    render: () => h(XhTreeRoot, {
      'collection': COLLECTION,
      'selectionMode': 'extended',
      'defaultExpandedValue': ['pages'],
      'aria-label': '页面结构',
      'onSelectionChange': (details: TreeSelectionChangeDetails) => changes.push(details.value),
    }, () => [
      h(XhTreeTree, null, () => [
        h(XhTreeBranch, { value: 'pages' }, () => [
          h(XhTreeBranchControl, null, () => [h(XhTreeBranchTrigger), h(XhTreeBranchText, null, () => '页面')]),
          h(XhTreeBranchContent, null, () => [leaf('header', '页眉'), leaf('body', '正文'), leaf('footer', '页脚')]),
        ]),
        leaf('styles', '样式'),
      ]),
    ]),
  })
  app.mount(host)
  await frames()
  return changes
}

describe('树的选择模式 extended（Vue）', () => {
  it('真实鼠标：裸点击换选，按住 Ctrl 点击加选与取消，按住 Shift 点击从锚点选一段', async () => {
    const changes = await mount()
    expect(document.querySelector(`[data-scope='tree'][role='tree']`)!.getAttribute('aria-multiselectable')).toBe('true')
    await clickRow(rowOf('header'))
    await clickRow(rowOf('styles'), CTRL)
    expect(selectedNodes()).toEqual(['header', 'styles'])
    await clickRow(rowOf('header'), CTRL)
    expect(selectedNodes()).toEqual(['styles'])
    // 按住 Ctrl 点击把锚点挪到页脚：页脚到正文那一段整份替换，锚点不动
    await clickRow(rowOf('footer'), CTRL)
    expect(selectedNodes()).toEqual(['footer', 'styles'])
    await clickRow(rowOf('body'), SHIFT)
    expect(selectedNodes()).toEqual(['body', 'footer'])
    await clickRow(rowOf('styles'), SHIFT)
    expect(selectedNodes()).toEqual(['footer', 'styles'])
    await clickRow(rowOf('header'))
    expect(selectedNodes()).toEqual(['header'])
    expect(changes.at(-1)).toEqual(['header'])
  })

  it('真实键盘：确认键换成焦点节点，Ctrl+Space 只切换焦点节点', async () => {
    const changes = await mount()
    await clickRow(rowOf('header'))
    await userEvent.keyboard('{ArrowDown}')
    expect(document.activeElement?.getAttribute('data-value')).toBe('body')
    await userEvent.keyboard('{Control>} {/Control}')
    await frames()
    expect(selectedNodes()).toEqual(['header', 'body'])
    await userEvent.keyboard('{ArrowDown}{Control>} {/Control}')
    await frames()
    expect(selectedNodes()).toEqual(['header', 'body', 'footer'])
    await userEvent.keyboard('{Enter}')
    await frames()
    expect(selectedNodes()).toEqual(['footer'])
    expect(changes.at(-1)).toEqual(['footer'])
  })
})
