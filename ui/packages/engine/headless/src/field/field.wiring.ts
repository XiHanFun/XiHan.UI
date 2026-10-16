/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供字段交给库内控件的接线：控件把它并进自己真正可聚焦的部件。

import type { FieldApi } from './field.types'

/** 字段交给库内控件的接线。控件并进自己的可聚焦部件（输入框、触发钮、组根、拇指）。 */
export interface FieldControlWiring {
  /** 字段标签的 id，排在控件名字链的最前。 */
  readonly labelId: string
  /** 说明与错误文案的 id 链，invalid 时才含错误文案。 */
  readonly describedBy: string
  readonly invalid: boolean
  readonly required: boolean
  readonly readOnly: boolean
}

/** 从字段的 connect 结果取出交给库内控件的接线。 */
export function fieldControlWiring(api: FieldApi): FieldControlWiring {
  const control = api.getControlProps() as Record<string, unknown>
  return {
    labelId: api.labelId,
    describedBy: String(control['aria-describedby'] ?? ''),
    invalid: api.invalid,
    required: api.required,
    readOnly: api.readOnly,
  }
}

/**
 * 输入框、触发钮这类控件的接线属性：描述链与校验、必填、只读三态。
 * 读屏只朗读焦点所在节点的描述，所以这几条要落在真实控件上，不能停在封装根。
 */
export function fieldStateAttrs(wiring: FieldControlWiring): Record<string, string> {
  return {
    'aria-describedby': wiring.describedBy,
    'aria-invalid': wiring.invalid ? 'true' : 'false',
    'aria-required': wiring.required ? 'true' : 'false',
    'aria-readonly': wiring.readOnly ? 'true' : 'false',
  }
}

/**
 * 组类控件（单选组、复选框组、滑块、评分、分格输入……）的接线属性：只有描述链。
 * 校验、必填与只读由组件按字段状态自己投影：role=group 不接受 aria-invalid / aria-required。
 */
export function fieldGroupAttrs(wiring: FieldControlWiring): Record<string, string> {
  return { 'aria-describedby': wiring.describedBy }
}

/**
 * 把字段标签的 id 并进这份属性的名字链：字段标签排在最前，控件自己的部分（值文本等）跟在后面。
 * 复合控件的可聚焦部件自带的 aria-labelledby 指向它自己的 label 部件，放进字段时那个部件不渲染。
 * 没有字段标签时原样返回。
 */
export function withFieldLabel(props: Record<string, unknown>, labelId: string | undefined): Record<string, unknown> {
  if (!labelId)
    return props
  const own = props['aria-labelledby']
  return {
    ...props,
    'aria-labelledby': typeof own === 'string' && own ? `${labelId} ${own}` : labelId,
  }
}
