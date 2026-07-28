import type { FormApi, FormSchema } from '@xihan-ui/headless'
import type { Service } from '@xihan-ui/machine'
import type { ComputedRef, Ref } from 'vue'
import { createScope } from '@xihan-ui/core'
import { connectForm, formMachine } from '@xihan-ui/headless'
import { computed, ref } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'
import { createVueIdGenerator } from '../../runtime/vue-id'

type Props = FormSchema['props']

export interface FormCallbacks {
  onValuesChange?: Props['onValuesChange']
  onErrorsChange?: Props['onErrorsChange']
  onSubmit?: Props['onSubmit']
  onInvalid?: Props['onInvalid']
}

export interface FormContext {
  api: ComputedRef<FormApi>
  /** 部件要上报 DOM 侧的事实，得直接够到机器。 */
  service: Service<FormSchema>
  /** 那个 `<form>` 节点：字段容器的现查范围与落焦的起点。 */
  rootRef: Ref<HTMLElement | null>
  setFieldValue: (name: string, value: unknown) => void
  setFieldError: (name: string, message?: string) => void
  clearErrors: () => void
  submit: () => void
  reset: () => void
}

export function useForm(props: Props, callbacks: FormCallbacks = {}): FormContext {
  const rootRef = ref<HTMLElement | null>(null)

  const idGen = createVueIdGenerator()
  const scope = createScope(null, idGen)
  // 四个回调由组件外壳（emit）或组合式调用方提供，随 props 一并喂给机器
  const service = useMachine(formMachine, () => ({ ...props, ...callbacks }), scope)

  // getter 而不是当下的节点：提交失败落焦、点摘要跳字段都是事件那一刻现取，
  // 取到的才是这一帧真在 DOM 里的那个表单
  service.refs.set('getRootEl', () => rootRef.value)

  const api = computed(() => connectForm(service, vueNormalize))
  // 五个命令在顶层再摊一层：函数身份稳定，作者可以在 setup 里解构出来存进模块作用域、
  // 在任意时刻（请求回调、路由守卫）调用。让调用方自己写 api.value.submit 的话，
  // 每个调用点都会顺手把整张值表读成响应式依赖，改一个字段就重跑一遍
  return {
    api,
    service,
    rootRef,
    setFieldValue: (name, value) => api.value.setFieldValue(name, value),
    setFieldError: (name, message) => api.value.setFieldError(name, message),
    clearErrors: () => api.value.clearErrors(),
    submit: () => api.value.submit(),
    reset: () => api.value.reset(),
  }
}
