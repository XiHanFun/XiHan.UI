import type {
  HotkeysApi,
  HotkeysPlatform,
  HotkeysProps,
  HotkeysResolvedPlatform,
} from '@xihan-ui/headless'
import { connectHotkeys, detectHotkeysPlatform } from '@xihan-ui/headless'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useIsomorphicLayoutEffect } from '../../runtime/layout-effect'

export interface UseHotkeysOptions extends HotkeysProps {}

export interface HotkeysHandle {
  /** 连接层产出的纯行为面。 */
  api: HotkeysApi
  platform: HotkeysResolvedPlatform
  /** 提前解绑；调用后不再装回，卸载时也会走这一路。 */
  stop: () => void
}

/**
 * 注册一组按键组合，不渲染任何键帽。展示请显式组合 XhKbdGroup。
 *
 * 一次调用管一组组合，注册四条就调四次：与组件形态一比一对齐，
 * 免得两种形态的 preventDefault / enabled / platform 语义各走各的。
 */
export function useHotkeys(
  options: UseHotkeysOptions,
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
  })

  // 取值器每帧换、监听只装一次：装的是转发器，触发时现读这一帧的接线
  const latest = useRef({ api })
  latest.current = { api }

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
    const { api: current } = latest.current
    const next = current.resolveTarget(typeof document === 'undefined' ? null : document)
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

  return { api, platform: api.platform, stop }
}
