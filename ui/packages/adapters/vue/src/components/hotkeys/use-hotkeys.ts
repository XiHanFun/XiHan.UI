import type {
  HotkeysApi,
  HotkeysPlatform,
  HotkeysProps,
  HotkeysResolvedPlatform,
} from '@xihan-ui/headless'
import type { ComputedRef } from 'vue'
import { connectHotkeys, detectHotkeysPlatform } from '@xihan-ui/headless'
import { computed, onBeforeUnmount, onMounted, ref, toValue, watchEffect } from 'vue'

export interface UseHotkeysOptions extends HotkeysProps {}

export interface HotkeysHandle {
  /** 连接层产出的纯行为面。 */
  api: ComputedRef<HotkeysApi>
  platform: ComputedRef<HotkeysResolvedPlatform>
  /** 提前解绑；作用域销毁时自动调用。 */
  stop: () => void
}

/**
 * 注册一组按键组合，不渲染任何键帽。展示请显式组合 XhKbdGroup。
 *
 * 一次调用管一组组合，注册四条就调四次：与组件形态一比一对齐，
 * 免得两种形态的 preventDefault / enabled / platform 语义各走各的。
 */
export function useHotkeys(
  options: UseHotkeysOptions | (() => UseHotkeysOptions),
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
    })
  })

  // 每次都现取 api：监听节点可以不变，接不接这次按键的判据却随选项走
  const onKeyDown = (event: Event): void => api.value.handleKeyDown(event as KeyboardEvent)
  let bound: EventTarget | null = null
  let stopped = false
  const stop = (): void => {
    stopped = true
    bound?.removeEventListener('keydown', onKeyDown)
    bound = null
  }

  watchEffect(() => {
    if (stopped)
      return
    const next = api.value.resolveTarget(typeof document === 'undefined' ? null : document)
    if (next === bound)
      return
    bound?.removeEventListener('keydown', onKeyDown)
    bound = next
    bound?.addEventListener('keydown', onKeyDown)
  })
  onBeforeUnmount(stop)

  return {
    api,
    platform: computed(() => api.value.platform),
    stop,
  }
}
