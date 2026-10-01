// @vitest-environment jsdom
// 组类控件直接放进表单字段（不经 XhFieldControl）也接上字段的标题与说明。
//
// 单一控件的封装早已在真控件上并入字段接线；组类控件的焦点宿主是组根（或拇指、格子），
// 字段的标题与说明要落在那里，读屏进组时才念得出组名与说明。
import type { App, VNode } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
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

let app: App | null = null
let host: HTMLElement | null = null

afterEach(() => {
  app?.unmount()
  host?.remove()
  app = null
  host = null
})

async function mountInField(control: () => VNode, invalid = false): Promise<HTMLElement> {
  host = document.createElement('div')
  document.body.append(host)
  app = createApp({
    setup: () => () => h(XhFieldRoot, { invalid }, () => [
      h(XhFieldLabel, null, () => '提醒频率'),
      control(),
      h(XhFieldDescription, null, () => '到期前按这个频率提醒'),
      h(XhFieldErrorText, null, () => '请选择一项'),
    ]),
  })
  app.mount(host)
  await nextTick()
  await nextTick()
  return host
}

function part(scope: string, name: string): HTMLElement {
  const el = host!.querySelector<HTMLElement>(`[data-scope="${scope}"][data-part="${name}"]`)
  if (!el)
    throw new Error(`缺少 ${scope}/${name}`)
  return el
}

/** 断言焦点宿主念得出字段的标题，描述链里有说明（无效时还有错误文案）。 */
function expectWired(target: HTMLElement, invalid: boolean): void {
  const labelId = part('field', 'label').id
  const labelledBy = (target.getAttribute('aria-labelledby') ?? '').split(/\s+/)
  expect(labelledBy[0]).toBe(labelId)
  const describedBy = (target.getAttribute('aria-describedby') ?? '').split(/\s+/)
  expect(describedBy).toContain(part('field', 'description').id)
  if (invalid)
    expect(describedBy).toContain(part('field', 'error-text').id)
}

describe('组类控件直接放进字段', () => {
  it('radio-group：组根念字段标题，描述链挂说明与错误文案', async () => {
    await mountInField(() => h(XhRadioGroupRoot, null, () => [
      h(XhRadioGroupItem, { value: 'daily' }, () => [h(XhRadioGroupItemText, null, () => '每天')]),
    ]), true)
    expectWired(part('radio-group', 'root'), true)
  })

  it('radio-group：自己也有标题时两段都念，字段的排在前面', async () => {
    await mountInField(() => h(XhRadioGroupRoot, { label: '频率' }, () => [
      h(XhRadioGroupItem, { value: 'daily' }, () => [h(XhRadioGroupItemText, null, () => '每天')]),
    ]))
    const chain = part('radio-group', 'root').getAttribute('aria-labelledby')
    expect(chain).toBe(`${part('field', 'label').id} ${part('radio-group', 'label').id}`)
  })

  it('checkbox-group：组根念字段标题，手写选项也铺出 label 属性给的标题', async () => {
    await mountInField(() => h(XhCheckboxGroupRoot, { label: '通知方式' }, () => [
      h(XhCheckboxGroupItem, { value: 'mail' }, () => [h(XhCheckboxGroupItemText, null, () => '邮件')]),
    ]), true)
    const root = part('checkbox-group', 'root')
    expectWired(root, true)
    expect(part('checkbox-group', 'label').textContent).toBe('通知方式')
    expect(root.getAttribute('aria-labelledby')).toBe(`${part('field', 'label').id} ${part('checkbox-group', 'label').id}`)
    // role=group 不接受校验与必填：字段的这几位不往组根上落
    expect(root.hasAttribute('aria-invalid')).toBe(false)
  })

  it('color-swatch-picker：组根念字段标题，描述链挂说明', async () => {
    await mountInField(() => h(XhColorSwatchPickerRoot, { swatches: [{ value: '#ff0000' }, { value: '#00ff00' }] }))
    expectWired(part('color-swatch-picker', 'root'), false)
  })

  it('toggle-group：组根念字段标题，描述链挂说明', async () => {
    await mountInField(() => h(XhToggleGroupRoot, { collection: [{ value: 'bold', label: '加粗' }] }))
    expectWired(part('toggle-group', 'root'), false)
  })

  it('rating：星组念字段标题，描述链挂说明', async () => {
    await mountInField(() => h(XhRatingRoot, { count: 3 }, () => [
      h(XhRatingControl, null, () => [1, 2, 3].map(value => h(XhRatingItem, { key: value, value }))),
    ]))
    expectWired(part('rating', 'control'), false)
  })

  it('slider：焦点所在的拇指念字段标题，描述链挂说明', async () => {
    await mountInField(() => h(XhSliderRoot, { defaultValue: [20] }, () => [
      h(XhSliderControl, null, () => [h(XhSliderThumb, { index: 0 })]),
    ]))
    expectWired(part('slider', 'thumb'), false)
  })

  it('pin-input：整组念字段标题，描述链挂说明', async () => {
    await mountInField(() => h(XhPinInputRoot, { length: 2 }, () => [0, 1].map(index => h(XhPinInputInput, { key: index, index }))))
    expectWired(part('pin-input', 'root'), false)
  })
})
