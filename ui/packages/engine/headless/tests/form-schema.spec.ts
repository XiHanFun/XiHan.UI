// @vitest-environment jsdom
// 表单接 Standard Schema：只依赖接口。这里按 zod / valibot 报问题的形状手写一份 schema——路径段可以是裸键，
// 也可以是带 key 的对象——校验它的问题按路径落到字段上、与 validate 和 rules 的先后，以及异步 schema。
import type { FormSchema, FormStandardIssue, FormStandardSchema, FormValues } from '../src/form/index'
import { createService, normalizeProps } from '@xihan-ui/core'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'
import { describe, expect, it, vi } from 'vitest'
import { formIssuePath, formSchemaInput } from '../src/form/form.schema'
import { connectForm, createFormPathRecord, formMachine, getFormPathValue } from '../src/form/index'

/** 按一个检查函数造一份 Standard Schema；async 为真时结果晚一拍交回。 */
function schemaOf(check: (value: Record<string, unknown>) => FormStandardIssue[], async = false): FormStandardSchema {
  return {
    '~standard': {
      version: 1,
      vendor: 'test',
      validate: (value) => {
        const issues = check(value as Record<string, unknown>)
        const result = issues.length > 0 ? { issues } : { value }
        return async ? Promise.resolve(result) : result
      },
    },
  }
}

function makeService(props: FormSchema['props']) {
  const runtime = createVanillaRuntime()
  const service = createService(formMachine, { props: () => props, runtime })
  runtime.start()
  return { service, api: () => connectForm(service, normalizeProps) }
}

const microtask = (): Promise<void> => new Promise(resolve => setTimeout(resolve, 0))

describe('交给 schema 的值与问题的路径', () => {
  it('数组路径按段写进嵌套结构，字符串字段名照旧是对象上的键，值表本身不动', () => {
    const values = createFormPathRecord<unknown>([
      ['name', '赵一'],
      ['items', [{ title: 'a' }, { title: 'b' }]],
      [['items', 1, 'title'], 'B'],
      [['address', 'city'], '上海'],
    ]) as FormValues
    expect(formSchemaInput(values)).toEqual({ name: '赵一', items: [{ title: 'a' }, { title: 'B' }], address: { city: '上海' } })
    expect(getFormPathValue(values, 'items')).toEqual([{ title: 'a' }, { title: 'b' }])
  })

  it('一段的字符串路径即字段名，多段即数组路径；带 key 的对象段照样认；没有路径或认不出的记在空字段名下', () => {
    expect(formIssuePath({ message: 'x', path: ['email'] })).toBe('email')
    expect(formIssuePath({ message: 'x', path: [{ key: 'items' }, { key: 0 }, 'title'] })).toEqual(['items', 0, 'title'])
    expect(formIssuePath({ message: 'x', path: [0] })).toEqual([0])
    expect(formIssuePath({ message: 'x' })).toBe('')
    expect(formIssuePath({ message: 'x', path: [Symbol('s')] })).toBe('')
  })
})

describe('表单的 schema', () => {
  it('提交时 schema 的问题落到字段上并拦下提交；同字段报了几条只留第一条', () => {
    const onSubmit = vi.fn()
    const onInvalid = vi.fn()
    const { api } = makeService({
      defaultValues: { email: '', age: 3 },
      schema: schemaOf(() => [
        { message: '邮箱不能为空', path: ['email'] },
        { message: '邮箱格式不对', path: ['email'] },
        { message: '年龄至少 18', path: [{ key: 'age' }] },
      ]),
      onSubmit,
      onInvalid,
    })
    api().submit()
    expect(onSubmit).not.toHaveBeenCalled()
    expect(onInvalid).toHaveBeenCalledTimes(1)
    expect(api().getFieldError('email')).toBe('邮箱不能为空')
    expect(api().getFieldError('age')).toBe('年龄至少 18')
  })

  it('schema 通过即提交，交出去的是表单的值', () => {
    const onSubmit = vi.fn()
    const { api } = makeService({ defaultValues: { email: 'a@b.c' }, schema: schemaOf(() => []), onSubmit })
    api().submit()
    expect(onSubmit).toHaveBeenCalledWith({ values: { email: 'a@b.c' } })
  })

  it('同字段几边都报错：rules 的文案优先，其次 validate，再次 schema', () => {
    const { api } = makeService({
      defaultValues: { a: '', b: '', c: '' },
      schema: schemaOf(() => [{ message: 'schema-a', path: ['a'] }, { message: 'schema-b', path: ['b'] }, { message: 'schema-c', path: ['c'] }]),
      validate: () => ({ a: 'validate-a', b: 'validate-b' }),
      rules: { a: { required: true, message: 'rule-a' } },
    })
    api().submit()
    expect([api().getFieldError('a'), api().getFieldError('b'), api().getFieldError('c')]).toEqual(['rule-a', 'validate-b', 'schema-c'])
  })

  it('异步 schema：校验在途时 validating 为真，落定后写回错误', async () => {
    const { api } = makeService({ defaultValues: { name: '' }, schema: schemaOf(() => [{ message: '必填', path: ['name'] }], true) })
    api().submit()
    expect(api().validating).toBe(true)
    await microtask()
    expect(api().validating).toBe(false)
    expect(api().getFieldError('name')).toBe('必填')
  })

  it('validateField 只写回那一个字段；数组路径的问题落在数组路径的字段上', async () => {
    const { api } = makeService({
      defaultValues: createFormPathRecord<unknown>([['name', ''], ['items', [{ title: '' }]], [['items', 0, 'title'], '']]) as FormValues,
      schema: schemaOf(() => [{ message: '名字必填', path: ['name'] }, { message: '标题必填', path: ['items', 0, 'title'] }]),
    })
    const result = await api().validateField(['items', 0, 'title'])
    expect(result.valid).toBe(false)
    expect(api().getFieldError(['items', 0, 'title'])).toBe('标题必填')
    expect(api().getFieldError('name')).toBeUndefined()
  })
})
