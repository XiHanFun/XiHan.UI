import type { RuntimeConfig } from '@xihan-ui/core'
import type { PresenceHandle } from '@xihan-ui/core/presence'
import type { Ref } from 'vue'
import { attachCssExit, createPresence } from '@xihan-ui/core/presence'
import { onBeforeUnmount, ref, watch } from 'vue'

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
   */
  config: RuntimeConfig | null
  /** 此刻逻辑上是否展开。 */
  isOpen: () => boolean
  /** content 节点，退场动画从它身上探测。 */
  contentRef: Ref<HTMLElement | null>
}

/**
 * 返回「此刻该不该可见」。作者把它盖到 content 的 `hidden` 上：
 * `{ ...api.getContentProps(), hidden: !visible.value || undefined }`。
 */
export function useOverlayExit(options: OverlayExitOptions): Ref<boolean> {
  const { config, isOpen, contentRef } = options
  const visible = ref(isOpen())

  if (!config) {
    watch(isOpen, (open) => {
      visible.value = open
    })
    return visible
  }

  const presence: PresenceHandle = createPresence({
    config,
    open: isOpen(),
    onRenderedChange: (rendered) => {
      visible.value = rendered
    },
  })
  visible.value = presence.rendered

  // data-state 提交到 DOM 之后再驱动 presence，让退场探测读到正确的 animationName
  watch(isOpen, open => presence.update(open), { flush: 'post' })

  // content 就位或更换后把它的 CSS 退场动画接到退出租约；没有退场动画时收起即收起
  let detach: (() => void) | undefined
  watch(contentRef, (el) => {
    detach?.()
    detach = el ? attachCssExit(el, presence) : undefined
  }, { flush: 'post' })

  onBeforeUnmount(() => {
    detach?.()
    presence.dispose()
  })

  return visible
}
