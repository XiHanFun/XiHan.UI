/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// @xihan-ui/vue/behavior —— 行为原语的 Vue 包装。
//
// @xihan-ui/core 里的原语都是框架无关的：收一份配置与 DOM 输入，返回一个要自己
// 释放的句柄。Vue 包装把建立、节点换代与释放对齐到组件生命周期，不改原语语义。
//
// 与主入口分开：自建浮层才用得上这一层，不用的应用不必把它压进主入口的体积。
// 需要层栈仪式的那几个（消解层、焦点域、背景失活）不在这里——
// 它们要按顺序接四五个东西，接错的表现是「点子菜单父层跟着关」这种不报错的怪症，
// 那种场景请直接用库里现成的浮层组件。
import type {
  HoverIntentOptions as CoreHoverIntentOptions,
  RuntimeConfig,
  ScrollMetrics,
  ScrollTrackerOptions,
  StickToBottomOptions,
  StickToBottomState,
  Typeahead,
  TypeaheadOptions,
} from '@xihan-ui/core'
import type { MaybeRefOrGetter, Ref } from 'vue'
import {
  acquireScrollLock,
  createScrollTracker,
  createStickToBottom,
  createTypeahead,
  trackHoverIntent,
} from '@xihan-ui/core'
import { onMounted, onScopeDispose, ref, toValue, watch } from 'vue'

/**
 * 按需加解滚动锁。锁是引用计数的，多处同时加锁不会互相干扰。
 *
 * 锁定哪个元素由 `config.scrollRoot()` 决定；宿主把滚动移入内容容器
 * （body 自身不滚动）时必须在配置中注入，否则锁定的是不滚动的元素。
 */
export function useScrollLock(
  active: MaybeRefOrGetter<boolean>,
  config: MaybeRefOrGetter<RuntimeConfig>,
): void {
  let handle: { dispose: () => void } | null = null
  let stopWatching: (() => void) | null = null
  const release = (): void => {
    const current = handle
    handle = null
    current?.dispose()
  }
  onMounted(() => {
    stopWatching = watch(
      () => toValue(active),
      (on) => {
        if (on && !handle)
          handle = acquireScrollLock({ config: toValue(config) })
        else if (!on)
          release()
      },
      { immediate: true, flush: 'post' },
    )
  })
  onScopeDispose(() => {
    stopWatching?.()
    stopWatching = null
    release()
  })
}

/**
 * 悬停意图：进入触发器停留足够时长才报告展开，离开时按安全三角判断是否正朝浮层移动。
 * 用于自建的悬停浮层，省去斜向划向子菜单时中途关闭这类手写延时。
 */
export interface UseHoverIntentOptions extends Omit<CoreHoverIntentOptions, 'trigger'> {
  /** 当前悬停宿主；模板 ref 尚未就位或节点暂时不渲染时返回 null。 */
  getTriggerEl: () => HTMLElement | null
}

export function useHoverIntent(options: MaybeRefOrGetter<UseHoverIntentOptions>): void {
  const readOptions = (): UseHoverIntentOptions => toValue(options)
  let stopTracking: (() => void) | null = null
  let stopWatching: (() => void) | null = null

  const release = (): void => {
    stopTracking?.()
    stopTracking = null
  }

  onMounted(() => {
    stopWatching = watch(
      [
        () => readOptions().getTriggerEl(),
        () => readOptions().openDelay,
        () => readOptions().closeDelay,
        () => readOptions().buffer,
      ],
      ([trigger]) => {
        release()
        // null 是 Vue 模板节点尚未在场的明确生命周期状态；节点出现后本 watcher 会建立绑定。
        if (trigger === null)
          return
        const current = readOptions()
        stopTracking = trackHoverIntent({
          trigger,
          getContentEl: () => readOptions().getContentEl(),
          openDelay: current.openDelay,
          closeDelay: current.closeDelay,
          buffer: current.buffer,
          onOpenIntent: () => readOptions().onOpenIntent(),
          onCloseIntent: () => readOptions().onCloseIntent(),
        })
      },
      { immediate: true, flush: 'post' },
    )
  })

  onScopeDispose(() => {
    stopWatching?.()
    stopWatching = null
    release()
  })
}

/** 观察滚动容器的位置与尺寸，值变化时才回调。返回最近一次测得的值。 */
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

export interface StickToBottom {
  /** 当前贴底状态，随原语的回调更新。 */
  state: Ref<StickToBottomState | null>
  /** 滚动到底部并恢复粘附，默认 'smooth'，reducedMotion 为真时强制 'instant'。 */
  scrollToBottom: (behavior?: 'smooth' | 'instant') => void
  /** 重新读取 scrollEl / contentEl，节点变化时解绑重绑。 */
  retarget: () => void
}

/**
 * 内容增长时保持粘底，用户向上滚动后即停止跟随。
 *
 * 两个 getter 中读取的是 ref 时自动重绑：原语在建立时就绑定一次，
 * 而 setup 阶段模板 ref 仍为 null，不重绑等于未挂载。
 */
export function useStickToBottom(options: StickToBottomOptions): StickToBottom {
  const state = ref<StickToBottomState | null>(null)
  const handle = createStickToBottom({
    ...options,
    onChange: (next) => {
      state.value = next
      options.onChange?.(next)
    },
  })
  watch([() => options.scrollEl(), () => options.contentEl()], () => handle.retarget())
  onScopeDispose(() => handle.dispose())
  return { state, scrollToBottom: handle.scrollToBottom, retarget: handle.retarget }
}

/** 连续输入字母跳转到匹配项的缓冲，超时自动清空。 */
export function useTypeahead(options: TypeaheadOptions = {}): Typeahead {
  const typeahead = createTypeahead(options)
  onScopeDispose(() => typeahead.clear())
  return typeahead
}
