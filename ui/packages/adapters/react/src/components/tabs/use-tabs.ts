import type { Service } from '@xihan-ui/core'
import type { TabsApi, TabsSchema } from '@xihan-ui/headless'
import type { RefObject } from 'react'
import { connectTabs, tabsMachine } from '@xihan-ui/headless'
import { useRef } from 'react'
import { reactNormalize } from '../../runtime/normalize-props'
import { useReactScope } from '../../runtime/react-id'
import { useMachine } from '../../runtime/use-machine'

export interface TabsContext {
  api: TabsApi
  /** 机器实例，供部件上报 DOM 侧的事实（如条目卸载带走了焦点）。 */
  service: Service<TabsSchema>
  /** list 节点：标签集合的查询容器，同时是指示条量测的参照系。 */
  listRef: RefObject<HTMLElement | null>
}

export function useTabs(props: TabsSchema['props']): TabsContext {
  const scope = useReactScope()
  const listRef = useRef<HTMLElement | null>(null)

  const service = useMachine(tabsMachine, () => props, {
    scope,
    // 指示条量测在机器的挂载效应里跑，DOM 侧的取值口要赶在那之前交出去
    onCreate: (svc: Service<TabsSchema>) => {
      svc.refs.set('getListEl', () => listRef.current)
    },
  })

  return { api: connectTabs(service, reactNormalize), service, listRef }
}
