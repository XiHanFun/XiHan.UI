// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import { splitText } from '../src/text'

function element(html: string): HTMLElement {
  const el = document.createElement('p')
  el.innerHTML = html
  document.body.append(el)
  return el
}

afterEach(() => {
  document.body.innerHTML = ''
})

describe('逐字拆分', () => {
  it('每个字一段，空白不包段', () => {
    const el = element('ab cd')
    const { parts } = splitText(el)

    expect(parts).toHaveLength(4)
    expect(parts.map(part => part.textContent)).toEqual(['a', 'b', 'c', 'd'])
    expect(el.textContent).toBe('ab cd')
  })

  it('按码点切，不把 emoji 拆成两半', () => {
    const { parts } = splitText(element('a🎉b'))
    expect(parts.map(part => part.textContent)).toEqual(['a', '🎉', 'b'])
  })

  it('每段都是行内块，否则位移与缩放吃不到', () => {
    const { parts } = splitText(element('ab'))
    for (const part of parts)
      expect(part.style.display).toBe('inline-block')
  })

  it('带上给定的类名', () => {
    const { parts } = splitText(element('ab'), { className: 'x-part' })
    for (const part of parts)
      expect(part.className).toBe('x-part')
  })
})

describe('逐词拆分', () => {
  it('每个词一段，词间空白原样保留', () => {
    const el = element('曦寒 UI  很好')
    const { parts } = splitText(el, { by: 'word' })

    expect(parts.map(part => part.textContent)).toEqual(['曦寒', 'UI', '很好'])
    expect(el.textContent).toBe('曦寒 UI  很好')
  })

  it('前后空白不丢', () => {
    const el = element(' ab ')
    splitText(el, { by: 'word' })
    expect(el.textContent).toBe(' ab ')
  })
})

describe('无障碍', () => {
  it('原文挂到容器的 aria-label 上', () => {
    const el = element('你好')
    splitText(el)
    expect(el.getAttribute('aria-label')).toBe('你好')
  })

  it('拆出来的段一律 aria-hidden', () => {
    const { parts } = splitText(element('你好'))
    for (const part of parts)
      expect(part.getAttribute('aria-hidden')).toBe('true')
  })
})

describe('还原', () => {
  it('把子节点放回去', () => {
    const el = element('<b>粗</b>体')
    const { restore } = splitText(el)

    expect(el.querySelector('b')).toBeNull()
    restore()
    expect(el.querySelector('b')?.textContent).toBe('粗')
    expect(el.textContent).toBe('粗体')
  })

  it('原本没有 aria-label 就删掉，有就还原', () => {
    const bare = element('文字')
    splitText(bare).restore()
    expect(bare.hasAttribute('aria-label')).toBe(false)

    const labelled = element('文字')
    labelled.setAttribute('aria-label', '原标签')
    splitText(labelled).restore()
    expect(labelled.getAttribute('aria-label')).toBe('原标签')
  })

  it('重复还原不抛、不重复插入', () => {
    const el = element('ab')
    const { restore } = splitText(el)
    restore()
    restore()
    expect(el.textContent).toBe('ab')
  })
})

describe('退化输入', () => {
  it('空文字不动元素', () => {
    const el = element('')
    const { parts } = splitText(el)
    expect(parts).toHaveLength(0)
    expect(el.hasAttribute('aria-label')).toBe(false)
  })

  it('纯空白不动元素', () => {
    const el = element('   ')
    expect(splitText(el).parts).toHaveLength(0)
  })

  it('空文字的还原是空操作', () => {
    const el = element('')
    expect(() => splitText(el).restore()).not.toThrow()
  })
})
