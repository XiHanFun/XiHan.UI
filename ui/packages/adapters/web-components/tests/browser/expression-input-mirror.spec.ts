// 表达式输入框的镜像层与输入框逐字对齐：问题区间的下划线落在对应的字上，输入框横向滚动时跟着滚；
// 多行时补全浮层锚在光标处，而不是整个输入框之下。
//
// 只有真实浏览器量得出来：字形位置、滚动与浮层落位都是布局结果。
import type { ExpressionCheck, ExpressionCompletion } from '@xihan-ui/core'
import { caretClientRect } from '@xihan-ui/core'
import { afterEach, describe, expect, it } from 'vitest'
import { defineXhElements } from '../../src/define'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

defineXhElements()

interface ExpressionInputElement extends HTMLElement {
  check?: ExpressionCheck
  checkDelay?: number
  completions?: readonly ExpressionCompletion[]
  defaultValue?: string
  multiline?: boolean
  updateComplete: Promise<unknown>
}

const FIELDS: readonly ExpressionCompletion[] = [{ label: 'amount', kind: 'variable' }, { label: 'applicant', kind: 'variable' }]

/** 把未知的名字 amont 报成问题。 */
const checkAmont: ExpressionCheck = source => [...source.matchAll(/amont/g)].map(match => ({ start: match.index, end: match.index + 5, message: 'unknown' }))

let host: HTMLElement | null = null

afterEach(() => {
  host?.remove()
  host = null
})

async function frames(n = 2): Promise<void> {
  for (let i = 0; i < n; i++)
    await new Promise(resolve => requestAnimationFrame(resolve))
}

async function mount(options: { value: string, multiline?: boolean, width?: string }): Promise<ExpressionInputElement> {
  host = document.createElement('div')
  host.style.inlineSize = options.width ?? '320px'
  host.style.padding = '16px'
  const el = document.createElement('xh-expression-input') as ExpressionInputElement
  el.setAttribute('label', '公式')
  el.multiline = options.multiline ?? false
  el.defaultValue = options.value
  el.check = checkAmont
  el.checkDelay = 0
  el.completions = FIELDS
  host.append(el)
  document.body.append(host)
  for (let i = 0; i < 3; i++) {
    await Promise.resolve()
    await el.updateComplete
  }
  await frames()
  return el
}

function part<T extends HTMLElement = HTMLElement>(name: string): T {
  return document.querySelector<T>(`[data-scope='expression-input'][data-part='${name}']`)!
}

/** 输入框里第 index 个字符左缘的视口横坐标：按输入框自己的字体量出前缀宽度，扣掉横向滚动。 */
function glyphLeft(input: HTMLInputElement, index: number): number {
  const style = getComputedStyle(input)
  const ctx = document.createElement('canvas').getContext('2d')!
  ctx.font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`
  const rect = input.getBoundingClientRect()
  return rect.left + Number.parseFloat(style.borderLeftWidth) + Number.parseFloat(style.paddingLeft) + ctx.measureText(input.value.slice(0, index)).width - input.scrollLeft
}

async function waitForMark(): Promise<HTMLElement> {
  for (let i = 0; i < 20; i++) {
    const mark = document.querySelector<HTMLElement>(`[data-scope='expression-input'][data-part='highlight-segment'][data-issue]`)
    if (mark)
      return mark
    await frames(1)
  }
  throw new Error('问题区间一直没成段')
}

describe('表达式输入框的镜像层', () => {
  it('与输入框同字体、同内衬：问题区间那一段落在输入框里对应的字上，文字本身不可见', async () => {
    await mount({ value: 'amount + amont' })
    const input = part<HTMLInputElement>('input')
    input.focus()
    input.blur()
    const mark = await waitForMark()
    const inputStyle = getComputedStyle(input)
    const mirrorStyle = getComputedStyle(part('highlight'))
    expect(mirrorStyle.fontFamily).toBe(inputStyle.fontFamily)
    expect(mirrorStyle.fontSize).toBe(inputStyle.fontSize)
    expect(mirrorStyle.letterSpacing).toBe(inputStyle.letterSpacing)
    expect(mirrorStyle.color).toBe('rgba(0, 0, 0, 0)')
    expect(Math.abs(mark.getBoundingClientRect().left - glyphLeft(input, 9))).toBeLessThan(1.5)
    // 镜像层不挡输入框：点击、选字都落在输入框上
    expect(mirrorStyle.pointerEvents).toBe('none')
  })

  it('输入框横向滚动时镜像层跟着滚，下划线仍落在同一段字上', async () => {
    const head = 'amount + '.repeat(8)
    await mount({ value: '', width: '200px' })
    const input = part<HTMLInputElement>('input')
    // 保持聚焦：Chrome 失焦时会把输入框滚回行首，问题改由打字后的去抖检查带出
    input.focus()
    input.value = `${head}amont`
    input.setSelectionRange(input.value.length, input.value.length)
    input.dispatchEvent(new Event('input', { bubbles: true }))
    input.scrollLeft = input.scrollWidth
    const mark = await waitForMark()
    await frames()
    expect(input.scrollLeft).toBeGreaterThan(0)
    expect(part('highlight').scrollLeft).toBe(input.scrollLeft)
    expect(Math.abs(mark.getBoundingClientRect().left - glyphLeft(input, head.length))).toBeLessThan(1.5)
  })
})

describe('表达式输入框的多行形态', () => {
  it('补全浮层锚在光标处：落在光标所在的第一行之下、左缘对齐光标，不是整个输入框之下', async () => {
    await mount({ value: '', multiline: true })
    const input = part<HTMLTextAreaElement>('input')
    input.focus()
    input.value = 'IF(am\n  1,\n  2)'
    input.setSelectionRange(5, 5)
    input.dispatchEvent(new Event('input', { bubbles: true }))
    await frames(4)
    const content = part('content')
    expect(content.hidden).toBe(false)
    const caret = caretClientRect(input, 5)!
    const box = content.getBoundingClientRect()
    expect(box.top).toBeGreaterThanOrEqual(caret.y + caret.height - 1)
    // 锚点是光标而不是整个输入框：浮层顶在输入框底边之上
    expect(box.top).toBeLessThan(input.getBoundingClientRect().bottom)
    expect(Math.abs(box.left - caret.x)).toBeLessThan(2)
  })
})
