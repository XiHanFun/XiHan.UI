import type { EditableApi, EditableSchema } from '@xihan-ui/headless'
import type { Service } from '@xihan-ui/machine'
import type { ComputedRef, Ref } from 'vue'
import { createScope } from '@xihan-ui/core'
import { connectEditable, editableMachine } from '@xihan-ui/headless'
import { computed, ref } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'
import { createVueIdGenerator } from '../../runtime/vue-id'

type Props = EditableSchema['props']

export interface EditableCallbacks {
  onValueChange?: Props['onValueChange']
  onValueCommit?: Props['onValueCommit']
  onValueRevert?: Props['onValueRevert']
  onEditChange?: Props['onEditChange']
}

export interface EditableContext {
  api: ComputedRef<EditableApi>
  /** 机器实例，供部件上报 DOM 侧的事实。 */
  service: Service<EditableSchema>
  /** 输入框节点，进编辑态后焦点搬进它。 */
  inputRef: Ref<HTMLElement | null>
  /** 预览区节点，退出编辑态后焦点还给它。 */
  previewRef: Ref<HTMLElement | null>
}

export function useEditable(props: Props, callbacks: EditableCallbacks = {}): EditableContext {
  const inputRef = ref<HTMLElement | null>(null)
  const previewRef = ref<HTMLElement | null>(null)

  const idGen = createVueIdGenerator()
  const scope = createScope(null, idGen)
  const service = useMachine(editableMachine, () => ({ ...props, ...callbacks }), scope)

  // 传 getter 而非节点，进出编辑态时由机器现取
  service.refs.set('getInputEl', () => inputRef.value)
  service.refs.set('getPreviewEl', () => previewRef.value)

  const api = computed(() => connectEditable(service, vueNormalize))
  return { api, service, inputRef, previewRef }
}
