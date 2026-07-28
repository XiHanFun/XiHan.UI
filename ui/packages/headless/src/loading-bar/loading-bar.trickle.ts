// 假进度的值域与爬升算法。
//
// 单独成文件是因为这是本组件唯一有分量的逻辑，而且与状态机、DOM 都无关：
// 给定当前值算出下一个值，"0 起步""逼近上限不越界"这些边界在这里一次性钉死，
// 不散落到动作里被状态转移淹没。

/** 进度值域上界。 */
export const LOADING_BAR_MAX = 100

/**
 * 不确定进度的爬升上限。
 *
 * 假进度永远够不到 100：到 100 意味着"事情办完了"，而此刻只有宿主知道办没办完。
 * 留下这一线余地，loading 转 false 时那一下冲刺才有东西可冲——
 * 若爬升本身就能顶到 100，用户会看见条子早早满格然后干杵着，比不动更像坏了。
 */
export const LOADING_BAR_CEILING = 99.4

/** 起步值缺省：一开始就跳到这里，让人立刻看见有东西在动，而不是盯着一条空槽。 */
export const LOADING_BAR_MINIMUM = 8

/**
 * 一步吃掉剩余量的比例区间。
 *
 * 步长按**剩余量**取而不是取固定增量，就是"越接近上限爬得越慢"的全部实现；
 * 比例再随机一点，画面才不像一段匀速动画那样一眼假。
 */
export const LOADING_BAR_STEP_MIN_RATIO = 0.02
export const LOADING_BAR_STEP_MAX_RATIO = 0.12

/**
 * 给了 value 就是确定进度：值归宿主，机器一个字都不往里写。
 *
 * 判据必须与 context cell 的受控判据（value !== undefined）逐字一致：
 * 两者一旦分家，就会出现"机器以为自己能写、cell 却把写入丢掉"的死局——
 * 条子停在 0 不动，谁都不认为是自己的错。
 */
export function isLoadingBarDeterminate(value: number | undefined): boolean {
  return value !== undefined
}

/** 把任意来路的数值夹进 [0, 100]；非有限数按 0 处理（宿主塞了个 NaN 不该让条子消失或撑爆）。 */
export function clampLoadingBarValue(value: number | undefined): number {
  if (value == null || !Number.isFinite(value))
    return 0
  return Math.min(Math.max(value, 0), LOADING_BAR_MAX)
}

/**
 * 起步值归一：夹进 [0, 爬升上限]，缺省或非有限数用默认值。
 * 上界取爬升上限而不是 100：起步就顶到 100 等于宣布事情已经办完。
 */
export function resolveLoadingBarMinimum(minimum: number | undefined): number {
  if (minimum == null || !Number.isFinite(minimum))
    return LOADING_BAR_MINIMUM
  return Math.min(Math.max(minimum, 0), LOADING_BAR_CEILING)
}

/**
 * 爬一步：按剩余量取一个随机小比例往前挪，因此步长随进度递减，
 * 走多少步都到不了上限（每步只吃掉剩余量的一小块，是个收敛的几何级数）。
 *
 * random 做成参数而不是直接调 Math.random：随机性是这个算法的一部分，
 * 要能被钉死了测——最小步、最大步、坏随机源三条边界都得验得到。
 */
export function nextLoadingBarValue(current: number, random: () => number = Math.random): number {
  const from = clampLoadingBarValue(current)
  // 已经贴着上限：停在上限，不越界也不倒退
  if (from >= LOADING_BAR_CEILING)
    return LOADING_BAR_CEILING

  const raw = random()
  // 随机源给了越界值或 NaN（宿主自带的伪随机实现真会这样）时退回最小比例：
  // 不能让一个坏的随机源把步长算成负数、NaN，或一步跨到上限
  const unit = Number.isFinite(raw) ? Math.min(Math.max(raw, 0), 1) : 0
  const ratio = LOADING_BAR_STEP_MIN_RATIO + (LOADING_BAR_STEP_MAX_RATIO - LOADING_BAR_STEP_MIN_RATIO) * unit
  const next = from + (LOADING_BAR_CEILING - from) * ratio

  // 留两位小数：宽度百分比再精细也看不出来，而浮点尾巴会把 onValueChange 的载荷弄得没法看。
  // 贴近上限时这一步会被舍成 0，也就是自然停住——正是"永远到不了 100"想要的形状
  return Math.min(Math.round(next * 100) / 100, LOADING_BAR_CEILING)
}
