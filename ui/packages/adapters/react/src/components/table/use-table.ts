/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 use table 相关实现。

import type { Service } from '@xihan-ui/core'
import type { TableApi, TableSchema } from '@xihan-ui/headless'
import type { RefObject } from 'react'
import { connectTable, tableMachine } from '@xihan-ui/headless'
import { useCallback, useRef, useState } from 'react'
import { reactNormalize } from '../../runtime/normalize-props'
import { useReactScope } from '../../runtime/react-id'
import { useMachine } from '../../runtime/use-machine'

export interface TableContext {
  api: TableApi
  /** 状态机实例，供部件上报 DOM 侧的事实（如行卸载带走了焦点）。 */
  service: Service<TableSchema>
  /** root 节点：版面实测（冻结列偏移、纵向合并格的高度）从它往下量。 */
  rootRef: RefObject<HTMLElement | null>
  /** caption 部件挂载时登记、卸载时注销；根的 aria-labelledby 据此决定输不输出，首帧（含服务端直出）不写。 */
  registerCaption: () => () => void
}

export function useTable(props: TableSchema['props']): TableContext {
  const scope = useReactScope()
  const rootRef = useRef<HTMLElement | null>(null)
  // 取值口要赶在挂载效应之前交出去：机器的版面实测效应在挂载时读它
  const onCreate = useCallback((service: Service<TableSchema>) => {
    service.refs.set('getRootEl', () => rootRef.current)
  }, [])
  // 用状态而不是 ref：登记数要能把根重渲一次，connect 在渲染期求值
  const [captionCount, setCaptionCount] = useState(0)
  const registerCaption = useCallback(() => {
    setCaptionCount(n => n + 1)
    return () => setCaptionCount(n => n - 1)
  }, [])
  const service = useMachine(tableMachine, () => ({ ...props, captioned: captionCount > 0 }), { scope, onCreate })
  return { api: connectTable(service, reactNormalize), service, rootRef, registerCaption }
}
