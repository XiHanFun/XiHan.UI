import type { Service } from '@xihan-ui/core'
import type { SliderApi, SliderSchema } from '@xihan-ui/headless'
import type { RefObject } from 'react'
import { connectSlider, sliderMachine } from '@xihan-ui/headless'
import { useCallback, useRef } from 'react'
import { useFormReset } from '../../runtime/attach-form-reset'
import { reactNormalize } from '../../runtime/normalize-props'
import { useReactScope } from '../../runtime/react-id'
import { useMachine } from '../../runtime/use-machine'

export interface SliderContext {
  api: SliderApi
  service: Service<SliderSchema>
  /** 轨道节点，机器在指针事件里拿它量矩形。 */
  trackRef: RefObject<HTMLElement | null>
  /** 表单重置的锚点：接在根节点上。 */
  rootRef: RefObject<HTMLElement | null>
}

export function useSlider(props: SliderSchema['props']): SliderContext {
  const scope = useReactScope()
  const trackRef = useRef<HTMLElement | null>(null)
  const rootRef = useRef<HTMLElement | null>(null)

  // 机器的挂载效应会立刻读 refs，交在 onCreate 里才赶得上；传 getter 而非节点，ref 在挂载后才有值
  const onCreate = useCallback((service: Service<SliderSchema>) => {
    service.refs.set('getTrackEl', () => trackRef.current)
  }, [])

  const service = useMachine(sliderMachine, () => props, { scope, onCreate })

  // 值攥在机器里，原生 reset 只还原原生控件——不接这条线，点重置滑块停在原处
  useFormReset(service, rootRef)

  return { api: connectSlider(service, reactNormalize), service, trackRef, rootRef }
}
