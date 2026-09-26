// 饼图在真实布局里的几何：扇区铺满一整圈、环形中心落在圆心上且不超出内圈，
// 悬停时其余扇区淡出、被指着的扇区不位移，焦点环画在扇区外，半环的中心在弦的上方；入场时整圈从 12 点顺着扫开。
// jsdom 量不出这些，只在 Chromium 验证。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { createApp, h, nextTick, reactive } from 'vue'
import { XhPieChartRoot } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

const CHANNELS = [
  { channel: '搜索', visits: 40 },
  { channel: '直接访问', visits: 30 },
  { channel: '社交', visits: 20 },
  { channel: '邮件', visits: 10 },
]

function mount(props: Record<string, unknown>, width = 480): Record<string, unknown> {
  host = document.createElement('div')
  host.style.inlineSize = `${width}px`
  document.body.append(host)
  // 几何用例看终态；过渡用例显式打开 animated
  const state = reactive({ data: CHANNELS, nameField: 'channel', valueField: 'visits', animated: false, ...props })
  app = createApp({
    render: () => h(XhPieChartRoot, state, { caption: () => '访问来源' }),
  })
  app.mount(host)
  return state
}

async function settle(): Promise<void> {
  await nextTick()
  // 视口量测按帧合并，等两帧让尺寸与度量都落下来
  await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))
  await nextTick()
}

function all(name: string): Element[] {
  return [...document.querySelectorAll(`[data-scope='pie-chart'][data-part='${name}']`)]
}

function one(name: string): HTMLElement {
  const element = all(name)[0]
  if (!element)
    throw new Error(`找不到 pie-chart/${name}`)
  return element as HTMLElement
}

/** 几个扇区合起来的外接框：一整圈时是一个正方形。 */
function union(rects: DOMRect[]): { left: number, top: number, right: number, bottom: number } {
  return {
    left: Math.min(...rects.map(r => r.left)),
    top: Math.min(...rects.map(r => r.top)),
    right: Math.max(...rects.map(r => r.right)),
    bottom: Math.max(...rects.map(r => r.bottom)),
  }
}

afterEach(async () => {
  app?.unmount()
  host?.remove()
  app = null
  host = null
  await userEvent.hover(document.querySelector<HTMLElement>('[data-test-park-pointer]')!)
})

describe('扇区与中心', () => {
  it('扇区铺满一整圈：合起来的外接框是正方形，居中在视口里', async () => {
    mount({ labels: 'none' })
    await settle()
    const box = union(all('slice').map(el => el.getBoundingClientRect()))
    const viewport = one('viewport').getBoundingClientRect()
    expect(Math.abs((box.right - box.left) - (box.bottom - box.top))).toBeLessThanOrEqual(2)
    expect(Math.abs((box.left + box.right) / 2 - (viewport.left + viewport.right) / 2)).toBeLessThanOrEqual(1)
    expect(Math.abs((box.top + box.bottom) / 2 - (viewport.top + viewport.bottom) / 2)).toBeLessThanOrEqual(1)
  })

  it('环形中心落在圆心上，宽度不超出内圈', async () => {
    mount({ labels: 'none' })
    await settle()
    const box = union(all('slice').map(el => el.getBoundingClientRect()))
    const center = one('center').getBoundingClientRect()
    expect(Math.abs((center.left + center.right) / 2 - (box.left + box.right) / 2)).toBeLessThanOrEqual(1)
    expect(Math.abs((center.top + center.bottom) / 2 - (box.top + box.bottom) / 2)).toBeLessThanOrEqual(1)
    // 内径是外径的 0.6，中心最宽取内径的八成
    expect(center.width).toBeLessThanOrEqual((box.right - box.left) * 0.6 * 0.8 + 1)
    expect(one('center').textContent).toContain('100')
  })

  it('半环：中心整块在弦的上方', async () => {
    mount({ labels: 'none', sweep: 'half' })
    await settle()
    const box = union(all('slice').map(el => el.getBoundingClientRect()))
    const center = one('center').getBoundingClientRect()
    expect(center.bottom).toBeLessThanOrEqual(box.bottom + 1)
    expect(center.top).toBeGreaterThan(box.top)
  })
})

describe('强调与焦点', () => {
  it('悬停一个扇区：其余扇区淡出，被指着的扇区不位移', async () => {
    mount({ labels: 'none' })
    await settle()
    const slices = all('slice')
    const before = slices[0]!.getBoundingClientRect()
    // 外接框的中心落在环的空洞里：取第一个扇区环厚中线、中间角度处（它占 0–144°）
    const plot = one('plot')
    const rect = plot.getBoundingClientRect()
    const ring = union(slices.map(el => el.getBoundingClientRect()))
    const r = ((ring.right - ring.left) / 2) * 0.8
    const angle = (72 * Math.PI) / 180
    await userEvent.hover(plot, { position: { x: rect.width / 2 + Math.sin(angle) * r, y: rect.height / 2 - Math.cos(angle) * r } })
    await settle()
    expect(one('tooltip').dataset.state).toBe('visible')
    expect(Number(getComputedStyle(slices[0]!).opacity)).toBe(1)
    expect(Number(getComputedStyle(slices[1]!).opacity)).toBeLessThan(1)
    const after = slices[0]!.getBoundingClientRect()
    expect(after.left).toBeCloseTo(before.left, 1)
    expect(after.top).toBeCloseTo(before.top, 1)
  })

  it('键盘聚焦：焦点环画在扇区外，右键顺时针移到下一个扇区', async () => {
    mount({ labels: 'none' })
    await settle()
    ;(all('slice')[0] as HTMLElement).focus()
    await userEvent.keyboard('{ArrowRight}')
    await settle()
    const slice = all('slice')[1]!
    expect(document.activeElement).toBe(slice)
    const ring = one('focus-ring').getBoundingClientRect()
    const box = slice.getBoundingClientRect()
    expect(ring.left).toBeLessThanOrEqual(box.left)
    expect(ring.right).toBeGreaterThanOrEqual(box.right)
    expect(ring.bottom).toBeGreaterThanOrEqual(box.bottom)
  })
})

describe('过渡', () => {
  it('入场：整圈从 12 点顺着扫开，外接框还没合成整圆；关掉 animated 直接落到整圈', async () => {
    // 把时长拉长到几秒：量第一帧时过渡一定还在半路，不受机器快慢影响。写在根上随挂载生效，不与起跑抢先后
    const state = mount({ labels: 'none', animated: true, style: '--xh-motion-duration-reveal: 4s' })
    await settle()
    const early = union(all('slice').map(el => el.getBoundingClientRect()))
    // 环形中心等整圈扫完再出现：扫开途中是透明的
    expect(Number(getComputedStyle(one('center')).opacity)).toBe(0)
    state.animated = false
    await settle()
    const final = union(all('slice').map(el => el.getBoundingClientRect()))
    // 扫开的前一小段落在 12 点右侧：宽度远不到整圆，顶边已经贴着整圆的顶
    expect(early.right - early.left).toBeLessThan((final.right - final.left) * 0.6)
    expect(early.left).toBeGreaterThanOrEqual((final.left + final.right) / 2 - 1)
    expect(Math.abs(early.top - final.top)).toBeLessThanOrEqual(1)
    expect(Number(getComputedStyle(one('center')).opacity)).toBe(1)
  })
})
