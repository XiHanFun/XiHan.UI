// 逐个节点不可拖动：收件箱写了 draggable: false。真实鼠标按住它拖到回收站上，不起拖、不报搬家；
// 把回收站拖到收件箱那一行的中段，照样放进它里面——它自己拖不动，照样是落点。
import type { TreeMove, TreeNode } from '@xihan-ui/headless'
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
  { value: 'inbox', label: '收件箱', draggable: false, children: [{ value: 'quote', label: '报价单' }] },
  { value: 'archive', label: '归档', children: [] },
  { value: 'trash', label: '回收站' },
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

/** 按住 from 的中心，分十步拖到 to 的中心，松开。 */
async function drag(from: HTMLElement, to: HTMLElement): Promise<void> {
  const scale = await mouseScale()
  const at = (x: number, y: number) => ({ x: x / scale, y: y / scale })
  const a = from.getBoundingClientRect()
  const b = to.getBoundingClientRect()
  const start = { x: a.left + 40, y: a.top + a.height / 2 }
  const end = { x: b.left + 40, y: b.top + b.height / 2 }
  await cdp().send('Input.dispatchMouseEvent', { type: 'mouseMoved', ...at(start.x, start.y) })
  await cdp().send('Input.dispatchMouseEvent', { type: 'mousePressed', button: 'left', clickCount: 1, ...at(start.x, start.y) })
  for (let i = 1; i <= 10; i++) {
    await frames(1)
    await cdp().send('Input.dispatchMouseEvent', { type: 'mouseMoved', button: 'left', ...at(start.x + ((end.x - start.x) * i) / 10, start.y + ((end.y - start.y) * i) / 10) })
  }
  await frames(1)
  await cdp().send('Input.dispatchMouseEvent', { type: 'mouseReleased', button: 'left', clickCount: 1, ...at(end.x, end.y) })
  await frames(3)
}

/** 分支拖的是它那一行（branch-control），叶子拖的是 item。 */
function rowOf(value: string): HTMLElement {
  const branch = document.querySelector<HTMLElement>(`[data-scope='tree'][data-part='branch'][data-value='${value}'] [data-part='branch-control']`)
  return branch ?? document.querySelector<HTMLElement>(`[data-scope='tree'][data-part='item'][data-value='${value}']`)!
}

async function mount(): Promise<TreeMove[]> {
  const moves: TreeMove[] = []
  document.body.innerHTML = '<div style="inline-size: 320px"><xh-tree node-draggable aria-label="文件夹"><div data-xh-part="tree"><div data-xh-part="branch" value="inbox"><div data-xh-part="branch-control"><button data-xh-part="branch-trigger"></button><span data-xh-part="branch-text">收件箱</span></div><div data-xh-part="branch-content"><div data-xh-part="item" value="quote"><span data-xh-part="item-text">报价单</span></div></div></div><div data-xh-part="branch" value="archive"><div data-xh-part="branch-control"><button data-xh-part="branch-trigger"></button><span data-xh-part="branch-text">归档</span></div><div data-xh-part="branch-content"></div></div><div data-xh-part="item" value="trash"><span data-xh-part="item-text">回收站</span></div></div><div data-xh-part="live-region"></div></xh-tree></div>'
  const tree = document.querySelector('xh-tree') as HTMLElement & { collection: TreeNode[], defaultExpandedValue: string[], updateComplete: Promise<unknown> }
  tree.collection = COLLECTION
  tree.defaultExpandedValue = ['inbox']
  tree.addEventListener('node-move', event => moves.push((event as CustomEvent<TreeMove>).detail))
  await tree.updateComplete
  await frames()
  return moves
}

describe('树的逐个节点不可拖动（Web Components）', () => {
  it('按住写了 draggable: false 的收件箱拖到回收站上：不起拖、不报搬家', async () => {
    const moves = await mount()
    expect(rowOf('inbox').hasAttribute('data-draggable')).toBe(false)
    expect(rowOf('trash').hasAttribute('data-draggable')).toBe(true)
    await drag(rowOf('inbox'), rowOf('trash'))
    expect(moves).toEqual([])
  })

  it('把回收站拖到收件箱那一行的中段：照样放进它里面', async () => {
    const moves = await mount()
    await drag(rowOf('trash'), rowOf('inbox'))
    expect(moves).toEqual([{ value: 'trash', parent: 'inbox', index: 1 }])
  })
})
