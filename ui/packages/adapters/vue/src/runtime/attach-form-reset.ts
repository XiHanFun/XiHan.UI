import type { Disposable } from '@xihan-ui/kernel'
import type { MachineSchema, Service } from '@xihan-ui/machine'
import { createFormResetBridge } from '@xihan-ui/behavior'
import { declaresFormReset, FORM_RESET_EVENT } from '@xihan-ui/machine'
import { getCurrentInstance, onBeforeUnmount, onMounted } from 'vue'

/**
 * 认表单重置的机器，挂一座桥把宿主表单的 reset 翻成机器事件。
 *
 * 锚点取组件自己渲染出的根元素，传 getter 不传节点：重渲会换掉它。
 * 组合式函数被拿到组件外用时既没有挂载钩子也没有节点，整段让位。
 */
export function attachFormReset<T extends MachineSchema>(service: Service<T>): void {
  const instance = getCurrentInstance()
  if (!instance || !declaresFormReset(service.machine))
    return

  let bridge: Disposable | null = null
  // 注册在 createService 那次 onMounted 之后，因此跑在它之后，status 已经是 Started
  onMounted(() => {
    bridge = createFormResetBridge({
      getNode: () => instance.vnode.el as Node | null,
      onReset: () => {
        if (service.getStatus() === 'Started')
          service.send({ type: FORM_RESET_EVENT } as T['event'])
      },
    })
  })
  onBeforeUnmount(() => {
    bridge?.dispose()
    bridge = null
  })
}
