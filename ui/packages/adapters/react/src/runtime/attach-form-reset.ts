import type { Disposable, MachineSchema, Service } from '@xihan-ui/core'
import type { RefObject } from 'react'
import { createFormResetBridge, declaresFormReset, FORM_RESET_EVENT } from '@xihan-ui/core'
import { useEffect } from 'react'

/**
 * 认表单重置的机器，挂一座桥把宿主表单的 reset 翻成机器事件。
 *
 * 锚点传 getter 不传节点：重渲会换掉它。
 */
export function useFormReset<T extends MachineSchema>(
  service: Service<T>,
  nodeRef: RefObject<Element | null>,
): void {
  const declares = declaresFormReset(service.machine)
  useEffect(() => {
    if (!declares)
      return
    let bridge: Disposable | null = createFormResetBridge({
      getNode: () => nodeRef.current,
      getFormId: () => service.prop('form') as string | undefined,
      onReset: () => {
        if (service.getStatus() === 'Started')
          service.send({ type: FORM_RESET_EVENT } as T['event'])
      },
    })
    return () => {
      bridge?.dispose()
      bridge = null
    }
  }, [declares, service, nodeRef])
}
