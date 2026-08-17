// 数值处理的纯函数：不碰 DOM、不认识状态机。

/** 空串与纯空白视为"没有值"，返回 NaN；不合法的输入同样是 NaN。 */
export function parseValue(raw: string): number {
  const trimmed = raw.trim()
  if (trimmed === '')
    return Number.NaN
  // Number() 而非 parseFloat：'12abc' 该判为非法，parseFloat 会截成 12
  return Number(trimmed)
}

export function isValidValue(raw: string): boolean {
  return Number.isFinite(parseValue(raw))
}

/**
 * 显示串与数之间的换算。两边都缺省时走 parseValue / String，即原来的行为。
 *
 * 两个方向要互逆：format 出来的串必须能被 parse 读回同一个数，否则加减一步就会漂。
 */
export interface NumberCodec {
  /** 显示串 → 数。读不出数就返回 NaN（等同于"这一格还没有值"）。 */
  parse?: (text: string) => number
  /** 数 → 显示串。只在组件自己改写显示时用（步进、取端点、失焦规范化）。 */
  format?: (value: number) => string
}

/** 按 codec 把显示串读成数；作者的 parse 返回了非数时按 NaN 处理，不让它污染后续计算。 */
export function decodeNumber(raw: string, codec?: NumberCodec): number {
  if (!codec?.parse)
    return parseValue(raw)
  const n = codec.parse(raw)
  return typeof n === 'number' ? n : Number.NaN
}

/** 按 codec 把数写成显示串；作者的 format 返回了非串时退回 String(value)。 */
export function encodeNumber(value: number, codec?: NumberCodec): string {
  if (!codec?.format)
    return String(value)
  const s = codec.format(value)
  return typeof s === 'string' ? s : String(value)
}

export function clamp(value: number, min?: number, max?: number): number {
  if (min != null && value < min)
    return min
  if (max != null && value > max)
    return max
  return value
}

/**
 * 把外来的下标收成数组里真实存在的位置。
 * 小数取整、非有限值按 0，越界夹到两端；长度为 0 时给 0。
 * 不收的话 `out[index] = x` 会把数组撑长并在中间凿出空洞。
 */
export function clampIndex(index: number, length: number): number {
  if (length <= 0)
    return 0
  const whole = Number.isFinite(index) ? Math.trunc(index) : 0
  return Math.min(Math.max(whole, 0), length - 1)
}

/** 步进后消掉浮点尾巴：按步长与基准里最长的小数位数回舍。 */
export function snapDecimals(value: number, ...refs: number[]): number {
  const digits = Math.max(...refs.map(decimalsOf), 0)
  if (digits === 0)
    return value
  return Number(value.toFixed(Math.min(digits, 20)))
}

function decimalsOf(n: number): number {
  if (!Number.isFinite(n))
    return 0
  // 科学计数法（1e-7）在字符串里没有小数点，取指数位
  const s = String(n)
  const exp = s.match(/e-(\d+)$/i)
  if (exp)
    return Number(exp[1]) + (s.split('e')[0]?.split('.')[1]?.length ?? 0)
  return s.split('.')[1]?.length ?? 0
}

export interface StepOptions extends NumberCodec {
  min?: number
  max?: number
  step: number
}

/** 从当前串走一步；空串或非法串时从 min（没有 min 则从 0）起步。 */
export function stepValue(raw: string, direction: 1 | -1, o: StepOptions): number {
  const current = decodeNumber(raw, o)
  const base = Number.isFinite(current) ? current : (o.min ?? 0)
  // 起步那一下不叠步长，空框按 ArrowUp 停在 min 本身
  const next = Number.isFinite(current) ? base + direction * o.step : base
  return clamp(snapDecimals(next, o.step, base), o.min, o.max)
}

/**
 * 展示用的规范化：把 12.50 收成 12.5、把越界值拉回区间；空串与非法串原样留给作者。
 * 给了 codec 时这一步同时是"补格式"的时机——用户手打的 1234 在此变回 1,234。
 */
export function normalizeValue(raw: string, o: { min?: number, max?: number } & NumberCodec): string {
  const n = decodeNumber(raw, o)
  if (!Number.isFinite(n))
    return raw
  return encodeNumber(clamp(n, o.min, o.max), o)
}
