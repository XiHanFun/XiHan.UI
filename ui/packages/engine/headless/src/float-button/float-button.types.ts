import type { ActionVariant, Cleanup, Direction, Layer, MachineSchema, PropTypes, RuntimeConfig, Size, Tone } from '@xihan-ui/core'
import type { CollapsibleOpenChangeDetails } from '../collapsible'

/**
 * 钉在视口哪一角。
 * start / end 跟着书写方向走，RTL 下自动换到另一侧；上下两条边没有方向问题，照写 top / bottom。
 */
export type FloatButtonPlacement = 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end'

/** 触发器外形：圆的还是方的。 */
export type FloatButtonShape = 'circle' | 'square'

/** 展开那一组的方式：指针悬上去，或点一下。 */
export type FloatButtonExpandTrigger = 'hover' | 'click'

/** 读屏用的文案，默认英文。 */
export interface FloatButtonTranslations {
  /** 触发器的可及名字。里面通常只有一个图标，名字只能由这里给。 */
  trigger: string
}

/** 开合状态；视觉轴不进入机器。 */
export interface FloatButtonDisclosureProps {
  open?: boolean
  defaultOpen?: boolean
  disabled?: boolean
  /** 文字方向，只作用于排版；作者没给就不写。 */
  dir?: Direction
}

/** 对外的回调。 */
export interface FloatButtonNotifiers {
  /** open 变化意图；受控时是唯一出口，非受控时随内部转移一并通知。 */
  onOpenChange?: (details: CollapsibleOpenChangeDetails) => void
}

/** 落位与外形，不入机器：它们不改开合，只决定钉在哪儿、长什么样、怎么展开。 */
export interface FloatButtonAppearance {
  /** 钉在哪一角，默认 bottom-end。 */
  placement?: FloatButtonPlacement
  /** 距那两条边的距离（px），默认 24。 */
  offset?: number
  /** 触发器外形，默认 circle。 */
  shape?: FloatButtonShape
  /** 展开方式，默认 click。 */
  expandTrigger?: FloatButtonExpandTrigger
  /** 形态：solid / subtle / outline / ghost，决定底色、描边与前景怎么用。 */
  variant?: ActionVariant
  /** 语气：brand / neutral / success / warning / danger / info，决定用哪族颜色。 */
  tone?: Tone
  /** 尺寸：sm / md / lg，缺省与 lg 同档——悬浮钮要够得着，起步就比行内按钮大一号。 */
  size?: Size
  translations?: Partial<FloatButtonTranslations>
}

export type FloatButtonProps = FloatButtonDisclosureProps & FloatButtonNotifiers & FloatButtonAppearance

/** 适配器只桥接所属 Document 的运行时、逻辑层登记与根节点。 */
export interface FloatButtonRefs {
  config: RuntimeConfig | null
  registerLayer: ((input: Omit<Layer, 'id'>) => { layer: Layer, dispose: Cleanup }) | null
  getRootEl: () => HTMLElement | null
}

/** FloatButton 专用状态机：开合、禁用和消解层资源都由 Headless 持有。 */
export interface FloatButtonSchema extends MachineSchema {
  props: FloatButtonDisclosureProps & FloatButtonNotifiers & Pick<FloatButtonAppearance, 'expandTrigger'>
  context: Record<string, never>
  computed: Record<string, never>
  refs: FloatButtonRefs
  state: 'open' | 'closed'
  event:
    | { type: 'OPEN' }
    | { type: 'CLOSE', src?: 'hover' | 'esc' | 'interact-outside' | 'programmatic' }
    | { type: 'TOGGLE' }
    | { type: 'DISABLE' }
    | { type: 'CONTROLLED.OPEN' }
    | { type: 'CONTROLLED.CLOSE' }
  tag: never
  guard:
    | 'isDisabled'
    | 'isOpenControlled'
  action:
    | 'invokeOnOpen'
    | 'invokeOnClose'
    | 'syncOpen'
    | 'syncDisabled'
  effect: 'trackLayer'
}

export interface FloatButtonApi<T extends PropTypes = PropTypes> {
  /** 展开的那一组此刻露不露面。 */
  open: boolean
  setOpen: (next: boolean) => void
  getRootProps: () => T['element']
  getTriggerProps: () => T['button']
  getListProps: () => T['element']
}
