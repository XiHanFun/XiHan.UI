/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 use overlay exit 相关实现。

import type { RuntimeConfig } from '@xihan-ui/core'
import type { PresenceHandle } from '@xihan-ui/core/presence'
import type { MaybeRefOrGetter, Ref } from 'vue'
import { overlayKit, whenOverlayKit } from '@xihan-ui/core'
import { attachCssExit, createPresence } from '@xihan-ui/core/presence'
import { getCurrentInstance, isRef, onBeforeUnmount, onMounted, ref, toValue, watch } from 'vue'

// 退场闸门：把「几时真的收起浮层」从展开态挪到 presence 上。
//
// 连接层给 content 打的 `hidden` 是跟着 open 走的——收起那一帧节点就不生成盒子了，
// 退场动画一帧都播不出来。这里把它改成跟着 presence 走：展开时可见、退场动画播完之前
// 也可见，播完才真收。作者节点始终留在原地，被拉长的是「可见的时间」而不是「存在的时间」。
//
// 所有带退场的部件共用这一件：dialog / drawer / command / image-viewer 的遮罩经 additionalExitRefs
// 一并计入，轻提示与通知卡片也经它把 Presence 交给机器。

/**
 * 退场播完却不卸载的浮层（unmountOnExit 为 false）收起定位层用的属性。
 * 皮肤给定位层声明过 display，UA 的 [hidden]{display:none} 压不住，只能写内联。
 */
export const OVERLAY_STOWED_PROPS = { style: { display: 'none' } } as const

export interface OverlayExitOptions {
  /**
   * 运行时配置，只用来区分有没有 DOM：服务端没有退场可言，传 null 即退化为可见与否跟随展开态。
   * 客户端必须等真实根节点才能确定 realm 时传 ref/getter；挂载后仍为空会明确失败。
   */
  config: MaybeRefOrGetter<RuntimeConfig | null>
  /** 当前逻辑上是否展开。 */
  isOpen: () => boolean
  /** content 节点，退场动画从它上面探测。 */
  contentRef: Ref<HTMLElement | null>
  /** 与 content 共同决定退出完成的其他真实视觉节点。 */
  additionalExitRefs?: Array<Ref<HTMLElement | null>>
  /** Presence 建立后交给需要共用退出生命周期的 Headless 状态机；卸载时回传 null。 */
  onPresence?: (presence: PresenceHandle | null) => void
  /**
   * 展开后等 core 的浮层按需块到了才露出内容。焦点陷阱、滚动锁与背景失活都在那一块里，
   * 不靠落位藏面板的浮层（对话框、抽屉、图片查看器、命令面板）第一次打开时若按需块还没到，
   * 露出来的那一下焦点与滚动都还没被接管；靠定位的浮层落位前本就藏着，不用开。
   * 只管挂载之后的展开：挂载时就开着的照常露出，与服务端直出的标记对齐。
   */
  awaitOverlayKit?: boolean
}

/**
 * 返回当前是否应当可见。作者把它覆盖到 content 的 `hidden` 上：
 * `{ ...api.getContentProps(), hidden: !visible.value || undefined }`。
 */
export function useOverlayExit(options: OverlayExitOptions): Ref<boolean> {
  const { isOpen, contentRef } = options
  const visible = ref(isOpen())
  let presence: PresenceHandle | null = null
  const tracked = new Map<HTMLElement, () => void>()
  let stopOpen: (() => void) | undefined
  let stopContent: (() => void) | undefined
  let stopGate: (() => void) | undefined
  // 可见 = presence 还在场，且没在等浮层按需块
  let rendered = visible.value
  let gated = false
  let waitingKit: (() => void) | null = null
  const apply = (): void => {
    visible.value = rendered && !gated
  }

  const start = (config: RuntimeConfig | null): void => {
    if (!config) {
      stopOpen = watch(isOpen, (open) => {
        rendered = open
        apply()
      })
      return
    }

    if (options.awaitOverlayKit) {
      // 挂载之后才展开、且按需块还没到：先藏着，到了再露。排在渲染之前跑，展开那一帧就不露
      stopGate = watch(isOpen, (open) => {
        if (!open || waitingKit || overlayKit())
          return
        gated = true
        apply()
        waitingKit = whenOverlayKit(() => {
          waitingKit = null
          gated = false
          apply()
        })
      })
    }

    presence = createPresence({
      open: isOpen(),
      onRenderedChange: (next) => {
        rendered = next
        apply()
      },
    })
    options.onPresence?.(presence)
    rendered = presence.rendered
    apply()

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
    stopGate?.()
    waitingKit?.()
    waitingKit = null
    for (const detach of tracked.values()) detach()
    tracked.clear()
    presence?.dispose()
    options.onPresence?.(null)
  })

  return visible
}
