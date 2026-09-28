// @vitest-environment jsdom
import type { FormSchema } from '../src/form/form.types'
import { createService, normalizeProps } from '@xihan-ui/core'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { connectForm } from '../src/form/form.connect'
import { formMachine } from '../src/form/form.machine'

const disposers: Array<() => void> = []

afterEach(() => {
  for (const dispose of disposers.splice(0))
    dispose()
})

function mount(initial: FormSchema['props']) {
  const runtime = createVanillaRuntime()
  const props = runtime.signal(initial)
  const service = createService(formMachine, { props: () => props.get(), runtime })
  runtime.start()
  disposers.push(() => runtime.stop())
  return {
    service,
    api: () => connectForm(service, normalizeProps),
    setProps: (next: Partial<FormSchema['props']>) => props.set({ ...props.get(), ...next }),
  }
}

function deferred<T>() {
  let resolve!: (value: T | PromiseLike<T>) => void
  let reject!: (reason?: unknown) => void
  const promise = new Promise<T>((accept, fail) => {
    resolve = accept
    reject = fail
  })
  return { promise, resolve, reject }
}

describe('字段级状态：dirty 与 touched', () => {
  it('dirty 相对 defaultValues 按结构比：改回原样即不再算改过，换一份内容相同的新数组也不算', () => {
    const { api } = mount({ defaultValues: { name: 'Ada', tags: ['x'] } })
    expect(api().dirty).toBe(false)
    api().setFieldValue('name', 'Bob')
    expect(api().dirty).toBe(true)
    expect(api().isFieldDirty('name')).toBe(true)
    expect(api().isFieldDirty('tags')).toBe(false)
    api().setFieldValue('name', 'Ada')
    api().setFieldValue('tags', ['x'])
    expect(api().dirty).toBe(false)
    api().setFieldValue('extra', 'new')
    expect(api().isFieldDirty('extra')).toBe(true)
  })

  it('失焦一次即算触碰；重置清空触碰标记', () => {
    const { service, api } = mount({ defaultValues: { name: '' } })
    expect(api().isFieldTouched('name')).toBe(false)
    service.send({ type: 'FIELD.BLUR', name: 'name' })
    expect(api().isFieldTouched('name')).toBe(true)
    api().reset()
    expect(api().isFieldTouched('name')).toBe(false)
  })

  it('禁用时失焦不记触碰', () => {
    const { service, api } = mount({ defaultValues: { name: '' }, disabled: true })
    service.send({ type: 'FIELD.BLUR', name: 'name' })
    expect(api().isFieldTouched('name')).toBe(false)
  })
})

describe('不提交的校验', () => {
  const rules: FormSchema['props']['rules'] = {
    a: { required: true, message: '请填写甲' },
    b: { required: true, message: '请填写乙' },
  }

  it('validateAll 整表校验并整表替换错误表，不提交、不转失败态、不报 onInvalid', async () => {
    const onSubmit = vi.fn()
    const onInvalid = vi.fn()
    const { api } = mount({ defaultValues: { a: '', b: '有' }, rules, onSubmit, onInvalid })
    const result = await api().validateAll()
    expect(result).toEqual({ valid: false, errors: { a: '请填写甲' }, stale: false })
    expect(api().errors).toEqual({ a: '请填写甲' })
    expect(api().submitFailed).toBe(false)
    expect(onSubmit).not.toHaveBeenCalled()
    expect(onInvalid).not.toHaveBeenCalled()
  })

  it('validateField 只写回这一个字段；validateFields 把几个字段的结果并成一份', async () => {
    const { api } = mount({ defaultValues: { a: '', b: '' }, rules })
    expect(await api().validateField('a')).toEqual({ valid: false, errors: { a: '请填写甲' }, stale: false })
    expect(api().errors).toEqual({ a: '请填写甲' })
    expect(await api().validateFields(['a', 'b'])).toEqual({ valid: false, errors: { a: '请填写甲', b: '请填写乙' }, stale: false })
    api().setFieldValue('a', '有')
    expect(await api().validateFields(['a'])).toEqual({ valid: true, errors: {}, stale: false })
    expect(api().errors).toEqual({ b: '请填写乙' })
  })

  it('没有规则与 validate 时无可计算：直接回一个通过的空结果，不碰错误表', async () => {
    const { api } = mount({ defaultValues: { a: '' }, defaultErrors: { a: '服务端说不行' } })
    expect(await api().validateAll()).toEqual({ valid: true, errors: {}, stale: false })
    expect(await api().validateField('a')).toEqual({ valid: true, errors: {}, stale: false })
    expect(api().errors).toEqual({ a: '服务端说不行' })
  })

  it('校验结束前值被改：结果作废（stale），不写回错误表', async () => {
    const pending = deferred<string | undefined>()
    const { api } = mount({ defaultValues: { a: '' }, rules: { a: { validator: () => pending.promise } } })
    const request = api().validateField('a')
    api().setFieldValue('a', '改了')
    pending.resolve('甲有错')
    expect(await request).toEqual({ valid: false, errors: {}, stale: true })
    expect(api().errors).toEqual({})
  })

  it('校验器抛错：Promise 拒绝并交回原始原因，同时照常报 onValidationError', async () => {
    const cause = new Error('offline')
    const onValidationError = vi.fn()
    const { api } = mount({
      defaultValues: { a: '' },
      rules: { a: { validator: () => Promise.reject(cause) } },
      onValidationError,
    })
    await expect(api().validateField('a')).rejects.toBe(cause)
    expect(onValidationError).toHaveBeenCalledWith(expect.objectContaining({ cause, field: 'a' }))
  })
})

describe('只重置一个字段', () => {
  it('值、错误与触碰标记回到初始，别的字段不动', () => {
    const { service, api } = mount({ defaultValues: { a: '初值', b: '乙' } })
    api().setFieldValue('a', '改了')
    api().setFieldValue('b', '也改了')
    api().setFieldError('a', '有错')
    service.send({ type: 'FIELD.BLUR', name: 'a' })
    api().resetField('a')
    expect(api().getFieldValue('a')).toBe('初值')
    expect(api().getFieldError('a')).toBeUndefined()
    expect(api().isFieldTouched('a')).toBe(false)
    expect(api().getFieldValue('b')).toBe('也改了')
  })

  it('只读时不生效', () => {
    const { api } = mount({ defaultValues: { a: '初值' }, values: { a: '外部' }, readOnly: true })
    api().resetField('a')
    expect(api().getFieldValue('a')).toBe('外部')
  })
})

describe('依赖字段联动重验', () => {
  const rules: FormSchema['props']['rules'] = {
    password: { required: true, message: '请填写密码' },
    confirm: {
      validator: (value, values) => value !== values.password ? '两次输入不一致' : undefined,
      deps: ['password'],
    },
  }

  it('被触碰过的依赖方：依赖字段一改就重验（blur 档）', () => {
    const { service, api } = mount({ defaultValues: { password: 'a', confirm: 'a' }, rules, validateOn: 'blur' })
    api().setFieldValue('confirm', 'b')
    service.send({ type: 'FIELD.BLUR', name: 'confirm' })
    expect(api().getFieldError('confirm')).toBe('两次输入不一致')
    api().setFieldValue('password', 'b')
    expect(api().getFieldError('confirm')).toBeUndefined()
  })

  it('没被触碰也没挂错误的依赖方不重验，免得用户还没填就先报错', () => {
    const { api } = mount({ defaultValues: { password: 'a', confirm: '' }, rules, validateOn: 'blur' })
    api().setFieldValue('password', 'b')
    expect(api().getFieldError('confirm')).toBeUndefined()
  })

  it('submit 档：提交挂上的错误在依赖字段改了之后跟着重验', () => {
    const { api } = mount({ defaultValues: { password: 'a', confirm: 'b' }, rules })
    api().submit()
    expect(api().getFieldError('confirm')).toBe('两次输入不一致')
    api().setFieldValue('password', 'b')
    expect(api().getFieldError('confirm')).toBeUndefined()
  })
})

describe('提交在途', () => {
  it('onSubmit 返回 thenable：落定前 submitting 为真，提交钮报在途，再提交不发生', async () => {
    const pending = deferred<void>()
    const onSubmit = vi.fn(() => pending.promise)
    const { api } = mount({ defaultValues: { a: '有' }, onSubmit })
    api().submit()
    expect(api().submitting).toBe(true)
    expect(api().getSubmitTriggerProps()).toMatchObject({ 'aria-disabled': 'true', 'aria-busy': 'true', 'data-loading': '' })
    expect(api().getRootProps()).toMatchObject({ 'aria-busy': 'true' })
    api().submit()
    expect(onSubmit).toHaveBeenCalledTimes(1)
    pending.resolve()
    await vi.waitFor(() => expect(api().submitting).toBe(false))
    api().submit()
    expect(onSubmit).toHaveBeenCalledTimes(2)
  })

  it('thenable 拒绝经 onSubmitError 报出原始原因与这次提交的值', async () => {
    const cause = new Error('server')
    const onSubmitError = vi.fn()
    const { api } = mount({ defaultValues: { a: '有' }, onSubmit: () => Promise.reject(cause), onSubmitError })
    api().submit()
    await vi.waitFor(() => expect(api().submitting).toBe(false))
    expect(onSubmitError).toHaveBeenCalledWith({ cause, values: { a: '有' } })
  })

  it('同步返回照常：不进在途', () => {
    const { api } = mount({ defaultValues: { a: '有' }, onSubmit: () => {} })
    api().submit()
    expect(api().submitting).toBe(false)
    expect(api().getSubmitTriggerProps()).not.toHaveProperty('data-loading', '')
  })
})
