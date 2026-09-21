// 组合框自绘的状态字形——浮层条目里勾选标记所在的标记盒与盒里皮肤画的兜底勾——是指示符，不是控件内图标：
// 它们同属 --xh-control-indicator-* 一族（§6.5），root / positioner 按档下发的 --xh-icon-size（桥自
// --xh-combobox-icon-size，md 20px）只管作者直接放进条目里的图标。
// 此前标记盒已按指示符档取尺（16 / 14），但空盒里的兜底勾仍读行上的 --xh-icon-size：20 的勾比 16 的盒大一圈，
// compact 下盒收到 14 时勾仍是 20。两档密度一起量：盒与勾同边长（勾选标记不是勾选格，不取 × 0.75，与
// Select / Listbox / Menu 族同口径），作者塞进标记盒的 XhIcon 与盒同尺，作者直接放进条目的图标两档都恒 20。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import {
  XhComboboxContent,
  XhComboboxControl,
  XhComboboxInput,
  XhComboboxItem,
  XhComboboxItemIndicator,
  XhComboboxItemText,
  XhComboboxPositioner,
  XhComboboxRoot,
  XhIcon,
} from '../../src'
import { pseudoBox } from './pseudo-box'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

const OPTIONS = [
  { value: 'apple', label: '苹果' },
  { value: 'banana', label: '香蕉' },
  { value: 'cherry', label: '樱桃' },
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

function item(value: string): HTMLElement {
  const element = document.querySelector<HTMLElement>(`[data-scope='combobox'][data-part='item'][data-value='${value}']`)
  if (!element)
    throw new Error(`缺少 combobox 条目：${value}`)
  return element
}

function indicatorOf(value: string): HTMLElement {
  const element = item(value).querySelector<HTMLElement>('[data-scope=\'combobox\'][data-part=\'item-indicator\']')
  if (!element)
    throw new Error(`条目 ${value} 缺少 item-indicator`)
  return element
}

function authorIcon(label: string): ReturnType<typeof h> {
  return h(XhIcon, { label }, { default: () => h('path', { d: 'M4 12h16' }) })
}

async function mount(density: 'comfortable' | 'compact'): Promise<void> {
  document.documentElement.dataset.density = density
  host = document.createElement('div')
  document.body.append(host)
  app = createApp({
    // apple：选中，空标记盒由皮肤画兜底的勾；banana：标记盒里塞作者的 XhIcon（与盒同尺），
    // 条目里再直接放一枚作者图标（仍按家族下发的 20）；cherry：未选中，只量盒
    render: () => h(XhComboboxRoot, { collection: OPTIONS, multiple: true, open: true, value: ['apple', 'banana'] }, () => [
      h(XhComboboxControl, null, () => [h(XhComboboxInput)]),
      h(XhComboboxPositioner, null, () => [
        h(XhComboboxContent, { style: { inlineSize: '240px' } }, () => [
          h(XhComboboxItem, { value: 'apple' }, () => [
            h(XhComboboxItemText, null, () => '苹果'),
            h(XhComboboxItemIndicator),
          ]),
          h(XhComboboxItem, { value: 'banana' }, () => [
            authorIcon('条目图标'),
            h(XhComboboxItemText, null, () => '香蕉'),
            h(XhComboboxItemIndicator, null, () => authorIcon('标记位图标')),
          ]),
          h(XhComboboxItem, { value: 'cherry' }, () => [
            h(XhComboboxItemText, null, () => '樱桃'),
            h(XhComboboxItemIndicator),
          ]),
        ]),
      ]),
    ]),
  })
  app.mount(host)
  await nextTick()
  await nextTick()
}

function indicatorSize(): number {
  const value = Number.parseFloat(getComputedStyle(item('apple')).getPropertyValue('--xh-control-indicator-size'))
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

describe.each(['comfortable', 'compact'] as const)('组合框自绘状态字形按指示符档取尺（%s）', (density) => {
  it('标记盒等于 --xh-control-indicator-size，不读家族按档下发的 --xh-icon-size', async () => {
    await mount(density)
    const indicator = indicatorSize()
    for (const value of ['apple', 'banana', 'cherry']) {
      const box = indicatorOf(value)
      const rect = box.getBoundingClientRect()
      const observed = `${value} item-indicator 盒 ${rect.width}×${rect.height}`
      expect(rect.width, observed).toBe(indicator)
      expect(rect.height, observed).toBe(indicator)
      expectCenteredBox(box)
    }
  })

  it('选中项的兜底勾与盒同边长，随指示符档换档', async () => {
    await mount(density)
    const indicator = indicatorSize()
    const mark = indicatorOf('apple')
    expect(item('apple').getAttribute('aria-selected')).toBe('true')
    expect(mark.childNodes.length, '空标记盒才由皮肤画兜底的勾').toBe(0)
    expect(getComputedStyle(mark).visibility).toBe('visible')
    expect(getComputedStyle(mark, '::before').maskImage, '兜底字形是勾').not.toBe('none')
    const check = pseudoBox(mark, '::before')
    const observed = describeGlyph(mark, '::before')
    expect(check.width, observed).toBe(indicator)
    expect(check.height, observed).toBe(indicator)
  })

  it('作者塞进标记盒里的 XhIcon 与盒同尺，随指示符档换档', async () => {
    await mount(density)
    const indicator = indicatorSize()
    const box = indicatorOf('banana')
    expect(Number.parseFloat(getComputedStyle(box).getPropertyValue('--xh-icon-size'))).toBe(indicator)
    const svg = box.querySelector<HTMLElement>('[data-scope=\'icon\'][data-part=\'root\']')!
    const rect = svg.getBoundingClientRect()
    expect(rect.width, `标记位图标 ${rect.width}×${rect.height}`).toBe(indicator)
    expect(rect.height, `标记位图标 ${rect.width}×${rect.height}`).toBe(indicator)
  })

  it('作者直接放进条目里的图标仍按家族下发的 --xh-icon-size（md 20px）取尺，不随指示符档变', async () => {
    await mount(density)
    const row = item('banana')
    expect(Number.parseFloat(getComputedStyle(row).getPropertyValue('--xh-icon-size'))).toBe(20)
    const svg = row.querySelector<HTMLElement>(':scope > [data-scope=\'icon\'][data-part=\'root\']')!
    const rect = svg.getBoundingClientRect()
    expect(rect.width, `条目图标 ${rect.width}×${rect.height}`).toBe(20)
    expect(rect.height, `条目图标 ${rect.width}×${rect.height}`).toBe(20)
  })
})
