// 格式输入的排布与命中区：参数行按列宽分栏、各格底边对齐，开关那一行与旁边的控件等高；
// 分段切换那一行的 fieldset 没有 UA 边框；点开关那一行的名字切换开关；放进字段时点标签把焦点送到种类控件。
import type { Root } from 'react-dom/client'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { userEvent } from 'vitest/browser'
import { XhFieldLabel, XhFieldRoot, XhFormatInputRoot } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let root: Root | null = null
let host: HTMLElement | null = null

beforeEach(() => vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true))
afterEach(() => {
  act(() => root?.unmount())
  host?.remove()
  root = null
  host = null
})

const NUMBER = { kind: 'number', decimals: 2, grouping: true } as const

async function mount(inField = false): Promise<void> {
  host = document.createElement('div')
  host.style.inlineSize = '640px'
  document.body.append(host)
  root = createRoot(host)
  const input = <XhFormatInputRoot defaultValue={NUMBER} aria-label={inField ? undefined : '金额格式'} />
  await act(async () => {
    root!.render(inField
      ? (
          <XhFieldRoot>
            <XhFieldLabel>金额格式</XhFieldLabel>
            {input}
          </XhFieldRoot>
        )
      : input)
  })
  await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
}

function option(value: string): HTMLElement {
  return document.querySelector<HTMLElement>(`[data-scope="format-input"][data-part="item"][data-value="${value}"]`)!
}

function inner(row: HTMLElement, scope: string, part: string): HTMLElement {
  return row.querySelector<HTMLElement>(`[data-scope="${scope}"][data-part="${part}"]`)!
}

describe('格式输入的排布', () => {
  it('参数行分两栏、各格底边对齐：开关那一行与同一行的下拉等高，里面的控件铺满所在的那一格', async () => {
    await mount()
    const grouping = option('grouping').getBoundingClientRect()
    const rounding = option('rounding')
    const control = inner(rounding, 'select', 'control').getBoundingClientRect()
    expect(Math.abs(grouping.bottom - control.bottom)).toBeLessThan(0.5)
    expect(grouping.height).toBeCloseTo(control.height, 0)
    expect(grouping.top).toBeLessThan(control.top + 0.5)
    expect(inner(rounding, 'select', 'root').getBoundingClientRect().width).toBeCloseTo(rounding.getBoundingClientRect().width, 0)
    expect(option('decimals-mode').getBoundingClientRect().top).toBeCloseTo(option('decimals').getBoundingClientRect().top, 0)
  })

  it('分段切换那一行是没有 UA 边框与内边距的 fieldset，名字在 legend 里', async () => {
    await mount()
    const row = option('decimals-mode')
    expect(row.tagName).toBe('FIELDSET')
    const style = getComputedStyle(row)
    expect(style.borderTopWidth).toBe('0px')
    expect(style.paddingTop).toBe('0px')
    expect(style.marginTop).toBe('0px')
    expect(row.firstElementChild?.tagName).toBe('LEGEND')
  })
})

describe('格式输入的命中区', () => {
  it('点开关那一行的名字切换开关', async () => {
    await mount()
    const name = option('grouping').querySelector<HTMLElement>('[data-scope="format-input"][data-part="item-label"]')!
    const toggle = inner(option('grouping'), 'switch', 'root')
    expect(toggle.getAttribute('aria-checked')).toBe('true')
    await act(async () => {
      await userEvent.click(name)
    })
    expect(toggle.getAttribute('aria-checked')).toBe('false')
  })

  it('放进字段时组以字段标题为名、里面的控件不带它，点标签把焦点送到种类下拉的触发钮，只聚焦不展开', async () => {
    await mount(true)
    const label = document.querySelector<HTMLElement>('[data-scope="field"][data-part="label"]')!
    const group = document.querySelector<HTMLElement>('[data-scope="format-input"][data-part="root"]')!
    expect(group.getAttribute('aria-labelledby')?.split(' ')).toContain(label.id)
    await act(async () => {
      await userEvent.click(label)
    })
    const trigger = document.querySelector<HTMLElement>('[data-scope="format-input"][data-part="kind"] [data-scope="select"][data-part="trigger"]')!
    expect(document.activeElement).toBe(trigger)
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
    // 里面的控件归格式输入管：它们自己的标题是名字，不带字段的标题
    const decimals = document.querySelector<HTMLElement>('[data-scope="number-field"][data-part="input"]')!
    expect(decimals.getAttribute('aria-labelledby')?.split(' ') ?? []).not.toContain(label.id)
  })
})
