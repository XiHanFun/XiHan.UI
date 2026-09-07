import type { Service } from '@xihan-ui/core'
import type { SegmentedApi, SegmentedSchema } from '@xihan-ui/headless'
import type { RefObject } from 'react'
import { connectSegmented, segmentedMachine } from '@xihan-ui/headless'
import { useRef } from 'react'
import { useFormReset } from '../../runtime/attach-form-reset'
import { reactNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'

export interface SegmentedContext {
  api: SegmentedApi
  /** 机器实例，供部件上报 DOM 侧的事实（如条目卸载带走了焦点）。 */
  service: Service<SegmentedSchema>
  /** root 节点：条目集合的查询容器，同时是指示器量测的参照系，也是表单重置的锚点。 */
  rootRef: RefObject<HTMLElement | null>
}

// 不建 scope：connect 不派生任何 id
export function useSegmented(props: SegmentedSchema['props']): SegmentedContext {
  const rootRef = useRef<HTMLElement | null>(null)

  const service = useMachine(segmentedMachine, () => props, {
    // 指示器的量测在机器的挂载效应里跑，DOM 侧的取值口要赶在那之前交出去
    onCreate: (svc: Service<SegmentedSchema>) => {
      svc.refs.set('getRootEl', () => rootRef.current)
    },
  })

  // 值攥在机器里，原生 reset 只还原原生控件——不接这条线，点重置什么都不会发生
  useFormReset(service, rootRef)

  return { api: connectSegmented(service, reactNormalize), service, rootRef }
}
