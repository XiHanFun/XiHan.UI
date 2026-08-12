// @vitest-environment jsdom
// 声明式校验规则：required/min/max/pattern/type 首败即停、文案走 rule.message → validateMessages 模板 → 内置模板；
// validator 与 validate 都可异步（validating 置真、批次号防竞态），change 模式逐字段跑规则。
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import { XhFormFieldGroup, XhFormRoot, XhFormSubmitTrigger } from '../src'

async function tick(): Promise<void> {
  await nextTick()
  await nextTick()
  await new Promise(r => setTimeout(r, 0))
  await nextTick()
}

let cleanup: Array<() => void> = []

afterEach(() => {
  for (const fn of cleanup) fn()
  cleanup = []
  document.body.innerHTML = ''
})

interface SlotApi {
  errors: Record<string, string>
  validating: boolean
  setFieldValue: (name: string, value: unknown) => void
  submit: () => void
}

interface Mounted {
  api: () => SlotApi
  submit: () => Promise<void>
  onSubmit: ReturnType<typeof vi.fn>
  onInvalid: ReturnType<typeof vi.fn>
}

function mountForm(props: Record<string, unknown>): Mounted {
  const onSubmit = vi.fn()
  const onInvalid = vi.fn()
  let latest: SlotApi | undefined
  const host = document.createElement('div')
  document.body.appendChild(host)
  const app = createApp({
    setup: () => () =>
      h(XhFormRoot, { ...props, onSubmit, onInvalid }, {
        default: (slot: SlotApi) => {
          latest = slot
          return [
            h(XhFormFieldGroup, { value: 'user' }, () => []),
            h(XhFormSubmitTrigger, () => '提交'),
          ]
        },
      }),
  })
  app.mount(host)
  cleanup.push(() => {
    app.unmount()
    host.remove()
  })
  return {
    api: () => latest!,
    submit: async () => {
      latest!.submit()
      await tick()
    },
    onSubmit,
    onInvalid,
  }
}

describe('form 声明式规则', () => {
  it('required：空值拦下提交，文案走内置模板', async () => {
    const m = mountForm({ rules: { user: { required: true } } })
    await tick()
    await m.submit()
    expect(m.onSubmit).not.toHaveBeenCalled()
    expect(m.onInvalid).toHaveBeenCalledWith(expect.objectContaining({
      errors: { user: 'user is required' },
    }))
    expect(m.api().errors.user).toBe('user is required')
  })

  it('min 长度：validateMessages 模板代入 {name}/{min}，rule.message 赢过模板', async () => {
    const m = mountForm({
      defaultValues: { user: 'ab', mail: 'x' },
      rules: {
        user: { min: 3 },
        mail: { min: 5, message: '邮箱太短' },
      },
      validateMessages: { minLength: '{name}至少{min}位' },
    })
    await tick()
    await m.submit()
    expect(m.api().errors.user).toBe('user至少3位')
    expect(m.api().errors.mail).toBe('邮箱太短')
  })

  it('type 与 pattern：首败即停，一个字段只报第一条', async () => {
    const m = mountForm({
      defaultValues: { user: 'not-an-email' },
      rules: { user: [{ type: 'email' }, { pattern: /^@/ }] },
    })
    await tick()
    await m.submit()
    expect(m.api().errors.user).toBe('user is not a valid email')
  })

  it('数值类型的 min/max 按数值比：字符串数字也认', async () => {
    const m = mountForm({
      defaultValues: { user: '9' },
      rules: { user: { type: 'integer', min: 18 } },
    })
    await tick()
    await m.submit()
    expect(m.api().errors.user).toBe('user must be at least 18')
  })

  it('非必填规则对空值放行', async () => {
    const m = mountForm({
      defaultValues: { user: '' },
      rules: { user: { min: 3, type: 'email' } },
    })
    await tick()
    await m.submit()
    expect(m.onSubmit).toHaveBeenCalled()
  })

  it('异步 validator：validating 置真，失败落错、修好后放行', async () => {
    const m = mountForm({
      defaultValues: { user: 'taken' },
      rules: {
        user: {
          validator: async (value) => {
            await new Promise(r => setTimeout(r, 20))
            return value === 'taken' ? '已被占用' : undefined
          },
        },
      },
    })
    await tick()
    m.api().submit()
    await nextTick()
    expect(m.api().validating).toBe(true)
    await new Promise(r => setTimeout(r, 40))
    await tick()
    expect(m.api().validating).toBe(false)
    expect(m.api().errors.user).toBe('已被占用')
    expect(m.onInvalid).toHaveBeenCalled()

    m.api().setFieldValue('user', 'fresh')
    await tick()
    await m.submit()
    await new Promise(r => setTimeout(r, 40))
    await tick()
    expect(m.onSubmit).toHaveBeenCalledWith({ values: { user: 'fresh' } })
  })

  it('竞态：后一次提交把前一次没跑完的结果整批作废', async () => {
    let release!: (msg: string | undefined) => void
    const slow = new Promise<string | undefined>((r) => {
      release = r
    })
    let round = 0
    const m = mountForm({
      defaultValues: { user: 'x' },
      rules: {
        user: {
          validator: () => {
            round++
            return round === 1 ? slow : Promise.resolve(undefined)
          },
        },
      },
    })
    await tick()
    m.api().submit()
    await nextTick()
    m.api().submit()
    await new Promise(r => setTimeout(r, 20))
    await tick()
    expect(m.onSubmit).toHaveBeenCalledTimes(1)
    // 旧批次这才回来：不落错、不再触发回调
    release('过期错误')
    await new Promise(r => setTimeout(r, 20))
    await tick()
    expect(m.api().errors.user).toBeUndefined()
    expect(m.onInvalid).not.toHaveBeenCalled()
  })

  it('change 模式：逐字段跑规则，改坏即报、改好即清', async () => {
    const m = mountForm({
      defaultValues: { user: 'ok-name' },
      validateOn: 'change',
      rules: { user: { required: true } },
    })
    await tick()
    m.api().setFieldValue('user', '')
    await tick()
    expect(m.api().errors.user).toBe('user is required')
    m.api().setFieldValue('user', 'back')
    await tick()
    expect(m.api().errors.user).toBeUndefined()
  })

  it('rules 与 validate 并用：同字段规则文案赢，validate 补跨字段的错', async () => {
    const m = mountForm({
      defaultValues: { user: '', other: 'x' },
      rules: { user: { required: true } },
      validate: () => ({ user: '来自 validate', other: '另一条' }),
    })
    await tick()
    await m.submit()
    expect(m.api().errors.user).toBe('user is required')
    expect(m.api().errors.other).toBe('另一条')
  })
})
