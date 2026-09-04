// 把与框架无关的 fixture 树翻成 Vue 的 VNode。DOM 宿主与服务端直出宿主共用这一份。
import type { FixtureNode } from '@xihan-ui/testing'
import type { Component, VNode } from 'vue'
import { h } from 'vue'
import * as X from '../src'

const registry = X as unknown as Record<string, Component>

export function pascal(s: string): string {
  return s.split(/[-_]/).filter(Boolean).map(w => w[0]!.toUpperCase() + w.slice(1)).join('')
}

// 根组件命名可能带 Root 后缀（XhDialogRoot），也可能就是组件名本身（XhButton）。
export function resolveRoot(component: string): Component {
  const root = registry[`Xh${pascal(component)}Root`] ?? registry[`Xh${pascal(component)}`]
  if (!root)
    throw new Error(`vue 适配器缺根组件：Xh${pascal(component)}[Root]`)
  return root
}

export function resolvePart(component: string, part: string): Component {
  const comp = registry[`Xh${pascal(component)}${pascal(part)}`]
  if (!comp)
    throw new Error(`vue 适配器缺组件：Xh${pascal(component)}${pascal(part)}`)
  return comp
}

// FixtureNode → VNode。part 节点解析成对应组件，纯结构节点直接建元素；组件数增加时零改动。
export function renderFixtureNode(node: FixtureNode, component: string): VNode {
  if (node.part) {
    const kids = node.children?.map(c => renderFixtureNode(c, component))
    const slot = kids ? () => kids : node.text != null ? () => node.text : undefined
    return h(resolvePart(component, node.part), { ...node.attrs }, slot ? { default: slot } : undefined)
  }
  const kids = node.children?.map(c => renderFixtureNode(c, component))
  return h(node.tag ?? 'div', { ...node.attrs }, kids ?? node.text)
}
