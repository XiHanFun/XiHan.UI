// 级联选择器列里自绘的状态字形——行尾选中标记盒里的勾与半选杠、分支条目行尾的展开 chevron——是指示符，
// 不是控件内图标：它们与所在的盒同属 --xh-control-indicator-* 一族（§6.5），条目上由家族按档下发的
// --xh-icon-size（桥自 --xh-cascader-icon-size，md 20px）只管作者放进条目里的图标。
// 标记盒早已按指示符档取尺（comfortable 16 / compact 14），但盒里的兜底勾与半选杠此前读的是行上的
// --xh-icon-size：20 的勾落在 16 / 14 的盒里比盒还大；分支箭头缺省也读它，比同一行的标记盒大一圈。
// 两档密度一起量：字形与盒同边长（行尾标记不是勾选格，不取 × 0.75，与搜索候选行尾的勾同尺），作者图标两档都恒 20。
import type { CascaderLevel } from '@xihan-ui/headless'
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import {
  XhCascaderColumn,
  XhCascaderContent,
  XhCascaderControl,
  XhCascaderIndicator,
  XhCascaderInput,
  XhCascaderItem,
  XhCascaderItemIndicator,
  XhCascaderItemText,
  XhCascaderPositioner,
  XhCascaderRoot,
  XhCascaderSearchList,
  XhCascaderTrigger,
  XhCascaderValueText,
  XhIcon,
} from '../../src'
import { pseudoBox } from './pseudo-box'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

const COLLECTION = [
  {
    value: 'region',
    label: '区域',
    children: [
      {
        value: 'east',
        label: '华东',
        children: [
          { value: 'shanghai', label: '上海' },
          { value: 'hangzhou', label: '杭州' },
        ],
      },
    ],
  },
]

let app: App | null = null
let host: HTMLElement | null = null

afterEach(() => {
  app?.unmount()
  host?.remove()
  document.getElementById('xh-portal-root')?.remove()
  delete document.documentElement.dataset.density
  app = null
  host = null
})

function part(name: string): HTMLElement {
  const element = document.querySelector<HTMLElement>(`[data-scope='cascader'][data-part='${name}']`)
  if (!element)
    throw new Error(`缺少 cascader 部件：${name}`)
  return element
}

function item(value: string): HTMLElement {
  const element = document.querySelector<HTMLElement>(`[data-scope='cascader'][data-part='item'][data-value='${value}']`)
  if (!element)
    throw new Error(`缺少 cascader 条目：${value}`)
  return element
}

function indicatorOf(value: string): HTMLElement {
  const element = item(value).querySelector<HTMLElement>('[data-scope=\'cascader\'][data-part=\'item-indicator\']')
  if (!element)
    throw new Error(`条目 ${value} 缺少 item-indicator`)
  return element
}

function searchItem(text: string): HTMLElement {
  const element = [...document.querySelectorAll<HTMLElement>('[data-scope=\'cascader\'][data-part=\'search-item\']')]
    .find(candidate => candidate.textContent === text)
  if (!element)
    throw new Error(`缺少 cascader 搜索候选：${text}`)
  return element
}

function authorIcon(label: string): ReturnType<typeof h> {
  return h(XhIcon, { label }, { default: () => h('path', { d: 'M4 12h16' }) })
}

async function settle(): Promise<void> {
  await nextTick()
  await nextTick()
  await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
  // 浮层有 pop-in 进场，播放期间整块被 scale，此时量到的每个矩形都是缩放后的值；等它跑完再量
  await Promise.all(
    document.getAnimations().map(animation => animation.finished.catch(() => undefined)),
  )
}

async function mount(density: 'comfortable' | 'compact'): Promise<void> {
  document.documentElement.dataset.density = density
  host = document.createElement('div')
  document.body.append(host)
  app = createApp({
    // 级联多选只选 shanghai：shanghai 行尾画勾、east / region 分支落到半选画杠，两者又都是分支、行尾画 chevron；
    // hangzhou：标记盒里塞作者的 XhIcon（与盒同尺），条目里再直接放一枚作者图标（仍按家族下发的 20）
    render: () => h(XhCascaderRoot, {
      collection: COLLECTION,
      multiple: true,
      cascade: true,
      changeOnSelect: true,
      searchable: true,
      open: true,
      value: [['region', 'east', 'shanghai']],
    }, {
      default: ({ levels }: { levels: CascaderLevel[] }) => [
        h(XhCascaderControl, null, () => [
          h(XhCascaderTrigger, null, () => [h(XhCascaderValueText), h(XhCascaderIndicator)]),
        ]),
        h(XhCascaderPositioner, null, () => [
          h(XhCascaderContent, { style: { inlineSize: '440px' } }, () => [
            h(XhCascaderInput),
            h(XhCascaderSearchList),
            ...levels.map(level => h(XhCascaderColumn, { key: level.level, level: level.level }, () =>
              level.items.map(node => h(XhCascaderItem, { key: node.value, value: node.value }, () => node.value === 'hangzhou'
                ? [authorIcon('条目图标'), h(XhCascaderItemText, null, () => node.label), h(XhCascaderItemIndicator, null, () => authorIcon('标记位图标'))]
                : [h(XhCascaderItemText, null, () => node.label), h(XhCascaderItemIndicator)])))),
          ]),
        ]),
      ],
    }),
  })
  app.mount(host)
  await settle()
}

async function search(query: string): Promise<void> {
  const input = part('input') as HTMLInputElement
  input.value = query
  input.dispatchEvent(new Event('input', { bubbles: true }))
  await settle()
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

describe.each(['comfortable', 'compact'] as const)('级联选择器自绘状态字形按指示符档取尺（%s）', (density) => {
  it('选中叶项行尾的标记盒等于 --xh-control-indicator-size、兜底的勾与盒同边长', async () => {
    await mount(density)
    const indicator = indicatorSize()
    const mark = indicatorOf('shanghai')
    expect(item('shanghai').getAttribute('data-state')).toBe('checked')
    expect(mark.childNodes.length, '空标记盒才由皮肤画兜底的勾').toBe(0)
    expect(getComputedStyle(mark).visibility).toBe('visible')
    expect(getComputedStyle(mark, '::before').maskImage, '兜底字形是勾').not.toBe('none')
    const rect = mark.getBoundingClientRect()
    expect(rect.width, `标记盒 ${rect.width}×${rect.height}`).toBe(indicator)
    expect(rect.height, `标记盒 ${rect.width}×${rect.height}`).toBe(indicator)
    const check = pseudoBox(mark, '::before')
    const observed = describeGlyph(mark, '::before')
    expect(check.width, observed).toBe(indicator)
    expect(check.height, observed).toBe(indicator)
    expectCenteredBox(mark)
  })

  it('级联半选的分支行尾画横杠，盒与杠都与勾同一把尺', async () => {
    await mount(density)
    const indicator = indicatorSize()
    const mark = indicatorOf('east')
    expect(item('east').getAttribute('data-state')).toBe('indeterminate')
    expect(mark.getAttribute('data-state')).toBe('indeterminate')
    expect(getComputedStyle(mark).visibility).toBe('visible')
    expect(getComputedStyle(mark, '::before').maskImage).not.toBe(getComputedStyle(indicatorOf('shanghai'), '::before').maskImage)
    expect(mark.getBoundingClientRect().width).toBe(indicator)
    const minus = pseudoBox(mark, '::before')
    const observed = describeGlyph(mark, '::before')
    expect(minus.width, observed).toBe(indicator)
    expect(minus.height, observed).toBe(indicator)
    expectCenteredBox(mark)
  })

  it('分支条目行尾的展开 chevron 等于 --xh-control-indicator-size，与同一行的标记盒同尺', async () => {
    await mount(density)
    const indicator = indicatorSize()
    for (const value of ['region', 'east']) {
      const branch = item(value)
      expect(branch.hasAttribute('data-branch'), `${value} 是分支`).toBe(true)
      const chevron = pseudoBox(branch, '::after')
      const observed = `${value} ${describeGlyph(branch, '::after')}`
      expect(chevron.width, observed).toBe(indicator)
      expect(chevron.height, observed).toBe(indicator)
      expect(chevron.height, observed).toBeLessThanOrEqual(branch.getBoundingClientRect().height)
    }
  })

  it('作者塞进标记盒里的 XhIcon 与盒同尺，随指示符档换档', async () => {
    await mount(density)
    const indicator = indicatorSize()
    const mark = indicatorOf('hangzhou')
    expect(Number.parseFloat(getComputedStyle(mark).getPropertyValue('--xh-icon-size'))).toBe(indicator)
    const svg = mark.querySelector<HTMLElement>('[data-scope=\'icon\'][data-part=\'root\']')!
    const rect = svg.getBoundingClientRect()
    expect(rect.width, `标记位图标 ${rect.width}×${rect.height}`).toBe(indicator)
    expect(rect.height, `标记位图标 ${rect.width}×${rect.height}`).toBe(indicator)
  })

  it('作者直接放进条目里的图标仍按家族下发的 --xh-icon-size（md 20px）取尺，不随指示符档变', async () => {
    await mount(density)
    const row = item('hangzhou')
    expect(Number.parseFloat(getComputedStyle(row).getPropertyValue('--xh-icon-size'))).toBe(20)
    const svg = row.querySelector<HTMLElement>(':scope > [data-scope=\'icon\'][data-part=\'root\']')!
    const rect = svg.getBoundingClientRect()
    expect(rect.width, `条目图标 ${rect.width}×${rect.height}`).toBe(20)
    expect(rect.height, `条目图标 ${rect.width}×${rect.height}`).toBe(20)
  })

  it('搜索候选行尾的勾与列里的标记盒同一把尺', async () => {
    await mount(density)
    const indicator = indicatorSize()
    await search('上海')
    const result = searchItem('区域 / 华东 / 上海')
    expect(result.getAttribute('data-state')).toBe('checked')
    expect(getComputedStyle(result, '::after').visibility).toBe('visible')
    const check = pseudoBox(result, '::after')
    const observed = describeGlyph(result, '::after')
    expect(check.width, observed).toBe(indicator)
    expect(check.height, observed).toBe(indicator)
  })
})
