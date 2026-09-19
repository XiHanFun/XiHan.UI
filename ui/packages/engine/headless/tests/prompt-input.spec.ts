// @vitest-environment jsdom
import type { Service } from '@xihan-ui/core'
import type { PromptInputApi, PromptInputSchema } from '../src/prompt-input'
import { createService, normalizeProps } from '@xihan-ui/core'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'
import { describe, expect, it, vi } from 'vitest'
// 直接从组件目录导入，不经包主入口
import { connectPromptInput, promptInputMachine } from '../src/prompt-input'

type Props = PromptInputSchema['props']
type Dict = Record<string, unknown>

interface Rig {
  service: Service<PromptInputSchema>
  api: () => PromptInputApi
  input: () => Dict
  trigger: () => Dict
  value: () => string
}

/** 把 props 挂在 signal 上，使 watch 里的 track 能收到运行期改动。 */
function mount(initial: Props = {}): Rig {
  const runtime = createVanillaRuntime()
  const props = runtime.signal<Props>({ ...initial })
  const service = createService(promptInputMachine, { props: () => props.get(), runtime })
  runtime.start()

  const api = (): PromptInputApi => connectPromptInput(service, normalizeProps)
  return {
    service,
    api,
    input: () => api().getInputProps() as Dict,
    trigger: () => api().getSubmitTriggerProps() as Dict,
    value: () => service.context.get('value'),
  }
}

function fire(props: Dict, key: string, event: unknown = {}): void {
  (props[key] as (e: unknown) => void)(event)
}

/** 按键桩：修饰键与 defaultPrevented 可自由伪造，preventDefault 是 spy。 */
function keyEvent(
  key: string,
  extra: { shiftKey?: boolean, ctrlKey?: boolean, metaKey?: boolean, repeat?: boolean, defaultPrevented?: boolean } = {},
) {
  return {
    key,
    shiftKey: false,
    ctrlKey: false,
    metaKey: false,
    repeat: false,
    isComposing: false,
    keyCode: 0,
    defaultPrevented: false,
    ...extra,
    preventDefault: vi.fn(),
  }
}

describe('submitKey 为 none：键盘一个提交出口都不留', () => {
  it('裸 Enter 不提交，也不拦截默认行为——那一下要落成换行', () => {
    const onSubmit = vi.fn()
    const r = mount({ defaultValue: '键盘发不出去', submitKey: 'none', onSubmit })
    const event = keyEvent('Enter')
    fire(r.input(), 'onKeyDown', event)
    expect(onSubmit).not.toHaveBeenCalled()
    expect(event.preventDefault).not.toHaveBeenCalled()
    // 值原样留着，没有被提交后的清空动过
    expect(r.value()).toBe('键盘发不出去')
  })

  it('带修饰键也一样：Ctrl+Enter 与 Meta+Enter 都不提交、都不拦截', () => {
    for (const mod of ['ctrlKey', 'metaKey'] as const) {
      const onSubmit = vi.fn()
      const r = mount({ defaultValue: '两种修饰键都试', submitKey: 'none', onSubmit })
      const event = keyEvent('Enter', { [mod]: true })
      fire(r.input(), 'onKeyDown', event)
      expect(onSubmit).not.toHaveBeenCalled()
      expect(event.preventDefault).not.toHaveBeenCalled()
    }
  })

  it('带 Shift 的 Enter 照旧换行：这一档不改变它的行为', () => {
    const onSubmit = vi.fn()
    const r = mount({ defaultValue: '还没写完', submitKey: 'none', onSubmit })
    const event = keyEvent('Enter', { shiftKey: true })
    fire(r.input(), 'onKeyDown', event)
    expect(onSubmit).not.toHaveBeenCalled()
    expect(event.preventDefault).not.toHaveBeenCalled()
  })

  it('按钮仍然提交，且不置灰：键盘关掉的只是键盘那一路', () => {
    const onSubmit = vi.fn()
    const r = mount({ defaultValue: '按按钮发', submitKey: 'none', onSubmit })
    expect(r.api().canSubmit).toBe(true)
    expect(r.trigger().disabled).toBeUndefined()
    fire(r.trigger(), 'onClick')
    expect(onSubmit).toHaveBeenCalledWith({ value: '按按钮发' })
  })

  it('程序化 submit() 仍然提交', () => {
    const onSubmit = vi.fn()
    const r = mount({ defaultValue: '代码里发', submitKey: 'none', onSubmit })
    r.api().submit()
    expect(onSubmit).toHaveBeenCalledWith({ value: '代码里发' })
  })
})

describe('submitKey 另外两档不受影响', () => {
  it('enter 档：裸 Enter 与 Mod+Enter 都提交并拦下默认行为', () => {
    for (const extra of [{}, { ctrlKey: true }, { metaKey: true }]) {
      const onSubmit = vi.fn()
      const r = mount({ defaultValue: '发这句', submitKey: 'enter', onSubmit })
      const event = keyEvent('Enter', extra)
      fire(r.input(), 'onKeyDown', event)
      expect(onSubmit).toHaveBeenCalledWith({ value: '发这句' })
      expect(event.preventDefault).toHaveBeenCalled()
    }
  })

  it('缺省即 enter 档', () => {
    const onSubmit = vi.fn()
    const r = mount({ defaultValue: '发这句', onSubmit })
    fire(r.input(), 'onKeyDown', keyEvent('Enter'))
    expect(onSubmit).toHaveBeenCalledWith({ value: '发这句' })
  })

  it('mod-enter 档：裸 Enter 换行不拦截，Mod+Enter 提交', () => {
    const onSubmit = vi.fn()
    const r = mount({ defaultValue: '两档都要验', submitKey: 'mod-enter', onSubmit })
    const bare = keyEvent('Enter')
    fire(r.input(), 'onKeyDown', bare)
    expect(onSubmit).not.toHaveBeenCalled()
    expect(bare.preventDefault).not.toHaveBeenCalled()

    const withMod = keyEvent('Enter', { ctrlKey: true })
    fire(r.input(), 'onKeyDown', withMod)
    expect(onSubmit).toHaveBeenCalledWith({ value: '两档都要验' })
    expect(withMod.preventDefault).toHaveBeenCalled()
  })
})

describe('connectPromptInput 属性输出', () => {
  it('不写 variant 时 root 落 outline；写 subtle 如实落', () => {
    const root = (r: Rig): Dict => r.api().getRootProps() as Dict
    expect(root(mount())['data-variant']).toBe('outline')
    expect(root(mount({ variant: 'subtle' }))['data-variant']).toBe('subtle')
  })

  it('root 投影 Field Chrome 的稳定角色与尺寸档（缺省 md），输入段投影 field-input 且不投影 layout', () => {
    const root = (r: Rig): Dict => r.api().getRootProps() as Dict
    expect(root(mount())['data-xh-field-chrome']).toBe('')
    expect(root(mount())['data-xh-field-size']).toBe('md')
    expect(root(mount({ size: 'lg' }))['data-xh-field-size']).toBe('lg')
    expect(root(mount({ disabled: true }))['data-disabled']).toBe('')
    const input = mount().input()
    expect(input['data-xh-field-input']).toBe('')
    expect(input['data-xh-field-layout']).toBeUndefined()
  })

  it('发送钮走 Action Control 的 text solid 档，生成中切成 subtle 的停止身份，禁用与原生 disabled 同步', () => {
    const empty = mount().trigger()
    expect(empty['data-xh-action-control']).toBe('')
    expect(empty['data-xh-action-profile']).toBe('text')
    expect(empty['data-xh-action-variant']).toBe('solid')
    expect(empty['data-xh-action-display']).toBe('always')
    expect(empty['data-xh-action-size']).toBe('md')
    expect(empty.disabled).toBe(true)
    expect(empty['data-disabled']).toBe('')
    const filled = mount({ defaultValue: '有内容' }).trigger()
    expect(filled.disabled).toBeUndefined()
    expect(filled['data-disabled']).toBeUndefined()
    const stop = mount({ loading: true }).trigger()
    expect(stop['data-mode']).toBe('stop')
    expect(stop['data-xh-action-variant']).toBe('subtle')
    expect(stop['data-disabled']).toBeUndefined()
    expect(mount({ size: 'sm' }).trigger()['data-xh-action-size']).toBe('sm')
  })
})

describe('按压通道：发送 / 停止按钮 Space / Enter 与触屏按住投影 data-pressed', () => {
  const touch = { pointerType: 'touch' }
  const mouse = { pointerType: 'mouse' }
  const pressed = (rig: Rig): boolean => rig.trigger()['data-pressed'] === ''

  /** 与 mount 同一套接线，另留一个改 props 的口子。 */
  function mountWithProps(initial: Props = {}): Rig & { setProps: (next: Props) => void } {
    const runtime = createVanillaRuntime()
    const props = runtime.signal<Props>({ ...initial })
    const service = createService(promptInputMachine, { props: () => props.get(), runtime })
    runtime.start()
    const api = (): PromptInputApi => connectPromptInput(service, normalizeProps)
    return {
      service,
      api,
      input: () => api().getInputProps() as Dict,
      trigger: () => api().getSubmitTriggerProps() as Dict,
      value: () => service.context.get('value'),
      setProps: next => props.set({ ...props.get(), ...next }),
    }
  }

  it('发送身份：keydown 在场、keyup 撤下；失焦撤下；触屏按下在场、抬起 / 取消撤下；鼠标不走这一路；按住本身不提交', () => {
    const onSubmit = vi.fn()
    const rig = mount({ defaultValue: '你好', onSubmit })
    expect(pressed(rig)).toBe(false)
    fire(rig.trigger(), 'onKeyDown', keyEvent(' '))
    expect(pressed(rig)).toBe(true)
    fire(rig.trigger(), 'onKeyUp', keyEvent(' '))
    expect(pressed(rig)).toBe(false)
    fire(rig.trigger(), 'onKeyDown', keyEvent('Enter'))
    expect(pressed(rig)).toBe(true)
    fire(rig.trigger(), 'onBlur')
    expect(pressed(rig)).toBe(false)
    fire(rig.trigger(), 'onPointerDown', touch)
    expect(pressed(rig)).toBe(true)
    fire(rig.trigger(), 'onPointerCancel')
    expect(pressed(rig)).toBe(false)
    fire(rig.trigger(), 'onPointerDown', touch)
    expect(pressed(rig)).toBe(true)
    fire(rig.trigger(), 'onPointerUp')
    expect(pressed(rig)).toBe(false)
    fire(rig.trigger(), 'onPointerDown', mouse)
    expect(pressed(rig)).toBe(false)
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('提交后清空（Enter 在 keydown 即 click）：发送钮转禁用，按压面由机器松开', () => {
    const rig = mount({ defaultValue: '你好' })
    fire(rig.trigger(), 'onKeyDown', keyEvent('Enter'))
    expect(pressed(rig)).toBe(true)
    fire(rig.trigger(), 'onClick')
    expect(rig.value()).toBe('')
    expect(rig.trigger().disabled).toBe(true)
    expect(pressed(rig)).toBe(false)
  })

  it('停止身份（loading）恒可用，按住同样有回执；身份随 loading 切换时松开', () => {
    const rig = mountWithProps({ loading: true })
    expect(rig.trigger()['data-mode']).toBe('stop')
    expect(rig.trigger().disabled).toBeUndefined()
    fire(rig.trigger(), 'onKeyDown', keyEvent('Enter'))
    expect(pressed(rig)).toBe(true)
    rig.setProps({ loading: false })
    expect(rig.trigger()['data-mode']).toBe('send')
    expect(pressed(rig)).toBe(false)

    const sending = mountWithProps({ defaultValue: '你好' })
    fire(sending.trigger(), 'onPointerDown', touch)
    expect(pressed(sending)).toBe(true)
    sending.setProps({ loading: true })
    expect(pressed(sending)).toBe(false)
  })

  it('不进：禁用；空内容不可提交（按钮原生 disabled）；输入法组合中', () => {
    const off = mount({ defaultValue: '你好', disabled: true })
    fire(off.trigger(), 'onKeyDown', keyEvent(' '))
    fire(off.trigger(), 'onPointerDown', touch)
    expect(pressed(off)).toBe(false)

    const empty = mount()
    expect(empty.trigger().disabled).toBe(true)
    fire(empty.trigger(), 'onKeyDown', keyEvent(' '))
    expect(pressed(empty)).toBe(false)
    // allowEmptySubmit 放开后空内容也可按
    const allow = mount({ allowEmptySubmit: true })
    fire(allow.trigger(), 'onKeyDown', keyEvent(' '))
    expect(pressed(allow)).toBe(true)

    const composing = mount({ defaultValue: '你好' })
    fire(composing.input(), 'onCompositionStart')
    fire(composing.trigger(), 'onPointerDown', touch)
    expect(pressed(composing)).toBe(false)
  })

  it('按住途中转入禁用，或宿主把值清空 / 组合开始使发送钮转禁用：按压面由机器自己收', () => {
    const rig = mountWithProps({ defaultValue: '你好' })
    fire(rig.trigger(), 'onKeyDown', keyEvent('Enter'))
    expect(pressed(rig)).toBe(true)
    rig.setProps({ disabled: true })
    expect(pressed(rig)).toBe(false)

    const cleared = mountWithProps({ defaultValue: '你好' })
    fire(cleared.trigger(), 'onKeyDown', keyEvent('Enter'))
    cleared.api().setValue('')
    expect(pressed(cleared)).toBe(false)

    const composing = mountWithProps({ defaultValue: '你好' })
    fire(composing.trigger(), 'onPointerDown', touch)
    fire(composing.input(), 'onCompositionStart')
    expect(pressed(composing)).toBe(false)
  })
})
