import type { NormalizeProps, PropTypes } from '@xihan-ui/core'
import type { InputGroupApi, InputGroupProps } from './input-group.types'
import { inputGroupAnatomy } from './input-group.anatomy'

const parts = inputGroupAnatomy.build()

// InputGroup 无状态机：一层容器，中缝合并、首尾圆角与层叠顺序全部由皮肤按身份给。
// 根上不写 role：组里放的是各自带语义的控件，它们的可及名与角色归它们自己。
export function connectInputGroup<T extends PropTypes>(
  props: InputGroupProps,
  normalize: NormalizeProps<T>,
): InputGroupApi<T> {
  return {
    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      'data-size': props.size,
    }),
    // 前后缀块只拿身份：文本由作者写，高度、描边与圆角由皮肤按这个身份给
    getItemProps: () => normalize.element(parts.item.attrs),
  }
}
