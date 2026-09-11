import type { SoundPlayer } from './types'
import { createSoundPlayer } from './player'

/** 语义名，或 null 表示这一类不出声。 */
export type SoundChoice = string | null

/** 首次用户手势的接线端口。DOM 事件由适配器持有，核心只请求解锁并接收撤销句柄。 */
export type SoundUnlockAttacher = (unlock: () => void) => () => void

export interface SharedSoundPlayerController {
  /** 没有共享播放器时惰性创建；播放器自身仍在第一次发声时才建立音频上下文。 */
  getPlayer: () => SoundPlayer
  /** 换入外部播放器；只有控制器自己创建的旧播放器会被销毁。 */
  setPlayer: (player: SoundPlayer) => void
}

/** 一份适配器入口自己的共享播放器槽；不同框架入口之间不共享模块状态。 */
export function createSharedSoundPlayerController(
  create: () => SoundPlayer = createSoundPlayer,
): SharedSoundPlayerController {
  let shared: SoundPlayer | null = null
  let sharedIsOwn = false

  return {
    getPlayer() {
      if (!shared) {
        shared = create()
        sharedIsOwn = true
      }
      return shared
    },
    setPlayer(player) {
      if (shared && sharedIsOwn && shared !== player)
        shared.dispose()
      shared = player
      sharedIsOwn = false
    },
  }
}

export interface SoundServiceControllerOptions<Key extends PropertyKey> {
  player: SoundPlayer
  defaults: Readonly<Record<Key, SoundChoice>>
  sounds?: Partial<Record<Key, SoundChoice>>
  autoUnlock?: boolean
  attachUnlock?: SoundUnlockAttacher
}

export interface SoundServiceController<Key extends PropertyKey> {
  /** 按业务语义键播放；映射为 null 的键静音。 */
  play: (key: Key) => void
  /** 撤销自动解锁接线；不销毁播放器，播放器归调用方或共享槽所有。 */
  dispose: () => void
}

/** 框架无关的业务语义播放器：合并覆盖、请求解锁并持有其清理。 */
export function createSoundServiceController<Key extends PropertyKey>(
  options: SoundServiceControllerOptions<Key>,
): SoundServiceController<Key> {
  const sounds = { ...options.defaults, ...options.sounds }
  const detachUnlock = options.autoUnlock === false
    ? () => undefined
    : options.attachUnlock?.(() => options.player.unlock()) ?? (() => undefined)

  return {
    play(key) {
      const sound = sounds[key]
      if (sound)
        options.player.play(sound)
    },
    dispose: detachUnlock,
  }
}

type ServiceMethod = (...args: never[]) => unknown

/** Toast 服务所需的最小结构；其余方法与状态通过泛型原样保留。 */
export interface ToastSoundServicePort {
  create: ServiceMethod
  update: ServiceMethod
  info: ServiceMethod
  success: ServiceMethod
  warning: ServiceMethod
  error: ServiceMethod
  loading: ServiceMethod
  dispose: () => void
}

/** Dialog 服务所需的最小结构；prompt 等未列方法不会被装饰。 */
export interface DialogSoundServicePort {
  confirm: ServiceMethod
  info: ServiceMethod
  success: ServiceMethod
  warning: ServiceMethod
  error: ServiceMethod
  dispose: () => void
}

export type ToastSoundKey = 'info' | 'success' | 'warning' | 'error' | 'loading'
export type DialogSoundKey = 'confirm' | 'info' | 'success' | 'warning' | 'error'

export interface ToastSoundServiceOptions extends Omit<SoundServiceControllerOptions<ToastSoundKey>, 'defaults'> {}
export interface DialogSoundServiceOptions extends Omit<SoundServiceControllerOptions<DialogSoundKey>, 'defaults'> {}

const TOAST_SOUND_DEFAULTS: Readonly<Record<ToastSoundKey, SoundChoice>> = {
  info: 'info',
  success: 'success',
  warning: 'warning',
  error: 'error',
  // 加载中只是过渡态，收尾时才有值得报的结果。
  loading: null,
}

const DIALOG_SOUND_DEFAULTS: Readonly<Record<DialogSoundKey, SoundChoice>> = {
  confirm: 'open',
  info: 'info',
  success: 'success',
  warning: 'warning',
  error: 'error',
}

function call<Method extends ServiceMethod>(
  service: object,
  method: Method,
  args: Parameters<Method>,
): ReturnType<Method> {
  return Reflect.apply(method, service, args) as ReturnType<Method>
}

/**
 * 给结构化 Toast 服务加声音，保留服务自身类型与返回值。
 * create 缺省按 info；update 只在显式改 type 时发声；loading 映射为静音。
 */
export function withToastSoundService<Service extends ToastSoundServicePort>(
  service: Service,
  options: ToastSoundServiceOptions,
): Service {
  const controller = createSoundServiceController({
    ...options,
    defaults: TOAST_SOUND_DEFAULTS,
  })

  return {
    ...service,
    create: (...args: Parameters<Service['create']>) => {
      const input = args[0] as { type?: ToastSoundKey } | undefined
      controller.play(input?.type ?? 'info')
      return call(service, service.create, args)
    },
    update: (...args: Parameters<Service['update']>) => {
      const input = args[1] as { type?: ToastSoundKey } | undefined
      if (input?.type)
        controller.play(input.type)
      return call(service, service.update, args)
    },
    info: (...args: Parameters<Service['info']>) => {
      controller.play('info')
      return call(service, service.info, args)
    },
    success: (...args: Parameters<Service['success']>) => {
      controller.play('success')
      return call(service, service.success, args)
    },
    warning: (...args: Parameters<Service['warning']>) => {
      controller.play('warning')
      return call(service, service.warning, args)
    },
    error: (...args: Parameters<Service['error']>) => {
      controller.play('error')
      return call(service, service.error, args)
    },
    loading: (...args: Parameters<Service['loading']>) => {
      controller.play('loading')
      return call(service, service.loading, args)
    },
    dispose: () => {
      controller.dispose()
      service.dispose()
    },
  } as Service
}

/** 给结构化 Dialog 服务的五个打开入口加声音；关闭、prompt 与其余方法保持原样。 */
export function withDialogSoundService<Service extends DialogSoundServicePort>(
  service: Service,
  options: DialogSoundServiceOptions,
): Service {
  const controller = createSoundServiceController({
    ...options,
    defaults: DIALOG_SOUND_DEFAULTS,
  })

  const invoke = <Key extends Exclude<keyof DialogSoundServicePort, 'dispose'>>(
    key: Key,
    args: Parameters<Service[Key]>,
  ): ReturnType<Service[Key]> => {
    controller.play(key)
    return call(service, service[key], args)
  }

  return {
    ...service,
    confirm: (...args: Parameters<Service['confirm']>) => invoke('confirm', args),
    info: (...args: Parameters<Service['info']>) => invoke('info', args),
    success: (...args: Parameters<Service['success']>) => invoke('success', args),
    warning: (...args: Parameters<Service['warning']>) => invoke('warning', args),
    error: (...args: Parameters<Service['error']>) => invoke('error', args),
    dispose: () => {
      controller.dispose()
      service.dispose()
    },
  } as Service
}
