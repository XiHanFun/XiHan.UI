// @xihan-ui/react/sound —— 声音层的 React 适配。
//
// 与主入口分开：@xihan-ui/sound 是可选 peer，不用音效的应用不会因为装了本包
// 而多出一个音频引擎。用之前先装 @xihan-ui/sound。
//
// 三种用法，从轻到重：
//   useSoundOnPress  给任意元素按下时配一声，返回一个挂到 ref 上的回调
//   withToastSound   给命令式反馈服务配上声音，调用点一行都不用改
//   getSoundPlayer   自己拿播放器，接偏好开关或调音面板

import type { DialogSoundServiceOptions, SoundPressOptions as SharedSoundPressOptions, SoundPlayer, ToastSoundServiceOptions } from '@xihan-ui/sound'
import type { RefCallback } from 'react'
import type { DialogService } from './services/dialog-service'
import type { ToastService } from './services/toast-service'
import { attachDocumentSoundUnlock, createSharedSoundPlayerController, isSoundTargetDisabled, resolveSoundPressOptions, withDialogSoundService, withToastSoundService } from '@xihan-ui/sound'
import { useCallback, useRef } from 'react'

export type { DialogSoundKey, SoundChoice } from '@xihan-ui/sound'

const shared = createSharedSoundPlayerController()

/**
 * 取共享播放器，没有就建一个默认的。
 * 播放器本身很轻，音频上下文要等第一次真的发声才建，取了不用不花代价。
 */
export function getSoundPlayer(): SoundPlayer {
  return shared.getPlayer()
}

/** 换成自己配置的播放器（换主题、接用户偏好）。自动建的那个会被销毁。 */
export function setSoundPlayer(player: SoundPlayer): void {
  shared.setPlayer(player)
}

export interface ToastSoundOptions extends Omit<ToastSoundServiceOptions, 'player' | 'attachUnlock'> {
  /** 用哪个播放器，默认共享播放器。 */
  player?: SoundPlayer
}

/**
 * 给命令式通知服务配上声音：入队即发声，调用点一行都不用改。
 *
 * ```ts
 * export const toast = withToastSound(createToastService())
 * toast.success('已保存') // 视觉 + 听觉
 * ```
 *
 * `update` 只在改了类型且新类型不是 loading 时发声——上传完成那一刻该响，
 * 改个文案不该响。
 */
export function withToastSound(service: ToastService, options: ToastSoundOptions = {}): ToastService {
  return withToastSoundService(service, {
    ...options,
    player: options.player ?? getSoundPlayer(),
    attachUnlock: attachDocumentSoundUnlock,
  })
}

export interface DialogSoundOptions extends Omit<DialogSoundServiceOptions, 'player' | 'attachUnlock'> {
  player?: SoundPlayer
}

/**
 * 给命令式确认框服务配上声音：弹出时发声，收场不发
 * （按钮那一下与随后的通知已经把结果说清楚了）。
 */
export function withDialogSound(service: DialogService, options: DialogSoundOptions = {}): DialogService {
  return withDialogSoundService(service, {
    ...options,
    player: options.player ?? getSoundPlayer(),
    attachUnlock: attachDocumentSoundUnlock,
  })
}

export interface SoundPressOptions extends SharedSoundPressOptions {}

export type SoundPressValue = string | SoundPressOptions | undefined

/**
 * `useSoundOnPress` —— 给任意元素按下时配一声，返回值挂到该元素的 `ref` 上。
 *
 * 挂在 click 上而不是 pointerdown：键盘敲 Enter / Space 激活也要响，
 * 而且点下去又拖开取消的那种不该响。
 *
 * 挂到库里的组件上时，回调与组件自己的 ref 会被合成一份，两边都收得到节点。
 *
 * ```tsx
 * <button ref={useSoundOnPress()}>提交</button>
 * <button ref={useSoundOnPress('send')}>发送</button>
 * <div ref={useSoundOnPress({ sound: 'toggle-on', volume: 0.6 })} />
 * ```
 */
export function useSoundOnPress(value?: SoundPressValue): RefCallback<HTMLElement> {
  // 每渲染现读一份：换语义名、换音量、换播放器都不必解绑重绑，按下那一刻取当前值
  const latest = useRef(resolveSoundPressOptions(value))
  latest.current = resolveSoundPressOptions(value)
  const bound = useRef<{ el: HTMLElement, handler: () => void } | null>(null)

  // 回调常驻：跟着渲染换新的会让 React 每次提交都解绑重绑一遍
  return useCallback((el: HTMLElement | null) => {
    const detach = (): void => {
      if (!bound.current)
        return
      bound.current.el.removeEventListener('click', bound.current.handler)
      bound.current = null
    }
    detach()
    if (!el)
      return
    const handler = (): void => {
      if (isSoundTargetDisabled(el))
        return
      const { sound, volume, player } = latest.current
      ;(player ?? getSoundPlayer()).play(sound, volume === undefined ? undefined : { volume })
    }
    el.addEventListener('click', handler)
    bound.current = { el, handler }
    // 回调式 ref 返回清理函数是 React 19 的解绑通道；与组件自己的 ref 合成之后，
    // 传 null 那一路不再走，只剩这一条
    return detach
  }, [])
}
