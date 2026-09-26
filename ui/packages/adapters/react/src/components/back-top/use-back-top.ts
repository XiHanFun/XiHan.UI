/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 use back top 相关实现。

import type { Service } from '@xihan-ui/core'
import type { BackTopApi, BackTopSchema } from '@xihan-ui/headless'
import { backTopMachine, connectBackTop } from '@xihan-ui/headless'
import { useCallback, useRef } from 'react'
import { reactNormalize } from '../../runtime/normalize-props'
import { useReactScope } from '../../runtime/react-id'
import { useMachine } from '../../runtime/use-machine'

export interface BackTopContext {
  api: BackTopApi
  service: Service<BackTopSchema>
}

/** getTargetEl 返回滚动容器，null 即整页滚动；滚动量的观察在状态机的效应中运行。 */
export function useBackTop(
  props: BackTopSchema['props'],
  getTargetEl: () => HTMLElement | null = () => null,
): BackTopContext {
  // 取值器每帧换、接线只建一次：拿 ref 转一道，别让它成为重建的理由
  const targetEl = useRef(getTargetEl)
  targetEl.current = getTargetEl

  // 观察器在机器的挂载效应里跑，DOM 侧的取值口要赶在那之前交出去
  const onCreate = useCallback((service: Service<BackTopSchema>) => {
    service.refs.set('getTargetEl', () => targetEl.current())
  }, [])

  // 按钮带 id（机器按它等退场、接液态面）：用 useId 派生的 scope，服务端与水合两侧同号
  const service = useMachine(backTopMachine, () => props, { onCreate, scope: useReactScope() })
  return { api: connectBackTop(service, reactNormalize), service }
}
