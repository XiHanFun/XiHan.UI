/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 use steps 相关实现。

import type { Service } from '@xihan-ui/core'
import type { StepsApi, StepsSchema } from '@xihan-ui/headless'
import { connectSteps, stepsMachine } from '@xihan-ui/headless'
import { useCallback, useState } from 'react'
import { useIsomorphicLayoutEffect } from '../../runtime/layout-effect'
import { reactNormalize } from '../../runtime/normalize-props'
import { useReactScope } from '../../runtime/react-id'
import { useMachine } from '../../runtime/use-machine'

export interface StepsContext {
  api: StepsApi
  /** 状态机实例，供部件上报 DOM 侧的事实（如条目卸载带走了焦点）。 */
  service: Service<StepsSchema>
  /** 步骤面板登记在场，返回撤销函数：一块面板都没挂时触发器不写 aria-controls。 */
  registerContent: () => () => void
}

export function useSteps(props: StepsSchema['props']): StepsContext {
  const scope = useReactScope()
  const [contents, setContents] = useState(0)
  // 根的 layout effect 跑过之前（首帧、服务端直出）还数不出面板，按在场处理；面板在自己的 layout effect 里登记，先于根
  const [mounted, setMounted] = useState(false)
  useIsomorphicLayoutEffect(() => setMounted(true), [])
  const registerContent = useCallback(() => {
    setContents(n => n + 1)
    return () => setContents(n => n - 1)
  }, [])
  const parts = mounted ? { content: contents > 0 } : undefined
  const service = useMachine(stepsMachine, () => ({ ...props, parts }), { scope })
  return { api: connectSteps(service, reactNormalize), service, registerContent }
}
