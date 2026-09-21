// 树自绘的状态字形——展开方向 chevron、叶子的对号、勾选把手里的勾——是指示符，不是控件内图标：
// 它们与所在的方盒 / 把手同属 --xh-control-indicator-* 一族（§6.5），--xh-tree-icon-size / --xh-icon-size
// 只管作者放进行里的图标。此前箭头盒、对号盒与叶子占位都从家族按档下发的行内字形尺（md 20px）取：
// comfortable 下 20×20 的 chevron 与对号比同一行里 16px 的勾选把手大一圈，compact 下方盒收到 14 时它们仍是 20。
// 两档密度一起量：指示符档 comfortable 16 / compact 14，勾按方盒 × 0.75，作者图标两档都恒 20。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import {
  XhIcon,
  XhTreeBranch,
  XhTreeBranchCheckbox,
  XhTreeBranchContent,
  XhTreeBranchControl,
  XhTreeBranchIndicator,
  XhTreeBranchText,
  XhTreeBranchTrigger,
  XhTreeItem,
  XhTreeItemCheckbox,
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

/** 勾选把手里的勾按方盒边长的比例取尺：checkbox.css 的 --xh-_checkbox-glyph 与 tree.css 的勾选把手都是 0.75。 */
const CHECK_GLYPH_RATIO = 0.75

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
    // src 分支用箭头把手 + 勾选把手，docs 分支用方向指示符：两种展开字形都量到；
    // 级联下只勾 index：叶子的勾选把手画勾、src 分支的勾选把手落到半选画杠，对号可见；
    // 作者图标塞在分支文字与叶子文字之后
    render: () => h(XhTreeRoot, { collection, multiple: true, cascade: true, defaultSelection: ['index'], defaultExpandedValue: ['src', 'docs'] }, () => [
      h(XhTreeTree, null, () => [
        h(XhTreeBranch, { value: 'src' }, () => [
          h(XhTreeBranchControl, null, () => [
            h(XhTreeBranchTrigger),
            h(XhTreeBranchCheckbox),
            h(XhTreeBranchText, null, () => 'src'),
            authorIcon(),
          ]),
          h(XhTreeBranchContent, null, () => [
            h(XhTreeItem, { value: 'index' }, () => [h(XhTreeItemCheckbox), h(XhTreeItemIndicator), h(XhTreeItemText, null, () => 'index.ts'), authorIcon()]),
            // app 不摆 item-indicator：首格由行盒按同一把尺补出来
            h(XhTreeItem, { value: 'app' }, () => [h(XhTreeItemCheckbox), h(XhTreeItemText, null, () => 'app.vue')]),
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

/** 方盒的内容边长：border-box 计边长，描边内侧才是字形能落的范围 */
function innerSize(box: HTMLElement): number {
  const style = getComputedStyle(box)
  return box.getBoundingClientRect().width - Number.parseFloat(style.borderLeftWidth) - Number.parseFloat(style.borderRightWidth)
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

  it('叶子的对号盒等于 --xh-control-indicator-size、兜底对号与盒同边长，且落在勾选把手之后不比它大', async () => {
    await mount(density)
    const indicator = indicatorSize()
    const mark = part('item-indicator')
    expect(mark.closest('[data-part=\'item\']')!.getAttribute('aria-selected')).toBe('true')
    expect(getComputedStyle(mark).visibility).toBe('visible')
    expect(mark.getBoundingClientRect().width).toBe(indicator)
    const check = pseudoBox(mark, '::before')
    const observed = describeGlyph(mark, '::before')
    expect(check.width, observed).toBe(indicator)
    expect(check.height, observed).toBe(indicator)
    // 同一行的勾选把手方盒也是指示符档：对号不得比它大
    expect(check.width, observed).toBeLessThanOrEqual(part('item-checkbox').getBoundingClientRect().width)
    expectCenteredBox(mark)
  })

  it('勾选把手的兜底勾与半选杠按方盒边长 × 0.75 取尺，落在盒内并居中', async () => {
    await mount(density)
    const indicator = indicatorSize()
    const leaf = part('item-checkbox', 0)
    const branch = part('branch-checkbox')
    expect(leaf.getAttribute('data-selected')).not.toBeNull()
    expect(branch.getAttribute('data-indeterminate')).not.toBeNull()
    for (const box of [leaf, branch]) {
      expect(box.getBoundingClientRect().width, box.dataset.part).toBe(indicator)
      const check = pseudoBox(box, '::before')
      const observed = describeGlyph(box, '::before')
      expect(check.width, observed).toBe(indicator * CHECK_GLYPH_RATIO)
      expect(check.height, observed).toBe(indicator * CHECK_GLYPH_RATIO)
      expect(check.width, observed).toBeLessThanOrEqual(innerSize(box))
      expectCenteredBox(box)
    }
  })

  it('没摆 item-indicator 的叶子由行盒补出的首格占位与对号盒同一把尺，文字与摆了对号的兄弟叶子对齐', async () => {
    await mount(density)
    const indicator = indicatorSize()
    const index = part('item', 0)
    const app = part('item', 1)
    expect(app.querySelector('[data-part=\'item-indicator\']')).toBeNull()
    const gap = Number.parseFloat(getComputedStyle(app).columnGap)
    const extra = Number.parseFloat(getComputedStyle(app).paddingInlineStart) - Number.parseFloat(getComputedStyle(index).paddingInlineStart)
    expect(extra, `占位 ${extra} = 指示符 ${indicator} + 行 gap ${gap}`).toBe(indicator + gap)
    expect(part('item-text', 1).getBoundingClientRect().left).toBeCloseTo(part('item-text', 0).getBoundingClientRect().left, 1)
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
