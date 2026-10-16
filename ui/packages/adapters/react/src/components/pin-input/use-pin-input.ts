/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 use pin input 相关实现。

import type { Service } from '@xihan-ui/core'
import type { PinInputApi, PinInputSchema } from '@xihan-ui/headless'
import type { RefObject } from 'react'
import { connectPinInput, pinInputMachine } from '@xihan-ui/headless'
import { useCallback, useRef, useState } from 'react'
import { useFormReset } from '../../runtime/attach-form-reset'
import { reactNormalize } from '../../runtime/normalize-props'
import { useReactScope } from '../../runtime/react-id'
import { useMachine } from '../../runtime/use-machine'

export interface PinInputContext {
  /**
   * label 部件挂载时登记、卸载时注销。可聚焦部件的 aria-labelledby 据此决定输不输出；
   * 首帧（含服务端直出）还没登记，不写这条引用。
   */
  registerLabel: () => () => void
  api: PinInputApi
  service: Service<PinInputSchema>
  /** 表单重置的锚点：接在根节点上。 */
  rootRef: RefObject<HTMLElement | null>
}

export function usePinInput(props: PinInputSchema['props']): PinInputContext {
  // 每格的 id 由 scope 逐下标派生，label 的 for 指向首格，同页多实例才不相撞
  const scope = useReactScope()
  const rootRef = useRef<HTMLElement | null>(null)
  // 用状态而不是 ref：登记数要能把根重渲一次，connect 在渲染期求值
  const [labelCount, setLabelCount] = useState(0)
  const registerLabel = useCallback(() => {
    setLabelCount(n => n + 1)
    return () => setLabelCount(n => n - 1)
  }, [])
  const service = useMachine(pinInputMachine, () => ({ ...props, labelled: labelCount > 0 }), { scope })

  // 值攥在机器里，原生 reset 只还原原生控件——不接这条线，点重置什么都不会发生
  useFormReset(service, rootRef)

  return { registerLabel, api: connectPinInput(service, reactNormalize), service, rootRef }
}
