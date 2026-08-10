import type { PropTypes } from '@xihan-ui/core'
import type { QrLevel } from './qr-encode'

/** 根的三态：画出了码 / 没有可编码的内容 / 内容装不下。 */
export type QrCodeState = 'ready' | 'empty' | 'error'

/**
 * 码点形状。
 *
 * 读码器按模块中心取样，三种形状的墨都盖住每个深色模块的几何中心：
 * · square 铺满整格；
 * · dot 是格内最大内切圆，半径半格，格心到墨边正好半格；
 * · rounded 是圆角 0.25 格的圆角方块，切掉的四个角够不着格心。
 */
export type QrModuleShape = 'square' | 'dot' | 'rounded'

/**
 * 码眼（三个定位图形）形状。
 *
 * 两种形状都保持 7×7 的同心结构——外环是 7×7 边框、内心是 3×3、中间留一圈白，
 * 不画成实心块：读码器沿扫描线找的是 1:1:3:1:1 这条深浅比例。
 * rounded 的外框圆角取 1 格；圆角超过 1.707 格时外环四角那格的格心会落到墨外。
 */
export type QrEyeShape = 'square' | 'rounded'

/**
 * logo 的落位，同时也是它底下那块挖空矩形。
 * 单位与 viewBox 相同（1 = 一个模块），四条边都压在模块边界上，不会切开半个模块。
 */
export interface QrCodeLogoArea {
  readonly x: number
  readonly y: number
  /** 边长，整数个模块，不超过每边模块数的 1/5。 */
  readonly size: number
}

export interface QrCodeProps {
  /** 要编码的内容，按 UTF-8 取字节走字节模式；空串不画码。 */
  value?: string
  /** 纠错级别 L / M / Q / H，缺省 M。 */
  level?: QrLevel
  /** 像素边长，缺省 160；写成根上的内联宽高。 */
  size?: number
  /** 静区宽度，单位是模块数，缺省 4；静区含在 viewBox 里，不占额外尺寸。 */
  margin?: number
  /** 可及名字，缺省用 value；给了全空白的名字等于没给。 */
  label?: string
  /** 码点形状，缺省 square。 */
  moduleShape?: QrModuleShape
  /** 码眼形状，缺省 square。时序图形与校正图形不受它影响，一律保持方块——它们是透视校正的几何基准。 */
  eyeShape?: QrEyeShape
  /**
   * 码面正中是否留一块给 logo。
   *
   * 留出来的那片模块会被底色盖住，对读码器而言等于人为污损：放 logo 就把 level 提到 Q 或 H，
   * L 与 M 那点纠错余量赔不起这一块。
   */
  logo?: boolean
}

export interface QrCodeApi<T extends PropTypes = PropTypes> {
  /** 模块矩阵，[行][列]，true = 深色；没画出码时是空数组。 */
  modules: readonly (readonly boolean[])[]
  /** 实际用到的版本；没画出码时为 0。 */
  version: number
  /** 每边模块数，不含静区；没画出码时为 0。 */
  count: number
  /** 解析后的静区宽度，单位是模块数。 */
  margin: number
  /** 根的 viewBox，含静区。 */
  viewBox: string
  /**
   * 数据模块合成的那条 `<path>` 的 d；没画出码时是空串，此时不该生成 path 节点。
   * 码点与码眼都是缺省形状时，三个码眼也并在这一条里。
   */
  path: string
  /** 三个码眼合成的那条 `<path>` 的 d；码点与码眼都是缺省形状时是空串，此时不该生成第二个 path 节点。 */
  eyePath: string
  /** logo 的落位与挖空矩形；没留位时为 undefined。 */
  logoArea: QrCodeLogoArea | undefined
  /** 当前状态。 */
  state: QrCodeState
  /** 编码失败的原因；其余状态为 undefined。 */
  error: string | undefined
  /** 解析后的可及名字；没给名字时为 undefined，此时根退出无障碍树。 */
  label: string | undefined
  getRootProps: () => T['element']
  /** 铺到 logo 部件上的落位；没留位时宽高都是 0，那块连同里面的图形一起不渲染。 */
  getLogoProps: () => T['element']
}
