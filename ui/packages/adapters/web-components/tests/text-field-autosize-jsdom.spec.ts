// @vitest-environment jsdom
// 没有排版的环境（jsdom）里渲染多行自动增高的文本框：挂载、输入、换配置都不抛错，也不改 textarea 的高度。
import type { XhTextFieldElement } from '../src/elements/text-field'
import { afterEach, describe, expect, it } from 'vitest'
import { defineXhElements } from '../src/define'

defineXhElements()

afterEach(() => {
  document.body.innerHTML = ''
})

describe('多行自动增高在 jsdom 里安静跳过（Web Components）', () => {
  it('挂载、输入与切换 autoSize 都不抛错，textarea 不写高度', async () => {
    const errors: unknown[] = []
    const onError = (event: ErrorEvent): void => void errors.push(event.error)
    window.addEventListener('error', onError)
    document.body.innerHTML = `
      <xh-text-field auto-size>
        <div data-xh-part="root"><div data-xh-part="control"><textarea data-xh-part="input"></textarea></div></div>
      </xh-text-field>`
    const host = document.querySelector<XhTextFieldElement>('xh-text-field')!
    await host.updateComplete
    const el = host.querySelector('textarea')!
    el.value = '第一行\n第二行\n第三行'
    el.dispatchEvent(new Event('input', { bubbles: true }))
    host.autoSize = { minRows: 2, maxRows: 4 }
    await host.updateComplete
    host.autoSize = false
    await host.updateComplete
    window.removeEventListener('error', onError)
    expect(errors).toEqual([])
    expect(el.style.blockSize).toBe('')
    expect(el.style.maxBlockSize).toBe('')
    expect(el.style.overflowY).toBe('')
  })
})
