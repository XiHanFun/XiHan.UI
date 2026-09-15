/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 reasoning 类型契约。

import type { ControlVariant, PropTypes, Size, Tone } from '@xihan-ui/core'

/** 视图属性，经 connect 的第二个参数传入。状态机属性与 tool-call 共用一组。 */
export interface ReasoningProps {
  /** 仍在思考。适配器把它折叠为状态机的 running。 */
  streaming?: boolean
  /** 开始思考的时刻，毫秒时间戳。 */
  startTime?: number
  /** 思考结束的时刻。可能缺席：流被中止时兜底收尾不写该字段。 */
  endTime?: number
  /** 形态：outline 描边、subtle 底色分区（默认档）、ghost 无壳内联。 */
  variant?: ControlVariant
  tone?: Tone
  size?: Size
  translations?: Partial<ReasoningTranslations>
}

export interface ReasoningApi<T extends PropTypes = PropTypes> {
  open: boolean
  streaming: boolean
  disabled: boolean
  /** 思考时长，毫秒；两个时刻任一缺席即 undefined。 */
  durationMs: number | undefined
  /** 当前应显示的状态文案，已按 streaming 与时长选定。 */
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
  /** 折叠区的名字，无法计算时长时也使用它。 */
  label: string
  /** 仍在思考时显示的文案。 */
  thinking: string
  /**
   * 思考完成后显示的文案，形如 `Thought for {seconds}s`。
   * `{seconds}` 替换为秒数，保留一位小数；串中没有该占位符时原样显示。
   */
  thoughtFor: string
}

/** 由两个时刻计算时长；任一缺席、或倒序，都无法计算。 */
export function reasoningDuration(startTime?: number, endTime?: number): number | undefined {
  if (startTime === undefined || endTime === undefined)
    return undefined
  const ms = endTime - startTime
  return Number.isFinite(ms) && ms >= 0 ? ms : undefined
}

/**
 * 当前应显示的状态文案。
 *
 * 仍在思考时是思考中文案；已完成且可计算时长时，把秒数代入模板串；
 * 时长无法计算（流被中止、未写结束时刻）时回退为折叠区的名字。
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
