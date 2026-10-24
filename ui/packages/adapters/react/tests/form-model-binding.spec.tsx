// 字段组里没给值的录入控件按字段名读写表单的值：不写 value / onValueChange、不写 render prop 也能用。
import type { FormValues } from '@xihan-ui/headless'
import type { ReactNode } from 'react'
import { act, cleanup, fireEvent, render } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { XhFormFieldGroup, XhFormResetTrigger, XhFormRoot, XhSwitch, XhTextFieldRoot } from '../src'

afterEach(() => cleanup())

/** 挂一张表单：返回的数组记下每次值表变化。 */
function mountForm(defaultValues: FormValues, children: ReactNode): FormValues[] {
  const changes: FormValues[] = []
  render(
    <XhFormRoot defaultValues={defaultValues} onValuesChange={({ values }) => changes.push(values)}>
      {children}
      <XhFormResetTrigger>重置</XhFormResetTrigger>
    </XhFormRoot>,
  )
  return changes
}

const textInput = (): HTMLInputElement => document.querySelector<HTMLInputElement>('[data-scope="text-field"][data-part="input"]')!

describe('字段组按字段名绑定控件的值', () => {
  it('文本框：初值取表单 defaultValues，输入写回表单', () => {
    const changes = mountForm({ title: '旧标题' }, <XhFormFieldGroup name="title"><XhTextFieldRoot /></XhFormFieldGroup>)
    expect(textInput().value).toBe('旧标题')

    act(() => {
      fireEvent.input(textInput(), { target: { value: '新标题' } })
    })
    expect(changes.at(-1)).toEqual({ title: '新标题' })
    expect(textInput().value).toBe('新标题')
  })

  it('开关走 checked 通道；表单重置后控件跟着回到初值', () => {
    const changes = mountForm({ notify: true }, <XhFormFieldGroup name="notify"><XhSwitch /></XhFormFieldGroup>)
    const control = (): HTMLElement => document.querySelector<HTMLElement>('[data-scope="switch"][role="switch"]')!
    expect(control().getAttribute('aria-checked')).toBe('true')

    act(() => control().click())
    expect(changes.at(-1)).toEqual({ notify: false })
    expect(control().getAttribute('aria-checked')).toBe('false')

    act(() => document.querySelector<HTMLElement>('[data-scope="form"][data-part="reset-trigger"]')!.click())
    expect(control().getAttribute('aria-checked')).toBe('true')
  })

  it('实例自己给了 value 时不读也不写表单，手动接法照旧', () => {
    const changes = mountForm({ title: '表单里的' }, <XhFormFieldGroup name="title"><XhTextFieldRoot value="实例的" /></XhFormFieldGroup>)
    expect(textInput().value).toBe('实例的')
    act(() => {
      fireEvent.input(textInput(), { target: { value: '改一下' } })
    })
    expect(changes).toEqual([])
  })

  it('不在字段组里的控件不接表单的值', () => {
    const changes = mountForm({ title: '表单里的' }, <XhTextFieldRoot />)
    expect(textInput().value).toBe('')
    act(() => {
      fireEvent.input(textInput(), { target: { value: '随便写' } })
    })
    expect(changes).toEqual([])
  })
})
