// 从服务端直出的 HTML 串里扫出带 data-scope / data-part 的标签。
// 服务端这一层没有 DOM，解析不走 DOMParser，只按开标签逐个取属性。

/** 一个开标签上采到的解剖标记。part 为 null = 该标签只有 data-scope。 */
export interface ScopedTag {
  readonly tag: string
  readonly scope: string
  readonly part: string | null
}

// 开标签：`<` 后跟标签名，属性段里的引号成对跳过，避免属性值里的 `>` 提前收尾。
// 注释与 `<!--[-->` 这类片段锚点以 `<!` 开头，被标签名的首字符约束排除在外。
const OPEN_TAG = /<([a-z][\w:-]*)((?:[\s/](?:"[^"]*"|'[^']*'|[^>"'])*)?)>/gi
const SCOPE_ATTR = /(?:^|\s)data-scope="([^"]*)"/
const PART_ATTR = /(?:^|\s)data-part="([^"]*)"/

/** 扫出全部带 data-scope 的标签；只有 data-part 没有 data-scope 的标签也会被收进来。 */
export function scanScopedTags(html: string): ScopedTag[] {
  const out: ScopedTag[] = []
  OPEN_TAG.lastIndex = 0
  let m: RegExpExecArray | null = OPEN_TAG.exec(html)
  while (m !== null) {
    const attrs = m[2] ?? ''
    const scope = SCOPE_ATTR.exec(attrs)?.[1]
    const part = PART_ATTR.exec(attrs)?.[1]
    if (scope != null || part != null)
      out.push({ tag: m[1]!.toLowerCase(), scope: scope ?? '', part: part ?? null })
    m = OPEN_TAG.exec(html)
  }
  return out
}
