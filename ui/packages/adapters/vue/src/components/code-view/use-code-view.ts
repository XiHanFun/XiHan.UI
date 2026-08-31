import type { CodeViewApi, CodeViewProps } from '@xihan-ui/headless'
import type { ComputedRef, Ref } from 'vue'
import { connectCodeView } from '@xihan-ui/headless'
import { createScope } from '@xihan-ui/kernel'
import { computed, ref } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'
import { createVueIdGenerator } from '../../runtime/vue-id'

export interface CodeViewContext {
  api: ComputedRef<CodeViewApi>
  /**
   * 作者渲出来的 filename 部件份数，由 XhCodeViewFilename 自己登记。
   * pre 的可访问名据此决定指过去还是用文案兜底——看 filename 这个 prop 有没有值是不够的，
   * 传了值却没写节点时 aria-labelledby 会指向一个不存在的 id。
   */
  filenameCount: Ref<number>
}

// 无状态机，只用一份实例级 scope 派生 part id，props 变了由 computed 重算属性
export function useCodeView(props: CodeViewProps): CodeViewContext {
  const scope = createScope(null, createVueIdGenerator())
  const filenameCount = ref(0)
  const api = computed(() => connectCodeView({
    ...props,
    labelled: filenameCount.value > 0,
  }, scope, vueNormalize))
  return { api, filenameCount }
}
