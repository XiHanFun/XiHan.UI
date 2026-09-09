// 四个按视口换形态的组件，在手机 / 平板 / 电脑三档各是什么样子。
//
// descriptions、diff-view、transfer、timeline 的换档都写在 @media (min-width) 上，
// 基准档是窄档（不写查询），宽档在查询里恢复。这一份把三档的形态逐个钉住：
// 阈值改了、某一档的规则丢了，这里立刻判红。
//
// 宿主视口是固定的一个宽度、改不动，所以每一档开一个那么宽的 iframe 来量。
import { afterEach, describe, expect, it } from 'vitest'
import { closeFrame, frameHost, styleOf } from './viewport-frame'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

/** 三档各取一个宽度：手机、平板、电脑。 */
const PHONE = 375
const TABLET = 768
const DESKTOP = 1280

afterEach(closeFrame)

function pick(root: ParentNode, selector: string): HTMLElement {
  const el = root.querySelector(selector)
  if (!el)
    throw new Error(`没有挂上 ${selector}`)
  return el as HTMLElement
}

function all(root: ParentNode, selector: string): HTMLElement[] {
  return [...root.querySelectorAll(selector)] as HTMLElement[]
}

function box(root: ParentNode, selector: string): DOMRect {
  return pick(root, selector).getBoundingClientRect()
}

// —— descriptions ——

/** 六组「标签 + 取值」，作者写 data-columns=4、标签左置。 */
function descriptions(): string {
  const items = Array.from({ length: 6 }, (_, i) => `
    <div data-scope="descriptions" data-part="item">
      <dt data-scope="descriptions" data-part="label">创建时间${i}</dt>
      <dd data-scope="descriptions" data-part="value">2026-09-08 12:34:56</dd>
    </div>`).join('')
  return `<dl data-scope="descriptions" data-part="root" data-columns="4"
    data-placement="left">${items}</dl>`
}

/** 第一行摆了几格：与首格同一条上边线的就算同一行。 */
function perRow(host: HTMLElement): number {
  const items = all(host, '[data-scope="descriptions"][data-part="item"]')
  const top = items[0]!.getBoundingClientRect().top
  return items.filter(i => Math.abs(i.getBoundingClientRect().top - top) < 0.5).length
}

/** 首格里标签是不是压在取值上方（标签上置）。 */
function labelOnTop(host: HTMLElement): boolean {
  const label = box(host, '[data-scope="descriptions"][data-part="label"]')
  const value = box(host, '[data-scope="descriptions"][data-part="value"]')
  return value.top >= label.bottom - 0.5
}

describe('descriptions', () => {
  it('375：收成一列，标签一律压在取值上方', () => {
    const host = frameHost(PHONE, descriptions())
    expect(perRow(host)).toBe(1)
    expect(labelOnTop(host)).toBe(true)
  })

  it('768：最多两格一行，标签回到取值左边', () => {
    const host = frameHost(TABLET, descriptions())
    expect(perRow(host)).toBe(2)
    expect(labelOnTop(host)).toBe(false)
  })

  it('1280：按作者写的四列摆，标签仍在左边', () => {
    const host = frameHost(DESKTOP, descriptions())
    expect(perRow(host)).toBe(4)
    expect(labelOnTop(host)).toBe(false)
  })
})

// —— diff-view ——

/** 两行并排差异：每行左右各一个行号槽与一段正文。 */
function diffView(): string {
  const rows = ['const base = options.base', 'return normalize(base)'].map((text, i) => `
    <div data-scope="diff-view" data-part="row">
      <span data-scope="diff-view" data-part="line-number" data-side="old"
        data-line-number="${i + 1}"></span>
      <span data-scope="diff-view" data-part="line-content" data-side="old">${text}</span>
      <span data-scope="diff-view" data-part="line-number" data-side="new"
        data-line-number="${i + 1}"></span>
      <span data-scope="diff-view" data-part="line-content" data-side="new">${text} ?? FALLBACK</span>
    </div>`).join('')
  return `<div data-scope="diff-view" data-part="root" data-view="split">
    <div data-scope="diff-view" data-part="viewport">
      <div data-scope="diff-view" data-part="body">${rows}</div>
    </div>
  </div>`
}

const OLD_NUMBER = '[data-scope="diff-view"][data-part="line-number"][data-side="old"]'
const NEW_NUMBER = '[data-scope="diff-view"][data-part="line-number"][data-side="new"]'

/** 新侧是不是落在旧侧下方（上下两段）。 */
function stackedSides(host: HTMLElement): boolean {
  return box(host, NEW_NUMBER).top > box(host, OLD_NUMBER).top + 0.5
}

describe('diff-view 的 split 视图', () => {
  it('375：一行的两侧改成上下两段，两侧同起一列', () => {
    const host = frameHost(PHONE, diffView())
    expect(stackedSides(host)).toBe(true)
    expect(box(host, NEW_NUMBER).left).toBeCloseTo(box(host, OLD_NUMBER).left, 1)
  })

  it('768：仍是上下两段，1024 才回到并排', () => {
    expect(stackedSides(frameHost(TABLET, diffView()))).toBe(true)
  })

  it('1280：两侧回到同一行并排，接缝那条左边线跟着画上', () => {
    const host = frameHost(DESKTOP, diffView())
    expect(stackedSides(host)).toBe(false)
    expect(box(host, NEW_NUMBER).left).toBeGreaterThan(box(host, OLD_NUMBER).right)
    expect(Number.parseFloat(styleOf(pick(host, NEW_NUMBER)).borderInlineStartWidth))
      .toBeGreaterThan(0)
  })
})

// —— transfer ——

/** 两块面板加两颗搬运钮。 */
function transfer(): string {
  const panel = (part: string, title: string) => `
    <div data-scope="transfer" data-part="${part}">
      <div data-scope="transfer" data-part="panel-header">
        <span data-scope="transfer" data-part="panel-title">${title}</span>
      </div>
      <ul data-scope="transfer" data-part="list">
        <li data-scope="transfer" data-part="item">
          <span data-scope="transfer" data-part="item-text">组织架构与岗位</span>
        </li>
      </ul>
    </div>`
  return `<div data-scope="transfer" data-part="root">
    ${panel('source-panel', '可选权限')}
    <button data-scope="transfer" data-part="to-target-trigger" type="button"></button>
    <button data-scope="transfer" data-part="to-source-trigger" type="button"></button>
    ${panel('target-panel', '已选权限')}
  </div>`
}

const SOURCE = '[data-scope="transfer"][data-part="source-panel"]'
const TARGET = '[data-scope="transfer"][data-part="target-panel"]'

describe('transfer 的两块面板', () => {
  it('375：上下堆叠，两块各占满整行', () => {
    const host = frameHost(PHONE, transfer())
    const root = box(host, '[data-scope="transfer"][data-part="root"]')
    const source = box(host, SOURCE)
    const target = box(host, TARGET)

    expect(target.top).toBeGreaterThanOrEqual(source.bottom)
    expect(source.width).toBeCloseTo(root.width, 1)
    expect(target.width).toBeCloseTo(root.width, 1)
  })

  it.each([TABLET, DESKTOP])('%i：回到三栏并排，两块面板同起一行', (width) => {
    const host = frameHost(width, transfer())
    const source = box(host, SOURCE)
    const target = box(host, TARGET)

    expect(target.top).toBeCloseTo(source.top, 1)
    expect(target.left).toBeGreaterThan(source.right)
  })

  it('640 是它自己那道门槛：差一像素就还在堆叠', () => {
    expect(box(frameHost(639, transfer()), TARGET).top)
      .toBeGreaterThanOrEqual(box(frameHost(639, transfer()), SOURCE).bottom)
    expect(box(frameHost(640, transfer()), TARGET).top)
      .toBeCloseTo(box(frameHost(640, transfer()), SOURCE).top, 1)
  })
})

// —— timeline ——

/** 四条横排事件。 */
function timeline(): string {
  const items = ['内测启动', '公测开放', '商业化', '海外版'].map(title => `
    <li data-scope="timeline" data-part="item" data-orientation="horizontal">
      <span data-scope="timeline" data-part="indicator"></span>
      <span data-scope="timeline" data-part="connector"></span>
      <div data-scope="timeline" data-part="content">
        <span data-scope="timeline" data-part="title">${title}</span>
      </div>
    </li>`).join('')
  return `<ol data-scope="timeline" data-part="root"
    data-orientation="horizontal">${items}</ol>`
}

const AXIS = '[data-scope="timeline"][data-part="root"]'
const EVENT = '[data-scope="timeline"][data-part="item"]'
const LINE = '[data-scope="timeline"][data-part="connector"]'

describe('timeline 的横排', () => {
  it('375：一条一行，连线立起来接下一条', () => {
    const host = frameHost(PHONE, timeline())
    const axis = pick(host, AXIS)
    for (const event of all(host, EVENT))
      expect(event.getBoundingClientRect().width).toBe(axis.clientWidth)

    const line = box(host, LINE)
    expect(line.height).toBeGreaterThan(line.width)
  })

  it.each([TABLET, DESKTOP])('%i：四条等分整行，连线躺平', (width) => {
    const host = frameHost(width, timeline())
    const axis = pick(host, AXIS)
    for (const event of all(host, EVENT))
      expect(event.getBoundingClientRect().width).toBeCloseTo(axis.clientWidth / 4, 1)

    const line = box(host, LINE)
    expect(line.width).toBeGreaterThan(line.height)
  })

  it('768 是它自己那道门槛：差一像素就还是一条一行', () => {
    const narrow = frameHost(767, timeline())
    expect(box(narrow, EVENT).width).toBe(pick(narrow, AXIS).clientWidth)

    const wide = frameHost(768, timeline())
    expect(box(wide, EVENT).width).toBeCloseTo(pick(wide, AXIS).clientWidth / 4, 1)
  })
})
