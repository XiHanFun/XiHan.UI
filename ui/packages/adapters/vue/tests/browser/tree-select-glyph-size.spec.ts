// 树选择器面板里自绘的状态字形——展开方向 chevron、行尾的对号与半选杠——是指示符，不是控件内图标：
// 它们与所在的盒同属 --xh-control-indicator-* 一族，--xh-tree-select-icon-size / --xh-icon-size
// 只管作者放进行里的图标。盒早已按指示符档取尺（comfortable 16 / compact 14），但盒里的兜底字形此前
// 读的是家族按档下发到行的 --xh-icon-size（md 20px）：20 的 chevron 与对号落在 16 / 14 的盒里比盒还大。
// 两档密度一起量：字形与盒同边长（对号是行尾标记，不是勾选格，不取 × 0.75），作者图标两档都恒 20。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import {
  XhIcon,
  XhTreeSelectBranch,
  XhTreeSelectBranchContent,
  XhTreeSelectBranchControl,
  XhTreeSelectBranchIndicator,
  XhTreeSelectBranchText,
  XhTreeSelectBranchTrigger,
  XhTreeSelectContent,
  XhTreeSelectItem,
  XhTreeSelectItemIndicator,
  XhTreeSelectItemText,
  XhTreeSelectPositioner,
  XhTreeSelectRoot,
  XhTreeSelectTree,
  XhTreeSelectTrigger,
  XhTreeSelectValueText,
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
  document.getElementById('xh-portal-root')?.replaceChildren()
  delete document.documentElement.dataset.density
  app = null
  host = null
})

/** 面板被搬到 portal 落点，所有几何都从那里量 */
function panel(): HTMLElement {
  return document.getElementById('xh-portal-root')!
}

function part(name: string, index = 0): HTMLElement {
  const element = panel().querySelectorAll<HTMLElement>(`[data-scope='tree-select'][data-part='${name}']`)[index]
  if (!element)
    throw new Error(`缺少 tree-select 部件：${name}[${index}]`)
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
    // src 分支用箭头把手、docs 分支用方向指示符：两种展开字形都量到；
    // 级联多选下只选 index：index 行尾画对号、src 分支行尾落到半选画杠；
    // 作者图标塞在分支文字与叶子文字之后
    render: () => h(XhTreeSelectRoot, {
      collection,
      multiple: true,
      cascade: true,
      open: true,
      defaultValue: ['index'],
      defaultExpandedValue: ['src', 'docs'],
    }, () => [
      h(XhTreeSelectTrigger, null, () => [h(XhTreeSelectValueText)]),
      h(XhTreeSelectPositioner, null, () => [
        h(XhTreeSelectContent, null, () => [
          h(XhTreeSelectTree, null, () => [
            h(XhTreeSelectBranch, { value: 'src' }, () => [
              h(XhTreeSelectBranchControl, null, () => [
                h(XhTreeSelectBranchTrigger),
                h(XhTreeSelectBranchText, null, () => 'src'),
                authorIcon(),
                h(XhTreeSelectItemIndicator),
              ]),
              h(XhTreeSelectBranchContent, null, () => [
                h(XhTreeSelectItem, { value: 'index' }, () => [h(XhTreeSelectItemText, null, () => 'index.ts'), authorIcon(), h(XhTreeSelectItemIndicator)]),
                h(XhTreeSelectItem, { value: 'app' }, () => [h(XhTreeSelectItemText, null, () => 'app.vue'), h(XhTreeSelectItemIndicator)]),
              ]),
            ]),
            h(XhTreeSelectBranch, { value: 'docs' }, () => [
              h(XhTreeSelectBranchControl, null, () => [
                h(XhTreeSelectBranchIndicator),
                h(XhTreeSelectBranchText, null, () => 'docs'),
              ]),
              h(XhTreeSelectBranchContent, null, () => [
                h(XhTreeSelectItem, { value: 'guide' }, () => [h(XhTreeSelectItemText, null, () => 'guide.md'), h(XhTreeSelectItemIndicator)]),
              ]),
            ]),
          ]),
        ]),
      ]),
    ]),
  })
  app.mount(host)
  await nextTick()
  await nextTick()
  // 面板有 pop-in 进场，播放期间整块被 scale，此时量到的每个矩形都是缩放后的值；等它跑完再量
  await Promise.all(
    panel().getAnimations({ subtree: true }).map(animation => animation.finished.catch(() => undefined)),
  )
}

function indicatorSize(): number {
  const value = Number.parseFloat(getComputedStyle(part('content')).getPropertyValue('--xh-control-indicator-size'))
  expect([14, 16]).toContain(value)
  return value
}

function describeGlyph(box: HTMLElement, pseudo: '::before' | '::after'): string {
  const style = getComputedStyle(box, pseudo)
  const rect = box.getBoundingClientRect()
  return `${box.dataset.part}${pseudo} ${style.width}×${style.height} position=${style.position} 盒 ${rect.width}×${rect.height}`
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

describe.each(['comfortable', 'compact'] as const)('树选择器自绘状态字形按指示符档取尺（%s）', (density) => {
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

  it('选中叶子行尾的对号盒等于 --xh-control-indicator-size、兜底对号与盒同边长', async () => {
    await mount(density)
    const indicator = indicatorSize()
    const mark = part('item', 0).querySelector<HTMLElement>('[data-part=\'item-indicator\']')!
    expect(mark.closest('[data-part=\'item\']')!.getAttribute('aria-selected')).toBe('true')
    expect(mark.hasAttribute('data-selected')).toBe(true)
    expect(getComputedStyle(mark).visibility).toBe('visible')
    expect(mark.getBoundingClientRect().width).toBe(indicator)
    expect(mark.getBoundingClientRect().height).toBe(indicator)
    const check = pseudoBox(mark, '::before')
    const observed = describeGlyph(mark, '::before')
    expect(check.width, observed).toBe(indicator)
    expect(check.height, observed).toBe(indicator)
    expectCenteredBox(mark)
  })

  it('级联半选的分支行尾画横线，盒与杠都与对号同一把尺', async () => {
    await mount(density)
    const indicator = indicatorSize()
    const mark = part('branch-control').querySelector<HTMLElement>('[data-part=\'item-indicator\']')!
    expect(mark.hasAttribute('data-indeterminate')).toBe(true)
    expect(mark.hasAttribute('data-selected')).toBe(false)
    expect(getComputedStyle(mark).visibility).toBe('visible')
    const selectedMark = part('item', 0).querySelector<HTMLElement>('[data-part=\'item-indicator\']')!
    expect(getComputedStyle(mark, '::before').maskImage).not.toBe(getComputedStyle(selectedMark, '::before').maskImage)
    expect(mark.getBoundingClientRect().width).toBe(indicator)
    const minus = pseudoBox(mark, '::before')
    const observed = describeGlyph(mark, '::before')
    expect(minus.width, observed).toBe(indicator)
    expect(minus.height, observed).toBe(indicator)
    expectCenteredBox(mark)
  })

  it('作者塞进行里的图标仍按 --xh-icon-size（md 20px）取尺，不随指示符档变', async () => {
    await mount(density)
    const icon = Number.parseFloat(getComputedStyle(part('branch-control')).getPropertyValue('--xh-icon-size'))
    expect(icon).toBe(20)
    const icons = [...panel().querySelectorAll<HTMLElement>('[data-scope=\'icon\'][data-part=\'root\']')]
    expect(icons.length).toBe(2)
    for (const svg of icons) {
      expect(svg.getBoundingClientRect().width).toBe(icon)
      expect(svg.getBoundingClientRect().height).toBe(icon)
    }
  })
})
