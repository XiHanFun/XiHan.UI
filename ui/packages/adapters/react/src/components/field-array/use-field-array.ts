/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 use field array 相关实现。

import type { Service } from '@xihan-ui/core'
import type { FieldArrayApi, FieldArraySchema, FormSchema, SortableSchema } from '@xihan-ui/headless'
import type { RefObject } from 'react'
import { connectFieldArray, fieldArrayDragContainer, fieldArrayDragItems, fieldArrayDragProps, fieldArrayMachine, sortableMachine } from '@xihan-ui/headless'
import { useRef } from 'react'
import { useFormReset } from '../../runtime/attach-form-reset'
import { reactNormalize } from '../../runtime/normalize-props'
import { useReactScope } from '../../runtime/react-id'
import { useMachine } from '../../runtime/use-machine'

export interface FieldArrayContext {
  api: FieldArrayApi
  service: Service<FieldArraySchema>
  /** 拖动换序的 sortable 机器：项是这个字段数组自己的行。 */
  drag: Service<SortableSchema>
  /** 表单重置的锚点，也是列表动效与拖动换序所在的行容器：接在根节点上。 */
  rootRef: RefObject<HTMLElement | null>
}

export function useFieldArray(props: FieldArraySchema['props'], form?: Service<FormSchema>): FieldArrayContext {
  // 删完、挪完由机器按把手的 id 捞回节点还焦点，那份 id 从 scope 派生
  const scope = useReactScope()
  const rootRef = useRef<HTMLElement | null>(null)
  const service = useMachine(fieldArrayMachine, () => props, { scope })
  service.refs.set('form', form ?? null)
  service.refs.set('getRootEl', () => rootRef.current)

  // 拖动换序：另一台机器跑 sortable，props 现取行 key 与换序开关，放下即发换位
  const dragScope = useReactScope()
  const drag = useMachine(sortableMachine, () => fieldArrayDragProps(service), { scope: dragScope })
  drag.refs.set('getRootEl', () => fieldArrayDragContainer(rootRef.current))
  drag.refs.set('getItemEls', () => fieldArrayDragItems(rootRef.current))

  // 整份数组攥在机器里，原生 reset 只还原原生控件——不接这条线，点重置什么都不会发生
  useFormReset(service, rootRef)

  return { api: connectFieldArray(service, reactNormalize, drag), service, drag, rootRef }
}
