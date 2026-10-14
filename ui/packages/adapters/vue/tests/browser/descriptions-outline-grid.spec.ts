// 描边档的网格：标签在左时同一列的标签收到该列最长的那个，格线逐条只画一道。
//
// 两处缺陷都在一份审批详情里复现过：两列、描边、标签在左，依次是
// 「申请人、状态、申请对象（跨 2）、申请原因（跨 2）、期望有效期（跨 2）、申请时间」。
// 一是每格自成一个网格，标签列宽各取各的：上下行标签长短不一，标签与取值之间那道竖线就错开；
// 二是格线按奇偶序号拼：跨列的格把后面的序号整体错开，「申请原因」「申请时间」落在行首却按偶数格补了左边线，
// 与外框叠成两道；最后一行只剩一格时，空着那半边上方的分隔线没有人画。
//
// 量的是截图里的像素：线由谁画（格的边、伪元素还是间隙）不论，只认画出来的是不是恰好一道、
// 颜色是不是与外框同一种——同一道线画两遍，半透明的线色会叠深一档，与外框对不上。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { cdp, page } from 'vitest/browser'
import { createApp, h, nextTick } from 'vue'
import {
  XhDescriptionsItem,
  XhDescriptionsLabel,
  XhDescriptionsRoot,
  XhDescriptionsValue,
} from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

interface Row { label: string, value: string, span?: number }

/** 复现场景：两列，中间三格各跨两列，最后一行只剩一格。 */
const APPROVAL: Row[] = [
  { label: '申请人', value: '张三' },
  { label: '状态', value: '待审批' },
  { label: '申请对象', value: '财务部 · 报销审批', span: 2 },
  { label: '申请原因', value: '季度结算期间临时代审', span: 2 },
  { label: '期望有效期', value: '2026-10-14 至 2026-11-14', span: 2 },
  { label: '申请时间', value: '2026-10-14 09:30' },
]

/** 两列各有长短不一的标签：第二列「当前状态」与「状态」也要收成一列。 */
const MIXED: Row[] = [
  { label: '申请人', value: '张三' },
  { label: '当前状态', value: '待审批' },
  { label: '期望有效期', value: '30 天' },
  { label: '状态', value: '有效' },
  { label: '备注', value: '—', span: 2 },
]

type Size = 'sm' | 'md' | 'lg'

let app: App | null = null
let host: HTMLElement | null = null

afterEach(async () => {
  app?.unmount()
  host?.remove()
  app = null
  host = null
  delete document.documentElement.dataset.theme
  await cdp().send('Emulation.setEmulatedMedia', { media: '', features: [] })
})

async function mount(rows: Row[], props: { columns?: 2 | 4, size?: Size, dir?: 'rtl' } = {}): Promise<HTMLElement> {
  host = document.createElement('div')
  // 整数像素落位：截图的像素与 getBoundingClientRect 一一对应，不被半像素抹开
  host.style.cssText = 'inline-size: 720px; max-inline-size: 100%; padding: 8px; box-sizing: border-box'
  if (props.dir)
    host.dir = props.dir
  document.body.append(host)
  app = createApp({
    setup: () => () => h(XhDescriptionsRoot, {
      columns: props.columns ?? 2,
      variant: 'outline',
      placement: 'left',
      size: props.size,
    }, () => rows.map(row => h(XhDescriptionsItem, { key: row.label, span: row.span }, () => [
      h(XhDescriptionsLabel, null, () => row.label),
      h(XhDescriptionsValue, null, () => row.value),
    ]))),
  })
  app.mount(host)
  await nextTick()
  return host.querySelector<HTMLElement>('[data-part=\'root\']')!
}

function parts(root: HTMLElement, part: 'item' | 'label' | 'value'): HTMLElement[] {
  return [...root.querySelectorAll<HTMLElement>(`[data-part='${part}']`)]
}

// ── 像素取样 ──

interface Shot { data: Uint8ClampedArray, width: number, height: number, scale: number }

async function shoot(element: HTMLElement): Promise<Shot> {
  const base64 = await page.screenshot({ element, save: false })
  const blob = await (await fetch(`data:image/png;base64,${base64}`)).blob()
  const bitmap = await createImageBitmap(blob)
  const canvas = new OffscreenCanvas(bitmap.width, bitmap.height)
  const context = canvas.getContext('2d')!
  context.drawImage(bitmap, 0, 0)
  const { data } = context.getImageData(0, 0, bitmap.width, bitmap.height)
  const scale = bitmap.width / element.getBoundingClientRect().width
  // 测试页比运行器的窗口高时会被整体缩小，一像素的线经重采样糊成两道浅色——视口高度要留在窗口以内
  if (scale !== 1)
    throw new Error(`截图按 ${scale} 缩放过，线色取不准：把 page.viewport 的高度调小`)
  return { data, width: bitmap.width, height: bitmap.height, scale }
}

function pixel(shot: Shot, x: number, y: number): [number, number, number] {
  const i = (y * shot.width + x) * 4
  return [shot.data[i]!, shot.data[i + 1]!, shot.data[i + 2]!]
}

function sameColor(a: readonly number[], b: readonly number[]): boolean {
  return a.every((channel, i) => Math.abs(channel - b[i]!) <= 2)
}

/**
 * 量一道线：在线的法向上取 pos ± 3 这一小段，数出与线色相同的像素有几个。
 * 恰好一道线 → 1；没画 → 0；画了两道或同一道叠了两遍（颜色叠深、与线色不再相同）→ 不是 1。
 * pos 与 at 都是相对根边框盒的 CSS px。
 */
function lineHits(shot: Shot, line: readonly number[], axis: 'x' | 'y', pos: number, at: number): number {
  const limit = axis === 'x' ? shot.width : shot.height
  const fixed = Math.round(at * shot.scale)
  const center = Math.round(pos * shot.scale)
  let hits = 0
  for (let p = Math.max(0, center - 3); p <= Math.min(limit - 1, center + 3); p++) {
    const color = axis === 'x' ? pixel(shot, p, fixed) : pixel(shot, fixed, p)
    if (sameColor(color, line))
      hits++
  }
  return hits
}

/** 竖着数一段：from 到 to（相对根边框盒的 CSS px）之间与线色相同的像素有几个。 */
function rangeHits(shot: Shot, line: readonly number[], from: number, to: number, x: number): number {
  const fixed = Math.round(x * shot.scale)
  let hits = 0
  for (let y = Math.floor(from * shot.scale); y < Math.ceil(to * shot.scale); y++) {
    if (sameColor(pixel(shot, fixed, y), line))
      hits++
  }
  return hits
}

/** 部件相对根边框盒的位置。 */
function box(root: HTMLElement, el: HTMLElement) {
  const r = root.getBoundingClientRect()
  const b = el.getBoundingClientRect()
  return {
    left: b.left - r.left,
    right: b.right - r.left,
    top: b.top - r.top,
    bottom: b.bottom - r.top,
    midX: (b.left + b.right) / 2 - r.left,
    midY: (b.top + b.bottom) / 2 - r.top,
  }
}

/**
 * 审批场景的全部格线：外框、行间横线、列间竖线、标签与取值之间的竖线，跨列格里与残行里不该有的线。
 * 每一处都要求恰好一道、与外框同色。
 */
async function expectApprovalGrid(root: HTMLElement): Promise<void> {
  const shot = await shoot(root)
  const width = root.getBoundingClientRect().width
  const height = root.getBoundingClientRect().height
  // 线色以外框为准：上边框正中，避开圆角
  const line = pixel(shot, Math.round(shot.width / 2), 0)
  const labels = parts(root, 'label')
  const values = parts(root, 'value')
  const [applicant, status, target, reason, period, time] = labels.map(el => box(root, el))
  const [applicantValue, statusValue, targetValue, reasonValue, periodValue, timeValue] = values.map(el => box(root, el))

  // 第二列的起点：「状态」那格的标签左缘前一像素就是两列之间那道竖线
  const columnLine = status!.left - 1
  // 第一列标签与取值之间那道竖线：五行同一个位置
  const dividerX = applicantValue!.left - 1
  const firstColumn = [['申请人', applicant], ['申请对象', target], ['申请原因', reason], ['期望有效期', period], ['申请时间', time]] as const

  // 外框：四边各一道，里面不再贴一道格线（跨列的格、残行的格落在行首也一样）
  expect(lineHits(shot, line, 'y', 0, applicant!.midX), '上外框').toBe(1)
  expect(lineHits(shot, line, 'y', height - 1, time!.midX), '下外框（残行的标签格）').toBe(1)
  expect(lineHits(shot, line, 'y', height - 1, (columnLine + width) / 2), '下外框（残行空着的那半边）').toBe(1)
  for (const [name, row] of firstColumn) {
    expect(lineHits(shot, line, 'x', 0, row!.midY), `${name}一行的左外框`).toBe(1)
    expect(lineHits(shot, line, 'x', width - 1, row!.midY), `${name}一行的右外框`).toBe(1)
  }
  expect(lineHits(shot, line, 'x', width - 1, status!.midY), '状态一行的右外框').toBe(1)

  // 行与行之间：横线贯穿整行。逐格量一道；与竖线的交点只取那一个像素——叠画两遍会比线色深
  const boundaries = [
    { name: '第一行与申请对象', y: target!.top - 1, xs: [applicant!.midX, applicantValue!.midX, status!.midX, statusValue!.midX], crossings: [dividerX, columnLine, statusValue!.left - 1] },
    { name: '申请对象与申请原因', y: reason!.top - 1, xs: [target!.midX, targetValue!.midX, columnLine], crossings: [dividerX] },
    { name: '申请原因与期望有效期', y: period!.top - 1, xs: [reason!.midX, reasonValue!.midX, columnLine], crossings: [dividerX] },
    // 残行：空着那半边的上方也要有线
    { name: '期望有效期与申请时间', y: time!.top - 1, xs: [period!.midX, periodValue!.midX, columnLine, (columnLine + width) / 2], crossings: [dividerX] },
  ]
  for (const boundary of boundaries) {
    for (const x of boundary.xs)
      expect(lineHits(shot, line, 'y', boundary.y, x), `${boundary.name}（x=${Math.round(x)}）`).toBe(1)
    for (const x of boundary.crossings)
      expect(sameColor(pixel(shot, Math.round(x), Math.round(boundary.y)), line), `${boundary.name}与竖线的交点（x=${Math.round(x)}）`).toBe(true)
  }

  // 第一行两格之间一道竖线；跨两列的三格取值横贯两列，中间不该有竖线
  expect(lineHits(shot, line, 'x', columnLine, applicant!.midY), '第一行两格之间').toBe(1)
  for (const [name, row] of [['申请对象', target], ['申请原因', reason], ['期望有效期', period]] as const)
    expect(lineHits(shot, line, 'x', columnLine, row!.midY), `${name}的取值里`).toBe(0)
  // 残行：最后一格补满整行，与空着那半边之间不画竖线
  expect(lineHits(shot, line, 'x', columnLine, time!.midY), '申请时间与空着那半边之间').toBe(0)

  // 标签与取值之间一道竖线，与外框同色：第一列五行落在同一个横坐标上，「状态」自己一道
  for (const [name, row] of firstColumn)
    expect(lineHits(shot, line, 'x', dividerX, row!.midY), `${name}一行的标签分隔线`).toBe(1)
  expect(lineHits(shot, line, 'x', statusValue!.left - 1, status!.midY), '状态的标签分隔线').toBe(1)
  expect(timeValue!.left - 1).toBe(dividerX)
}

describe('descriptions 描边 + 标签在左：同一列的标签收成一列', () => {
  it('审批场景：第一列五格的标签右缘、取值左缘各在同一条线上', async () => {
    await page.viewport(1100, 600)
    const root = await mount(APPROVAL)
    const labels = parts(root, 'label')
    const values = parts(root, 'value')
    const firstColumn = [0, 2, 3, 4, 5]

    expect(new Set(firstColumn.map(i => Math.round(labels[i]!.getBoundingClientRect().right))).size).toBe(1)
    expect(new Set(firstColumn.map(i => Math.round(values[i]!.getBoundingClientRect().left))).size).toBe(1)
    // 收到的是最长那个标签：「期望有效期」的标签格不比别人窄
    const widths = firstColumn.map(i => labels[i]!.getBoundingClientRect().width)
    expect(Math.max(...widths) - Math.min(...widths)).toBeLessThan(1)
    expect(labels[4]!.scrollWidth).toBeLessThanOrEqual(labels[4]!.clientWidth)
  })

  it('两列各自收：第二列按它自己最长的标签对齐，不跟第一列取同一个宽', async () => {
    await page.viewport(1100, 600)
    const root = await mount(MIXED)
    const labels = parts(root, 'label')
    const right = (i: number) => Math.round(labels[i]!.getBoundingClientRect().right)

    // 第一列：申请人、期望有效期、备注（跨两列，标签仍在第一列的标签轨道里）
    expect(new Set([0, 2, 4].map(right)).size).toBe(1)
    // 第二列：当前状态、状态
    expect(right(1)).toBe(right(3))
    expect(Math.round(labels[1]!.getBoundingClientRect().width)).toBe(Math.round(labels[3]!.getBoundingClientRect().width))
    // 第二列只收到「当前状态」，比第一列收到的「期望有效期」窄
    expect(labels[3]!.getBoundingClientRect().width).toBeLessThan(labels[2]!.getBoundingClientRect().width)
  })

  it('外部覆盖：写了 --xh-descriptions-label-w 就按它定宽，两列一样宽', async () => {
    await page.viewport(1100, 600)
    const root = await mount(MIXED)
    root.style.setProperty('--xh-descriptions-label-w', '160px')
    const labels = parts(root, 'label')

    // 量淡底那一块（内边距盒）：标签与取值之间那道竖线画在两条轨道中间的间隙里，不占标签轨道
    for (const i of [0, 1, 2, 3, 4])
      expect(labels[i]!.clientWidth, labels[i]!.textContent!).toBe(160)
  })

  it.each([[900, '中档：四列摆成两列'], [1100, '宽档：四列']] as const)('%ipx 四列（%s）：同一列的标签对齐', async (viewport, _tier) => {
    await page.viewport(viewport, 600)
    const rows: Row[] = [
      { label: '编号', value: 'A-1' },
      { label: '负责人', value: '张三' },
      { label: '创建时间', value: '09:30' },
      { label: '状态', value: '有效' },
      { label: '所属部门', value: '财务部' },
      { label: '备注', value: '—' },
      { label: '最后修改人', value: '李四' },
      { label: '级别', value: '一级' },
    ]
    const root = await mount(rows, { columns: 4 })
    const labels = parts(root, 'label')
    // 按标签起点分组：同一个起点就是同一列
    const columns = new Map<number, number[]>()
    for (const label of labels) {
      const rect = label.getBoundingClientRect()
      const key = Math.round(rect.left)
      columns.set(key, [...(columns.get(key) ?? []), Math.round(rect.right)])
    }
    expect(columns.size).toBe(viewport === 900 ? 2 : 4)
    for (const [left, rights] of columns)
      expect(new Set(rights).size, `起点 ${left} 的那一列`).toBe(1)
  })

  it('从右往左书写：标签在右，同一列的标签左缘对齐，取值紧贴在标签左侧', async () => {
    await page.viewport(1100, 600)
    const root = await mount(APPROVAL, { dir: 'rtl' })
    const labels = parts(root, 'label')
    const values = parts(root, 'value')
    const firstColumn = [0, 2, 3, 4, 5]

    expect(new Set(firstColumn.map(i => Math.round(labels[i]!.getBoundingClientRect().left))).size).toBe(1)
    for (const i of firstColumn)
      expect(Math.round(values[i]!.getBoundingClientRect().right)).toBe(Math.round(labels[i]!.getBoundingClientRect().left))
  })
})

describe('descriptions 描边档的格线：每条只画一道，跨列与残行不错位', () => {
  it.each(['sm', 'md', 'lg'] as const)('审批场景 %s 档：外框、行线、列线、标签分隔线都恰好一道', async (size) => {
    await page.viewport(1100, 600)
    await expectApprovalGrid(await mount(APPROVAL, { size }))
  })

  it('审批场景暗色：同一套格线，颜色与暗色外框一致', async () => {
    await page.viewport(1100, 600)
    document.documentElement.dataset.theme = 'dark'
    await expectApprovalGrid(await mount(APPROVAL))
  })

  it('高对比档：格线换成系统墨色照样画出来，不靠背景或阴影', async () => {
    await page.viewport(1100, 600)
    await cdp().send('Emulation.setEmulatedMedia', { features: [{ name: 'forced-colors', value: 'active' }] })
    const root = await mount(APPROVAL)
    const shot = await shoot(root)
    const line = pixel(shot, Math.round(shot.width / 2), 0)
    const [applicant, , target] = parts(root, 'label').map(el => box(root, el))
    const applicantValue = box(root, parts(root, 'value')[0]!)

    expect(lineHits(shot, line, 'y', target!.top - 1, applicantValue.midX)).toBe(1)
    expect(lineHits(shot, line, 'x', applicantValue.left - 1, applicant!.midY)).toBe(1)
  })

  it('窄档（标签回到上方）：一行一格，行线一道，左右不贴第二道竖线', async () => {
    await page.viewport(375, 600)
    const root = await mount(APPROVAL)
    expect(window.matchMedia('(min-width: 768px)').matches).toBe(false)
    const shot = await shoot(root)
    const line = pixel(shot, Math.round(shot.width / 2), 0)
    const width = root.getBoundingClientRect().width
    const items = parts(root, 'item').map(el => box(root, el))
    const labels = parts(root, 'label').map(el => box(root, el))
    const values = parts(root, 'value').map(el => box(root, el))

    // 窄档标签在上：每格独占一行
    expect(new Set(items.map(item => Math.round(item.top))).size).toBe(items.length)
    for (let i = 1; i < labels.length; i++) {
      // 上一格取值的下缘与这一格标签的上缘之间是两格的内距，中间恰好一道横线
      expect(rangeHits(shot, line, values[i - 1]!.bottom, labels[i]!.top, labels[i]!.midX), `第 ${i} 条行线`).toBe(1)
    }
    for (const label of labels) {
      expect(lineHits(shot, line, 'x', 0, label.midY)).toBe(1)
      expect(lineHits(shot, line, 'x', width - 1, label.midY)).toBe(1)
    }
  })

  it('外框不是滚动容器：格线探到框外的那一像素滚不出来', async () => {
    await page.viewport(1100, 600)
    const root = await mount(APPROVAL)
    root.scrollLeft = 10
    root.scrollTop = 10

    expect(root.scrollLeft).toBe(0)
    expect(root.scrollTop).toBe(0)
  })
})
