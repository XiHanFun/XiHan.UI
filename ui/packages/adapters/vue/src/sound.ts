// @xihan-ui/vue/sound —— 声音层的 Vue 适配。
//
// 与主入口分开：@xihan-ui/sound 是可选 peer，不用音效的应用不会因为装了本包
// 而多出一个音频引擎。用之前先装 @xihan-ui/sound。
//
// 三种用法，从轻到重：
//   v-sound          给任意元素或组件按下时配一声，一个字都不用改组件
//   withToastSound   给命令式反馈服务配上声音，调用点一行都不用改
//   getSoundPlayer   自己拿播放器，接偏好开关或调音面板

import type { DialogSoundServiceOptions, SoundPlayer, ToastSoundServiceOptions } from '@xihan-ui/sound'
import type { Directive } from 'vue'
import type { DialogService } from './services/dialog-service'
import type { ToastService } from './services/toast-service'
import { createSharedSoundPlayerController, withDialogSoundService, withToastSoundService } from '@xihan-ui/sound'

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

/** 首次用户手势时解锁音频上下文，返回撤销函数。 */
function attachUnlock(unlock: () => void): () => void {
  if (typeof document === 'undefined')
    return () => undefined
  const listener = (): void => {
    unlock()
    document.removeEventListener('pointerdown', listener)
    document.removeEventListener('keydown', listener)
  }
  document.addEventListener('pointerdown', listener)
  document.addEventListener('keydown', listener)
  return () => {
    document.removeEventListener('pointerdown', listener)
    document.removeEventListener('keydown', listener)
  }
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
    attachUnlock,
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
    attachUnlock,
  })
}

export interface SoundDirectiveOptions {
  /** 语义名或配方名，默认 'click'。 */
  sound?: string
  /** 本次播放的音量系数（0..1）。 */
  volume?: number
  /** 用哪个播放器，默认共享播放器。 */
  player?: SoundPlayer
}

export type SoundDirectiveValue = string | SoundDirectiveOptions | undefined

function toOptions(value: SoundDirectiveValue): Required<Pick<SoundDirectiveOptions, 'sound'>> & SoundDirectiveOptions {
  if (typeof value === 'string')
    return { sound: value }
  return { sound: 'click', ...value }
}

/** 禁用态的元素不发声：原生 disabled 不触发 click，aria/data 标注的会。 */
function isDisabled(el: HTMLElement): boolean {
  return el.hasAttribute('disabled')
    || el.getAttribute('aria-disabled') === 'true'
    || el.hasAttribute('data-disabled')
}

const bound = new WeakMap<HTMLElement, { handler: () => void, options: ReturnType<typeof toOptions> }>()

/**
 * `v-sound` —— 给任意元素按下时配一声。
 *
 * 挂在 click 上而不是 pointerdown：键盘敲 Enter / Space 激活也要响，
 * 而且点下去又拖开取消的那种不该响。
 *
 * ```vue
 * <XhButton v-sound>提交</XhButton>
 * <XhButton v-sound="'send'">发送</XhButton>
 * <div v-sound="{ sound: 'toggle-on', volume: 0.6 }" />
 * ```
 */
export const vSound: Directive<HTMLElement, SoundDirectiveValue> = {
  mounted(el, binding) {
    const entry = {
      options: toOptions(binding.value),
      handler: (): void => {
        if (isDisabled(el))
          return
        const { sound, volume, player } = entry.options
        ;(player ?? getSoundPlayer()).play(sound, volume === undefined ? undefined : { volume })
      },
    }
    bound.set(el, entry)
    el.addEventListener('click', entry.handler)
  },
  updated(el, binding) {
    const entry = bound.get(el)
    if (entry)
      entry.options = toOptions(binding.value)
  },
  unmounted(el) {
    const entry = bound.get(el)
    if (entry)
      el.removeEventListener('click', entry.handler)
    bound.delete(el)
  },
}
