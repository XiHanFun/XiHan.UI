// @vitest-environment jsdom
// 字段组里没给值的录入控件按字段名读写表单的值：不写 v-model、不写作用域插槽也能用。
import type { FormValues } from '@xihan-ui/headless'
import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import { defineComponent, h, nextTick, ref } from 'vue'
import { XhFormFieldGroup, XhFormResetTrigger, XhFormRoot, XhSwitch, XhTextFieldRoot } from '../src'

let wrapper: ReturnType<typeof mount> | null = null

afterEach(() => {
  wrapper?.unmount()
  wrapper = null
  document.body.innerHTML = ''
})

/** 挂一张表单：values 记下每次值表变化，children 是字段组里的内容。 */
function mountForm(defaultValues: FormValues, children: () => ReturnType<typeof h>[]) {
  const values = ref<FormValues | null>(null)
  wrapper = mount(defineComponent({
    setup: () => () => h(XhFormRoot, {
      'defaultValues': defaultValues,
      'onUpdate:values': (next: FormValues) => {
        values.value = next
      },
    }, () => [...children(), h(XhFormResetTrigger, null, () => '重置')]),
  }), { attachTo: document.body })
  return values
}

async function type(input: HTMLInputElement, text: string): Promise<void> {
  input.value = text
  input.dispatchEvent(new Event('input', { bubbles: true }))
  await nextTick()
}

describe('字段组按字段名绑定控件的值', () => {
  it('文本框：初值取表单 defaultValues，输入写回表单', async () => {
    const values = mountForm({ title: '旧标题' }, () => [
      h(XhFormFieldGroup, { name: 'title' }, () => [h(XhTextFieldRoot)]),
    ])
    await nextTick()
    const input = document.querySelector<HTMLInputElement>('[data-scope="text-field"][data-part="input"]')!
    expect(input.value).toBe('旧标题')

    await type(input, '新标题')
    expect(values.value).toEqual({ title: '新标题' })
    expect(input.value).toBe('新标题')
  })

  it('开关走 checked 通道；表单重置后控件跟着回到初值', async () => {
    const values = mountForm({ notify: true }, () => [
      h(XhFormFieldGroup, { name: 'notify' }, () => [h(XhSwitch)]),
    ])
    await nextTick()
    const control = () => document.querySelector<HTMLElement>('[data-scope="switch"][role="switch"]')!
    expect(control().getAttribute('aria-checked')).toBe('true')

    control().click()
    await nextTick()
    expect(values.value).toEqual({ notify: false })
    expect(control().getAttribute('aria-checked')).toBe('false')

    document.querySelector<HTMLElement>('[data-scope="form"][data-part="reset-trigger"]')!.click()
    await nextTick()
    await nextTick()
    expect(control().getAttribute('aria-checked')).toBe('true')
  })

  it('实例自己给了 value 时不读也不写表单，手动接法照旧', async () => {
    const values = mountForm({ title: '表单里的' }, () => [
      h(XhFormFieldGroup, { name: 'title' }, () => [h(XhTextFieldRoot, { value: '实例的' })]),
    ])
    await nextTick()
    const input = document.querySelector<HTMLInputElement>('[data-scope="text-field"][data-part="input"]')!
    expect(input.value).toBe('实例的')
    await type(input, '改一下')
    expect(values.value).toBeNull()
  })

  it('不在字段组里的控件不接表单的值', async () => {
    const values = mountForm({ title: '表单里的' }, () => [h(XhTextFieldRoot)])
    await nextTick()
    const input = document.querySelector<HTMLInputElement>('[data-scope="text-field"][data-part="input"]')!
    expect(input.value).toBe('')
    await type(input, '随便写')
    expect(values.value).toBeNull()
  })
})
