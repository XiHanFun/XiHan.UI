import type { PropTypes } from '@xihan-ui/kernel'
import type { MachineSchema } from '@xihan-ui/machine'

/** 滚回顶部的方式：auto 一步到位，smooth 平滑滚过去。 */
export type BackTopBehavior = 'auto' | 'smooth'

export interface BackTopVisibleChangeDetails {
  /** 按钮此刻露不露面。 */
  visible: boolean
}

/** 读屏用的文案，默认英文。 */
export interface BackTopTranslations {
  /** 按钮的可及名字。按钮里通常只有一个图标，名字只能由这里给。 */
  trigger: string
}

/** 适配器在挂载前填入的 DOM 取值口。 */
export interface BackTopRefs {
  /** 滚动容器，返回 null 即整页滚动。 */
  getTargetEl: () => HTMLElement | null
}

export interface BackTopSchema extends MachineSchema {
  props: {
    /** 滚过这么多像素按钮才露面，默认 200。 */
    visibilityHeight?: number
    /** 滚回顶部的方式，默认 smooth。 */
    behavior?: BackTopBehavior
    translations?: Partial<BackTopTranslations>
    /** 语气：brand / neutral / success / warning / danger / info，决定按钮用哪族颜色。 */
    tone?: string
    /** 尺寸：sm / md / lg。 */
    size?: string
    /** 露面与否变化时回调。 */
    onVisibleChange?: (details: BackTopVisibleChangeDetails) => void
  }
  context: Record<string, never>
  computed: Record<string, never>
  refs: BackTopRefs
  /** hidden 收着（滚动量还没过线）；visible 露着。 */
  state: 'hidden' | 'visible'
  event:
    /** 观察器结算出的一帧：按滚动量算，此刻该不该露面。 */
    | { type: 'SCROLL.RESOLVE', visible: boolean }
    /** 点了按钮。 */
    | { type: 'TRIGGER.CLICK' }
  tag: never
  guard: 'shouldShow' | 'shouldHide'
  action: 'scrollToTop' | 'invokeOnChange'
  effect: 'trackScroll'
}

export interface BackTopApi<T extends PropTypes = PropTypes> {
  /** 按钮此刻露不露面。 */
  visible: boolean
  /** 程序化滚回顶部，与点按钮走同一条路。 */
  scrollToTop: () => void
  getRootProps: () => T['element']
  getTriggerProps: () => T['button']
}
