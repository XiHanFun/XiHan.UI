import type { Tone } from '@xihan-ui/core'
import type { LoadingBarApi, LoadingBarSchema } from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import type { SlotChildren } from '../../runtime/slot-content'
import { withXhConfig } from '../../config/config'
import { mergeReactProps } from '../../runtime/merge-props'
import { renderSlot } from '../../runtime/slot-content'
import { LoadingBarProvider, useLoadingBarContext } from './context'
import { useLoadingBar } from './use-loading-bar'

type LoadingBarProps = LoadingBarSchema['props']

/** 函数式 children 的载荷：条子的阶段、进度值、是否露面与是否不确定进度。 */
export type LoadingBarRootSlotProps = Pick<LoadingBarApi, 'phase' | 'value' | 'visible' | 'indeterminate'>

/** 根上自有的那些取值；defaultValue 与原生的同名属性含义不同，由这里接管。 */
type RootElementProps = Omit<ComponentPropsWithRef<'div'>, 'children' | 'defaultValue'>

export interface XhLoadingBarRootProps extends RootElementProps {
  value?: number
  defaultValue?: number
  loading?: boolean
  /** 条子厚度：数字按像素，字符串按任意 CSS 长度。 */
  height?: string | number
  color?: string
  tone?: Tone
  trickle?: boolean
  trickleSpeed?: number
  minimum?: number
  fadeDuration?: number
  translations?: LoadingBarProps['translations']
  onValueChange?: LoadingBarProps['onValueChange']
  children?: SlotChildren<LoadingBarRootSlotProps>
}

export function XhLoadingBarRoot({
  value,
  defaultValue,
  loading,
  height,
  color,
  tone,
  trickle,
  trickleSpeed,
  minimum,
  fadeDuration,
  translations,
  onValueChange,
  children,
  ...rest
}: XhLoadingBarRootProps): ReactNode {
  const machineProps = {
    value,
    defaultValue,
    loading,
    height,
    color,
    tone,
    trickle,
    trickleSpeed,
    minimum,
    fadeDuration,
    translations,
    onValueChange,
  }
  const ctx = useLoadingBar(withXhConfig('loading-bar', machineProps) as LoadingBarProps)
  const api = ctx.api
  return (
    <LoadingBarProvider value={ctx}>
      <div {...mergeReactProps(api.getRootProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
        {renderSlot(children, {
          phase: api.phase,
          value: api.value,
          visible: api.visible,
          indeterminate: api.indeterminate,
        })}
      </div>
    </LoadingBarProvider>
  )
}

XhLoadingBarRoot.xhEvents = ['value-change'] as const

export interface XhLoadingBarTrackProps extends ComponentPropsWithRef<'div'> {}
export function XhLoadingBarTrack({ children, ...rest }: XhLoadingBarTrackProps): ReactNode {
  const ctx = useLoadingBarContext()
  return <div {...mergeReactProps(ctx.api.getTrackProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</div>
}

export interface XhLoadingBarRangeProps extends ComponentPropsWithRef<'div'> {}
/** 宽度与颜色由连接层写进内联样式。 */
export function XhLoadingBarRange({ children, ...rest }: XhLoadingBarRangeProps): ReactNode {
  const ctx = useLoadingBarContext()
  return <div {...mergeReactProps(ctx.api.getRangeProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</div>
}

export interface XhLoadingBarPegProps extends ComponentPropsWithRef<'div'> {}
/** 进度段末端那道亮边，纯装饰；不渲染它时条子照旧成立。 */
export function XhLoadingBarPeg({ children, ...rest }: XhLoadingBarPegProps): ReactNode {
  const ctx = useLoadingBarContext()
  return <div {...mergeReactProps(ctx.api.getPegProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</div>
}
