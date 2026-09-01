import type { QuestionFlowApi, QuestionFlowSchema } from '@xihan-ui/headless'
import type { ComputedRef, Ref } from 'vue'
import { connectQuestionFlow, questionFlowMachine } from '@xihan-ui/headless'
import { createScope } from '@xihan-ui/kernel'
import { computed, ref } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'
import { createVueIdGenerator } from '../../runtime/vue-id'

type Props = QuestionFlowSchema['props']

export interface QuestionFlowCallbacks {
  onIndexChange?: Props['onIndexChange']
  onAnswersChange?: Props['onAnswersChange']
  onNotesChange?: Props['onNotesChange']
  onSkip?: Props['onSkip']
  onSubmit?: Props['onSubmit']
}

export interface QuestionFlowContext {
  api: ComputedRef<QuestionFlowApi>
  /** 题目轨道：量当前题几何时的查询容器与参照系。 */
  trackRef: Ref<HTMLElement | null>
}

export function useQuestionFlow(props: Props, callbacks: QuestionFlowCallbacks = {}): QuestionFlowContext {
  const idGen = createVueIdGenerator()
  const scope = createScope(null, idGen)
  const trackRef = ref<HTMLElement | null>(null)
  const service = useMachine(questionFlowMachine, () => ({ ...props, ...callbacks }), scope)

  // 量测在机器里跑，DOM 侧的取值口经 refs 交进去
  service.refs.set('getTrackEl', () => trackRef.value)

  const api = computed(() => connectQuestionFlow(service, vueNormalize))
  return { api, trackRef }
}
