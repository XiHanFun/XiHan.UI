// 叶子行的说明落在名称下面一行（文档站「条目说明」示例的作者结构）：窄容器里不和名称挤在一行，也不把树撑出横向滚动。
import { afterEach, beforeAll, describe, expect, it } from 'vitest'
import demo from '../../../../../../docs/.vitepress/demos/tree/17-item-description.html?raw'
import { defineXhElements } from '../../src/define'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

beforeAll(() => defineXhElements())

let stage: HTMLElement | null = null

afterEach(() => {
  stage?.remove()
  stage = null
})

async function mountDemo(): Promise<HTMLElement> {
  stage = document.createElement('div')
  stage.style.inlineSize = '200px'
  // innerHTML 不执行脚本：示例脚本里给的 collection 与展开值在这里照样给一遍
  stage.innerHTML = demo.replace(/<script[\s\S]*<\/script>/, '')
  document.body.append(stage)
  const tree = stage.querySelector('xh-tree') as HTMLElement & { collection: unknown, defaultExpandedValue: string[], updateComplete: Promise<unknown> }
  tree.collection = [{
    value: 'order',
    label: '订单',
    children: [
      { value: 'no', label: '订单号', description: '系统生成的唯一编号，打印在单据抬头与条码里' },
      { value: 'date', label: '下单日期', description: '按下单时所在时区记' },
      { value: 'amount', label: '实付金额' },
    ],
  }]
  tree.defaultExpandedValue = ['order']
  await tree.updateComplete
  await new Promise(resolve => requestAnimationFrame(resolve))
  return stage
}

function row(root: HTMLElement, value: string): HTMLElement {
  return root.querySelector<HTMLElement>(`[data-scope="tree"][data-part="item"][value="${value}"]`)!
}

function part(item: HTMLElement, name: string): HTMLElement {
  return item.querySelector<HTMLElement>(`[data-scope="tree"][data-part="${name}"]`)!
}

describe('xh-tree 叶子行的说明', () => {
  it('说明落在名称下面一行，与名称同一起点', async () => {
    const root = await mountDemo()
    const item = row(root, 'no')
    const text = part(item, 'item-text').getBoundingClientRect()
    const description = part(item, 'item-description').getBoundingClientRect()
    expect(description.top).toBeGreaterThanOrEqual(text.bottom - 1)
    expect(Math.abs(description.left - text.left)).toBeLessThanOrEqual(1)
  })

  it('窄容器里说明截断，不把行与树撑出横向滚动', async () => {
    const root = await mountDemo()
    const tree = root.querySelector<HTMLElement>('[data-scope="tree"][data-part="tree"]')!
    const item = row(root, 'no')
    expect(tree.scrollWidth).toBeLessThanOrEqual(tree.clientWidth)
    expect(item.scrollWidth).toBeLessThanOrEqual(item.clientWidth)
    expect(part(item, 'item-description').getBoundingClientRect().right).toBeLessThanOrEqual(item.getBoundingClientRect().right + 0.5)
  })

  it('没写说明的行仍是一行高', async () => {
    const root = await mountDemo()
    const plain = row(root, 'amount').getBoundingClientRect().height
    const branch = root.querySelector<HTMLElement>('[data-scope="tree"][data-part="branch-control"]')!.getBoundingClientRect().height
    expect(Math.abs(plain - branch)).toBeLessThanOrEqual(1)
    expect(row(root, 'no').getBoundingClientRect().height).toBeGreaterThan(plain)
  })
})
