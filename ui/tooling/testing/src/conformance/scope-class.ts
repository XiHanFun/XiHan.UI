// 皮肤挂载类与 data-scope 的一一对应：一致性轨迹每录一帧就核一遍整份文档。

import { SCOPE_CLASS_PREFIX } from '@xihan-ui/core'

/**
 * 带 data-scope="x" 的节点必带且只带一个挂载类 xh-scope-x；带挂载类的节点必有同名的 data-scope。
 *
 * 皮肤产物以挂载类领头：少了它节点就没有皮肤，多出别的组件的挂载类就同时吃两份皮肤
 * （asChild 把部件属性合进自带解剖的子节点时，挂载类要随 data-scope 一起让位）。
 * @param doc 轨迹所在的文档，浮层迁到 portal 落点的节点一并核
 * @param where 失败时报出的位置
 */
export function assertScopeClasses(doc: Document, where: string): void {
  const problems: string[] = []
  const describe = (el: Element): string => `<${el.localName} data-scope="${el.getAttribute('data-scope') ?? ''}" data-part="${el.getAttribute('data-part') ?? ''}" class="${el.getAttribute('class') ?? ''}">`
  for (const el of doc.querySelectorAll('[data-scope]')) {
    const mounts = [...el.classList].filter(token => token.startsWith(SCOPE_CLASS_PREFIX))
    const want = SCOPE_CLASS_PREFIX + el.getAttribute('data-scope')
    if (mounts.length !== 1 || mounts[0] !== want)
      problems.push(`${describe(el)} 的挂载类应当恰好是 ${want}`)
  }
  for (const el of doc.querySelectorAll(`[class*="${SCOPE_CLASS_PREFIX}"]`)) {
    if (!el.hasAttribute('data-scope') && [...el.classList].some(token => token.startsWith(SCOPE_CLASS_PREFIX)))
      problems.push(`${describe(el)} 带挂载类却没有 data-scope`)
  }
  if (problems.length)
    throw new Error(`${where}：挂载类与 data-scope 对不上\n  ${problems.slice(0, 8).join('\n  ')}`)
}
