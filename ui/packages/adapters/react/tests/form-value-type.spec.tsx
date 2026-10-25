// @vitest-environment jsdom
// 表单的值类型泛型与 schema：按 defaultValues 推断值类型，rules 与 validate 交回的键只能写字段，children 里按字段取写的值按它收窄；
// defineFormFields 拿到的字段组按 name 收窄 children 里的值。schema 的问题按路径落到字段上并拦下提交。
import type { FormStandardIssue, FormStandardSchema } from '@xihan-ui/headless'
import type { ReactNode } from 'react'
import type { FormRootSlotProps } from '../src'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, expectTypeOf, it, vi } from 'vitest'
import { defineFormFields, XhFormFieldGroup, XhFormRoot, XhFormSubmitTrigger } from '../src'

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

let root: ReturnType<typeof createRoot> | null = null

beforeEach(() => {
  ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
})

afterEach(() => {
  act(() => root?.unmount())
  root = null
  document.body.innerHTML = ''
})

describe('xhFormRoot 的值类型泛型', () => {
  it('按 defaultValues 推断值类型：rules 与 validate 交回的键只能写字段，onSubmit 与 children 拿到值类型', () => {
    const typed = (initial: SignUp): ReactNode => (
      <>
        <XhFormRoot
          defaultValues={initial}
          rules={{ email: { required: true } }}
          validate={values => ({ age: values.age >= 18 ? undefined : '未成年' })}
          onSubmit={({ values }) => {
            expectTypeOf(values).toEqualTypeOf<SignUp>()
          }}
        >
          {(api) => {
            expectTypeOf(api.values.age).toEqualTypeOf<number>()
            // @ts-expect-error 年龄是数字
            api.setFieldValue('age', '18')
            return null
          }}
        </XhFormRoot>
        {/* @ts-expect-error 规则的字段名拼错 */}
        <XhFormRoot defaultValues={initial} rules={{ emial: { required: true } }} />
      </>
    )
    expectTypeOf(typed).toBeFunction()
  })

  it('defineFormFields：name 只能写字段，children 里的值按 name 收窄', () => {
    const { FieldGroup, ErrorSummaryItem } = defineFormFields<SignUp>()
    const typed = (): ReactNode => (
      <>
        <FieldGroup name="age">
          {({ value, setValue }) => {
            expectTypeOf(value).toEqualTypeOf<number | undefined>()
            setValue(18)
            return null
          }}
        </FieldGroup>
        <ErrorSummaryItem name="email" />
        {/* @ts-expect-error 字段名拼错 */}
        <FieldGroup name="emial" />
      </>
    )
    expectTypeOf(typed).toBeFunction()
  })

  it('schema 的问题按路径落到字段上并拦下提交；通过即提交表单的值', async () => {
    const onSubmit = vi.fn()
    const onInvalid = vi.fn()
    let api: FormRootSlotProps<{ email: string }> | undefined
    root = createRoot(document.body.appendChild(document.createElement('div')))
    await act(async () => {
      root!.render(
        <XhFormRoot
          defaultValues={{ email: '' }}
          schema={schemaOf(value => (value.email ? [] : [{ message: '邮箱必填', path: [{ key: 'email' }] }]))}
          onSubmit={onSubmit}
          onInvalid={onInvalid}
        >
          {(slot) => {
            api = slot
            return (
              <>
                <XhFormFieldGroup name="email" />
                <XhFormSubmitTrigger>提交</XhFormSubmitTrigger>
              </>
            )
          }}
        </XhFormRoot>,
      )
    })
    const submit = (): HTMLButtonElement => document.querySelector<HTMLButtonElement>('[data-part="submit-trigger"]')!
    await act(async () => submit().click())
    expect(onInvalid).toHaveBeenCalledTimes(1)
    expect(onSubmit).not.toHaveBeenCalled()
    expect(api!.errors).toEqual({ email: '邮箱必填' })
    await act(async () => api!.setFieldValue('email', 'a@b.c'))
    await act(async () => submit().click())
    expect(onSubmit).toHaveBeenLastCalledWith({ values: { email: 'a@b.c' } })
  })
})
