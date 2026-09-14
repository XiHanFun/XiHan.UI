// Cascader 的列项与搜索结果共用选择标记；路径、级联半选、RTL 与禁用需由真实 CSS 验证。
import type { CascaderLevel } from '@xihan-ui/headless'
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
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
} from '../../src'
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
  {
    value: 'locked-branch',
    label: '锁定分支',
    disabled: true,
    children: [{ value: 'locked-child', label: '锁定子项' }],
  },
  { value: 'blocked', label: '禁用叶项', disabled: true },
]

interface MountOptions {
  multiple?: boolean
  cascade?: boolean
  changeOnSelect?: boolean
  value?: string[][]
  dir?: 'ltr' | 'rtl'
}

let app: App | null = null
let host: HTMLElement | null = null

async function settle(): Promise<void> {
  await nextTick()
  await nextTick()
  await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
}

async function mountCascader(options: MountOptions = {}): Promise<void> {
  host = document.createElement('div')
  document.body.append(host)
  app = createApp({
    render: () => h(XhCascaderRoot, {
      collection: COLLECTION,
      searchable: true,
      open: true,
      value: options.value ?? [['region', 'east', 'shanghai']],
      multiple: options.multiple,
      cascade: options.cascade,
      changeOnSelect: options.changeOnSelect,
      dir: options.dir,
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
                ? [h('span', { 'data-testid': 'author-icon' }, '•'), node.label, h(XhCascaderItemIndicator)]
                : [h(XhCascaderItemText, null, () => node.label), h(XhCascaderItemIndicator)])))),
          ]),
        ]),
      ],
    }),
  })
  app.mount(host)
  await settle()
}

function part(name: string): HTMLElement {
  const element = document.querySelector<HTMLElement>(`[data-scope='cascader'][data-part='${name}']`)
  if (!element)
    throw new Error(`找不到 cascader/${name}`)
  return element
}

function item(value: string): HTMLElement {
  const element = document.querySelector<HTMLElement>(`[data-scope='cascader'][data-part='item'][data-value='${value}']`)
  if (!element)
    throw new Error(`找不到 cascader/item ${value}`)
  return element
}

function itemIndicator(value: string): HTMLElement {
  const indicator = item(value).querySelector<HTMLElement>(`[data-part='item-indicator']`)
  if (!indicator)
    throw new Error(`找不到 cascader/item-indicator ${value}`)
  return indicator
}

function searchItem(text: string): HTMLElement {
  const element = [...document.querySelectorAll<HTMLElement>(`[data-scope='cascader'][data-part='search-item']`)]
    .find(item => item.textContent === text)
  if (!element)
    throw new Error(`找不到 cascader/search-item ${text}`)
  return element
}

function mask(element: HTMLElement, pseudo = '::before'): string {
  const style = getComputedStyle(element, pseudo)
  return style.maskImage || style.webkitMaskImage || ''
}

function resolvedMask(token: string): string {
  const probe = document.createElement('span')
  probe.style.maskImage = `var(${token})`
  document.body.append(probe)
  const value = getComputedStyle(probe).maskImage
  probe.remove()
  return value
}

function resolvedColor(token: string): string {
  const probe = document.createElement('span')
  probe.style.backgroundColor = `var(${token})`
  document.body.append(probe)
  const value = getComputedStyle(probe).backgroundColor
  probe.remove()
  return value
}

function colorAlpha(color: string): number {
  const canvas = document.createElement('canvas')
  canvas.width = 1
  canvas.height = 1
  const context = canvas.getContext('2d')!
  context.fillStyle = color
  context.fillRect(0, 0, 1, 1)
  return context.getImageData(0, 0, 1, 1).data[3]!
}

async function search(query: string): Promise<void> {
  const input = part('input') as HTMLInputElement
  input.value = query
  input.dispatchEvent(new Event('input', { bubbles: true }))
  await settle()
}

afterEach(async () => {
  app?.unmount()
  host?.remove()
  document.getElementById('xh-portal-root')?.remove()
  app = null
  host = null
  await userEvent.hover(document.querySelector<HTMLElement>('[data-test-park-pointer]')!)
})

describe('级联选择的统一选中标记', () => {
  it.each([false, true])('multiple=%s：列项选中只显示对号，正文与展开路径保持中性', async (multiple) => {
    await mountCascader({ multiple })
    const selected = item('shanghai')
    const path = item('east')
    const plain = item('hangzhou')
    const selectedIndicator = itemIndicator('shanghai')

    expect(selected.getAttribute('data-state')).toBe('checked')
    expect(getComputedStyle(selected).color).toBe(getComputedStyle(plain).color)
    expect(getComputedStyle(selected).fontWeight).toBe(getComputedStyle(plain).fontWeight)
    expect(getComputedStyle(selected).backgroundColor).toBe(resolvedColor('--xh-bg-subtle'))
    expect(getComputedStyle(path).backgroundColor).toBe(getComputedStyle(selected).backgroundColor)
    expect(getComputedStyle(selectedIndicator).visibility).toBe('visible')
    expect(getComputedStyle(itemIndicator('hangzhou')).visibility).toBe('hidden')
    expect(mask(selectedIndicator)).toBe(resolvedMask('--xh-glyph-mark-check'))
    expect(itemIndicator('hangzhou').getBoundingClientRect().right)
      .toBeCloseTo(selectedIndicator.getBoundingClientRect().right, 0)

    await userEvent.tab()
    selected.focus()
    expect(selected.matches(':focus-visible')).toBe(true)
    expect(getComputedStyle(selected).transitionProperty).toBe('color')
  })

  it.each([false, true])('multiple=%s：搜索结果沿用对号，移走高亮后不保留选中底或强调文字', async (multiple) => {
    await mountCascader({ multiple })
    await search('华东')
    const selected = searchItem('区域 / 华东 / 上海')
    const plain = searchItem('区域 / 华东 / 杭州')
    selected.style.transition = 'none'
    plain.dispatchEvent(new PointerEvent('pointermove', { bubbles: true }))
    await settle()

    expect(selected.getAttribute('data-state')).toBe('checked')
    expect(selected.hasAttribute('data-highlighted')).toBe(false)
    expect(colorAlpha(getComputedStyle(selected).backgroundColor)).toBe(0)
    expect(getComputedStyle(selected).color).toBe(getComputedStyle(plain).color)
    expect(getComputedStyle(selected).fontWeight).toBe(getComputedStyle(plain).fontWeight)
    expect(getComputedStyle(selected, '::after').visibility).toBe('visible')
    expect(getComputedStyle(plain, '::after').visibility).toBe('hidden')
    expect(mask(selected, '::after')).toBe(resolvedMask('--xh-glyph-mark-check'))
  })

  it('级联半选在列项和可搜索分支上都保留横线', async () => {
    await mountCascader({
      multiple: true,
      cascade: true,
      changeOnSelect: true,
      value: [['region', 'east', 'shanghai']],
    })
    const columnHalf = itemIndicator('east')
    const checked = itemIndicator('shanghai')
    expect(item('east').getAttribute('data-state')).toBe('indeterminate')
    expect(getComputedStyle(columnHalf).visibility).toBe('visible')
    expect(mask(columnHalf)).toBe(resolvedMask('--xh-glyph-mark-minus'))
    expect(mask(columnHalf)).not.toBe(mask(checked))

    await search('区域')
    const resultHalf = searchItem('区域')
    expect(resultHalf.getAttribute('data-state')).toBe('indeterminate')
    expect(resultHalf.getAttribute('aria-checked')).toBe('mixed')
    expect(getComputedStyle(resultHalf, '::after').visibility).toBe('visible')
    expect(mask(resultHalf, '::after')).toBe(resolvedMask('--xh-glyph-mark-minus'))
  })

  it('rtl 翻转分支箭头和搜索标记末端，禁用正文、对号与箭头使用同一失效色', async () => {
    await mountCascader({ dir: 'rtl', value: [['blocked']] })
    const branch = item('region')
    const disabledBranch = item('locked-branch')
    const disabledLeaf = item('blocked')
    const disabledIndicator = itemIndicator('blocked')
    const disabledColor = resolvedColor('--xh-fg-disabled')

    expect(getComputedStyle(branch).direction).toBe('rtl')
    expect(mask(branch, '::after')).toBe(resolvedMask('--xh-glyph-mark-chevron-left'))
    expect(getComputedStyle(disabledBranch).cursor).toBe('not-allowed')
    expect(getComputedStyle(disabledBranch, '::after').backgroundColor).toBe(disabledColor)
    expect(getComputedStyle(disabledLeaf).color).toBe(disabledColor)
    expect(getComputedStyle(disabledIndicator).color).toBe(disabledColor)

    await search('禁用叶项')
    const result = searchItem('禁用叶项')
    const marker = getComputedStyle(result, '::after')
    expect(getComputedStyle(result).cursor).toBe('not-allowed')
    expect(marker.backgroundColor).toBe(disabledColor)
    expect(Number.parseFloat(marker.left)).toBeLessThan(Number.parseFloat(marker.right))
  })
})
