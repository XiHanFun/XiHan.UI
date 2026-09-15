/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 use field control 相关实现。

import { useOptionalFieldContext } from './context'
import { wiringOnly } from './field'

/** 读屏只朗读焦点所在节点的描述，因此说明与校验状态要落到真实控件上，不能停留在封装根。 */
const STATE_KEYS = ['aria-describedby', 'aria-invalid', 'aria-required', 'aria-readonly'] as const

const EMPTY: Record<string, unknown> = {}

function identity(props: Record<string, unknown>): Record<string, unknown> {
  return props
}

/**
 * 在薄封装内部取字段的控件接线属性（id 与 aria-*），把它们绑定到真正可聚焦的节点上。
 *
 * 外层要写 `<XhFieldControl asChild={false}>`，否则属性会被合并两遍。
 * 不在字段内时返回空对象，封装仍可单独使用。
 */
export function useFieldControl(): Record<string, unknown> {
  const ctx = useOptionalFieldContext()
  if (!ctx)
    return EMPTY
  return wiringOnly(ctx.api.getControlProps() as Record<string, unknown>)
}

/** 字段的说明、校验与只读状态，供薄封装补到自己的可聚焦节点上。 */
export function useFieldStateWiring(): Record<string, unknown> {
  const ctx = useOptionalFieldContext()
  if (!ctx)
    return EMPTY
  const control = ctx.api.getControlProps() as Record<string, unknown>
  const wiring: Record<string, unknown> = {}
  for (const key of STATE_KEYS) {
    if (control[key] !== undefined)
      wiring[key] = control[key]
  }
  return wiring
}

/**
 * 把字段标签的 id 并入该份属性中的名字链。
 *
 * 复合控件的可聚焦部件自带 aria-labelledby，指向它自己的 label 部件；放入字段时
 * 作者使用的是字段的标签、组件的 label 部件并未渲染，该引用于是指向一个不存在的
 * 节点。字段的标签排在最前，控件自己的部分跟在后面，两边都可朗读。
 */
export function useFieldLabelWiring(): (props: Record<string, unknown>) => Record<string, unknown> {
  const ctx = useOptionalFieldContext()
  if (!ctx)
    return identity
  const labelId = ctx.api.labelId
  return (props) => {
    const own = props['aria-labelledby']
    return { ...props, 'aria-labelledby': own == null ? labelId : `${labelId} ${String(own)}` }
  }
}
