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

describe('xh-composer 套在表单里', () => {
  it('提交事件不冒泡，外层 form 不会被真的提交', async () => {
    // submit 与原生表单提交同名，故不冒泡
    const form = document.createElement('form')
    const composer = document.createElement('xh-composer')
    composer.innerHTML = '<textarea data-xh-part="input"></textarea><button data-xh-part="submit-trigger">发送</button>'
    form.appendChild(composer)
    document.body.appendChild(form)
    await settle(composer)

    const onFormSubmit = vi.fn((e: Event) => e.preventDefault())
    const onComposerSubmit = vi.fn()
    form.addEventListener('submit', onFormSubmit)
    composer.addEventListener('submit', onComposerSubmit)

    const input = composer.querySelector('textarea')!
    input.value = '你好'
    input.dispatchEvent(new Event('input', { bubbles: true }))
    await settle(composer)

    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }))
    await settle(composer)

    expect(onComposerSubmit).toHaveBeenCalledTimes(1)
    expect((onComposerSubmit.mock.calls[0]![0] as CustomEvent).detail).toEqual({ value: '你好' })
    expect(onFormSubmit).not.toHaveBeenCalled()
  })

  it('value-change 与 stop 照常冒泡', async () => {
    // 只有 submit 不冒泡
    const wrap = document.createElement('div')
    const composer = document.createElement('xh-composer')
    composer.innerHTML = '<textarea data-xh-part="input"></textarea><button data-xh-part="submit-trigger">发送</button>'
    wrap.appendChild(composer)
    document.body.appendChild(wrap)
    await settle(composer)

    const onValueChange = vi.fn()
    wrap.addEventListener('value-change', onValueChange)

    const input = composer.querySelector('textarea')!
    input.value = '嗨'
    input.dispatchEvent(new Event('input', { bubbles: true }))
    await settle(composer)

    expect(onValueChange).toHaveBeenCalledTimes(1)
  })
})

describe('宿主元素不占用 HTML 全局属性', () => {
  it('xh-code-block 用 code-lang 而不是 lang', async () => {
    // lang 是 HTML 全局属性，用它会改变整块内容的自然语言标注
    const el = document.createElement('xh-code-block')
    el.setAttribute('code-lang', 'cs')
    el.setAttribute('code', 'var a = 1;')
    el.innerHTML = '<span data-xh-part="lang-label"></span><pre data-xh-part="pre"><code data-xh-part="code"></code></pre>'
    document.body.appendChild(el)
    await settle(el)

    expect(el.hasAttribute('lang')).toBe(false)
    expect(el.querySelector('[data-xh-part="code"]')?.getAttribute('data-lang')).toBe('cs')
  })
})
