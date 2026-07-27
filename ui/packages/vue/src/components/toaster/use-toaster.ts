import type { ToasterApi, ToasterSchema, ToastOptions } from '@xihan-ui/headless'
import type { ComputedRef } from 'vue'
import { connectToaster, toasterMachine } from '@xihan-ui/headless'
import { computed } from 'vue'
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

export function useToaster(
  props: ToasterSchema['props'],
  onToastsChange?: ToasterSchema['props']['onToastsChange'],
): ToasterContext {
  const service = useMachine(toasterMachine, () => ({ ...props, onToastsChange }))
  const api = computed(() => connectToaster(service, vueNormalize))
  // 四个命令在顶层再摊一层：函数身份稳定，作者可以在 setup 里解构出来存进模块作用域、
  // 在任意时刻（请求回调、路由守卫）调用。让调用方自己写 api.value.create 的话，
  // 每个调用点都会顺手把整份队列读成响应式依赖，改一条就重跑一遍。
  return {
    api,
    create: options => api.value.create(options),
    update: (id, options) => api.value.update(id, options),
    dismiss: id => api.value.dismiss(id),
    dismissAll: () => api.value.dismissAll(),
  }
}
