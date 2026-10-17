// @vitest-environment jsdom
// 标准结构的出口节点：作者内容原样渲在出口处，不包部件；内容来自 outlet 回调，没给时出口处什么都没有。
import type { StructureChild } from '@xihan-ui/headless'
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, defineComponent, h } from 'vue'
import { renderStructure } from '../src/runtime/structure'

const Label = defineComponent({
  setup: (_, { slots }) => () => h('label', { 'data-label': '' }, slots.default?.()),
})

const Hint = defineComponent({
  setup: (_, { slots }) => () => h('p', { 'data-hint': '' }, slots.default?.()),
})

const NODES: StructureChild[] = [
  { key: 'label', tag: 'label', part: 'label', text: '名称' },
  { key: 'control', outlet: true, slot: { name: 'control' } },
  { key: 'description', tag: 'p', part: 'description', text: '说明' },
]

let app: App | null = null

afterEach(() => {
  app?.unmount()
  app = null
  document.body.innerHTML = ''
})

function mount(control?: () => unknown): HTMLElement {
  const host = document.createElement('div')
  document.body.append(host)
  app = createApp(defineComponent({
    setup: () => () => h('div', null, renderStructure(NODES, { label: Label, description: Hint }, undefined, {}, () => (control ? control() as never : undefined))),
  }))
  app.mount(host)
  return host.firstElementChild as HTMLElement
}

describe('renderStructure 的出口节点（Vue）', () => {
  it('作者内容原样渲在出口处，夹在前后两个部件之间', () => {
    const root = mount(() => [h('input', { 'aria-label': '名称' })])
    expect(Array.from(root.children, node => node.localName)).toEqual(['label', 'input', 'p'])
  })

  it('没给内容时出口处什么都没有', () => {
    const root = mount()
    expect(Array.from(root.children, node => node.localName)).toEqual(['label', 'p'])
  })
})
