// SVG 源 -> IconRecord。走白名单、丢 title/desc、归一 viewBox、重写 id。
import { fail } from './error.mjs'
import { parseSvg } from './parse-svg.mjs'
import { planTransform, transformAttr } from './transform.mjs'
import { assertAttrName, assertAttrValue, classifyTag, ROOT_DROPPED_ATTRS } from './whitelist.mjs'

/** 图标名：小写、连字符分段。 */
const NAME_RE = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/

/** 收下的节点上，属性值里引用到的 id。 */
function collectRefs(node, into) {
  for (const id of node.refs)
    into.add(id)
  for (const child of node.children)
    collectRefs(child, into)
}

/** 定义过的 id，按出现顺序。 */
function collectDefinedIds(node, into, where) {
  const id = node.attrs.get('id')
  if (id !== undefined) {
    if (into.has(id))
      fail(where, `id ${JSON.stringify(id)} 在同一条记录里定义了两次`)
    into.set(id, null)
  }
  for (const child of node.children)
    collectDefinedIds(child, into, where)
}

/** 把 url(#旧) 换成 url(#新)，并改写 id 本身。 */
function rewriteIds(node, mapping) {
  const id = node.attrs.get('id')
  if (id !== undefined) {
    const next = mapping.get(id)
    if (next === null || next === undefined)
      node.attrs.delete('id')
    else
      node.attrs.set('id', next)
  }
  for (const [key, value] of node.attrs) {
    if (!value.includes('url('))
      continue
    node.attrs.set(key, value.replace(/url\(#([^)]*)\)/g, (whole, old) => {
      const next = mapping.get(old)
      return next ? `url(#${next})` : whole
    }))
  }
  for (const child of node.children)
    rewriteIds(child, mapping)
}

/**
 * 收下的中间节点转成 IconNode（attrs 与 children 为空时不产出那个键）。
 *
 * 一次性建全：分步挂属性会让推断类型停在首个字面量上，产出就不再静态满足 IconNode。
 *
 * @returns {import('@xihan-ui/kernel').IconNode}
 */
function toIconNode(node) {
  return {
    tag: node.tag,
    ...(node.attrs.size > 0 ? { attrs: Object.fromEntries(node.attrs) } : {}),
    ...(node.children.length > 0 ? { children: node.children.map(toIconNode) } : {}),
  }
}

/** 递归收下一棵子树；返回中间节点或 null（整棵被丢）。 */
function take(raw, where, transform) {
  if (raw.text !== undefined)
    fail(where, `图元里出现文本 ${JSON.stringify(raw.text)}，记录没有文本变体`)

  if (classifyTag(raw.tag, where) === 'drop')
    return null

  const attrs = new Map()
  const refs = []
  for (const [name, value] of raw.attrs) {
    const key = assertAttrName(name, where)
    refs.push(...assertAttrValue(key, value, where))
    attrs.set(key, transform ? transformAttr(raw.tag, key, value, transform, where) : value)
  }

  const children = []
  for (const child of raw.children) {
    const kept = take(child, where, transform)
    if (kept)
      children.push(kept)
  }

  return { tag: raw.tag, attrs, refs, children }
}

/**
 * 把一份 SVG 源转成 IconRecord。
 *
 * name 是规范化的图标名（`arrow-down` 这类），同时用作 id 重写的前缀。
 *
 * @returns {{ record: import('@xihan-ui/kernel').IconRecord, notes: string[] }}
 */
export function svgToIconRecord(source, name, file = `${name}.svg`) {
  if (!NAME_RE.test(name))
    fail(file, `图标名 ${JSON.stringify(name)} 必须是小写连字符分段`)

  const { root, notes } = parseSvg(source, file)
  const where = file

  if (root.tag !== 'svg')
    fail(where, `根元素必须是 <svg>，收到 <${root.tag}>`)

  let viewBox
  const rootAttrs = new Map()
  const rootRefs = []
  for (const [rawName, value] of root.attrs) {
    if (ROOT_DROPPED_ATTRS.has(rawName)) {
      notes.push(`丢弃根上的 ${rawName}`)
      continue
    }
    const key = assertAttrName(rawName, where, { rootOnly: true })
    if (key === 'id')
      fail(where, '根 <svg> 不接受 id')
    rootRefs.push(...assertAttrValue(key, value, where))
    if (key === 'viewBox') {
      viewBox = value.trim().replace(/[\s,]+/g, ' ')
      continue
    }
    rootAttrs.set(key, value)
  }

  if (viewBox === undefined)
    fail(where, '根 <svg> 上没有 viewBox')

  const transform = planTransform(viewBox, where)

  const nodes = []
  for (const child of root.children) {
    const kept = take(child, where, transform)
    if (kept)
      nodes.push(kept)
  }
  if (nodes.length === 0)
    fail(where, '源里没有任何可收下的图元')

  if (transform) {
    for (const [key, value] of rootAttrs)
      rootAttrs.set(key, transformAttr('svg', key, value, transform, where))
  }

  // id 只在同一条记录里被 url(#id) 引用时才留下，且一律重写成 xh-<图标名>-<序号>
  const defined = new Map()
  for (const node of nodes)
    collectDefinedIds(node, defined, where)
  const referenced = new Set(rootRefs)
  for (const node of nodes)
    collectRefs(node, referenced)
  for (const id of referenced) {
    if (!defined.has(id))
      fail(where, `url(#${id}) 引用了一个没有定义的 id`)
  }
  let serial = 0
  for (const id of defined.keys()) {
    if (referenced.has(id))
      defined.set(id, `xh-${name}-${serial++}`)
  }
  for (const node of nodes)
    rewriteIds(node, defined)
  for (const [key, value] of rootAttrs) {
    if (value.includes('url(')) {
      rootAttrs.set(key, value.replace(/url\(#([^)]*)\)/g, (whole, old) => {
        const next = defined.get(old)
        return next ? `url(#${next})` : whole
      }))
    }
  }

  // 一次性建全：分步挂属性会让推断类型停在首个字面量上，丢掉 nodes 与 attrs
  const record = {
    name,
    viewBox: '0 0 24 24',
    ...(rootAttrs.size > 0 ? { attrs: Object.fromEntries(rootAttrs) } : {}),
    nodes: nodes.map(toIconNode),
  }
  return { record, notes }
}
