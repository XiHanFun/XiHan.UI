/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 use accordion 相关实现。

import type { RuntimeConfig, Service } from '@xihan-ui/core'
import type { AccordionApi, AccordionSchema } from '@xihan-ui/headless'
import { createRuntimeConfig } from '@xihan-ui/core'
import { accordionMachine, connectAccordion } from '@xihan-ui/headless'
import { useMemo } from 'react'
import { reactNormalize } from '../../runtime/normalize-props'
import { useReactIdGenerator, useReactScope } from '../../runtime/react-id'
import { useMachine } from '../../runtime/use-machine'

export interface AccordionContext {
  api: AccordionApi
  service: Service<AccordionSchema>
  /** 每个面板各自开退场闸门，共用这一份运行期配置；服务端为 null，闸门退化成跟着展开态。 */
  config: RuntimeConfig | null
}

export function useAccordion(props: AccordionSchema['props']): AccordionContext {
  const idGenerator = useReactIdGenerator()
  const scope = useReactScope()
  const service = useMachine(accordionMachine, () => props, { scope })

  const config = useMemo(
    () => (typeof document === 'undefined' ? null : createRuntimeConfig({ scope, idGenerator })),
    [scope, idGenerator],
  )

  return { api: connectAccordion(service, reactNormalize), service, config }
}
