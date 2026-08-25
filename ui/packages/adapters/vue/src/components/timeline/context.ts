import type { TimelineApi, TimelineItemProps } from '@xihan-ui/headless'
import type { ComputedRef, InjectionKey } from 'vue'
import { inject, provide } from 'vue'

export interface TimelineContext {
  api: ComputedRef<TimelineApi>
}

const KEY: InjectionKey<TimelineContext> = Symbol.for('xh-timeline')
/** 条目的语气下传给圆点，用 getter 以跟随 tone 变更。 */
const ITEM_KEY: InjectionKey<() => TimelineItemProps> = Symbol.for('xh-timeline-item')

export function provideTimeline(ctx: TimelineContext): void {
  provide(KEY, ctx)
}

export function useTimelineContext(): TimelineContext {
  const ctx = inject(KEY, null)
  if (!ctx)
    throw new Error('[xh] Timeline 部件必须用在 XhTimelineRoot 内')
  return ctx
}

export function provideTimelineItem(item: () => TimelineItemProps): void {
  provide(ITEM_KEY, item)
}

export function useTimelineItem(): () => TimelineItemProps {
  const item = inject(ITEM_KEY, null)
  if (!item)
    throw new Error('[xh] Timeline 圆点必须用在 XhTimelineItem 内')
  return item
}
