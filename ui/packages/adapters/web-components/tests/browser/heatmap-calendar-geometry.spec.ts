// 日历形态的格距必须四周一样宽，星期名必须隔行画。
//
// 栽过一次：行首那一列星期名的字（12px）比格子（10px）高，行的高度被那行字定死，
// 纵向凭空多出两像素——实测横向 4px、纵向 6px。33 道门禁、四个包的单测与一致性套件全绿，
// 因为没有任何一处断言碰过「解析后的格距」。jsdom 不做布局，这条只有真实浏览器量得出来。
import { afterEach, describe, expect, it } from 'vitest'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let host: HTMLElement | null = null

afterEach(() => {
  host?.remove()
  host = null
})

interface Probe {
  cell: number
  /** 相邻两格之间的横向空当。 */
  inlineGap: number
  /** 上下两行格子之间的纵向空当。 */
  blockGap: number
  rowHeight: number
  labels: { text: string, color: string, visibility: string, background: string }[]
}

/** 透明的计算值。隔行不上色的那几行，字色恰好是它。 */
const TRANSPARENT = 'rgba(0, 0, 0, 0)'

/** 铺三行两列的日历：每行行首一个星期名，量出来的都是皮肤算完的结果。 */
function probe(size: string | null, vars: Record<string, string> = {}): Probe {
  const rows = [0, 1, 2, 3, 4, 5, 6].map(weekDay => `
    <div data-scope="heatmap" data-part="row" data-week-day="${weekDay}">
      <span data-scope="heatmap" data-part="week-day" data-week-day="${weekDay}">${'一二三四五六日'[weekDay]}</span>
      <div data-scope="heatmap" data-part="cell" data-value="2024-01-0${weekDay + 1}"></div>
      <div data-scope="heatmap" data-part="cell" data-value="2024-01-1${weekDay + 1}"></div>
    </div>
  `).join('')
  host = document.createElement('div')
  host.innerHTML = `
    <div data-scope="heatmap" data-part="root"${size ? ` data-size="${size}"` : ''}>
      <div data-scope="heatmap" data-part="grid">${rows}</div>
    </div>
  `
  document.body.append(host)
  const root = host.firstElementChild as HTMLElement
  for (const [key, value] of Object.entries(vars))
    root.style.setProperty(key, value)

  const lines = [...root.querySelectorAll<HTMLElement>('[data-part="row"]')]
  const first = lines[0]!.querySelectorAll<HTMLElement>('[data-part="cell"]')
  const a = first[0]!.getBoundingClientRect()
  const b = first[1]!.getBoundingClientRect()
  const below = lines[1]!.querySelector<HTMLElement>('[data-part="cell"]')!.getBoundingClientRect()
  return {
    cell: a.height,
    inlineGap: b.left - a.right,
    blockGap: below.top - a.bottom,
    rowHeight: lines[0]!.getBoundingClientRect().height,
    labels: [...root.querySelectorAll<HTMLElement>('[data-part="week-day"]')].map((el) => {
      const style = getComputedStyle(el)
      return {
        text: el.textContent ?? '',
        color: style.color,
        visibility: style.visibility,
        background: style.backgroundColor,
      }
    }),
  }
}

describe('日历形态的格距', () => {
  it('三档尺寸的横向格距与纵向格距一样宽', () => {
    for (const size of [null, 'sm', 'lg']) {
      const at = probe(size)
      expect(at.inlineGap).toBeGreaterThan(0)
      expect(Math.abs(at.blockGap - at.inlineGap)).toBeLessThan(0.5)
    }
  })

  it('行高只由格子定，不随行首星期名的字高走', () => {
    const base = probe(null)
    const bigger = probe(null, { '--xh-heatmap-font-size': '24px' })
    expect(base.rowHeight).toBeCloseTo(base.cell, 1)
    expect(bigger.rowHeight).toBeCloseTo(base.cell, 1)
    expect(bigger.blockGap).toBeCloseTo(base.blockGap, 1)
  })

  it('格子逐档变大，格距不跟着变', () => {
    const sm = probe('sm')
    const md = probe(null)
    const lg = probe('lg')
    expect(sm.cell).toBeLessThan(md.cell)
    expect(md.cell).toBeLessThan(lg.cell)
    expect(sm.inlineGap).toBeCloseTo(md.inlineGap, 1)
    expect(lg.inlineGap).toBeCloseTo(md.inlineGap, 1)
  })
})

describe('星期名隔行画', () => {
  it('只画第 1/3/5 行那三个字，被跳过的那几行文字仍在 DOM 里', () => {
    const at = probe(null)
    expect(at.labels.map(l => l.color === TRANSPARENT)).toEqual([
      true,
      false,
      true,
      false,
      true,
      false,
      true,
    ])
    // 只是不画：节点与文字一个都没少，行的可及名字另有出处
    expect(at.labels.map(l => l.text)).toEqual(['一', '二', '三', '四', '五', '六', '日'])
  })

  it('跳过的是字不是盒子：七行都还画着，底色一行不缺', () => {
    // 用 visibility 关会连盒子一起不画，钉住那一列的实色底跟着缺四行，格子从行首透出来；
    // 那四行也不再参与命中测试，鼠标划过行首会弹出看不见那一格的详情条。这条锁住不许退回去
    const at = probe(null)
    expect(at.labels.every(l => l.visibility === 'visible')).toBe(true)
    expect(at.labels.every(l => l.background !== TRANSPARENT)).toBe(true)
  })

  it('留下来的三个字彼此不叠：每个都占得到两行的高度', () => {
    const at = probe(null)
    const labels = [...host!.querySelectorAll<HTMLElement>('[data-part="week-day"]')]
      .filter(el => getComputedStyle(el).color !== TRANSPARENT)
      .map(el => el.getBoundingClientRect())
    expect(labels).toHaveLength(3)
    for (let i = 1; i < labels.length; i++)
      expect(labels[i]!.top - labels[i - 1]!.bottom).toBeGreaterThan(0)
    // 两行的高度 = 两格加一个格距，字比它矮才放得下
    expect(labels[0]!.height).toBeLessThanOrEqual(at.cell * 2 + at.inlineGap)
  })

  it('作者要七行全画就把那个槽改成一个看得见的颜色', () => {
    // 文档里给的就是这个写法：跳过的那几行跟画出来的那三行取同一个字色
    const at = probe(null, { '--xh-heatmap-week-day-skip': 'var(--xh-heatmap-label-fg, var(--xh-fg-subtle))' })
    const painted = at.labels.map(l => l.color)
    expect(painted.every(color => color !== TRANSPARENT)).toBe(true)
    expect(new Set(painted).size).toBe(1)
  })
})

describe('月历形态的星期名', () => {
  const MONTH_CELL = 10
  const MONTH_GAP = 4
  /** 一块正好七列宽：root 与它同宽，列头往外溢的那点行盒有没有算进可滚动宽度就量得出来。 */
  const BLOCK_W = MONTH_CELL * 7 + MONTH_GAP * 6

  /** 一块月历：一排七个列头加一行格子，root 与月块同宽。 */
  function mountMonth(): { root: HTMLElement, labels: HTMLElement[] } {
    const style = [
      `inline-size: ${BLOCK_W}px`,
      `--xh-heatmap-cell-size: ${MONTH_CELL}px`,
      `--xh-_heatmap-gap: ${MONTH_GAP}px`,
    ].join('; ')
    const days = [0, 1, 2, 3, 4, 5, 6]
    host = document.createElement('div')
    host.innerHTML = `
      <div data-scope="heatmap" data-part="root" data-variant="month" style="${style}">
        <div data-scope="heatmap" data-part="grid">
          <div data-scope="heatmap" data-part="month-block" data-value="2024-01">
            <div data-scope="heatmap" data-part="row" aria-hidden="true">
              ${days.map(d => `<span data-scope="heatmap" data-part="week-day" data-week-day="${d}">${'一二三四五六日'[d]}</span>`).join('')}
            </div>
            <div data-scope="heatmap" data-part="row" data-week="0">
              ${days.map(d => `<div data-scope="heatmap" data-part="cell" data-value="2024-01-0${d + 1}"></div>`).join('')}
            </div>
          </div>
        </div>
      </div>
    `
    document.body.append(host)
    const root = host.firstElementChild as HTMLElement
    return { root, labels: [...root.querySelectorAll<HTMLElement>('[data-part="week-day"]')] }
  }

  it('七个列头一个都不少，字比一格宽也不裁', () => {
    const { labels } = mountMonth()
    expect(labels.every(el => getComputedStyle(el).color !== TRANSPARENT)).toBe(true)
    expect(labels.every(el => getComputedStyle(el).overflow === 'visible')).toBe(true)
  })

  it('月块换行排开，这一档不当滚动容器：不吐横向滚动条', () => {
    // 栽过一次：列头 overflow: visible 之后，12px 的字在 10px 的列里往外溢的那点行盒
    // 算进了祖先的可滚动宽度，root 上的 overflow-x: auto 就为 2px 摆出一条常驻滚动条，
    // 白吃掉十几像素高。这一档改成 clip 之后既不滚也不裁那点溢出
    const { root } = mountMonth()
    // 判据不是 scrollWidth：clip 的盒子照样把溢出算进滚动区，只是不给滚。
    // 真判据是「滚不动」——auto 那一档这里会停在 2px 上，clip 这一档恒是 0
    root.scrollLeft = 50
    expect(root.scrollLeft).toBe(0)
    expect(getComputedStyle(root).overflowX).toBe('clip')
  })
})
