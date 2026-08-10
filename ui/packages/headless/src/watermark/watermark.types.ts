import type { PropTypes } from '@xihan-ui/core'

/** 两态：算出了图样 / 没有可印的文字。empty 时皮肤整层不画。 */
export type WatermarkState = 'ready' | 'empty'

/** 一块图样的像素尺寸，也是平铺时的步距。 */
export interface WatermarkTile {
  readonly width: number
  readonly height: number
}

export interface WatermarkProps {
  /**
   * 水印文字。给数组就是多行，单个字符串里的换行同样断行；
   * 去掉空白行——它只让图样长高，印不出任何东西。
   */
  text?: string | string[]
  /** 倾斜角度，单位度，缺省 -22。 */
  rotate?: number
  /** 两块图样之间留的空白，单位像素，缺省 24。 */
  gap?: number
  /** 字号，单位像素，缺省 14。 */
  fontSize?: number
  /** 印子的深浅，0 到 1，缺省 0.15。 */
  opacity?: number
}

export interface WatermarkApi<T extends PropTypes = PropTypes> {
  /** 归一化后的文字行；没有可印的文字时是空数组。 */
  lines: readonly string[]
  /** 图样尺寸，即平铺步距；没有图样时宽高都是 0。 */
  tile: WatermarkTile
  /** 图样的 data URI；没有图样时是空串。 */
  image: string
  state: WatermarkState
  getRootProps: () => T['element']
  getContentProps: () => T['element']
}
