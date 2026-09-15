import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

// 已接入 Field Chrome 家族配方的字段：静息即描边式（canvas 底、border-control 描边、无阴影），按配方断言。
const MIGRATED = ['text-field'] as const

// 尚未接入家族形态矩阵的字段：仍是透明描边 + raised 阴影，只断言彼此同形。
// 这张表只减不增：每迁一家就把它从这里移到 MIGRATED。
const PENDING = ['field', 'number-field', 'date-field', 'date-picker', 'time-field', 'time-picker'] as const

const FAMILIES = [...MIGRATED, ...PENDING] as const

type Family = typeof FAMILIES[number]

let host: HTMLElement | null = null

function markup(): string {
  return `
    <section data-family="field">
      <input data-scope="field" data-part="control" />
    </section>
    <section data-family="text-field">
      <div data-scope="text-field" data-part="root">
        <div data-scope="text-field" data-part="control" data-xh-field-chrome data-xh-field-size="md">
          <input data-scope="text-field" data-part="input" data-xh-field-input data-xh-field-layout="single-line" />
        </div>
      </div>
    </section>
    <section data-family="number-field">
      <div data-scope="number-field" data-part="root">
        <div data-scope="number-field" data-part="control">
          <button data-scope="number-field" data-part="decrement-trigger"></button>
          <input data-scope="number-field" data-part="input" />
          <button data-scope="number-field" data-part="increment-trigger"></button>
        </div>
      </div>
    </section>
    <section data-family="date-field">
      <div data-scope="date-field" data-part="root">
        <div data-scope="date-field" data-part="control">
          <div data-scope="date-field" data-part="segment-group">
            <span data-scope="date-field" data-part="segment" tabindex="0"></span>
          </div>
        </div>
      </div>
    </section>
    <section data-family="date-picker">
      <div data-scope="date-picker" data-part="root">
        <div data-scope="date-picker" data-part="control">
          <div data-scope="date-picker" data-part="segment-group">
            <span data-scope="date-field" data-part="segment" tabindex="0"></span>
          </div>
          <button data-scope="date-picker" data-part="trigger"></button>
        </div>
      </div>
    </section>
    <section data-family="time-field">
      <div data-scope="time-field" data-part="root">
        <div data-scope="time-field" data-part="control">
          <div data-scope="time-field" data-part="segment-group">
            <span data-scope="time-field" data-part="segment" tabindex="0"></span>
          </div>
        </div>
      </div>
    </section>
    <section data-family="time-picker">
      <div data-scope="time-picker" data-part="root">
        <div data-scope="time-picker" data-part="control">
          <div data-scope="time-picker" data-part="segment-group">
            <span data-scope="time-picker" data-part="segment" tabindex="0"></span>
          </div>
          <button data-scope="time-picker" data-part="trigger"></button>
        </div>
      </div>
    </section>
  `
}

function mount(): void {
  host = document.createElement('div')
  host.innerHTML = markup()
  document.body.append(host)
}

function control(family: Family): HTMLElement {
  const element = host?.querySelector<HTMLElement>(`[data-family='${family}'] [data-part='control']`)
  if (!element)
    throw new Error(`缺少 ${family} 的 control`)
  return element
}

function focusTarget(family: Family): HTMLElement {
  if (family === 'field')
    return control(family)
  const element = control(family).querySelector<HTMLElement>('input, [tabindex="0"]')
  if (!element)
    throw new Error(`缺少 ${family} 的焦点目标`)
  return element
}

function exterior(element: HTMLElement): Record<string, string | number> {
  const style = getComputedStyle(element)
  return {
    height: element.getBoundingClientRect().height,
    radius: style.borderTopLeftRadius,
    background: style.backgroundColor,
    borderColor: style.borderTopColor,
    borderWidth: style.borderTopWidth,
    shadow: style.boxShadow,
  }
}

// 用探针把令牌表达式解成与 control 同一格式的计算色，避免在测试里写死颜色散值。
function resolveColor(expression: string): string {
  const probe = document.createElement('div')
  probe.style.backgroundColor = expression
  host!.append(probe)
  const value = getComputedStyle(probe).backgroundColor
  probe.remove()
  return value
}

async function settle(): Promise<void> {
  await new Promise<void>(resolve => setTimeout(resolve, 180))
}

afterEach(async () => {
  host?.remove()
  host = null
  await userEvent.hover(document.querySelector<HTMLElement>('[data-test-park-pointer]')!)
})

describe('字段族默认视觉盒', () => {
  it('迁移表与待迁移表合起来正好是七个字段，且互不重叠', () => {
    expect(new Set(FAMILIES).size).toBe(7)
    expect(MIGRATED.some(family => (PENDING as readonly string[]).includes(family))).toBe(false)
  })

  it('七个字段在常态下使用同一高度、圆角与描边宽度', () => {
    mount()
    for (const family of FAMILIES) {
      const value = exterior(control(family))
      expect(value.height, family).toBe(36)
      expect(value.radius, family).toBe('4px')
      expect(value.borderWidth, family).toBe('1px')
    }
  })

  it('已迁移字段静息为描边式：canvas 底、border-control 描边、无阴影', () => {
    mount()
    for (const family of MIGRATED) {
      const value = exterior(control(family))
      expect(value.background, family).toBe(resolveColor('var(--xh-bg-canvas)'))
      expect(value.borderColor, family).toBe(resolveColor('var(--xh-border-control)'))
      expect(value.shadow, family).toBe('none')
    }
  })

  it('已迁移字段悬停换 border-control-hover 描边与淡混底，仍无阴影', async () => {
    mount()
    for (const family of MIGRATED) {
      await userEvent.hover(control(family))
      await settle()
      const value = exterior(control(family))
      expect(value.background, family).toBe(resolveColor('color-mix(in oklab, var(--xh-bg-subtle) 45%, var(--xh-bg-canvas))'))
      expect(value.borderColor, family).toBe(resolveColor('var(--xh-border-control-hover)'))
      expect(value.shadow, family).toBe('none')
    }
  })

  it('待迁移字段在常态与悬停下仍彼此同形', async () => {
    mount()
    const rest = PENDING.map(family => exterior(control(family)))
    for (const state of rest.slice(1))
      expect(state).toEqual(rest[0])

    const hovered: Array<Record<string, string | number>> = []
    for (const family of PENDING) {
      await userEvent.hover(control(family))
      await settle()
      hovered.push(exterior(control(family)))
    }
    for (const state of hovered.slice(1))
      expect(state).toEqual(hovered[0])
  })

  it('七个字段聚焦时由同一外壳绘制描边与焦点环', async () => {
    mount()
    const states: Array<Record<string, string>> = []
    const animated: boolean[] = []
    for (const family of FAMILIES) {
      focusTarget(family).focus()
      animated.push(control(family).getAnimations().some(animation => animation.playState === 'running'))
      await settle()
      const style = getComputedStyle(control(family))
      expect(style.transitionProperty).toContain('outline-color')
      states.push({
        borderColor: style.borderTopColor,
        outlineColor: style.outlineColor,
        outlineStyle: style.outlineStyle,
        outlineWidth: style.outlineWidth,
      })
    }
    expect(animated.every(Boolean)).toBe(true)
    expect(states[0]?.outlineStyle).toBe('solid')
    for (const state of states.slice(1))
      expect(state).toEqual(states[0])
  })
})
