/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 use signature pad 相关实现。

import type { Service } from '@xihan-ui/core'
import type { SignaturePadApi, SignaturePadSchema } from '@xihan-ui/headless'
import type { RefObject } from 'react'
import { connectSignaturePad, signaturePadMachine } from '@xihan-ui/headless'
import { useCallback, useRef } from 'react'
import { useFormReset } from '../../runtime/attach-form-reset'
import { reactNormalize } from '../../runtime/normalize-props'
import { useReactScope } from '../../runtime/react-id'
import { useMachine } from '../../runtime/use-machine'

export interface SignaturePadContext {
  service: Service<SignaturePadSchema>
  api: SignaturePadApi
  /** 画布节点，状态机在指针事件中用它把屏幕坐标换算为画布坐标。 */
  controlRef: RefObject<Element | null>
  /** 表单重置的锚点：接在根节点上。 */
  rootRef: RefObject<HTMLElement | null>
}

export function useSignaturePad(props: SignaturePadSchema['props']): SignaturePadContext {
  // connect 按 scope 派生 label 的 id，同页多实例的 IDREF 才不相撞
  const scope = useReactScope()
  const controlRef = useRef<Element | null>(null)
  const rootRef = useRef<HTMLElement | null>(null)

  // 机器的挂载效应会立刻读 refs，交在 onCreate 里才赶得上；传 getter 而非节点，ref 在挂载后才有值
  const onCreate = useCallback((service: Service<SignaturePadSchema>) => {
    service.refs.set('getControlEl', () => controlRef.current)
  }, [])

  const service = useMachine(signaturePadMachine, () => props, { scope, onCreate })

  // 笔迹攥在机器里，原生 reset 只还原原生控件——不接这条线，点重置签名还留在画布上
  useFormReset(service, rootRef)

  return { service, api: connectSignaturePad(service, reactNormalize), controlRef, rootRef }
}
