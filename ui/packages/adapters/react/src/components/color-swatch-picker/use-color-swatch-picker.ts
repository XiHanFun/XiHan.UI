/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 use color swatch picker 相关实现。

import type { Service } from '@xihan-ui/core'
import type { ColorSwatchPickerApi, ColorSwatchPickerSchema } from '@xihan-ui/headless'
import type { RefObject } from 'react'
import { colorSwatchPickerMachine, connectColorSwatchPicker } from '@xihan-ui/headless'
import { useRef } from 'react'
import { useFormReset } from '../../runtime/attach-form-reset'
import { reactNormalize } from '../../runtime/normalize-props'
import { useReactScope } from '../../runtime/react-id'
import { useMachine } from '../../runtime/use-machine'

export interface ColorSwatchPickerContext {
  api: ColorSwatchPickerApi
  /** 机器实例，供格子上报 DOM 侧的事实（如格子卸载带走了焦点）。 */
  service: Service<ColorSwatchPickerSchema>
  /** 表单重置的锚点：接在根节点上。 */
  rootRef: RefObject<HTMLElement | null>
}

export function useColorSwatchPicker(props: ColorSwatchPickerSchema['props']): ColorSwatchPickerContext {
  // connect 要按 scope 派生 label 的 id，同页多实例的 IDREF 才不相撞
  const scope = useReactScope()
  const rootRef = useRef<HTMLElement | null>(null)
  const service = useMachine(colorSwatchPickerMachine, () => props, { scope })

  // 选中值攥在机器里，原生 reset 只还原原生控件——不接这条线，点重置什么都不会发生
  useFormReset(service, rootRef)

  return { api: connectColorSwatchPicker(service, reactNormalize), service, rootRef }
}
