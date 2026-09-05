import type { Service } from '@xihan-ui/core'
import type { ImageApi, ImageSchema } from '@xihan-ui/headless'
import type { ComputedRef } from 'vue'
import { connectImage, imageMachine } from '@xihan-ui/headless'
import { computed } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'

export interface ImageContext {
  service: Service<ImageSchema>
  api: ComputedRef<ImageApi>
}

export function useImage(
  props: ImageSchema['props'],
  onStatusChange?: ImageSchema['props']['onStatusChange'],
): ImageContext {
  const service = useMachine(imageMachine, () => ({ ...props, onStatusChange }))
  const api = computed(() => connectImage(service, vueNormalize))
  return { service, api }
}
