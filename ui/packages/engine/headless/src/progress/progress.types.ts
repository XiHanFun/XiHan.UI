import type { PropTypes, Size, Tone } from '@xihan-ui/core'

/** 形态：线形是一条横轨，环形与仪表盘把同一份进度画成一个圆。 */
export type ProgressVariant = 'line' | 'circle' | 'dashboard'

/** 仪表盘的缺口朝哪一侧。 */
export type ProgressGapPosition = 'top' | 'right' | 'bottom' | 'left'

export interface ProgressProps {
  /** 当前进度值，越界会被夹到 [0, max]；非有限值按 0 处理。 */
  value?: number
  /**
   * 进度未知：条子改为往复动画，读屏那侧不报数。
   * 置真时 aria-valuenow 整个不发——ARIA 规定不确定进度以该属性缺席表达。
   */
  indeterminate?: boolean
  /** 满值上限，默认 100；非有限值或不为正时回落 100。 */
  max?: number
  /** 形态，默认 line。circle 画整环，dashboard 在环上留一个缺口。 */
  variant?: ProgressVariant
  /**
   * 环的线宽，走 viewBox 单位（整个环画在 100×100 里），默认 6。
   * 只对 circle / dashboard 生效——它改的是几何（半径跟着往里收），所以是 prop 不是令牌；
   * 线形的厚度仍走 --xh-progress-thickness。
   */
  strokeWidth?: number
  /** 缺口角度，默认 75。只对 dashboard 生效。 */
  gapDegree?: number
  /** 缺口朝向，默认 bottom。只对 dashboard 生效。 */
  gapPosition?: ProgressGapPosition
  /** 读屏播报的文字，覆盖默认的数值播报（进度不是百分比时用，如「第 3 步，共 8 步」）。 */
  valueText?: string
  /** 语气：brand / neutral / success / warning / danger / info，决定用哪族颜色 */
  tone?: Tone
  /** 尺寸：sm / md / lg。线形改轨道厚度，环形改直径 */
  size?: Size
}

export interface ProgressApi<T extends PropTypes = PropTypes> {
  /** 落定后的形态。 */
  variant: ProgressVariant
  /** 进度比例，[0,1]。 */
  ratio: number
  /** 进度百分比，取整。 */
  percent: number
  getRootProps: () => T['element']
  /** 承载环的 <svg>；线形不渲染它。 */
  getCanvasProps: () => T['element']
  getTrackProps: () => T['element']
  getRangeProps: () => T['element']
  /** 环心那一块：落位归皮肤，写什么归作者。线形用不到。 */
  getLabelProps: () => T['element']
}

/** 读屏用的文案。本组件目前没有需要外露的文案，位先留着。 */
export interface ProgressTranslations {}
