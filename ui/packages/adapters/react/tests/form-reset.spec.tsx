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
  XhEditableEditTrigger,
  XhEditableInput,
  XhEditablePreview,
  XhEditableRoot,
  XhEditableSubmitTrigger,
  XhFieldArrayAddTrigger,
  XhFieldArrayItem,
  XhFieldArrayRoot,
  XhNumberFieldInput,
  XhNumberFieldRoot,
  XhPasswordInputInput,
  XhPasswordInputRoot,
  XhPinInputHiddenInput,
  XhPinInputInput,
  XhPinInputRoot,
  XhRadioGroupItem,
  XhRadioGroupRoot,
  XhRatingControl,
  XhRatingHiddenInput,
  XhRatingItem,
  XhRatingRoot,
  XhSegmentedItem,
  XhSegmentedRoot,
  XhSwitch,
  XhTagsInputHiddenInput,
  XhTagsInputInput,
  XhTagsInputRoot,
  XhTextFieldInput,
  XhTextFieldRoot,
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

  it('评分：重置回到 defaultValue，表单影子随之还原', () => {
    const shadow = (): HTMLInputElement =>
      host!.querySelector<HTMLInputElement>('[data-scope="rating"][data-part="hidden-input"]')!
    const form = mount(
      <XhRatingRoot name="score" defaultValue={2}>
        <XhRatingControl>
          <XhRatingItem value={1} />
          <XhRatingItem value={2} />
          <XhRatingItem value={3} />
        </XhRatingControl>
        <XhRatingHiddenInput />
      </XhRatingRoot>,
    )
    act(() => items('rating')[2]!.click())
    expect(items('rating').map(el => el.getAttribute('aria-checked'))).toEqual(['false', 'false', 'true'])
    expect(shadow().value).toBe('3')
    act(() => form.reset())
    expect(items('rating').map(el => el.getAttribute('aria-checked'))).toEqual(['false', 'true', 'false'])
    expect(shadow().value).toBe('2')
  })
})

/**
 * 文本输入族：值全攥在机器里，原生 reset 只还原原生控件。
 * 锚点是根部件自己渲的那个 div，单独核它接住了没有——门禁对 React 只做静态串匹配，
 * 核不到 ref 究竟落在哪个节点上。
 */
describe('文本输入族的原生表单重置', () => {
  const part = (scope: string, name: string): HTMLInputElement =>
    host!.querySelector<HTMLInputElement>(`[data-scope="${scope}"][data-part="${name}"]`)!

  /** 真实输入：写进框里再派 input，与用户敲字走同一条路。 */
  const typeInto = (el: HTMLInputElement, text: string): void => {
    act(() => {
      el.value = text
      el.dispatchEvent(new Event('input', { bubbles: true }))
    })
  }

  const press = (el: HTMLElement, key: string): void => {
    act(() => {
      el.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }))
    })
  }

  it('文本框：重置回到 defaultValue', () => {
    const form = mount(
      <XhTextFieldRoot name="nickname" defaultValue="阿旺">
        <XhTextFieldInput />
      </XhTextFieldRoot>,
    )
    typeInto(part('text-field', 'input'), '小黑')
    expect(part('text-field', 'input').value).toBe('小黑')
    act(() => form.reset())
    expect(part('text-field', 'input').value).toBe('阿旺')
  })

  it('数字框：重置回到 defaultValue', () => {
    const form = mount(
      <XhNumberFieldRoot name="count" defaultValue="3">
        <XhNumberFieldInput />
      </XhNumberFieldRoot>,
    )
    typeInto(part('number-field', 'input'), '9')
    expect(part('number-field', 'input').value).toBe('9')
    act(() => form.reset())
    expect(part('number-field', 'input').value).toBe('3')
  })

  it('密码框：重置回到 defaultValue', () => {
    const form = mount(
      <XhPasswordInputRoot name="password" defaultValue="a1">
        <XhPasswordInputInput />
      </XhPasswordInputRoot>,
    )
    typeInto(part('password-input', 'input'), 'b2c3')
    expect(part('password-input', 'input').value).toBe('b2c3')
    act(() => form.reset())
    expect(part('password-input', 'input').value).toBe('a1')
  })

  it('分格验证码：重置回到 defaultValue，隐藏输入随之还原', () => {
    const form = mount(
      <XhPinInputRoot name="code" length={3} defaultValue={['1']}>
        <XhPinInputInput index={0} />
        <XhPinInputInput index={1} />
        <XhPinInputInput index={2} />
        <XhPinInputHiddenInput />
      </XhPinInputRoot>,
    )
    typeInto(part('pin-input', 'input'), '9')
    expect(part('pin-input', 'hidden-input').value).toBe('9')
    act(() => form.reset())
    expect(part('pin-input', 'hidden-input').value).toBe('1')
  })

  it('就地编辑：重置回到 defaultValue，预览区跟着还原', () => {
    const preview = (): HTMLElement => host!.querySelector<HTMLElement>('[data-scope="editable"][data-part="preview"]')!
    const form = mount(
      <XhEditableRoot name="nickname" defaultValue="阿旺">
        <XhEditablePreview />
        <XhEditableInput />
        <XhEditableEditTrigger>编辑</XhEditableEditTrigger>
        <XhEditableSubmitTrigger>保存</XhEditableSubmitTrigger>
      </XhEditableRoot>,
    )
    act(() => host!.querySelector<HTMLButtonElement>('[data-scope="editable"][data-part="edit-trigger"]')!.click())
    typeInto(part('editable', 'input'), '小黑')
    act(() => host!.querySelector<HTMLButtonElement>('[data-scope="editable"][data-part="submit-trigger"]')!.click())
    expect(preview().textContent).toBe('小黑')
    act(() => form.reset())
    expect(preview().textContent).toBe('阿旺')
  })

  it('标签输入：重置回到 defaultValue，隐藏输入随之还原', () => {
    const form = mount(
      <XhTagsInputRoot name="stack" defaultValue={['vue']}>
        <XhTagsInputInput />
        <XhTagsInputHiddenInput />
      </XhTagsInputRoot>,
    )
    typeInto(part('tags-input', 'input'), 'react')
    press(part('tags-input', 'input'), 'Enter')
    expect(part('tags-input', 'hidden-input').value).toBe('vue,react')
    act(() => form.reset())
    expect(part('tags-input', 'hidden-input').value).toBe('vue')
  })
})
