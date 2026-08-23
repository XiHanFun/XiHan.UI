import type { ToasterApi, ToasterSchema, ToastOptions } from '@xihan-ui/headless'
import type { ComputedRef, MaybeRefOrGetter } from 'vue'
import { connectToaster, toasterMachine } from '@xihan-ui/headless'
import { computed, toValue } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'

export interface ToasterContext {
  api: ComputedRef<ToasterApi>
  /** 入队并返回 id；同 id 已存在则就地改写，位置不动。 */
  create: (options?: ToastOptions) => string
  update: (id: string, options: Partial<ToastOptions>) => void
  dismiss: (id: string) => void
  dismissAll: () => void
}

/** props 收 ref/getter 时每帧现取，文案之类的量可以运行期换。 */
export function useToaster(
  props: MaybeRefOrGetter<ToasterSchema['props']>,
  onToastsChange?: ToasterSchema['props']['onToastsChange'],
): ToasterContext {
  const service = useMachine(toasterMachine, () => ({ ...toValue(props), onToastsChange }))
  const api = computed(() => connectToaster(service, vueNormalize))
  // 四个命令在顶层摊平，函数身份稳定，可解构后随时调用且不读取队列
  return {
    api,
    create: options => api.value.create(options),
    update: (id, options) => api.value.update(id, options),
    dismiss: id => api.value.dismiss(id),
    dismissAll: () => api.value.dismissAll(),
  }
}
