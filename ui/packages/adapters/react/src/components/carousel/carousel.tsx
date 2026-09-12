import type { Direction, Orientation } from '@xihan-ui/core'
import type { CarouselApi, CarouselSchema, CarouselTranslations } from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import type { SlotChildren } from '../../runtime/slot-content'
import { withXhConfig } from '../../config/config'
import { mergeReactProps } from '../../runtime/merge-props'
import { useNativeEvents } from '../../runtime/native-events'
import { renderSlot } from '../../runtime/slot-content'
import { CarouselProvider, useCarouselContext } from './context'
import { useCarousel } from './use-carousel'

type CarouselProps = CarouselSchema['props']

/** 函数式 children 的载荷：当前页与翻页区间、自动播放与拖拽状态，以及翻页、播放的命令。 */
export type CarouselRootSlotProps = Pick<
  CarouselApi,
  | 'page'
  | 'totalPages'
  | 'slideCount'
  | 'slideRange'
  | 'pageSnapPoints'
  | 'canScrollPrev'
  | 'canScrollNext'
  | 'autoplaying'
  | 'paused'
  | 'autoplayStopped'
  | 'dragging'
  | 'isInView'
  | 'setPage'
  | 'goToPrev'
  | 'goToNext'
  | 'play'
  | 'pause'
  | 'resume'
>

/** 根上自有的那些取值；dir 与原生的同名属性含义不同，由这里接管。 */
type RootElementProps = Omit<ComponentPropsWithRef<'div'>, 'children' | 'dir'>

export interface XhCarouselRootProps extends RootElementProps {
  page?: number
  defaultPage?: number
  slideCount?: number
  slidesPerPage?: number
  slidesPerMove?: number
  orientation?: Orientation
  /** 文字方向；只在作者显式给了才写，写死会切断从 RTL 祖先继承的方向。 */
  dir?: Direction
  loop?: boolean
  /** 布尔或毫秒：true 用默认间隔，数值即间隔。 */
  autoplay?: boolean | number
  allowPointerDrag?: boolean
  spacing?: string
  translations?: Partial<CarouselTranslations>
  onPageChange?: CarouselProps['onPageChange']
  children?: SlotChildren<CarouselRootSlotProps>
}

export function XhCarouselRoot({
  page,
  defaultPage,
  slideCount,
  slidesPerPage,
  slidesPerMove,
  orientation,
  dir,
  loop,
  autoplay,
  allowPointerDrag,
  spacing,
  translations,
  onPageChange,
  children,
  ...rest
}: XhCarouselRootProps): ReactNode {
  const ctx = useCarousel(withXhConfig('carousel', {
    page,
    defaultPage,
    slideCount,
    slidesPerPage,
    slidesPerMove,
    orientation,
    dir,
    loop,
    autoplay,
    allowPointerDrag,
    spacing,
    translations,
    onPageChange,
  }) as CarouselProps)
  const api = ctx.api
  // 根上的 onPointerEnter / onPointerLeave 是 DOM 的 pointerenter / pointerleave（不冒泡）。
  // React 的同名合成事件是从 pointerover / pointerout 合出来的，指针在幻灯片之间划过也会重放一遍，
  // 自动播放的按停与续播会跟着乱跳——装成原生监听器，到达路径才与另外两家一致。
  // onFocusIn / onFocusOut 归到的 onFocus / onBlur 本就是冒泡的 focusin / focusout，不动它们
  const bind = useNativeEvents(
    api.getRootProps() as Record<string, unknown>,
    ['onPointerEnter', 'onPointerLeave'],
  )
  return (
    <CarouselProvider value={ctx}>
      <div {...mergeReactProps(bind.attrs, rest as Record<string, unknown>, { ref: bind.ref })}>
        {renderSlot(children, {
          page: api.page,
          totalPages: api.totalPages,
          slideCount: api.slideCount,
          slideRange: api.slideRange,
          pageSnapPoints: api.pageSnapPoints,
          canScrollPrev: api.canScrollPrev,
          canScrollNext: api.canScrollNext,
          autoplaying: api.autoplaying,
          paused: api.paused,
          autoplayStopped: api.autoplayStopped,
          dragging: api.dragging,
          isInView: api.isInView,
          setPage: api.setPage,
          goToPrev: api.goToPrev,
          goToNext: api.goToNext,
          play: api.play,
          pause: api.pause,
          resume: api.resume,
        })}
      </div>
    </CarouselProvider>
  )
}

XhCarouselRoot.xhEvents = ['page-change'] as const

export interface XhCarouselViewportProps extends ComponentPropsWithRef<'div'> {}
/** 量幻灯片的那个盒子：轨道在它里面位移，手指也落在它上面。 */
export function XhCarouselViewport({ children, ...rest }: XhCarouselViewportProps): ReactNode {
  const ctx = useCarouselContext()
  return (
    <div {...mergeReactProps(ctx.api.getViewportProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </div>
  )
}

export interface XhCarouselListProps extends ComponentPropsWithRef<'div'> {}
export function XhCarouselList({ children, ...rest }: XhCarouselListProps): ReactNode {
  const ctx = useCarouselContext()
  return (
    <div {...mergeReactProps(ctx.api.getListProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </div>
  )
}

export interface XhCarouselItemProps extends ComponentPropsWithRef<'div'> {
  /** 这一张的下标，0 基；兼收字符串。 */
  index: number | string
}
export function XhCarouselItem({ index, children, ...rest }: XhCarouselItemProps): ReactNode {
  const ctx = useCarouselContext()
  return (
    <div
      {...mergeReactProps(
        ctx.api.getItemProps({ index: Number(index) }) as Record<string, unknown>,
        rest as Record<string, unknown>,
      )}
    >
      {children}
    </div>
  )
}

export interface XhCarouselPrevTriggerProps extends ComponentPropsWithRef<'button'> {}
export function XhCarouselPrevTrigger({ children, ...rest }: XhCarouselPrevTriggerProps): ReactNode {
  const ctx = useCarouselContext()
  return (
    <button {...mergeReactProps(ctx.api.getPrevTriggerProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </button>
  )
}

export interface XhCarouselNextTriggerProps extends ComponentPropsWithRef<'button'> {}
export function XhCarouselNextTrigger({ children, ...rest }: XhCarouselNextTriggerProps): ReactNode {
  const ctx = useCarouselContext()
  return (
    <button {...mergeReactProps(ctx.api.getNextTriggerProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </button>
  )
}

/** 函数式 children 的载荷：用户按停了没有，不含悬停与焦点那两路的临时按住。 */
export interface CarouselAutoplayTriggerSlotProps {
  stopped: boolean
}

export interface XhCarouselAutoplayTriggerProps extends Omit<ComponentPropsWithRef<'button'>, 'children'> {
  children?: SlotChildren<CarouselAutoplayTriggerSlotProps>
}

/**
 * 播放 / 暂停开关。开了 autoplay 就该把它渲出来：
 * 自动翻页得有一处能停住，且停住之后不会被别的交互重新点着。
 */
export function XhCarouselAutoplayTrigger({ children, ...rest }: XhCarouselAutoplayTriggerProps): ReactNode {
  const ctx = useCarouselContext()
  return (
    <button
      {...mergeReactProps(
        ctx.api.getAutoplayTriggerProps() as Record<string, unknown>,
        rest as Record<string, unknown>,
      )}
    >
      {renderSlot(children, { stopped: ctx.api.autoplayStopped })}
    </button>
  )
}

export interface XhCarouselIndicatorGroupProps extends ComponentPropsWithRef<'div'> {}
export function XhCarouselIndicatorGroup({ children, ...rest }: XhCarouselIndicatorGroupProps): ReactNode {
  const ctx = useCarouselContext()
  return (
    <div {...mergeReactProps(ctx.api.getIndicatorGroupProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </div>
  )
}

export interface XhCarouselIndicatorProps extends ComponentPropsWithRef<'button'> {
  /** 指示点对应的页码，0 基；兼收字符串。 */
  index: number | string
}
export function XhCarouselIndicator({ index, children, ...rest }: XhCarouselIndicatorProps): ReactNode {
  const ctx = useCarouselContext()
  return (
    <button
      {...mergeReactProps(
        ctx.api.getIndicatorProps({ index: Number(index) }) as Record<string, unknown>,
        rest as Record<string, unknown>,
      )}
    >
      {children}
    </button>
  )
}
