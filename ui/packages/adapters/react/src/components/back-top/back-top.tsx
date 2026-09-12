import type { ActionVariant, Size, Tone } from '@xihan-ui/core'
import type { BackTopApi, BackTopBehavior, BackTopSchema, BackTopTranslations } from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import type { SlotChildren } from '../../runtime/slot-content'
import { useCallback, useRef } from 'react'
import { withXhConfig } from '../../config/config'
import { mergeReactProps } from '../../runtime/merge-props'
import { renderSlot } from '../../runtime/slot-content'
import { BackTopProvider, useBackTopContext } from './context'
import { useBackTop } from './use-back-top'

type BackTopProps = BackTopSchema['props']

/** 函数式 children 的载荷：按钮此刻露不露面。 */
export interface BackTopRootSlotProps extends Pick<BackTopApi, 'visible'> {}

export interface XhBackTopRootProps extends Omit<ComponentPropsWithRef<'div'>, 'children'> {
  visibilityHeight?: number
  behavior?: BackTopBehavior
  translations?: Partial<BackTopTranslations>
  variant?: ActionVariant
  tone?: Tone
  size?: Size
  /** 滚动容器，缺省即整页滚动；经 refs 交给观察器。 */
  target?: HTMLElement | null
  onVisibilityChange?: BackTopProps['onVisibilityChange']
  children?: SlotChildren<BackTopRootSlotProps>
}

/** 根节点是定位壳：把按钮钉在视口一角，收起时整块让位。 */
export function XhBackTopRoot({
  visibilityHeight,
  behavior,
  translations,
  variant,
  tone,
  size,
  target,
  onVisibilityChange,
  children,
  ...rest
}: XhBackTopRootProps): ReactNode {
  // 取值器每帧换、接线只建一次：现读这一帧的 target，别让它成为重建的理由
  const latest = useRef(target)
  latest.current = target
  const getTargetEl = useCallback(() => latest.current ?? null, [])
  const ctx = useBackTop(withXhConfig('back-top', {
    visibilityHeight,
    behavior,
    translations,
    variant,
    tone,
    size,
    onVisibilityChange,
  }) as BackTopProps, getTargetEl)
  return (
    <BackTopProvider value={ctx}>
      <div {...mergeReactProps(ctx.api.getRootProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
        {renderSlot(children, { visible: ctx.api.visible })}
      </div>
    </BackTopProvider>
  )
}

XhBackTopRoot.xhEvents = ['visibility-change'] as const

export interface XhBackTopTriggerProps extends ComponentPropsWithRef<'button'> {}
/** 原生 button：Enter / Space 的激活与 Tab 停靠都由平台提供。 */
export function XhBackTopTrigger({ children, ...rest }: XhBackTopTriggerProps): ReactNode {
  const ctx = useBackTopContext()
  return (
    <button {...mergeReactProps(ctx.api.getTriggerProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </button>
  )
}
