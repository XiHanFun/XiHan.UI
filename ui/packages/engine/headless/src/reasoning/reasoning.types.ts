import type { ControlVariant, PropTypes, Size, Tone } from '@xihan-ui/core'

/** 视图属性，走 connect 的第二参。机器属性与 tool-call 共用一组。 */
export interface ReasoningProps {
  /** 还在思考。适配器把它折成机器的 running。 */
  streaming?: boolean
  /** 开始思考的时刻，毫秒时间戳。 */
  startTime?: number
  /** 思考结束的时刻。**可能缺席**：流被中止时兜底收尾不写这一个。 */
  endTime?: number
  /** 形态：outline 描边、subtle 底色分区（缺省档）、ghost 无壳内联。 */
  variant?: ControlVariant
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
  /** 当前该显示哪句状态文案，已按 streaming 与时长选好。 */
  statusText: string
  setOpen: (next: boolean) => void
  getRootProps: () => T['element']
  getTriggerProps: () => T['button']
  getIconProps: () => T['element']
  getIndicatorProps: () => T['element']
  getLabelProps: () => T['element']
  getDurationProps: () => T['element']
  getContentProps: () => T['element']
}

export interface ReasoningTranslations {
  /** 折叠区的名字，算不出时长时也用它。 */
  label: string
  /** 还在想的时候显示什么。 */
  thinking: string
  /**
   * 想完之后显示什么，形如 `Thought for {seconds}s`。
   * `{seconds}` 换成秒数，保留一位小数；串里没有这个占位符就原样显示。
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

/**
 * 当前该显示哪句状态文案。
 *
 * 还在想就是「在想」那一句；想完且算得出时长，把秒数代进模板串；
 * 时长算不出来（流被中止、没写结束时刻）回落折叠区的名字。
 */
export function reasoningStatusText(
  streaming: boolean,
  durationMs: number | undefined,
  translations?: Partial<ReasoningTranslations>,
): string {
  if (streaming)
    return translations?.thinking ?? 'Thinking…'
  const label = translations?.label ?? 'Thought process'
  if (durationMs === undefined)
    return label
  const seconds = Math.round(durationMs / 100) / 10
  const template = translations?.thoughtFor ?? 'Thought for {seconds}s'
  return template.replace('{seconds}', String(seconds))
}
