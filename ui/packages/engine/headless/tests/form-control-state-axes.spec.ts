// @vitest-environment jsdom
// 三个单体表单控件的 readOnly / invalid / required 轴：
// 只读要挡住交互但不动焦点与提交，禁用才用原生 disabled。
import type { CheckboxSchema } from '../src/checkbox'
import type { RadioGroupSchema } from '../src/radio-group'
import type { SwitchSchema } from '../src/switch'
import { normalizeProps } from '@xihan-ui/kernel'
import { createService } from '@xihan-ui/machine'
import { createVanillaRuntime } from '@xihan-ui/machine/vanilla'
import { describe, expect, it, vi } from 'vitest'
import { checkboxMachine, connectCheckbox } from '../src/checkbox'
import { connectRadioGroup, radioGroupMachine } from '../src/radio-group'
import { connectSwitch, switchMachine } from '../src/switch'

function checkboxApi(props: Partial<CheckboxSchema['props']>) {
  const runtime = createVanillaRuntime()
  const service = createService(checkboxMachine, { props: () => props, runtime })
  runtime.start()
  return () => connectCheckbox(service, normalizeProps)
}

function switchApi(props: Partial<SwitchSchema['props']>) {
  const runtime = createVanillaRuntime()
  const service = createService(switchMachine, { props: () => props, runtime })
  runtime.start()
  return () => connectSwitch(service, normalizeProps)
}

function radioApi(props: Partial<RadioGroupSchema['props']>) {
  const runtime = createVanillaRuntime()
  const service = createService(radioGroupMachine, { props: () => props, runtime })
  runtime.start()
  return () => connectRadioGroup(service, normalizeProps)
}

describe('checkbox 的只读 / 校验 / 必填轴', () => {
  it('只读时点击不改 checked，但不转原生 disabled、仍参与提交', () => {
    const onCheckedChange = vi.fn()
    const get = checkboxApi({ readOnly: true, name: 'agree', onCheckedChange })
    const root = get().getRootProps() as Record<string, unknown>

    expect(root['aria-readonly']).toBe('true')
    // 只读不能借原生 disabled 表达：那会连焦点一起拿掉
    expect(root.disabled).toBeUndefined()
    ;(root.onClick as () => void)()
    expect(onCheckedChange).not.toHaveBeenCalled()
    expect(get().checked).toBe(false)
    // 仍带 name 的前提是勾上；这里验的是只读没有把表单出口摘掉
    expect((get().getHiddenInputProps() as Record<string, unknown>).disabled).toBeUndefined()
  })

  it('禁用仍走原生 disabled', () => {
    const get = checkboxApi({ disabled: true })
    expect((get().getRootProps() as Record<string, unknown>).disabled).toBe(true)
  })

  it('非只读时点击照常翻转', () => {
    const onCheckedChange = vi.fn()
    const get = checkboxApi({ onCheckedChange })
    ;((get().getRootProps() as Record<string, unknown>).onClick as () => void)()
    expect(get().checked).toBe(true)
    expect(onCheckedChange).toHaveBeenCalledWith({ checked: true })
  })

  it('校验失败与必填同时落在 ARIA 与 data 两侧', () => {
    const get = checkboxApi({ invalid: true, required: true })
    const root = get().getRootProps() as Record<string, unknown>
    expect(root['aria-invalid']).toBe('true')
    expect(root['aria-required']).toBe('true')
    expect(root['data-invalid']).toBe('')
    expect(root['data-required']).toBe('')
  })

  it('三条轴都不给时，ARIA 显式报 false 而非缺席', () => {
    const root = checkboxApi({})().getRootProps() as Record<string, unknown>
    expect(root['aria-readonly']).toBe('false')
    expect(root['aria-invalid']).toBe('false')
    expect(root['aria-required']).toBe('false')
    expect(root['data-invalid']).toBeUndefined()
  })
})

describe('switch 的只读轴', () => {
  it('只读时点击不改 checked', () => {
    const onCheckedChange = vi.fn()
    const get = switchApi({ readOnly: true, onCheckedChange })
    const root = get().getRootProps() as Record<string, unknown>
    expect(root['aria-readonly']).toBe('true')
    expect(root.disabled).toBeUndefined()
    ;(root.onClick as () => void)()
    expect(onCheckedChange).not.toHaveBeenCalled()
    expect(get().checked).toBe(false)
  })

  it('只读与提交中互不干扰，各自独立标记', () => {
    const root = switchApi({ readOnly: true, loading: true })().getRootProps() as Record<string, unknown>
    expect(root['data-readonly']).toBe('')
    expect(root['data-loading']).toBe('')
  })
})

describe('radio-group 的只读轴', () => {
  const collection = [{ value: 'a' }, { value: 'b' }]

  it('只读时点条目不落值', () => {
    const onValueChange = vi.fn()
    const get = radioApi({ collection, readOnly: true, onValueChange })
    const item = get().getItemProps({ value: 'b' }) as Record<string, unknown>
    ;(item.onClick as () => void)()
    expect(onValueChange).not.toHaveBeenCalled()
    expect(get().value).toBeNull()
  })

  it('非只读时点条目照常落值', () => {
    const get = radioApi({ collection })
    ;((get().getItemProps({ value: 'b' }) as Record<string, unknown>).onClick as () => void)()
    expect(get().value).toBe('b')
  })

  it('role=radiogroup 自己接得住三条 ARIA，不必下放到条目', () => {
    const root = radioApi({ collection, readOnly: true, invalid: true, required: true })().getRootProps() as Record<string, unknown>
    expect(root.role).toBe('radiogroup')
    expect(root['aria-readonly']).toBe('true')
    expect(root['aria-invalid']).toBe('true')
    expect(root['aria-required']).toBe('true')
  })

  it('条目上不发 aria-readonly：role=radio 不接受它', () => {
    const item = radioApi({ collection, readOnly: true })().getItemProps({ value: 'a' }) as Record<string, unknown>
    expect(item['aria-readonly']).toBeUndefined()
    expect(item['data-readonly']).toBe('')
  })
})
