// @vitest-environment jsdom
import type { Service } from '@xihan-ui/machine'
import type { FormErrors, FormInvalidDetails, FormSchema } from '../src/form/index'
import { normalizeProps } from '@xihan-ui/core'
import { createService } from '@xihan-ui/machine'
import { createVanillaRuntime } from '@xihan-ui/machine/vanilla'
import { describe, expect, it, vi } from 'vitest'
import {
  connectForm,
  firstFormErrorName,
  focusFormField,
  formFieldOrder,
  formMachine,
  mergeFormErrors,
  normalizeFormErrors,
  sameFormErrors,
  sameFormValues,
  setFormFieldValue,
} from '../src/form/index'

type Props = FormSchema['props']
type Dict = Record<string, unknown>

/** 起一台机器，并留一个改 props 的口子（受控回写、运行期改 disabled 都靠它）。 */
function makeService(initial: Props = {}) {
  const runtime = createVanillaRuntime()
  const props = runtime.signal<Props>(initial)
  const service = createService(formMachine, { props: () => props.get(), runtime })
  runtime.start()
  return {
    service,
    setProps: (next: Props) => props.set({ ...props.get(), ...next }),
    api: () => connectForm(service, normalizeProps),
    values: () => service.context.get('values'),
    errors: () => service.context.get('errors'),
    state: () => service.state.get(),
  }
}

function fire(props: Dict, key: string, event: unknown = {}): void {
  (props[key] as (e: unknown) => void)(event)
}

/** 等 flush（微任务）跑完：落焦推迟了一拍。 */
const microtask = (): Promise<void> => Promise.resolve()

// ——————————————————————————— 纯函数 ———————————————————————————

describe('normalizeFormErrors', () => {
  it('只留非空字符串：空串与 undefined 都是"这条没错"', () => {
    expect(normalizeFormErrors({ email: '格式不对', password: '', code: undefined })).toEqual({ email: '格式不对' })
  })

  it('没给表就是空表，不抛也不返回 undefined', () => {
    expect(normalizeFormErrors(undefined)).toEqual({})
    expect(normalizeFormErrors(null)).toEqual({})
  })

  it('每次产出新表，不与传进来的那份共享引用', () => {
    const raw = { email: '格式不对' }
    const out = normalizeFormErrors(raw)
    expect(out).not.toBe(raw)
    expect(out).toEqual(raw)
  })

  it('保持插入顺序：焦点退化到键序时靠它', () => {
    expect(Object.keys(normalizeFormErrors({ b: 'x', a: 'y' }))).toEqual(['b', 'a'])
  })
})

describe('mergeFormErrors', () => {
  it('给了文案就写上，没提到的字段原样不动', () => {
    expect(mergeFormErrors({ email: '旧' }, { password: '太短' })).toEqual({ email: '旧', password: '太短' })
  })

  it('空文案 / undefined / null 一律是"清掉这一条"', () => {
    expect(mergeFormErrors({ email: '旧', password: '太短' }, { email: '' })).toEqual({ password: '太短' })
    expect(mergeFormErrors({ email: '旧' }, { email: undefined })).toEqual({})
    expect(mergeFormErrors({ email: '旧' }, { email: null })).toEqual({})
  })

  it('清一条本来就不在表里的，什么都不发生', () => {
    const current = { email: '旧' }
    expect(mergeFormErrors(current, { code: '' })).toBe(current)
  })

  it('毫无变化时原样返回同一份引用（调用方据此跳过一次通知）', () => {
    const current = { email: '旧' }
    expect(mergeFormErrors(current, { email: '旧' })).toBe(current)
    expect(mergeFormErrors(current, {})).toBe(current)
  })

  it('有变化时返回新表，绝不就地改原表', () => {
    const current = { email: '旧' }
    const next = mergeFormErrors(current, { email: '新' })
    expect(next).not.toBe(current)
    expect(current).toEqual({ email: '旧' })
    expect(next).toEqual({ email: '新' })
  })
})

describe('sameFormErrors', () => {
  it('逐键比内容，引用不同不算不同', () => {
    expect(sameFormErrors({ a: '1' }, { a: '1' })).toBe(true)
    expect(sameFormErrors({ a: '1' }, { a: '2' })).toBe(false)
    expect(sameFormErrors({}, {})).toBe(true)
  })

  it('键数不同、键名不同都判不同', () => {
    expect(sameFormErrors({ a: '1' }, { a: '1', b: '2' })).toBe(false)
    expect(sameFormErrors({ a: '1' }, { b: '1' })).toBe(false)
  })

  it('对方为 undefined（尚未受控）时判不同', () => {
    expect(sameFormErrors({}, undefined)).toBe(false)
  })
})

describe('sameFormValues', () => {
  it('浅比每个键；值本身换了引用就算变了', () => {
    const list: string[] = []
    expect(sameFormValues({ a: 1, b: list }, { a: 1, b: list })).toBe(true)
    expect(sameFormValues({ a: 1 }, { a: 2 })).toBe(false)
    expect(sameFormValues({ b: [] }, { b: [] })).toBe(false)
  })

  it('键名不同但都取到 undefined 时仍判不同', () => {
    // 只比值会把这两张表看成一样：a 上取到 undefined，b 上也是
    expect(sameFormValues({ a: undefined }, { b: undefined })).toBe(false)
  })
})

describe('setFormFieldValue', () => {
  it('写新值产出新表，原表不动', () => {
    const values = { email: 'a' }
    const next = setFormFieldValue(values, 'email', 'b')
    expect(next).toEqual({ email: 'b' })
    expect(values).toEqual({ email: 'a' })
  })

  it('值没变就原样返回同一份引用', () => {
    const values = { email: 'a' }
    expect(setFormFieldValue(values, 'email', 'a')).toBe(values)
  })

  it('把一个字段显式写成 undefined 与"这个字段不存在"是两回事', () => {
    const values = {}
    const next = setFormFieldValue(values, 'email', undefined)
    expect(next).not.toBe(values)
    expect(Object.hasOwn(next, 'email')).toBe(true)
  })
})

describe('firstFormErrorName', () => {
  it('按文档序取第一个出错的字段，不看错误表的键序', () => {
    // 键序是 password 在前，但屏幕上 email 在上面
    const errors: FormErrors = { password: '太短', email: '格式不对' }
    expect(firstFormErrorName(['email', 'password'], errors)).toBe('email')
  })

  it('文档序里没出错的字段直接跳过', () => {
    expect(firstFormErrorName(['nickname', 'email', 'password'], { password: '太短' })).toBe('password')
  })

  it('一个都没渲染出来时退回键序的第一条，不至于什么都不报', () => {
    expect(firstFormErrorName([], { password: '太短', email: '格式不对' })).toBe('password')
    expect(firstFormErrorName(['nickname'], { password: '太短' })).toBe('password')
  })

  it('没有错误就没有落点', () => {
    expect(firstFormErrorName(['email'], {})).toBeNull()
  })

  it('不被原型链上的名字骗到', () => {
    // `'toString' in {}` 是真的：用 in 判断会把一个根本没出错的字段当成错处
    expect(firstFormErrorName(['toString', 'email'], { email: '格式不对' })).toBe('email')
  })
})

// ——————————————————————————— 机器 ———————————————————————————

describe('formMachine 提交', () => {
  it('挂载即 idle；作者预置的错误不会让它一上来就算"提交失败过"', () => {
    const s = makeService({ defaultErrors: { email: '格式不对' } })
    expect(s.state()).toBe('idle')
    expect(s.errors()).toEqual({ email: '格式不对' })
  })

  it('校验通过：只调 onSubmit，状态留在 idle', () => {
    const onSubmit = vi.fn()
    const onInvalid = vi.fn()
    const s = makeService({ defaultValues: { email: 'a@b.c' }, validate: () => ({}), onSubmit, onInvalid })
    s.service.send({ type: 'SUBMIT' })
    expect(s.state()).toBe('idle')
    expect(onSubmit).toHaveBeenCalledWith({ values: { email: 'a@b.c' } })
    expect(onInvalid).not.toHaveBeenCalled()
  })

  it('校验不通过：只调 onInvalid（带整表错误与同一拍的值），状态转 invalid', () => {
    const onSubmit = vi.fn()
    const onInvalid = vi.fn<(d: FormInvalidDetails) => void>()
    const s = makeService({
      defaultValues: { email: '' },
      validate: values => ({ email: values.email ? '' : '不能为空' }),
      onSubmit,
      onInvalid,
    })
    s.service.send({ type: 'SUBMIT' })
    expect(s.state()).toBe('invalid')
    expect(onSubmit).not.toHaveBeenCalled()
    expect(onInvalid).toHaveBeenCalledWith({ errors: { email: '不能为空' }, values: { email: '' } })
  })

  it('校验函数返回的空串不算错误，表单提交得出去', () => {
    const onSubmit = vi.fn()
    const s = makeService({ validate: () => ({ email: '', password: undefined }), onSubmit })
    s.service.send({ type: 'SUBMIT' })
    expect(s.errors()).toEqual({})
    expect(onSubmit).toHaveBeenCalledTimes(1)
  })

  it('提交整表替换错误：上一次留下的错误在这一次通过后清空', () => {
    let fail = true
    const s = makeService({ validate: () => (fail ? { email: '不能为空' } : {}) })
    s.service.send({ type: 'SUBMIT' })
    expect(s.errors()).toEqual({ email: '不能为空' })
    expect(s.state()).toBe('invalid')
    fail = false
    s.service.send({ type: 'SUBMIT' })
    expect(s.errors()).toEqual({})
    // 这一次过了，摘要该撤下去
    expect(s.state()).toBe('idle')
  })

  it('没给 validate 就沿用当下的错误表：服务端塞进来的错误照样拦得住提交', () => {
    const onSubmit = vi.fn()
    const onInvalid = vi.fn()
    const s = makeService({ onSubmit, onInvalid })
    s.service.send({ type: 'ERROR.SET', name: 'email', message: '该邮箱已注册' })
    s.service.send({ type: 'SUBMIT' })
    expect(onSubmit).not.toHaveBeenCalled()
    expect(onInvalid).toHaveBeenCalledWith({ errors: { email: '该邮箱已注册' }, values: {} })

    s.service.send({ type: 'ERRORS.CLEAR' })
    s.service.send({ type: 'SUBMIT' })
    expect(onSubmit).toHaveBeenCalledTimes(1)
  })

  it('失败态里再失败一次照样重报，不会因为状态没变就吞掉回调', () => {
    const onInvalid = vi.fn()
    const s = makeService({ validate: () => ({ email: '不能为空' }), onInvalid })
    s.service.send({ type: 'SUBMIT' })
    s.service.send({ type: 'SUBMIT' })
    expect(onInvalid).toHaveBeenCalledTimes(2)
  })

  it('disabled 时整条吃掉：既不校验也不发任何回调', () => {
    const onSubmit = vi.fn()
    const onInvalid = vi.fn()
    const validate = vi.fn(() => ({}))
    const s = makeService({ disabled: true, validate, onSubmit, onInvalid })
    s.service.send({ type: 'SUBMIT' })
    expect(validate).not.toHaveBeenCalled()
    expect(onSubmit).not.toHaveBeenCalled()
    expect(onInvalid).not.toHaveBeenCalled()
  })

  it('readOnly 不挡提交：改不动值不等于不能确认这份内容', () => {
    const onSubmit = vi.fn()
    const s = makeService({ readOnly: true, validate: () => ({}), onSubmit })
    s.service.send({ type: 'SUBMIT' })
    expect(onSubmit).toHaveBeenCalledTimes(1)
  })
})

describe('formMachine 写值与逐字段校验', () => {
  it('setFieldValue 落进值表并通知宿主', () => {
    const onValuesChange = vi.fn()
    const s = makeService({ defaultValues: { email: '' }, onValuesChange })
    s.service.send({ type: 'FIELD.SET', name: 'email', value: 'a@b.c' })
    expect(s.values()).toEqual({ email: 'a@b.c' })
    expect(onValuesChange).toHaveBeenCalledWith({ values: { email: 'a@b.c' } })
  })

  it('disabled / readOnly 下写不进去，连意图都不发', () => {
    for (const guardProp of ['disabled', 'readOnly'] as const) {
      const onValuesChange = vi.fn()
      const s = makeService({ defaultValues: { email: 'keep' }, [guardProp]: true, onValuesChange })
      s.service.send({ type: 'FIELD.SET', name: 'email', value: 'changed' })
      expect(s.values()).toEqual({ email: 'keep' })
      expect(onValuesChange).not.toHaveBeenCalled()
    }
  })

  it('默认 submit 模式：写值与失焦都不跑校验', () => {
    const validate = vi.fn(() => ({ email: '不能为空' }))
    const s = makeService({ validate })
    s.service.send({ type: 'FIELD.SET', name: 'email', value: '' })
    s.service.send({ type: 'FIELD.BLUR', name: 'email' })
    expect(validate).not.toHaveBeenCalled()
    expect(s.errors()).toEqual({})
  })

  it('change 模式：只更新刚改过的那个字段，别的字段不被牵连', () => {
    const s = makeService({
      validateOn: 'change',
      defaultValues: { email: '', password: '' },
      validate: values => ({
        email: values.email ? '' : '邮箱不能为空',
        password: values.password ? '' : '密码不能为空',
      }),
    })
    s.service.send({ type: 'FIELD.SET', name: 'email', value: '' })
    // 整表跑了，但只写回 email 这一条——password 用户还没填到
    expect(s.errors()).toEqual({ email: '邮箱不能为空' })
    s.service.send({ type: 'FIELD.SET', name: 'email', value: 'a@b.c' })
    expect(s.errors()).toEqual({})
  })

  it('change 模式拿的是"写完之后"的值：受控值下 context 里还是宿主的旧表', () => {
    const onValuesChange = vi.fn()
    const seen: unknown[] = []
    const s = makeService({
      validateOn: 'change',
      values: { email: '' },
      onValuesChange,
      validate: (values) => {
        seen.push(values.email)
        return { email: values.email ? '' : '邮箱不能为空' }
      },
    })
    s.service.send({ type: 'FIELD.SET', name: 'email', value: 'a@b.c' })
    // 受控：内部值没落下，但校验必须按新值判，否则永远慢一个字符
    expect(s.values()).toEqual({ email: '' })
    expect(seen).toEqual(['a@b.c'])
    expect(s.errors()).toEqual({})
  })

  it('blur 模式：失焦才校验，写值不校验', () => {
    const s = makeService({
      validateOn: 'blur',
      defaultValues: { email: '' },
      validate: values => ({ email: values.email ? '' : '邮箱不能为空' }),
    })
    s.service.send({ type: 'FIELD.SET', name: 'email', value: '' })
    expect(s.errors()).toEqual({})
    s.service.send({ type: 'FIELD.BLUR', name: 'email' })
    expect(s.errors()).toEqual({ email: '邮箱不能为空' })
  })

  it('change 模式下失焦不校验，blur 模式下写值不校验（两条互不串台）', () => {
    const changeMode = makeService({ validateOn: 'change', validate: () => ({ email: 'x' }) })
    changeMode.service.send({ type: 'FIELD.BLUR', name: 'email' })
    expect(changeMode.errors()).toEqual({})

    const blurMode = makeService({ validateOn: 'blur', validate: () => ({ email: 'x' }) })
    blurMode.service.send({ type: 'FIELD.SET', name: 'email', value: 'v' })
    expect(blurMode.errors()).toEqual({})
  })

  it('disabled 时失焦也不校验', () => {
    const validate = vi.fn(() => ({ email: 'x' }))
    const s = makeService({ validateOn: 'blur', disabled: true, validate })
    s.service.send({ type: 'FIELD.BLUR', name: 'email' })
    expect(validate).not.toHaveBeenCalled()
  })
})

describe('formMachine 错误表的命令式口子', () => {
  it('setFieldError 写一条、空文案清一条，其余不动', () => {
    const s = makeService()
    s.service.send({ type: 'ERROR.SET', name: 'email', message: '该邮箱已注册' })
    s.service.send({ type: 'ERROR.SET', name: 'code', message: '验证码错误' })
    expect(s.errors()).toEqual({ email: '该邮箱已注册', code: '验证码错误' })
    s.service.send({ type: 'ERROR.SET', name: 'email' })
    expect(s.errors()).toEqual({ code: '验证码错误' })
  })

  it('禁用/只读也照收：服务端返回的错误得能挂到只读表单上', () => {
    const s = makeService({ disabled: true, readOnly: true })
    s.service.send({ type: 'ERROR.SET', name: 'email', message: '该邮箱已注册' })
    expect(s.errors()).toEqual({ email: '该邮箱已注册' })
  })

  it('clearErrors 清空；本来就空时不惊动宿主', () => {
    const onErrorsChange = vi.fn()
    const s = makeService({ defaultErrors: { email: 'x' }, onErrorsChange })
    s.service.send({ type: 'ERRORS.CLEAR' })
    expect(s.errors()).toEqual({})
    expect(onErrorsChange).toHaveBeenCalledTimes(1)
    s.service.send({ type: 'ERRORS.CLEAR' })
    expect(onErrorsChange).toHaveBeenCalledTimes(1)
  })

  it('写同一条错误两遍只通知一次', () => {
    const onErrorsChange = vi.fn()
    const s = makeService({ onErrorsChange })
    s.service.send({ type: 'ERROR.SET', name: 'email', message: '同一句' })
    s.service.send({ type: 'ERROR.SET', name: 'email', message: '同一句' })
    expect(onErrorsChange).toHaveBeenCalledTimes(1)
  })
})

describe('formMachine 重置', () => {
  it('值与错误都回到初始，并回到 idle', () => {
    const s = makeService({
      defaultValues: { email: 'seed' },
      validate: () => ({ email: '不能为空' }),
    })
    s.service.send({ type: 'FIELD.SET', name: 'email', value: 'typed' })
    s.service.send({ type: 'SUBMIT' })
    expect(s.state()).toBe('invalid')

    s.service.send({ type: 'RESET' })
    expect(s.state()).toBe('idle')
    expect(s.values()).toEqual({ email: 'seed' })
    expect(s.errors()).toEqual({})
  })

  it('落点取 prop 的当下值：切到另一条记录后重置该回到新的那一份', () => {
    const s = makeService({ defaultValues: { email: '第一条' } })
    s.setProps({ defaultValues: { email: '第二条' } })
    s.service.send({ type: 'RESET' })
    expect(s.values()).toEqual({ email: '第二条' })
  })

  it('disabled / readOnly 下重置推不动', () => {
    for (const guardProp of ['disabled', 'readOnly'] as const) {
      const s = makeService({ defaultValues: { email: 'seed' }, [guardProp]: true })
      s.setProps({ [guardProp]: false })
      s.service.send({ type: 'FIELD.SET', name: 'email', value: 'typed' })
      s.setProps({ [guardProp]: true })
      s.service.send({ type: 'RESET' })
      expect(s.values()).toEqual({ email: 'typed' })
    }
  })
})

describe('formMachine 受控', () => {
  it('受控值表：机器不自改，回调照发；宿主写回后以宿主的为准', () => {
    const onValuesChange = vi.fn()
    const s = makeService({ values: { email: 'host' }, onValuesChange })
    s.service.send({ type: 'FIELD.SET', name: 'email', value: 'typed' })
    expect(s.values()).toEqual({ email: 'host' })
    expect(onValuesChange).toHaveBeenCalledWith({ values: { email: 'typed' } })
    s.setProps({ values: { email: 'typed' } })
    expect(s.values()).toEqual({ email: 'typed' })
  })

  it('受控错误表：机器不自改，回调照发', () => {
    const onErrorsChange = vi.fn()
    const s = makeService({ errors: { email: 'host' }, onErrorsChange, validate: () => ({ email: '机器算的' }) })
    s.service.send({ type: 'SUBMIT' })
    expect(s.errors()).toEqual({ email: 'host' })
    expect(onErrorsChange).toHaveBeenCalledWith({ errors: { email: '机器算的' } })
  })

  it('受控错误表里的空串同样被清理掉，不然表单永远提交不出去', () => {
    const onSubmit = vi.fn()
    const s = makeService({ errors: { email: '' }, onSubmit })
    expect(s.errors()).toEqual({})
    s.service.send({ type: 'SUBMIT' })
    expect(onSubmit).toHaveBeenCalledTimes(1)
  })

  it('受控失败时回调带的是机器算出来的那张表，不是宿主还没写回的旧表', () => {
    const onInvalid = vi.fn<(d: FormInvalidDetails) => void>()
    const s = makeService({ errors: {}, validate: () => ({ email: '不能为空' }), onInvalid })
    s.service.send({ type: 'SUBMIT' })
    expect(onInvalid).toHaveBeenCalledWith({ errors: { email: '不能为空' }, values: {} })
    expect(s.state()).toBe('invalid')
  })

  it('宿主交来内容相同的新表不算变化，不重复通知', () => {
    const onValuesChange = vi.fn()
    const s = makeService({ values: { email: 'a' }, onValuesChange })
    s.setProps({ values: { email: 'a' } })
    s.service.send({ type: 'FIELD.SET', name: 'email', value: 'a' })
    expect(onValuesChange).not.toHaveBeenCalled()
  })
})

// ——————————————————————————— connect ———————————————————————————

describe('connectForm 结构与标注', () => {
  it('root 带 novalidate 与全套状态位', () => {
    const root = makeService().api().getRootProps() as Dict
    expect(root['data-scope']).toBe('form')
    expect(root['data-part']).toBe('root')
    // 不关掉的话浏览器会用自己的气泡拦在前面，submit 事件压根派不出来。
    // 空串 = 属性在场：写 true 的话两个适配器会落出 novalidate="" 与 novalidate="true" 两种 DOM
    expect(root.novalidate).toBe('')
    expect(root['data-state']).toBe('idle')
    expect(root['data-invalid']).toBeUndefined()
    expect(root['data-disabled']).toBeUndefined()
  })

  it('提交一律 preventDefault 并掐断冒泡 —— 禁用时也拦', () => {
    for (const props of [{}, { disabled: true }] as Props[]) {
      const s = makeService(props)
      const event = { preventDefault: vi.fn(), stopPropagation: vi.fn() }
      fire(s.api().getRootProps() as Dict, 'onSubmit', event)
      // 不拦的话浏览器会把整页导航掉，"禁用"的表单反而真提交出去了
      expect(event.preventDefault).toHaveBeenCalledTimes(1)
      // 不掐冒泡的话，这条永远被拦下的原生事件会与组件自己的同名语义事件撞在一起
      expect(event.stopPropagation).toHaveBeenCalledTimes(1)
    }
  })

  it('提交事件真的走到校验与回调上', () => {
    const onSubmit = vi.fn()
    const s = makeService({ validate: () => ({}), onSubmit })
    fire(s.api().getRootProps() as Dict, 'onSubmit', { preventDefault: vi.fn(), stopPropagation: vi.fn() })
    expect(onSubmit).toHaveBeenCalledTimes(1)
  })

  it('重置放行浏览器的默认还原；改不动时才拦', () => {
    const editable = { preventDefault: vi.fn() }
    const s = makeService({ defaultValues: { email: 'seed' } })
    fire(s.api().getRootProps() as Dict, 'onReset', editable)
    // 作者常用非受控的原生控件，拦掉这一下它们就还原不回去了
    expect(editable.preventDefault).not.toHaveBeenCalled()

    for (const guardProp of ['disabled', 'readOnly'] as const) {
      const blocked = { preventDefault: vi.fn() }
      const locked = makeService({ [guardProp]: true })
      fire(locked.api().getRootProps() as Dict, 'onReset', blocked)
      expect(blocked.preventDefault).toHaveBeenCalledTimes(1)
    }
  })

  it('字段容器：id 与摘要链接的 href 由同一处派生，名字回写成 data-name', () => {
    const api = makeService().api()
    const group = api.getFieldGroupProps({ name: 'email' }) as Dict
    const item = api.getErrorSummaryItemProps({ name: 'email' }) as Dict
    expect(group.id).toBe(api.getFieldId('email'))
    expect(item.href).toBe(`#${group.id as string}`)
    expect(group['data-name']).toBe('email')
    expect(item['data-name']).toBe('email')
    // 容器带 -1：控件全禁用时焦点至少落得到这块区域上
    expect(group.tabindex).toBe(-1)
  })

  it('字段名里的空格不会把 href 的片段标识切成两截', () => {
    const api = makeService().api()
    const href = (api.getErrorSummaryItemProps({ name: 'home address' }) as Dict).href as string
    expect(href.includes(' ')).toBe(false)
    expect(href).toBe(`#${api.getFieldId('home address')}`)
  })

  it('不同字段的 id 互不相同', () => {
    const api = makeService().api()
    expect(api.getFieldId('email')).not.toBe(api.getFieldId('password'))
  })

  it('字段容器的 data-invalid 跟着这个字段自己的错误走', () => {
    const s = makeService({ defaultErrors: { email: '格式不对' } })
    expect((s.api().getFieldGroupProps({ name: 'email' }) as Dict)['data-invalid']).toBe('')
    expect((s.api().getFieldGroupProps({ name: 'password' }) as Dict)['data-invalid']).toBeUndefined()
  })

  it('字段容器失焦上报；焦点还在容器内部时不报', () => {
    const s = makeService({ validateOn: 'blur', validate: () => ({ email: '不能为空' }) })
    const group = document.createElement('div')
    const inner = document.createElement('input')
    group.append(inner)

    fire(s.api().getFieldGroupProps({ name: 'email' }) as Dict, 'onFocusOut', { currentTarget: group, relatedTarget: inner })
    // 从输入框挪到旁边的按钮也会派 focusout，那一下报了就等于用户还没填完就挨红字
    expect(s.errors()).toEqual({})

    fire(s.api().getFieldGroupProps({ name: 'email' }) as Dict, 'onFocusOut', { currentTarget: group, relatedTarget: null })
    expect(s.errors()).toEqual({ email: '不能为空' })
  })

  it('错误摘要：role=alert，未提交失败前收起，data-count 跟着错误数走', () => {
    const s = makeService({ validate: () => ({ email: '不能为空', password: '太短' }) })
    const idle = s.api().getErrorSummaryProps() as Dict
    expect(idle.role).toBe('alert')
    expect(idle.hidden).toBe(true)
    expect(idle['data-state']).toBe('idle')
    expect(idle['data-count']).toBe('0')

    s.service.send({ type: 'SUBMIT' })
    const failed = s.api().getErrorSummaryProps() as Dict
    expect(failed.hidden).toBeUndefined()
    expect(failed['data-state']).toBe('invalid')
    expect(failed['data-count']).toBe('2')
  })

  it('作者预置的错误不会让摘要在提交前就显形', () => {
    const s = makeService({ defaultErrors: { email: '格式不对' } })
    expect((s.api().getErrorSummaryProps() as Dict).hidden).toBe(true)
    expect(s.api().invalid).toBe(true)
    expect(s.api().submitFailed).toBe(false)
  })

  it('错误改完后摘要自己撤下去，不必等到下一次提交', () => {
    const s = makeService({ validate: () => ({ email: '不能为空' }) })
    s.service.send({ type: 'SUBMIT' })
    expect((s.api().getErrorSummaryProps() as Dict).hidden).toBeUndefined()
    s.service.send({ type: 'ERRORS.CLEAR' })
    expect((s.api().getErrorSummaryProps() as Dict).hidden).toBe(true)
  })

  it('摘要条目按当下的错误表决定谁露面', () => {
    const s = makeService({ defaultErrors: { email: '格式不对' } })
    expect((s.api().getErrorSummaryItemProps({ name: 'email' }) as Dict).hidden).toBeUndefined()
    expect((s.api().getErrorSummaryItemProps({ name: 'password' }) as Dict).hidden).toBe(true)
  })

  it('摘要条目拦下锚点跳转，改由组件自己搬焦点', () => {
    const s = makeService()
    const event = { preventDefault: vi.fn() }
    fire(s.api().getErrorSummaryItemProps({ name: 'email' }) as Dict, 'onClick', event)
    // 不拦的话浏览器只滚动不搬焦点，还会往历史里塞一条哈希记录
    expect(event.preventDefault).toHaveBeenCalledTimes(1)
  })

  it('提交键是原生 type=submit，且不自带 onClick（否则一次点击提交两遍）', () => {
    const submit = makeService().api().getSubmitTriggerProps() as Dict
    expect(submit.type).toBe('submit')
    expect(submit.onClick).toBeUndefined()
    expect(submit.disabled).toBeUndefined()
  })

  it('重置键是原生 type=reset；只读时也置灰（重置就是在写值）', () => {
    expect((makeService().api().getResetTriggerProps() as Dict).type).toBe('reset')
    expect((makeService({ readOnly: true }).api().getResetTriggerProps() as Dict).disabled).toBe(true)
    expect((makeService({ readOnly: true }).api().getSubmitTriggerProps() as Dict).disabled).toBeUndefined()
    expect((makeService({ disabled: true }).api().getSubmitTriggerProps() as Dict).disabled).toBe(true)
    expect((makeService({ disabled: true }).api().getResetTriggerProps() as Dict).disabled).toBe(true)
  })

  it('api 的读取面与命令面与部件走的是同一条路', () => {
    const s = makeService({ defaultValues: { email: 'a@b.c' }, validate: () => ({ email: '不能为空' }) })
    expect(s.api().getFieldValue('email')).toBe('a@b.c')
    expect(s.api().validateOn).toBe('submit')

    s.api().setFieldValue('email', 'x@y.z')
    expect(s.values()).toEqual({ email: 'x@y.z' })

    s.api().setFieldError('code', '验证码错误')
    expect(s.api().getFieldError('code')).toBe('验证码错误')
    expect(s.api().isFieldInvalid('code')).toBe(true)
    expect(s.api().isFieldInvalid('email')).toBe(false)

    s.api().clearErrors()
    expect(s.api().errorCount).toBe(0)

    s.api().submit()
    expect(s.state()).toBe('invalid')
    expect(s.api().errorNames).toEqual(['email'])

    s.api().reset()
    expect(s.state()).toBe('idle')
    expect(s.values()).toEqual({ email: 'a@b.c' })
  })
})

// —— 落焦：这一段要真 DOM ——
// 机器把 getRootEl 塞进 refs 后，"提交失败去哪儿"与"点摘要去哪儿"才观察得到。

interface DomHarness {
  service: Service<FormSchema>
  form: HTMLFormElement
  api: () => ReturnType<typeof connectForm>
  input: (name: string) => HTMLInputElement
  group: (name: string) => HTMLElement
  stop: () => void
}

/** 按给定顺序铺出字段容器；disabledFields 里的字段只放一个禁用控件。 */
function makeDomHarness(props: Props = {}, names: string[] = ['email', 'password'], disabledFields: string[] = []): DomHarness {
  const form = document.createElement('form')
  form.setAttribute('data-scope', 'form')
  form.setAttribute('data-part', 'root')
  const inputs = new Map<string, HTMLInputElement>()
  const groups = new Map<string, HTMLElement>()
  for (const name of names) {
    const group = document.createElement('div')
    group.setAttribute('data-scope', 'form')
    group.setAttribute('data-part', 'field-group')
    group.setAttribute('data-name', name)
    group.tabIndex = -1
    const input = document.createElement('input')
    input.disabled = disabledFields.includes(name)
    group.append(input)
    form.append(group)
    inputs.set(name, input)
    groups.set(name, group)
  }
  document.body.append(form)

  const runtime = createVanillaRuntime()
  const service = createService(formMachine, { props: () => props, runtime })
  service.refs.set('getRootEl', () => form)
  runtime.start()
  return {
    service,
    form,
    api: () => connectForm(service, normalizeProps),
    input: name => inputs.get(name)!,
    group: name => groups.get(name)!,
    stop: () => {
      runtime.stop()
      form.remove()
    },
  }
}

describe('formFieldOrder / focusFormField', () => {
  it('按文档序列出字段名，没写名字的容器不算数', () => {
    const h = makeDomHarness({}, ['email', 'password'])
    const anonymous = document.createElement('div')
    anonymous.setAttribute('data-scope', 'form')
    anonymous.setAttribute('data-part', 'field-group')
    h.form.append(anonymous)
    expect(formFieldOrder(h.form)).toEqual(['email', 'password'])
    h.stop()
  })

  it('没有根节点（纯逻辑宿主）时给空表，不抛', () => {
    expect(formFieldOrder(null)).toEqual([])
  })

  it('焦点落在容器里第一个可聚焦控件上，不是容器本身', () => {
    const h = makeDomHarness()
    expect(focusFormField(h.form, 'password')).toBe(true)
    expect(document.activeElement).toBe(h.input('password'))
    h.stop()
  })

  it('控件全禁用时退回容器自身，别把键盘用户丢在 body 上', () => {
    const h = makeDomHarness({}, ['email'], ['email'])
    expect(focusFormField(h.form, 'email')).toBe(true)
    expect(document.activeElement).toBe(h.group('email'))
    h.stop()
  })

  it('这个字段压根没渲染出来时如实返回没找到', () => {
    const h = makeDomHarness()
    expect(focusFormField(h.form, 'nickname')).toBe(false)
    h.stop()
  })
})

describe('formMachine 提交失败后的落焦', () => {
  it('焦点落到文档序里第一个出错的字段，不看错误表的键序', async () => {
    // 键序 password 在前，屏幕上 email 在上面
    const h = makeDomHarness({ validate: () => ({ password: '太短', email: '格式不对' }) })
    h.service.send({ type: 'SUBMIT' })
    // 推迟一拍不是可有可无：这一刻宿主还没把这批错误渲上去
    expect(document.activeElement).not.toBe(h.input('email'))
    await microtask()
    expect(document.activeElement).toBe(h.input('email'))
    h.stop()
  })

  it('只有第二个字段出错时就落到第二个', async () => {
    const h = makeDomHarness({ validate: () => ({ password: '太短' }) })
    h.service.send({ type: 'SUBMIT' })
    await microtask()
    expect(document.activeElement).toBe(h.input('password'))
    h.stop()
  })

  it('校验通过时不动焦点', async () => {
    const h = makeDomHarness({ validate: () => ({}) })
    h.input('password').focus()
    h.service.send({ type: 'SUBMIT' })
    await microtask()
    expect(document.activeElement).toBe(h.input('password'))
    h.stop()
  })

  it('推迟这一拍里表单被重置了就不再抢焦点', async () => {
    const h = makeDomHarness({ validate: () => ({ email: '格式不对' }) })
    h.service.send({ type: 'SUBMIT' })
    h.service.send({ type: 'RESET' })
    await microtask()
    // 状态已经回 idle，摘要都撤了，这时候把焦点拽到某个字段上只会莫名其妙
    expect(document.activeElement).not.toBe(h.input('email'))
    h.stop()
  })

  it('无 DOM 根节点（纯逻辑宿主）时状态照常转移，只是不搬焦点', async () => {
    const s = makeService({ validate: () => ({ email: '格式不对' }) })
    s.service.send({ type: 'SUBMIT' })
    await microtask()
    expect(s.state()).toBe('invalid')
  })
})

describe('connectForm 摘要条目的落焦', () => {
  it('点条目把焦点送到对应字段', () => {
    const h = makeDomHarness({ defaultErrors: { email: '格式不对', password: '太短' } })
    fire(h.api().getErrorSummaryItemProps({ name: 'password' }) as Dict, 'onClick', { preventDefault: vi.fn() })
    expect(document.activeElement).toBe(h.input('password'))
    h.stop()
  })

  it('点条目立刻搬焦点，不推迟到下一拍：DOM 这一刻就是活的', () => {
    const h = makeDomHarness({ defaultErrors: { email: '格式不对' } })
    fire(h.api().getErrorSummaryItemProps({ name: 'email' }) as Dict, 'onClick', { preventDefault: vi.fn() })
    expect(document.activeElement).toBe(h.input('email'))
    h.stop()
  })
})
