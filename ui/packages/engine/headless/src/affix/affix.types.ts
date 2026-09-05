import type { MachineSchema, PropTypes } from '@xihan-ui/core'

/** 吸住时贴可视区的哪条边。 */
export type AffixSide = 'top' | 'bottom'

export interface AffixChangeDetails {
  /** 此刻是不是吸住了。 */
  affixed: boolean
}

/**
 * 吸住时 content 的落位，单位 px，参照窗口视口。
 * 四个数都是实测物理量，不换逻辑属性：它们照 root 的矩形算出来，换成起始缘会在 RTL 下贴反。
 */
export interface AffixPin {
  /** 贴上边还是下边。 */
  side: AffixSide
  /** 距该边的距离。 */
  offset: number
  /** 左边缘的位置。 */
  left: number
  /** 宽度，照 root 的实测值；脱离常规流后不再由父级撑开。 */
  width: number
}

/** 占位盒要撑住的尺寸，单位 px。 */
export interface AffixSize {
  width: number
  height: number
}

/** 适配器在挂载前填入的 DOM 取值口。 */
export interface AffixRefs {
  /** 占位盒节点：判定线与占位尺寸都量它。 */
  getRootEl: () => HTMLElement | null
  /** 滚动容器，返回 null 即整页滚动。 */
  getTargetEl: () => HTMLElement | null
}

export interface AffixSchema extends MachineSchema {
  props: {
    /** 吸住后距滚动容器可视区上边的距离（px）。 */
    offsetTop?: number
    /** 吸住后距滚动容器可视区下边的距离（px）；给了它就改贴下边。 */
    offsetBottom?: number
    /** 吸附状态变化回调。 */
    onAffixChange?: (details: AffixChangeDetails) => void
  }
  context: {
    /** 吸住时 content 的落位；没吸住为 null。 */
    pin: AffixPin | null
    /** 占位尺寸；还没量到为 null。 */
    placeholder: AffixSize | null
  }
  computed: Record<string, never>
  refs: AffixRefs
  /** released 在常规流里；affixed 已脱流钉在可视区边上。 */
  state: 'released' | 'affixed'
  event:
    /** 观察器结算出的一帧：该不该吸住、吸住的话钉在哪、占位盒该撑多大。 */
    | { type: 'SCROLL.RESOLVE', affixed: boolean, pin: AffixPin | null, placeholder: AffixSize | null }
  tag: never
  guard: 'shouldAffix' | 'shouldRelease'
  action: 'applyGeometry' | 'invokeOnChange'
  effect: 'trackScroll'
}

export interface AffixApi<T extends PropTypes = PropTypes> {
  /** 此刻是不是吸住了。 */
  affixed: boolean
  getRootProps: () => T['element']
  getContentProps: () => T['element']
}

/** 读屏用的文案。本组件目前没有需要外露的文案，位先留着。 */
export interface AffixTranslations {}
