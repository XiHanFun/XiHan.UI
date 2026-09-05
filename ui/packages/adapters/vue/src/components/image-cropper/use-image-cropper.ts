import type { Service } from '@xihan-ui/core'
import type { ImageCropperApi, ImageCropperSchema } from '@xihan-ui/headless'
import type { ComputedRef, Ref } from 'vue'
import { connectImageCropper, imageCropperMachine } from '@xihan-ui/headless'
import { computed, ref } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'

export interface ImageCropperContext {
  api: ComputedRef<ImageCropperApi>
  service: Service<ImageCropperSchema>
  /** 视口节点，机器在指针事件里拿它量矩形。 */
  viewportRef: Ref<HTMLElement | null>
}

type Handlers = Pick<ImageCropperSchema['props'], 'onValueChange' | 'onValueChangeEnd' | 'onZoomChange'>

// 不建 scope：connect 不派生任何 id
export function useImageCropper(
  props: ImageCropperSchema['props'],
  handlers: Handlers = {},
): ImageCropperContext {
  const viewportRef = ref<HTMLElement | null>(null)
  const service = useMachine(imageCropperMachine, () => ({ ...props, ...handlers }))

  // 传 getter 而非节点，ref 在挂载后才有值
  service.refs.set('getViewportEl', () => viewportRef.value)

  const api = computed(() => connectImageCropper(service, vueNormalize))
  return { api, service, viewportRef }
}
