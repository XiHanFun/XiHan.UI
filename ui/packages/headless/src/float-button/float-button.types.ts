import type { PropTypes } from '@xihan-ui/kernel'
import type { CollapsibleOpenChangeDetails, CollapsibleSchema } from '../collapsible'

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

/**
 * 开合那半与 collapsible 同款——悬浮按钮跑的就是 collapsible 机器。
 * 剔掉两项：size（这里的尺寸只有一档，由皮肤定）与 onOpenChange（并进 Notifiers 一起给）。
 */
export type FloatButtonDisclosureProps = Omit<CollapsibleSchema['props'], 'size' | 'onOpenChange'>

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
  translations?: Partial<FloatButtonTranslations>
}

export type FloatButtonProps = FloatButtonDisclosureProps & FloatButtonNotifiers & FloatButtonAppearance

export interface FloatButtonApi<T extends PropTypes = PropTypes> {
  /** 展开的那一组此刻露不露面。 */
  open: boolean
  setOpen: (next: boolean) => void
  getRootProps: () => T['element']
  getTriggerProps: () => T['button']
  getListProps: () => T['element']
}
