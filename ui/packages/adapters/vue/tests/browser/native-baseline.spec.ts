// 库节点的样子只由皮肤与配方决定，不取决于它渲染成什么标签。
//
// 浏览器会按标签给一份缺省外观：按钮有底色、描边、内衬与自己的字体，标题加粗放大，段落与列表带外边距，
// 链接带下划线与蓝字，表单控件是「原生外观」……这些一律由基线层（css/reset.css）统一收掉，
// 皮肤不各收各的。判据：同一组「浏览器会按标签给缺省值」的属性，任何标签的库节点读出来都与 div 的库节点一样。
// 页面上不引任何宿主的全局重置，只有库自己的令牌与皮肤。
import { afterEach, describe, expect, it } from 'vitest'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

/** 浏览器会按标签给缺省值的那些属性。 */
const PROPS = [
  'margin-top',
  'margin-right',
  'margin-bottom',
  'margin-left',
  'padding-top',
  'padding-right',
  'padding-bottom',
  'padding-left',
  'border-top-width',
  'border-right-width',
  'border-bottom-width',
  'border-left-width',
  'border-top-style',
  'border-top-left-radius',
  'background-color',
  'background-image',
  'color',
  'font-family',
  'font-size',
  'font-weight',
  'font-style',
  'line-height',
  'letter-spacing',
  'text-decoration-line',
  'appearance',
  'box-shadow',
]

/** 标签，及它需要的属性。表格内部的标签要放进表格里才是它自己，另列。 */
const TAGS: Array<[string, Record<string, string>?]> = [
  ['button'],
  ['input', { type: 'text' }],
  ['input', { type: 'search' }],
  ['input', { type: 'password' }],
  ['input', { type: 'email' }],
  ['input', { type: 'tel' }],
  ['input', { type: 'url' }],
  ['input', { type: 'number' }],
  ['textarea'],
  ['select'],
  ['a', { href: '#' }],
  ['h1'],
  ['h2'],
  ['h3'],
  ['h4'],
  ['h5'],
  ['h6'],
  ['p'],
  ['ul'],
  ['ol'],
  ['li'],
  ['dl'],
  ['dt'],
  ['dd'],
  ['figure'],
  ['figcaption'],
  ['blockquote'],
  ['pre'],
  ['code'],
  ['kbd'],
  ['samp'],
  ['fieldset'],
  ['legend'],
  ['hr'],
  ['label'],
  ['strong'],
  ['b'],
  ['em'],
  ['i'],
  ['small'],
  ['mark'],
  ['address'],
  ['cite'],
  ['u'],
  ['s'],
  ['ins'],
  ['del'],
  ['abbr', { title: '缩写' }],
  ['summary'],
  ['nav'],
  ['section'],
  ['header'],
  ['footer'],
  ['article'],
  ['aside'],
  ['time'],
  ['output'],
]

let stage: HTMLElement | null = null

afterEach(() => {
  stage?.remove()
  stage = null
})

function probe(tag: string, attrs: Record<string, string> = {}): HTMLElement {
  const el = document.createElement(tag)
  for (const [name, value] of Object.entries(attrs))
    el.setAttribute(name, value)
  // 只是「一个库节点」：没有哪份皮肤认得这个 scope，读到的就是基线层给的样子
  el.setAttribute('data-scope', 'native-baseline-probe')
  el.setAttribute('data-part', 'node')
  return el
}

function read(el: HTMLElement): Record<string, string> {
  const style = getComputedStyle(el)
  return Object.fromEntries(PROPS.map(prop => [prop, style.getPropertyValue(prop)]))
}

function mountStage(): HTMLElement {
  stage = document.createElement('div')
  // 给一组不是浏览器缺省的字体与颜色：继承没继承一眼看得出
  stage.setAttribute('style', 'font: italic 600 17px/1.7 Georgia, serif; letter-spacing: 1px; color: rgb(12, 34, 56)')
  document.body.append(stage)
  return stage
}

describe('库节点的样子不取决于标签', () => {
  it('浏览器按标签给缺省值的那些属性，任何标签读出来都与 div 一样', () => {
    const host = mountStage()
    const reference = probe('div')
    host.append(reference)
    const expected = read(reference)

    const off: string[] = []
    for (const [tag, attrs] of TAGS) {
      const el = probe(tag, attrs)
      host.append(el)
      const actual = read(el)
      for (const prop of PROPS) {
        if (actual[prop] !== expected[prop])
          off.push(`<${tag}${attrs?.type ? ` type=${attrs.type}` : ''}> ${prop}: ${actual[prop]}（div 是 ${expected[prop]}）`)
      }
    }
    expect(off).toEqual([])
  })

  it('表格内部的标签同样：表头格不自带加粗与内衬，表格不自带间隙', () => {
    const host = mountStage()
    const reference = probe('div')
    host.append(reference)
    const expected = read(reference)

    const table = probe('table')
    const caption = probe('caption')
    const thead = probe('thead')
    const row = probe('tr')
    const th = probe('th')
    const td = probe('td')
    row.append(th, td)
    thead.append(row)
    table.append(caption, thead)
    host.append(table)

    const off: string[] = []
    for (const [name, el] of [['table', table], ['caption', caption], ['tr', row], ['th', th], ['td', td]] as const) {
      const actual = read(el)
      for (const prop of PROPS) {
        if (actual[prop] !== expected[prop])
          off.push(`<${name}> ${prop}: ${actual[prop]}（div 是 ${expected[prop]}）`)
      }
    }
    expect(off).toEqual([])
    expect(getComputedStyle(table).borderSpacing).toBe('0px')
  })

  it('列表与摘要不带浏览器的项目符号', () => {
    const host = mountStage()
    for (const tag of ['ul', 'ol', 'li', 'summary']) {
      const el = probe(tag)
      host.append(el)
      expect(getComputedStyle(el).listStyleType, tag).toBe('none')
    }
  })

  it('字段集不带浏览器给的最小宽度：内容再宽也收得进父容器', () => {
    const host = mountStage()
    const el = probe('fieldset')
    host.append(el)
    expect(getComputedStyle(el).minInlineSize).toBe('0px')
  })

  it('只收库节点：宿主页面自己的元素一个不碰', () => {
    const host = mountStage()
    const plain = document.createElement('h2')
    const button = document.createElement('button')
    host.append(plain, button)
    // 浏览器给标题的外边距与加粗、给按钮的原生外观都还在
    expect(getComputedStyle(plain).marginTop).not.toBe('0px')
    expect(getComputedStyle(plain).fontWeight).toBe('700')
    expect(getComputedStyle(button).appearance).toBe('auto')
  })
})
