import type { Service } from '@xihan-ui/core'
import type { ToggleGroupApi, ToggleGroupSchema } from '@xihan-ui/headless'
import type { RefObject } from 'react'
import { connectToggleGroup, toggleGroupMachine } from '@xihan-ui/headless'
import { useRef } from 'react'
import { useFormReset } from '../../runtime/attach-form-reset'
import { reactNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'

export interface ToggleGroupContext {
  api: ToggleGroupApi
  /** 机器实例，供条目上报 DOM 侧的事实（卸载带走了焦点）。 */
  service: Service<ToggleGroupSchema>
  /** 表单重置的锚点：接在根节点上。 */
  rootRef: RefObject<HTMLElement | null>
}

// 不建 scope：connect 不派生任何 id
export function useToggleGroup(props: ToggleGroupSchema['props']): ToggleGroupContext {
  const rootRef = useRef<HTMLElement | null>(null)
  const service = useMachine(toggleGroupMachine, () => props)

  // 选中值攥在机器里，原生 reset 只还原原生控件——不接这条线，点重置什么都不会发生
  useFormReset(service, rootRef)

  return { api: connectToggleGroup(service, reactNormalize), service, rootRef }
}
