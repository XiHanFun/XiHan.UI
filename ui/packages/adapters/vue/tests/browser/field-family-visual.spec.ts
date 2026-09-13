import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

const FAMILIES = [
  'field',
  'text-field',
  'number-field',
  'date-field',
  'date-picker',
  'time-field',
  'time-picker',
] as const

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

function control(family: typeof FAMILIES[number]): HTMLElement {
  const element = host?.querySelector<HTMLElement>(`[data-family='${family}'] [data-part='control']`)
  if (!element)
    throw new Error(`缺少 ${family} 的 control`)
  return element
}

function focusTarget(family: typeof FAMILIES[number]): HTMLElement {
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

async function settle(): Promise<void> {
  await new Promise<void>(resolve => setTimeout(resolve, 180))
}

afterEach(async () => {
  host?.remove()
  host = null
  await userEvent.hover(document.querySelector<HTMLElement>('[data-test-park-pointer]')!)
})

describe('字段族默认视觉盒', () => {
  it('七个字段在常态下使用同一高度、圆角、表面、描边与阴影', () => {
    mount()
    const expected = exterior(control('text-field'))
    expect(expected.height).toBe(36)
    expect(expected.radius).toBe('12px')
    for (const family of FAMILIES)
      expect(exterior(control(family))).toEqual(expected)
  })

  it('七个字段的悬停反馈完全一致', async () => {
    mount()
    const states: Array<Record<string, string | number>> = []
    for (const family of FAMILIES) {
      await userEvent.hover(control(family))
      await settle()
      states.push(exterior(control(family)))
    }
    for (const state of states.slice(1))
      expect(state).toEqual(states[0])
  })

  it('七个字段聚焦时由同一外壳绘制描边与焦点环', async () => {
    mount()
    const states: Array<Record<string, string>> = []
    for (const family of FAMILIES) {
      focusTarget(family).focus()
      await settle()
      const style = getComputedStyle(control(family))
      states.push({
        borderColor: style.borderTopColor,
        outlineColor: style.outlineColor,
        outlineStyle: style.outlineStyle,
        outlineWidth: style.outlineWidth,
      })
    }
    expect(states[0]?.outlineStyle).toBe('solid')
    for (const state of states.slice(1))
      expect(state).toEqual(states[0])
  })
})
