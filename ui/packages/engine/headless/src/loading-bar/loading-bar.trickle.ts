// 假进度的值域与爬升算法。

/** 进度值域上界。 */
export const LOADING_BAR_MAX = 100

/** 不确定进度的爬升上限，自行爬升永远到不了 100。 */
export const LOADING_BAR_CEILING = 99.4

/** 起步值缺省：开始加载时直接跳到这里。 */
export const LOADING_BAR_MINIMUM = 8

/** 一步吃掉剩余量的比例区间。 */
export const LOADING_BAR_STEP_MIN_RATIO = 0.02
export const LOADING_BAR_STEP_MAX_RATIO = 0.12

/** 给了 value 就是确定进度：值归宿主，机器不再写入。判据与 context cell 的受控判据一致。 */
export function isLoadingBarDeterminate(value: number | undefined): boolean {
  return value !== undefined
}

/** 把数值夹进 [0, 100]；非有限数按 0 处理。 */
export function clampLoadingBarValue(value: number | undefined): number {
  if (value == null || !Number.isFinite(value))
    return 0
  return Math.min(Math.max(value, 0), LOADING_BAR_MAX)
}

/** 起步值归一：夹进 [0, 爬升上限]，缺省或非有限数用默认值。 */
export function resolveLoadingBarMinimum(minimum: number | undefined): number {
  if (minimum == null || !Number.isFinite(minimum))
    return LOADING_BAR_MINIMUM
  return Math.min(Math.max(minimum, 0), LOADING_BAR_CEILING)
}

/**
 * 爬一步：按剩余量取一个随机小比例往前挪，步长随进度递减，永远到不了爬升上限。
 * random 可注入以便测试。
 */
export function nextLoadingBarValue(current: number, random: () => number = Math.random): number {
  const from = clampLoadingBarValue(current)
  // 已经贴着上限：停在上限
  if (from >= LOADING_BAR_CEILING)
    return LOADING_BAR_CEILING

  const raw = random()
  // 随机源给了越界值或 NaN 时退回最小比例
  const unit = Number.isFinite(raw) ? Math.min(Math.max(raw, 0), 1) : 0
  const ratio = LOADING_BAR_STEP_MIN_RATIO + (LOADING_BAR_STEP_MAX_RATIO - LOADING_BAR_STEP_MIN_RATIO) * unit
  const next = from + (LOADING_BAR_CEILING - from) * ratio

  // 留两位小数；贴近上限时步长会被舍成 0，自然停住
  return Math.min(Math.round(next * 100) / 100, LOADING_BAR_CEILING)
}
