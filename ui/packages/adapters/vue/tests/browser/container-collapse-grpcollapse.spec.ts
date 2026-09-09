// 查询容器根的塌宽边界。
//
// `container-type: inline-size` 给那个盒加了行内一轴的尺寸限制：它的内容从此不再参与
// 自己的固有宽度计算。宽度由外面给的时候（块级父、flex: 1 的项、grid 1fr 的格）没有影响；
// 落进收缩包裹的外层（没写 flex-basis 的 flex 项、inline-block 的父）时，外层拿不到内容
// 撑出来的宽，根就只剩自己的边框与轨道那一点残宽。
//
// 这份用例证的不是「塌宽不会发生」——它会发生，是登记在册的代价。它钉的是边界在哪：
// 库内的三种正常外层下宽度照旧，收缩包裹的外层下内容不再撑宽。哪天浏览器改了这条行为，
// 或者有人给这几个根补上最小宽度兜底把塌宽盖掉，这里就判红，逼人重新看一眼这笔账。
import { afterEach, describe, expect, it } from 'vitest'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

/** 外层给的宽度。收缩包裹的外层拿不到它，正常外层下三种根都该正好占满它。 */
const HOST_W = 800

const NARROW = '短'
const WIDE = '很长很长很长很长很长很长很长很长很长很长的一段文字'

/** 宽度由外部给的三种外层：库自己的布局全在这一类里。 */
const NORMAL_OUTERS = ['block', 'flex-1', 'grid-1fr'] as const
/** 收缩包裹的两种外层：宽度反过来向内容要。 */
const SHRINK_OUTERS = ['flex-item', 'inline-block'] as const

type Outer = (typeof NORMAL_OUTERS)[number] | (typeof SHRINK_OUTERS)[number]

/**
 * 这一批核准过容器落点的几个根。真建成容器的与最后靠第一层解决、根不是容器的都在里面：
 * 下面按皮肤实际声明的 container-type 分头断言，两种状态各有各的判据。
 * 文本塞在真的能撑宽根的那个部件上。
 */
const ROOTS: [string, (text: string) => string][] = [
  ['descriptions', text => `
    <div data-scope="descriptions" data-part="item">
      <dt data-scope="descriptions" data-part="label">标签</dt>
      <dd data-scope="descriptions" data-part="value">${text}</dd>
    </div>`],
  ['diff-view', text => `
    <div data-scope="diff-view" data-part="header">${text}</div>
    <div data-scope="diff-view" data-part="viewport">
      <div data-scope="diff-view" data-part="row">
        <span data-scope="diff-view" data-part="line-number">1</span>
        <span data-scope="diff-view" data-part="line-content">${text}</span>
      </div>
    </div>`],
  ['field', text => `
    <label data-scope="field" data-part="label">标签</label>
    <span data-scope="field" data-part="description">${text}</span>`],
  ['transfer', text => `
    <div data-scope="transfer" data-part="source-panel">
      <div data-scope="transfer" data-part="panel-header">
        <span data-scope="transfer" data-part="panel-title">${text}</span>
      </div>
      <ul data-scope="transfer" data-part="list">
        <li data-scope="transfer" data-part="item"><span data-scope="transfer" data-part="item-text">${text}</span></li>
      </ul>
    </div>
    <div data-scope="transfer" data-part="target-panel">
      <div data-scope="transfer" data-part="panel-header">
        <span data-scope="transfer" data-part="panel-title">已选</span>
      </div>
      <ul data-scope="transfer" data-part="list"></ul>
    </div>`],
  ['timeline', text => `
    <li data-scope="timeline" data-part="item">
      <span data-scope="timeline" data-part="indicator"></span>
      <div data-scope="timeline" data-part="content">
        <span data-scope="timeline" data-part="title">${text}</span>
      </div>
    </li>`],
  ['steps', text => `
    <div data-scope="steps" data-part="list">
      <div data-scope="steps" data-part="item">
        <span data-scope="steps" data-part="indicator">1</span>
        <span data-scope="steps" data-part="title">${text}</span>
      </div>
    </div>`],
]

/** 根的标签名：描述列表与时间轴渲的是 dl 与 ol，UA 的边距由皮肤自己抹平。 */
const TAG: Record<string, string> = { descriptions: 'dl', timeline: 'ol' }

/** 皮肤怎么写就怎么量，还是行内把容器关掉再量。关掉的那份是「内容照常撑宽」的对照组。 */
type Mode = 'skin' | 'off'

let host: HTMLDivElement | null = null

afterEach(() => {
  host?.remove()
  host = null
})

/** 把一段 HTML 当作根，套进指定外层挂上去，返回根的实际宽度。 */
function widthOf(rootHtml: string, outer: Outer): number {
  host?.remove()
  host = document.createElement('div')
  host.innerHTML
    = outer === 'block'
      ? `<div style="inline-size: ${HOST_W}px">${rootHtml}</div>`
      : outer === 'flex-1'
        ? `<div style="display: flex; inline-size: ${HOST_W}px">${rootHtml}</div>`
        : outer === 'grid-1fr'
          ? `<div style="display: grid; grid-template-columns: 1fr; inline-size: ${HOST_W}px">${rootHtml}</div>`
          : outer === 'flex-item'
            ? `<div style="display: flex; inline-size: ${HOST_W}px">${rootHtml}</div>`
            : `<div style="inline-size: ${HOST_W}px"><span style="display: inline-block">${rootHtml}</span></div>`
  document.body.append(host)
  const root = host.querySelector('[data-part="root"]')
  if (!root)
    throw new Error('没有挂上根')
  return Math.round(root.getBoundingClientRect().width)
}

/** 拼一个组件根：flex-1 这一档要显式写 flex-basis，off 档行内把容器关掉。 */
function rootHtml(comp: string, inner: string, outer: Outer, mode: Mode): string {
  const tag = TAG[comp] ?? 'div'
  const style = [
    outer === 'flex-1' ? 'flex: 1; min-inline-size: 0' : '',
    mode === 'off' ? 'container-type: normal' : '',
  ].filter(Boolean).join('; ')
  return `<${tag} data-scope="${comp}" data-part="root" style="${style}">${inner}</${tag}>`
}

function measure(comp: string, inner: string, outer: Outer, mode: Mode): number {
  return widthOf(rootHtml(comp, inner, outer, mode), outer)
}

/** 皮肤给这个根声明的 container-type。没写就是 normal。 */
function declaredContainerType(comp: string, inner: string): string {
  widthOf(rootHtml(comp, inner, 'block', 'skin'), 'block')
  return getComputedStyle(host!.querySelector('[data-part="root"]')!).containerType
}

describe('机制：建成查询容器的盒不再由内容撑宽', () => {
  // 中性盒，不吃任何皮肤。这一条盯的是浏览器行为本身，与哪几个组件落没落地无关。
  const box = (text: string, container: boolean) =>
    `<div data-part="root" style="${container ? 'container-type: inline-size' : ''}">${text}</div>`

  it.each(SHRINK_OUTERS)('收缩包裹的外层（%s）下内容不再撑宽', (outer) => {
    const narrow = widthOf(box(NARROW, false), outer)
    const wide = widthOf(box(WIDE, false), outer)
    // 对照组：这段文字真的能撑宽一个普通的盒
    expect(wide).toBeGreaterThan(narrow)

    // 建成容器之后，两种长度的内容给出同一个宽度，而且比最短的那份内容还窄
    expect(widthOf(box(WIDE, true), outer)).toBe(widthOf(box(NARROW, true), outer))
    expect(widthOf(box(WIDE, true), outer)).toBeLessThan(narrow)
  })

  it.each(NORMAL_OUTERS)('宽度由外部给的外层（%s）下宽度照旧', (outer) => {
    const style = outer === 'flex-1' ? 'flex: 1; min-inline-size: 0; ' : ''
    const plain = `<div data-part="root" style="${style}">${WIDE}</div>`
    const container = `<div data-part="root" style="${style}container-type: inline-size">${WIDE}</div>`
    expect(widthOf(plain, outer)).toBe(HOST_W)
    expect(widthOf(container, outer)).toBe(HOST_W)
  })
})

describe('库内的正常外层：这几个根的宽度不受影响', () => {
  it.each(ROOTS)('%s', (comp, build) => {
    const inner = build(WIDE)
    for (const outer of NORMAL_OUTERS) {
      // 宽度由外层给，建不建容器都占满
      expect(measure(comp, inner, outer, 'skin')).toBe(HOST_W)
      expect(measure(comp, inner, outer, 'off')).toBe(HOST_W)
    }
  })
})

describe('收缩包裹的外层：塌宽确实会发生', () => {
  it.each(ROOTS)('%s', (comp, build) => {
    // 皮肤有没有把这个根建成容器，决定下面该看到哪一种表现，两种都是断言，没有放过的一档
    const declared = declaredContainerType(comp, build(NARROW))
    expect(['normal', 'inline-size']).toContain(declared)
    const isContainer = declared === 'inline-size'

    for (const outer of SHRINK_OUTERS) {
      const baseNarrow = measure(comp, build(NARROW), outer, 'off')
      const baseWide = measure(comp, build(WIDE), outer, 'off')
      // 对照组：行内把容器关掉，内容照常撑宽这个根，下面两条才有意义
      expect(baseWide).toBeGreaterThan(baseNarrow)

      const liveNarrow = measure(comp, build(NARROW), outer, 'skin')
      const liveWide = measure(comp, build(WIDE), outer, 'skin')

      // 建成查询容器 ⟺ 内容不再撑宽
      expect(liveNarrow === liveWide).toBe(isContainer)

      if (isContainer) {
        // 残宽只剩根自己的边框与轨道，比最短的那份内容还窄；
        // 谁要是给根补一条最小宽度兜底把塌宽盖掉，这条就判红
        expect(liveWide).toBeLessThan(baseNarrow)
      }
      else {
        // 还没建成容器：宽度与对照组一模一样
        expect(liveWide).toBe(baseWide)
      }
    }
  })
})
