import type { Service } from '@xihan-ui/core'
import type { FormApi, FormPath, FormSchema } from '@xihan-ui/headless'
import type { RefObject } from 'react'
import { connectForm, formMachine } from '@xihan-ui/headless'
import { useRef } from 'react'
import { reactNormalize } from '../../runtime/normalize-props'
import { useReactScope } from '../../runtime/react-id'
import { useMachine } from '../../runtime/use-machine'

type Props = FormSchema['props']

export interface FormCallbacks {
  onValuesChange?: Props['onValuesChange']
  onErrorsChange?: Props['onErrorsChange']
  onSubmit?: Props['onSubmit']
  onInvalid?: Props['onInvalid']
  onValidationError?: Props['onValidationError']
}

export interface FormContext {
  api: FormApi
  /** 机器实例，供部件上报 DOM 侧的事实。 */
  service: Service<FormSchema>
  /** `<form>` 节点，字段容器的查询范围与落焦起点。 */
  rootRef: RefObject<HTMLElement | null>
  setFieldValue: (name: FormPath, value: unknown) => void
  setFieldError: (name: FormPath, message?: string) => void
  clearErrors: () => void
  submit: () => void
  reset: () => void
}

export function useForm(props: Props, callbacks: FormCallbacks = {}): FormContext {
  const rootRef = useRef<HTMLElement | null>(null)
  const scope = useReactScope()

  const service = useMachine(formMachine, () => ({ ...props, ...callbacks }), {
    scope,
    // 传 getter 而非节点，提交落焦与跳字段时由机器现取。
    // 写在 onCreate 里：机器的挂载效应比组件自己的效应先跑，晚一步交出去就读不到
    onCreate: (svc: Service<FormSchema>) => {
      svc.refs.set('getRootEl', () => rootRef.current)
    },
  })

  const api = connectForm(service, reactNormalize)
  // 五个命令在顶层摊平，可解构后随时调用且不读取值表
  return {
    api,
    service,
    rootRef,
    setFieldValue: (name, value) => api.setFieldValue(name, value),
    setFieldError: (name, message) => api.setFieldError(name, message),
    clearErrors: () => api.clearErrors(),
    submit: () => api.submit(),
    reset: () => api.reset(),
  }
}
