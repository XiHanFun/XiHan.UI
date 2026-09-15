/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 host 相关实现。

import type { ReactiveControllerHost } from '../reactive'
import { DIAGNOSTIC_CODES, ensurePortalRoot, reportDiagnostic } from '@xihan-ui/core'

/**
 * 命令式服务的宿主容器。未提供 target 时在浮层落点下新建一个，dispose 时连同容器一起移除。
 */
export function createServiceHolder(target?: HTMLElement): { holder: HTMLElement, release: () => void } {
  if (target)
    return { holder: target, release: () => {} }
  const holder = document.createElement('div')
  ensurePortalRoot(document).appendChild(holder)
  return { holder, release: () => holder.remove() }
}

/**
 * 供没有元素的状态机使用的最小反应宿主。
 *
 * 轻提示的堆叠在库中没有对应的自定义元素（堆叠位置是整个服务的口径，
 * 不是逐页各挂一份），因此队列状态机没有可依附的元素。状态机只要求宿主在状态变化时
 * 被唤醒一次，这里就只兑现这一件事：把重绘排进微任务，同一拍内的多次写入合并为一次。
 */
export function createServiceReactiveHost(render: () => void): ReactiveControllerHost {
  let scheduled = false
  let settle: (() => void) | null = null
  let pending: Promise<boolean> | null = null

  const flush = (): void => {
    scheduled = false
    const done = settle
    settle = null
    pending = null
    render()
    done?.()
  }

  return {
    addController: () => {},
    removeController: () => {},
    requestUpdate: () => {
      if (scheduled)
        return
      scheduled = true
      queueMicrotask(flush)
    },
    get updateComplete(): Promise<boolean> {
      if (!scheduled)
        return Promise.resolve(true)
      pending ??= new Promise<boolean>((resolve) => {
        settle = () => resolve(!scheduled)
      })
      return pending
    },
  }
}

/**
 * 服务无法建立时发一条诊断并返回 false，由调用方整体惰化。
 *
 * 这几个服务是从路由守卫、请求拦截器等位置懒建的：这些位置抛异常，
 * 后果不是提示未弹出而是整次导航失败、整站白屏。一条轻提示不应有这种权力。
 */
export function reportServiceFailure(service: string, error: unknown): false {
  reportDiagnostic({
    code: DIAGNOSTIC_CODES.warn,
    level: 'warn',
    message: `[xh] ${service} 的宿主没建起来，这个服务本次退化成空操作。`,
    detail: { service, error },
  })
  return false
}

/** 建一个带角色标记的节点：作者在声明式用法里手写的那一份，服务自己生成。 */
export function partNode<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  part: string,
): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag)
  el.dataset.xhPart = part
  return el
}
