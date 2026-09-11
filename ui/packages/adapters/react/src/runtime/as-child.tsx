import type { ReactElement, ReactNode } from 'react'
import { isEventHandlerKey } from '@xihan-ui/core'
import { Children, cloneElement, Fragment, isValidElement } from 'react'
import { mergePartProps, mergeReactProps } from './merge-props'

/**
 * asChild：部件不再渲染自己的包裹元素，把该挂的属性合到作者给的那个子节点上。
 *
 * 触发器类部件默认渲染 <button>，作者想用自己的按钮当触发器时，只能往 <button> 里再套一个
 * <button>——那是非法嵌套，浏览器会拆开它，事件与焦点都不对。asChild 是唯一的正解。
 */

/** 只忽略空白与空占位；片段展开后不得夹带会被丢弃的可见文本。 */
function attributable(children: ReactNode, scope: string): ReactElement[] {
  const out: ReactElement[] = []
  for (const node of Children.toArray(children)) {
    if (typeof node === 'string' && node.trim() === '')
      continue
    if (!isValidElement(node))
      throw new Error(`[xh] ${scope} asChild 需要恰好一个可挂载子节点，不能包含非空文本或其他不可挂载内容`)
    if (node.type === Fragment) {
      out.push(...attributable((node.props as { children?: ReactNode }).children, scope))
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
 * @returns 合并后的元素；子节点不合规时抛错
 */
export function mergeIntoChild(
  children: ReactNode,
  props: Record<string, unknown>,
  scope: string,
): ReactElement {
  const candidates = attributable(children, scope)
  if (candidates.length !== 1)
    throw new Error(`[xh] ${scope} asChild 需要恰好一个可挂载子节点，实际是 ${candidates.length} 个`)
  const child = candidates[0]!

  // 子节点自带解剖标记时不覆盖它，只落接线属性；否则整套属性都给它
  const keepAnatomy = !carriesOwnAnatomy(child)
  const own: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(props)) {
    if (!keepAnatomy && (key === 'data-scope' || key === 'data-part'))
      continue
    own[key] = value
  }

  // 作者的那一份排在前：同名处理器串起来时作者先跑，部件后跑。传进来的 props 已经把
  // 写在部件上的那一份按同一个先后合过（mergePartProps），所以写在子节点上还是写在部件上，
  // 作者的处理器都在部件之前。普通值反过来由部件说了算：data-part 与各种 aria 接线是这个
  // 部件的身份，作者盖掉它就等于把角色拆了。
  //
  // ref 两边都要拿到节点：React 19 里 ref 是普通 prop，直接后盖前会让作者那一份收不到。
  const childProps = child.props as Record<string, unknown>
  const merged = mergeReactProps(childProps, own)
  const events = mergePartProps(own, childProps)
  for (const key of Object.keys(events)) {
    if (isEventHandlerKey(key))
      merged[key] = events[key]
  }
  return cloneElement(child, merged)
}

export interface AsChildProps {
  /** 借用作者的子节点当本部件，不再渲染自己的包裹元素；子节点须恰好一个。 */
  asChild?: boolean
}

/**
 * 部件的渲染出口：开启 asChild 后必须提供合法子节点，否则抛错；未开启时用默认元素。
 * 合并顺序与不开 asChild 时一致，两条路产出的属性相同。
 */
export function renderAsChild(
  asChild: boolean | undefined,
  children: ReactNode,
  props: Record<string, unknown>,
  scope: string,
  fallback: (props: Record<string, unknown>, children: ReactNode) => ReactElement,
): ReactNode {
  if (asChild)
    return mergeIntoChild(children, props, scope)
  return fallback(props, children)
}
