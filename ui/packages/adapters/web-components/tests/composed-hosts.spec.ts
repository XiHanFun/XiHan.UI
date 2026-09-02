// @vitest-environment jsdom
// 覆盖宿主元素嵌套在其他元素内的场景，以及事件名与属性名和 HTML 全局名的冲突。
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { defineXhElements } from '../src/define'

defineXhElements()

async function settle(el: HTMLElement): Promise<void> {
  await (el as HTMLElement & { updateComplete: Promise<unknown> }).updateComplete
}

beforeEach(() => {
  document.body.innerHTML = ''
})

const PROMPT_INPUT_PARTS = '<textarea data-xh-part="input"></textarea><button data-xh-part="submit-trigger">发送</button>'

describe('xh-prompt-input 套在表单里', () => {
  it('提交事件不冒泡，外层 form 不会被真的提交', async () => {
    // submit 与原生表单提交同名，故不冒泡
    const form = document.createElement('form')
    const promptInput = document.createElement('xh-prompt-input')
    promptInput.innerHTML = PROMPT_INPUT_PARTS
    form.appendChild(promptInput)
    document.body.appendChild(form)
    await settle(promptInput)

    const onFormSubmit = vi.fn((e: Event) => e.preventDefault())
    const onPromptSubmit = vi.fn()
    form.addEventListener('submit', onFormSubmit)
    promptInput.addEventListener('submit', onPromptSubmit)

    const input = promptInput.querySelector('textarea')!
    input.value = '你好'
    input.dispatchEvent(new Event('input', { bubbles: true }))
    await settle(promptInput)

    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }))
    await settle(promptInput)

    expect(onPromptSubmit).toHaveBeenCalledTimes(1)
    expect((onPromptSubmit.mock.calls[0]![0] as CustomEvent).detail).toEqual({ value: '你好' })
    expect(onFormSubmit).not.toHaveBeenCalled()
  })

  it('value-change 与 stop 照常冒泡', async () => {
    // 只有 submit 不冒泡
    const wrap = document.createElement('div')
    const promptInput = document.createElement('xh-prompt-input')
    promptInput.innerHTML = PROMPT_INPUT_PARTS
    wrap.appendChild(promptInput)
    document.body.appendChild(wrap)
    await settle(promptInput)

    const onValueChange = vi.fn()
    wrap.addEventListener('value-change', onValueChange)

    const input = promptInput.querySelector('textarea')!
    input.value = '嗨'
    input.dispatchEvent(new Event('input', { bubbles: true }))
    await settle(promptInput)

    expect(onValueChange).toHaveBeenCalledTimes(1)
  })
})

describe('宿主元素不占用 HTML 全局属性', () => {
  it('xh-code-view 用 code-lang 而不是 lang', async () => {
    // lang 是 HTML 全局属性，用它会改变整块内容的自然语言标注
    const el = document.createElement('xh-code-view')
    el.setAttribute('code-lang', 'cs')
    el.setAttribute('code', 'var a = 1;')
    el.innerHTML = '<span data-xh-part="lang-label"></span><pre data-xh-part="pre"><code data-xh-part="code"></code></pre>'
    document.body.appendChild(el)
    await settle(el)

    expect(el.hasAttribute('lang')).toBe(false)
    expect(el.querySelector('[data-xh-part="code"]')?.getAttribute('data-lang')).toBe('cs')
  })
})
