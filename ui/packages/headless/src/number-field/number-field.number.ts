// 数值这一路的纯函数：不碰 DOM、不认识状态机，单独测。
// 之所以整块拎出来，是因为数字输入的坑几乎全在这里——浮点步进的尾巴、
// 边界回绕、空串与非法串的区分——放在机器里会被状态转移淹没。

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

export function clamp(value: number, min?: number, max?: number): number {
  if (min != null && value < min)
    return min
  if (max != null && value > max)
    return max
  return value
}

/**
 * 步进后消掉浮点尾巴：0.1 + 0.2 直接算是 0.30000000000000004，
 * 用户看到的框里就会冒出一串 0。按"步长与基准里最长的那个小数位数"回舍。
 */
export function snapDecimals(value: number, ...refs: number[]): number {
  const digits = Math.max(...refs.map(decimalsOf), 0)
  if (digits === 0)
    return value
  // toFixed 再转回数值：只为了截掉尾巴，不改变量级
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

export interface StepOptions {
  min?: number
  max?: number
  step: number
}

/**
 * 从当前串走一步。空串/非法串时从 min（没有 min 则从 0）起步，
 * 这样一个空输入框按 ArrowUp 也有确定的落点，而不是变成 NaN。
 */
export function stepValue(raw: string, direction: 1 | -1, o: StepOptions): number {
  const current = parseValue(raw)
  const base = Number.isFinite(current) ? current : (o.min ?? 0)
  // 起步那一下不再叠步长：空框按 ArrowUp 应停在 min 本身，而不是 min + step
  const next = Number.isFinite(current) ? base + direction * o.step : base
  return clamp(snapDecimals(next, o.step, base), o.min, o.max)
}

/** 展示用的规范化：把 12.50 收成 12.5、把越界值拉回区间；空串与非法串原样留给作者。 */
export function normalizeValue(raw: string, o: { min?: number, max?: number }): string {
  const n = parseValue(raw)
  if (!Number.isFinite(n))
    return raw
  return String(clamp(n, o.min, o.max))
}
