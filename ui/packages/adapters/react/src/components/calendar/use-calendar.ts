import type { Service } from '@xihan-ui/core'
import type { CalendarApi, CalendarSchema } from '@xihan-ui/headless'
import type { RefObject } from 'react'
import { calendarMachine, connectCalendar } from '@xihan-ui/headless'
import { useRef } from 'react'
import { reactNormalize } from '../../runtime/normalize-props'
import { useReactScope } from '../../runtime/react-id'
import { useMachine } from '../../runtime/use-machine'

export interface CalendarContext {
  /** 机器实例，供部件上报 DOM 侧的事实。 */
  service: Service<CalendarSchema>
  api: CalendarApi
  /** 首个网格的节点：跨月重渲后机器按它现查焦点该落在哪一格。 */
  gridRef: RefObject<HTMLElement | null>
}

export function useCalendar(props: CalendarSchema['props']): CalendarContext {
  const scope = useReactScope()
  const gridRef = useRef<HTMLElement | null>(null)

  const service = useMachine(calendarMachine, () => props, {
    scope,
    // 机器的挂载效应会立刻读 refs，交在 onCreate 里才赶得上
    onCreate: (svc) => {
      svc.refs.set('getGridEl', () => gridRef.current)
    },
  })

  return { service, api: connectCalendar(service, reactNormalize), gridRef }
}
