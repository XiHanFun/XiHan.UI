import type { RuntimeConfig } from '@xihan-ui/core'
import type { PresenceHandle } from '@xihan-ui/core/presence'
import type { MaybeRefOrGetter, Ref } from 'vue'
import { attachCssExit, createPresence } from '@xihan-ui/core/presence'
import { getCurrentInstance, isRef, onBeforeUnmount, onMounted, ref, toValue, watch } from 'vue'

// 退场闸门：把「几时真的收起浮层」从展开态挪到 presence 上。
//
// 连接层给 content 打的 `hidden` 是跟着 open 走的——收起那一帧节点就不生成盒子了，
// 退场动画一帧都播不出来。这里把它改成跟着 presence 走：展开时可见、退场动画播完之前
// 也可见，播完才真收。作者节点始终留在原地，被拉长的是「可见的时间」而不是「存在的时间」。
//
// dialog / drawer 那几个是自己在 use-*.ts 里手写这一套的（它们还要连遮罩与层一起管），
// 浮层族这十几个只需要这一件事，所以收成一个共用件。

export interface OverlayExitOptions {
  /**
   * 运行时配置；reduce 档下 presence 直接不申领租约。
   * 服务端没有 DOM、也就没有退场可言，传 null 即退化成「可见与否跟着展开态」。
   * 客户端必须等真实根节点才能确定 realm 时传 ref/getter；挂载后仍为空会明确失败。
   */
  config: MaybeRefOrGetter<RuntimeConfig | null>
  /** 此刻逻辑上是否展开。 */
  isOpen: () => boolean
  /** content 节点，退场动画从它身上探测。 */
  contentRef: Ref<HTMLElement | null>
  /** 与 content 共同决定退出完成的其他真实视觉节点。 */
  additionalExitRefs?: Array<Ref<HTMLElement | null>>
  /** Presence 建立后交给需要共用退出生命周期的 Headless 机器；卸载时回传 null。 */
  onPresence?: (presence: PresenceHandle | null) => void
}

/**
 * 返回「此刻该不该可见」。作者把它盖到 content 的 `hidden` 上：
 * `{ ...api.getContentProps(), hidden: !visible.value || undefined }`。
 */
export function useOverlayExit(options: OverlayExitOptions): Ref<boolean> {
  const { isOpen, contentRef } = options
  const visible = ref(isOpen())
  let presence: PresenceHandle | null = null
  const tracked = new Map<HTMLElement, () => void>()
  let stopOpen: (() => void) | undefined
  let stopContent: (() => void) | undefined

  const start = (config: RuntimeConfig | null): void => {
    if (!config) {
      stopOpen = watch(isOpen, (open) => {
        visible.value = open
      })
      return
    }

    presence = createPresence({
      config,
      open: isOpen(),
      onRenderedChange: (rendered) => {
        visible.value = rendered
      },
    })
    options.onPresence?.(presence)
    visible.value = presence.rendered

    // data-state 提交到 DOM 之后再驱动 presence，让退场探测读到正确的 animationName
    stopOpen = watch(isOpen, open => presence?.update(open), { flush: 'post' })

    // 延迟配置到挂载期才就绪时 content 已经存在，immediate 负责补上首次 attach。
    stopContent = watch([contentRef, ...(options.additionalExitRefs ?? [])], (nodes) => {
      const next = new Set(nodes.filter((node): node is HTMLElement => node !== null))
      for (const node of next) {
        if (!tracked.has(node))
          tracked.set(node, attachCssExit(node, presence!))
      }
      for (const [node, detach] of tracked) {
        if (!next.has(node)) {
          tracked.delete(node)
          detach()
        }
      }
    }, { flush: 'post', immediate: true })
  }

  const initial = toValue(options.config)
  const delayed = isRef(options.config) || typeof options.config === 'function'
  if (initial || !delayed) {
    start(initial)
  }
  else if (getCurrentInstance()) {
    onMounted(() => {
      const config = toValue(options.config)
      if (!config)
        throw new Error('[xh] useOverlayExit 的延迟 RuntimeConfig 在挂载后仍未就绪')
      start(config)
    })
  }
  else {
    throw new Error('[xh] useOverlayExit 的延迟 RuntimeConfig 只能在 Vue setup 生命周期内使用')
  }

  onBeforeUnmount(() => {
    stopOpen?.()
    stopContent?.()
    for (const detach of tracked.values()) detach()
    tracked.clear()
    presence?.dispose()
    options.onPresence?.(null)
  })

  return visible
}
