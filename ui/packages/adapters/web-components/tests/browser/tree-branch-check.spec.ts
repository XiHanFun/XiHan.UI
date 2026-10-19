// 分支行也摆 item-indicator：选中的分支与选中的叶子一样在行尾亮出对号（真实鼠标点行，量对号的不透明度）。
import type { TreeNode } from '@xihan-ui/headless'
import { afterEach, describe, expect, it } from 'vitest'
import { cdp } from 'vitest/browser'
import { defineXhElements } from '../../src/define'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

defineXhElements()

afterEach(() => {
  document.body.replaceChildren()
})

const COLLECTION: TreeNode[] = [
  { value: 'pages', label: '页面', children: [{ value: 'header', label: '页眉' }, { value: 'body', label: '正文' }] },
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

/** 等对号的淡入淡出播完。 */
async function settle(): Promise<void> {
  await frames()
  await Promise.all(document.getAnimations().map(animation => animation.finished.catch(() => {})))
  await frames()
}

async function mouseScale(): Promise<number> {
  const seen = new Promise<number>(resolve => document.addEventListener('pointermove', event => resolve(event.clientX / 20), { once: true }))
  await cdp().send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 20, y: 20 })
  return seen
}

/** 真实鼠标点这一行的文字。 */
async function clickRow(row: HTMLElement): Promise<void> {
  const scale = await mouseScale()
  const box = row.querySelector('[data-xh-part="branch-text"], [data-xh-part="item-text"]')!.getBoundingClientRect()
  const point = { x: (box.left + box.width / 2) / scale, y: (box.top + box.height / 2) / scale }
  await cdp().send('Input.dispatchMouseEvent', { type: 'mouseMoved', ...point })
  await cdp().send('Input.dispatchMouseEvent', { type: 'mousePressed', button: 'left', clickCount: 1, ...point })
  await cdp().send('Input.dispatchMouseEvent', { type: 'mouseReleased', button: 'left', clickCount: 1, ...point })
  await settle()
}

/** 分支点的是它那一行（branch-control），叶子点的是 item。 */
function rowOf(value: string): HTMLElement {
  const branch = document.querySelector<HTMLElement>(`[data-scope='tree'][data-part='branch'][data-value='${value}'] > [data-part='branch-control']`)
  return branch ?? document.querySelector<HTMLElement>(`[data-scope='tree'][data-part='item'][data-value='${value}']`)!
}

/** 每一行行尾对号的不透明度，按文档序。 */
function checks(): Record<string, number> {
  const out: Record<string, number> = {}
  for (const value of ['pages', 'header', 'body', 'styles'])
    out[value] = Number(getComputedStyle(rowOf(value).querySelector('[data-part="item-indicator"]')!).opacity)
  return out
}

describe('树的分支行对号（Web Components）', () => {
  it('分支行摆的 item-indicator 跟着分支的选中亮起与熄灭，与叶子行一样', async () => {
    document.body.innerHTML = '<div style="inline-size: 320px"><xh-tree selection-mode="multiple" aria-label="页面结构"><div data-xh-part="tree"><div data-xh-part="branch" value="pages"><div data-xh-part="branch-control"><button data-xh-part="branch-trigger"></button><span data-xh-part="branch-text">页面</span><span data-xh-part="item-indicator"></span></div><div data-xh-part="branch-content"><div data-xh-part="item" value="header"><span data-xh-part="item-text">页眉</span><span data-xh-part="item-indicator"></span></div><div data-xh-part="item" value="body"><span data-xh-part="item-text">正文</span><span data-xh-part="item-indicator"></span></div></div></div><div data-xh-part="item" value="styles"><span data-xh-part="item-text">样式</span><span data-xh-part="item-indicator"></span></div></div></xh-tree></div>'
    const tree = document.querySelector('xh-tree') as HTMLElement & { collection: TreeNode[], defaultExpandedValue: string[], updateComplete: Promise<unknown> }
    tree.collection = COLLECTION
    tree.defaultExpandedValue = ['pages']
    await tree.updateComplete
    await settle()
    expect(checks()).toEqual({ pages: 0, header: 0, body: 0, styles: 0 })
    await clickRow(rowOf('pages'))
    await clickRow(rowOf('styles'))
    expect(checks()).toEqual({ pages: 1, header: 0, body: 0, styles: 1 })
    expect(rowOf('pages').closest('[role="treeitem"]')!.getAttribute('aria-selected')).toBe('true')
    await clickRow(rowOf('pages'))
    expect(checks()).toEqual({ pages: 0, header: 0, body: 0, styles: 1 })
  })
})
