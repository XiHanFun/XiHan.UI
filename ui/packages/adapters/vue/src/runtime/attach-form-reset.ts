/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 attach form reset 相关实现。

import type { Disposable, MachineSchema, Service } from '@xihan-ui/core'
import { createFormResetBridge, declaresFormReset, FORM_RESET_EVENT } from '@xihan-ui/core'
import { getCurrentInstance, onBeforeUnmount, onMounted } from 'vue'

/**
 * 识别表单重置的状态机，架设一座桥把宿主表单的 reset 转换为状态机事件。
 *
 * 锚点取组件自己渲染出的根元素，传 getter 而不是节点：重渲会替换它。
 * 组合式函数在组件外使用时既没有挂载钩子也没有节点，整段让位。
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
      getFormId: () => service.prop('form') as string | undefined,
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
