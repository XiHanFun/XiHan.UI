// 浮层箭头交给定位引擎的量。引擎量不到箭头，只能由这边按皮肤的设计档位交进去。

/**
 * 箭头在交叉轴上占的宽度。皮肤画的是边长 --xh-overlay-arrow-size（8px）的方块转 45 度，
 * 交叉轴上占的是它的对角线。
 */
export const OVERLAY_ARROW_SIZE = 8 * Math.SQRT2

/** 箭头中心距浮层两端的最小距离，让开圆角 --xh-shape-surface（8px）。 */
export const OVERLAY_ARROW_PADDING = 8

/** 定位结果的最小形状：算出来才有坐标，锚点滚出视区时引擎置 hidden。 */
export interface OverlayPlacementLike {
  x?: number
  y?: number
  hidden?: boolean
}

/**
 * 浮层此刻是否**还没落位**——没落位就不该被看见。
 *
 * 坐标算不出来是因为它依赖浮层自己的尺寸，而尺寸要等元素进 DOM 参与排版才量得到——
 * 「先定位再展开」做不到，顺序只能是渲染、量、定位。机器为此把 attach 排到两轮渲染之后
 * （见各家 trackPosition 里的 flush），那两拍里坐标是兜底的 0。
 *
 * 所以判据取「未落位」：展开的那两拍先藏着，等引擎回报坐标再露出来。收起态返回假——
 * 那时浮层本来就不显示，不必也不该再挂这道信号。
 * 反过来写就成了「先在视口左上角闪一下，发现没坐标再补救」。
 *
 * 藏用 visibility 而非 display：后者会让浮层退出排版，引擎量不到尺寸，于是永远算不出位置。
 *
 * 「还没量完」与「锚点滚出可视区」是两回事，这里合成一个信号：两者的视觉后果同为
 * visibility: hidden，拆成两个属性会让 16 份皮肤各写两条规则做同一件事。
 * 使用者若要区分，读 position 本身即可——它是公开的。
 */
export function overlayUnplaced(open: boolean, position: OverlayPlacementLike | null | undefined): boolean {
  // 收起态不谈落位：那时浮层本来就不显示，再挂一道「未落位」是多余的信号
  if (!open)
    return false
  // 锚点被滚出可视区时引擎置 hidden，那也不该露
  return position?.x == null || position.hidden === true
}
