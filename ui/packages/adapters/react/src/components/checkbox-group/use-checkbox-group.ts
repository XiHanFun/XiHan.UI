import type { Service } from '@xihan-ui/core'
import type { CheckboxGroupApi, CheckboxGroupSchema } from '@xihan-ui/headless'
import type { RefObject } from 'react'
import { checkboxGroupMachine, connectCheckboxGroup } from '@xihan-ui/headless'
import { useRef } from 'react'
import { useFormReset } from '../../runtime/attach-form-reset'
import { reactNormalize } from '../../runtime/normalize-props'
import { useReactScope } from '../../runtime/react-id'
import { useMachine } from '../../runtime/use-machine'

export interface CheckboxGroupContext {
  api: CheckboxGroupApi
  service: Service<CheckboxGroupSchema>
  /** 表单重置的锚点：接在根节点上。 */
  rootRef: RefObject<HTMLElement | null>
}

export function useCheckboxGroup(props: CheckboxGroupSchema['props']): CheckboxGroupContext {
  // connect 要按 scope 派生 label 与全选格的 id，同页多实例的 IDREF 才不相撞
  const scope = useReactScope()
  const rootRef = useRef<HTMLElement | null>(null)
  const service = useMachine(checkboxGroupMachine, () => props, { scope })

  // 选中集合攥在机器里，原生 reset 只还原原生控件——不接这条线，点重置什么都不会发生
  useFormReset(service, rootRef)

  return { api: connectCheckboxGroup(service, reactNormalize), service, rootRef }
}
