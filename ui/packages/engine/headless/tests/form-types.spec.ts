// 表单的值类型泛型：字段名、规则的键、按字段取写的值都按值类型收窄，写错编译即报错。
// 只有类型断言，由 typecheck（tsc -p tsconfig.test.json）判对错；写错的那几行靠 @ts-expect-error 证明确实报错。
import type { FormApi, FormFieldPath, FormPathValue, FormRules, FormSchema, FormStandardSchema } from '../src/form/index'
import { describe, expectTypeOf, it } from 'vitest'

interface SignUp {
  email: string
  age: number
  tags: string[]
  address: { city: string, zip?: string }
  items: { title: string, done: boolean }[]
}

describe('表单的值类型泛型', () => {
  it('字段名只能写值表的键；数组路径逐段只能写那一层真有的键或下标', () => {
    expectTypeOf<'email'>().toMatchTypeOf<FormFieldPath<SignUp>>()
    expectTypeOf<readonly ['items', number, 'title']>().toMatchTypeOf<FormFieldPath<SignUp>>()
    expectTypeOf<readonly ['address', 'city']>().toMatchTypeOf<FormFieldPath<SignUp>>()
    expectTypeOf<'emial'>().not.toMatchTypeOf<FormFieldPath<SignUp>>()
    expectTypeOf<readonly ['items', number, 'titel']>().not.toMatchTypeOf<FormFieldPath<SignUp>>()
    // 缺省的 FormValues 什么名字都收
    expectTypeOf<'anything'>().toMatchTypeOf<FormFieldPath<Record<string, unknown>>>()
  })

  it('按字段取写的值类型：字符串字段名取那一项，数组路径逐段往下走', () => {
    expectTypeOf<FormPathValue<SignUp, 'age'>>().toEqualTypeOf<number>()
    expectTypeOf<FormPathValue<SignUp, readonly ['items', 0, 'done']>>().toEqualTypeOf<boolean>()
    expectTypeOf<FormPathValue<SignUp, readonly ['address', 'zip']>>().toEqualTypeOf<string | undefined>()
    const use = (api: FormApi<never, SignUp>): void => {
      expectTypeOf(api.getFieldValue('age')).toEqualTypeOf<number | undefined>()
      api.setFieldValue(['items', 0, 'title'], 'x')
      // @ts-expect-error 年龄是数字
      api.setFieldValue('age', '18')
      // @ts-expect-error 字段名拼错
      api.validateField('emial')
    }
    expectTypeOf(use).toBeFunction()
  })

  it('规则的键只能写字段，validator 的参数是那个字段与整表的值类型', () => {
    const rules: FormRules<SignUp> = {
      email: { required: true },
      age: {
        validator: (value, values) => {
          expectTypeOf(value).toEqualTypeOf<number>()
          return values.email ? undefined : '先填邮箱'
        },
        deps: ['email'],
      },
    }
    // @ts-expect-error 字段名拼错
    const typo: FormRules<SignUp> = { emial: { required: true } }
    expectTypeOf([rules, typo]).toBeArray()
  })

  it('props 按值类型收窄：validate 交回的键只能写字段，onSubmit 拿到的是值类型', () => {
    const props: FormSchema<SignUp>['props'] = {
      defaultValues: { email: '', age: 0, tags: [], address: { city: '' }, items: [] },
      validate: values => ({ email: values.email ? undefined : '必填' }),
      onSubmit: ({ values }) => {
        expectTypeOf(values).toEqualTypeOf<SignUp>()
      },
    }
    // @ts-expect-error validate 交回的键拼错
    const typo: FormSchema<SignUp>['props'] = { validate: () => ({ emial: '必填' }) }
    expectTypeOf([props, typo]).toBeArray()
  })

  it('zod / valibot 那种带 types 的 Standard Schema 直接交得进 schema', () => {
    // 与 @standard-schema/spec 的 StandardSchemaV1<Input, Output> 同形：zod 4、valibot 1 的 schema 都满足它
    interface ZodLike<Input, Output> {
      readonly '~standard': {
        readonly version: 1
        readonly vendor: 'zod'
        readonly validate: (value: unknown) => { readonly value: Output, readonly issues?: undefined } | { readonly issues: ReadonlyArray<{ readonly message: string, readonly path?: ReadonlyArray<PropertyKey | { readonly key: PropertyKey }> }> } | Promise<never>
        readonly types?: { readonly input: Input, readonly output: Output }
      }
    }
    expectTypeOf<ZodLike<{ email: string }, { email: string }>>().toMatchTypeOf<FormStandardSchema>()
    expectTypeOf<ZodLike<{ email: string }, { email: string }>>().toMatchTypeOf<NonNullable<FormSchema<SignUp>['props']['schema']>>()
  })
})
