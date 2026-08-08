// 坐标归一：源 viewBox 不是 0 0 24 24 时，把几何数值重写到 24 网格上。
// 只做等比缩放 + 平移，非正方形 viewBox 直接报错——非等比会把圆画成椭圆、把描边粗细拉歪。
import { fail } from './error.mjs'

const NUMBER = /[+-]?(?:\d*\.\d+|\d+\.?)(?:e[+-]?\d+)?/iy

/** 沿 x 轴取值的属性。 */
const X_ATTRS = new Set(['cx', 'x', 'x1', 'x2', 'fx'])
/** 沿 y 轴取值的属性。 */
const Y_ATTRS = new Set(['cy', 'y', 'y1', 'y2', 'fy'])
/** 只有长度意义、随缩放走的属性。 */
const LENGTH_ATTRS = new Set(['r', 'rx', 'ry', 'width', 'height', 'stroke-width', 'stroke-dashoffset'])
/** 逗号或空格分隔的长度列表。 */
const LENGTH_LIST_ATTRS = new Set(['stroke-dasharray'])

/** 缩放后带上 transform 的节点无法就地重写，收到就报错。 */
const TRANSFORM_ATTRS = new Set(['transform', 'gradientTransform'])

/** 单位随 viewBox 语义变化、缩放时无法判定的标签。 */
const UNIT_SENSITIVE_TAGS = new Set(['linearGradient', 'radialGradient', 'mask', 'clipPath'])

/** 数值转串：四位小数封顶，去掉多余的零与负零。 */
export function formatNumber(value) {
  const rounded = Math.round(value * 10000) / 10000
  const normalized = Object.is(rounded, -0) ? 0 : rounded
  return String(normalized)
}

/** 解析 viewBox 的四个数。 */
export function parseViewBox(value, where) {
  const parts = value.trim().split(/[\s,]+/)
  if (parts.length !== 4)
    fail(where, `viewBox 需要四个数，收到 ${JSON.stringify(value)}`)
  const nums = parts.map((p) => {
    const n = Number(p)
    if (!Number.isFinite(n))
      fail(where, `viewBox 里的 ${JSON.stringify(p)} 不是数`)
    return n
  })
  return { minX: nums[0], minY: nums[1], width: nums[2], height: nums[3] }
}

/**
 * 给出把源 viewBox 映射到 0 0 24 24 的等比变换；已经在 24 网格上时返回 null。
 */
export function planTransform(viewBox, where) {
  const box = parseViewBox(viewBox, where)
  if (box.width <= 0 || box.height <= 0)
    fail(where, `viewBox 的宽高必须为正，收到 ${JSON.stringify(viewBox)}`)
  if (box.width !== box.height)
    fail(where, `viewBox 必须是正方形才能归一到 0 0 24 24，收到 ${JSON.stringify(viewBox)}`)
  if (box.minX === 0 && box.minY === 0 && box.width === 24)
    return null
  return { scale: 24 / box.width, minX: box.minX, minY: box.minY }
}

function mapX(t, value) {
  return (value - t.minX) * t.scale
}

function mapY(t, value) {
  return (value - t.minY) * t.scale
}

/** 读一串数（用于 points 与长度列表）。 */
function readNumbers(text, where, label) {
  const out = []
  const trimmed = text.trim()
  if (trimmed === '')
    return out
  for (const piece of trimmed.split(/[\s,]+/)) {
    const n = Number(piece)
    if (!Number.isFinite(n))
      fail(where, `${label} 里的 ${JSON.stringify(piece)} 不是数`)
    out.push(n)
  }
  return out
}

/** 读一个数。 */
function readSingleNumber(text, where, label) {
  const nums = readNumbers(text, where, label)
  if (nums.length !== 1)
    fail(where, `${label} 需要恰好一个数，收到 ${JSON.stringify(text)}`)
  return nums[0]
}

/** points 按点对变换。 */
function transformPoints(value, t, where) {
  const nums = readNumbers(value, where, 'points')
  if (nums.length % 2 !== 0)
    fail(where, 'points 的数字个数必须是偶数')
  const out = []
  for (let i = 0; i < nums.length; i += 2)
    out.push(`${formatNumber(mapX(t, nums[i]))} ${formatNumber(mapY(t, nums[i + 1]))}`)
  return out.join(' ')
}

/** 每条命令的参数个数。 */
const PATH_ARITY = {
  M: 2,
  L: 2,
  T: 2,
  H: 1,
  V: 1,
  C: 6,
  S: 4,
  Q: 4,
  A: 7,
  Z: 0,
}

/**
 * 重写 path 的 d：绝对坐标走完整变换，相对坐标只缩放，弧的两个半径随缩放、旋转角与两个标志位原样保留。
 */
export function transformPathData(d, t, where) {
  let pos = 0
  const out = []

  const skipSep = () => {
    while (pos < d.length && (d[pos] === ',' || /\s/.test(d[pos])))
      pos++
  }
  const readNumber = () => {
    skipSep()
    NUMBER.lastIndex = pos
    const m = NUMBER.exec(d)
    if (!m)
      fail(where, `path 数据在第 ${pos} 个字符处缺少一个数：${JSON.stringify(d)}`)
    pos = NUMBER.lastIndex
    return Number(m[0])
  }
  const readFlag = () => {
    skipSep()
    const ch = d[pos]
    if (ch !== '0' && ch !== '1')
      fail(where, `path 的弧标志位只能是 0 或 1：${JSON.stringify(d)}`)
    pos++
    return ch
  }

  let previous = null
  while (true) {
    skipSep()
    if (pos >= d.length)
      break
    let command
    if (/[a-z]/i.test(d[pos])) {
      command = d[pos]
      pos++
      // 同一个 M/m 后面接的坐标对是隐式的 L/l
      previous = command === 'M' ? 'L' : command === 'm' ? 'l' : command
    }
    else {
      if (!previous)
        fail(where, `path 数据不是以命令字母开头：${JSON.stringify(d)}`)
      command = previous
    }

    const upper = command.toUpperCase()
    const absolute = command === upper
    const arity = PATH_ARITY[upper]
    if (arity === undefined)
      fail(where, `path 里出现未知命令 ${command}`)

    if (upper === 'Z') {
      out.push(command)
      continue
    }

    const args = []
    if (upper === 'A') {
      args.push(formatNumber(readNumber() * t.scale))
      args.push(formatNumber(readNumber() * t.scale))
      args.push(formatNumber(readNumber()))
      args.push(readFlag())
      args.push(readFlag())
      const x = readNumber()
      const y = readNumber()
      args.push(formatNumber(absolute ? mapX(t, x) : x * t.scale))
      args.push(formatNumber(absolute ? mapY(t, y) : y * t.scale))
    }
    else if (upper === 'H') {
      const x = readNumber()
      args.push(formatNumber(absolute ? mapX(t, x) : x * t.scale))
    }
    else if (upper === 'V') {
      const y = readNumber()
      args.push(formatNumber(absolute ? mapY(t, y) : y * t.scale))
    }
    else {
      for (let i = 0; i < arity; i += 2) {
        const x = readNumber()
        const y = readNumber()
        args.push(formatNumber(absolute ? mapX(t, x) : x * t.scale))
        args.push(formatNumber(absolute ? mapY(t, y) : y * t.scale))
      }
    }
    out.push(`${command}${args.join(' ')}`)
  }

  return out.join(' ')
}

/** 重写一个属性的取值。 */
export function transformAttr(tag, name, value, t, where) {
  if (TRANSFORM_ATTRS.has(name))
    fail(where, `源的 viewBox 不是 0 0 24 24，含 ${name} 的节点无法就地归一，请先把源画到 24 网格上`)
  if (UNIT_SENSITIVE_TAGS.has(tag))
    fail(where, `源的 viewBox 不是 0 0 24 24，<${tag}> 的单位随 units 属性变化，请先把源画到 24 网格上`)

  if (name === 'd')
    return transformPathData(value, t, where)
  if (name === 'points')
    return transformPoints(value, t, where)
  if (X_ATTRS.has(name))
    return formatNumber(mapX(t, readSingleNumber(value, where, name)))
  if (Y_ATTRS.has(name))
    return formatNumber(mapY(t, readSingleNumber(value, where, name)))
  if (LENGTH_ATTRS.has(name))
    return formatNumber(readSingleNumber(value, where, name) * t.scale)
  if (LENGTH_LIST_ATTRS.has(name)) {
    if (value.trim() === 'none')
      return value
    return readNumbers(value, where, name).map(n => formatNumber(n * t.scale)).join(' ')
  }
  return value
}
