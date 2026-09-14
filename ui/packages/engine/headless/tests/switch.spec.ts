import type { SwitchCheckedChangeDetails, SwitchSchema } from '../src/switch'
import { createService, normalizeProps } from '@xihan-ui/core'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'
import { describe, expect, it } from 'vitest'
import { connectSwitch, switchMachine } from '../src/switch'

type Props = SwitchSchema['props']

function makeSwitch(initial: Props = {}) {
  const changes: SwitchCheckedChangeDetails[] = []
  const runtime = createVanillaRuntime()
  const props = runtime.signal<Props>({ ...initial, onCheckedChange: d => changes.push(d) })
  const service = createService(switchMachine, { props: () => props.get(), runtime })
  runtime.start()
  return {
    service,
    changes,
    state: () => service.state.get(),
    api: () => connectSwitch(service, normalizeProps),
    root: () => connectSwitch(service, normalizeProps).getRootProps() as Record<string, unknown>,
    click: () => (connectSwitch(service, normalizeProps).getRootProps() as { onClick: () => void }).onClick(),
    setProps: (next: Props) => props.set({ ...props.get(), ...next }),
    stop: () => runtime.stop(),
  }
}

describe('switchMachine 起步', () => {
  it('缺省 off；defaultChecked 起步 on；checked 压过 defaultChecked', () => {
    expect(makeSwitch().state()).toBe('off')
    expect(makeSwitch({ defaultChecked: true }).state()).toBe('on')
    expect(makeSwitch({ checked: false, defaultChecked: true }).state()).toBe('off')
  })
})

describe('connectSwitch 投影', () => {
  it('根是 type=button 的 role=switch，三条 aria-* 显式写，状态落 data-state；拇指与文字跟着状态走', () => {
    const s = makeSwitch({ defaultChecked: true, tone: 'success', size: 'sm' })
    expect(s.root()).toMatchObject({
      'type': 'button',
      'role': 'switch',
      'aria-checked': 'true',
      'aria-readonly': 'false',
      'aria-invalid': 'false',
      'aria-required': 'false',
      'data-state': 'checked',
      'data-tone': 'success',
      'data-size': 'sm',
    })
    expect(s.root()['aria-busy']).toBeUndefined()
    expect(s.root().disabled).toBeUndefined()
    expect(s.api().getThumbProps()).toMatchObject({ 'data-state': 'checked' })
    expect(s.api().getTextProps()).toMatchObject({ 'data-state': 'checked' })
    expect(s.api().getLabelProps()).toMatchObject({ 'data-state': 'checked', 'data-size': 'sm' })
    s.stop()
  })

  it('禁用走原生 disabled；只读、无效、必填只走 aria-*，焦点留着；加载中报 aria-busy 不算禁用', () => {
    const d = makeSwitch({ disabled: true })
    expect(d.root()).toMatchObject({ 'disabled': true, 'data-disabled': '' })
    d.stop()

    const r = makeSwitch({ readOnly: true, invalid: true, required: true, loading: true })
    expect(r.root()).toMatchObject({ 'aria-readonly': 'true', 'aria-invalid': 'true', 'aria-required': 'true', 'aria-busy': 'true', 'data-readonly': '', 'data-invalid': '', 'data-required': '', 'data-loading': '' })
    expect(r.root().disabled).toBeUndefined()
    expect(r.api().loading).toBe(true)
    expect(r.api().getThumbProps()).toMatchObject({ 'data-loading': '' })
    r.stop()
  })

  it('隐藏输入：勾上才带 name，值缺省 on，禁用时不提交', () => {
    const off = makeSwitch({ name: 'notify' })
    expect(off.api().getHiddenInputProps()).toMatchObject({ type: 'hidden', value: 'on' })
    expect((off.api().getHiddenInputProps() as Record<string, unknown>).name).toBeUndefined()
    off.stop()

    const on = makeSwitch({ name: 'notify', value: 'yes', defaultChecked: true })
    expect(on.api().getHiddenInputProps()).toMatchObject({ name: 'notify', value: 'yes' })
    on.stop()

    const disabled = makeSwitch({ name: 'notify', defaultChecked: true, disabled: true })
    expect((disabled.api().getHiddenInputProps() as Record<string, unknown>).disabled).toBe(true)
    disabled.stop()
  })
})

describe('switchMachine 切换', () => {
  it('点一下来回切并逐次通知；禁用、加载中、只读时点不动', () => {
    const s = makeSwitch()
    s.click()
    expect(s.state()).toBe('on')
    s.click()
    expect(s.state()).toBe('off')
    expect(s.changes).toEqual([{ checked: true }, { checked: false }])
    s.stop()

    for (const props of [{ disabled: true }, { loading: true }, { readOnly: true }] as Props[]) {
      const locked = makeSwitch(props)
      locked.click()
      expect(locked.state()).toBe('off')
      expect(locked.changes).toEqual([])
      locked.stop()
    }
  })

  it('setChecked 只在目标态不同时才切；同值调用不通知', () => {
    const s = makeSwitch()
    s.api().setChecked(false)
    expect(s.changes).toEqual([])
    s.api().setChecked(true)
    expect(s.state()).toBe('on')
    expect(s.changes).toEqual([{ checked: true }])
    s.stop()
  })

  it('受控 checked：点击只发意图不自改，宿主写回后才切，回写不再通知', () => {
    const s = makeSwitch({ checked: false })
    s.click()
    expect(s.state()).toBe('off')
    expect(s.changes).toEqual([{ checked: true }])
    s.setProps({ checked: true })
    expect(s.state()).toBe('on')
    expect(s.changes).toEqual([{ checked: true }])
    s.stop()
  })
})

describe('switchMachine 表单重置', () => {
  it('非受控：回到 defaultChecked 并通知；已在目标态就不通知', () => {
    const s = makeSwitch({ defaultChecked: true })
    s.click()
    expect(s.state()).toBe('off')
    s.service.send({ type: 'FORM.RESET' })
    expect(s.state()).toBe('on')
    expect(s.changes).toEqual([{ checked: false }, { checked: true }])
    s.service.send({ type: 'FORM.RESET' })
    expect(s.changes).toHaveLength(2)
    s.stop()
  })

  it('受控：没给默认值不通知；给了默认值只发重置意图、状态不自改', () => {
    const bare = makeSwitch({ checked: true })
    bare.service.send({ type: 'FORM.RESET' })
    expect(bare.changes).toEqual([])
    expect(bare.state()).toBe('on')
    bare.stop()

    const withDefault = makeSwitch({ checked: true, defaultChecked: false })
    withDefault.service.send({ type: 'FORM.RESET' })
    expect(withDefault.changes).toEqual([{ checked: false }])
    expect(withDefault.state()).toBe('on')
    withDefault.stop()
  })
})
