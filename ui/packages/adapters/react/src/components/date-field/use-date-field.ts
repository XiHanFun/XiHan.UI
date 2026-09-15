/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 use date field 相关实现。

import type { Service } from '@xihan-ui/core'
import type { DateFieldApi, DateFieldSchema } from '@xihan-ui/headless'
import type { RefObject } from 'react'
import { connectDateField, dateFieldMachine } from '@xihan-ui/headless'
import { useRef } from 'react'
import { useFormReset } from '../../runtime/attach-form-reset'
import { reactNormalize } from '../../runtime/normalize-props'
import { useReactScope } from '../../runtime/react-id'
import { useMachine } from '../../runtime/use-machine'

export interface DateFieldContext {
  /** 状态机实例，供部件上报 DOM 侧的事实。 */
  service: Service<DateFieldSchema>
  api: DateFieldApi
  /** 表单重置的锚点：接在根节点上。 */
  rootRef: RefObject<HTMLElement | null>
}

export function useDateField(props: DateFieldSchema['props']): DateFieldContext {
  const scope = useReactScope()
  const rootRef = useRef<HTMLElement | null>(null)
  const service = useMachine(dateFieldMachine, () => props, { scope })

  // 值攥在机器里，原生 reset 只还原原生控件——不接这条线，点重置什么都不会发生
  useFormReset(service, rootRef)

  return { service, api: connectDateField(service, reactNormalize), rootRef }
}
