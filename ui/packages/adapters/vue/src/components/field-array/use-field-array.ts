/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 use field array 相关实现。

import type { Service } from '@xihan-ui/core'
import type { FieldArrayApi, FieldArraySchema, FormSchema, SortableSchema } from '@xihan-ui/headless'
import type { ComputedRef, Ref } from 'vue'
import { createScope } from '@xihan-ui/core'
import { connectFieldArray, fieldArrayDragContainer, fieldArrayDragItems, fieldArrayDragProps, fieldArrayMachine, sortableMachine } from '@xihan-ui/headless'
import { computed, ref } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'
import { createVueIdGenerator } from '../../runtime/vue-id'

export interface FieldArrayContext {
  api: ComputedRef<FieldArrayApi>
  service: Service<FieldArraySchema>
  /** 拖动换序的 sortable 机器：项是这个字段数组自己的行。 */
  drag: Service<SortableSchema>
  /** 行所在的根节点：列表动效与拖动换序都接在它上面。 */
  rootRef: Ref<HTMLElement | null>
}

export function useFieldArray(
  props: FieldArraySchema['props'],
  handlers: Pick<FieldArraySchema['props'], 'onValueChange'> = {},
  form?: Service<FormSchema> | null,
): FieldArrayContext {
  // scope id 走 Vue 的 useId，保证同页多实例的 IDREF 不相撞
  const idGen = createVueIdGenerator()
  const scope = createScope(null, idGen)
  const service = useMachine(fieldArrayMachine, () => ({ ...props, ...handlers }), scope)
  service.refs.set('form', form ?? null)
  const rootRef = ref<HTMLElement | null>(null)
  // 传 getter 而非节点本身，ref 在挂载后才有值
  service.refs.set('getRootEl', () => rootRef.value)
  // 拖动换序：另一台机器跑 sortable，props 现取行 key 与换序开关，放下即发换位
  const drag = useMachine(sortableMachine, () => fieldArrayDragProps(service), createScope(null, createVueIdGenerator()))
  drag.refs.set('getRootEl', () => fieldArrayDragContainer(rootRef.value))
  drag.refs.set('getItemEls', () => fieldArrayDragItems(rootRef.value))
  const api = computed(() => connectFieldArray(service, vueNormalize, drag))
  return { api, service, drag, rootRef }
}
