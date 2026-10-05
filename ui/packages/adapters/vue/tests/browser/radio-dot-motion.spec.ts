// 单选圆点的动效：RadioGroup 与 QuestionFlow 单选同一套——选中时圆点从 0 缩放到 1、落位走过冲收束
// （settle），收起时不走过冲曲线（缩放到 0 不会冲成负值、闪出镜像点）；圆点换色走 micro，
// 按住时的换色走 press 时间线。
import { afterEach, describe, expect, it } from 'vitest'
import { pressPointer, releasePointerAway } from './pointer-press'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let host: HTMLElement | null = null

afterEach(async () => {
  await releasePointerAway()
  host?.remove()
  host = null
})

function mount(html: string): void {
  host = document.createElement('div')
  host.innerHTML = html
  document.body.append(host)
}

function resolve(property: string, value: string): string {
  const probe = document.createElement('div')
  probe.style.setProperty(property, value)
  host!.append(probe)
  const out = getComputedStyle(probe).getPropertyValue(property)
  probe.remove()
  return out
}

/** 圆点某一项过渡的时长与曲线 */
function channel(el: HTMLElement, property: string): { duration: string, easing: string } {
  const style = getComputedStyle(el, '::before')
  const properties = style.transitionProperty.split(', ')
  const index = properties.indexOf(property)
  expect(index, `圆点要过渡 ${property}`).toBeGreaterThanOrEqual(0)
  // 曲线里带逗号，按顶层逗号切
  const easings = style.transitionTimingFunction.match(/(?:cubic-bezier|linear|steps)\([^)]*\)|[a-z-]+/g)!
  return { duration: style.transitionDuration.split(', ')[index]!, easing: easings[index]! }
}

const DOTS = {
  'radio-group': () => mount(`
    <div data-scope="radio-group" class="xh-scope-radio-group" data-part="root" data-orientation="vertical">
      <div data-scope="radio-group" class="xh-scope-radio-group" data-part="item">
        <span data-scope="radio-group" class="xh-scope-radio-group" data-part="indicator" data-state="checked"></span>
        <span data-scope="radio-group" class="xh-scope-radio-group" data-part="item-text">免费版</span>
      </div>
      <div data-scope="radio-group" class="xh-scope-radio-group" data-part="item">
        <span data-scope="radio-group" class="xh-scope-radio-group" data-part="indicator" data-state="unchecked"></span>
        <span data-scope="radio-group" class="xh-scope-radio-group" data-part="item-text">专业版</span>
      </div>
    </div>`),
  'question-flow': () => mount(`
    <div data-scope="question-flow" class="xh-scope-question-flow" data-part="root">
      <div data-scope="question-flow" class="xh-scope-question-flow" data-part="group">
        <button data-scope="question-flow" class="xh-scope-question-flow" data-part="item" data-state="checked" data-xh-action-control data-xh-action-profile="row" data-xh-action-variant="ghost">
          <span data-scope="question-flow" class="xh-scope-question-flow" data-part="item-indicator" data-state="checked" data-select-mode="single"></span>
          <span data-scope="question-flow" class="xh-scope-question-flow" data-part="item-text">甲</span>
        </button>
        <button data-scope="question-flow" class="xh-scope-question-flow" data-part="item" data-state="unchecked" data-xh-action-control data-xh-action-profile="row" data-xh-action-variant="ghost">
          <span data-scope="question-flow" class="xh-scope-question-flow" data-part="item-indicator" data-state="unchecked" data-select-mode="single"></span>
          <span data-scope="question-flow" class="xh-scope-question-flow" data-part="item-text">乙</span>
        </button>
      </div>
    </div>`),
} as const

describe.each(Object.keys(DOTS) as Array<keyof typeof DOTS>)('%s 单选圆点', (scope) => {
  const part = scope === 'radio-group' ? 'indicator' : 'item-indicator'
  const dots = (): HTMLElement[] => [...host!.querySelectorAll<HTMLElement>(`[data-scope='${scope}'][data-part='${part}']`)]

  it('选中时缩放落位走过冲收束，收起时不过冲', () => {
    DOTS[scope]()
    const [on, off] = dots() as [HTMLElement, HTMLElement]
    expect(getComputedStyle(on, '::before').scale).toBe('1')
    expect(getComputedStyle(off, '::before').scale).toBe('0')
    const nudge = resolve('transition-duration', 'var(--xh-motion-duration-nudge)')
    // 选中那颗：落位时略涨过 1 再收回
    expect(channel(on, 'scale')).toEqual({ duration: nudge, easing: resolve('transition-timing-function', 'var(--xh-motion-ease-settle)') })
    // 没选中那颗（收起的去向）：强减速，不过冲
    expect(channel(off, 'scale')).toEqual({ duration: nudge, easing: resolve('transition-timing-function', 'var(--xh-motion-ease-enter-strong)') })
  })

  it('圆点换色走 micro', () => {
    DOTS[scope]()
    for (const dot of dots())
      expect(channel(dot, 'background-color').duration).toBe(resolve('transition-duration', 'var(--xh-motion-duration-micro)'))
  })
})

describe('radio-group 选中圆点的按下换色', () => {
  it('按住条目时圆点换到语气 active 档，走 press 时间线', async () => {
    DOTS['radio-group']()
    const on = host!.querySelector<HTMLElement>(`[data-part='indicator'][data-state='checked']`)!
    const rest = getComputedStyle(on, '::before').backgroundColor
    await pressPointer(on.closest<HTMLElement>(`[data-part='item']`)!)
    expect(channel(on, 'background-color')).toEqual({
      duration: resolve('transition-duration', 'var(--xh-motion-duration-press)'),
      easing: resolve('transition-timing-function', 'var(--xh-motion-ease-press)'),
    })
    for (const animation of document.getAnimations())
      animation.finish()
    expect(getComputedStyle(on, '::before').backgroundColor).not.toBe(rest)
  })
})
