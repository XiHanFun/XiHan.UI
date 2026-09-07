import type { Service } from '@xihan-ui/core'
import type { RatingApi, RatingSchema } from '@xihan-ui/headless'
import { connectRating, ratingMachine } from '@xihan-ui/headless'
import { reactNormalize } from '../../runtime/normalize-props'
import { useReactScope } from '../../runtime/react-id'
import { useMachine } from '../../runtime/use-machine'

export interface RatingContext {
  api: RatingApi
  /** 机器实例，供部件上报 DOM 侧的事实（如条目卸载带走了焦点）。 */
  service: Service<RatingSchema>
}

export function useRating(props: RatingSchema['props']): RatingContext {
  const scope = useReactScope()
  const service = useMachine(ratingMachine, () => props, { scope })
  return { api: connectRating(service, reactNormalize), service }
}
