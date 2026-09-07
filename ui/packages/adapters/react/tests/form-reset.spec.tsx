// @vitest-environment jsdom
//
// 值攥在机器里，原生 reset 只还原原生控件——不接这条线，点重置什么都不会发生。
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, describe, expect, it } from 'vitest'
import {
  XhCheckbox,
  XhCheckboxGroupItem,
  XhCheckboxGroupRoot,
  XhFieldArrayAddTrigger,
  XhFieldArrayItem,
  XhFieldArrayRoot,
  XhRadioGroupItem,
  XhRadioGroupRoot,
  XhSegmentedItem,
  XhSegmentedRoot,
  XhSwitch,
  XhToggleGroupItem,
  XhToggleGroupRoot,
} from '../src'

let host: HTMLElement | null = null
let root: ReturnType<typeof createRoot> | null = null

afterEach(() => {
  act(() => root?.unmount())
  host?.remove()
  host = null
  root = null
})

function mount(node: React.ReactNode): HTMLFormElement {
  ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
  host = document.createElement('div')
  document.body.append(host)
  root = createRoot(host)
  act(() => root!.render(<form>{node}</form>))
  return host.querySelector('form')!
}

const track = (): HTMLButtonElement => host!.querySelector<HTMLButtonElement>('[data-scope="switch"][data-part="root"]')!

describe('原生表单重置', () => {
  it('非受控：重置回到 defaultChecked', () => {
    const form = mount(<XhSwitch name="notify" defaultChecked={false} />)
    act(() => track().click())
    expect(track().getAttribute('aria-checked')).toBe('true')
    act(() => form.reset())
    expect(track().getAttribute('aria-checked')).toBe('false')
  })

  it('宿主没写 defaultChecked 时不把它抹成兜底空值以外的东西', () => {
    const form = mount(<XhSwitch name="notify" defaultChecked />)
    act(() => track().click())
    expect(track().getAttribute('aria-checked')).toBe('false')
    act(() => form.reset())
    expect(track().getAttribute('aria-checked')).toBe('true')
  })

  it('复选框：重置回到 defaultChecked，锚点在带文字时的 <label> 上也接得住', () => {
    const box = (): HTMLButtonElement => host!.querySelector<HTMLButtonElement>('[data-scope="checkbox"][data-part="root"]')!
    const form = mount(<XhCheckbox name="agree" defaultChecked={false}>同意条款</XhCheckbox>)
    act(() => box().click())
    expect(box().getAttribute('aria-checked')).toBe('true')
    act(() => form.reset())
    expect(box().getAttribute('aria-checked')).toBe('false')
  })

  it('复选框：半选也由重置还原', () => {
    const box = (): HTMLButtonElement => host!.querySelector<HTMLButtonElement>('[data-scope="checkbox"][data-part="root"]')!
    const form = mount(<XhCheckbox name="agree" defaultChecked="indeterminate" />)
    act(() => box().click())
    expect(box().getAttribute('aria-checked')).toBe('true')
    act(() => form.reset())
    expect(box().getAttribute('aria-checked')).toBe('mixed')
  })
})

/** 组与容器的锚点不在单件那种壳上，而是根部件自己渲的那个节点，单独核一遍它接住了没有。 */
describe('组与容器的原生表单重置', () => {
  const items = (scope: string): HTMLElement[] =>
    [...host!.querySelectorAll<HTMLElement>(`[data-scope="${scope}"][data-part="item"]`)]

  it('复选框组：重置回到 defaultValue', () => {
    const form = mount(
      <XhCheckboxGroupRoot name="topping" defaultValue={['a']}>
        <XhCheckboxGroupItem value="a" />
        <XhCheckboxGroupItem value="b" />
      </XhCheckboxGroupRoot>,
    )
    act(() => items('checkbox-group')[1]!.click())
    expect(items('checkbox-group').map(el => el.getAttribute('aria-checked'))).toEqual(['true', 'true'])
    act(() => form.reset())
    expect(items('checkbox-group').map(el => el.getAttribute('aria-checked'))).toEqual(['true', 'false'])
  })

  it('单选组：重置回到 defaultValue', () => {
    const form = mount(
      <XhRadioGroupRoot name="size" defaultValue="a">
        <XhRadioGroupItem value="a" />
        <XhRadioGroupItem value="b" />
      </XhRadioGroupRoot>,
    )
    act(() => items('radio-group')[1]!.click())
    expect(items('radio-group').map(el => el.getAttribute('aria-checked'))).toEqual(['false', 'true'])
    act(() => form.reset())
    expect(items('radio-group').map(el => el.getAttribute('aria-checked'))).toEqual(['true', 'false'])
  })

  it('开关组：重置回到 defaultValue', () => {
    const form = mount(
      <XhToggleGroupRoot name="align" defaultValue="a">
        <XhToggleGroupItem value="a">左</XhToggleGroupItem>
        <XhToggleGroupItem value="b">右</XhToggleGroupItem>
      </XhToggleGroupRoot>,
    )
    act(() => items('toggle-group')[1]!.click())
    expect(items('toggle-group').map(el => el.getAttribute('aria-checked'))).toEqual(['false', 'true'])
    act(() => form.reset())
    expect(items('toggle-group').map(el => el.getAttribute('aria-checked'))).toEqual(['true', 'false'])
  })

  it('分段控件：重置回到 defaultValue', () => {
    const form = mount(
      <XhSegmentedRoot name="range" defaultValue="day">
        <XhSegmentedItem value="day">日</XhSegmentedItem>
        <XhSegmentedItem value="month">月</XhSegmentedItem>
      </XhSegmentedRoot>,
    )
    act(() => items('segmented')[1]!.click())
    expect(items('segmented').map(el => el.getAttribute('aria-checked'))).toEqual(['false', 'true'])
    act(() => form.reset())
    expect(items('segmented').map(el => el.getAttribute('aria-checked'))).toEqual(['true', 'false'])
  })

  it('动态录入：重置回到 defaultValue 的行数', () => {
    const rows = (): number => items('field-array').length
    const form = mount(
      <XhFieldArrayRoot name="tags" defaultValue={['甲']}>
        {({ items: rowList }) => (
          <>
            {rowList.map(row => <XhFieldArrayItem key={row.key} index={row.index} />)}
            <XhFieldArrayAddTrigger>加一行</XhFieldArrayAddTrigger>
          </>
        )}
      </XhFieldArrayRoot>,
    )
    act(() => host!.querySelector<HTMLButtonElement>('[data-scope="field-array"][data-part="add-trigger"]')!.click())
    expect(rows()).toBe(2)
    act(() => form.reset())
    expect(rows()).toBe(1)
  })
})
