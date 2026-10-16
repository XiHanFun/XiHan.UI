/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 use clipboard 相关实现。

import type { Service } from '@xihan-ui/core'
import type { ClipboardApi, ClipboardSchema } from '@xihan-ui/headless'
import { clipboardMachine, connectClipboard } from '@xihan-ui/headless'
import { useCallback, useState } from 'react'
import { reactNormalize } from '../../runtime/normalize-props'
import { useReactScope } from '../../runtime/react-id'
import { useMachine } from '../../runtime/use-machine'

export interface ClipboardContext {
  /**
   * label 部件挂载时登记、卸载时注销。可聚焦部件的 aria-labelledby 据此决定输不输出；
   * 首帧（含服务端直出）还没登记，不写这条引用。
   */
  registerLabel: () => () => void
  api: ClipboardApi
  service: Service<ClipboardSchema>
}

export function useClipboard(props: ClipboardSchema['props']): ClipboardContext {
  // connect 要派生 label 与 input 的 id，因此建 scope：同页多份 IDREF 才不会相撞
  const scope = useReactScope()
  // 用状态而不是 ref：登记数要能把根重渲一次，connect 在渲染期求值
  const [labelCount, setLabelCount] = useState(0)
  const registerLabel = useCallback(() => {
    setLabelCount(n => n + 1)
    return () => setLabelCount(n => n - 1)
  }, [])
  const service = useMachine(clipboardMachine, () => ({ ...props, labelled: labelCount > 0 }), { scope })
  return { registerLabel, api: connectClipboard(service, reactNormalize), service }
}
