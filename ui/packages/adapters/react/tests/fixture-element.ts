// 把与框架无关的 fixture 树翻成 React 元素。DOM 宿主与服务端直出宿主共用这一份。
import type { FixtureNode } from '@xihan-ui/testing'
import type { ComponentType, ReactElement } from 'react'
import { createElement } from 'react'
import * as X from '../src'

const registry = X as unknown as Record<string, ComponentType<Record<string, unknown>>>

export function pascal(s: string): string {
  return s.split(/[-_]/).filter(Boolean).map(w => w[0]!.toUpperCase() + w.slice(1)).join('')
}

// 根组件命名可能带 Root 后缀（XhDialogRoot），也可能就是组件名本身（XhSwitch）。
export function resolveRoot(component: string): ComponentType<Record<string, unknown>> {
  const root = registry[`Xh${pascal(component)}Root`] ?? registry[`Xh${pascal(component)}`]
  if (!root)
    throw new Error(`react 适配器缺根组件：Xh${pascal(component)}[Root]`)
  return root
}

export function resolvePart(component: string, part: string): ComponentType<Record<string, unknown>> {
  const comp = registry[`Xh${pascal(component)}${pascal(part)}`]
  if (!comp)
    throw new Error(`react 适配器缺组件：Xh${pascal(component)}${pascal(part)}`)
  return comp
}

/** 组件自报的对外事件名；harness 只给它声明过的那几个装监听器。 */
export function declaredEvents(component: ComponentType<Record<string, unknown>>): Set<string> {
  return new Set((component as { xhEvents?: readonly string[] }).xhEvents ?? [])
}

// FixtureNode → ReactElement。part 节点解析成对应组件，纯结构节点直接建元素；组件数增加时零改动。
export function renderFixtureNode(node: FixtureNode, component: string, key?: number): ReactElement {
  const kids = node.children?.map((c, i) => renderFixtureNode(c, component, i))
  const children = kids ?? node.text
  const props = { ...node.attrs, key } as Record<string, unknown>
  if (node.part)
    return createElement(resolvePart(component, node.part), props, children)
  return createElement(node.tag ?? 'div', props, children)
}
