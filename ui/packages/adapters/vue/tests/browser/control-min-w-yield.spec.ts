// 控件最小宽度地板（--xh-control-min-w）：宽处顶住 12rem，窄处跟着容器收。
//
// 宿主视口固定在一个宽度上且改不动，这里改用内嵌 iframe 自带视口，宽度由这边说了算。
// 皮肤与令牌以 <style> 注入主文档，克隆一份进 iframe 的 head 才生效。
import { afterEach, describe, expect, it } from 'vitest'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let frame: HTMLIFrameElement | null = null

/** 12rem 的地板，与 --xh-control-min-w 同值。 */
const FLOOR = 192

/** 在一个定宽容器里挂一件控件，量根的宽与它在容器里的越界量。 */
function measure(container: number, markup: string) {
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
  doc.body.innerHTML = `<div id="host" style="inline-size:${container}px">${markup}</div>`

  const root = doc.querySelector('[data-part="root"]')
  if (!(root instanceof doc.defaultView!.HTMLElement))
    throw new Error('没有挂上控件根')
  const width = root.getBoundingClientRect().width
  return { width, overflow: width - container }
}

/** 触发器族：root > control > trigger > value-text */
function trigger(scope: string) {
  return `
    <div data-scope="${scope}" data-part="root">
      <button data-scope="${scope}" data-part="control">
        <span data-scope="${scope}" data-part="trigger"><span data-scope="${scope}" data-part="value-text">选一个</span></span>
      </button>
    </div>`
}

/** 分段族：root > control > segment-group > segment */
function segments(scope: string) {
  return `
    <div data-scope="${scope}" data-part="root">
      <div data-scope="${scope}" data-part="control">
        <div data-scope="${scope}" data-part="segment-group"><span data-scope="${scope}" data-part="segment">10</span></div>
      </div>
    </div>`
}

/**
 * text-field：control 与 input 带上 connect 投影的家族属性，量的才是真实组件的盒。
 * 输入框在家族合同里是 flex: 1 1 auto，基准仍是原生 input 按 size=20 撑出的字宽，
 * 这个数随字体走：Windows 上不到地板，CI 的 Linux 字体字宽更大，整件量到 204。
 */
const TEXT_FIELD = `
  <div data-scope="text-field" data-part="root">
    <div data-scope="text-field" data-part="control" data-xh-field-chrome data-xh-field-size="md" data-variant="outline">
      <input data-scope="text-field" data-part="input" data-xh-field-input data-xh-field-layout="single-line" />
    </div>
  </div>`

const NUMBER_FIELD = `
  <div data-scope="number-field" data-part="root">
    <div data-scope="number-field" data-part="control">
      <input data-scope="number-field" data-part="input" />
      <button data-scope="number-field" data-part="increment-trigger"></button>
    </div>
  </div>`

const CLIPBOARD = `
  <div data-scope="clipboard" data-part="root">
    <div data-scope="clipboard" data-part="control">
      <input data-scope="clipboard" data-part="input" readonly value="npm i @xihan-ui/vue" />
      <button data-scope="clipboard" data-part="copy-trigger"></button>
    </div>
  </div>`

const INPUT_GROUP = `
  <div data-scope="input-group" data-part="root">
    <span data-scope="input-group" data-part="item">https://</span>
    ${TEXT_FIELD}
  </div>`

/** 默认宽恰好是那道 12rem 地板的控件；text-field 不在其列，见「不低于地板」那条。 */
const AT_FLOOR: [string, string][] = [
  ['select', trigger('select')],
  ['cascader', trigger('cascader')],
  ['tree-select', trigger('tree-select')],
  ['color-picker', trigger('color-picker')],
  ['number-field', NUMBER_FIELD],
  ['date-field', segments('date-field')],
  ['time-field', segments('time-field')],
  ['date-picker', segments('date-picker')],
  ['time-picker', segments('time-picker')],
]

/** 全部受这道地板牵连的控件，含默认宽由内容决定的那几件。 */
const ALL: [string, string][] = [
  ...AT_FLOOR,
  ['text-field', TEXT_FIELD],
  ['clipboard', CLIPBOARD],
  ['input-group', INPUT_GROUP],
  ['tags-input', `
    <div data-scope="tags-input" data-part="root">
      <div data-scope="tags-input" data-part="control"><input data-scope="tags-input" data-part="input" /></div>
    </div>`],
  ['mention', `
    <div data-scope="mention" data-part="root">
      <textarea data-scope="mention" data-part="input"></textarea>
    </div>`],
]

afterEach(() => {
  frame?.remove()
  frame = null
})

describe('放得下就顶住地板', () => {
  it.each(AT_FLOOR)('%s 在够宽的容器里仍是 12rem', (_name, markup) => {
    expect(measure(480, markup).width).toBe(FLOOR)
    expect(measure(240, markup).width).toBe(FLOOR)
  })

  it('text-field 在够宽的容器里不低于地板，宽由内容与地板定、不由容器定', () => {
    // 原生 input 的字宽基准随字体走，地板只保证下限；两个都放得下的容器里必须量到同一个数
    const wide = measure(480, TEXT_FIELD).width
    expect(wide).toBeGreaterThanOrEqual(FLOOR)
    expect(measure(240, TEXT_FIELD).width).toBe(wide)
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
})
