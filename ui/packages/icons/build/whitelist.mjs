// 标签与属性白名单。这是契约的一部分：白名单外的标签、属性名、属性值一律构建期报错，
// 不静默丢弃——图标是视觉件，少一块要人眼才看得出来。
import { fail } from './error.mjs'

/** 允许出现在记录里的标签，与 core 的 IconTag 联合逐项对应。 */
export const ALLOWED_TAGS = new Set([
  'path',
  'circle',
  'ellipse',
  'rect',
  'line',
  'polyline',
  'polygon',
  'g',
  'defs',
  'clipPath',
  'mask',
  'linearGradient',
  'radialGradient',
  'stop',
])

/** 对渲染无贡献、连同子树一起丢弃的标签。 */
export const DROPPED_TAGS = new Set(['title', 'desc'])

/** 允许的属性名，按类目列。名字区分大小写（clipPathUnits 不是 clippathunits）。 */
export const ALLOWED_ATTRS = new Set([
  // 几何
  'd',
  'cx',
  'cy',
  'r',
  'rx',
  'ry',
  'x',
  'y',
  'x1',
  'y1',
  'x2',
  'y2',
  'width',
  'height',
  'points',
  'pathLength',
  // 变换
  'transform',
  // 填充描边
  'fill',
  'fill-opacity',
  'fill-rule',
  'clip-rule',
  'stroke',
  'stroke-width',
  'stroke-linecap',
  'stroke-linejoin',
  'stroke-miterlimit',
  'stroke-dasharray',
  'stroke-dashoffset',
  'stroke-opacity',
  'opacity',
  'vector-effect',
  // 裁剪遮罩
  'clip-path',
  'mask',
  'clipPathUnits',
  'maskUnits',
  'maskContentUnits',
  // 渐变
  'gradientUnits',
  'gradientTransform',
  'spreadMethod',
  'fx',
  'fy',
  'offset',
  'stop-color',
  'stop-opacity',
  // 标识（只有被同一条记录内的 url(#id) 引用时才会留到产物里）
  'id',
])

/** 只允许出现在根 <svg> 上的属性。 */
export const ROOT_ONLY_ATTRS = new Set(['viewBox'])

/**
 * 根 <svg> 上直接丢掉的属性。
 * width / height 归皮肤；命名空间声明由渲染端的 createElementNS 决定，记录里带一份只会产生歧义。
 */
export const ROOT_DROPPED_ATTRS = new Set([
  'width',
  'height',
  'xmlns',
  'xmlns:xlink',
  'xmlns:svg',
  'version',
  'baseProfile',
  'xml:space',
  'xml:lang',
])

/** 名字层面点名挡掉的键，报错文案按理由分开写。 */
const NAMED_BANS = [
  [name => /^on/i.test(name), '事件属性一律不收（按 on 前缀挡，不按名单）'],
  [name => name.includes(':'), '带命名空间前缀的属性一律不收'],
  [name => name.toLowerCase() === 'style', '内联样式绕过分层，且是 url() 注入面'],
  [name => name.toLowerCase().startsWith('data-'), 'data-* 会被角色节点发现逻辑当成 part，闭成重新接线死循环'],
  [name => name.toLowerCase().startsWith('aria-'), '可及名字只从 label 来'],
  [name => name.toLowerCase() === 'role', '可及名字只从 label 来'],
  [name => name.toLowerCase() === 'class', '样式归皮肤'],
  [name => name.toLowerCase() === 'tabindex', '图标不可聚焦'],
  [name => name.toLowerCase() === 'xmlns', '命名空间由渲染端决定'],
  [name => name.toLowerCase() === 'href', '记录不引入任何外部引用'],
]

/** 去掉全部空白与控制字符并小写化，挡住 java(制表符)script: 这类插字符的写法。 */
function collapse(value) {
  let out = ''
  for (const ch of value) {
    const code = ch.codePointAt(0)
    if (code > 32 && code !== 127)
      out += ch
  }
  return out.toLowerCase()
}

/** 属性值里出现 url( 时，其后必须紧跟 #，且闭合于第一个 )。返回引用到的 id 列表。 */
function checkUrlReferences(name, value, where) {
  const refs = []
  if (/url\s+\(/i.test(value))
    fail(where, `属性 ${name} 的取值里 url 与 ( 之间有空白`)
  const re = /url\(/gi
  for (let m = re.exec(value); m; m = re.exec(value)) {
    const open = m.index + m[0].length
    if (value[open] !== '#')
      fail(where, `属性 ${name} 的取值只接受同文档片段引用 url(#id)，收到 ${JSON.stringify(value)}`)
    const close = value.indexOf(')', open)
    if (close < 0)
      fail(where, `属性 ${name} 的取值里 url( 没有闭合`)
    const id = value.slice(open + 1, close)
    if (!/^[a-z_][\w.-]*$/i.test(id))
      fail(where, `属性 ${name} 引用了非法的 id ${JSON.stringify(id)}`)
    refs.push(id)
  }
  return refs
}

/** 属性名过白名单，返回规范化后的名字。 */
export function assertAttrName(name, where, { rootOnly = false } = {}) {
  const trimmed = name.trim()
  for (const [hit, reason] of NAMED_BANS) {
    if (hit(trimmed))
      fail(where, `属性 ${JSON.stringify(name)} 不收：${reason}`)
  }
  if (ROOT_ONLY_ATTRS.has(trimmed)) {
    if (!rootOnly)
      fail(where, `属性 ${trimmed} 只允许出现在根 <svg> 上`)
    return trimmed
  }
  if (!ALLOWED_ATTRS.has(trimmed))
    fail(where, `属性 ${JSON.stringify(name)} 不在白名单里`)
  return trimmed
}

/** 属性值过安全检查，返回它引用到的 id 列表。 */
export function assertAttrValue(name, value, where) {
  const collapsed = collapse(value)
  if (collapsed.includes('javascript:') || collapsed.includes('vbscript:'))
    fail(where, `属性 ${name} 的取值里含脚本协议`)
  if (collapsed.includes('data:'))
    fail(where, `属性 ${name} 的取值里含 data: 协议`)
  if (value.includes('<') || value.includes('>'))
    fail(where, `属性 ${name} 的取值里含尖括号`)
  return checkUrlReferences(name, value, where)
}

/** 标签过白名单，返回 'keep'（收下）或 'drop'（连子树一起丢）。 */
export function classifyTag(tag, where) {
  if (DROPPED_TAGS.has(tag))
    return 'drop'
  if (!ALLOWED_TAGS.has(tag))
    fail(where, `标签 <${tag}> 不在白名单里`)
  return 'keep'
}
