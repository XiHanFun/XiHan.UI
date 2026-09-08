import type { AffixApi, AffixSchema } from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import type { SlotChildren } from '../../runtime/slot-content'
import { useCallback, useRef } from 'react'
import { mergeReactProps } from '../../runtime/merge-props'
import { renderSlot } from '../../runtime/slot-content'
import { AffixProvider, useAffixContext } from './context'
import { useAffix } from './use-affix'

type AffixProps = AffixSchema['props']

/** 函数式 children 的载荷：此刻是不是吸住了。 */
export interface AffixRootSlotProps extends Pick<AffixApi, 'affixed'> {}

export interface XhAffixRootProps extends Omit<ComponentPropsWithRef<'div'>, 'children'> {
  offsetTop?: number
  offsetBottom?: number
  /** 滚动容器，缺省即整页滚动；经 refs 交给观察器。 */
  target?: HTMLElement | null
  onAffixChange?: AffixProps['onAffixChange']
  children?: SlotChildren<AffixRootSlotProps>
}

/** 根节点是占位盒：content 吸住时脱流，它留在原位撑住那块空间。 */
export function XhAffixRoot({
  offsetTop,
  offsetBottom,
  target,
  onAffixChange,
  children,
  ...rest
}: XhAffixRootProps): ReactNode {
  // 取值器每帧换、接线只建一次：现读这一帧的 target，别让它成为重建的理由
  const latest = useRef(target)
  latest.current = target
  const getTargetEl = useCallback(() => latest.current ?? null, [])
  const ctx = useAffix({ offsetTop, offsetBottom, onAffixChange } as AffixProps, getTargetEl)
  return (
    <AffixProvider value={ctx}>
      <div
        {...mergeReactProps(
          ctx.api.getRootProps() as Record<string, unknown>,
          rest as Record<string, unknown>,
          { ref: (el: HTMLDivElement | null) => { ctx.rootRef.current = el } },
        )}
      >
        {renderSlot(children, { affixed: ctx.api.affixed })}
      </div>
    </AffixProvider>
  )
}

XhAffixRoot.xhEvents = ['affix-change'] as const

export interface XhAffixContentProps extends ComponentPropsWithRef<'div'> {}
/** 吸住时脱离常规流钉在可视区边上，落位由机器量好写进内联样式。 */
export function XhAffixContent({ children, ...rest }: XhAffixContentProps): ReactNode {
  const ctx = useAffixContext()
  return (
    <div {...mergeReactProps(ctx.api.getContentProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </div>
  )
}
