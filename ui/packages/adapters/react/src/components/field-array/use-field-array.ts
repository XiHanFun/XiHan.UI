import type { Service } from '@xihan-ui/core'
import type { FieldArrayApi, FieldArraySchema } from '@xihan-ui/headless'
import type { RefObject } from 'react'
import { connectFieldArray, fieldArrayMachine } from '@xihan-ui/headless'
import { useRef } from 'react'
import { useFormReset } from '../../runtime/attach-form-reset'
import { reactNormalize } from '../../runtime/normalize-props'
import { useReactScope } from '../../runtime/react-id'
import { useMachine } from '../../runtime/use-machine'

export interface FieldArrayContext {
  api: FieldArrayApi
  service: Service<FieldArraySchema>
  /** 表单重置的锚点：接在根节点上。 */
  rootRef: RefObject<HTMLElement | null>
}

export function useFieldArray(props: FieldArraySchema['props']): FieldArrayContext {
  // 删完、挪完由机器按把手的 id 捞回节点还焦点，那份 id 从 scope 派生
  const scope = useReactScope()
  const rootRef = useRef<HTMLElement | null>(null)
  const service = useMachine(fieldArrayMachine, () => props, { scope })

  // 整份数组攥在机器里，原生 reset 只还原原生控件——不接这条线，点重置什么都不会发生
  useFormReset(service, rootRef)

  return { api: connectFieldArray(service, reactNormalize), service, rootRef }
}
