import type { Service } from '@xihan-ui/core'
import type { ImageCropperApi, ImageCropperSchema } from '@xihan-ui/headless'
import type { RefObject } from 'react'
import { connectImageCropper, imageCropperMachine } from '@xihan-ui/headless'
import { useCallback, useRef } from 'react'
import { useFormReset } from '../../runtime/attach-form-reset'
import { reactNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'

export interface ImageCropperContext {
  service: Service<ImageCropperSchema>
  api: ImageCropperApi
  /** 视口节点，机器在指针事件里拿它量矩形。 */
  viewportRef: RefObject<HTMLElement | null>
  /** 表单重置的锚点：接在根节点上。 */
  rootRef: RefObject<HTMLElement | null>
}

// 不建 scope：connect 不派生任何 id
export function useImageCropper(props: ImageCropperSchema['props']): ImageCropperContext {
  const viewportRef = useRef<HTMLElement | null>(null)
  const rootRef = useRef<HTMLElement | null>(null)

  // 机器的挂载效应会立刻读 refs，交在 onCreate 里才赶得上；传 getter 而非节点，ref 在挂载后才有值
  const onCreate = useCallback((service: Service<ImageCropperSchema>) => {
    service.refs.set('getViewportEl', () => viewportRef.current)
  }, [])

  const service = useMachine(imageCropperMachine, () => props, { onCreate })

  // 裁切矩形攥在机器里，原生 reset 只还原原生控件——不接这条线，点重置裁切框留在原处
  useFormReset(service, rootRef)

  return { service, api: connectImageCropper(service, reactNormalize), viewportRef, rootRef }
}
