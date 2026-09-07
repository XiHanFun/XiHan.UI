import type { TimelineApi, TimelineItemProps } from '@xihan-ui/headless'
import { createContext, useContext } from 'react'

export interface TimelineContext {
  api: TimelineApi
}

const Ctx = createContext<TimelineContext | undefined>(undefined)
/** 条目的语气下传给它自己那颗圆点。 */
const ItemCtx = createContext<TimelineItemProps | undefined>(undefined)

export const TimelineProvider = Ctx
export const TimelineItemProvider = ItemCtx

export function useTimelineContext(): TimelineContext {
  const ctx = useContext(Ctx)
  if (!ctx)
    throw new Error('XhTimeline 的部件要放在 XhTimelineRoot 里')
  return ctx
}

export function useTimelineItemContext(): TimelineItemProps {
  const item = useContext(ItemCtx)
  if (!item)
    throw new Error('时间线的圆点要放在 XhTimelineItem 里')
  return item
}
