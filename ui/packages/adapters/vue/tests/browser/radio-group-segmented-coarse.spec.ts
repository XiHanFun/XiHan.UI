// 粗指针下 radio-group segmented 形态段的命中区：伪元素补足到粗指针命中下限（--xh-control-hit-coarse），
// 却不许抢别的段与上方标签的落点。竖排与折行时段与段沿块轴首尾相接，外扩的命中区必然叠进相邻段的盒——
// 叠上的那一截要归盒子本来所在的那一段，点前一段的下半截不能选中后一段；轨道上沿外扩出去的那一截不越过字段标签。
// 命中归属只能在真实布局里按落点实测（elementFromPoint），jsdom 量不出来。
import { afterEach, describe, expect, it } from 'vitest'
import { coarsePointer, finePointer, pseudoBox } from './pseudo-box'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

/** 粗指针命中区下限（WCAG 2.5.5）。 */
const COARSE_MIN = 44

let host: HTMLElement | null = null

afterEach(async () => {
  await finePointer()
  host?.remove()
  host = null
})

interface Options {
  orientation?: 'horizontal' | 'vertical'
  size?: 'sm' | 'md' | 'lg'
  /** 夹具宽：给窄了横排就折行。 */
  width?: string
  density?: 'compact'
}

/** 字段里的一条分段轨道：字段标签在上，轨道里四段（选中第一段），每段定宽 64px。 */
function mount(options: Options = {}) {
  const { orientation = 'horizontal', size = 'md', width = '480px', density } = options
  host = document.createElement('div')
  host.style.cssText = `inline-size: ${width}; padding: 64px`
  if (density)
    host.dataset.density = density
  const sized = size === 'md' ? '' : ` data-size="${size}"`
  host.innerHTML = `
    <div data-scope="field" class="xh-scope-field" data-part="root">
      <label data-scope="field" class="xh-scope-field" data-part="label">视图</label>
      <div data-scope="radio-group" class="xh-scope-radio-group" data-part="root" data-variant="segmented" data-orientation="${orientation}"${sized} role="radiogroup" aria-label="视图">
        ${['日', '周', '月', '年'].map((text, index) => `
        <div data-scope="radio-group" class="xh-scope-radio-group" data-part="item" role="radio" data-state="${index === 0 ? 'checked' : 'unchecked'}" style="inline-size:64px">${text}</div>`).join('')}
      </div>
    </div>`
  document.body.append(host)
  return {
    label: host.querySelector<HTMLElement>('[data-scope="field"][data-part="label"]')!,
    track: host.querySelector<HTMLElement>('[data-scope="radio-group"][data-part="root"]')!,
    items: [...host.querySelectorAll<HTMLElement>('[data-scope="radio-group"][data-part="item"]')],
  }
}

/** 落点归属：落在哪一段上（段内文字等后代都算这一段），一段都不是就返回 null。 */
function segmentAt(items: HTMLElement[], x: number, y: number): HTMLElement | null {
  const hit = document.elementFromPoint(x, y)
  return items.find(item => item === hit || item.contains(hit)) ?? null
}

describe('粗指针下 segmented 段的命中区', () => {
  it('竖排：相邻两段交界两侧各一像素归各自那一段，外扩的命中区不抢上一段的下半截', async () => {
    await coarsePointer()
    const { items } = mount({ orientation: 'vertical' })
    for (let i = 0; i < items.length - 1; i++) {
      const upper = items[i]!.getBoundingClientRect()
      const lower = items[i + 1]!.getBoundingClientRect()
      const x = upper.left + upper.width / 2
      expect(segmentAt(items, x, upper.bottom - 1), `第 ${i + 1} 段下缘`).toBe(items[i])
      expect(segmentAt(items, x, lower.top + 1), `第 ${i + 2} 段上缘`).toBe(items[i + 1])
      // 上一段下半截整片都归它自己
      expect(segmentAt(items, x, upper.top + upper.height * 3 / 4), `第 ${i + 1} 段下半截`).toBe(items[i])
    }
  })

  it('横排折行：上一行的段下半截归它自己，下一行同列的段不抢', async () => {
    await coarsePointer()
    // 内容区 160px：一行只排得下两段（64 × 2 + 轨道衬距与描边），四段折成两行
    const { items } = mount({ width: '160px' })
    const [first, , third] = items.map(item => item.getBoundingClientRect())
    expect(third!.top, '夹具应当折行').toBeGreaterThanOrEqual(first!.bottom - 0.5)
    const x = first!.left + first!.width / 2
    expect(segmentAt(items, x, first!.bottom - 1)).toBe(items[0])
    expect(segmentAt(items, x, first!.top + first!.height * 3 / 4)).toBe(items[0])
    expect(segmentAt(items, x, third!.top + 1)).toBe(items[2])
  })

  it.each([
    ['sm', undefined],
    ['md', undefined],
    ['lg', undefined],
    ['sm', 'compact'],
  ] as const)('单行 %s 档（%s）：命中区补足到下限，上沿不越过字段标签', async (size, density) => {
    await coarsePointer()
    const { label, track, items } = mount({ size, density })
    const labelRect = label.getBoundingClientRect()
    const trackRect = track.getBoundingClientRect()
    for (const item of items) {
      const box = pseudoBox(item, '::before')
      const observed = `::before ${JSON.stringify(box)} track ${JSON.stringify(trackRect)} label ${JSON.stringify(labelRect)}`
      expect(box.height, observed).toBeGreaterThanOrEqual(COARSE_MIN)
      expect(box.y, observed).toBeGreaterThanOrEqual(labelRect.bottom)
      // 轨道外上下两缘内侧一像素实测归这一段
      const rect = item.getBoundingClientRect()
      const x = rect.left + rect.width / 2
      expect(segmentAt(items, x, box.y + 1), observed).toBe(item)
      expect(segmentAt(items, x, box.y + box.height - 1), observed).toBe(item)
    }
    // 点在字段标签下缘仍归标签
    const hit = document.elementFromPoint(labelRect.left + 4, labelRect.bottom - 1)
    expect(hit === label || label.contains(hit)).toBe(true)
  })
})
