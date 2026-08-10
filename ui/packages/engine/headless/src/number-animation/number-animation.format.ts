// 展示格式化：定小数位 + 千位分隔。纯字符串处理，不认识动画也不认识 DOM。

/** 小数位缺省：整数。 */
export const NUMBER_ANIMATION_PRECISION = 0

/** 小数位上限，与 toFixed 的定义域一致。 */
export const NUMBER_ANIMATION_PRECISION_MAX = 20

/** 小数位归一：取整并夹进 [0, 20]，缺省或非有限数退回 0。 */
export function resolveNumberAnimationPrecision(precision: number | undefined): number {
  if (precision == null || !Number.isFinite(precision))
    return NUMBER_ANIMATION_PRECISION
  return Math.min(Math.max(Math.trunc(precision), 0), NUMBER_ANIMATION_PRECISION_MAX)
}

/** 从个位往左每三位插一个分隔符。 */
function groupThousands(whole: string, separator: string): string {
  let out = ''
  for (let end = whole.length; end > 0; end -= 3) {
    const head = Math.max(0, end - 3)
    const chunk = whole.slice(head, end)
    out = out === '' ? chunk : `${chunk}${separator}${out}`
  }
  return out
}

/**
 * 按小数位定长，再按分隔符分组整数位。
 *
 * 分隔符缺省为空串：插逗号还是空格是地区习惯，库不替作者猜。
 * 定长之后整个数是零就不带负号：-0.4 保留一位小数是 -0.4，取整之后写成 "-0" 只会让人以为坏了。
 */
export function formatNumberAnimation(value: number, precision: number, separator?: string): string {
  const safe = Number.isFinite(value) ? value : 0
  const fixed = Math.abs(safe).toFixed(precision)
  const sign = safe < 0 && Number.parseFloat(fixed) !== 0 ? '-' : ''
  const [whole = '0', fraction] = fixed.split('.')
  const grouped = separator ? groupThousands(whole, separator) : whole
  return fraction ? `${sign}${grouped}.${fraction}` : `${sign}${grouped}`
}
