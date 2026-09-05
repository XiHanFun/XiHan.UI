import type { NavIntent } from '@xihan-ui/core'
import type { CommandGroup, CommandGroupMeta, CommandNode, CommandNodeMeta } from './command.types'

// 按检索串挑条目的纯函数：不碰 DOM、不认识解剖，把一份命令清单收成「此刻该显示的那几条」。
//
// 全程逐词做子串比对，不把检索串拼进正则：它是用户敲进搜索框的东西，
// 里面的 `.` `*` `(` `[` `\` 一旦被当成正则语法，轻则匹配到别的命令，重则整条构造抛错。

/** 没有归组的条目落在这个分组里；连接层据此判断要不要渲染分组外壳。 */
export const COMMAND_UNGROUPED = ''

/**
 * 检索串切词：按空白切开，空片段丢掉。
 * 切词而不是整串比，「新建 用户」才能命中「新建用户」之外的「用户新建」。
 */
export function normalizeCommandQuery(query: string): readonly string[] {
  return query.split(/\s+/).filter(term => term !== '')
}

/** 条目参与匹配的整段文本：标题、别名与分组名拼在一起。 */
function haystack(node: CommandNodeMeta, groupLabel: string): string {
  return [node.label, ...node.keywords, groupLabel].join(' ')
}

/** 每个词都要命中，顺序不限。一个词都没有即全数通过。 */
export function matchesCommandTerms(text: string, terms: readonly string[], caseSensitive: boolean): boolean {
  const target = caseSensitive ? text : text.toLowerCase()
  return terms.every(term => target.includes(caseSensitive ? term : term.toLowerCase()))
}

/** 清单条目补齐缺省值；标题缺省退回 value，别名恒为数组。 */
export function resolveCommandNode(node: CommandNode): CommandNodeMeta {
  return {
    value: node.value,
    label: node.label ?? node.value,
    keywords: node.keywords ? [...node.keywords] : [],
    group: node.group ?? COMMAND_UNGROUPED,
    disabled: !!node.disabled,
  }
}

/**
 * 把清单收成分组视图：过滤、归组、丢掉空组，组序按 groups 声明的次序，
 * 声明之外的组按它第一次出现的位置排在后面。组内条目保持清单原序。
 */
export function resolveCommandGroups(
  collection: readonly CommandNode[],
  groups: readonly CommandGroup[],
  query: string,
  options: { filter: boolean, caseSensitive: boolean },
): readonly CommandGroupMeta[] {
  const labelOf = new Map(groups.map(group => [group.value, group.label ?? group.value]))
  const terms = options.filter ? normalizeCommandQuery(query) : []

  // 组序：先按 groups 声明的次序占位，再按条目里出现的次序补。空组最后一并丢掉
  const order: string[] = groups.map(group => group.value)
  const bucket = new Map<string, CommandNodeMeta[]>()

  for (const node of collection) {
    const meta = resolveCommandNode(node)
    if (terms.length && !matchesCommandTerms(haystack(meta, labelOf.get(meta.group) ?? meta.group), terms, options.caseSensitive))
      continue
    if (!bucket.has(meta.group)) {
      bucket.set(meta.group, [])
      if (!labelOf.has(meta.group))
        order.push(meta.group)
    }
    bucket.get(meta.group)!.push(meta)
  }

  return order
    .filter(value => bucket.has(value))
    .map(value => ({
      value,
      label: labelOf.get(value) ?? value,
      items: bucket.get(value)!,
    }))
}

/** 分组视图摊平成一条条命令，次序即渲染次序，也就是方向键走的次序。 */
export function flattenCommandGroups(groups: readonly CommandGroupMeta[]): readonly CommandNodeMeta[] {
  return groups.flatMap(group => group.items)
}

/**
 * 方向键落点：在结果里挑下一条可用命令，禁用的跳过。
 *
 * 走数据不走 DOM——命令清单是这个组件自己的数据，此刻该显示哪几条它算得出来。
 * 查活 DOM 的话开场那一帧条目还没渲染出来，锚点就落不下去。
 */
export function navigateCommandResults(
  results: readonly CommandNodeMeta[],
  current: string | null,
  intent: NavIntent,
  loop: boolean,
): CommandNodeMeta | null {
  const usable = results.filter(item => !item.disabled)
  if (usable.length === 0)
    return null
  if (intent === 'first')
    return usable[0]!
  if (intent === 'last')
    return usable[usable.length - 1]!

  const at = current == null ? -1 : usable.findIndex(item => item.value === current)
  // 锚点不在可用结果里（被筛掉或本就禁用）：往下走从头起，往上走从尾起
  if (at === -1)
    return intent === 'next' ? usable[0]! : usable[usable.length - 1]!

  const next = intent === 'next' ? at + 1 : at - 1
  if (next >= 0 && next < usable.length)
    return usable[next]!
  return loop ? (intent === 'next' ? usable[0]! : usable[usable.length - 1]!) : usable[at]!
}
