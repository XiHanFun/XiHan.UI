import { afterEach, describe, expect, it } from 'vitest'
import { caretClientRect } from '../../src/behavior/caret/caret-rect'

const BOX = 'box-sizing: border-box; margin: 0; font: 16px/20px monospace; padding: 4px 6px; border: 2px solid; letter-spacing: 0;'

afterEach(() => {
  document.body.replaceChildren()
})

function mount<T extends HTMLInputElement | HTMLTextAreaElement>(tag: 'input' | 'textarea', style: string, value: string): T {
  const element = document.createElement(tag) as T
  element.setAttribute('style', `${BOX} ${style}`)
  element.value = value
  document.body.append(element)
  return element
}

function rect(element: HTMLInputElement | HTMLTextAreaElement, index: number): { x: number, y: number, width: number, height: number } {
  const result = caretClientRect(element, index)
  expect(result).not.toBeNull()
  return result!
}

describe('caretClientRect（Chromium）', () => {
  it('单行：从内容区左缘起按字宽前进，纵向居中，高度是一行', () => {
    const input = mount<HTMLInputElement>('input', 'width: 300px; height: 40px;', 'abcdef')
    const box = input.getBoundingClientRect()
    const start = rect(input, 0)
    const char = rect(input, 1).x - start.x
    expect(start.x).toBeCloseTo(box.left + 2 + 6, 0)
    expect(char).toBeGreaterThan(5)
    expect(rect(input, 4).x - start.x).toBeCloseTo(char * 4, 0)
    expect(start.height).toBe(20)
    expect(start.y + start.height / 2).toBeCloseTo(box.top + box.height / 2, 0)
    expect(start.width).toBe(0)
  })

  it('单行：扣掉横向滚动；下标越界时夹到两端', () => {
    const input = mount<HTMLInputElement>('input', 'width: 80px;', 'abcdefghijklmnopqrstuvwxyz0123456789')
    const before = rect(input, 20).x
    input.scrollLeft = 40
    expect(input.scrollLeft).toBe(40)
    expect(rect(input, 20).x).toBeCloseTo(before - 40, 0)
    expect(rect(input, -5)).toEqual(rect(input, 0))
    expect(rect(input, 999)).toEqual(rect(input, input.value.length))
  })

  it('多行：放不下的词整个换到下一行，光标跟着落到下一行', () => {
    const textarea = mount<HTMLTextAreaElement>('textarea', 'width: 120px; height: 200px; overflow: hidden;', 'aaaaa bbbbbbbb')
    const start = rect(textarea, 0)
    const char = rect(textarea, 1).x - start.x
    const inWord = rect(textarea, 8)
    expect(inWord.y - start.y).toBe(20)
    expect(inWord.x - start.x).toBeCloseTo(char * 2, 0)
  })

  it('多行：换行符之后从下一行行首起；扣掉纵向滚动', () => {
    const textarea = mount<HTMLTextAreaElement>('textarea', 'width: 200px; height: 52px; overflow: auto;', 'ab\ncd\nef\ngh\nij')
    const start = rect(textarea, 0)
    const third = rect(textarea, 6)
    expect(third.y - start.y).toBe(40)
    expect(third.x).toBeCloseTo(start.x, 0)
    textarea.scrollTop = 20
    expect(textarea.scrollTop).toBe(20)
    expect(rect(textarea, 6).y).toBeCloseTo(third.y - 20, 0)
  })

  it('不显示时返回 null，量完不在文档里留下镜像', () => {
    const input = mount<HTMLInputElement>('input', 'display: none;', 'abc')
    expect(caretClientRect(input, 1)).toBeNull()
    const shown = mount<HTMLInputElement>('input', 'width: 100px;', 'abc')
    caretClientRect(shown, 1)
    expect(document.body.children).toHaveLength(2)
  })
})
