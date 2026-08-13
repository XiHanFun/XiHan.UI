// @xihan-ui/vue/sound —— 声音层的 Vue 适配。
//
// 与主入口分开：@xihan-ui/sound 是可选 peer，不用音效的应用不会因为装了本包
// 而多出一个音频引擎。用之前先装 @xihan-ui/sound。
//
// 三种用法，从轻到重：
//   v-sound          给任意元素或组件按下时配一声，一个字都不用改组件
//   withToastSound   给命令式反馈服务配上声音，调用点一行都不用改
//   getSoundPlayer   自己拿播放器，接偏好开关或调音面板

import type { ToastOptions, ToastType } from '@xihan-ui/headless'
import type { SoundPlayer } from '@xihan-ui/sound'
import type { Directive } from 'vue'
import type { DialogService } from './services/dialog-service'
import type { ToastService } from './services/toast-service'
import { createSoundPlayer } from '@xihan-ui/sound'

let shared: SoundPlayer | null = null
/** 共享播放器是自己建的还是外面塞进来的：只有自己建的才由本模块销毁。 */
let sharedIsOwn = false

/**
 * 取共享播放器，没有就建一个默认的。
 * 播放器本身很轻，音频上下文要等第一次真的发声才建，取了不用不花代价。
 */
export function getSoundPlayer(): SoundPlayer {
  if (!shared) {
    shared = createSoundPlayer()
    sharedIsOwn = true
  }
  return shared
}

/** 换成自己配置的播放器（换主题、接用户偏好）。自动建的那个会被销毁。 */
export function setSoundPlayer(player: SoundPlayer): void {
  if (shared && sharedIsOwn && shared !== player)
    shared.dispose()
  shared = player
  sharedIsOwn = false
}

/** 首次用户手势时解锁音频上下文，返回撤销函数。 */
function attachUnlock(player: SoundPlayer): () => void {
  if (typeof document === 'undefined')
    return () => undefined
  const listener = (): void => {
    player.unlock()
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

/** 语义名，或 null 表示这一类不出声。 */
export type SoundChoice = string | null

export interface ToastSoundOptions {
  /** 用哪个播放器，默认共享播放器。 */
  player?: SoundPlayer
  /** 通知类型 → 语义名。只写要改的那几个，其余沿用默认。 */
  sounds?: Partial<Record<ToastType, SoundChoice>>
  /**
   * 首次用户手势时解锁音频上下文，默认开。
   * 通知常来自拦截器或推送这类非手势场景，不解锁就发不出声。
   */
  autoUnlock?: boolean
}

const TOAST_SOUNDS: Record<ToastType, SoundChoice> = {
  info: 'info',
  success: 'success',
  warning: 'warning',
  error: 'error',
  // 加载中只是个过渡态，收尾时才有值得报的结果
  loading: null,
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
  const player = options.player ?? getSoundPlayer()
  const sounds = { ...TOAST_SOUNDS, ...options.sounds }
  const detachUnlock = options.autoUnlock === false ? () => undefined : attachUnlock(player)

  const play = (type: ToastType | undefined): void => {
    const name = sounds[type ?? 'info']
    if (name)
      player.play(name)
  }

  return {
    ...service,
    create: (opts?: ToastOptions) => {
      play(opts?.type)
      return service.create(opts)
    },
    update: (id, opts) => {
      if (opts.type)
        play(opts.type)
      service.update(id, opts)
    },
    info: (message, opts) => {
      play('info')
      return service.info(message, opts)
    },
    success: (message, opts) => {
      play('success')
      return service.success(message, opts)
    },
    warning: (message, opts) => {
      play('warning')
      return service.warning(message, opts)
    },
    error: (message, opts) => {
      play('error')
      return service.error(message, opts)
    },
    loading: (message, opts) => {
      play('loading')
      return service.loading(message, opts)
    },
    dispose: () => {
      detachUnlock()
      service.dispose()
    },
  }
}

/** 对话框服务的发声档：confirm 是征询，其余四档带类型语气。 */
export type DialogSoundKey = 'confirm' | 'info' | 'success' | 'warning' | 'error'

export interface DialogSoundOptions {
  player?: SoundPlayer
  sounds?: Partial<Record<DialogSoundKey, SoundChoice>>
  autoUnlock?: boolean
}

const DIALOG_SOUNDS: Record<DialogSoundKey, SoundChoice> = {
  confirm: 'open',
  info: 'info',
  success: 'success',
  warning: 'warning',
  error: 'error',
}

/**
 * 给命令式确认框服务配上声音：弹出时发声，收场不发
 * （按钮那一下与随后的通知已经把结果说清楚了）。
 */
export function withDialogSound(service: DialogService, options: DialogSoundOptions = {}): DialogService {
  const player = options.player ?? getSoundPlayer()
  const sounds = { ...DIALOG_SOUNDS, ...options.sounds }
  const detachUnlock = options.autoUnlock === false ? () => undefined : attachUnlock(player)

  const play = (key: DialogSoundKey): void => {
    const name = sounds[key]
    if (name)
      player.play(name)
  }

  return {
    ...service,
    confirm: (opts) => {
      play('confirm')
      return service.confirm(opts)
    },
    info: (opts) => {
      play('info')
      return service.info(opts)
    },
    success: (opts) => {
      play('success')
      return service.success(opts)
    },
    warning: (opts) => {
      play('warning')
      return service.warning(opts)
    },
    error: (opts) => {
      play('error')
      return service.error(opts)
    },
    dispose: () => {
      detachUnlock()
      service.dispose()
    },
  }
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
