/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 use slider 相关实现。

import type { Service } from '@xihan-ui/core'
import type { SliderApi, SliderSchema } from '@xihan-ui/headless'
import type { RefObject } from 'react'
import { connectSlider, sliderMachine } from '@xihan-ui/headless'
import { useCallback, useRef, useState } from 'react'
import { useFormReset } from '../../runtime/attach-form-reset'
import { reactNormalize } from '../../runtime/normalize-props'
import { useReactScope } from '../../runtime/react-id'
import { useMachine } from '../../runtime/use-machine'

export interface SliderContext {
  /**
   * label 部件挂载时登记、卸载时注销。可聚焦部件的 aria-labelledby 据此决定输不输出；
   * 首帧（含服务端直出）还没登记，不写这条引用。
   */
  registerLabel: () => () => void
  api: SliderApi
  service: Service<SliderSchema>
  /** 轨道节点，状态机在指针事件中读取它的矩形。 */
  trackRef: RefObject<HTMLElement | null>
  /** 表单重置的锚点：接在根节点上。 */
  rootRef: RefObject<HTMLElement | null>
}

export function useSlider(props: SliderSchema['props']): SliderContext {
  const scope = useReactScope()
  const trackRef = useRef<HTMLElement | null>(null)
  const rootRef = useRef<HTMLElement | null>(null)

  // 机器的挂载效应会立刻读 refs，交在 onCreate 里才赶得上；传 getter 而非节点，ref 在挂载后才有值
  const onCreate = useCallback((service: Service<SliderSchema>) => {
    service.refs.set('getTrackEl', () => trackRef.current)
  }, [])

  // 用状态而不是 ref：登记数要能把根重渲一次，connect 在渲染期求值
  const [labelCount, setLabelCount] = useState(0)
  const registerLabel = useCallback(() => {
    setLabelCount(n => n + 1)
    return () => setLabelCount(n => n - 1)
  }, [])
  const service = useMachine(sliderMachine, () => ({ ...props, labelled: labelCount > 0 }), { scope, onCreate })

  // 值攥在机器里，原生 reset 只还原原生控件——不接这条线，点重置滑块停在原处
  useFormReset(service, rootRef)

  return { registerLabel, api: connectSlider(service, reactNormalize), service, trackRef, rootRef }
}
