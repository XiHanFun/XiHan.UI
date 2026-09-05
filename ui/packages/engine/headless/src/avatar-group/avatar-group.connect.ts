import type { NormalizeProps, PropTypes } from '@xihan-ui/core'
import type { AvatarGroupApi, AvatarGroupProps } from './avatar-group.types'
import { avatarGroupAnatomy } from './avatar-group.anatomy'

const parts = avatarGroupAnatomy.build()

// AvatarGroup 无状态机：一层容器，尺寸与上限全部由 props 算出。
// 根上不写 role：一排头像是列表还是纯装饰，由作者放了什么内容决定，作者自己声明。
export function connectAvatarGroup<T extends PropTypes>(
  props: AvatarGroupProps,
  normalize: NormalizeProps<T>,
): AvatarGroupApi<T> {
  const rootAttrs = {
    ...parts.root.attrs,
    'data-size': props.size,
    // 上限如实落成字符串，两个适配器写到 DOM 上的值一致
    'data-max': props.max == null ? undefined : String(props.max),
  }

  return {
    getRootProps: () => normalize.element(rootAttrs),
    // 溢出计数只拿身份：内容由作者写，位置与形状由皮肤按这个身份给
    getOverflowItemProps: () => normalize.element(parts['overflow-item'].attrs),
  }
}
