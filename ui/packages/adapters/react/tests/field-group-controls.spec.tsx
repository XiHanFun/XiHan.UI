// 组类控件直接放进表单字段（不经 XhFieldControl）也接上字段的标题与说明。
//
// 单一控件的封装早已在真控件上并入字段接线；组类控件的焦点宿主是组根（或拇指、格子），
// 字段的标题与说明要落在那里，读屏进组时才念得出组名与说明。
import type { ReactNode } from 'react'
import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import {
  XhCheckboxGroupItem,
  XhCheckboxGroupItemText,
  XhCheckboxGroupRoot,
  XhColorSwatchPickerRoot,
  XhFieldDescription,
  XhFieldErrorText,
  XhFieldLabel,
  XhFieldRoot,
  XhPinInputInput,
  XhPinInputRoot,
  XhRadioGroupItem,
  XhRadioGroupItemText,
  XhRadioGroupRoot,
  XhRatingControl,
  XhRatingItem,
  XhRatingRoot,
  XhSliderControl,
  XhSliderRoot,
  XhSliderThumb,
  XhToggleGroupRoot,
} from '../src'

function inField(control: ReactNode, invalid = false): HTMLElement {
  const { container } = render(
    <XhFieldRoot invalid={invalid}>
      <XhFieldLabel>提醒频率</XhFieldLabel>
      {control}
      <XhFieldDescription>到期前按这个频率提醒</XhFieldDescription>
      <XhFieldErrorText>请选择一项</XhFieldErrorText>
    </XhFieldRoot>,
  )
  return container
}

function part(container: HTMLElement, scope: string, name: string): HTMLElement {
  const el = container.querySelector<HTMLElement>(`[data-scope="${scope}"][data-part="${name}"]`)
  if (!el)
    throw new Error(`缺少 ${scope}/${name}`)
  return el
}

/** 焦点宿主念得出字段的标题，描述链里有说明（无效时还有错误文案）。 */
function expectWired(container: HTMLElement, target: HTMLElement, invalid: boolean): void {
  const labelledBy = (target.getAttribute('aria-labelledby') ?? '').split(/\s+/)
  expect(labelledBy[0]).toBe(part(container, 'field', 'label').id)
  const describedBy = (target.getAttribute('aria-describedby') ?? '').split(/\s+/)
  expect(describedBy).toContain(part(container, 'field', 'description').id)
  if (invalid)
    expect(describedBy).toContain(part(container, 'field', 'error-text').id)
}

describe('组类控件直接放进字段', () => {
  it('radio-group：组根念字段标题，自己的标题排在后面', () => {
    const c = inField(
      <XhRadioGroupRoot label="频率">
        <XhRadioGroupItem value="daily"><XhRadioGroupItemText>每天</XhRadioGroupItemText></XhRadioGroupItem>
      </XhRadioGroupRoot>,
      true,
    )
    const root = part(c, 'radio-group', 'root')
    expectWired(c, root, true)
    expect(root.getAttribute('aria-labelledby')).toBe(`${part(c, 'field', 'label').id} ${part(c, 'radio-group', 'label').id}`)
  })

  it('checkbox-group：手写选项也铺出 label 属性给的标题；role=group 不落校验位', () => {
    const c = inField(
      <XhCheckboxGroupRoot label="通知方式">
        <XhCheckboxGroupItem value="mail"><XhCheckboxGroupItemText>邮件</XhCheckboxGroupItemText></XhCheckboxGroupItem>
      </XhCheckboxGroupRoot>,
      true,
    )
    const root = part(c, 'checkbox-group', 'root')
    expectWired(c, root, true)
    expect(part(c, 'checkbox-group', 'label').textContent).toBe('通知方式')
    expect(root.hasAttribute('aria-invalid')).toBe(false)
  })

  it('color-swatch-picker / toggle-group / rating：组根或星组念字段标题', () => {
    const swatch = inField(<XhColorSwatchPickerRoot swatches={[{ value: '#ff0000' }]} />)
    expectWired(swatch, part(swatch, 'color-swatch-picker', 'root'), false)
    const toggle = inField(<XhToggleGroupRoot collection={[{ value: 'bold', label: '加粗' }]} />)
    expectWired(toggle, part(toggle, 'toggle-group', 'root'), false)
    const rating = inField(
      <XhRatingRoot count={2}>
        <XhRatingControl>
          <XhRatingItem value={1} />
          <XhRatingItem value={2} />
        </XhRatingControl>
      </XhRatingRoot>,
    )
    expectWired(rating, part(rating, 'rating', 'control'), false)
  })

  it('slider 的拇指与 pin-input 的整组念字段标题', () => {
    const slider = inField(
      <XhSliderRoot defaultValue={[20]}>
        <XhSliderControl><XhSliderThumb index={0} /></XhSliderControl>
      </XhSliderRoot>,
    )
    expectWired(slider, part(slider, 'slider', 'thumb'), false)
    const pin = inField(
      <XhPinInputRoot length={2}>
        <XhPinInputInput index={0} />
        <XhPinInputInput index={1} />
      </XhPinInputRoot>,
    )
    expectWired(pin, part(pin, 'pin-input', 'root'), false)
  })
})
