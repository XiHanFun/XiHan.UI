// @vitest-environment jsdom
// 必需部件的校验只管作者手写的结构：元素按标准结构铺部件时，部件随数据增减，
// 数据晚到（先连接、脚本再赋 collection）或本来就空时少几个必需部件不报 wc.missing-part。
import type { DiagnosticRecord } from '@xihan-ui/core'
import type { BreadcrumbNode } from '@xihan-ui/headless'
import { onDiagnostic } from '@xihan-ui/core'
import { afterEach, describe, expect, it } from 'vitest'
import { defineXhElements } from '../src/define'
import { isStructureGenerated } from '../src/dom/structure'

defineXhElements()

interface BreadcrumbHost extends HTMLElement {
  updateComplete: Promise<unknown>
  collection?: BreadcrumbNode[]
}

const stops: Array<() => void> = []
afterEach(() => {
  while (stops.length) stops.pop()!()
  document.body.replaceChildren()
})

async function settle(el: BreadcrumbHost): Promise<void> {
  for (let i = 0; i < 4; i++) {
    await el.updateComplete
    await new Promise(r => setTimeout(r, 0))
  }
}

function mount(inner = ''): BreadcrumbHost {
  const el = document.createElement('xh-breadcrumb') as BreadcrumbHost
  el.innerHTML = inner
  document.body.append(el)
  return el
}

function missing(records: readonly DiagnosticRecord[]): string[] {
  return records.filter(record => record.code === 'wc.missing-part').map(record => String(record.part))
}

function parts(el: Element, name: string): HTMLElement[] {
  return Array.from(el.querySelectorAll<HTMLElement>(`[data-scope="breadcrumb"][data-part="${name}"]`))
}

describe('标准结构下的必需部件', () => {
  it('先连接、再赋 collection：空着的那一轮不报缺部件，数据到了照样铺出条目与链接', async () => {
    const records: DiagnosticRecord[] = []
    stops.push(onDiagnostic(record => records.push(record)))
    const el = mount()
    await settle(el)
    expect(isStructureGenerated(el)).toBe(true)
    expect(parts(el, 'item')).toHaveLength(0)

    el.collection = [{ value: 'home', label: '首页', href: '/' }, { value: 'docs', label: '文档' }]
    await settle(el)
    expect(parts(el, 'link').map(link => link.textContent)).toEqual(['首页', '文档'])
    expect(missing(records)).toEqual([])
  })

  it('只写 root 也算元素铺结构：数据为空不报缺部件', async () => {
    const records: DiagnosticRecord[] = []
    stops.push(onDiagnostic(record => records.push(record)))
    const el = mount('<nav data-xh-part="root"></nav>')
    await settle(el)
    expect(isStructureGenerated(el)).toBe(true)
    expect(missing(records)).toEqual([])
  })

  it('作者手写结构漏了必需部件：照旧报 wc.missing-part', async () => {
    const records: DiagnosticRecord[] = []
    stops.push(onDiagnostic(record => records.push(record)))
    const el = mount('<nav data-xh-part="root"><ol data-xh-part="list"></ol></nav>')
    await settle(el)
    expect(isStructureGenerated(el)).toBe(false)
    expect(missing(records)).toEqual(['item', 'link'])
  })
})
