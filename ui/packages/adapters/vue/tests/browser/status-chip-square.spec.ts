// ToolCall 的状态、Approval 与 QuestionFlow 的结果都是状态 chip：与 Tag 同一副方签——control 圆角、
// 块尺寸取 chip 档（与 Tag sm 同高）、竖向内衬为 0、语气淡底。圆角与盒高只有真实 Chromium 量得出。
import { afterEach, describe, expect, it } from 'vitest'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let host: HTMLElement | null = null

afterEach(() => {
  host?.remove()
  host = null
})

const CHIPS = {
  'tool-call': `<span data-scope="tool-call" class="xh-scope-tool-call" data-part="status" data-state="output-available" data-tone="success">完成</span>`,
  'approval': `<div data-scope="approval" class="xh-scope-approval" data-part="result" data-state="approved" data-tone="success">已批准</div>`,
  'question-flow': `<div data-scope="question-flow" class="xh-scope-question-flow" data-part="result" data-tone="success">已提交</div>`,
} as const

function mount(markup: string): HTMLElement {
  host = document.createElement('div')
  host.style.setProperty('--xh-motion-duration-enter', '0ms')
  host.innerHTML = markup
  document.body.append(host)
  return host.firstElementChild as HTMLElement
}

/** 长度令牌在该元素上解到的像素值。 */
function length(token: string, scope: HTMLElement): number {
  const probe = document.createElement('span')
  probe.style.cssText = `position: absolute; inline-size: var(${token})`
  scope.append(probe)
  const value = probe.getBoundingClientRect().width
  probe.remove()
  return value
}

describe.each(Object.keys(CHIPS) as (keyof typeof CHIPS)[])('%s 的状态 chip', (scope) => {
  it('是 control 圆角的方签：块尺寸取 chip 档，竖向内衬为 0，铺语气淡底', () => {
    const chip = mount(CHIPS[scope])
    const style = getComputedStyle(chip)
    expect(Number.parseFloat(style.borderTopLeftRadius)).toBe(length('--xh-shape-control', chip))
    expect(chip.getBoundingClientRect().height).toBe(length('--xh-chip-h-sm', chip))
    expect(style.paddingTop).toBe('0px')
    expect(style.paddingBottom).toBe('0px')
    expect(style.backgroundColor).not.toBe('rgba(0, 0, 0, 0)')
  })
})
