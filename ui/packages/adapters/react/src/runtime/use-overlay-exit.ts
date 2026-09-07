import type { RuntimeConfig } from '@xihan-ui/core'
import type { RefObject } from 'react'
import { attachCssExit, createPresence } from '@xihan-ui/core/presence'
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'

// 退场闸门：把「几时真的收起内容」从展开态挪到 presence 上。
//
// 连接层给 content 打的 `hidden` 是跟着展开态走的——收起那一帧节点就不生成盒子了，
// 退场动画一帧都播不出来。这里把它改成跟着 presence 走：展开时可见、退场动画播完之前
// 也可见，播完才真收。作者节点始终留在原地，被拉长的是「可见的时间」而不是「存在的时间」。
//
// 浮层族那几个走 use-overlay：它们还要连消隐层、遮罩与定位一起管。折叠族只需要这一件事。

/** 服务端没有提交这一步，layout effect 换成永不执行的 useEffect，避开 React 的警告。 */
const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect

export interface OverlayExitOptions {
  /**
   * 运行时配置；reduce 档下 presence 直接不申领租约。
   * 服务端没有 DOM、也就没有退场可言，传 null 即退化成「可见与否跟着展开态」。
   */
  config: RuntimeConfig | null
  /** 此刻逻辑上是否展开。 */
  isOpen: () => boolean
  /** content 节点，退场动画从它身上探测。 */
  contentRef: RefObject<HTMLElement | null>
}

/**
 * 返回「此刻该不该可见」。作者把它落成 content 的内联 display：
 * `style: visible ? undefined : { display: 'none' }`。
 */
export function useOverlayExit(options: OverlayExitOptions): boolean {
  const { config } = options
  // 首帧的展开态冻在这里：presence 只按它建一次，之后的变化都走 update。
  // 每帧现算会让展开一次就重建一次 presence，退场租约跟着断掉
  const [initialOpen] = useState(options.isOpen)
  const [visible, setVisible] = useState(initialOpen)

  // 取值器随渲染换，接线只建一次：拿 ref 转一道，别让它成为重建的理由
  const latest = useRef(options)
  latest.current = options

  const presence = useMemo(
    () => (config ? createPresence({ config, open: initialOpen, onRenderedChange: setVisible }) : null),
    [config, initialOpen],
  )

  // data-state 落到 DOM 之后再驱动进出场：早于提交驱动，退场探测读到的还是上一帧的
  // animationName，量不到这次的动画
  const detachExit = useRef<(() => void) | undefined>(undefined)
  useIsomorphicLayoutEffect(() => {
    const open = latest.current.isOpen()
    if (!presence) {
      setVisible(open)
      return
    }
    presence.update(open)
    const node = latest.current.contentRef.current
    detachExit.current?.()
    detachExit.current = node ? attachCssExit(node, presence) : undefined
  })

  useEffect(() => () => {
    detachExit.current?.()
    detachExit.current = undefined
    presence?.dispose()
  }, [presence])

  return visible
}
