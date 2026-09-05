import type { Service } from '@xihan-ui/core'
import type { FormApi, FormSchema } from '@xihan-ui/headless'
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
  /** 机器实例，供部件上报 DOM 侧的事实。 */
  service: Service<FormSchema>
  /** `<form>` 节点，字段容器的查询范围与落焦起点。 */
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
  const service = useMachine(formMachine, () => ({ ...props, ...callbacks }), scope)

  // 传 getter 而非节点，提交落焦与跳字段时由机器现取
  service.refs.set('getRootEl', () => rootRef.value)

  const api = computed(() => connectForm(service, vueNormalize))
  // 五个命令在顶层摊平，函数身份稳定，可解构后随时调用且不读取值表
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
