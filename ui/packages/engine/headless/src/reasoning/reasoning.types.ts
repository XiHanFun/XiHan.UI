import type { PropTypes, Size, Tone } from '@xihan-ui/kernel'

/** 视图属性，走 connect 的第二参。机器属性与 tool-call 共用一组。 */
export interface ReasoningProps {
  /** 还在思考。适配器把它折成机器的 running。 */
  streaming?: boolean
  /** 开始思考的时刻，毫秒时间戳。 */
  startTime?: number
  /** 思考结束的时刻。**可能缺席**：流被中止时兜底收尾不写这一个。 */
  endTime?: number
  tone?: Tone
  size?: Size
  translations?: Partial<ReasoningTranslations>
}

export interface ReasoningApi<T extends PropTypes = PropTypes> {
  open: boolean
  streaming: boolean
  disabled: boolean
  /** 想了多久，毫秒；两个时刻任一缺席即 undefined。 */
  durationMs: number | undefined
  setOpen: (next: boolean) => void
  getRootProps: () => T['element']
  getTriggerProps: () => T['button']
  getIndicatorProps: () => T['element']
  getLabelProps: () => T['element']
  getDurationProps: () => T['element']
  getContentProps: () => T['element']
}

export interface ReasoningTranslations {
  /** 折叠区的名字。 */
  label: string
  /** 还在想的时候显示什么。 */
  thinking: string
  /**
   * 想完之后显示什么，形如 `Thought for {seconds}s`。
   * 模板串由调用方现场代入，连接层不做插值。
   */
  thoughtFor: string
}

/** 两个时刻算时长；任一缺席、或倒着走，都算不出来。 */
export function reasoningDuration(startTime?: number, endTime?: number): number | undefined {
  if (startTime === undefined || endTime === undefined)
    return undefined
  const ms = endTime - startTime
  return Number.isFinite(ms) && ms >= 0 ? ms : undefined
}
