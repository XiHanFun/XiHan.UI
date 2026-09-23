// 树自绘的状态字形——展开方向 chevron、行尾的对号与半选杠——是指示符，不是控件内图标：
// 它们与所在的盒 / 把手同属 --xh-control-indicator-* 一族（§6.5），--xh-tree-icon-size / --xh-icon-size
// 只管作者放进行里的图标。此前箭头盒、对号盒与叶子占位都从家族按档下发的行内字形尺（md 20px）取：
// comfortable 下 20×20 的 chevron 与对号比同一行里 16px 的拖拽把手大一圈，compact 下指示符收到 14 时它们仍是 20。
// 两档密度一起量：指示符档 comfortable 16 / compact 14，对号与半选杠与盒同边长，作者图标两档都恒 20。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import {
  XhIcon,
  XhTreeBranch,
  XhTreeBranchContent,
  XhTreeBranchControl,
  XhTreeBranchIndicator,
  XhTreeBranchText,
  XhTreeBranchTrigger,
  XhTreeItem,
  XhTreeItemIndicator,
  XhTreeItemText,
  XhTreeRoot,
  XhTreeTree,
} from '../../src'
import { pseudoBox } from './pseudo-box'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

const collection = [
  {
    value: 'src',
    label: 'src',
    children: [
      { value: 'index', label: 'index.ts' },
      { value: 'app', label: 'app.vue' },
    ],
  },
  {
    value: 'docs',
    label: 'docs',
    children: [{ value: 'guide', label: 'guide.md' }],
  },
]

let app: App | null = null
let host: HTMLElement | null = null

afterEach(() => {
  app?.unmount()
  host?.remove()
  delete document.documentElement.dataset.density
  app = null
  host = null
})

function part(name: string, index = 0): HTMLElement {
  const element = host!.querySelectorAll<HTMLElement>(`[data-scope='tree'][data-part='${name}']`)[index]
  if (!element)
    throw new Error(`缺少 tree 部件：${name}[${index}]`)
  return element
}

function authorIcon(): ReturnType<typeof h> {
  return h(XhIcon, { label: '作者图标' }, { default: () => h('path', { d: 'M4 12h16' }) })
}

async function mount(density: 'comfortable' | 'compact'): Promise<void> {
  document.documentElement.dataset.density = density
  host = document.createElement('div')
  document.body.append(host)
  app = createApp({
    // src 分支用箭头把手 + 行尾对号，docs 分支用方向指示符：两种展开字形都量到；
    // 级联下只勾 index：叶子的对号画勾、src 分支的对号落到半选画杠；
    // 作者图标塞在分支文字与叶子文字之后
    render: () => h(XhTreeRoot, { collection, multiple: true, cascade: true, defaultSelection: ['index'], defaultExpandedValue: ['src', 'docs'] }, () => [
      h(XhTreeTree, null, () => [
        h(XhTreeBranch, { value: 'src' }, () => [
          h(XhTreeBranchControl, null, () => [
            h(XhTreeBranchTrigger),
            h(XhTreeItemIndicator),
            h(XhTreeBranchText, null, () => 'src'),
            authorIcon(),
          ]),
          h(XhTreeBranchContent, null, () => [
            h(XhTreeItem, { value: 'index' }, () => [h(XhTreeItemIndicator), h(XhTreeItemText, null, () => 'index.ts'), authorIcon()]),
            // app 不摆 item-indicator：首格占位照样由行盒补出来，与摆了对号的兄弟对齐
            h(XhTreeItem, { value: 'app' }, () => [h(XhTreeItemText, null, () => 'app.vue')]),
          ]),
        ]),
        h(XhTreeBranch, { value: 'docs' }, () => [
          h(XhTreeBranchControl, null, () => [
            h(XhTreeBranchIndicator),
            h(XhTreeBranchText, null, () => 'docs'),
          ]),
          h(XhTreeBranchContent, null, () => [
            h(XhTreeItem, { value: 'guide' }, () => [h(XhTreeItemIndicator), h(XhTreeItemText, null, () => 'guide.md')]),
          ]),
        ]),
      ]),
    ]),
  })
  app.mount(host)
  await nextTick()
}

function indicatorSize(): number {
  const value = Number.parseFloat(getComputedStyle(part('root')).getPropertyValue('--xh-control-indicator-size'))
  expect([14, 16]).toContain(value)
  return value
}

function describeGlyph(host: HTMLElement, pseudo: '::before' | '::after'): string {
  const style = getComputedStyle(host, pseudo)
  const rect = host.getBoundingClientRect()
  return `${host.dataset.part}${pseudo} ${style.width}×${style.height} position=${style.position} 盒 ${rect.width}×${rect.height}`
}

/** 盒是两轴居中的容器：唯一的行内字形落在盒中心 */
function expectCenteredBox(box: HTMLElement): void {
  const style = getComputedStyle(box)
  expect(['flex', 'inline-flex', 'grid', 'inline-grid']).toContain(style.display)
  expect(style.alignItems).toBe('center')
  if (style.display.endsWith('grid'))
    expect(style.justifyItems).toBe('center')
  else
    expect(style.justifyContent).toBe('center')
}

describe.each(['comfortable', 'compact'] as const)('树自绘状态字形按指示符档取尺（%s）', (density) => {
  it('展开箭头把手与方向指示符的兜底 chevron 与盒同边长、边长等于 --xh-control-indicator-size', async () => {
    await mount(density)
    const indicator = indicatorSize()
    for (const box of [part('branch-trigger'), part('branch-indicator')]) {
      expect(box.getBoundingClientRect().width, box.dataset.part).toBe(indicator)
      const chevron = pseudoBox(box, '::before')
      const observed = describeGlyph(box, '::before')
      expect(chevron.width, observed).toBe(indicator)
      expect(chevron.height, observed).toBe(indicator)
      expectCenteredBox(box)
    }
  })

  it('行尾对号盒等于 --xh-control-indicator-size、兜底对号与盒同边长，落在正文与作者图标之后', async () => {
    await mount(density)
    const indicator = indicatorSize()
    const index = part('item', 0)
    const mark = index.querySelector<HTMLElement>('[data-part="item-indicator"]')!
    expect(index.getAttribute('aria-selected')).toBe('true')
    expect(getComputedStyle(mark).visibility).toBe('visible')
    expect(mark.getBoundingClientRect().width).toBe(indicator)
    const check = pseudoBox(mark, '::before')
    const observed = describeGlyph(mark, '::before')
    expect(check.width, observed).toBe(indicator)
    expect(check.height, observed).toBe(indicator)
    expectCenteredBox(mark)
    // 作者在行首摆的对号也排到最后：正文与作者图标都在它之前
    const icon = index.querySelector<HTMLElement>('[data-scope="icon"][data-part="root"]')!
    expect(mark.getBoundingClientRect().left).toBeGreaterThanOrEqual(icon.getBoundingClientRect().right)
    expect(mark.getBoundingClientRect().left).toBeGreaterThanOrEqual(part('item-text', 0).getBoundingClientRect().right)
  })

  it('分支行的对号在子树勾了一半时显形为半选杠，与叶子的对号同一把尺', async () => {
    await mount(density)
    const indicator = indicatorSize()
    const branchMark = part('branch-control').querySelector<HTMLElement>('[data-part="item-indicator"]')!
    const leafMark = part('item', 0).querySelector<HTMLElement>('[data-part="item-indicator"]')!
    expect(branchMark.hasAttribute('data-indeterminate')).toBe(true)
    expect(branchMark.hasAttribute('data-selected')).toBe(false)
    expect(getComputedStyle(branchMark).visibility).toBe('visible')
    const bar = pseudoBox(branchMark, '::before')
    expect(bar.width, describeGlyph(branchMark, '::before')).toBe(indicator)
    // 半选画的是横杠，不是勾
    expect(getComputedStyle(branchMark, '::before').maskImage).not.toBe(getComputedStyle(leafMark, '::before').maskImage)
  })

  it('叶子行由行盒补出首格占位，与箭头盒同一把尺；摆没摆对号的叶子文字对齐', async () => {
    await mount(density)
    const indicator = indicatorSize()
    const index = part('item', 0)
    const app = part('item', 1)
    const branch = part('branch-control', 0)
    const gap = Number.parseFloat(getComputedStyle(app).columnGap)
    const extra = Number.parseFloat(getComputedStyle(app).paddingInlineStart) - Number.parseFloat(getComputedStyle(branch).paddingInlineStart)
    expect(extra, `占位 ${extra} = 指示符 ${indicator} + 行 gap ${gap}`).toBe(indicator + gap)
    expect(part('item-text', 1).getBoundingClientRect().left).toBeCloseTo(part('item-text', 0).getBoundingClientRect().left, 1)
    expect(getComputedStyle(index).paddingInlineStart).toBe(getComputedStyle(app).paddingInlineStart)
  })

  it('作者塞进行里的图标仍按 --xh-icon-size（md 20px）取尺，不随指示符档变', async () => {
    await mount(density)
    const icon = Number.parseFloat(getComputedStyle(part('branch-control')).getPropertyValue('--xh-icon-size'))
    expect(icon).toBe(20)
    const icons = [...host!.querySelectorAll<HTMLElement>('[data-scope=\'icon\'][data-part=\'root\']')]
    expect(icons.length).toBe(2)
    for (const svg of icons) {
      expect(svg.getBoundingClientRect().width).toBe(icon)
      expect(svg.getBoundingClientRect().height).toBe(icon)
    }
  })
})
