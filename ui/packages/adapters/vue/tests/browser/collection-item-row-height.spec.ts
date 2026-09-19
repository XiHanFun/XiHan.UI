// 浮层集合条目（Collection Item 家族 overlay 语境）的行高与跨行图标的垂直位置。
//
// 条目是两行网格：text 在第 1 行、description 在第 2 行，prefix / indicator / suffix / shortcut 跨两行居中。
// 各皮肤为了省略号给 text 槽写了 overflow: hidden，它因此成为滚动容器、自动最小尺寸归 0；
// 轨道尺寸算法处理跨行图标时会把图标高度平均分给两行，没有说明的条目也会长出半个图标高的第 2 行，
// 图标因此整体下沉。这一整套只有真实浏览器的网格算法才量得出来，jsdom 既不排版也不解析网格。
//
// 断言不写魔法数：期望高度从条目自己的计算值（padding-block + line-height）推出来。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import { XhComboboxRoot, XhSelectRoot, XhTreeSelectRoot } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

const OPTIONS = [
  { value: 'alpha', label: 'Alpha' },
  { value: 'beta', label: 'Beta' },
  { value: 'gamma', label: 'Gamma', disabled: true },
]

const TREE = [
  { value: 'group', label: '团队', children: [{ value: 'one', label: '设计' }, { value: 'two', label: '研发' }] },
  { value: 'three', label: '外部' },
]

afterEach(() => {
  app?.unmount()
  host?.remove()
  document.getElementById('xh-portal-root')?.remove()
  app = null
  host = null
})

/** 浮层有 pop-in 进场，播放期间整块被 scale；等它跑完再量矩形 */
async function settle(): Promise<void> {
  await nextTick()
  await nextTick()
  const portal = document.getElementById('xh-portal-root')
  if (portal)
    await Promise.all(portal.getAnimations({ subtree: true }).map(animation => animation.finished.catch(() => undefined)))
}

async function mount(render: () => ReturnType<typeof h>): Promise<void> {
  host = document.createElement('div')
  document.body.append(host)
  app = createApp({ render })
  app.mount(host)
  await settle()
}

function rows(scope: string, parts: readonly string[]): HTMLElement[] {
  const selector = parts.map(part => `[data-scope='${scope}'][data-part='${part}']`).join(', ')
  const found = [...document.querySelectorAll<HTMLElement>(selector)]
  if (found.length === 0)
    throw new Error(`找不到 ${scope} 的条目：${parts.join(' / ')}`)
  return found
}

function slot(row: HTMLElement, name: string): HTMLElement {
  const element = row.querySelector<HTMLElement>(`[data-xh-collection-slot='${name}']`)
  if (!element)
    throw new Error(`条目缺少 ${name} 槽`)
  return element
}

/** 家族裸条目：各槽用普通 span，text 槽照各皮肤写 overflow: hidden（省略号），glyph 槽给定尺盒 */
function rawItem(slots: readonly string[]): HTMLElement {
  const item = document.createElement('div')
  item.setAttribute('data-xh-collection-item', '')
  item.setAttribute('data-xh-collection-size', 'md')
  item.setAttribute('data-xh-collection-context', 'overlay')
  for (const name of slots) {
    const child = document.createElement('span')
    child.dataset.xhCollectionSlot = name
    child.dataset.part = name
    if (name === 'text' || name === 'description') {
      child.textContent = name === 'text' ? '正文' : '说明'
      child.style.overflow = 'hidden'
      child.style.whiteSpace = 'nowrap'
      child.style.textOverflow = 'ellipsis'
    }
    else {
      child.style.display = 'inline-flex'
      child.style.inlineSize = 'var(--xh-icon-size)'
      child.style.blockSize = 'var(--xh-icon-size)'
      child.style.visibility = 'visible'
    }
    item.append(child)
  }
  host!.append(item)
  return item
}

function centerY(element: Element): number {
  const rect = element.getBoundingClientRect()
  return rect.top + rect.height / 2
}

/** 第二条轨道的解析值（px） */
function secondRow(row: HTMLElement): number {
  const tracks = getComputedStyle(row).gridTemplateRows.split(' ')
  expect(tracks).toHaveLength(2)
  return Number.parseFloat(tracks[1]!)
}

/** 没有说明槽的条目：单行高 = 上下块内距 + 行高 */
function expectSingleLine(row: HTMLElement, glyphParts: readonly string[]): void {
  const style = getComputedStyle(row)
  expect(style.display).toBe('grid')
  expect(secondRow(row)).toBe(0)

  const expected = Number.parseFloat(style.paddingBlockStart)
    + Number.parseFloat(style.paddingBlockEnd)
    + Number.parseFloat(style.lineHeight)
  expect(row.getBoundingClientRect().height).toBeCloseTo(expected, 1)

  const text = slot(row, 'text')
  for (const part of glyphParts) {
    const glyph = row.querySelector<HTMLElement>(`[data-part='${part}']`)
    if (!glyph)
      throw new Error(`条目缺少 ${part}`)
    expect(Math.abs(centerY(glyph) - centerY(text)), `${part} 应与文字同一中线`).toBeLessThanOrEqual(0.5)
  }
}

describe('浮层集合条目的行高', () => {
  it('select：条目回到单行高，对号与文字同一中线', async () => {
    await mount(() => h(XhSelectRoot, { collection: OPTIONS, defaultOpen: true, defaultValue: 'beta' }))
    const items = rows('select', ['item'])
    expect(items).toHaveLength(OPTIONS.length)
    for (const item of items)
      expectSingleLine(item, ['item-indicator'])
  })

  it('tree-select：叶子与分支行同高，展开箭头与对号都与文字同一中线', async () => {
    await mount(() => h(XhTreeSelectRoot, {
      collection: TREE,
      open: true,
      defaultValue: ['one'],
      defaultExpandedValue: ['group'],
    }))
    const leaves = rows('tree-select', ['item'])
    const branches = rows('tree-select', ['branch-control'])
    expect(leaves).toHaveLength(3)
    expect(branches).toHaveLength(1)
    for (const leaf of leaves)
      expectSingleLine(leaf, ['item-indicator'])
    for (const branch of branches)
      expectSingleLine(branch, ['branch-trigger', 'item-indicator'])
    expect(branches[0]!.getBoundingClientRect().height).toBeCloseTo(leaves[0]!.getBoundingClientRect().height, 1)
  })

  it('combobox：候选回到单行高，对号与文字同一中线', async () => {
    await mount(() => h(XhComboboxRoot, { collection: OPTIONS, defaultOpen: true, defaultValue: 'beta' }))
    const items = rows('combobox', ['item'])
    expect(items).toHaveLength(OPTIONS.length)
    for (const item of items)
      expectSingleLine(item, ['item-indicator'])
  })

  // Menu 家族的条目走 flex（说明靠 flex-wrap 折行），没有哪个已发布组件在家族网格上摆说明槽；
  // 说明行的合同直接用家族的裸条目验证：text 槽照皮肤的做法写 overflow: hidden。
  it('裸条目：说明行只在有说明时长，且正好是说明的高度', async () => {
    await mount(() => h('div'))
    const item = rawItem(['prefix', 'text', 'indicator'])
    expectSingleLine(item, ['prefix', 'indicator'])

    const described = rawItem(['prefix', 'text', 'description', 'indicator'])
    const text = slot(described, 'text')
    const description = slot(described, 'description')
    const descriptionHeight = description.getBoundingClientRect().height
    expect(descriptionHeight).toBeGreaterThan(0)
    expect(secondRow(described)).toBeCloseTo(descriptionHeight, 1)
    expect(description.getBoundingClientRect().top).toBeGreaterThanOrEqual(text.getBoundingClientRect().bottom)

    const style = getComputedStyle(described)
    const expected = Number.parseFloat(style.paddingBlockStart)
      + Number.parseFloat(style.paddingBlockEnd)
      + text.getBoundingClientRect().height
      + descriptionHeight
    expect(described.getBoundingClientRect().height).toBeCloseTo(expected, 1)
    expect(described.getBoundingClientRect().height).toBeGreaterThan(item.getBoundingClientRect().height)

    // 跨行图标比文字高时，多出的高度归第 1 行，说明行仍是 0，图标与文字同一中线
    const tall = rawItem(['prefix', 'text', 'indicator'])
    const glyph = slot(tall, 'indicator')
    const lineHeight = Number.parseFloat(getComputedStyle(tall).lineHeight)
    glyph.style.blockSize = `${lineHeight + 9}px`
    expect(secondRow(tall)).toBe(0)
    expect(Number.parseFloat(getComputedStyle(tall).gridTemplateRows.split(' ')[0]!)).toBeCloseTo(lineHeight + 9, 1)
    expect(Math.abs(centerY(glyph) - centerY(slot(tall, 'text')))).toBeLessThanOrEqual(0.5)
  })
})
