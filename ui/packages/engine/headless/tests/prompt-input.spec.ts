// @vitest-environment jsdom
import type { Service } from '@xihan-ui/machine'
import type { PromptInputApi, PromptInputSchema } from '../src/prompt-input'
import { normalizeProps } from '@xihan-ui/kernel'
import { createService } from '@xihan-ui/machine'
import { createVanillaRuntime } from '@xihan-ui/machine/vanilla'
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
