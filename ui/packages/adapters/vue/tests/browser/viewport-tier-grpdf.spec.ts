// descriptions 的视口档与 field 横排标签的收窄。
//
// descriptions 的换档由 @media (min-width) 决定，量它要把视口做出来：宿主视口固定改不动，
// 所以每一档开一个那么宽的 iframe。field 的收窄一句查询都没写，仍挂在定宽 div 里量。
import { afterEach, describe, expect, it } from 'vitest'
import { closeFrame, frameHost, styleOf } from './viewport-frame'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let host: HTMLElement | null = null

/** 在给定视口里挂一段标记，返回装它的外层。 */
function mount(viewport: number, markup: string): HTMLElement {
  host?.remove()
  host = null
  return frameHost(viewport, markup)
}

/** 在一个定宽的 div 里挂一段标记：不吃任何查询的那几条用这个。 */
function mountBox(container: number, markup: string): HTMLElement {
  host?.remove()
  host = document.createElement('div')
  host.style.cssText = `inline-size: ${container}px`
  host.innerHTML = markup
  document.body.append(host)
  return host
}

/** 八组「标签 + 取值」，取值是一段带空格的时间戳，压窄了会竖成好几行。 */
function descriptions(columns: number, placement: 'left' | 'top' = 'left'): string {
  const items = Array.from({ length: 8 }, (_, i) => `
    <div data-scope="descriptions" data-part="item">
      <dt data-scope="descriptions" data-part="label">创建时间${i}</dt>
      <dd data-scope="descriptions" data-part="value">2026-09-08 12:34:56</dd>
    </div>`).join('')
  return `<dl data-scope="descriptions" data-part="root" data-columns="${columns}"
    data-placement="${placement}" data-bordered>${items}</dl>`
}

function items(el: HTMLElement): HTMLElement[] {
  return [...el.querySelectorAll('[data-scope="descriptions"][data-part="item"]')] as HTMLElement[]
}

/** 第一行摆了几格：与首格同一条上边线的就算同一行。 */
function perRow(el: HTMLElement): number {
  const top = items(el)[0]!.getBoundingClientRect().top
  return items(el).filter(i => Math.abs(i.getBoundingClientRect().top - top) < 0.5).length
}

function part(el: HTMLElement, name: string): HTMLElement {
  // iframe 里的节点属于那个文档的 HTMLElement，与本页的不是同一个构造器，不能用 instanceof 认
  const found = el.querySelector(`[data-scope="descriptions"][data-part="${name}"]`)
  if (!found)
    throw new Error(`没有 ${name}`)
  return found as HTMLElement
}

/** 一格里标签与取值是否叠着排：取值的上沿落在标签的下沿之下即为叠排。 */
function stacked(el: HTMLElement): boolean {
  const label = part(el, 'label').getBoundingClientRect()
  const value = part(el, 'value').getBoundingClientRect()
  return value.top >= label.bottom - 0.5
}

/**
 * 边线与实际摆位对不对得上：按每格量出来的位置分行，
 * 行首的格不该有左边线、首行的格不该有上边线，其余两处都该有。
 */
function borderMismatches(el: HTMLElement): string[] {
  const boxes = items(el).map(i => ({ el: i, rect: i.getBoundingClientRect() }))
  const tops = [...new Set(boxes.map(b => Math.round(b.rect.top)))].sort((a, b) => a - b)
  const bad: string[] = []
  boxes.forEach((box, index) => {
    const row = tops.indexOf(Math.round(box.rect.top))
    const isRowStart = boxes.every(o => Math.round(o.rect.top) !== Math.round(box.rect.top) || o.rect.left >= box.rect.left)
    const style = styleOf(box.el)
    const left = Number.parseFloat(style.borderLeftWidth)
    const top = Number.parseFloat(style.borderTopWidth)
    if (isRowStart ? left !== 0 : left === 0)
      bad.push(`第 ${index + 1} 格${isRowStart ? '在行首却带' : '不在行首却没'}左边线`)
    if (row === 0 ? top !== 0 : top === 0)
      bad.push(`第 ${index + 1} 格${row === 0 ? '在首行却带' : '不在首行却没'}上边线`)
  })
  return bad
}

/** 三档的视口宽：手机档、平板档、电脑档，各取档内一段。 */
const NARROW = 700
const TABLET = 800
const DESKTOP = 1100

afterEach(() => {
  host?.remove()
  host = null
  closeFrame()
})

describe('descriptions 逐档收列', () => {
  // 每一档一行摆几格：作者写四五六列的，窄档收成一列、平板档四六列收成两列、
  // 五列没有能摆成两列等宽的跨列数所以留在一列，电脑档三个都按作者写的摆
  const TIERS: [number, number, number, number][] = [
    // 列数, 窄档, 平板档, 电脑档
    [2, 1, 2, 2],
    [3, 1, 3, 3],
    [4, 1, 2, 4],
    [5, 1, 1, 5],
    [6, 1, 2, 6],
  ]

  it.each(TIERS)('cols=%i 逐档摆 %i / %i / %i 格', (columns, narrow, tablet, desktop) => {
    expect(perRow(mount(NARROW, descriptions(columns)))).toBe(narrow)
    expect(perRow(mount(TABLET, descriptions(columns)))).toBe(tablet)
    expect(perRow(mount(DESKTOP, descriptions(columns)))).toBe(desktop)
  })

  it('取值列在手机档不再被压没', () => {
    // 改之前：四列的取值列在 300 的宽度里量到 0px，单格高 100px（同一格在宽处是 37px）
    const el = mount(300, descriptions(4))
    expect(perRow(el)).toBe(1)
    expect(part(el, 'value').getBoundingClientRect().width).toBeGreaterThan(240)
    expect(part(el, 'item').getBoundingClientRect().height).toBeLessThan(70)
  })

  it('六列在 375 的视口里同样收成一列', () => {
    const el = mount(375, descriptions(6))
    expect(perRow(el)).toBe(1)
    expect(part(el, 'value').getBoundingClientRect().width).toBeGreaterThan(300)
  })

  it('宽档不插手作者写的列数', () => {
    const el = mount(1280, descriptions(4))
    expect(perRow(el)).toBe(4)
    // 取值列 = 每格 319.5 减去内衬 24、标签列 64.22 与标签间距 8。
    // 标签列是 max-content，同一段中文在 iframe 文档里量出来比在宿主文档里宽 1.22px，
    // 这个数是在 iframe 里量的
    expect(part(el, 'value').getBoundingClientRect().width).toBeCloseTo(223.3, 0)
    expect(part(el, 'item').getBoundingClientRect().height).toBeCloseTo(37, 0)
  })

  it('换的是视口的档，不是外层容器的档', () => {
    // 同一个视口里两个宽度差得很远的外层，摆法一模一样：档只看视口
    const el = mount(DESKTOP, `
      <div id="narrow" style="inline-size:300px">${descriptions(4)}</div>
      <div id="wide" style="inline-size:1100px">${descriptions(4)}</div>`)
    expect(perRow(el.querySelector('#narrow') as HTMLElement)).toBe(4)
    expect(perRow(el.querySelector('#wide') as HTMLElement)).toBe(4)
  })

  it('窄视口里放宽外层也不换档', () => {
    const el = mount(375, `<div style="inline-size:1100px">${descriptions(4)}</div>`)
    expect(perRow(el)).toBe(1)
  })
})

describe('descriptions 窄档标签在上', () => {
  it('窄档不认 placement=left', () => {
    expect(stacked(mount(NARROW, descriptions(4)))).toBe(true)
  })

  it('平板档起标签回到左边', () => {
    expect(stacked(mount(TABLET, descriptions(4)))).toBe(false)
    expect(stacked(mount(DESKTOP, descriptions(4)))).toBe(false)
  })

  it('placement=top 各档都叠着排', () => {
    for (const width of [NARROW, TABLET, DESKTOP])
      expect(stacked(mount(width, descriptions(4, 'top')))).toBe(true)
  })
})

describe('descriptions 边线跟着实际摆位走', () => {
  it.each([2, 3, 4, 5, 6])('cols=%i 三档的边线都对得上摆位', (columns) => {
    for (const width of [300, NARROW, TABLET, DESKTOP, 1280])
      expect(borderMismatches(mount(width, descriptions(columns)))).toEqual([])
  })
})

describe('field 横排标签收进自己那一列', () => {
  /** 横排表单里一个字段，标签是一段不带空格的长标识。 */
  const FORM = `
    <form data-scope="form" data-part="root" data-layout="horizontal">
      <div data-scope="field" data-part="root">
        <label data-scope="field" data-part="label">DatabaseConnectionString</label>
        <input data-scope="field" data-part="control" />
      </div>
    </form>`

  function label(el: HTMLElement): DOMRect {
    const found = el.querySelector('[data-scope="field"][data-part="label"]')
    if (!(found instanceof HTMLElement))
      throw new Error('没有标签')
    return found.getBoundingClientRect()
  }

  it.each([240, 320, 420])('容器 %ipx：标签不从左边越出去', (width) => {
    // 改之前：标签顶着自己的最小宽度，320 的容器里左缘量到 -54px、240 里 -78px，
    // 越出去那一截没有横向滚动可以够回来
    const el = mountBox(width, FORM)
    expect(label(el).left - el.getBoundingClientRect().left).toBeGreaterThanOrEqual(0)
    expect(el.scrollWidth).toBe(width)
  })

  it('宽处仍是一行，标签宽度不受影响', () => {
    const el = mountBox(1280, FORM)
    expect(label(el).height).toBeCloseTo(32, 0)
    expect(label(el).width).toBeCloseTo(150.1, 0)
  })
})
