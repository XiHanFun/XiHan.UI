// 横排折竖排这一组：timeline 按视口断点换档，steps 只折行、不翻朝向。
//
// steps 的键盘轴跟着 orientation 走（方向键与 aria-orientation 都读它），
// 皮肤把横排翻成竖排会让左右键在竖着的一列上走，所以这一件不做形态换档，
// 只在第一层把折行做出来——下面的用例把这条契约钉住：横排永远是横排。
//
// timeline 的换档由 @media (min-width) 决定，宿主视口固定改不动，每一档开一个那么宽的
// iframe 来量；steps 一句查询都没写，仍挂在定宽的块级 div 里量。
import { afterEach, describe, expect, it } from 'vitest'
import { closeFrame, frameHost } from './viewport-frame'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let host: HTMLElement | null = null

/** 在给定视口里挂一段标记，返回装它的外层。 */
function frame(viewport: number, html: string): HTMLElement {
  host?.remove()
  host = null
  const el = frameHost(viewport, html)
  el.style.cssText = 'display: flow-root; border: 0'
  return el
}

/** 在给定宽度的块级外层里挂一段标记。外层写 flow-root，宽度由它说了算。 */
function mount(width: number, html: string): HTMLElement {
  host?.remove()
  host = document.createElement('div')
  host.style.cssText = `display: flow-root; inline-size: ${width}px; border: 0`
  host.innerHTML = html
  document.body.append(host)
  return host
}

function pick(root: ParentNode, selector: string): HTMLElement {
  const el = root.querySelector(selector)
  if (!el)
    throw new Error(`没有挂上 ${selector}`)
  return el as HTMLElement
}

/** 行内一轴被顶出去多少：0 即收在容器里。 */
function overflow(el: HTMLElement): number {
  return el.scrollWidth - el.clientWidth
}

/** 文字有没有被省略号切掉：撑开的宽度大过可见宽度即被切。 */
function clipped(el: HTMLElement): boolean {
  return el.scrollWidth > el.clientWidth
}

afterEach(() => {
  host?.remove()
  host = null
  closeFrame()
})

const STEP_TITLES = ['填写收货地址', '选择支付方式', '确认订单信息']

function stepsMarkup(orientation: 'horizontal' | 'vertical', titles = STEP_TITLES): string {
  const items = titles.map((t, i) => `
    <div data-scope="steps" data-part="item" data-orientation="${orientation}" id="item${i}">
      <button data-scope="steps" data-part="trigger" type="button">
        <span data-scope="steps" data-part="indicator">${i + 1}</span>
        <span data-scope="steps" data-part="title" id="title${i}">${t}</span>
      </button>
      <span data-scope="steps" data-part="separator" data-orientation="${orientation}"></span>
    </div>`).join('')
  return `
    <div data-scope="steps" data-part="root" data-orientation="${orientation}" id="root">
      <div data-scope="steps" data-part="list" data-orientation="${orientation}" id="list">${items}</div>
      <div data-scope="steps" data-part="content" id="panel">面板：填写收货地址，含收货人、手机号与详细地址。</div>
    </div>`
}

const EVENTS = ['内测启动', '公测开放', '商业化', '海外版']

function timelineMarkup(orientation: 'horizontal' | 'vertical', withLabel = false): string {
  const items = EVENTS.map((title, i) => `
    <li data-scope="timeline" data-part="item" data-orientation="${orientation}" id="event${i}">
      ${withLabel ? `<span data-scope="timeline" data-part="label" id="label${i}">2026-09-08</span>` : ''}
      <span data-scope="timeline" data-part="indicator" id="dot${i}"></span>
      <span data-scope="timeline" data-part="connector" id="line${i}"></span>
      <div data-scope="timeline" data-part="content" id="body${i}">
        <span data-scope="timeline" data-part="title">${title}</span>
        <span data-scope="timeline" data-part="description">这一步做了什么的说明文字</span>
      </div>
    </li>`).join('')
  return `<ol data-scope="timeline" data-part="root" data-orientation="${orientation}" id="axis">${items}</ol>`
}

// 手机 = 不写查询的那一档，平板与电脑各取一档
const NARROW = [320, 375, 640]
const WIDE = [768, 1024, 1280]

describe('timeline 横排按视口宽度换档', () => {
  it.each(NARROW)('%ipx：窄档一条一行，连线立起来接下一条', (w) => {
    const h = frame(w, timelineMarkup('horizontal'))
    const axis = pick(h, '#axis')

    // 每条独占整行
    for (let i = 0; i < EVENTS.length; i++)
      expect(pick(h, `#event${i}`).getBoundingClientRect().width).toBe(axis.clientWidth)

    // 连线是竖的：高比宽大
    const line = pick(h, '#line0').getBoundingClientRect()
    expect(line.height).toBeGreaterThan(line.width)
    expect(overflow(axis)).toBe(0)
  })

  it.each(WIDE)('%ipx：宽档回到并排，连线躺平', (w) => {
    const h = frame(w, timelineMarkup('horizontal'))
    const axis = pick(h, '#axis')

    // 四条等分整行
    const widths = EVENTS.map((_, i) => pick(h, `#event${i}`).getBoundingClientRect().width)
    for (const width of widths)
      expect(width).toBeCloseTo(axis.clientWidth / EVENTS.length, 1)

    const line = pick(h, '#line0').getBoundingClientRect()
    expect(line.width).toBeGreaterThan(line.height)
    expect(overflow(axis)).toBe(0)
  })

  it('窄档的横排与竖排摆法一致：换的是形态，不是别的', () => {
    const across = frame(375, timelineMarkup('horizontal')).querySelector('#axis') as HTMLElement
    const acrossHeight = across.getBoundingClientRect().height
    const down = frame(375, timelineMarkup('vertical')).querySelector('#axis') as HTMLElement

    expect(down.getBoundingClientRect().height).toBe(acrossHeight)
  })

  it.each([375, 1280])('%ipx：竖排不受横排那档影响', (w) => {
    const h = frame(w, timelineMarkup('vertical'))
    const line = pick(h, '#line0').getBoundingClientRect()

    expect(line.height).toBeGreaterThan(line.width)
    expect(overflow(pick(h, '#axis'))).toBe(0)
  })

  it('窄档带坐标时圆点与连线仍对在一条竖线上', () => {
    const h = frame(375, timelineMarkup('horizontal', true))
    const dot = pick(h, '#dot0').getBoundingClientRect()
    const line = pick(h, '#line0').getBoundingClientRect()

    // 坐标另占一列，没把圆点那一列撑宽
    expect(dot.left + dot.width / 2).toBeCloseTo(line.left + line.width / 2, 1)
    expect(pick(h, '#label0').getBoundingClientRect().right).toBeLessThanOrEqual(dot.left)
  })

  it('查询看的是视口，不是外层容器的宽度', () => {
    // 宽视口里塞一个 360 的窄栏：档仍按视口算，这条轴照旧并排
    const h = frame(1280, `<div style="inline-size: 360px">${timelineMarkup('horizontal')}</div>`)
    const line = pick(h, '#line0').getBoundingClientRect()

    expect(line.width).toBeGreaterThan(line.height)
    expect(pick(h, '#event0').getBoundingClientRect().width)
      .toBeCloseTo(pick(h, '#axis').clientWidth / EVENTS.length, 1)
  })

  it('不可断的长串在框内断开，不把整条轴顶出容器', () => {
    const h = frame(375, timelineMarkup('horizontal').replace('内测启动', 'ORD-2026090812345678901234'))

    expect(overflow(pick(h, '#axis'))).toBe(0)
    expect(overflow(h)).toBe(0)
  })
})

describe('steps 只折行、不翻朝向', () => {
  it.each([320, 375])('%ipx：横排折到下一行，标题不再被切', (w) => {
    const h = mount(w, stepsMarkup('horizontal'))
    const list = pick(h, '#list')

    // 折了行：列表比单行高
    expect(list.getBoundingClientRect().height).toBeGreaterThan(
      pick(h, '#item0').getBoundingClientRect().height,
    )
    for (let i = 0; i < STEP_TITLES.length; i++)
      expect(clipped(pick(h, `#title${i}`))).toBe(false)
    expect(overflow(list)).toBe(0)
  })

  it.each(WIDE)('%ipx：宽处仍是一行，各步等分', (w) => {
    const h = mount(w, stepsMarkup('horizontal'))
    const list = pick(h, '#list')

    expect(list.getBoundingClientRect().height).toBe(
      pick(h, '#item0').getBoundingClientRect().height,
    )
    // 末步按内容宽摆，前面几步等分剩下的
    expect(pick(h, '#item0').getBoundingClientRect().width)
      .toBe(pick(h, '#item1').getBoundingClientRect().width)
    expect(overflow(list)).toBe(0)
  })

  it('单步长过整行时退回省略号，不把列表顶出容器', () => {
    const long = ['填写收货地址与联系人手机号并核对邮政编码信息', '选择支付方式', '确认订单信息']
    const h = mount(320, stepsMarkup('horizontal', long))

    expect(clipped(pick(h, '#title0'))).toBe(true)
    expect(overflow(pick(h, '#list'))).toBe(0)
    expect(overflow(host!)).toBe(0)
  })

  it('末步标题长过整行时也收得住', () => {
    const long = ['填写收货地址', '选择支付方式', '确认订单信息与发票抬头以及配送时间段选择']
    const h = mount(320, stepsMarkup('horizontal', long))

    expect(overflow(pick(h, '#list'))).toBe(0)
    expect(overflow(host!)).toBe(0)
  })

  it.each([320, 375])('%ipx：竖排放不下两栏时面板换行，步骤列拿回整行', (w) => {
    const h = mount(w, stepsMarkup('vertical'))
    const list = pick(h, '#list')
    const panel = pick(h, '#panel')

    // 面板换到了下一行：它的上边缘在步骤列的下边缘之下
    expect(panel.getBoundingClientRect().top)
      .toBeGreaterThanOrEqual(list.getBoundingClientRect().bottom)
    for (let i = 0; i < STEP_TITLES.length; i++)
      expect(clipped(pick(h, `#title${i}`))).toBe(false)
  })

  it.each(WIDE)('%ipx：竖排在宽处仍与面板并排', (w) => {
    const h = mount(w, stepsMarkup('vertical'))
    const list = pick(h, '#list').getBoundingClientRect()
    const panel = pick(h, '#panel').getBoundingClientRect()

    expect(panel.left).toBeGreaterThanOrEqual(list.right)
  })

  it.each(WIDE)('%ipx：面板里塞一整段散文也不换行——换行看的是那一格的基准宽，不是内容宽', (w) => {
    const prose = '面板：'.concat('填写收货地址，含收货人、手机号与详细地址。'.repeat(12))
    const h = mount(w, stepsMarkup('vertical').replace(/面板：[^<]*/, prose))
    const list = pick(h, '#list').getBoundingClientRect()
    const panel = pick(h, '#panel').getBoundingClientRect()

    expect(panel.left).toBeGreaterThanOrEqual(list.right)
  })

  it.each([320, 375, 768, 1280])('%ipx：横排还是横排，皮肤不翻朝向，键盘轴因此对得上', (w) => {
    const h = mount(w, stepsMarkup('horizontal'))

    // 折行只把摆不下的那几步挪到下一行，主轴始终是行内一轴
    expect(getComputedStyle(pick(h, '#list')).flexDirection).toBe('row')

    // 落在同一行的两步一定是左右相邻：方向键的左右与看到的左右一致
    const first = pick(h, '#item0').getBoundingClientRect()
    const second = pick(h, '#item1').getBoundingClientRect()
    if (second.top === first.top)
      expect(second.left).toBeGreaterThan(first.left)
    else
      expect(second.top).toBeGreaterThan(first.top)
  })
})
