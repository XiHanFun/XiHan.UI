// 多行自增高只有一层滚动（Web Components）：滚的永远是 textarea，控件外壳只包住它，不设上限、不滚。
// 量高与上限的判据全集在 Vue 的同名用例里；这里核作者 Light DOM 与元素的量高时机落在同一结果上。
import type { TextFieldAutoSize } from '@xihan-ui/headless'
import { afterEach, describe, expect, it } from 'vitest'
import { defineXhElements } from '../../src/define'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

defineXhElements()

interface TextFieldElement extends HTMLElement {
  autoSize?: boolean | TextFieldAutoSize
  defaultValue?: string
  updateComplete: Promise<unknown>
}

interface Field {
  control: HTMLElement
  textarea: HTMLTextAreaElement
}

let host: HTMLElement | null = null

async function mount(autoSize: boolean | TextFieldAutoSize, value = ''): Promise<Field> {
  host = document.createElement('div')
  host.style.inlineSize = '320px'
  const el = document.createElement('xh-text-field') as TextFieldElement
  el.innerHTML = `
    <div data-xh-part="root">
      <div data-xh-part="control">
        <textarea data-xh-part="input"></textarea>
      </div>
    </div>`
  // 行数界限对象只能经 property 交给元素；初值同样在连接前写好
  el.autoSize = autoSize
  el.defaultValue = value
  host.append(el)
  document.body.append(host)
  for (let i = 0; i < 3; i++) {
    await Promise.resolve()
    await el.updateComplete
  }
  return {
    control: host.querySelector<HTMLElement>('[data-part="control"]')!,
    textarea: host.querySelector<HTMLTextAreaElement>('textarea')!,
  }
}

function lines(n: number): string {
  return Array.from({ length: n }, (_, i) => `第 ${i + 1} 行`).join('\n')
}

function height(el: Element): number {
  return el.getBoundingClientRect().height
}

function px(value: string): number {
  return Number.parseFloat(value)
}

/** 令牌当下解析成多少像素。 */
function tokenPx(name: string): number {
  const probe = document.createElement('div')
  probe.style.cssText = `position:absolute;visibility:hidden;block-size:var(${name})`
  document.body.append(probe)
  const value = probe.getBoundingClientRect().height
  probe.remove()
  return value
}

/** 由 textarea 现在的高度反推一行多高。 */
function rowOf(textarea: HTMLTextAreaElement, rows: number): number {
  const style = getComputedStyle(textarea)
  return (height(textarea) - px(style.paddingTop) - px(style.paddingBottom)) / rows
}

/** 字段里真正滚得动的那些盒：设了 auto / scroll，并且内容比可视区高。 */
function scrollers(field: Field): Element[] {
  return [field.control, ...field.control.querySelectorAll('*')].filter((el) => {
    const overflow = getComputedStyle(el).overflowY
    return (overflow === 'auto' || overflow === 'scroll') && el.scrollHeight > el.clientHeight
  })
}

function expectShellWraps(field: Field): void {
  const style = getComputedStyle(field.control)
  expect(style.maxBlockSize).toBe('none')
  expect(field.control.scrollHeight).toBe(field.control.clientHeight)
  expect(height(field.control)).toBeCloseTo(height(field.textarea) + px(style.borderTopWidth) + px(style.borderBottomWidth), 1)
}

afterEach(() => {
  host?.remove()
  host = null
})

describe('web Components TextField autoSize 只有一层滚动', () => {
  it('15–22 行：内容超过 22 行时停在 22 行，超过 12rem 也不被外壳截掉，只有 textarea 在滚', async () => {
    const field = await mount({ minRows: 15, maxRows: 22 }, lines(40))

    expect(height(field.textarea)).toBeGreaterThan(tokenPx('--xh-viewport-h-sm'))
    expect(rowOf(field.textarea, 22)).toBeCloseTo(px(getComputedStyle(field.textarea).lineHeight), 0)
    expectShellWraps(field)
    expect(scrollers(field)).toEqual([field.textarea])
  })

  it('没给 maxRows：textarea 停在 12rem，超出的行在它自己里面滚', async () => {
    const field = await mount(true, lines(40))

    expect(height(field.textarea)).toBe(tokenPx('--xh-viewport-h-sm'))
    expectShellWraps(field)
    expect(scrollers(field)).toEqual([field.textarea])
  })
})
