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

/**
 * 部件节点上的连字符键换成驼峰。
 *
 * 部件解析成的是 React 组件，它的入参是驼峰 props；fixture 写的是 DOM 属性口径
 * （`item-id`、`scope-value`），原样传过去组件读到的是 undefined，条目的身份整个丢掉。
 * data-* / aria-* 不动：那两类 React 直接认，也不该变成组件入参。
 */
function toCamel(key: string): string {
  if (key.startsWith('data-') || key.startsWith('aria-'))
    return key
  return key.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase())
}

/**
 * fixture 的 attrs 是 DOM 属性口径，React 收到的是 props。
 *
 * 空串在 DOM 里是「这个布尔属性在场」的写法（`<div disabled>`），换成 React 的写法就是 true；
 * 原样传过去是空串、在 React 里是假值，禁用一类的状态会静默失效。
 * 只对不带连字符的键这么转：带连字符的是 data-* / aria-* 这类真属性，空串对它们是有意义的取值。
 *
 * @param attrs fixture 节点上写的那一份属性。
 * @param part 这是不是一个部件节点；是的话连字符键先换成驼峰，再按上面那条判空串。
 */
function toReactProps(attrs: Record<string, unknown> | undefined, part: boolean): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const [rawKey, value] of Object.entries(attrs ?? {})) {
    const key = part ? toCamel(rawKey) : rawKey
    out[key] = value === '' && !key.includes('-') ? true : value
  }
  return out
}

/** 节点声明了只在某些适配器下渲、名单里又没有 react 时，本侧当它没写。 */
function rendersHere(node: FixtureNode): boolean {
  return node.only == null || node.only.includes('react')
}

/** 一组子节点 → React 元素列表，本侧不渲的先剔掉、下标作 key；没有子节点给 undefined。 */
export function renderFixtureChildren(nodes: readonly FixtureNode[] | undefined, component: string): ReactElement[] | undefined {
  return nodes?.filter(rendersHere).map((c, i) => renderFixtureNode(c, component, i))
}

// FixtureNode → ReactElement。part 节点解析成对应组件，纯结构节点直接建元素；组件数增加时零改动。
export function renderFixtureNode(node: FixtureNode, component: string, key?: number): ReactElement {
  const kids = renderFixtureChildren(node.children, component)
  const children = kids ?? node.text
  const props = { ...toReactProps(node.attrs, node.part != null), key } as Record<string, unknown>
  if (node.part)
    return createElement(resolvePart(component, node.part), props, children)
  return createElement(node.tag ?? 'div', props, children)
}
