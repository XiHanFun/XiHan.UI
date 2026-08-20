import type { SignaturePadApi, SignaturePadSchema } from '@xihan-ui/headless'
import type { Service } from '@xihan-ui/machine'
import type { ComputedRef, Ref } from 'vue'
import { connectSignaturePad, signaturePadMachine } from '@xihan-ui/headless'
import { createScope } from '@xihan-ui/kernel'
import { computed, ref } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'
import { createVueIdGenerator } from '../../runtime/vue-id'

export interface SignaturePadContext {
  api: ComputedRef<SignaturePadApi>
  service: Service<SignaturePadSchema>
  /** 画布节点，机器在指针事件里拿它把屏幕坐标换算成画布坐标。 */
  controlRef: Ref<Element | null>
}

export function useSignaturePad(
  props: SignaturePadSchema['props'],
  callbacks: Pick<SignaturePadSchema['props'], 'onDraw' | 'onDrawEnd'> = {},
): SignaturePadContext {
  const controlRef = ref<Element | null>(null)

  // scope id 走 Vue 的 useId，保证同页多实例的 IDREF 不相撞
  const idGen = createVueIdGenerator()
  const scope = createScope(null, idGen)
  const service = useMachine(signaturePadMachine, () => ({ ...props, ...callbacks }), scope)

  // 传 getter 而非节点，ref 在挂载后才有值
  service.refs.set('getControlEl', () => controlRef.value)

  const api = computed(() => connectSignaturePad(service, vueNormalize))
  return { api, service, controlRef }
}
