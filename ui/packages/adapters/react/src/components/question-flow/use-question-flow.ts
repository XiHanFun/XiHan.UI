import type { Service } from '@xihan-ui/core'
import type { QuestionFlowApi, QuestionFlowSchema } from '@xihan-ui/headless'
import type { RefObject } from 'react'
import { connectQuestionFlow, questionFlowMachine } from '@xihan-ui/headless'
import { useRef } from 'react'
import { reactNormalize } from '../../runtime/normalize-props'
import { useReactScope } from '../../runtime/react-id'
import { useMachine } from '../../runtime/use-machine'

type Props = QuestionFlowSchema['props']

export interface QuestionFlowContext {
  service: Service<QuestionFlowSchema>
  api: QuestionFlowApi
  /** 题目轨道：量当前题几何时的查询容器与参照系。 */
  trackRef: RefObject<HTMLElement | null>
}

export function useQuestionFlow(props: Props): QuestionFlowContext {
  const scope = useReactScope()
  const trackRef = useRef<HTMLElement | null>(null)

  const service = useMachine(questionFlowMachine, () => props, {
    scope,
    // 量测在机器的挂载效应里跑，DOM 侧的取值口得赶在那之前交出去
    onCreate: (svc: Service<QuestionFlowSchema>) => {
      svc.refs.set('getTrackEl', () => trackRef.current)
    },
  })

  return { service, api: connectQuestionFlow(service, reactNormalize), trackRef }
}
