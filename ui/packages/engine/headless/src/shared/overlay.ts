// 浮层箭头交给定位引擎的量。引擎量不到箭头，只能由这边按皮肤的设计档位交进去。

/**
 * 箭头在交叉轴上占的宽度。皮肤画的是边长 --xh-overlay-arrow-size（8px）的方块转 45 度，
 * 交叉轴上占的是它的对角线。
 */
export const OVERLAY_ARROW_SIZE = 8 * Math.SQRT2

/** 箭头中心距浮层两端的最小距离，让开圆角 --xh-shape-surface（8px）。 */
export const OVERLAY_ARROW_PADDING = 8
