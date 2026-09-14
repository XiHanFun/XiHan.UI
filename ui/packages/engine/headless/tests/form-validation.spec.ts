// @vitest-environment jsdom
import type { FormSchema } from '../src/form/form.types'
import { createService } from '@xihan-ui/core'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'
import { afterEach, describe, expect, it, vi } from 'vitest'
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
  return { service, runtime, setProps: (next: Partial<FormSchema['props']>) => props.set({ ...props.get(), ...next }) }
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

describe('表单校验批次与值快照', () => {
  it('同一快照的两个字段并行校验，先完成的字段不清掉另一项的忙碌态', async () => {
    const a = deferred<string | undefined>()
    const b = deferred<string | undefined>()
    const { service } = mount({
      defaultValues: { a: '甲', b: '乙' },
      validateOn: 'blur',
      rules: { a: { validator: () => a.promise }, b: { validator: () => b.promise } },
    })
    service.send({ type: 'FIELD.BLUR', name: 'a' })
    service.send({ type: 'FIELD.BLUR', name: 'b' })
    expect(service.context.get('validating')).toBe(true)

    a.resolve('甲有错')
    await vi.waitFor(() => expect(service.context.get('errors')).toEqual({ a: '甲有错' }))
    expect(service.context.get('validating')).toBe(true)
    b.resolve('乙有错')
    await vi.waitFor(() => expect(service.context.get('validating')).toBe(false))
    expect(service.context.get('errors')).toEqual({ a: '甲有错', b: '乙有错' })
  })

  it('同步字段校验结束时，其他字段的异步校验仍在进行', async () => {
    const pending = deferred<string | undefined>()
    const { service } = mount({
      defaultValues: { a: '甲', b: '' },
      validateOn: 'blur',
      rules: { a: { validator: () => pending.promise }, b: { required: true, message: '请填写乙' } },
    })
    service.send({ type: 'FIELD.BLUR', name: 'a' })
    service.send({ type: 'FIELD.BLUR', name: 'b' })
    expect(service.context.get('errors')).toEqual({ b: '请填写乙' })
    expect(service.context.get('validating')).toBe(true)
    pending.resolve(undefined)
    await vi.waitFor(() => expect(service.context.get('validating')).toBe(false))
  })

  it('任意字段变值都撤销旧快照，不接受其他字段晚到的错误', async () => {
    const pending = deferred<string | undefined>()
    const onErrorsChange = vi.fn()
    const { service } = mount({
      defaultValues: { a: '甲', b: '乙' },
      validateOn: 'blur',
      onErrorsChange,
      rules: { a: { validator: () => pending.promise } },
    })
    service.send({ type: 'FIELD.BLUR', name: 'a' })
    service.send({ type: 'FIELD.SET', name: 'b', value: '新的乙' })
    expect(service.context.get('validating')).toBe(false)
    pending.resolve('旧快照错误')
    await pending.promise
    await new Promise<void>(resolve => setTimeout(resolve, 0))
    expect(service.context.get('errors')).toEqual({})
    expect(onErrorsChange).not.toHaveBeenCalled()
  })

  it('提交校验中变值，旧结果不提交，也不自动重提新值', async () => {
    const pending = deferred<Record<string, string>>()
    const validate = vi.fn(() => pending.promise)
    const onSubmit = vi.fn()
    const { service } = mount({ defaultValues: { a: '旧值' }, validate, onSubmit })
    service.send({ type: 'SUBMIT' })
    service.send({ type: 'FIELD.SET', name: 'a', value: '新值' })
    expect(service.context.get('validating')).toBe(false)
    pending.resolve({})
    await pending.promise
    await new Promise<void>(resolve => setTimeout(resolve, 0))
    expect(onSubmit).not.toHaveBeenCalled()
    expect(validate).toHaveBeenCalledTimes(1)
  })

  it('受控值从外部更新也立即使旧快照失效', async () => {
    const pending = deferred<Record<string, string>>()
    const onSubmit = vi.fn()
    const { service, setProps } = mount({ values: { a: '旧值' }, validate: () => pending.promise, onSubmit })
    service.send({ type: 'SUBMIT' })
    setProps({ values: { a: '新值' } })
    await vi.waitFor(() => expect(service.context.get('validating')).toBe(false))
    pending.resolve({})
    await pending.promise
    await new Promise<void>(resolve => setTimeout(resolve, 0))
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('同字段新校验替代旧校验，旧结果既不改错误也不结束新忙碌态', async () => {
    const old = deferred<string | undefined>()
    const latest = deferred<string | undefined>()
    const validator = vi.fn().mockReturnValueOnce(old.promise).mockReturnValueOnce(latest.promise)
    const { service } = mount({ defaultValues: { a: '甲' }, validateOn: 'blur', rules: { a: { validator } } })
    service.send({ type: 'FIELD.BLUR', name: 'a' })
    service.send({ type: 'FIELD.BLUR', name: 'a' })
    old.resolve('旧错误')
    await old.promise
    await new Promise<void>(resolve => setTimeout(resolve, 0))
    expect(service.context.get('errors')).toEqual({})
    expect(service.context.get('validating')).toBe(true)
    latest.resolve(undefined)
    await vi.waitFor(() => expect(service.context.get('validating')).toBe(false))
  })

  it('受控字段正常写回后，change 启动的新校验保留有效资格', async () => {
    const pending = deferred<string | undefined>()
    const mounted = mount({
      values: { a: '旧值' },
      validateOn: 'change',
      rules: { a: { validator: () => pending.promise } },
      onValuesChange: ({ values }) => mounted.setProps({ values }),
    })
    mounted.service.send({ type: 'FIELD.SET', name: 'a', value: '新值' })
    expect(mounted.service.context.get('validating')).toBe(true)
    pending.resolve('新值错误')
    await vi.waitFor(() => expect(mounted.service.context.get('errors')).toEqual({ a: '新值错误' }))
    expect(mounted.service.context.get('validating')).toBe(false)
  })

  it('仅受控对象身份变化而值相同，不撤销有效校验', async () => {
    const pending = deferred<Record<string, string>>()
    const onSubmit = vi.fn()
    const { service, setProps } = mount({ values: { a: '同值' }, validate: () => pending.promise, onSubmit })
    service.send({ type: 'SUBMIT' })
    setProps({ values: { a: '同值' } })
    await new Promise<void>(resolve => setTimeout(resolve, 0))
    expect(service.context.get('validating')).toBe(true)
    pending.resolve({})
    await vi.waitFor(() => expect(onSubmit).toHaveBeenCalledWith({ values: { a: '同值' } }))
  })

  it('整表提交取代旧字段校验，旧字段结果不能覆盖提交结果', async () => {
    const old = deferred<string | undefined>()
    const validator = vi.fn().mockReturnValueOnce(old.promise).mockReturnValue(undefined)
    const onSubmit = vi.fn()
    const { service } = mount({ defaultValues: { a: '甲' }, validateOn: 'blur', rules: { a: { validator } }, onSubmit })
    service.send({ type: 'FIELD.BLUR', name: 'a' })
    service.send({ type: 'SUBMIT' })
    expect(onSubmit).toHaveBeenCalledTimes(1)
    old.resolve('旧错误')
    await old.promise
    await new Promise<void>(resolve => setTimeout(resolve, 0))
    expect(service.context.get('errors')).toEqual({})
  })

  it.each(['reset', 'unmount'])('%s 使所有校验失效，晚到结果不写回也不提交', async (operation) => {
    const pending = deferred<Record<string, string>>()
    const onSubmit = vi.fn()
    const onErrorsChange = vi.fn()
    const { service, runtime } = mount({ validate: () => pending.promise, onSubmit, onErrorsChange })
    service.send({ type: 'SUBMIT' })
    if (operation === 'reset')
      service.send({ type: 'RESET' })
    else
      runtime.stop()
    expect(service.context.get('validating')).toBe(false)
    pending.resolve({ a: '晚到错误' })
    await pending.promise
    await new Promise<void>(resolve => setTimeout(resolve, 0))
    expect(onErrorsChange).not.toHaveBeenCalled()
    expect(onSubmit).not.toHaveBeenCalled()
    expect(service.context.get('errors')).toEqual({})
  })
})

describe('表单校验执行异常', () => {
  it.each(['rule', 'validate'])('先启动的异步规则在后续 %s 同步抛错后仍有拒绝处理', async (source) => {
    const pending = deferred<string | undefined>()
    const cause = new Error('后续同步校验失败')
    const fail = (): never => {
      throw cause
    }
    const onValidationError = vi.fn()
    const { service } = mount({
      defaultValues: { a: '甲', b: '乙' },
      rules: {
        a: { validator: () => pending.promise },
        ...(source === 'rule' ? { b: { validator: fail } } : {}),
      },
      ...(source === 'validate' ? { validate: fail } : {}),
      onValidationError,
    })
    service.send({ type: 'SUBMIT' })
    await vi.waitFor(() => expect(onValidationError).toHaveBeenCalledTimes(1))
    expect(service.context.get('validationError')?.cause).toBe(cause)
    pending.reject(new Error('已经失效的异步规则失败'))
    await new Promise<void>(resolve => setTimeout(resolve, 0))
    expect(onValidationError).toHaveBeenCalledTimes(1)
    expect(service.context.get('validating')).toBe(false)
  })

  it.each([
    ['submit', 'throw'],
    ['submit', 'reject'],
    ['field', 'throw'],
    ['field', 'reject'],
  ] as const)('%s 校验的 %s 进入独立异常状态并发事件，不伪装成字段错误', async (source, mode) => {
    const cause = new Error('校验服务不可用')
    const fail = () => {
      if (mode === 'throw')
        throw cause
      return Promise.reject(cause)
    }
    const onValidationError = vi.fn()
    const onSubmit = vi.fn()
    const onInvalid = vi.fn()
    const { service } = mount({
      defaultValues: { a: '甲' },
      validateOn: 'blur',
      ...(source === 'submit' ? { validate: fail } : { rules: { a: { validator: fail } } }),
      onValidationError,
      onSubmit,
      onInvalid,
    })
    expect(() => service.send(source === 'submit' ? { type: 'SUBMIT' } : { type: 'FIELD.BLUR', name: 'a' })).not.toThrow()
    await vi.waitFor(() => expect(onValidationError).toHaveBeenCalledTimes(1))
    const details = { cause, values: { a: '甲' }, field: source === 'submit' ? null : 'a' }
    expect(service.context.get('validationError')).toEqual(details)
    expect(onValidationError).toHaveBeenCalledWith(details)
    expect(service.context.get('validating')).toBe(false)
    expect(service.context.get('errors')).toEqual({})
    expect(onSubmit).not.toHaveBeenCalled()
    expect(onInvalid).not.toHaveBeenCalled()
    expect(service.getStatus()).toBe('Started')
  })

  it('没有订阅异常事件时仍保留原始异常状态，不提供虚假的默认错误文案', async () => {
    const pending = deferred<Record<string, string>>()
    const { service } = mount({ validate: () => pending.promise })
    service.send({ type: 'SUBMIT' })
    pending.reject(null)
    await vi.waitFor(() => expect(service.context.get('validationError')).toEqual({ cause: null, values: {}, field: null }))
    expect(service.context.get('validating')).toBe(false)
  })

  it('重新校验清除旧异常，成功后只发提交事件', async () => {
    const cause = new Error('暂时失败')
    const retry = deferred<Record<string, string>>()
    const validate = vi.fn().mockRejectedValueOnce(cause).mockReturnValueOnce(retry.promise)
    const onSubmit = vi.fn()
    const { service } = mount({ validate, onSubmit })
    service.send({ type: 'SUBMIT' })
    await vi.waitFor(() => expect(service.context.get('validationError')?.cause).toBe(cause))
    service.send({ type: 'SUBMIT' })
    expect(service.context.get('validationError')).toBeNull()
    expect(service.context.get('validating')).toBe(true)
    retry.resolve({})
    await vi.waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
    expect(service.context.get('validationError')).toBeNull()
  })

  it.each(['change', 'controlled', 'reset'])('%s 清除属于旧值的异常状态', async (operation) => {
    const cause = new Error('失败')
    const { service, setProps } = mount({
      ...(operation === 'controlled' ? { values: { a: '旧值' } } : { defaultValues: { a: '旧值' } }),
      validate: () => { throw cause },
    })
    service.send({ type: 'SUBMIT' })
    expect(service.context.get('validationError')?.cause).toBe(cause)
    if (operation === 'reset')
      service.send({ type: 'RESET' })
    else if (operation === 'controlled')
      setProps({ values: { a: '新值' } })
    else
      service.send({ type: 'FIELD.SET', name: 'a', value: '新值' })
    await vi.waitFor(() => expect(service.context.get('validationError')).toBeNull())
  })

  it('过期或卸载任务的拒绝被接收，但不写回状态或发异常事件', async () => {
    const pending = deferred<Record<string, string>>()
    const onValidationError = vi.fn()
    const { service, runtime } = mount({ validate: () => pending.promise, onValidationError })
    service.send({ type: 'SUBMIT' })
    runtime.stop()
    pending.reject(new Error('卸载后失败'))
    await new Promise<void>(resolve => setTimeout(resolve, 0))
    expect(onValidationError).not.toHaveBeenCalled()
    expect(service.context.get('validationError')).toBeNull()
  })

  it('一个字段执行异常撤销同快照的其他任务，不被随后结果覆盖', async () => {
    const a = deferred<string | undefined>()
    const b = deferred<string | undefined>()
    const cause = new Error('甲的服务失败')
    const onValidationError = vi.fn()
    const { service } = mount({
      defaultValues: { a: '甲', b: '乙' },
      validateOn: 'blur',
      rules: { a: { validator: () => a.promise }, b: { validator: () => b.promise } },
      onValidationError,
    })
    service.send({ type: 'FIELD.BLUR', name: 'a' })
    service.send({ type: 'FIELD.BLUR', name: 'b' })
    a.reject(cause)
    await vi.waitFor(() => expect(service.context.get('validationError')?.cause).toBe(cause))
    expect(service.context.get('validating')).toBe(false)
    b.reject(new Error('乙晚到的失败'))
    await new Promise<void>(resolve => setTimeout(resolve, 0))
    expect(onValidationError).toHaveBeenCalledTimes(1)
    expect(service.context.get('validationError')?.cause).toBe(cause)
  })
})
