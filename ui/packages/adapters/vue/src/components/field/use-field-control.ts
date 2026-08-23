import type { ComputedRef } from 'vue'
import { computed } from 'vue'
import { useOptionalFieldContext } from './context'
import { wiringOnly } from './field'

/**
 * 在薄封装内部取字段的控件接线属性（id 与 aria-*），把它们绑到真正可聚焦的那个节点上。
 *
 * XhFieldControl 默认把属性合到它唯一的子节点上，而子节点是组件时合的是组件根——
 * 封装的根往往是个 div，label 的 for 指过去就聚不到焦（for 只对可标注元素生效），
 * 而且这种失效不报错。封装内部调一次本组合式，接线就落在该落的节点上。
 *
 * 外层要写 `<XhFieldControl :as-child="false">`，否则属性会被合两遍。
 * 不在字段里时返回空对象，封装照样能单独用。
 */
export function useFieldControl(): ComputedRef<Record<string, unknown>> {
  const ctx = useOptionalFieldContext()
  return computed(() => {
    if (!ctx)
      return {}
    return wiringOnly(ctx.api.value.getControlProps() as Record<string, unknown>)
  })
}
