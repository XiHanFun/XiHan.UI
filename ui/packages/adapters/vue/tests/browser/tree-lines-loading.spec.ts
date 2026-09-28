// 树的缩进参考线与节点级加载态：参考线落在父节点展开箭头的中线上、贯穿这一层子节点；
// 取子节点在途的分支，展开箭头换成转圈，减弱动效下停住。几何与动画只有真实浏览器量得出来。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import {
  XhTreeBranch,
  XhTreeBranchContent,
  XhTreeBranchControl,
  XhTreeBranchText,
  XhTreeBranchTrigger,
  XhTreeItem,
  XhTreeItemText,
  XhTreeRoot,
  XhTreeTree,
} from '../../src'
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

const COLLECTION = [
  { value: 'src', label: 'src', children: [{ value: 'a', label: 'a.ts' }, { value: 'b', label: 'b.ts' }] },
]

async function mount(props: Record<string, unknown>, motion?: 'reduce'): Promise<void> {
  host = document.createElement('div')
  if (motion)
    host.dataset.motion = motion
  host.style.inlineSize = '320px'
  document.body.append(host)
  app = createApp({
    render: () => h(XhTreeRoot, { collection: COLLECTION, defaultExpandedValue: ['src'], ...props }, () => h(XhTreeTree, null, () => [
      h(XhTreeBranch, { value: 'src' }, () => [
        h(XhTreeBranchControl, null, () => [h(XhTreeBranchTrigger), h(XhTreeBranchText, null, () => 'src')]),
        h(XhTreeBranchContent, null, () => COLLECTION[0]!.children.map(child =>
          h(XhTreeItem, { key: child.value, value: child.value }, () => h(XhTreeItemText, null, () => child.label)),
        )),
      ]),
    ])),
  })
  app.mount(host)
  await nextTick()
}

function part(name: string): HTMLElement {
  const element = host!.querySelector<HTMLElement>(`[data-scope="tree"][data-part="${name}"]`)
  if (!element)
    throw new Error(`缺少 tree 部件：${name}`)
  return element
}

describe('tree 缩进参考线', () => {
  it('lines 打开后子层画出一道竖线，落在父节点展开箭头的中线上、贯穿整层', async () => {
    await mount({ lines: true })
    const content = part('branch-content')
    const line = getComputedStyle(content, '::before')
    expect(line.content).not.toBe('none')
    const trigger = part('branch-trigger').getBoundingClientRect()
    const contentRect = content.getBoundingClientRect()
    const center = trigger.left + trigger.width / 2
    const lineLeft = contentRect.left + Number.parseFloat(line.insetInlineStart)
    const lineWidth = Number.parseFloat(line.inlineSize)
    expect(Math.abs(lineLeft + lineWidth / 2 - center)).toBeLessThanOrEqual(0.5)
    expect(Number.parseFloat(line.blockSize)).toBeCloseTo(contentRect.height, 0)
  })

  it('不写 lines 不画线', async () => {
    await mount({})
    expect(getComputedStyle(part('branch-content'), '::before').content).toBe('none')
  })
})

describe('tree 节点级加载态', () => {
  it('在途的分支报告 aria-busy，展开箭头换成转圈且不再按开合转向', async () => {
    await mount({ loadingValue: ['src'] })
    expect(part('branch').getAttribute('aria-busy')).toBe('true')
    const trigger = part('branch-trigger')
    expect(getComputedStyle(trigger).rotate).toBe('none')
    expect(getComputedStyle(trigger, '::before').animationName).toBe('xh-spin')
  })

  it('减弱动效：转圈停下，静止字形仍在', async () => {
    await mount({ loadingValue: ['src'] }, 'reduce')
    const glyph = getComputedStyle(part('branch-trigger'), '::before')
    expect(glyph.animationName).toBe('none')
    expect(glyph.content).not.toBe('none')
  })
})
