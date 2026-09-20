// 逐家族豁免表：家族门禁共用的读取与双向过期反查。
//
// 七条家族门禁（边界、选中、阶梯、形状、滚动、按压、排版）与家族比对都在存量上会大面积判红，
// 迁移按组件逐个进仓。存量不进各门禁自己的永久登记表——那些表记的是「本来就不该有」的东西；
// 「尚未迁移」的记在 tooling/scripts/family-backlog.json，按门禁分段，一条一句理由。
//
// 每一条豁免都必须真被放行过一次：门禁跑完把没命中的条目判为过期，表只减不增。
// 条目数的上限由 tooling/testing/runners/family-backlog.spec.mjs 的快照与 CEILING 钉住，
// 迁走一个组件 = 删 JSON 条目 + 重录快照 + 下调 CEILING，三者同一提交可见。
import { readFile } from 'node:fs/promises'

export const BACKLOG_PATH = 'tooling/scripts/family-backlog.json'

/** 表里允许出现的分段：七条家族门禁各一段，motion 段给 check-motion-role 的存量。 */
export const SECTIONS = Object.freeze(['edge', 'selection', 'ladder', 'shape', 'scroll', 'press', 'text', 'motion'])

/** 键的形态：`组件:部件[:状态…]`，逐部件登记；`*:` 开头的整段总豁免不再允许（press 段的 data-pressed 通道已铺满并删除）。 */
const KEY = /^[\w-]+(?::{1,2}[^\s:]+)+$/

/**
 * 读整份表并校验形态。返回 { sections, problems }：problems 非空时表本身有错，门禁应直接判红。
 */
export async function readBacklog(path = BACKLOG_PATH) {
  const problems = []
  let raw
  try {
    raw = JSON.parse(await readFile(path, 'utf8'))
  }
  catch (error) {
    return { sections: {}, problems: [`${path} 读不到或不是合法 JSON：${error.message}`] }
  }
  const sections = {}
  for (const [name, entries] of Object.entries(raw)) {
    if (name === '$description')
      continue
    if (!SECTIONS.includes(name)) {
      problems.push(`${path}：分段 ${name} 不认识，只有 ${SECTIONS.join(' / ')}`)
      continue
    }
    if (entries == null || typeof entries !== 'object' || Array.isArray(entries)) {
      problems.push(`${path}：分段 ${name} 必须是「键: 理由」的对象`)
      continue
    }
    for (const [key, why] of Object.entries(entries)) {
      if (!KEY.test(key))
        problems.push(`${path}：${name} 段的键 ${key} 不是「组件:部件[:状态]」形态`)
      if (typeof why !== 'string' || !why.trim())
        problems.push(`${path}：${name} 段的 ${key} 缺理由`)
    }
    sections[name] = entries
  }
  return { sections, problems }
}

/**
 * 给一条门禁开一段豁免：
 * `excuse(key)` 在表里就记一次命中并返回 true；`stale()` 给出登记了却一次都没命中的键。
 * 同一段由两条门禁共用时（edge 段：三选一与 raised 登记），各自传 `owns` 圈出自己能命中的键，
 * 过期反查只看自己那份；没传就整段都归它。
 */
export async function openBacklog(section, { path = BACKLOG_PATH, owns = () => true } = {}) {
  if (!SECTIONS.includes(section))
    throw new Error(`family-backlog 没有 ${section} 这一段`)
  const { sections, problems } = await readBacklog(path)
  const entries = Object.fromEntries(Object.entries(sections[section] ?? {}).filter(([key]) => owns(key)))
  const hit = new Set()
  return {
    problems,
    size: Object.keys(entries).length,
    entries,
    /** 键在表里就放行并记命中。 */
    excuse(key) {
      if (!(key in entries))
        return false
      hit.add(key)
      return true
    },
    /** 命中过的条目数。 */
    get pending() {
      return hit.size
    },
    /** 登记了却没命中的键：豁免过期，表只减不增。 */
    stale() {
      return Object.keys(entries).filter(key => !hit.has(key)).map(key =>
        `${path}：${section} 段的 ${key} 已经不再命中——豁免过期，从表里删掉`)
    },
  }
}
