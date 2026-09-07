import type { Service } from '@xihan-ui/core'
import type { PasswordInputApi, PasswordInputSchema } from '@xihan-ui/headless'
import type { RefObject } from 'react'
import { connectPasswordInput, passwordInputMachine } from '@xihan-ui/headless'
import { useRef } from 'react'
import { useFormReset } from '../../runtime/attach-form-reset'
import { reactNormalize } from '../../runtime/normalize-props'
import { useReactScope } from '../../runtime/react-id'
import { useMachine } from '../../runtime/use-machine'

export interface PasswordInputContext {
  api: PasswordInputApi
  service: Service<PasswordInputSchema>
  /** 表单重置的锚点：接在根节点上。 */
  rootRef: RefObject<HTMLElement | null>
}

export function usePasswordInput(props: PasswordInputSchema['props']): PasswordInputContext {
  // 机器切换明暗后要按 id 把光标放回输入框，scope 必须是这一实例固定的那一个
  const scope = useReactScope()
  const rootRef = useRef<HTMLElement | null>(null)
  const service = useMachine(passwordInputMachine, () => props, { scope })

  // 值攥在机器里，原生 reset 只还原原生控件——不接这条线，点重置什么都不会发生
  useFormReset(service, rootRef)

  return { api: connectPasswordInput(service, reactNormalize), service, rootRef }
}
