import type { IconNode, NormalizeProps, PropTypes } from '@xihan-ui/core'
import type { IconApi, IconProps } from './icon.types'
import { iconAnatomy } from './icon.anatomy'

const parts = iconAnatomy.build()

// 没传图标时透出的空树，恒等以免每次调用都换一个新数组。
const EMPTY_NODES: readonly IconNode[] = []

/**
 * Icon 无状态机：属性全部来自 props，不读 document、不生成 id、不掷随机数。
 *
 * 命名分两态且互斥：
 * · 有名字 → role="img" + aria-label，不写 aria-hidden；
 * · 无名字 → aria-hidden="true"，不写 role、不写 aria-label。
 * 两态都写会让同一处既是有名字的图像对象、又被摘出无障碍树，行为随实现而异。
 *
 * 记录的呈现属性铺在最前面，解剖标记与语义属性写在它后面：记录里出现同名键时改不掉后者。
 */
export function connectIcon<T extends PropTypes>(
  props: IconProps,
  normalize: NormalizeProps<T>,
): IconApi<T> {
  // 空串与纯空白不算给过名字：属性写成 label 或 label="" 时取到的正是空串，
  // 认了它就得到一个有 role="img" 却没有名字的对象，读屏只报"图像"
  const label = props.label != null && props.label.trim() !== '' ? props.label : undefined
  const decorative = label === undefined
  const icon = props.icon

  return {
    label,
    decorative,
    nodes: icon?.nodes ?? EMPTY_NODES,
    content: icon,

    getRootProps: () => normalize.element({
      ...icon?.attrs,
      ...parts.root.attrs,
      'viewBox': icon?.viewBox,
      // 皮肤与开发者工具的抓手，同时是"这个 glyph 的内容归元素所有"的标记
      'data-icon': icon?.name,
      'role': decorative ? undefined : 'img',
      'aria-label': label,
      'aria-hidden': decorative ? 'true' : undefined,
      // 缺省档不写属性：皮肤的基础规则就是缺省档
      'data-size': props.size,
      'data-weight': props.weight,
      'data-tone': props.tone,
    }),

    getGlyphProps: () => normalize.element({
      ...parts.glyph.attrs,
    }),
  }
}
