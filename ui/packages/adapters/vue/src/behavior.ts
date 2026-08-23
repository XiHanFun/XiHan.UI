// @xihan-ui/vue/behavior —— 行为原语的 Vue 包装。
//
// @xihan-ui/behavior 里的原语都是框架无关的：收一份配置与几个元素 getter，
// 返回一个要自己释放的句柄。接进 Vue 无非是把释放挂到作用域结束，
// 于是这些包装只做那一件事，不改原语的语义、也不加新概念。
//
// 与主入口分开：自建浮层才用得上这一层，不用的应用不必把它压进主入口的体积。
// 需要层栈仪式的那几个（消解层、焦点域、背景失活）不在这里——
// 它们要按顺序接四五个东西，接错的表现是「点子菜单父层跟着关」这种不报错的怪症，
// 那种场景请直接用库里现成的浮层组件。
import type {
  HoverIntentOptions,
  ScrollMetrics,
  ScrollTrackerOptions,
  StickToBottomOptions,
  StickToBottomState,
  Typeahead,
  TypeaheadOptions,
} from '@xihan-ui/behavior'
import type { RuntimeConfig } from '@xihan-ui/kernel'
import type { MaybeRefOrGetter, Ref } from 'vue'
import {
  acquireScrollLock,
  createScrollTracker,
  createStickToBottom,
  createTypeahead,
  trackHoverIntent,
} from '@xihan-ui/behavior'
import { onScopeDispose, ref, toValue, watch } from 'vue'

/**
 * 按需加解滚动锁。锁是引用计数的，多处同时锁不会互相踩。
 *
 * 锁哪个元素由 `config.scrollRoot?.()` 决定；宿主把滚动搬进了内容容器
 * （body 自己不滚）时必须在配置里注入，否则锁到的是不滚的那个。
 */
export function useScrollLock(
  active: MaybeRefOrGetter<boolean>,
  config: MaybeRefOrGetter<RuntimeConfig>,
): void {
  let handle: { dispose: () => void } | null = null
  const release = () => {
    handle?.dispose()
    handle = null
  }
  watch(
    () => toValue(active),
    (on) => {
      if (on && !handle)
        handle = acquireScrollLock({ config: toValue(config) })
      else if (!on)
        release()
    },
    { immediate: true },
  )
  onScopeDispose(release)
}

/**
 * 悬停意图：进触发器停够时长才报开，离开时按安全三角判断是不是正朝浮层去。
 * 用于自建的悬停浮层，省掉「斜着划向子菜单半路就关了」那类手写延时。
 */
export function useHoverIntent(options: HoverIntentOptions): void {
  const stop = trackHoverIntent(options)
  onScopeDispose(stop)
}

/** 观察滚动容器的位置与尺寸，值变了才回调。返回最近一次量到的值。 */
export function useScrollTracker(options: ScrollTrackerOptions): Ref<ScrollMetrics | null> {
  const metrics = ref<ScrollMetrics | null>(null)
  const handle = createScrollTracker({
    ...options,
    onChange: (next) => {
      metrics.value = next
      options.onChange?.(next)
    },
  })
  onScopeDispose(() => handle.dispose())
  return metrics
}

/** 内容增长时保持贴底，用户往上滚过就松手不再跟。返回当前的贴底状态。 */
export function useStickToBottom(options: StickToBottomOptions): Ref<StickToBottomState | null> {
  const state = ref<StickToBottomState | null>(null)
  const handle = createStickToBottom({
    ...options,
    onChange: (next) => {
      state.value = next
      options.onChange?.(next)
    },
  })
  onScopeDispose(() => handle.dispose())
  return state
}

/** 连续敲字母跳到匹配项的缓冲，超时自动清空。 */
export function useTypeahead(options: TypeaheadOptions = {}): Typeahead {
  const typeahead = createTypeahead(options)
  onScopeDispose(() => typeahead.clear())
  return typeahead
}
