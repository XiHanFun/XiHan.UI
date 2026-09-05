import type { Placement } from '@xihan-ui/core'

// 浮层交给定位引擎的默认落点与间距；各族机器统一引这里，不靠引擎自己的兜底。

/** 气泡类浮层（tooltip / hover-card / popover / popconfirm / tour）的默认落点：居中对着锚点。 */
export const OVERLAY_PLACEMENT_ANCHORED: Placement = 'bottom'

/** 列表类浮层（select / combobox / 各 picker / menu 族）的默认落点：起始缘与锚点对齐。 */
export const OVERLAY_PLACEMENT_LIST: Placement = 'bottom-start'

/** 浮层与锚点之间的默认间距（px）。 */
export const OVERLAY_OFFSET = 8

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
 * 浮层此刻是否已经落位——这是它能不能被看见的唯一判据。
 *
 * 坐标依赖浮层自己的尺寸，而尺寸要等元素进 DOM 参与排版才量得到，
 * 「先定位再展开」做不到，顺序只能是渲染、量、定位。所以默认态是藏着：
 * 皮肤基线给所有定位层 visibility: hidden，只有带 data-positioned 的才露出来。
 * 这样忘了接线的新浮层只会不显示（响亮失败），而不是先在视口左上角闪一帧。
 *
 * 判据与展开态无关：收起中的面板要留着上一次的坐标把退场播完；
 * 重开前由各机器的 trackPosition 先把坐标清掉，于是再次落位前同样藏着。
 * (0, 0) 是合法坐标，不能拿它当「还没算」——只认 x 是否存在。
 *
 * 藏用 visibility 而非 display：后者会让浮层退出排版，引擎量不到尺寸，于是永远算不出位置。
 */
export function overlayPositioned(position: OverlayPlacementLike | null | undefined): boolean {
  return position?.x != null && position.hidden !== true
}
