import type { NormalizeProps, PropTypes } from '@xihan-ui/core'
import type { ButtonGroupApi, ButtonGroupProps } from './button-group.types'
import { dataAttr } from '@xihan-ui/core'
import { buttonGroupAnatomy } from './button-group.anatomy'

const parts = buttonGroupAnatomy.build()

// ButtonGroup 无状态机：一层容器，排布与三个视觉轴全部由 props 算出。
// 三轴只落在根上，组内每一段从根继承下来的自定义属性里取值，段自己不重复标注。
export function connectButtonGroup<T extends PropTypes>(
  props: ButtonGroupProps,
  normalize: NormalizeProps<T>,
): ButtonGroupApi<T> {
  const orientation = props.orientation ?? 'horizontal'
  const disabled = !!props.disabled

  return {
    disabled,

    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      // 一组相关按钮对读屏是一个整体；role=group 不收 aria-orientation，排布只走 data-orientation
      'role': 'group',
      'data-orientation': orientation,
      'data-variant': props.variant,
      'data-tone': props.tone,
      'data-size': props.size,
      'data-disabled': dataAttr(disabled),
      'data-full-width': dataAttr(!!props.fullWidth),
    }),

    // 段间的装饰线：不是按钮，读屏不念。
    // 画的是这条线自己的朝向（横排里是竖线），与 root 的 data-orientation 相反
    getSeparatorProps: () => normalize.element({
      ...parts.separator.attrs,
      'aria-hidden': true,
      'data-orientation': orientation === 'horizontal' ? 'vertical' : 'horizontal',
      'data-disabled': dataAttr(disabled),
    }),
  }
}
