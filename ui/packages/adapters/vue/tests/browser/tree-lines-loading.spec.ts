// 树的连接线与节点级加载态：竖线落在父节点展开箭头的中线上，每个子节点横出一段接到行首（├），
// 最后一个子节点止于行中线（└），展开着的非末位分支由子层把竖线接过整棵子树；
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

/**
 * 连接线的夹具：顶层分支 src 下挂一个展开着的非末位分支 components（两个叶子）和一个末位叶子 main。
 */
async function mountNested(props: Record<string, unknown>): Promise<void> {
  host = document.createElement('div')
  host.style.inlineSize = '320px'
  document.body.append(host)
  const leaf = (value: string, label: string) => h(XhTreeItem, { key: value, value }, () => h(XhTreeItemText, null, () => label))
  app = createApp({
    render: () => h(XhTreeRoot, { defaultExpandedValue: ['src', 'components'], ...props }, () => h(XhTreeTree, null, () => [
      h(XhTreeBranch, { value: 'src' }, () => [
        h(XhTreeBranchControl, null, () => [h(XhTreeBranchTrigger), h(XhTreeBranchText, null, () => 'src')]),
        h(XhTreeBranchContent, null, () => [
          h(XhTreeBranch, { value: 'components' }, () => [
            h(XhTreeBranchControl, null, () => [h(XhTreeBranchTrigger), h(XhTreeBranchText, null, () => 'components')]),
            h(XhTreeBranchContent, null, () => [leaf('button', 'Button.vue'), leaf('dialog', 'Dialog.vue')]),
          ]),
          leaf('main', 'main.ts'),
        ]),
      ]),
    ])),
  })
  app.mount(host)
  await nextTick()
}

function node(value: string): HTMLElement {
  const element = host!.querySelector<HTMLElement>(`[data-scope="tree"][data-value="${value}"]`)
  if (!element)
    throw new Error(`缺少节点：${value}`)
  return element
}

function child(element: HTMLElement, name: string): HTMLElement {
  const found = element.querySelector<HTMLElement>(`:scope > [data-scope="tree"][data-part="${name}"]`)
  if (!found)
    throw new Error(`缺少部件：${name}`)
  return found
}

interface Box { left: number, top: number, right: number, bottom: number, borderStart: number, borderEnd: number }

/** 伪元素的边框盒（页面坐标）：绝对定位的伪元素按宿主的内边距盒定位，计算样式给出的是用值。 */
function pseudoBox(element: HTMLElement, which: '::before' | '::after'): Box {
  const style = getComputedStyle(element, which)
  const hostStyle = getComputedStyle(element)
  const rect = element.getBoundingClientRect()
  const px = (value: string) => Number.parseFloat(value) || 0
  const borderBox = style.boxSizing === 'border-box'
  const width = px(style.width) + (borderBox ? 0 : px(style.borderLeftWidth) + px(style.borderRightWidth))
  const height = px(style.height) + (borderBox ? 0 : px(style.borderTopWidth) + px(style.borderBottomWidth))
  const left = rect.left + px(hostStyle.borderLeftWidth) + px(style.left)
  const top = rect.top + px(hostStyle.borderTopWidth) + px(style.top)
  return { left, top, right: left + width, bottom: top + height, borderStart: px(style.borderLeftWidth), borderEnd: px(style.borderBottomWidth) }
}

function centerX(element: HTMLElement): number {
  const rect = element.getBoundingClientRect()
  return rect.left + rect.width / 2
}

function centerY(element: HTMLElement): number {
  const rect = element.getBoundingClientRect()
  return rect.top + rect.height / 2
}

describe('tree 连接线', () => {
  it('竖线落在父节点展开箭头的中线上，各段首尾相接，从父行下沿一直到末位子节点的行中线', async () => {
    await mountNested({ lines: true })
    const parentControl = child(node('src'), 'branch-control')
    const components = node('components')
    const componentsControl = child(components, 'branch-control')
    const componentsContent = child(components, 'branch-content')
    const main = node('main')

    const trunk = centerX(child(parentControl, 'branch-trigger'))
    const head = pseudoBox(componentsControl, '::before')
    const through = pseudoBox(componentsContent, '::after')
    const tail = pseudoBox(main, '::before')
    for (const segment of [head, through, tail])
      expect(Math.abs(segment.left + segment.borderStart / 2 - trunk)).toBeLessThanOrEqual(0.5)

    expect(head.top).toBeCloseTo(parentControl.getBoundingClientRect().bottom, 0)
    expect(head.bottom).toBeCloseTo(componentsContent.getBoundingClientRect().top, 0)
    expect(through.top).toBeCloseTo(componentsContent.getBoundingClientRect().top, 0)
    expect(through.bottom).toBeCloseTo(main.getBoundingClientRect().top, 0)
    expect(tail.top).toBeCloseTo(main.getBoundingClientRect().top, 0)
    // 末位子节点拐向行首（└）：竖线止于行中线，横段是同一个线盒的下边框
    expect(tail.borderEnd).toBeGreaterThan(0)
    expect(Math.abs(tail.bottom - tail.borderEnd / 2 - centerY(main))).toBeLessThanOrEqual(0.5)
  })

  it('非末位子节点在行中线横出一段：分支接到展开箭头盒的起点，叶子穿过占位那一格接到正文前', async () => {
    await mountNested({ lines: true })
    const componentsControl = child(node('components'), 'branch-control')
    const head = pseudoBox(componentsControl, '::before')
    const headStyle = getComputedStyle(componentsControl, '::before')
    expect(headStyle.backgroundImage).toContain('gradient')
    expect(head.right).toBeCloseTo(child(componentsControl, 'branch-trigger').getBoundingClientRect().left, 0)

    // 横段的位置写在渐变的背景位置里：百分比按（线盒高 − 线粗）折算，换回页面坐标应落在分支行的中线
    const thickness = Number.parseFloat(headStyle.backgroundSize.split(' ')[1] ?? '1')
    const offset = Number.parseFloat(headStyle.backgroundPositionY)
    const stubTop = headStyle.backgroundPositionY.endsWith('%')
      ? head.top + (head.bottom - head.top - thickness) * offset / 100
      : head.top + offset
    expect(Math.abs(stubTop + thickness / 2 - centerY(componentsControl))).toBeLessThanOrEqual(0.5)

    const button = node('button')
    const buttonLine = pseudoBox(button, '::before')
    const text = child(button, 'item-text').getBoundingClientRect()
    const gap = Number.parseFloat(getComputedStyle(button).columnGap)
    expect(buttonLine.right).toBeCloseTo(text.left - gap, 0)
    expect(Math.abs(buttonLine.left + buttonLine.borderStart / 2 - centerX(child(componentsControl, 'branch-trigger')))).toBeLessThanOrEqual(0.5)
  })

  it('顶层节点没有父节点可连，不画线；不写 lines 整棵树都不画', async () => {
    await mountNested({ lines: true })
    expect(getComputedStyle(child(node('src'), 'branch-control'), '::before').content).toBe('none')
    app?.unmount()
    host?.remove()
    await mountNested({})
    expect(getComputedStyle(child(node('components'), 'branch-control'), '::before').content).toBe('none')
    expect(getComputedStyle(node('main'), '::before').content).toBe('none')
    expect(getComputedStyle(child(node('components'), 'branch-content'), '::after').content).toBe('none')
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
