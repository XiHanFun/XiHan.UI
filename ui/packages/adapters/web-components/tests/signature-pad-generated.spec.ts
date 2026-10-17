// @vitest-environment jsdom

import type { DiagnosticRecord } from '@xihan-ui/core'
import { onDiagnostic } from '@xihan-ui/core'
import { afterEach, describe, expect, it } from 'vitest'
import { defineXhElements } from '../src/define'

defineXhElements()

interface SignaturePadHost extends HTMLElement {
  updateComplete: Promise<unknown>
  label?: string
  name?: string
}

const SVG_NS = 'http://www.w3.org/2000/svg'

const stops: Array<() => void> = []
afterEach(() => {
  while (stops.length) stops.pop()!()
  document.body.replaceChildren()
})

async function settle(el: SignaturePadHost): Promise<void> {
  for (let i = 0; i < 4; i++) {
    await el.updateComplete
    await new Promise(r => setTimeout(r, 0))
  }
}

function mount(props: Partial<SignaturePadHost>, inner = ''): SignaturePadHost {
  const el = document.createElement('xh-signature-pad') as SignaturePadHost
  Object.assign(el, props)
  el.innerHTML = inner
  document.body.append(el)
  return el
}

function part(el: Element, name: string): Element | null {
  return el.querySelector(`[data-scope="signature-pad"][data-part="${name}"]`)
}

function partsOf(parent: Element): string[] {
  return Array.from(parent.children).map(node => node.getAttribute('data-part') ?? '')
}

describe('xh-signature-pad 生成结构', () => {
  it('什么都不写：生成标题、svg 画布（基准线与笔迹）、清空钮与状态，图元在 SVG 命名空间，画布以标题命名', async () => {
    const records: DiagnosticRecord[] = []
    stops.push(onDiagnostic(record => records.push(record)))
    const el = mount({ label: '请签名' })
    await settle(el)

    expect(partsOf(part(el, 'root')!)).toEqual(['label', 'control', 'clear-trigger', 'status'])
    const control = part(el, 'control')!
    expect(partsOf(control)).toEqual(['guide', 'path'])
    expect([control, part(el, 'guide')!, part(el, 'path')!].map(node => [node.localName, node.namespaceURI])).toEqual([
      ['svg', SVG_NS],
      ['line', SVG_NS],
      ['path', SVG_NS],
    ])
    expect(control.getAttribute('role')).toBe('img')
    expect(control.getAttribute('aria-labelledby')).toBe(part(el, 'label')!.id)
    const clear = part(el, 'clear-trigger')!
    expect([clear.textContent, clear.getAttribute('aria-label')]).toEqual(['Clear signature', 'Clear signature'])
    expect(part(el, 'status')!.textContent).toBe('No signature yet')
    expect(records.filter(record => record.level === 'error')).toEqual([])
  })

  it('复用：再次更新不重建 svg 图元；给了 name 才带表单影子', async () => {
    const el = mount({})
    await settle(el)
    const control = part(el, 'control')
    const path = part(el, 'path')
    expect(part(el, 'label')).toBeNull()
    expect(part(el, 'hidden-input')).toBeNull()

    el.name = 'signature'
    el.label = '签名'
    await settle(el)
    expect([part(el, 'control'), part(el, 'path')]).toEqual([control, path])
    expect(partsOf(part(el, 'root')!)).toEqual(['label', 'control', 'clear-trigger', 'status', 'hidden-input'])
    expect(part(el, 'hidden-input')!.getAttribute('name')).toBe('signature')
  })

  it('slot="label" 接管标题', async () => {
    const el = mount({}, '<b slot="label">经办人签名</b>')
    await settle(el)
    const label = part(el, 'label')!
    expect(label.querySelector('b')!.textContent).toBe('经办人签名')
    expect(part(el, 'control')!.getAttribute('aria-labelledby')).toBe(label.id)
  })

  it('作者写了 svg 画布：全归作者，不生成任何节点', async () => {
    const el = mount({}, `
      <div data-xh-part="root">
        <svg data-xh-part="control"><path data-xh-part="path"></path></svg>
      </div>`)
    await settle(el)
    const root = part(el, 'root')!
    expect(partsOf(root)).toEqual(['control'])
    expect(el.querySelectorAll('[data-xh-gen]')).toHaveLength(0)
  })
})
