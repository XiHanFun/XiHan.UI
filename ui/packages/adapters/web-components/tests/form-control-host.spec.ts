// @vitest-environment jsdom
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { defineXhElements } from '../src/define'
import { FORM_CONTROL_HOST_SELECTOR } from '../src/runtime/form-control-host'

beforeAll(() => defineXhElements())
afterEach(() => {
  document.body.innerHTML = ''
})

const TAGS = [...readFileSync(join(__dirname, '../src/define.ts'), 'utf8').matchAll(/^ {2}'(xh-[a-z-]+)': Xh\w+Element,$/gm)].map(m => m[1]!)
const LISTED = new Set(FORM_CONTROL_HOST_SELECTOR.split(', '))
function receives(tag: string): boolean {
  return typeof (customElements.get(tag)?.prototype as unknown as Record<string, unknown> | undefined)?.setFormControlState === 'function'
}

describe('库内控件的发现表', () => {
  it('实现了 setFormControlState 的控件都在表里，字段与表单收得到它', () => {
    // 字段与表单自己也收状态，但它们是下发的一方，不在表里
    const missing = TAGS.filter(tag => tag !== 'xh-field' && tag !== 'xh-form' && receives(tag) && !LISTED.has(tag))
    expect(missing).toEqual([])
  })

  it('表里的每个标签都是已注册且实现了 setFormControlState 的元素', () => {
    expect([...LISTED].filter(tag => !receives(tag))).toEqual([])
  })
})

describe('补进发现表的控件继承字段状态', () => {
  it('xh-color-field 放进禁用的字段，输入框随之禁用', async () => {
    document.body.innerHTML = `
      <xh-field disabled>
        <div data-xh-part="root">
          <label data-xh-part="label">主题色</label>
          <xh-color-field>
            <div data-xh-part="root"><div data-xh-part="control"><input data-xh-part="input"></div><input data-xh-part="hidden-input"></div>
          </xh-color-field>
        </div>
      </xh-field>`
    const input = document.querySelector('[data-xh-part="input"]') as HTMLInputElement
    await vi.waitFor(() => expect(input.disabled).toBe(true))
  })
})
