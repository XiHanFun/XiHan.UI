import type {
  HotkeysApi,
  HotkeySegment,
  HotkeysPlatform,
  HotkeysProps,
  HotkeysResolvedPlatform,
  HotkeysTarget,
} from '@xihan-ui/headless'
import type { RefObject } from 'react'
import { connectHotkeys, detectHotkeysPlatform } from '@xihan-ui/headless'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useIsomorphicLayoutEffect } from '../../runtime/layout-effect'
import { reactNormalize } from '../../runtime/normalize-props'

export interface UseHotkeysOptions extends Omit<HotkeysProps, 'target'> {
  /**
   * 监听装在哪儿。'document' 缺省；'parent' 把组合限制在组件所在的那一层面板里，
   * 需要第二参给出根节点；也可以自己给一个节点（滚动容器、window 等）。
   */
  target?: HotkeysTarget | (() => EventTarget | null)
}

export interface HotkeysHandle {
  /** 连接层产出的整面，渲染键帽时用。 */
  api: HotkeysApi
  /** 翻好的各枚键，自绘键帽时用。 */
  segments: readonly HotkeySegment[]
  platform: HotkeysResolvedPlatform
  separator: string
  /** 提前解绑；调用后不再装回，卸载时也会走这一路。 */
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
  options: UseHotkeysOptions,
  rootRef?: RefObject<HTMLElement | null>,
): HotkeysHandle {
  // 平台要等挂载后才测得出来：落定前 'Mod' 会解析成 Control，Mac 上 ⌘K 按不出来
  const [detected, setDetected] = useState<HotkeysPlatform>('auto')
  useEffect(() => {
    setDetected(detectHotkeysPlatform())
  }, [])

  const api = connectHotkeys({
    ...options,
    // 作者显式写了平台就以他为准，写 auto 或没写才用实测值
    platform: options.platform && options.platform !== 'auto' ? options.platform : detected,
    // 自定义节点由本组合式自己挑，连接层只认那两种字面量
    target: typeof options.target === 'function' ? undefined : options.target,
  }, reactNormalize)

  // 取值器每帧换、监听只装一次：装的是转发器，触发时现读这一帧的接线
  const latest = useRef({ api, options, rootRef })
  latest.current = { api, options, rootRef }

  const bound = useRef<EventTarget | null>(null)
  const stopped = useRef(false)
  const forward = useCallback((event: Event) => {
    latest.current.api.handleKeyDown(event as KeyboardEvent)
  }, [])

  const detach = useCallback(() => {
    bound.current?.removeEventListener('keydown', forward)
    bound.current = null
  }, [forward])

  const stop = useCallback(() => {
    stopped.current = true
    detach()
  }, [detach])

  /** 让监听落在此刻该落的那个节点上；反复调是幂等的。 */
  const sync = useCallback(() => {
    if (stopped.current)
      return
    const { api: current, options: opts, rootRef: ref } = latest.current
    let next: EventTarget | null
    if (typeof opts.target === 'function') {
      next = opts.target()
    }
    else {
      const el = ref?.current ?? null
      next = el === null
        ? (typeof document === 'undefined' ? null : document)
        : (current.target === 'parent' ? el.parentElement : el.ownerDocument)
    }
    if (next === bound.current)
      return
    detach()
    bound.current = next
    next?.addEventListener('keydown', forward)
  }, [detach, forward])

  // 节点要等提交之后才拿得到；不给依赖数组，落点换了也就地补齐
  useIsomorphicLayoutEffect(sync)
  // 卸载时摘干净：留着的监听器会攥住已经拆掉的那份闭包，按键仍旧被接走
  useEffect(() => detach, [detach])

  return { api, segments: api.segments, platform: api.platform, separator: api.separator, stop }
}
