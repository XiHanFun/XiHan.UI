import type { Service } from '@xihan-ui/core'
import type { AffixApi, AffixSchema } from '@xihan-ui/headless'
import type { RefObject } from 'react'
import { affixMachine, connectAffix } from '@xihan-ui/headless'
import { useCallback, useRef } from 'react'
import { reactNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'

export interface AffixContext {
  api: AffixApi
  service: Service<AffixSchema>
  /** 占位盒节点：判定线与占位尺寸都量它。 */
  rootRef: RefObject<HTMLElement | null>
}

/** getTargetEl 返回滚动容器，null 即整页滚动；量测与监听都在机器的效应里跑，DOM 取值口经 refs 交进去。 */
export function useAffix(
  props: AffixSchema['props'],
  getTargetEl: () => HTMLElement | null = () => null,
): AffixContext {
  const rootRef = useRef<HTMLElement | null>(null)

  // 取值器每帧换、接线只建一次：拿 ref 转一道，别让它成为重建的理由
  const targetEl = useRef(getTargetEl)
  targetEl.current = getTargetEl

  // 观察器与量测都在机器的挂载效应里跑，DOM 侧的取值口要赶在那之前交出去
  const onCreate = useCallback((service: Service<AffixSchema>) => {
    service.refs.set('getRootEl', () => rootRef.current)
    service.refs.set('getTargetEl', () => targetEl.current())
  }, [])

  const service = useMachine(affixMachine, () => props, { onCreate })
  return { api: connectAffix(service, reactNormalize), service, rootRef }
}
