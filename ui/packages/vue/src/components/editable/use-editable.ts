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
  /** 部件要上报 DOM 侧的事实，得直接够到机器。 */
  service: Service<EditableSchema>
  /** 输入框节点：机器进编辑态后要把焦点搬进它。 */
  inputRef: Ref<HTMLElement | null>
  /** 预览区节点：退出编辑态后焦点还给它。 */
  previewRef: Ref<HTMLElement | null>
}

export function useEditable(props: Props, callbacks: EditableCallbacks = {}): EditableContext {
  const inputRef = ref<HTMLElement | null>(null)
  const previewRef = ref<HTMLElement | null>(null)

  const idGen = createVueIdGenerator()
  const scope = createScope(null, idGen)
  // 四个回调由组件外壳（emit）或组合式调用方提供，随 props 一并喂给机器
  const service = useMachine(editableMachine, () => ({ ...props, ...callbacks }), scope)

  // getter 而不是当下的节点：进出编辑态时机器现取，取到的才是这一帧真在 DOM 里的那个
  service.refs.set('getInputEl', () => inputRef.value)
  service.refs.set('getPreviewEl', () => previewRef.value)

  const api = computed(() => connectEditable(service, vueNormalize))
  return { api, service, inputRef, previewRef }
}
