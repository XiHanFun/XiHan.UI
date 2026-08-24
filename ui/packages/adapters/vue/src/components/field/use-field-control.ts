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

/**
 * 只取字段的「状态接线」（说明、校验、只读），不含 id 与名字。
 *
 * 给库自己的薄封装用：XhFieldControl 默认把整套属性合到封装根上，id 与
 * aria-labelledby 落在那里是对的（label 的 for 得指得到一个真节点）；但
 * aria-describedby 与 aria-invalid 落在根上就等于没落——焦点进的是里面那个
 * input / button，读屏只念焦点所在节点的描述，说明与错误文本因此播报不出来。
 * 封装把这几条补到真控件上，两边不冲突：id 只有一份，描述有两份不影响播报。
 *
 * 作者自己写封装时用上面那个 useFieldControl（配 `:as-child="false"`），
 * 那条路整套属性都落到真控件上。
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
 * 把字段标签的 id 并进这份属性里的名字链，供库自己的薄封装包在渲染属性外面。
 *
 * 复合控件的可聚焦部件自带 aria-labelledby，指的是它自己的 label 部件。套进字段时
 * 作者用的是字段的标签、组件那个 label 部件根本没渲染，这条引用于是指向一个不存在的
 * 节点——按 accname 规则悬空 IDREF 直接跳过，而名字也回退不到 label 的 for：for 指的
 * 是封装根那个 div，只对可标注元素生效。结果是焦点所在的那个控件一个名字都没有。
 *
 * 字段的标签排在最前，控件自己的那截（值文本这类）跟在后面，两边都念得到。
 * 不在字段里时属性原样返回。
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
