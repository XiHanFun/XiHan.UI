import type { PropTypes } from '@xihan-ui/core'
import type { QrLevel } from './qr-encode'

/** 根的三态：画出了码 / 没有可编码的内容 / 内容装不下。 */
export type QrCodeState = 'ready' | 'empty' | 'error'

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
  /** 深色模块合成的那条 `<path>` 的 d；没画出码时是空串，此时不该生成 path 节点。 */
  path: string
  /** 当前状态。 */
  state: QrCodeState
  /** 编码失败的原因；其余状态为 undefined。 */
  error: string | undefined
  /** 解析后的可及名字；没给名字时为 undefined，此时根退出无障碍树。 */
  label: string | undefined
  getRootProps: () => T['element']
}
