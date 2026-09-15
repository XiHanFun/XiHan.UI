/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 use field control 相关实现。

import type { ComputedRef } from 'vue'
import { computed } from 'vue'
import { useOptionalFieldContext } from './context'
import { wiringOnly } from './field'

/**
 * 在薄封装内部取字段的控件接线属性（id 与 aria-*），把它们绑定到真正可聚焦的节点上。
 *
 * XhFieldControl 默认把属性合并到它唯一的子节点上，而子节点是组件时合并的是组件根：
 * 封装的根往往是一个 div，label 的 for 指向它时无法聚焦（for 只对可标注元素生效），
 * 且这种失效不报错。封装内部调用一次本组合式，接线就落在应落的节点上。
 *
 * 外层要写 `<XhFieldControl :as-child="false">`，否则属性会被合并两遍。
 * 不在字段内时返回空对象，封装仍可单独使用。
 */
export function useFieldControl(): ComputedRef<Record<string, unknown>> {
  const ctx = useOptionalFieldContext()
  return computed(() => {
    if (!ctx)
      return {}
    return wiringOnly(ctx.api.value.getControlProps() as Record<string, unknown>)
  })
}

/**
 * 只取字段的状态接线（说明、校验、只读），不含 id 与名字。
 *
 * 供库自身的薄封装使用：XhFieldControl 默认把整套属性合并到封装根上，id 与
 * aria-labelledby 落在那里是正确的（label 的 for 必须指向一个真实节点）；但
 * aria-describedby 与 aria-invalid 落在根上等于未落：焦点进入的是内部的
 * input / button，读屏只朗读焦点所在节点的描述，说明与错误文本因此无法播报。
 * 封装把这几条补到真实控件上，两边不冲突：id 只有一份，描述有两份不影响播报。
 *
 * 作者自行编写封装时使用上面的 useFieldControl（配合 `:as-child="false"`），
 * 该路径整套属性都落到真实控件上。
 */
export function useFieldStateWiring(): ComputedRef<Record<string, unknown>> {
  const ctx = useOptionalFieldContext()
  return computed(() => {
    if (!ctx)
      return {}
    const control = ctx.api.value.getControlProps() as Record<string, unknown>
    const wiring: Record<string, unknown> = {}
    for (const key of ['aria-describedby', 'aria-invalid', 'aria-required', 'aria-readonly']) {
      if (control[key] !== undefined)
        wiring[key] = control[key]
    }
    return wiring
  })
}

/**
 * 把字段标签的 id 并入该份属性中的名字链，供库自身的薄封装包在渲染属性外面。
 *
 * 复合控件的可聚焦部件自带 aria-labelledby，指向它自己的 label 部件。放入字段时
 * 作者使用的是字段的标签、组件的 label 部件并未渲染，该引用于是指向一个不存在的
 * 节点：按 accname 规则悬空 IDREF 直接跳过，而名字也无法回退到 label 的 for：for 指向的
 * 是封装根的 div，只对可标注元素生效。结果是焦点所在的控件没有任何名字。
 *
 * 字段的标签排在最前，控件自己的部分（值文本等）跟在后面，两边都可朗读。
 * 不在字段内时属性原样返回。
 */
export function useFieldLabelWiring(): ComputedRef<(props: Record<string, unknown>) => Record<string, unknown>> {
  const ctx = useOptionalFieldContext()
  return computed(() => {
    const labelId = ctx?.api.value.labelId
    return (props: Record<string, unknown>) => {
      if (!labelId)
        return props
      const own = props['aria-labelledby']
      return {
        ...props,
        'aria-labelledby': typeof own === 'string' && own ? `${labelId} ${own}` : labelId,
      }
    }
  })
}
