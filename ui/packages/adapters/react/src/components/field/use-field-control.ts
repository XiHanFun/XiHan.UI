import { useOptionalFieldContext } from './context'

/** 读屏只念焦点所在节点的描述，所以说明与校验状态要落到真控件上，不能停在封装根。 */
const STATE_KEYS = ['aria-describedby', 'aria-invalid', 'aria-required', 'aria-readonly'] as const

const EMPTY: Record<string, unknown> = {}

function identity(props: Record<string, unknown>): Record<string, unknown> {
  return props
}

/** 字段的说明、校验与只读状态，供薄封装补到自己那个可聚焦节点上。 */
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
 * 把字段标签的 id 并进这份属性里的名字链。
 *
 * 复合控件的可聚焦部件自带 aria-labelledby，指的是它自己的 label 部件；套进字段时
 * 作者用的是字段的标签、组件那个 label 部件根本没渲染，这条引用于是指向一个不存在的
 * 节点。字段的标签排在最前，控件自己的那截跟在后面，两边都念得到。
 */
export function useFieldLabelWiring(): (props: Record<string, unknown>) => Record<string, unknown> {
  const ctx = useOptionalFieldContext()
  if (!ctx)
    return identity
  const labelId = (ctx.api.getLabelProps() as { id?: string }).id
  if (labelId === undefined)
    return identity
  return (props) => {
    const own = props['aria-labelledby']
    return { ...props, 'aria-labelledby': own == null ? labelId : `${labelId} ${String(own)}` }
  }
}
