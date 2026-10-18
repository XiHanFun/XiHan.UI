// @vitest-environment jsdom

import { describe, expect, it } from 'vitest'
import { serializeSvg } from '../src/svg-export'

const SVG_NS = 'http://www.w3.org/2000/svg'

describe('serializeSvg（jsdom）', () => {
  it('xmlns 只写一份，文本能按 XML 读回', () => {
    const svg = document.createElementNS(SVG_NS, 'svg')
    svg.setAttribute('width', '10')
    svg.append(document.createElementNS(SVG_NS, 'rect'))
    const text = serializeSvg(svg)
    expect(text.match(/xmlns=/g)).toEqual(['xmlns='])
    const parsed = new DOMParser().parseFromString(text, 'image/svg+xml')
    expect(parsed.getElementsByTagName('parsererror')).toHaveLength(0)
    expect([parsed.documentElement.namespaceURI, parsed.documentElement.firstElementChild!.localName]).toEqual([SVG_NS, 'rect'])
  })

  it('不在 SVG 命名空间里的元素抛 TypeError', () => {
    expect(() => serializeSvg(document.createElement('svg') as unknown as SVGSVGElement)).toThrow(TypeError)
  })
})
