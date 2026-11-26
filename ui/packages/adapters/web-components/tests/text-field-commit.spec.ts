// @vitest-environment jsdom
// TextField 的回车提交在 Web Components 上的接线：回车派 value-commit，输入法组合期间不派。
import { afterEach, describe, expect, it } from 'vitest'
import { defineXhElements } from '../src/define'

defineXhElements()

interface Host extends HTMLElement {
  updateComplete: Promise<unknown>
  [key: string]: unknown
}

afterEach(() => {
  document.body.replaceChildren()
})

async function settle(el: Host): Promise<void> {
  for (let i = 0; i < 4; i++) {
    await el.updateComplete
    await new Promise(r => setTimeout(r, 0))
  }
}

async function mountInForm(tag: string, props: Record<string, unknown>): Promise<{ form: HTMLFormElement, el: Host }> {
  const form = document.createElement('form')
  const el = document.createElement(tag) as Host
  Object.assign(el, props)
  form.append(el)
  document.body.append(form)
  await settle(el)
  return { form, el }
}

describe('text-field 回车提交', () => {
  it('回车派 value-commit，带当前值；输入法组合期间的回车不派', async () => {
    const { form, el } = await mountInForm('xh-text-field', { defaultValue: '曦寒' })
    const commits: unknown[] = []
    el.addEventListener('value-commit', event => commits.push((event as CustomEvent).detail))
    // 表单里的回车会触发隐式提交：组件不拦，这里由测试自己挡掉
    form.addEventListener('submit', event => event.preventDefault())
    const input = el.querySelector<HTMLInputElement>('[data-scope="text-field"][data-part="input"]')!
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, isComposing: true, keyCode: 229 }))
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
    expect(commits).toEqual([{ value: '曦寒' }])
  })
})
