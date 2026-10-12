// 字段族宿主的 display: contents 由皮肤声明，作者给宿主写的 display 照层叠胜出，写在内联还是样式表里都算。
// 此前由元素在连接时写内联 contents，样式表里的规则会被它压过，作者在宿主上写的宽度随之失效；
// 内联还盖掉了 UA 的 [hidden] { display: none }，带 hidden 的宿主照样露出来。
import { afterEach, describe, expect, it } from 'vitest'
import { defineXhElements } from '../../src/define'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

defineXhElements()

const mounted: Element[] = []

afterEach(() => {
  for (const node of mounted.splice(0))
    node.remove()
})

function field(attributes: Record<string, string> = {}): HTMLElement {
  const element = document.createElement('xh-text-field')
  for (const [name, value] of Object.entries(attributes))
    element.setAttribute(name, value)
  element.innerHTML = '<div data-xh-part="root"><div data-xh-part="control"><input data-xh-part="input" aria-label="备注" /></div></div>'
  mounted.push(element)
  return element
}

describe('字段族宿主的 display', () => {
  it('作者没写 display 时宿主取 contents', () => {
    const element = field()
    document.body.append(element)
    expect(getComputedStyle(element).display).toBe('contents')
  })

  it('样式表给宿主定了 display 就不动，作者写在宿主上的宽度照样生效', () => {
    const sheet = document.createElement('style')
    sheet.textContent = '.authored-host { display: block; inline-size: 240px; }'
    document.head.append(sheet)
    mounted.push(sheet)
    const element = field({ class: 'authored-host' })
    document.body.append(element)
    expect(getComputedStyle(element).display).toBe('block')
    expect(element.getBoundingClientRect().width).toBeCloseTo(240, 0)
  })

  it('带 hidden 的宿主保持收起', () => {
    const element = field({ hidden: '' })
    document.body.append(element)
    expect(getComputedStyle(element).display).toBe('none')
    expect(element.querySelector('input')!.checkVisibility()).toBe(false)
  })
})
