import type { ReactElement, ReactNode, Ref } from 'react'
import { DIAGNOSTIC_CODES, reportDiagnostic } from '@xihan-ui/core'
import { Children, cloneElement, Fragment, isValidElement } from 'react'
import { mergeReactProps } from './merge-props'

/**
 * asChild：部件不再渲染自己的包裹元素，把该挂的属性合到作者给的那个子节点上。
 *
 * 触发器类部件默认渲染 <button>，作者想用自己的按钮当触发器时，只能往 <button> 里再套一个
 * <button>——那是非法嵌套，浏览器会拆开它，事件与焦点都不对。asChild 是唯一的正解。
 */

/** 滤掉字符串与布尔，片段展开，只留能挂属性的元素。 */
function attributable(children: ReactNode): ReactElement[] {
  const out: ReactElement[] = []
  for (const node of Children.toArray(children)) {
    if (!isValidElement(node))
      continue
    if (node.type === Fragment) {
      out.push(...attributable((node.props as { children?: ReactNode }).children))
      continue
    }
    out.push(node)
  }
  return out
}

/** 子节点已带角色标记：组件节点的根由它自己渲染，元素节点看有没有写 data-scope。 */
export function carriesOwnAnatomy(node: ReactElement): boolean {
  return typeof node.type !== 'string' || (node.props as Record<string, unknown>)['data-scope'] != null
}

/**
 * 把部件属性合到作者的子节点上。
 *
 * @param children 作者给的内容
 * @param props 部件该挂的属性（含 ref）
 * @param scope 部件所属组件名，只用于诊断文案
 * @returns 合并后的元素；子节点不合规时返回 null，由调用方退回默认渲染
 */
export function mergeIntoChild(
  children: ReactNode,
  props: Record<string, unknown>,
  scope: string,
): ReactElement | null {
  const candidates = attributable(children)
  if (candidates.length !== 1) {
    reportDiagnostic({
      code: DIAGNOSTIC_CODES.warn,
      level: 'warn',
      scope,
      message: `asChild 需要恰好一个子节点，实际是 ${candidates.length} 个；已退回默认渲染。`,
    })
    return null
  }
  const child = candidates[0]!

  // 子节点自带解剖标记时不覆盖它，只落接线属性；否则整套属性都给它
  const keepAnatomy = !carriesOwnAnatomy(child)
  const own: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(props)) {
    if (!keepAnatomy && (key === 'data-scope' || key === 'data-part'))
      continue
    own[key] = value
  }

  // 作者的那一份排在前：同名处理器串起来时作者先跑，部件后跑（与 Vue 侧的 asChild 一致——
  // 那边由 cloneVNode 把部件属性合到作者节点上，顺序同此）。普通值反过来由部件说了算：
  // data-part 与各种 aria 接线是这个部件的身份，作者盖掉它就等于把角色拆了。
  //
  // 注意这与不开 asChild 那条路刚好相反（那边作者的属性排在后、处理器因此后跑）。
  // 两条路的顺序在 Vue 侧本来就不同，这里照它对齐，不另立一套。
  //
  // ref 两边都要拿到节点：React 19 里 ref 是普通 prop，直接后盖前会让作者那一份收不到。
  const childProps = child.props as Record<string, unknown>
  const merged = mergeReactProps(
    { ...childProps, ref: (child as { ref?: Ref<unknown> }).ref },
    own,
  )
  return cloneElement(child, merged)
}

export interface AsChildProps {
  /** 借用作者的子节点当本部件，不再渲染自己的包裹元素；子节点须恰好一个。 */
  asChild?: boolean
}

/**
 * 部件的渲染出口：开了 asChild 且子节点合规就合到子节点上，否则按 fallback 渲染。
 * 合并顺序与不开 asChild 时一致，两条路产出的属性相同。
 */
export function renderAsChild(
  asChild: boolean | undefined,
  children: ReactNode,
  props: Record<string, unknown>,
  scope: string,
  fallback: (props: Record<string, unknown>, children: ReactNode) => ReactElement,
): ReactNode {
  if (asChild) {
    const merged = mergeIntoChild(children, props, scope)
    if (merged)
      return merged
  }
  return fallback(props, children)
}
