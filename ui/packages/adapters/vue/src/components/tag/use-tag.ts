import type { TagApi, TagSchema } from '@xihan-ui/headless'
import type { ComputedRef } from 'vue'
import { connectStaticTag, connectTag, tagMachine } from '@xihan-ui/headless'
import { computed, ref } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'

export interface TagContext {
  api: ComputedRef<TagApi>
}

// 不建 scope：connect 不派生任何 id
export function useTag(
  props: TagSchema['props'],
  onOpenChange?: TagSchema['props']['onOpenChange'],
): TagContext {
  // 不给关闭钮的标签没有任何能改状态的事件，用不着机器：一台机器约 0.1ms，
  // 表格一页几十行、每行几个状态药丸就是几百台，翻页时肉眼可见地卡一下。
  // 判据取挂载那一刻的 closable——之后再打开也不要紧，快路的 setOpen 与关闭钮
  // 走的是同一套受控/非受控语义，与机器路逐条一致。
  if (!props.closable) {
    // 非受控时展开态住这儿；受控时它不参与，值每次从 prop 现读
    const local = ref(props.defaultOpen ?? true)
    const api = computed(() => connectStaticTag(
      { ...props, onOpenChange },
      {
        get: () => props.open ?? local.value,
        set: (next) => { local.value = next },
      },
      vueNormalize,
    ))
    return { api }
  }

  const service = useMachine(tagMachine, () => ({ ...props, onOpenChange }))
  const api = computed(() => connectTag(service, vueNormalize))
  return { api }
}
