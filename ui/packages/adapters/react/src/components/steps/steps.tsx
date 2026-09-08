import type { Direction, Orientation, Size, Tone } from '@xihan-ui/core'
import type { StepNode, StepsApi, StepsSchema, StepStatus, StepsTranslations } from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import type { SlotChildren } from '../../runtime/slot-content'
import { useEffect, useMemo, useRef } from 'react'
import { withXhConfig } from '../../config/config'
import { useIsomorphicLayoutEffect } from '../../runtime/layout-effect'
import { mergeReactProps } from '../../runtime/merge-props'
import { useNativeEvents } from '../../runtime/native-events'
import { renderSlot } from '../../runtime/slot-content'
import { StepsItemProvider, StepsProvider, useStepsContext, useStepsItemContext } from './context'
import { useSteps } from './use-steps'

type StepsProps = StepsSchema['props']

/** 函数式 children 的载荷：当前步序、总步数、是否走完，以及跳步与前进后退的方法。 */
export type StepsRootSlotProps = Pick<
  StepsApi,
  'value' | 'count' | 'complete' | 'setValue' | 'goToNextStep' | 'goToPrevStep'
>

/** 根上自有的那些取值；defaultValue 与 dir 与原生的同名属性含义不同，由这里接管。 */
type RootElementProps = Omit<ComponentPropsWithRef<'div'>, 'children' | 'defaultValue' | 'dir'>

export interface XhStepsRootProps extends RootElementProps {
  value?: number
  defaultValue?: number
  /** 总步数；缺省时步序夹死在 0，读屏那边也不报「共 n 步」。 */
  count?: number
  collection?: StepNode[]
  /** 逐步覆盖状态：下标 → 状态。 */
  statuses?: Record<number, StepStatus>
  orientation?: Orientation
  /** 线性推进：没走到的那几步锁着，点不动也跳不过去。 */
  linear?: boolean
  disabled?: boolean
  loop?: boolean
  dir?: Direction
  translations?: Partial<StepsTranslations>
  tone?: Tone
  size?: Size
  onValueChange?: StepsProps['onValueChange']
  children?: SlotChildren<StepsRootSlotProps>
}

export function XhStepsRoot({
  value,
  defaultValue,
  count,
  collection,
  statuses,
  orientation,
  linear,
  disabled,
  loop,
  dir,
  translations,
  tone,
  size,
  onValueChange,
  children,
  ...rest
}: XhStepsRootProps): ReactNode {
  const ctx = useSteps(withXhConfig('steps', {
    value,
    defaultValue,
    count,
    collection,
    statuses,
    orientation,
    linear,
    disabled,
    loop,
    dir,
    translations,
    tone,
    size,
    onValueChange,
  }) as StepsProps)
  const api = ctx.api
  // 经 children 载荷交出状态与前进/后退方法，供步骤条外的按钮使用
  return (
    <StepsProvider value={ctx}>
      <div {...mergeReactProps(api.getRootProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
        {renderSlot(children, {
          value: api.value,
          count: api.count,
          complete: api.complete,
          setValue: api.setValue,
          goToNextStep: api.goToNextStep,
          goToPrevStep: api.goToPrevStep,
        })}
      </div>
    </StepsProvider>
  )
}

XhStepsRoot.xhEvents = ['value-change'] as const

export interface XhStepsListProps extends ComponentPropsWithRef<'div'> {}
export function XhStepsList({ children, ...rest }: XhStepsListProps): ReactNode {
  const ctx = useStepsContext()
  // 容器的 onFocus 是 DOM 的 focus（不冒泡，只在容器自己得焦时接管）。React 的同名合成事件
  // 挂的是冒泡的 focusin，条目得焦也会把它叫起来，那一下会把焦点从条目抢回锚点上——
  // 装成原生监听器，到达路径才与另外两家一致。onFocusout 归到的 onBlur 本就是冒泡的 focusout，不动它
  const bind = useNativeEvents(ctx.api.getListProps() as Record<string, unknown>, ['onFocus'])
  return (
    <div {...mergeReactProps(bind.attrs, { ref: bind.ref }, rest as Record<string, unknown>)}>
      {children}
    </div>
  )
}

export interface XhStepsItemProps extends Omit<ComponentPropsWithRef<'div'>, 'value'> {
  /** 步骤下标，兼收字符串以支持模板属性字面量。 */
  value: number | string
  disabled?: boolean
}
export function XhStepsItem({ value, disabled, children, ...rest }: XhStepsItemProps): ReactNode {
  const ctx = useStepsContext()
  const item = useMemo(() => ({ index: Number(value), disabled }), [value, disabled])
  return (
    <StepsItemProvider value={item}>
      <div {...mergeReactProps(ctx.api.getItemProps(item) as Record<string, unknown>, rest as Record<string, unknown>)}>
        {children}
      </div>
    </StepsItemProvider>
  )
}

export interface XhStepsTriggerProps extends ComponentPropsWithRef<'button'> {}
export function XhStepsTrigger({ children, ...rest }: XhStepsTriggerProps): ReactNode {
  const ctx = useStepsContext()
  const item = useStepsItemContext()
  const itemEl = useRef<HTMLElement | null>(null)
  const previous = useRef(item.index)

  // 本节点持有焦点时，下标变更重报焦点步骤
  useEffect(() => {
    const prev = previous.current
    previous.current = item.index
    if (prev === item.index)
      return
    const svc = ctx.service
    if (svc.getStatus() !== 'Started')
      return
    if (itemEl.current && svc.scope.getActiveElement() === itemEl.current)
      svc.send({ type: 'TRIGGER.FOCUS', step: item.index })
  }, [ctx.service, item.index])

  // 卸载时上报列表失焦：按「本节点当下正持有焦点」判定，不按下标比对
  useIsomorphicLayoutEffect(() => () => {
    const svc = ctx.service
    if (svc.getStatus() !== 'Started')
      return
    if (itemEl.current && svc.scope.getActiveElement() === itemEl.current)
      svc.send({ type: 'LIST.BLUR' })
  }, [ctx.service])

  // 步骤自己的 onFocus 同样是不冒泡的 DOM focus：改装成原生监听器，与另外两家同一条到达路径
  const bind = useNativeEvents(ctx.api.getTriggerProps(item) as Record<string, unknown>, ['onFocus'])

  return (
    <button
      {...mergeReactProps(
        bind.attrs,
        { ref: bind.ref },
        rest as Record<string, unknown>,
        { ref: (el: HTMLButtonElement | null) => { itemEl.current = el } },
      )}
    >
      {children}
    </button>
  )
}

export interface XhStepsIndicatorProps extends ComponentPropsWithRef<'span'> {}
export function XhStepsIndicator({ children, ...rest }: XhStepsIndicatorProps): ReactNode {
  const ctx = useStepsContext()
  const item = useStepsItemContext()
  return <span {...mergeReactProps(ctx.api.getIndicatorProps(item) as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</span>
}

export interface XhStepsTitleProps extends ComponentPropsWithRef<'span'> {}
export function XhStepsTitle({ children, ...rest }: XhStepsTitleProps): ReactNode {
  const ctx = useStepsContext()
  const item = useStepsItemContext()
  return <span {...mergeReactProps(ctx.api.getTitleProps(item) as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</span>
}

export interface XhStepsDescriptionProps extends ComponentPropsWithRef<'span'> {}
export function XhStepsDescription({ children, ...rest }: XhStepsDescriptionProps): ReactNode {
  const ctx = useStepsContext()
  const item = useStepsItemContext()
  return <span {...mergeReactProps(ctx.api.getDescriptionProps(item) as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</span>
}

export interface XhStepsSeparatorProps extends ComponentPropsWithRef<'div'> {}
/** 连接线写在 item 之内，身份从条目上下文取。 */
export function XhStepsSeparator({ children, ...rest }: XhStepsSeparatorProps): ReactNode {
  const ctx = useStepsContext()
  const item = useStepsItemContext()
  return <div {...mergeReactProps(ctx.api.getSeparatorProps(item) as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</div>
}

export interface XhStepsContentProps extends Omit<ComponentPropsWithRef<'div'>, 'value'> {
  value: number | string
}
/** 面板挂在 list 之外，自带 value 与 trigger 配对；value 等于 count 的面板即完成页。 */
export function XhStepsContent({ value, children, ...rest }: XhStepsContentProps): ReactNode {
  const ctx = useStepsContext()
  return (
    <div
      {...mergeReactProps(
        ctx.api.getContentProps({ index: Number(value) }) as Record<string, unknown>,
        rest as Record<string, unknown>,
      )}
    >
      {children}
    </div>
  )
}
