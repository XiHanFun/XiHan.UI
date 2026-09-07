import type { Service } from '@xihan-ui/core'
import type { NumberFieldApi, NumberFieldSchema } from '@xihan-ui/headless'
import type { RefObject } from 'react'
import { connectNumberField, numberFieldMachine } from '@xihan-ui/headless'
import { useRef } from 'react'
import { useFormReset } from '../../runtime/attach-form-reset'
import { reactNormalize } from '../../runtime/normalize-props'
import { useReactScope } from '../../runtime/react-id'
import { useMachine } from '../../runtime/use-machine'

export interface NumberFieldContext {
  api: NumberFieldApi
  service: Service<NumberFieldSchema>
  /** 表单重置的锚点：接在根节点上。 */
  rootRef: RefObject<HTMLElement | null>
}

export function useNumberField(props: NumberFieldSchema['props']): NumberFieldContext {
  // connect 按 scope 派生 label 与 input 的 id，同页多实例的 IDREF 才不相撞
  const scope = useReactScope()
  const rootRef = useRef<HTMLElement | null>(null)
  const service = useMachine(numberFieldMachine, () => props, { scope })

  // 值攥在机器里，原生 reset 只还原原生控件——不接这条线，点重置什么都不会发生
  useFormReset(service, rootRef)

  return { api: connectNumberField(service, reactNormalize), service, rootRef }
}
