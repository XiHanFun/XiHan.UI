// @vitest-environment jsdom
import type { TextFieldAutoSize } from '@xihan-ui/headless'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { defineXhElements } from '../src/define'

defineXhElements()

interface TextFieldElement extends HTMLElement {
  autoSize?: boolean | TextFieldAutoSize
  value?: string
  updateComplete: Promise<unknown>
}

async function settle(el: TextFieldElement): Promise<void> {
  await el.updateComplete
  await Promise.resolve()
  await el.updateComplete
}

afterEach(() => {
  vi.restoreAllMocks()
  document.body.innerHTML = ''
})

describe('web components TextField textarea autoSize', () => {
  it('property 值与配置变化会重量，关闭和断开都归还作者内联样式', async () => {
    const getComputedStyle = vi.spyOn(window, 'getComputedStyle').mockReturnValue({
      getPropertyValue: (property: string) => ({
        'border-bottom-width': '0px',
        'border-top-width': '0px',
        'box-sizing': 'border-box',
        'font-size': '10px',
        'line-height': '10px',
        'padding-bottom': '0px',
        'padding-top': '0px',
        'width': '180px',
        'writing-mode': 'horizontal-tb',
      })[property] ?? '',
    } as CSSStyleDeclaration)
    vi.spyOn(HTMLTextAreaElement.prototype, 'scrollHeight', 'get').mockImplementation(function (this: HTMLTextAreaElement) {
      return this.value.length * 10
    })
    const field = document.createElement('xh-text-field') as TextFieldElement
    field.autoSize = { maxRows: 10 }
    field.value = 'aa'
    field.innerHTML = [
      '<div data-xh-part="root">',
      '<textarea data-xh-part="input" style="block-size: 23px; overflow-y: scroll"></textarea>',
      '</div>',
    ].join('')
    document.body.append(field)
    await settle(field)
    const textarea = field.querySelector('textarea')!
    expect(textarea.style.blockSize).toBe('20px')

    field.value = 'abcdefgh'
    await settle(field)
    expect(textarea.style.blockSize).toBe('80px')
    const stableMeasurementCount = getComputedStyle.mock.calls.length
    await settle(field)
    expect(getComputedStyle).toHaveBeenCalledTimes(stableMeasurementCount)

    field.autoSize = { maxRows: 3 }
    await settle(field)
    expect(textarea.style.blockSize).toBe('30px')

    field.autoSize = false
    await settle(field)
    expect(textarea.style.blockSize).toBe('23px')
    expect(textarea.style.overflowY).toBe('scroll')

    field.autoSize = true
    field.value = 'abcd'
    await settle(field)
    expect(textarea.style.blockSize).toBe('40px')
    field.remove()
    expect(textarea.style.blockSize).toBe('23px')
    expect(textarea.style.overflowY).toBe('scroll')
  })
})
