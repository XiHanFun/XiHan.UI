import type { Service } from '@xihan-ui/core'
import type { LogApi, LogProps, LogSchema } from '@xihan-ui/headless'
import type { RefObject } from 'react'
import { createRuntimeConfig } from '@xihan-ui/core'
import { connectLog, logMachine } from '@xihan-ui/headless'
import { useEffect, useRef } from 'react'
import { reactNormalize } from '../../runtime/normalize-props'
import { useReactIdGenerator, useReactScope } from '../../runtime/react-id'
import { useMachine } from '../../runtime/use-machine'

export interface LogContext {
  service: Service<LogSchema>
  api: LogApi
  /** overflow:auto 的滚动容器节点。 */
  viewportRef: RefObject<HTMLElement | null>
  /** 内容包裹层节点，尺寸变化的观察目标。 */
  contentRef: RefObject<HTMLElement | null>
}

/** 机器只收 onStickChange，rows / loading / translations 是纯视图属性，直接进 connect。 */
export function useLog(
  props: LogProps,
  onStickChange?: LogSchema['props']['onStickChange'],
): LogContext {
  const idGenerator = useReactIdGenerator()
  const scope = useReactScope()
  const viewportRef = useRef<HTMLElement | null>(null)
  const contentRef = useRef<HTMLElement | null>(null)

  const service = useMachine(logMachine, () => ({ onStickChange }), {
    scope,
    // 粘底副作用在机器的挂载效应里建句柄，三处取值口得赶在那之前交出去
    onCreate: (svc: Service<LogSchema>) => {
      // 无 DOM 环境不装 config，此时粘底效应整套不挂载
      if (typeof document !== 'undefined')
        svc.refs.set('config', createRuntimeConfig({ scope, idGenerator }))
      svc.refs.set('getViewportEl', () => viewportRef.current)
      svc.refs.set('getContentEl', () => contentRef.current)
    },
  })

  // 不给依赖数组：每次提交后重读节点，换了就让句柄重绑
  const bound = useRef<[Element | null, Element | null]>([null, null])
  useEffect(() => {
    const next: [Element | null, Element | null] = [viewportRef.current, contentRef.current]
    if (next[0] === bound.current[0] && next[1] === bound.current[1])
      return
    bound.current = next
    service.refs.get('stick')?.retarget()
  })

  return { service, api: connectLog(service, props, reactNormalize), viewportRef, contentRef }
}
