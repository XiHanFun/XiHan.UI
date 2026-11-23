// @vitest-environment jsdom
import { existsSync, readFileSync } from 'node:fs'
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
/**
 * 这个元素读不读外层下发的表单状态。接收方法 setFormControlState 在基类上，每个元素都有，认不出谁真在用；
 * 真在用的是把自己的四态与外层的合成一份交给状态机的那些，认它们源码里对 resolveControlState 的调用。
 * 元素文件按标签名落位：xh-text-field 在 src/elements/text-field.ts。
 */
function receives(tag: string): boolean {
  const file = join(__dirname, '../src/elements', `${tag.slice('xh-'.length)}.ts`)
  return customElements.get(tag) != null && existsSync(file) && readFileSync(file, 'utf8').includes('this.resolveControlState(')
}

describe('库内控件的发现表', () => {
  it('读外层表单状态的控件都在表里，字段与表单收得到它', () => {
    // 字段自己也读外层（表单）的状态，但它是下发的一方，不在表里
    const missing = TAGS.filter(tag => tag !== 'xh-field' && tag !== 'xh-form' && receives(tag) && !LISTED.has(tag))
    expect(missing).toEqual([])
  })

  it('表里的每个标签都是已注册且会读外层表单状态的元素', () => {
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
