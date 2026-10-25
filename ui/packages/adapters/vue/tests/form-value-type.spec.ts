// @vitest-environment jsdom
// 表单的值类型泛型与 schema。模板里 Volar 照组件的构造签名推断值类型，这里用同一条路断言：按 defaultValues 推断，
// rules 与 validate 交回的键只能写字段；defineFormFields 拿到的字段组按 name 收窄插槽里的值。
// `h()` 推断不了泛型，按缺省的值表收；schema 经它照常交进去，问题按路径落到字段上。类型断言由 typecheck 判。
import type { FormStandardIssue, FormStandardSchema } from '@xihan-ui/headless'
import { afterEach, describe, expect, expectTypeOf, it, vi } from 'vitest'
import { createApp, h, nextTick } from 'vue'
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

async function tick(): Promise<void> {
  await nextTick()
  await new Promise(r => setTimeout(r, 0))
  await nextTick()
}

afterEach(() => {
  document.body.innerHTML = ''
})

describe('xhFormRoot 的值类型泛型', () => {
  it('按 defaultValues 推断值类型：rules 与 validate 交回的键只能写字段，onSubmit 拿到值类型', () => {
    const typed = (initial: SignUp): void => {
      void new XhFormRoot({
        defaultValues: initial,
        rules: { email: { required: true } },
        validate: values => ({ age: values.age >= 18 ? undefined : '未成年' }),
        onSubmit: ({ values }) => {
          expectTypeOf(values).toEqualTypeOf<SignUp>()
        },
      })
      // @ts-expect-error 规则的字段名拼错
      void new XhFormRoot({ defaultValues: initial, rules: { emial: { required: true } } })
    }
    expectTypeOf(typed).toBeFunction()
  })

  it('defineFormFields：name 只能写字段，插槽里的值按 name 收窄', () => {
    const { FieldGroup, ErrorSummaryItem } = defineFormFields<SignUp>()
    const typed = (): void => {
      const group = new FieldGroup({ name: 'age' })
      expectTypeOf(group.$slots.default).parameter(0).toHaveProperty('value').toEqualTypeOf<number | undefined>()
      void new ErrorSummaryItem({ name: 'email' })
      // @ts-expect-error 字段名拼错
      void new FieldGroup({ name: 'emial' })
    }
    expectTypeOf(typed).toBeFunction()
  })

  it('schema 的问题按路径落到字段上并拦下提交；通过即提交表单的值', async () => {
    const onSubmit = vi.fn()
    const onInvalid = vi.fn()
    let slot: { errors: Record<string, string>, setFieldValue: (name: string, value: unknown) => void } | undefined
    const app = createApp({
      setup: () => () =>
        h(XhFormRoot, {
          defaultValues: { email: '' },
          schema: schemaOf(value => (value.email ? [] : [{ message: '邮箱必填', path: [{ key: 'email' }] }])),
          onSubmit,
          onInvalid,
        }, {
          default: (props: NonNullable<typeof slot>) => {
            slot = props
            return [h(XhFormFieldGroup, { name: 'email' }, () => []), h(XhFormSubmitTrigger, () => '提交')]
          },
        }),
    })
    app.mount(document.body.appendChild(document.createElement('div')))
    await tick()
    document.querySelector<HTMLButtonElement>('[data-part="submit-trigger"]')!.click()
    await tick()
    expect(onInvalid).toHaveBeenCalledTimes(1)
    expect(onSubmit).not.toHaveBeenCalled()
    expect(slot!.errors).toEqual({ email: '邮箱必填' })
    slot!.setFieldValue('email', 'a@b.c')
    await tick()
    document.querySelector<HTMLButtonElement>('[data-part="submit-trigger"]')!.click()
    await tick()
    expect(onSubmit).toHaveBeenLastCalledWith({ values: { email: 'a@b.c' } })
    app.unmount()
  })
})
