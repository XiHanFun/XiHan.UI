// @vitest-environment jsdom
// 标准结构的组合节点：渲那个组件的根组件，props 原样传、onXxx 即监听，嵌在部件里照样渲；组件表里查不到时抛错。
import type { StructureChild } from '@xihan-ui/headless'
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, defineComponent, h, nextTick } from 'vue'
import { renderStructure } from '../src/runtime/structure'

const Inner = defineComponent({
  props: { items: { type: Array, default: () => [] } },
  emits: { ping: (_detail: unknown) => true },
  setup(props, { emit }) {
    return () => h('button', { 'data-inner': '', 'onClick': () => emit('ping', 7) }, (props.items as string[]).join(','))
  },
})

const Box = defineComponent({
  setup: (_, { slots }) => () => h('div', { 'data-box': '' }, slots.default?.()),
})

let app: App | null = null

afterEach(() => {
  app?.unmount()
  app = null
  document.body.innerHTML = ''
})

describe('renderStructure 的组合节点（Vue）', () => {
  it('渲组件表里的根组件，props 原样传，onXxx 接住内层的事件', async () => {
    const seen: unknown[] = []
    const nodes: StructureChild[] = [{
      key: 'box',
      tag: 'div',
      part: 'box',
      children: [{ key: 'inner', instance: 'inner', props: { items: ['a', 'b'], onPing: (detail: unknown) => seen.push(detail) } }],
    }]
    const host = document.createElement('div')
    document.body.append(host)
    app = createApp({ setup: () => () => renderStructure(nodes, { box: Box }, undefined, { inner: Inner }) })
    app.mount(host)
    await nextTick()
    const inner = document.querySelector<HTMLButtonElement>('[data-box] > [data-inner]')!
    expect(inner.textContent).toBe('a,b')
    inner.click()
    expect(seen).toEqual([7])
  })

  it('组件表里查不到组合节点的组件时抛错', () => {
    expect(() => renderStructure([{ key: 'x', instance: 'missing' }], {})).toThrow('组合节点 missing')
  })
})
