// @vitest-environment jsdom
import type { TextFieldSchema, TextFieldValueChangeDetails } from '../src/text-field/index'
import { createService, normalizeProps } from '@xihan-ui/core'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'
import { describe, expect, it, vi } from 'vitest'
import { clampToMaxLength, connectTextField, isAtLimit, textFieldMachine } from '../src/text-field/index'

type Props = TextFieldSchema['props']
type Dict = Record<string, unknown>

/** 起一台机器，并留一个改 props 的口子（受控回写、运行期改 disabled 都靠它）。 */
function makeService(initial: Props = {}) {
  const props: Props = { ...initial }
  const runtime = createVanillaRuntime()
  // 每次展开成新对象：props 的身份变了，解释器的归一化缓存才会失效，改动才看得见
  const service = createService(textFieldMachine, { props: () => ({ ...props }), runtime })
  runtime.start()
  return {
    service,
    setProps: (next: Props) => Object.assign(props, next),
    api: () => connectTextField(service, normalizeProps),
    value: () => service.context.get('value'),
  }
}

/** 键盘事件桩。preventDefault 是 spy：这个组件"接不接管这个键"全靠它作证。 */
function keyEvent(key: string, mods: Partial<Record<'ctrlKey' | 'metaKey' | 'altKey', boolean>> = {}) {
  return { key, ctrlKey: false, metaKey: false, altKey: false, ...mods, preventDefault: vi.fn() }
}

function pointerEvent(button: number) {
  return { button, preventDefault: vi.fn() }
}

function inputEvent(value: string) {
  return { target: { value } }
}

function fire(props: Dict, key: string, event: unknown): void {
  (props[key] as (e: unknown) => void)(event)
}

describe('clampToMaxLength', () => {
  it('超出上限的尾巴被切掉，没超的原样不动', () => {
    expect(clampToMaxLength('abcdef', 3)).toBe('abc')
    expect(clampToMaxLength('ab', 3)).toBe('ab')
    expect(clampToMaxLength('abc', 3)).toBe('abc')
  })

  it('没给上限就不插手', () => {
    expect(clampToMaxLength('abcdef', undefined)).toBe('abcdef')
  })

  it('上限为 0 意味着一个字都收不下，不是"没给上限"', () => {
    // 0 是假值，用 `maxLength &&` 判断会让 maxLength=0 整个失效
    expect(clampToMaxLength('abc', 0)).toBe('')
  })

  it('负数与非有限值按"没给"处理，与浏览器对 maxlength 的态度一致', () => {
    expect(clampToMaxLength('abc', -1)).toBe('abc')
    expect(clampToMaxLength('abc', Number.NaN)).toBe('abc')
  })
})

describe('isAtLimit', () => {
  it('到顶与没到顶', () => {
    expect(isAtLimit('abc', 3)).toBe(true)
    expect(isAtLimit('ab', 3)).toBe(false)
    // 越过上限（受控值绕过截断塞进来）也算到顶，不能因为"不等于"就报没到
    expect(isAtLimit('abcd', 3)).toBe(true)
  })

  it('上限为 0 时空串就已经到顶；没给上限则恒不到顶', () => {
    expect(isAtLimit('', 0)).toBe(true)
    expect(isAtLimit('abc', undefined)).toBe(false)
  })
})

describe('textFieldMachine', () => {
  it('默认空串，defaultValue 决定初值', () => {
    expect(makeService().value()).toBe('')
    expect(makeService({ defaultValue: '你好' }).value()).toBe('你好')
  })

  it('写值并通知，通知里带的是最终落库的值（已截断的那个）', () => {
    const onValueChange = vi.fn<(d: TextFieldValueChangeDetails) => void>()
    const s = makeService({ onValueChange, maxLength: 3 })
    s.service.send({ type: 'VALUE.SET', value: 'abcdef' })
    // 通知里若给未截断的原串，宿主拿去做受控回写就会与框里显示的不一致
    expect(s.value()).toBe('abc')
    expect(onValueChange).toHaveBeenCalledWith({ value: 'abc' })
  })

  it('值没真变就不通知', () => {
    const onValueChange = vi.fn()
    const s = makeService({ defaultValue: 'x', onValueChange })
    s.service.send({ type: 'VALUE.SET', value: 'x' })
    expect(onValueChange).not.toHaveBeenCalled()
  })

  it('disabled / readOnly 下写不进去', () => {
    for (const guardProp of ['disabled', 'readOnly'] as const) {
      const s = makeService({ defaultValue: 'keep', [guardProp]: true })
      s.service.send({ type: 'VALUE.SET', value: 'changed' })
      expect(s.value()).toBe('keep')
    }
  })

  it('清空意图需要同时满足 clearable、可编辑、非空', () => {
    const cleared = makeService({ defaultValue: 'x', clearable: true })
    cleared.service.send({ type: 'VALUE.CLEAR' })
    expect(cleared.value()).toBe('')

    // 三条守卫逐个验：任一条被删掉，对应这一行就变红
    const notClearable = makeService({ defaultValue: 'x' })
    notClearable.service.send({ type: 'VALUE.CLEAR' })
    expect(notClearable.value()).toBe('x')

    const readOnly = makeService({ defaultValue: 'x', clearable: true, readOnly: true })
    readOnly.service.send({ type: 'VALUE.CLEAR' })
    expect(readOnly.value()).toBe('x')

    const disabled = makeService({ defaultValue: 'x', clearable: true, disabled: true })
    disabled.service.send({ type: 'VALUE.CLEAR' })
    expect(disabled.value()).toBe('x')
  })

  it('清空空值不惊动 onValueChange', () => {
    const onValueChange = vi.fn()
    const s = makeService({ clearable: true, onValueChange })
    s.service.send({ type: 'VALUE.CLEAR' })
    expect(onValueChange).not.toHaveBeenCalled()
  })

  it('受控：机器不自改值，回调照发；宿主写回后跟着走', () => {
    const onValueChange = vi.fn()
    const s = makeService({ value: 'host', onValueChange })
    s.service.send({ type: 'VALUE.SET', value: 'typed' })
    expect(s.value()).toBe('host')
    expect(onValueChange).toHaveBeenCalledWith({ value: 'typed' })

    s.setProps({ value: 'typed' })
    expect(s.value()).toBe('typed')
  })

  it('受控清空：值仍归宿主，回调收到空串', () => {
    const onValueChange = vi.fn()
    const s = makeService({ value: 'host', clearable: true, onValueChange })
    s.service.send({ type: 'VALUE.CLEAR' })
    expect(s.value()).toBe('host')
    expect(onValueChange).toHaveBeenCalledWith({ value: '' })
  })
})

describe('connectTextField 结构与标注', () => {
  it('root 带 anatomy 标记与状态位', () => {
    const root = makeService().api().getRootProps() as Dict
    expect(root['data-scope']).toBe('text-field')
    expect(root['data-part']).toBe('root')
    expect(root['data-empty']).toBe('')
    expect(root['data-disabled']).toBeUndefined()
    expect(root['data-readonly']).toBeUndefined()
    expect(root['data-invalid']).toBeUndefined()
    expect(root['data-at-max']).toBeUndefined()
  })

  it('label 的 for 指向 input 自己的 id，input 反手 aria-labelledby 指回 label', () => {
    const api = makeService().api()
    const label = api.getLabelProps() as Dict
    const input = api.getInputProps() as Dict
    expect(label.for).toBe(input.id)
    expect(input['aria-labelledby']).toBe(label.id)
    // 两个 id 不能是同一个：撞名会让 label 与 input 抢同一个 IDREF
    expect(label.id).not.toBe(input.id)
  })

  it('input 落 type/name/placeholder/maxlength 与显式 aria-invalid', () => {
    const input = makeService({ name: 'nickname', placeholder: '请输入', maxLength: 8 }).api().getInputProps() as Dict
    expect(input.type).toBe('text')
    expect(input.name).toBe('nickname')
    expect(input.placeholder).toBe('请输入')
    expect(input.maxlength).toBe(8)
    // 省略等于"没说"，显式 false 是"明确说了不是"
    expect(input['aria-invalid']).toBe('false')
    expect(input.value).toBe('')
  })

  it('invalid / required 落在 input 与 root 上', () => {
    const api = makeService({ invalid: true, required: true }).api()
    const input = api.getInputProps() as Dict
    expect(input['aria-invalid']).toBe('true')
    expect(input.required).toBe(true)
    expect(input['data-invalid']).toBe('')
    expect((api.getRootProps() as Dict)['data-invalid']).toBe('')
  })

  it('disabled 用原生 disabled；readOnly 只给 readonly、绝不顺手加 disabled', () => {
    const disabled = makeService({ disabled: true }).api().getInputProps() as Dict
    expect(disabled.disabled).toBe(true)
    expect(disabled.readonly).toBeUndefined()

    const readOnly = makeService({ readOnly: true }).api()
    const input = readOnly.getInputProps() as Dict
    expect(input.readonly).toBe(true)
    // 加了原生 disabled，只读框就不可聚焦、内容也选不中复制了
    expect(input.disabled).toBeUndefined()
    expect((readOnly.getRootProps() as Dict)['data-readonly']).toBe('')
  })

  it('到顶时 root 与 input 都出 data-at-max', () => {
    const api = makeService({ defaultValue: 'abc', maxLength: 3 }).api()
    expect(api.atLimit).toBe(true)
    expect((api.getRootProps() as Dict)['data-at-max']).toBe('')
    expect((api.getInputProps() as Dict)['data-at-max']).toBe('')

    const below = makeService({ defaultValue: 'ab', maxLength: 3 }).api()
    expect((below.getRootProps() as Dict)['data-at-max']).toBeUndefined()
  })
})

describe('connectTextField 输入与清空', () => {
  it('onInput 把输入框当下的值送进机器', () => {
    const s = makeService()
    fire(s.api().getInputProps() as Dict, 'onInput', inputEvent('hello'))
    expect(s.value()).toBe('hello')
  })

  it('escape 在可清空时清空并拦下浏览器的默认行为', () => {
    const s = makeService({ defaultValue: 'x', clearable: true })
    const event = keyEvent('Escape')
    fire(s.api().getInputProps() as Dict, 'onKeyDown', event)
    expect(s.value()).toBe('')
    expect(event.preventDefault).toHaveBeenCalled()
  })

  it('不可清空时 Escape 一个字都不动，也不吞键', () => {
    // 吞了键，套在浮层里的输入框会让 Escape 关不掉浮层——这条 preventDefault 断言正是守它的
    const cases: Props[] = [
      { defaultValue: 'x' }, //                        没开 clearable
      { clearable: true }, //                          开了但值本来就是空的
      { defaultValue: 'x', clearable: true, readOnly: true },
      { defaultValue: 'x', clearable: true, disabled: true },
    ]
    for (const props of cases) {
      const s = makeService(props)
      const before = s.value()
      const event = keyEvent('Escape')
      fire(s.api().getInputProps() as Dict, 'onKeyDown', event)
      expect(s.value()).toBe(before)
      expect(event.preventDefault).not.toHaveBeenCalled()
    }
  })

  it('带修饰键的 Escape 与其它按键一律不接管', () => {
    const s = makeService({ defaultValue: 'x', clearable: true })
    for (const event of [keyEvent('Escape', { ctrlKey: true }), keyEvent('Escape', { metaKey: true }), keyEvent('Escape', { altKey: true }), keyEvent('Enter'), keyEvent('a')]) {
      fire(s.api().getInputProps() as Dict, 'onKeyDown', event)
      expect(event.preventDefault).not.toHaveBeenCalled()
    }
    expect(s.value()).toBe('x')
  })

  it('clear-trigger：未开 clearable 时收起；不占 Tab 位但带名字、不对读屏隐藏', () => {
    const trigger = makeService({ defaultValue: 'x' }).api().getClearTriggerProps() as Dict
    expect(trigger.type).toBe('button')
    expect(trigger.hidden).toBe(true)
    expect(trigger.disabled).toBeUndefined()
    expect(trigger['data-disabled']).toBeUndefined()
    expect(trigger['aria-hidden']).toBeUndefined()
    expect(trigger['aria-label']).toBe('Clear')
    expect(trigger.tabindex).toBe(-1)
  })

  it('clear-trigger：aria-label 取 translations.clearTrigger', () => {
    const trigger = makeService({ translations: { clearTrigger: '清空' } }).api().getClearTriggerProps() as Dict
    expect(trigger['aria-label']).toBe('清空')
  })

  it('clear-trigger：开了 clearable 但清不了（空值 / 只读 / 禁用）时收起，有值才显出', () => {
    for (const props of [{ clearable: true }, { defaultValue: 'x', clearable: true, readOnly: true }, { defaultValue: 'x', clearable: true, disabled: true }] as Props[]) {
      const trigger = makeService(props).api().getClearTriggerProps() as Dict
      expect(trigger.hidden).toBe(true)
      expect(trigger.disabled).toBeUndefined()
    }

    const filled = makeService({ defaultValue: 'x', clearable: true }).api()
    const trigger = filled.getClearTriggerProps() as Dict
    expect(filled.canClear).toBe(true)
    expect(trigger.hidden).toBeUndefined()
    expect(trigger.disabled).toBeUndefined()
    expect(trigger['data-disabled']).toBeUndefined()
  })

  it('点 clear-trigger 清空；不可用时同一个处理器直接调也清不掉', () => {
    const s = makeService({ defaultValue: 'x', clearable: true })
    fire(s.api().getClearTriggerProps() as Dict, 'onClick', {})
    expect(s.value()).toBe('')

    // 收起的按钮点不到，只能直接调处理器才碰得到这层判断
    const readOnly = makeService({ defaultValue: 'x', clearable: true, readOnly: true })
    fire(readOnly.api().getClearTriggerProps() as Dict, 'onClick', {})
    expect(readOnly.value()).toBe('x')
  })

  it('点 clear-trigger 清完把焦点送回 input', () => {
    const s = makeService({ defaultValue: 'x', clearable: true })
    const input = document.createElement('input')
    input.id = (s.api().getInputProps() as Dict).id as string
    document.body.appendChild(input)
    try {
      fire(s.api().getClearTriggerProps() as Dict, 'onClick', {})
      expect(s.value()).toBe('')
      expect(document.activeElement).toBe(input)
    }
    finally {
      input.remove()
    }
  })

  it('按下 clear-trigger 时拦住焦点转移，右键不拦', () => {
    const trigger = makeService({ defaultValue: 'x', clearable: true }).api().getClearTriggerProps() as Dict
    const primary = pointerEvent(0)
    fire(trigger, 'onPointerDown', primary)
    expect(primary.preventDefault).toHaveBeenCalled()

    // 右键要留给上下文菜单，拦了菜单就弹不出来
    const secondary = pointerEvent(2)
    fire(trigger, 'onPointerDown', secondary)
    expect(secondary.preventDefault).not.toHaveBeenCalled()
  })

  it('api.setValue 不看 clearable，api.clear 看', () => {
    const s = makeService({ defaultValue: 'x' })
    s.api().clear()
    expect(s.value()).toBe('x')
    // 没开 clearable 也要有条无条件清空的路，否则"重置表单"就没法写
    s.api().setValue('')
    expect(s.value()).toBe('')
  })
})
