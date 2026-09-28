// DateField 段位的聚焦反白：换色走状态角色的 micro 淡变，与 TimeField 同一档。
// DatePicker 的输入段复用 DateField 的段位（data-scope="date-field"），一并由这条规则管。
import { afterEach, describe, expect, it } from 'vitest'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let host: HTMLElement | null = null

afterEach(() => {
  host?.remove()
  host = null
})

function mountSegments(scope: 'date-field' | 'time-field', motion?: 'reduce'): HTMLElement[] {
  host = document.createElement('div')
  if (motion)
    host.dataset.motion = motion
  host.innerHTML = `
    <div data-scope="${scope}" data-part="root">
      <div data-scope="${scope}" data-part="control">
        <div data-scope="${scope}" data-part="segment-group">
          <span data-scope="${scope}" data-part="segment" tabindex="0">2026</span>
          <span data-scope="${scope}" data-part="segment" tabindex="-1">09</span>
        </div>
      </div>
    </div>`
  document.body.append(host)
  return [...host.querySelectorAll<HTMLElement>('[data-part="segment"]')]
}

/** 段位换上反白时起跑的过渡：属性名 → 时长毫秒。 */
function focusTransitions(segment: HTMLElement): Record<string, number> {
  // 先让静息态落成一帧：过渡要有起点
  void getComputedStyle(segment).backgroundColor
  segment.setAttribute('data-focus', '')
  void getComputedStyle(segment).backgroundColor
  const result: Record<string, number> = {}
  for (const animation of segment.getAnimations()) {
    if (animation instanceof CSSTransition)
      result[animation.transitionProperty] = Number(animation.effect?.getComputedTiming().duration)
  }
  return result
}

function micro(): number {
  return Number.parseFloat(getComputedStyle(host!.firstElementChild!).getPropertyValue('--xh-motion-duration-micro'))
}

describe('date-field 段位聚焦换色', () => {
  it('当前段的底色与字色按 micro 淡入，与 TimeField 同一档', () => {
    const [date] = mountSegments('date-field')
    const dateTransitions = focusTransitions(date!)
    const duration = micro()
    expect(duration).toBeGreaterThan(0)
    expect(dateTransitions['background-color']).toBe(duration)
    expect(dateTransitions.color).toBe(duration)
    host!.remove()

    const [time] = mountSegments('time-field')
    expect(focusTransitions(time!)).toEqual(dateTransitions)
  })

  it('减弱动效下仍留淡变：换色不属于位移', () => {
    const [segment] = mountSegments('date-field', 'reduce')
    const transitions = focusTransitions(segment!)
    expect(transitions['background-color']).toBe(micro())
    expect(transitions['background-color']).toBeGreaterThan(1)
  })
})
