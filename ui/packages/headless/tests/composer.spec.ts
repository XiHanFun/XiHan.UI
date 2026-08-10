// @vitest-environment jsdom
import type { Service } from '@xihan-ui/machine'
import type { ComposerApi, ComposerSchema, ComposerState } from '../src/composer'
import { normalizeProps } from '@xihan-ui/kernel'
import { createService } from '@xihan-ui/machine'
import { createVanillaRuntime } from '@xihan-ui/machine/vanilla'
import { describe, expect, it, vi } from 'vitest'
// 直接从组件目录导入，不经包主入口
import { composerAnatomy, composerMachine, composerMeta, connectComposer } from '../src/composer'

type Props = ComposerSchema['props']
type Dict = Record<string, unknown>

interface Rig {
  service: Service<ComposerSchema>
  api: () => ComposerApi
  input: () => Dict
  trigger: () => Dict
  root: () => Dict
  /** 运行期改 props，受控值回写与 disabled 翻转都走它。 */
  setProps: (next: Props) => void
  state: () => ComposerState
  value: () => string
}

/** 把 props 挂在 signal 上，使 watch 里的 track 能收到运行期改动。 */
function mount(initial: Props = {}): Rig {
  const runtime = createVanillaRuntime()
  const props = runtime.signal<Props>({ ...initial })
  const service = createService(composerMachine, { props: () => props.get(), runtime })
  runtime.start()

  const api = (): ComposerApi => connectComposer(service, normalizeProps)
  return {
    service,
    api,
    input: () => api().getInputProps() as Dict,
    trigger: () => api().getSubmitTriggerProps() as Dict,
    root: () => api().getRootProps() as Dict,
    setProps: next => props.set({ ...props.get(), ...next }),
    state: () => service.state.get(),
    value: () => service.context.get('value'),
  }
}

function fire(props: Dict, key: string, event: unknown = {}): void {
  (props[key] as (e: unknown) => void)(event)
}

/** 输入事件桩，连接层只读 target.value。 */
function inputEvent(value: string): unknown {
  return { target: { value } }
}

/** 按键桩，isComposing 与 keyCode 可自由伪造，preventDefault 是 spy。 */
function keyEvent(key: string, extra: { shiftKey?: boolean, isComposing?: boolean, keyCode?: number } = {}) {
  return { key, shiftKey: false, isComposing: false, keyCode: 0, ...extra, preventDefault: vi.fn() }
}

describe('初始状态', () => {
  it('没有值就是 empty，有值就是 editing', () => {
    expect(mount().state()).toBe('empty')
    expect(mount({ defaultValue: '你好' }).state()).toBe('editing')
  })

  it('只含空白的初值仍算空：与 canSubmit 的 trim 是同一把尺子', () => {
    // 纯空白的 defaultValue 按空处理
    expect(mount({ defaultValue: '   ' }).state()).toBe('empty')
  })

  it('受控值同样参与初始状态判定', () => {
    expect(mount({ value: 'hi' }).state()).toBe('editing')
    expect(mount({ value: '' }).state()).toBe('empty')
  })

  it('disabled 优先于值：一开局就禁用的输入框不该落在 editing', () => {
    expect(mount({ defaultValue: '你好', disabled: true }).state()).toBe('disabled')
  })
})

describe('提交按钮', () => {
  it('空值时带原生 disabled，而不是只置个 data 位', () => {
    // 不可提交时按钮带原生 disabled
    const r = mount()
    expect(r.api().canSubmit).toBe(false)
    expect(r.trigger().disabled).toBe(true)
    expect(r.trigger()['data-mode']).toBe('send')
    expect(r.trigger()['aria-label']).toBe('Send')
    expect(r.trigger().type).toBe('button')
  })

  it('输入非空后按钮放行', () => {
    const r = mount()
    fire(r.input(), 'onInput', inputEvent('你好'))
    expect(r.state()).toBe('editing')
    expect(r.api().canSubmit).toBe(true)
    expect(r.trigger().disabled).toBeUndefined()
  })

  it('只敲空格不算有内容', () => {
    const r = mount()
    fire(r.input(), 'onInput', inputEvent('   '))
    expect(r.state()).toBe('empty')
    expect(r.trigger().disabled).toBe(true)
  })

  it('点按钮提交：回调拿到的是提交那一刻的原文，框随后清空', () => {
    const onSubmit = vi.fn()
    const r = mount({ defaultValue: '你好', onSubmit })
    fire(r.trigger(), 'onClick')
    // 回调收到的是清空前的值
    expect(onSubmit).toHaveBeenCalledWith({ value: '你好' })
    expect(r.value()).toBe('')
    expect(r.state()).toBe('empty')
  })

  it('空值态下直接调处理器也提交不了：canSubmit 守卫拦在转移前面', () => {
    const onSubmit = vi.fn()
    const r = mount({ onSubmit })
    fire(r.trigger(), 'onClick')
    r.api().submit()
    expect(onSubmit).not.toHaveBeenCalled()
  })
})

describe('回车提交', () => {
  it('enter 提交并拦下默认换行，免得提交完框里留一个空行', () => {
    const onSubmit = vi.fn()
    const r = mount({ defaultValue: '你好', onSubmit })
    const event = keyEvent('Enter')
    fire(r.input(), 'onKeyDown', event)
    expect(event.preventDefault).toHaveBeenCalled()
    expect(onSubmit).toHaveBeenCalledWith({ value: '你好' })
  })

  it('shift+Enter 一律放行：换行交给浏览器插，光标位置与撤销栈没人能做得比原生准', () => {
    const onSubmit = vi.fn()
    const r = mount({ defaultValue: '你好', onSubmit })
    const event = keyEvent('Enter', { shiftKey: true })
    fire(r.input(), 'onKeyDown', event)
    expect(event.preventDefault).not.toHaveBeenCalled()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('submitOnEnter 关掉后回车只换行', () => {
    const onSubmit = vi.fn()
    const r = mount({ defaultValue: '你好', submitOnEnter: false, onSubmit })
    const event = keyEvent('Enter')
    fire(r.input(), 'onKeyDown', event)
    expect(event.preventDefault).not.toHaveBeenCalled()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('输入法组合态下的回车是"确认选词"，一个字都不许发出去', () => {
    const onSubmit = vi.fn()
    const r = mount({ defaultValue: '你好', onSubmit })
    const event = keyEvent('Enter', { isComposing: true })
    fire(r.input(), 'onKeyDown', event)
    expect(onSubmit).not.toHaveBeenCalled()
    // 默认行为也不拦截
    expect(event.preventDefault).not.toHaveBeenCalled()
  })

  it('keyCode 229 是同一件事在旧 WebKit 与部分安卓输入法上的样子，同样得让开', () => {
    const onSubmit = vi.fn()
    const r = mount({ defaultValue: '你好', onSubmit })
    fire(r.input(), 'onKeyDown', keyEvent('Enter', { keyCode: 229 }))
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('compositionstart 维护的那条腿管住按钮那一路：组合期间 canSubmit 为假', () => {
    const onSubmit = vi.fn()
    const r = mount({ defaultValue: '你好', onSubmit })
    fire(r.input(), 'onCompositionStart')
    expect(r.api().isComposing).toBe(true)
    expect(r.api().canSubmit).toBe(false)
    expect(r.trigger().disabled).toBe(true)

    // 事件本身没带 isComposing，守卫读的是 context
    fire(r.input(), 'onKeyDown', keyEvent('Enter'))
    fire(r.trigger(), 'onClick')
    expect(onSubmit).not.toHaveBeenCalled()

    fire(r.input(), 'onCompositionEnd')
    expect(r.api().isComposing).toBe(false)
    fire(r.input(), 'onKeyDown', keyEvent('Enter'))
    expect(onSubmit).toHaveBeenCalledWith({ value: '你好' })
  })

  it('别的键一概不接管', () => {
    const r = mount({ defaultValue: '你好' })
    for (const event of [keyEvent('a'), keyEvent('Escape'), keyEvent('Tab')]) {
      fire(r.input(), 'onKeyDown', event)
      expect(event.preventDefault).not.toHaveBeenCalled()
    }
  })
})

describe('流式运行态', () => {
  it('同一个按钮原位换成停止：DOM 位置不动，正在按它的用户不会按空', () => {
    const r = mount({ defaultValue: '你好', runStatus: 'streaming' })
    expect(r.trigger()['data-mode']).toBe('stop')
    expect(r.trigger()['aria-label']).toBe('Stop generating')
    expect(r.root()['data-status']).toBe('streaming')
  })

  it('流式期间按钮恒可用：此刻它是"停止"，跟框里有没有字没关系', () => {
    const empty = mount({ runStatus: 'streaming' })
    expect(empty.api().canSubmit).toBe(false)
    expect(empty.trigger().disabled).toBeUndefined()
  })

  it('点它发的是 STOP 不是 SUBMIT', () => {
    const onStop = vi.fn()
    const onSubmit = vi.fn()
    const r = mount({ defaultValue: '你好', runStatus: 'streaming', onStop, onSubmit })
    fire(r.trigger(), 'onClick')
    expect(onStop).toHaveBeenCalledTimes(1)
    expect(onSubmit).not.toHaveBeenCalled()
    // 停止不清空输入
    expect(r.value()).toBe('你好')
  })

  it('流式期间回车也发不出去：守卫里 runStatus 必须是 ready', () => {
    const onSubmit = vi.fn()
    const r = mount({ defaultValue: '你好', runStatus: 'streaming', onSubmit })
    fire(r.input(), 'onKeyDown', keyEvent('Enter'))
    expect(onSubmit).not.toHaveBeenCalled()
    expect(r.state()).toBe('editing')
  })

  it('没在流式时 STOP 落空，不会凭空叫停一轮不存在的生成', () => {
    const onStop = vi.fn()
    const r = mount({ defaultValue: '你好', onStop })
    r.api().stop()
    expect(onStop).not.toHaveBeenCalled()
  })

  it('runStatus 没给就按 ready 算', () => {
    const r = mount({ defaultValue: '你好' })
    expect(r.api().streaming).toBe(false)
    expect(r.root()['data-status']).toBe('ready')
  })
})

describe('受控值', () => {
  it('给了 value 就由宿主说了算：机器不自改，只把用户敲的回调出去', () => {
    const onValueChange = vi.fn()
    const r = mount({ value: 'host', onValueChange })
    fire(r.input(), 'onInput', inputEvent('typed'))
    expect(r.value()).toBe('host')
    expect(r.input().value).toBe('host')
    expect(onValueChange).toHaveBeenCalledWith({ value: 'typed' })
  })

  it('宿主写回后跟着走', () => {
    const r = mount({ value: 'host' })
    r.setProps({ value: 'typed' })
    expect(r.value()).toBe('typed')
    expect(r.input().value).toBe('typed')
  })

  it('受控提交：清空同样只发回调，值仍归宿主', () => {
    const onSubmit = vi.fn()
    const onValueChange = vi.fn()
    const r = mount({ value: '你好', onSubmit, onValueChange })
    fire(r.trigger(), 'onClick')
    expect(onSubmit).toHaveBeenCalledWith({ value: '你好' })
    expect(onValueChange).toHaveBeenLastCalledWith({ value: '' })
    expect(r.value()).toBe('你好')
  })
})

describe('禁用位翻转', () => {
  it('宿主把 disabled 打开即进 disabled 态，input 上是原生 disabled', () => {
    const r = mount({ defaultValue: '你好' })
    expect(r.input().disabled).toBeUndefined()

    r.setProps({ disabled: true })
    expect(r.state()).toBe('disabled')
    expect(r.api().disabled).toBe(true)
    // 输入框带原生 disabled，root 上另有 data-disabled
    expect(r.input().disabled).toBe(true)
    expect(r.root()['data-disabled']).toBe('')
  })

  it('关掉后按当下的值回到 empty 或 editing', () => {
    const filled = mount({ defaultValue: '你好', disabled: true })
    filled.setProps({ disabled: false })
    expect(filled.state()).toBe('editing')

    const blank = mount({ disabled: true })
    blank.setProps({ disabled: false })
    expect(blank.state()).toBe('empty')
  })

  it('disabled 变回 undefined 与变成 false 同义：没给就等于没禁用', () => {
    const r = mount({ disabled: true })
    r.setProps({ disabled: undefined })
    expect(r.state()).toBe('empty')
  })

  it('禁用态把输入、提交、停止、组合事件一并吃掉', () => {
    const onSubmit = vi.fn()
    const onStop = vi.fn()
    const r = mount({ defaultValue: '你好', runStatus: 'streaming', disabled: true, onSubmit, onStop })

    r.api().setValue('改了')
    fire(r.input(), 'onKeyDown', keyEvent('Enter'))
    fire(r.trigger(), 'onClick')
    fire(r.input(), 'onCompositionStart')

    expect(r.value()).toBe('你好')
    expect(r.state()).toBe('disabled')
    expect(onSubmit).not.toHaveBeenCalled()
    // 根级 on 上的 STOP 与组合事件被 disabled 态吃掉
    expect(onStop).not.toHaveBeenCalled()
    expect(r.api().isComposing).toBe(false)
  })

  it('禁用叠流式：按钮外观仍是停止且不置灰，按下去却不发 STOP', () => {
    // 流式期间按钮不置灰的规则不看 disabled，但事件仍被禁用态吃掉
    const onStop = vi.fn()
    const r = mount({ defaultValue: '你好', runStatus: 'streaming', disabled: true, onStop })
    expect(r.trigger()['data-mode']).toBe('stop')
    expect(r.trigger().disabled).toBeUndefined()
    fire(r.trigger(), 'onClick')
    expect(onStop).not.toHaveBeenCalled()
    // 输入框侧仍是原生禁用
    expect(r.input().disabled).toBe(true)
    expect(r.api().canSubmit).toBe(false)
  })
})

describe('结构与文案', () => {
  it('三个 part 都带 anatomy 标记', () => {
    const r = mount()
    const pairs: Array<[Dict, string]> = [
      [r.root(), 'root'],
      [r.input(), 'input'],
      [r.trigger(), 'submit-trigger'],
    ]
    for (const [props, part] of pairs) {
      expect(props['data-scope']).toBe('composer')
      expect(props['data-part']).toBe(part)
    }
  })

  it('input 把当前状态透出成 data-state，并有可访问名', () => {
    const r = mount()
    expect(r.input()['data-state']).toBe('empty')
    expect(r.input()['aria-label']).toBe('Message')
    fire(r.input(), 'onInput', inputEvent('你好'))
    expect(r.input()['data-state']).toBe('editing')
  })

  it('文案默认英文，给了就用给的', () => {
    const r = mount({ translations: { send: '发送', input: '消息' } })
    expect(r.trigger()['aria-label']).toBe('发送')
    expect(r.input()['aria-label']).toBe('消息')

    const streaming = mount({ runStatus: 'streaming', translations: { stop: '停止' } })
    expect(streaming.trigger()['aria-label']).toBe('停止')
  })

  it('只覆盖一条时其余仍回落英文', () => {
    const r = mount({ translations: { send: '发送' } })
    expect(r.input()['aria-label']).toBe('Message')
  })
})

describe('受控 value 的回写通道', () => {
  it('宿主直接写入 value 后状态跟着走，提交路径立刻可用', () => {
    // 受控写入不产生 VALUE.SET，状态由 watch 补同步
    const onSubmit = vi.fn()
    const r = mount({ value: '', onSubmit })
    expect(r.state()).toBe('empty')

    r.setProps({ value: '帮我写个提纲' })
    expect(r.state()).toBe('editing')
    expect(r.api().canSubmit).toBe(true)

    r.api().submit()
    expect(onSubmit).toHaveBeenCalledWith({ value: '帮我写个提纲' })
  })

  it('受控且宿主不写回时，回车照样发得出去', () => {
    // 这一路 value 未变，watch 不触发
    const onSubmit = vi.fn()
    const r = mount({ value: '你好', onSubmit })
    r.service.send({ type: 'KEY.ENTER' })
    expect(onSubmit).toHaveBeenCalledWith({ value: '你好' })
  })

  it('写回空串则退回 empty', () => {
    const r = mount({ value: '草稿' })
    expect(r.state()).toBe('editing')
    r.setProps({ value: '   ' })
    expect(r.state()).toBe('empty')
  })

  it('禁用期间的受控写入不会把机器踢出 disabled', () => {
    const r = mount({ value: '', disabled: true })
    expect(r.state()).toBe('disabled')
    r.setProps({ value: '外部塞进来的字' })
    expect(r.state()).toBe('disabled')
  })
})

describe('iME 组合态不会被禁用闩死', () => {
  it('组合期间被禁用、启用后仍能提交', () => {
    // 组合中途被禁用时收不到 compositionend，由 disabled 的 entry 复位 isComposing
    const onSubmit = vi.fn()
    const r = mount({ onSubmit })
    r.service.send({ type: 'COMPOSITION.START' })
    expect(r.api().isComposing).toBe(true)

    r.setProps({ disabled: true })
    r.setProps({ disabled: false })
    expect(r.api().isComposing).toBe(false)

    r.service.send({ type: 'VALUE.SET', value: '你好' })
    expect(r.api().canSubmit).toBe(true)
    r.service.send({ type: 'KEY.ENTER' })
    expect(onSubmit).toHaveBeenCalledWith({ value: '你好' })
  })
})

describe('composerMeta', () => {
  it('必备 part 都在 anatomy 里', () => {
    const declared = new Set<string>(composerAnatomy.parts)
    expect(composerMeta.requiredParts.filter(p => !declared.has(p))).toEqual([])
  })
})
