/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 button group 相关实现。

import type { NormalizeProps, PropTypes } from '@xihan-ui/core'
import type { ButtonGroupApi, ButtonGroupProps } from './button-group.types'
import { dataAttr } from '@xihan-ui/core'
import { buttonGroupAnatomy } from './button-group.anatomy'

const parts = buttonGroupAnatomy.build()

// ButtonGroup 无状态机：一层容器，排布与三个视觉轴全部由 props 算出。
// 三轴落在根上；组的 variant / tone / size 同时经 api 暴露，适配器按整组禁用同一条下发路径
// 把它们落到每一段（段自己写了的优先），段因此自带 data-xh-action-variant，颜色由家族形态矩阵给出。
export function connectButtonGroup<T extends PropTypes>(
  props: ButtonGroupProps,
  normalize: NormalizeProps<T>,
): ButtonGroupApi<T> {
  const orientation = props.orientation ?? 'horizontal'
  const disabled = !!props.disabled
  const separators = props.separators ?? true
  // 组缺省中性淡底（真源 §7.2 第 2 条：只有 Button 单独一枚缺省品牌实心），显式落 subtle
  const variant = props.variant ?? 'subtle'
  const tone = props.tone
  const size = props.size

  return {
    orientation,
    disabled,
    separators,
    variant,
    tone,
    size,

    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      // 一组相关按钮对读屏是一个整体；role=group 不收 aria-orientation，排布只走 data-orientation
      'role': 'group',
      'data-orientation': orientation,
      'data-variant': variant,
      'data-tone': tone,
      'data-size': size,
      'data-disabled': dataAttr(disabled),
      'data-full-width': dataAttr(!!props.fullWidth),
    }),
  }
}
