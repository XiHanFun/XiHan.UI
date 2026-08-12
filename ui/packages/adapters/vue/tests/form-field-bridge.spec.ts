// @vitest-environment jsdom
// Form-Field 打通：XhFormFieldGroup 里的 XhFieldRoot 不写 props 也能从表单上下文
// 自取 invalid/required/disabled，错误文案插槽空着时自取该字段的错误；显式 props 仍然赢。
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import {
  XhFieldControl,
  XhFieldErrorText,
  XhFieldLabel,
  XhFieldRoot,
  XhFormFieldGroup,
  XhFormRoot,
  XhFormSubmitTrigger,
} from '../src'

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

function mountForm(formProps: Record<string, unknown>, fieldProps: Record<string, unknown> = {}): { submit: () => Promise<void> } {
  const host = document.createElement('div')
  document.body.appendChild(host)
  let doSubmit: (() => void) | undefined
  const app = createApp({
    setup: () => () =>
      h(XhFormRoot, formProps, {
        default: (slot: { submit: () => void }) => {
          doSubmit = slot.submit
          return [
            h(XhFormFieldGroup, { value: 'user' }, () => [
              h(XhFieldRoot, fieldProps, () => [
                h(XhFieldLabel, () => '用户名'),
                h(XhFieldControl, () => [h('input')]),
                h(XhFieldErrorText),
              ]),
            ]),
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
    submit: async () => {
      doSubmit!()
      await tick()
    },
  }
}

function el(selector: string): HTMLElement {
  const hit = document.querySelector<HTMLElement>(selector)
  if (!hit)
    throw new Error(`找不到 ${selector}`)
  return hit
}

describe('form-Field 打通', () => {
  it('规则 required：Field 自取必填与错误态，错误文案自动显出', async () => {
    const m = mountForm({ rules: { user: { required: true, message: '用户名不能为空' } } })
    await tick()
    const control = el('[data-scope="field"][data-part="control"]')
    expect(control.getAttribute('aria-required')).toBe('true')
    expect(el('[data-scope="field"][data-part="root"]').hasAttribute('data-required')).toBe(true)
    expect(el('[data-scope="field"][data-part="root"]').hasAttribute('data-invalid')).toBe(false)

    await m.submit()
    expect(el('[data-scope="field"][data-part="root"]').hasAttribute('data-invalid')).toBe(true)
    expect(control.getAttribute('aria-invalid')).toBe('true')
    const errorText = el('[data-scope="field"][data-part="error-text"]')
    expect(errorText.textContent).toBe('用户名不能为空')
    expect(errorText.hasAttribute('hidden')).toBe(false)
  })

  it('表单级 disabled 传导进 Field', async () => {
    mountForm({ disabled: true })
    await tick()
    expect(el('[data-scope="field"][data-part="root"]').hasAttribute('data-disabled')).toBe(true)
  })

  it('显式 props 赢过上下文：invalid=false 顶掉表单的错误态', async () => {
    const m = mountForm(
      { rules: { user: { required: true } } },
      { invalid: false },
    )
    await tick()
    await m.submit()
    expect(el('[data-scope="field"][data-part="root"]').hasAttribute('data-invalid')).toBe(false)
  })

  it('表单外单用不受影响：缺省全关', async () => {
    const host = document.createElement('div')
    document.body.appendChild(host)
    const app = createApp({
      setup: () => () =>
        h(XhFieldRoot, null, () => [
          h(XhFieldLabel, () => '独立字段'),
          h(XhFieldControl, () => [h('input')]),
        ]),
    })
    app.mount(host)
    cleanup.push(() => {
      app.unmount()
      host.remove()
    })
    await tick()
    const root = el('[data-scope="field"][data-part="root"]')
    expect(root.hasAttribute('data-invalid')).toBe(false)
    expect(root.hasAttribute('data-required')).toBe(false)
    expect(root.hasAttribute('data-disabled')).toBe(false)
  })
})
