// 一整年五十几列放不下时网格自己横着滚，行首那一列星期名要钉在原地。
// 钉不钉得住、格子会不会从它下面透出来，都要真布局才量得到；jsdom 不做布局，那边永远是绿的。
//
// 栽过一次：隔行画的那四行原先用 visibility: hidden 关掉，盒子连同底色一起不画，
// 四行的格子直接从行首透出来，而这条用例只断言「背景色不是透明」——计算值还在，恒绿。
// 所以这里铺满七行，逐行拿 elementFromPoint 探行首那一段条带上到底是谁。
import { afterEach, describe, expect, it } from 'vitest'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

const ROOT_W = 200
const CELL = 10
const GAP = 4
const GUTTER = 30
/** 铺够列数，保证一定放不下。 */
const COLUMNS = 40
/** 七行都铺：0/2/4/6 是隔行不上色的那四行，1/3/5 是画出字来的那三行。 */
const WEEK_DAYS = [0, 1, 2, 3, 4, 5, 6]

let host: HTMLElement | null = null

afterEach(() => {
  host?.remove()
  host = null
})

interface Mounted {
  root: HTMLElement
  /** 七行的行首星期名，下标即 data-week-day。 */
  labels: HTMLElement[]
  cells: HTMLElement[]
}

/** 七行星期名各带一长串格子，root 定宽定尺寸，量出来的都是 calc 的结果而不是当下的令牌值。 */
function mount(variant: string | null): Mounted {
  const style = [
    `inline-size: ${ROOT_W}px`,
    `--xh-heatmap-cell-size: ${CELL}px`,
    `--xh-_heatmap-gap: ${GAP}px`,
    `--xh-heatmap-gutter: ${GUTTER}px`,
  ].join('; ')
  const rows = WEEK_DAYS.map((weekDay) => {
    const cells = Array.from({ length: COLUMNS }, (_, i) =>
      `<div data-scope="heatmap" data-part="cell" data-value="2024-0${weekDay + 1}-${String(i + 1).padStart(2, '0')}"></div>`).join('')
    return `
      <div data-scope="heatmap" data-part="row" data-week-day="${weekDay}">
        <span data-scope="heatmap" data-part="week-day" data-week-day="${weekDay}">${'一二三四五六日'[weekDay]}</span>
        ${cells}
      </div>
    `
  }).join('')
  host = document.createElement('div')
  host.innerHTML = `
    <div data-scope="heatmap" data-part="root"${variant ? ` data-variant="${variant}"` : ''} style="${style}">
      <div data-scope="heatmap" data-part="grid">${rows}</div>
    </div>
  `
  document.body.append(host)
  const root = host.firstElementChild as HTMLElement
  return {
    root,
    labels: [...root.querySelectorAll<HTMLElement>('[data-part="week-day"]')],
    cells: [...root.querySelectorAll<HTMLElement>('[data-part="cell"]')],
  }
}

/** 某个元素正中那一点上，最上面的是谁。 */
function topmostAt(el: HTMLElement): Element | null {
  const rect = el.getBoundingClientRect()
  return document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2)
}

describe('热力图行首那一列', () => {
  it('横向滚到底也钉在起始缘，格子从它下面过去', () => {
    const { root, labels, cells } = mount(null)
    expect(root.scrollWidth).toBeGreaterThan(root.clientWidth)

    const atZero = labels[0]!.getBoundingClientRect().left - root.getBoundingClientRect().left
    root.scrollLeft = root.scrollWidth - root.clientWidth
    const atMax = labels[0]!.getBoundingClientRect().left - root.getBoundingClientRect().left
    expect(atZero).toBeCloseTo(0, 1)
    expect(atMax).toBeCloseTo(0, 1)

    // 滚过去的格子压在它下面：钉住的那一列排在格子之上，且自带实色底
    const style = getComputedStyle(labels[0]!)
    expect(style.position).toBe('sticky')
    expect(Number(style.zIndex)).toBeGreaterThan(0)
    expect(style.backgroundColor).not.toBe('rgba(0, 0, 0, 0)')
    expect(cells[0]!.getBoundingClientRect().left).toBeLessThan(labels[0]!.getBoundingClientRect().right)
  })

  it('滚到中段时七行的行首都不透格子，隔行不上色的那四行也一样', () => {
    const { root, labels } = mount(null)
    root.scrollLeft = 200

    // 逐行探：探针落在行首那一段条带正中，命中的必须是这一行的星期名而不是从下面过去的格子
    expect(labels.map(el => topmostAt(el)?.getAttribute('data-part') ?? null))
      .toEqual(WEEK_DAYS.map(() => 'week-day'))
    // 隔行的那四行确实是「字不上色」而不是「盒子不画」：盒子还在，底色还在
    for (const weekDay of [0, 2, 4, 6]) {
      const style = getComputedStyle(labels[weekDay]!)
      expect(style.color).toBe('rgba(0, 0, 0, 0)')
      expect(style.visibility).toBe('visible')
      expect(style.backgroundColor).not.toBe('rgba(0, 0, 0, 0)')
    }
  })

  it('键盘把视口外的格子滚进来时让开钉住的那一列', () => {
    const { root } = mount(null)
    // scrollIntoView 认 scroll-padding：让开的正是行首那一列加一个格间距
    expect(getComputedStyle(root).scrollPaddingLeft).toBe(`${GUTTER + GAP}px`)
  })

  it('钉住那一列的层号收在组件里，压不到页面上后来的定位元素', () => {
    const { root, labels } = mount(null)
    // 不盖东西时探针落在星期名自己身上，这条用例因此探得到层叠上下文
    expect(topmostAt(labels[1]!)).toBe(labels[1])

    // 把整块盖住的一个兄弟：层号 0、排在热力图之后，页面上它就该盖在上面
    host!.style.position = 'relative'
    const cover = document.createElement('div')
    cover.style.cssText = 'position: absolute; inset: 0; z-index: 0;'
    host!.append(cover)

    // root 自建层叠上下文，里面的 1 号只跟组件内的兄弟比，探针因此落在这个兄弟上
    expect(topmostAt(labels[1]!)).toBe(cover)
    expect(getComputedStyle(root).isolation).toBe('isolate')
  })

  it('月历形态没有钉住的那一列，块里的星期名是列头', () => {
    const { root, labels } = mount('month')
    expect(getComputedStyle(labels[0]!).position).toBe('static')
    expect(getComputedStyle(root).scrollPaddingLeft).toBe('0px')
  })
})
