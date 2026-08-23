import type {
  HotkeysApi,
  HotkeySegment,
  HotkeysPlatform,
  HotkeysProps,
  HotkeysResolvedPlatform,
  HotkeysTarget,
} from '@xihan-ui/headless'
import type { ComputedRef, Ref } from 'vue'
import { connectHotkeys, detectHotkeysPlatform } from '@xihan-ui/headless'
import { computed, onBeforeUnmount, onMounted, ref, toValue, watchEffect } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'

export interface UseHotkeysOptions extends Omit<HotkeysProps, 'target'> {
  /**
   * 监听装在哪儿。'document' 缺省；'parent' 把组合限制在组件所在的那一层面板里，
   * 需要第二参给出根节点；也可以自己给一个节点（滚动容器、window 等）。
   */
  target?: HotkeysTarget | (() => EventTarget | null)
}

export interface HotkeysHandle {
  /** 连接层产出的整面，渲染键帽时用。 */
  api: ComputedRef<HotkeysApi>
  /** 翻好的各枚键，自绘键帽时用。 */
  segments: ComputedRef<readonly HotkeySegment[]>
  platform: ComputedRef<HotkeysResolvedPlatform>
  separator: ComputedRef<string>
  /** 提前解绑；作用域销毁时自动调用。 */
  stop: () => void
}

/**
 * 注册一组按键组合。只要注册不要键帽的场景（全局快捷键）直接用它，
 * 要铺键帽就用 XhHotkeys——那个组件本身就是这个组合式的消费者。
 *
 * 一次调用管一组组合，注册四条就调四次：与组件形态一比一对齐，
 * 免得两种形态的 preventDefault / enabled / platform 语义各走各的。
 */
export function useHotkeys(
  options: UseHotkeysOptions | (() => UseHotkeysOptions),
  rootRef?: Ref<HTMLElement | null>,
): HotkeysHandle {
  // 平台要等挂载后才测得出来：落定前 'Mod' 会解析成 Control，Mac 上 ⌘K 按不出来
  const detected = ref<HotkeysPlatform>('auto')
  onMounted(() => {
    detected.value = detectHotkeysPlatform()
  })

  const api = computed(() => {
    const o = toValue(options)
    return connectHotkeys({
      ...o,
      // 作者显式写了平台就以他为准，写 auto 或没写才用实测值
      platform: o.platform && o.platform !== 'auto' ? o.platform : detected.value,
      // 自定义节点由本组合式自己挑，连接层只认那两种字面量
      target: typeof o.target === 'function' ? undefined : o.target,
    }, vueNormalize)
  })

  // 每次都现取 api：监听节点可以不变，接不接这次按键的判据却随选项走
  const onKeyDown = (event: Event): void => api.value.handleKeyDown(event as KeyboardEvent)
  let bound: EventTarget | null = null
  const stop = (): void => {
    bound?.removeEventListener('keydown', onKeyDown)
    bound = null
  }

  watchEffect(() => {
    const custom = toValue(options).target
    if (typeof custom === 'function') {
      const next = custom()
      if (next === bound)
        return
      stop()
      bound = next
      bound?.addEventListener('keydown', onKeyDown)
      return
    }
    const el = rootRef?.value ?? null
    const next = el === null
      ? (typeof document === 'undefined' ? null : document)
      : (api.value.target === 'parent' ? el.parentElement : el.ownerDocument)
    if (next === bound)
      return
    stop()
    bound = next
    bound?.addEventListener('keydown', onKeyDown)
  })
  onBeforeUnmount(stop)

  return {
    api,
    segments: computed(() => api.value.segments),
    platform: computed(() => api.value.platform),
    separator: computed(() => api.value.separator),
    stop,
  }
}
