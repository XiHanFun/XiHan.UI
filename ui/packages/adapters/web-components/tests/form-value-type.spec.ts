// @vitest-environment jsdom
// xh-form 的值类型与 schema：`querySelector<XhFormElement<V>>` 拿到的元素按 V 收窄 values、rules 与按字段取写的命令；
// schema 经 property 交进去，它报的问题按路径落到字段上并拦下提交。
import type { FormStandardIssue, FormStandardSchema } from '@xihan-ui/headless'
import type { XhFormElement } from '../src/elements/form'
import { afterEach, beforeAll, describe, expect, expectTypeOf, it, vi } from 'vitest'
import { defineXhElements } from '../src/define'

interface SignUp {
  email: string
  age: number
}

/** 按一个检查函数造一份 Standard Schema（zod、valibot 的 schema 都带着这个接口）。 */
function schemaOf(check: (value: Record<string, unknown>) => FormStandardIssue[]): FormStandardSchema {
  return {
    '~standard': {
      version: 1,
      vendor: 'test',
      validate: (value) => {
        const issues = check(value as Record<string, unknown>)
        return issues.length > 0 ? { issues } : { value }
      },
    },
  }
}

beforeAll(() => defineXhElements())
afterEach(() => {
  document.body.innerHTML = ''
})

describe('xh-form 的值类型与 schema', () => {
  it('元素按值类型收窄 values、rules 与按字段取写的命令', () => {
    const assign = (el: XhFormElement<SignUp>): void => {
      el.defaultValues = { email: '', age: 0 }
      el.rules = { email: { required: true } }
      expectTypeOf(el.getFieldValue('age')).toEqualTypeOf<number | undefined>()
      // @ts-expect-error 年龄是数字
      el.setFieldValue('age', '18')
      // @ts-expect-error 规则的字段名拼错
      el.rules = { emial: { required: true } }
    }
    expectTypeOf(assign).toBeFunction()
  })

  it('schema 的问题按路径落到字段上并拦下提交；通过即提交表单的值', async () => {
    const element = document.createElement('xh-form') as XhFormElement<{ email: string }>
    element.innerHTML = '<form data-xh-part="root"><div data-xh-part="field-group" name="email"></div><button data-xh-part="submit-trigger">提交</button></form>'
    element.defaultValues = { email: '' }
    element.schema = schemaOf(value => (value.email ? [] : [{ message: '邮箱必填', path: ['email'] }]))
    const onSubmit = vi.fn()
    const onInvalid = vi.fn()
    element.addEventListener('submit', onSubmit)
    element.addEventListener('invalid', onInvalid)
    document.body.append(element)
    await vi.waitFor(() => expect(element.querySelector('[data-part=root]')).not.toBeNull())

    element.submit()
    await vi.waitFor(() => expect(onInvalid).toHaveBeenCalledTimes(1))
    expect(onSubmit).not.toHaveBeenCalled()
    expect(element.getFieldError('email')).toBe('邮箱必填')

    element.setFieldValue('email', 'a@b.c')
    element.submit()
    await vi.waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
    expect((onSubmit.mock.calls[0]![0] as CustomEvent).detail).toEqual({ values: { email: 'a@b.c' } })
  })
})
