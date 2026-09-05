import type { Orientation, PropTypes, Size, Tone } from '@xihan-ui/core'

/**
 * 内容落在线的哪一侧。
 * start / end 是整条时间线统一一侧，alternate 是逐条左右（或上下）交替。
 */
export type TimelinePlacement = 'start' | 'end' | 'alternate'

export interface TimelineProps {
  /** 事件排列方向：vertical 自上而下、horizontal 自起点向终点，缺省 vertical。 */
  orientation?: Orientation
  /** 内容在线的哪一侧：start / end / alternate，不写则内容落在结束侧。 */
  placement?: TimelinePlacement
  /** 尺寸：sm / md / lg，决定圆点直径、条目间距与字号。 */
  size?: Size
}

/**
 * 条目自报家门。
 * connect 在 Vue 的 render 期求值，此时 DOM 尚不存在，不得反查 DOM。
 */
export interface TimelineItemProps {
  /** 这一条的语气：brand / neutral / success / warning / danger / info，只落在这一条的圆点上。 */
  tone?: Tone
}

export interface TimelineApi<T extends PropTypes = PropTypes> {
  getRootProps: () => T['element']
  getItemProps: () => T['element']
  /** 圆点的语气取自它所属的条目。 */
  getIndicatorProps: (props: TimelineItemProps) => T['element']
  getConnectorProps: () => T['element']
  getContentProps: () => T['element']
  getTitleProps: () => T['element']
  getDescriptionProps: () => T['element']
  getTimeProps: () => T['element']
}

/** 读屏用的文案。本组件目前没有需要外露的文案，位先留着。 */
export interface TimelineTranslations {}
