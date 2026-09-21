// 字段的缺省宽（--xh-control-w）与地板（--xh-control-min-w）：
// 不传尺寸时一族同宽、宽度不随内容走；窄处跟着容器收，地板不高过缺省宽。
//
// 宿主视口固定在一个宽度上且改不动，这里改用内嵌 iframe 自带视口，宽度由这边说了算。
// 皮肤与令牌以 <style> 注入主文档，克隆一份进 iframe 的 head 才生效。
import { afterEach, describe, expect, it } from 'vitest'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let frame: HTMLIFrameElement | null = null

/** 16rem 的缺省宽，与 --xh-control-w 同值。 */
const DEFAULT = 256

/** 12rem 的地板，与 --xh-control-min-w 同值。 */
const FLOOR = 192

/** 在一个定宽容器里挂一件控件，量根的宽与它在容器里的越界量。 */
function measure(container: number, markup: string, hostStyle = '') {
  frame?.remove()
  frame = document.createElement('iframe')
  frame.style.cssText = 'width: 1280px; height: 400px; border: 0'
  document.body.append(frame)

  const doc = frame.contentDocument
  if (!doc)
    throw new Error('iframe 没有文档')
  for (const node of document.querySelectorAll('style, link[rel="stylesheet"]'))
    doc.head.append(node.cloneNode(true))
  doc.body.style.margin = '0'
  doc.body.innerHTML = `<div id="host" style="inline-size:${container}px;${hostStyle}">${markup}</div>`

  const root = doc.querySelector('[data-part="root"]')
  if (!(root instanceof doc.defaultView!.HTMLElement))
    throw new Error('没有挂上控件根')
  const width = root.getBoundingClientRect().width
  return { width, overflow: width - container }
}

/** 触发器族：root > control > trigger > value-text，值文字故意很长，缺省宽不许被它撑开 */
function trigger(scope: string) {
  return `
    <div data-scope="${scope}" data-part="root">
      <button data-scope="${scope}" data-part="control" data-xh-field-chrome data-xh-field-size="md" data-variant="outline">
        <span data-scope="${scope}" data-part="trigger"><span data-scope="${scope}" data-part="value-text">旗舰版 · 含无限席位与专属客户成功经理的年度合约</span></span>
      </button>
    </div>`
}

/** 分段族：root > control > segment-group > segment */
function segments(scope: string) {
  return `
    <div data-scope="${scope}" data-part="root">
      <div data-scope="${scope}" data-part="control" data-xh-field-chrome data-xh-field-size="md" data-variant="outline">
        <div data-scope="${scope}" data-part="segment-group"><span data-scope="${scope}" data-part="segment">10</span></div>
      </div>
    </div>`
}

/** 分段区间族：起止两组段位 + 分隔符 + 日历钮排在一行 */
function rangeSegments(scope: string, segment: string) {
  const group = (index: number) => `
        <div data-scope="${scope}" data-part="segment-group" data-index="${index}">
          <span data-scope="${scope}" data-part="segment">${segment}</span><span>/</span>
          <span data-scope="${scope}" data-part="segment">mm</span><span>/</span>
          <span data-scope="${scope}" data-part="segment">dd</span>
        </div>`
  return `
    <div data-scope="${scope}" data-part="root">
      <div data-scope="${scope}" data-part="control" data-xh-field-chrome data-xh-field-size="md" data-variant="outline">
        ${group(0)}
        <span data-scope="${scope}" data-part="range-separator">–</span>
        ${group(1)}
        <button data-scope="${scope}" data-part="trigger"></button>
      </div>
    </div>`
}

/**
 * text-field：control 与 input 带上 connect 投影的家族属性，量的才是真实组件的盒。
 * 原生 input 按 size=20 撑出的字宽随字体走（Windows 上不到地板，CI 的 Linux 字体更宽），
 * 缺省宽钉住之后这个数不再露出来。
 */
const TEXT_FIELD = `
  <div data-scope="text-field" data-part="root">
    <div data-scope="text-field" data-part="control" data-xh-field-chrome data-xh-field-size="md" data-variant="outline">
      <input data-scope="text-field" data-part="input" data-xh-field-input data-xh-field-layout="single-line" />
    </div>
  </div>`

const NUMBER_FIELD = `
  <div data-scope="number-field" data-part="root">
    <div data-scope="number-field" data-part="control" data-xh-field-chrome data-xh-field-size="md" data-variant="outline">
      <input data-scope="number-field" data-part="input" data-xh-field-input data-xh-field-layout="single-line" />
      <button data-scope="number-field" data-part="increment-trigger"></button>
    </div>
  </div>`

/** clipboard：输入框与复制钮并排，值故意很长，钮不许被顶出去 */
const CLIPBOARD = `
  <div data-scope="clipboard" data-part="root">
    <div data-scope="clipboard" data-part="control">
      <input data-scope="clipboard" data-part="input" readonly value="npm i @xihan-ui/vue @xihan-ui/styles @xihan-ui/tokens @xihan-ui/icons" />
      <button data-scope="clipboard" data-part="copy-trigger"></button>
    </div>
  </div>`

/** clipboard 只放复制钮的用法：一颗独立按钮，不吃字段缺省宽 */
const CLIPBOARD_TRIGGER_ONLY = `
  <div data-scope="clipboard" data-part="root">
    <button data-scope="clipboard" data-part="copy-trigger">复制链接</button>
  </div>`

const TAGS_INPUT = `
  <div data-scope="tags-input" data-part="root">
    <div data-scope="tags-input" data-part="control" data-xh-field-chrome data-xh-field-size="md" data-variant="outline" data-xh-field-layout="multi-tag">
      <input data-scope="tags-input" data-part="input" data-xh-field-input data-xh-field-layout="multi-tag" />
    </div>
  </div>`

const MENTION = `
  <div data-scope="mention" data-part="root">
    <textarea data-scope="mention" data-part="input" data-xh-field-chrome data-xh-field-size="md" data-variant="outline"></textarea>
  </div>`

const INPUT_GROUP = `
  <div data-scope="input-group" data-part="root">
    <span data-scope="input-group" data-part="item">https://</span>
    ${TEXT_FIELD}
  </div>`

/** 不传尺寸时一律缺省宽的控件。 */
const AT_DEFAULT: [string, string][] = [
  ['select', trigger('select')],
  ['cascader', trigger('cascader')],
  ['tree-select', trigger('tree-select')],
  ['color-picker', trigger('color-picker')],
  ['text-field', TEXT_FIELD],
  ['number-field', NUMBER_FIELD],
  ['date-field', segments('date-field')],
  ['time-field', segments('time-field')],
  ['date-picker', segments('date-picker')],
  ['time-picker', segments('time-picker')],
  ['time-range-picker', rangeSegments('time-range-picker', 'hh')],
  ['clipboard', CLIPBOARD],
  ['tags-input', TAGS_INPUT],
  ['mention', MENTION],
]

/** 全部受地板牵连的控件，含按内容撑开的那一件与套在组里的。 */
const ALL: [string, string][] = [
  ...AT_DEFAULT,
  ['date-range-picker', rangeSegments('date-range-picker', 'yyyy')],
  ['input-group', INPUT_GROUP],
]

afterEach(() => {
  frame?.remove()
  frame = null
})

describe('不传尺寸时一族同宽', () => {
  it.each(AT_DEFAULT)('%s 在够宽的容器里恰是 16rem，不随内容也不随容器走', (_name, markup) => {
    expect(measure(480, markup).width).toBe(DEFAULT)
    expect(measure(300, markup).width).toBe(DEFAULT)
  })

  it('date-range-picker 起止两组按日的段位放不进缺省宽，按内容撑开', () => {
    const wide = measure(600, rangeSegments('date-range-picker', 'yyyy')).width
    expect(wide).toBeGreaterThan(DEFAULT)
    // 撑开的是内容而不是容器：两个都放得下的容器里量到同一个数
    expect(measure(480, rangeSegments('date-range-picker', 'yyyy')).width).toBe(wide)
  })

  it('date-range-picker 按年的内容比缺省宽窄时顶住缺省宽，不比别的字段窄', () => {
    const markup = `
      <div data-scope="date-range-picker" data-part="root">
        <div data-scope="date-range-picker" data-part="control" data-xh-field-chrome data-xh-field-size="md" data-variant="outline">
          <div data-scope="date-range-picker" data-part="segment-group"><span data-scope="date-range-picker" data-part="segment">yyyy</span></div>
          <span data-scope="date-range-picker" data-part="range-separator">–</span>
          <div data-scope="date-range-picker" data-part="segment-group"><span data-scope="date-range-picker" data-part="segment">yyyy</span></div>
        </div>
      </div>`
    expect(measure(480, markup).width).toBe(DEFAULT)
  })

  it('clipboard 只放复制钮时是一颗独立按钮，宽随文字走', () => {
    expect(measure(480, CLIPBOARD_TRIGGER_ONLY).width).toBeLessThan(FLOOR)
  })
})

describe('缺省宽由槽给', () => {
  it('全局 --xh-control-w 一起改', () => {
    expect(measure(480, trigger('select'), '--xh-control-w: 20rem').width).toBe(320)
    expect(measure(480, TEXT_FIELD, '--xh-control-w: 20rem').width).toBe(320)
  })

  it('单类 --xh-<c>-control-w 只改这一类', () => {
    expect(measure(480, trigger('select'), '--xh-select-control-w: 20rem').width).toBe(320)
    expect(measure(480, trigger('cascader'), '--xh-select-control-w: 20rem').width).toBe(DEFAULT)
  })

  it('缺省宽钉到地板以下时地板跟着让，不必再放开 --xh-control-min-w', () => {
    expect(measure(480, trigger('select'), '--xh-select-control-w: 10rem').width).toBe(160)
    expect(measure(480, TEXT_FIELD, '--xh-control-w: 8rem').width).toBe(128)
  })

  it('date-range-picker 钉宽仍走 --xh-date-range-picker-control-w', () => {
    expect(measure(600, rangeSegments('date-range-picker', 'yyyy'), '--xh-date-range-picker-control-w: 24rem').width).toBe(384)
  })
})

describe('放不下就让步', () => {
  // 三档都比 12rem 窄：地板不让步的话每一档都会顶着 192px 越出去
  const NARROW = [200, 160, 120]

  it.each(ALL)('%s 不越出窄容器', (_name, markup) => {
    for (const container of NARROW)
      expect(measure(container, markup).overflow).toBeLessThanOrEqual(0)
  })

  it.each(ALL)('%s 收到与容器同宽', (_name, markup) => {
    // 120px 远低于地板：整件必须正好收成容器那么宽，而不是停在某个更大的数上
    expect(measure(120, markup).width).toBe(120)
  })

  it('夹在 flex 行里时收到地板为止', () => {
    // 行里还有一件不让步的邻居，字段只能从缺省宽往下收，收到 12rem 的地板停住
    const markup = `<div style="display:flex"><div style="flex:none;inline-size:120px"></div>${trigger('select')}</div>`
    expect(measure(300, markup).width).toBe(FLOOR)
  })
})
