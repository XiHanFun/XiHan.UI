import type { Direction, Placement } from '@xihan-ui/core'
import type { TourApi, TourSchema, TourStep, TourTranslations } from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import type { SlotChildren } from '../../runtime/slot-content'
import { withXhConfig } from '../../config/config'
import { mergeReactProps } from '../../runtime/merge-props'
import { XhPortal } from '../../runtime/portal'
import { renderSlot, slotPaints } from '../../runtime/slot-content'
import { TourProvider, useTourContext } from './context'
import { useTour } from './use-tour'

type TourProps = TourSchema['props']

/** 函数式 children 的载荷：引导的开合与步序状态，以及开关、走步、放弃与校准位置的动作。 */
export type TourRootSlotProps = Pick<
  TourApi,
  | 'open'
  | 'value'
  | 'count'
  | 'currentStep'
  | 'firstStep'
  | 'lastStep'
  | 'progressText'
  | 'setOpen'
  | 'setValue'
  | 'goToNextStep'
  | 'goToPrevStep'
  | 'skip'
  | 'remeasure'
>

export interface XhTourRootProps {
  steps?: TourStep[]
  value?: number
  defaultValue?: number
  open?: boolean
  defaultOpen?: boolean
  placement?: Placement
  offset?: number
  /** 文字方向；浮层搬到落点后继承不到作者子树上的方向，要 RTL 就显式给。 */
  dir?: Direction
  closeOnEscape?: boolean
  closeOnInteractOutside?: boolean
  showBackdrop?: boolean
  spotlightPadding?: number
  autoScroll?: boolean
  translations?: Partial<TourTranslations>
  onOpenChange?: TourProps['onOpenChange']
  onValueChange?: TourProps['onValueChange']
  onComplete?: TourProps['onComplete']
  onSkip?: TourProps['onSkip']
  children?: SlotChildren<TourRootSlotProps>
}

export function XhTourRoot({ children, ...props }: XhTourRootProps): ReactNode {
  const ctx = useTour(withXhConfig('tour', props) as TourProps)
  const api = ctx.api
  // 经 children 载荷交出状态与走步、放弃等命令，供浮层外的按钮使用
  return (
    <TourProvider value={ctx}>
      <div {...api.getRootProps() as Record<string, unknown>}>
        {renderSlot(children, {
          open: api.open,
          value: api.value,
          count: api.count,
          currentStep: api.currentStep,
          firstStep: api.firstStep,
          lastStep: api.lastStep,
          progressText: api.progressText,
          setOpen: api.setOpen,
          setValue: api.setValue,
          goToNextStep: api.goToNextStep,
          goToPrevStep: api.goToPrevStep,
          skip: api.skip,
          remeasure: api.remeasure,
        })}
      </div>
    </TourProvider>
  )
}

XhTourRoot.xhEvents = ['open-change', 'value-change', 'complete', 'skip'] as const

export interface XhTourBackdropProps extends ComponentPropsWithRef<'div'> {}
export function XhTourBackdrop({ children, ...rest }: XhTourBackdropProps): ReactNode {
  const ctx = useTourContext()
  // 与浮层同去一个落点：遮罩留在原地就会被面板甩下，两层不再叠在一起
  return (
    <XhPortal container={ctx.portalContainer}>
      <div
        {...mergeReactProps(
          ctx.api.getBackdropProps() as Record<string, unknown>,
          rest as Record<string, unknown>,
          {
            // 收起跟着退场闸门走：遮罩的淡出与气泡的退场并行播
            hidden: (!ctx.visible || !ctx.showBackdrop) || undefined,
            ref: (el: HTMLDivElement | null) => { ctx.backdropRef.current = el },
          },
        )}
      >
        {children}
      </div>
    </XhPortal>
  )
}

export interface XhTourSpotlightProps extends ComponentPropsWithRef<'div'> {}
export function XhTourSpotlight({ ...rest }: XhTourSpotlightProps): ReactNode {
  const ctx = useTourContext()
  // 高亮框与遮罩是同一层暗幕的两半，必须一起搬
  return (
    <XhPortal container={ctx.portalContainer}>
      <div
        {...mergeReactProps(
          ctx.api.getSpotlightProps() as Record<string, unknown>,
          rest as Record<string, unknown>,
          // 收起跟着退场闸门走：高亮框的退场与气泡并行播；居中步照常不画
          { hidden: (!ctx.visible || !ctx.api.anchored) || undefined },
        )}
      />
    </XhPortal>
  )
}

export interface XhTourPositionerProps extends ComponentPropsWithRef<'div'> {}
/** 搬到浮层落点：留在原地的话，宿主祖先只要建了层叠上下文就能盖住浮层。 */
export function XhTourPositioner({ children, ...rest }: XhTourPositionerProps): ReactNode {
  const ctx = useTourContext()
  return (
    <XhPortal container={ctx.portalContainer}>
      <div
        {...mergeReactProps(
          ctx.api.getPositionerProps() as Record<string, unknown>,
          rest as Record<string, unknown>,
          {
            // 定位层收起跟着退场闸门走：它先 display:none 的话，里面气泡的退场一帧都播不出来
            hidden: !ctx.visible || undefined,
            ref: (el: HTMLDivElement | null) => { ctx.positionerRef.current = el },
          },
        )}
      >
        {children}
      </div>
    </XhPortal>
  )
}

export interface XhTourContentProps extends ComponentPropsWithRef<'div'> {}
export function XhTourContent({ children, ...rest }: XhTourContentProps): ReactNode {
  const ctx = useTourContext()
  return (
    <div
      {...mergeReactProps(
        ctx.api.getContentProps() as Record<string, unknown>,
        rest as Record<string, unknown>,
        {
          // 收起跟着退场闸门走：皮肤刻意没给 content 补 [hidden]{display:none}（补了退场
          // 就一帧都播不出来），所以真正的收起落成内联 display——节点始终留在原地
          style: ctx.visible ? undefined : { display: 'none' },
          ref: (el: HTMLDivElement | null) => { ctx.contentRef.current = el },
        },
      )}
    >
      {children}
    </div>
  )
}

export interface XhTourTitleProps extends ComponentPropsWithRef<'h2'> {}
// 标题与描述的文字取自步骤声明，作者写了内容就用作者的
export function XhTourTitle({ children, ...rest }: XhTourTitleProps): ReactNode {
  const ctx = useTourContext()
  return (
    <h2 {...mergeReactProps(ctx.api.getTitleProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {slotPaints(children) ? children : ctx.api.currentStep?.title}
    </h2>
  )
}

export interface XhTourDescriptionProps extends ComponentPropsWithRef<'p'> {}
export function XhTourDescription({ children, ...rest }: XhTourDescriptionProps): ReactNode {
  const ctx = useTourContext()
  return (
    <p {...mergeReactProps(ctx.api.getDescriptionProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {slotPaints(children) ? children : ctx.api.currentStep?.description}
    </p>
  )
}

export interface XhTourProgressTextProps extends ComponentPropsWithRef<'span'> {}
export function XhTourProgressText({ children, ...rest }: XhTourProgressTextProps): ReactNode {
  const ctx = useTourContext()
  return (
    <span {...mergeReactProps(ctx.api.getProgressTextProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {slotPaints(children) ? children : ctx.api.progressText}
    </span>
  )
}

export interface XhTourProgressIndicatorProps extends ComponentPropsWithRef<'div'> {}
/** 圆点组：不给 children 就按步数铺出圆点，作者给了就照作者的来。 */
export function XhTourProgressIndicator({ children, ...rest }: XhTourProgressIndicatorProps): ReactNode {
  const ctx = useTourContext()
  const api = ctx.api
  return (
    <div {...mergeReactProps(api.getProgressIndicatorProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {slotPaints(children)
        ? children
        : Array.from({ length: api.count }, (_, index) => (
            <div key={index} {...api.getProgressDotProps({ index }) as Record<string, unknown>} />
          ))}
    </div>
  )
}

export interface XhTourProgressDotProps extends ComponentPropsWithRef<'div'> {
  /** 圆点对应的步序，0 基；兼收字符串。 */
  index: number | string
}
export function XhTourProgressDot({ index, ...rest }: XhTourProgressDotProps): ReactNode {
  const ctx = useTourContext()
  return <div {...mergeReactProps(ctx.api.getProgressDotProps({ index: Number(index) }) as Record<string, unknown>, rest as Record<string, unknown>)} />
}

export interface XhTourPrevTriggerProps extends ComponentPropsWithRef<'button'> {}
export function XhTourPrevTrigger({ children, ...rest }: XhTourPrevTriggerProps): ReactNode {
  const ctx = useTourContext()
  return <button {...mergeReactProps(ctx.api.getPrevTriggerProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</button>
}

export interface XhTourNextTriggerProps extends ComponentPropsWithRef<'button'> {}
export function XhTourNextTrigger({ children, ...rest }: XhTourNextTriggerProps): ReactNode {
  const ctx = useTourContext()
  return <button {...mergeReactProps(ctx.api.getNextTriggerProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</button>
}

export interface XhTourSkipTriggerProps extends ComponentPropsWithRef<'button'> {}
export function XhTourSkipTrigger({ children, ...rest }: XhTourSkipTriggerProps): ReactNode {
  const ctx = useTourContext()
  return <button {...mergeReactProps(ctx.api.getSkipTriggerProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</button>
}

export interface XhTourCloseTriggerProps extends ComponentPropsWithRef<'button'> {}
export function XhTourCloseTrigger({ children, ...rest }: XhTourCloseTriggerProps): ReactNode {
  const ctx = useTourContext()
  return <button {...mergeReactProps(ctx.api.getCloseTriggerProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</button>
}

export interface XhTourArrowProps extends ComponentPropsWithRef<'div'> {}
export function XhTourArrow({ ...rest }: XhTourArrowProps): ReactNode {
  const ctx = useTourContext()
  return <div {...mergeReactProps(ctx.api.getArrowProps() as Record<string, unknown>, rest as Record<string, unknown>)} />
}
