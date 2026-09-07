import type { Service } from '@xihan-ui/core'
import type { TimeFieldApi, TimeFieldSchema } from '@xihan-ui/headless'
import type { RefObject } from 'react'
import { connectTimeField, timeFieldMachine } from '@xihan-ui/headless'
import { useRef } from 'react'
import { useFormReset } from '../../runtime/attach-form-reset'
import { reactNormalize } from '../../runtime/normalize-props'
import { useReactScope } from '../../runtime/react-id'
import { useMachine } from '../../runtime/use-machine'

export interface TimeFieldContext {
  /** 机器实例，供部件上报 DOM 侧的事实。 */
  service: Service<TimeFieldSchema>
  api: TimeFieldApi
  /** 表单重置的锚点：接在根节点上。 */
  rootRef: RefObject<HTMLElement | null>
}

export function useTimeField(props: TimeFieldSchema['props']): TimeFieldContext {
  const scope = useReactScope()
  const rootRef = useRef<HTMLElement | null>(null)
  const service = useMachine(timeFieldMachine, () => props, { scope })

  // 值攥在机器里，原生 reset 只还原原生控件——不接这条线，点重置什么都不会发生
  useFormReset(service, rootRef)

  return { service, api: connectTimeField(service, reactNormalize), rootRef }
}
