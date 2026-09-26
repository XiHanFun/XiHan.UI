/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 use tags input 相关实现。

import type { Service } from '@xihan-ui/core'
import type { TagsInputApi, TagsInputSchema } from '@xihan-ui/headless'
import type { RefObject } from 'react'
import { connectTagsInput, tagsInputMachine } from '@xihan-ui/headless'
import { useRef } from 'react'
import { useFormReset } from '../../runtime/attach-form-reset'
import { reactNormalize } from '../../runtime/normalize-props'
import { useReactScope } from '../../runtime/react-id'
import { useMachine } from '../../runtime/use-machine'

export interface TagsInputContext {
  api: TagsInputApi
  /** 状态机实例，供部件上报 DOM 侧的事实（如标签节点带着焦点离场）。 */
  service: Service<TagsInputSchema>
  /** 表单重置的锚点：接在根节点上。 */
  rootRef: RefObject<HTMLElement | null>
  /** 标签所在的容器：列表动效接在它上面。 */
  controlRef: RefObject<HTMLElement | null>
}

export function useTagsInput(props: TagsInputSchema['props']): TagsInputContext {
  // 就地编辑框的 id 由 scope 按标签值派生，机器的聚焦副作用照它捞节点
  const scope = useReactScope()
  const rootRef = useRef<HTMLElement | null>(null)
  const controlRef = useRef<HTMLElement | null>(null)
  const service = useMachine(tagsInputMachine, () => props, {
    scope,
    // 列表动效在机器的挂载效应里取容器，取值口得赶在那之前交出去
    onCreate: (svc: Service<TagsInputSchema>) => {
      svc.refs.set('getControlEl', () => controlRef.current)
    },
  })

  // 标签集合攥在机器里，原生 reset 只还原原生控件——不接这条线，点重置什么都不会发生
  useFormReset(service, rootRef)

  return { api: connectTagsInput(service, reactNormalize), service, rootRef, controlRef }
}
