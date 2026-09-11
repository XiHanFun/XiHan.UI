import type { Service } from '@xihan-ui/core'
import type { TransferApi, TransferSchema } from '@xihan-ui/headless'
import type { RefObject } from 'react'
import { connectTransfer, transferMachine } from '@xihan-ui/headless'
import { useRef } from 'react'
import { useFormReset } from '../../runtime/attach-form-reset'
import { reactNormalize } from '../../runtime/normalize-props'
import { useReactScope } from '../../runtime/react-id'
import { useMachine } from '../../runtime/use-machine'

export interface TransferContext {
  api: TransferApi
  /** 机器实例，供部件上报 DOM 侧的事实（如条目卸载带走了焦点）。 */
  service: Service<TransferSchema>
  rootRef: RefObject<HTMLDivElement | null>
}

export function useTransfer(props: TransferSchema['props']): TransferContext {
  const scope = useReactScope()
  // 两侧集合全由 collection + value + 搜索串推导，适配器不必注入 refs
  const service = useMachine(transferMachine, () => props, { scope })
  const rootRef = useRef<HTMLDivElement | null>(null)
  useFormReset(service, rootRef)
  return { api: connectTransfer(service, reactNormalize), service, rootRef }
}
