// @vitest-environment jsdom
// 字段只把在场的部件接进控件的名字链与描述链：没写的、没有文字的说明不留 id，引用的每个 id 都查得回节点。
import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import {
  XhFieldControl,
  XhFieldDescription,
  XhFieldErrorText,
  XhFieldLabel,
  XhFieldRoot,
  XhSelectRoot,
  XhSelectTrigger,
  XhSelectValueText,
} from '../src'

function refs(el: Element, attr: string): string[] {
  return (el.getAttribute(attr) ?? '').split(/\s+/).filter(Boolean)
}

const SELECT = (
  <XhFieldControl>
    <XhSelectRoot><XhSelectTrigger><XhSelectValueText /></XhSelectTrigger></XhSelectRoot>
  </XhFieldControl>
)

describe('字段只引用在场的部件', () => {
  it('没写说明时触发钮的描述链不带说明的 id；invalid 时只剩错误文案', () => {
    const { container } = render(
      <XhFieldRoot invalid>
        <XhFieldLabel>部门</XhFieldLabel>
        {SELECT}
        <XhFieldErrorText>必填</XhFieldErrorText>
      </XhFieldRoot>,
    )
    const trigger = container.querySelector('button')!
    const errorId = container.querySelector('[data-scope="field"][data-part="error-text"]')!.id
    expect(refs(trigger, 'aria-describedby')).toEqual([errorId])
    for (const id of [...refs(trigger, 'aria-describedby'), refs(trigger, 'aria-labelledby')[0]!])
      expect(document.getElementById(id), id).not.toBeNull()
  })

  it('说明没有文字时按没写处理，补上文字后进描述链', () => {
    const view = (hint: string) => (
      <XhFieldRoot>
        <XhFieldLabel>部门</XhFieldLabel>
        {SELECT}
        <XhFieldDescription>{hint}</XhFieldDescription>
      </XhFieldRoot>
    )
    const { container, rerender } = render(view(''))
    const trigger = container.querySelector('button')!
    expect(trigger.hasAttribute('aria-describedby')).toBe(false)
    rerender(view('选所属部门'))
    const descriptionId = container.querySelector('[data-scope="field"][data-part="description"]')!.id
    expect(refs(trigger, 'aria-describedby')).toEqual([descriptionId])
  })

  it('说明里只有对读屏隐藏的内容时按没写处理，换成带 alt 的图片后进描述链', () => {
    const view = (hidden: boolean) => (
      <XhFieldRoot>
        <XhFieldLabel>部门</XhFieldLabel>
        {SELECT}
        <XhFieldDescription>{hidden ? <span aria-hidden="true">选所属部门</span> : <img alt="选所属部门" />}</XhFieldDescription>
      </XhFieldRoot>
    )
    const { container, rerender } = render(view(true))
    const trigger = container.querySelector('button')!
    expect(trigger.hasAttribute('aria-describedby')).toBe(false)
    rerender(view(false))
    const descriptionId = container.querySelector('[data-scope="field"][data-part="description"]')!.id
    expect(refs(trigger, 'aria-describedby')).toEqual([descriptionId])
  })

  it('没写字段标签时名字链里没有字段标签的 id', () => {
    const { container } = render(
      <XhFieldRoot>
        {SELECT}
        <XhFieldDescription>选所属部门</XhFieldDescription>
      </XhFieldRoot>,
    )
    expect(refs(container.querySelector('button')!, 'aria-labelledby').filter(id => id.startsWith('field:'))).toEqual([])
  })
})
