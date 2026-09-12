import type { Direction, Size, Tone } from '@xihan-ui/core'
import type { RatingApi, RatingItemState, RatingSchema, RatingTranslations } from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import type { SlotChildren } from '../../runtime/slot-content'
import { useEffect, useMemo, useRef } from 'react'
import { withXhConfig } from '../../config/config'
import { useFormReset } from '../../runtime/attach-form-reset'
import { useIsomorphicLayoutEffect } from '../../runtime/layout-effect'
import { mergeReactProps } from '../../runtime/merge-props'
import { useNativeEvents } from '../../runtime/native-events'
import { renderSlot } from '../../runtime/slot-content'
import { useFormControlProps } from '../form/use-form-control'
import { RatingProvider, useRatingContext } from './context'
import { useRating } from './use-rating'

type RatingProps = RatingSchema['props']

function noop(): void {}

/** 函数式 children 的载荷：评分与预览值、星星序号表，以及取单颗星状态与改写评分的句柄。 */
export type RatingRootSlotProps = Pick<
  RatingApi,
  | 'value'
  | 'hoveredValue'
  | 'highlightedValue'
  | 'count'
  | 'empty'
  | 'items'
  | 'getItemState'
  | 'setValue'
>

/** 条目函数式 children 的载荷：这一颗星的选中、点亮与半亮状态。 */
export type RatingItemSlotProps = RatingItemState

/** 根上自有的那些取值；dir 与原生的同名属性含义不同，由这里接管。 */
type RootElementProps = Omit<ComponentPropsWithRef<'div'>, 'defaultValue' | 'dir' | 'children' | 'onChange'>

export interface XhRatingRootProps extends RootElementProps {
  /** 受控评分；给定即受控。 */
  value?: number
  /** 非受控初值。 */
  defaultValue?: number
  /** 星星颗数，默认 5。 */
  count?: number
  /** 允许半颗星：档位从 1 变成 0.5。 */
  allowHalf?: boolean
  /** 再点当前档位即清零，默认开。 */
  allowClear?: boolean
  disabled?: boolean
  readOnly?: boolean
  required?: boolean
  /** 表单字段名；给了表单影子才带 name 并参与提交。 */
  name?: string
  /** 文字方向，缺省 ltr。 */
  dir?: Direction
  tone?: Tone
  size?: Size
  translations?: Partial<RatingTranslations>
  onValueChange?: RatingProps['onValueChange']
  /** 悬停预览变化；指针离开时带 null。它不代表值变了。 */
  onHoverChange?: RatingProps['onHoverChange']
  children?: SlotChildren<RatingRootSlotProps>
}

export function XhRatingRoot({
  value,
  defaultValue,
  count,
  allowHalf,
  allowClear,
  disabled,
  readOnly,
  required,
  name,
  dir,
  tone,
  size,
  translations,
  onValueChange,
  onHoverChange,
  children,
  ...rest
}: XhRatingRootProps): ReactNode {
  const ctx = useRating(withXhConfig('rating', useFormControlProps({
    value,
    defaultValue,
    count,
    allowHalf,
    allowClear,
    disabled,
    readOnly,
    required,
    name,
    dir,
    tone,
    size,
    translations,
    onValueChange,
    onHoverChange,
  })) as RatingProps)
  const api = ctx.api

  // 值攥在机器里，原生 reset 只还原原生控件——不接这条线，点重置什么都不会发生。
  // 锚点取组件渲出来的最外层节点，也就是这个根 div
  const rootRef = useRef<HTMLElement | null>(null)
  useFormReset(ctx.service, rootRef)

  return (
    <RatingProvider value={ctx}>
      <div
        {...mergeReactProps(
          api.getRootProps() as Record<string, unknown>,
          rest as Record<string, unknown>,
          { ref: rootRef },
        )}
      >
        {renderSlot(children, {
          value: api.value,
          hoveredValue: api.hoveredValue,
          highlightedValue: api.highlightedValue,
          count: api.count,
          empty: api.empty,
          items: api.items,
          getItemState: api.getItemState,
          setValue: api.setValue,
        })}
      </div>
    </RatingProvider>
  )
}

XhRatingRoot.xhEvents = ['value-change'] as const

export interface XhRatingLabelProps extends ComponentPropsWithRef<'span'> {}

export function XhRatingLabel({ children, ...rest }: XhRatingLabelProps): ReactNode {
  const ctx = useRatingContext()
  return (
    <span {...mergeReactProps(ctx.api.getLabelProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </span>
  )
}

export interface XhRatingControlProps extends ComponentPropsWithRef<'div'> {}

/** role=radiogroup 的星星带，键盘与悬停预览都收在这一层。 */
export function XhRatingControl({ children, ...rest }: XhRatingControlProps): ReactNode {
  const ctx = useRatingContext()
  // 容器的 onFocus 是不冒泡的 DOM focus（只在容器自己得焦时接管），pointerleave 也不冒泡，
  // React 的同名合成事件一个挂的是 focusin、一个由 pointerout 推导，两下都对不上——
  // 装成原生监听器，到达路径才与另外两家一致。onFocusout 归到的 onBlur 本就是冒泡的 focusout，不动它
  const bind = useNativeEvents(
    ctx.api.getControlProps() as Record<string, unknown>,
    ['onFocus', 'onPointerLeave'],
  )
  return (
    <div {...mergeReactProps(bind.attrs, { ref: bind.ref }, rest as Record<string, unknown>)}>
      {children}
    </div>
  )
}

export interface XhRatingValueTextProps extends ComponentPropsWithRef<'span'> {}

/** 分值文本：写在 root 里、control 的兄弟；没给内容就填当前该点亮到的那个数。 */
export function XhRatingValueText({ children, ...rest }: XhRatingValueTextProps): ReactNode {
  const ctx = useRatingContext()
  return (
    <span {...mergeReactProps(ctx.api.getValueTextProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children ?? ctx.api.valueText}
    </span>
  )
}

export interface XhRatingItemProps extends Omit<ComponentPropsWithRef<'span'>, 'value' | 'children'> {
  /** 星序号，兼收字符串；往下传前统一归成数字。 */
  value: number | string
  children?: SlotChildren<RatingItemSlotProps>
}

export function XhRatingItem({ value, children, ...rest }: XhRatingItemProps): ReactNode {
  const ctx = useRatingContext()
  const item = useMemo(() => ({ value: Number(value) }), [value])
  const itemEl = useRef<HTMLElement | null>(null)
  const previous = useRef(item.value)

  // 本节点持有焦点时，序号变更重报焦点条目
  useEffect(() => {
    const prev = previous.current
    previous.current = item.value
    if (prev === item.value)
      return
    const svc = ctx.service
    if (svc.getStatus() !== 'Started')
      return
    if (itemEl.current && svc.scope.getActiveElement() === itemEl.current)
      svc.send({ type: 'ITEM.FOCUS', index: item.value })
  }, [ctx.service, item.value])

  // 卸载时上报评分带失焦：按「本节点当下正持有焦点」判定，不按序号比对
  useIsomorphicLayoutEffect(() => () => {
    const svc = ctx.service
    if (svc.getStatus() !== 'Started')
      return
    if (itemEl.current && svc.scope.getActiveElement() === itemEl.current)
      svc.send({ type: 'CONTROL.BLUR' })
  }, [ctx.service])

  // 星星上这三个处理器都要拿到原生事件：onFocus 是不冒泡的 DOM focus；
  // onClick 与 onPointerMove 要读 offsetX 判断指针落在这颗星的哪半边，
  // 而 React 的合成鼠标事件不带 offsetX，半档会被一律算成整颗
  const bind = useNativeEvents(
    ctx.api.getItemProps(item) as Record<string, unknown>,
    ['onFocus', 'onClick', 'onPointerMove'],
  )

  return (
    <span
      {...mergeReactProps(
        bind.attrs,
        { ref: bind.ref },
        rest as Record<string, unknown>,
        { ref: (el: HTMLSpanElement | null) => { itemEl.current = el } },
      )}
    >
      {renderSlot(children, ctx.api.getItemState(item))}
    </span>
  )
}

export interface XhRatingHiddenInputProps extends Omit<ComponentPropsWithRef<'input'>, 'value' | 'defaultValue' | 'type'> {}

/** 表单出口：评分随这份原生输入提交，对键盘与读屏不可见。 */
export function XhRatingHiddenInput({ ...rest }: XhRatingHiddenInputProps): ReactNode {
  const ctx = useRatingContext()
  return (
    <input
      {...mergeReactProps(
        ctx.api.getHiddenInputProps() as Record<string, unknown>,
        // 值攥在机器里，这份影子输入没有自己的变更出口。React 要求带 value 的输入
        // 交出一个出口，否则在开发构建里逐帧告警；节点是 hidden，这个出口不会被调用
        { onChange: noop },
        rest as Record<string, unknown>,
      )}
    />
  )
}
