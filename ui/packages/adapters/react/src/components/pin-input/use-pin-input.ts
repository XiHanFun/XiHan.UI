import type { Service } from '@xihan-ui/core'
import type { PinInputApi, PinInputSchema } from '@xihan-ui/headless'
import type { RefObject } from 'react'
import { connectPinInput, pinInputMachine } from '@xihan-ui/headless'
import { useRef } from 'react'
import { useFormReset } from '../../runtime/attach-form-reset'
import { reactNormalize } from '../../runtime/normalize-props'
import { useReactScope } from '../../runtime/react-id'
import { useMachine } from '../../runtime/use-machine'

export interface PinInputContext {
  api: PinInputApi
  service: Service<PinInputSchema>
  /** 表单重置的锚点：接在根节点上。 */
  rootRef: RefObject<HTMLElement | null>
}

export function usePinInput(props: PinInputSchema['props']): PinInputContext {
  // 每格的 id 由 scope 逐下标派生，label 的 for 指向首格，同页多实例才不相撞
  const scope = useReactScope()
  const rootRef = useRef<HTMLElement | null>(null)
  const service = useMachine(pinInputMachine, () => props, { scope })

  // 值攥在机器里，原生 reset 只还原原生控件——不接这条线，点重置什么都不会发生
  useFormReset(service, rootRef)

  return { api: connectPinInput(service, reactNormalize), service, rootRef }
}
