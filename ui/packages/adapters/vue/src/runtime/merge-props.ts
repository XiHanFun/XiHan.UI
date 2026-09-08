import { isEventHandlerKey } from '@xihan-ui/core'
import { mergeProps as mergeVueProps } from 'vue'

type Props = Record<string, unknown>

/** 摊平成数组：Vue 的直通属性里同名处理器可能已经是一组。 */
function handlers(value: unknown): unknown[] {
  if (value == null)
    return []
  const list = Array.isArray(value) ? value : [value]
  return list.filter(fn => typeof fn === 'function')
}

/**
 * 把部件接线与作者写在部件上的属性合成一份。
 *
 * 同名事件处理器作者的排在前面先跑、部件的后跑，作者因此能在部件动作之前拦下事件；
 * class 与 style 两边都留，其余普通值作者的说了算。
 */
export function mergePartProps(part: Props, author: Props): Props {
  const merged = mergeVueProps(part, author) as Props
  for (const key of Object.keys(merged)) {
    if (!isEventHandlerKey(key))
      continue
    const theirs = handlers(author[key])
    const ours = handlers(part[key])
    if (theirs.length > 0 && ours.length > 0)
      merged[key] = [...theirs, ...ours]
  }
  return merged
}
