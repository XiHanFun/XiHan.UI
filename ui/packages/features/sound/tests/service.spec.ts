import type { PlayOptions, SoundPlayer, SoundSpec } from '../src'
import { describe, expect, it, vi } from 'vitest'
import { createSharedSoundPlayerController, createSoundServiceController, withDialogSoundService, withToastSoundService } from '../src'

interface Recorder extends SoundPlayer {
  played: string[]
  unlocks: number
}

function recorder(): Recorder {
  const player: Recorder = {
    played: [],
    unlocks: 0,
    play: (sound: string | SoundSpec, _options?: PlayOptions) => {
      player.played.push(typeof sound === 'string' ? sound : '<spec>')
    },
    unlock: () => player.unlocks++,
    setEnabled: () => undefined,
    isEnabled: () => true,
    setVolume: () => undefined,
    setTheme: () => undefined,
    dispose: () => undefined,
  }
  return player
}

describe('共享声音播放器控制器', () => {
  it('惰性创建且只销毁自己创建的旧播放器', () => {
    const own = recorder()
    const disposeOwn = vi.spyOn(own, 'dispose')
    const create = vi.fn(() => own)
    const shared = createSharedSoundPlayerController(create)
    expect(create).not.toHaveBeenCalled()
    expect(shared.getPlayer()).toBe(own)
    expect(shared.getPlayer()).toBe(own)
    expect(create).toHaveBeenCalledTimes(1)

    const external = recorder()
    shared.setPlayer(external)
    expect(disposeOwn).toHaveBeenCalledTimes(1)
    const disposeExternal = vi.spyOn(external, 'dispose')
    shared.setPlayer(recorder())
    expect(disposeExternal).not.toHaveBeenCalled()
  })
})

describe('业务语义声音控制器', () => {
  it('合并覆盖、保留 null 静音，并通过端口接线解锁与清理', () => {
    const player = recorder()
    let unlock!: () => void
    const detached = vi.fn()
    const attachUnlock = vi.fn((next: () => void) => {
      unlock = next
      return detached
    })
    const controller = createSoundServiceController({
      player,
      defaults: { open: 'open', quiet: null },
      sounds: { open: 'custom', quiet: 'tap' },
      attachUnlock,
    })

    expect(attachUnlock).toHaveBeenCalledTimes(1)
    unlock()
    expect(player.unlocks).toBe(1)
    controller.play('open')
    controller.play('quiet')
    expect(player.played).toEqual(['custom', 'tap'])
    controller.dispose()
    expect(detached).toHaveBeenCalledTimes(1)
  })

  it('autoUnlock=false 不请求宿主建立解锁事件', () => {
    const attachUnlock = vi.fn(() => () => undefined)
    createSoundServiceController({
      player: recorder(),
      defaults: { info: 'info' },
      autoUnlock: false,
      attachUnlock,
    }).dispose()
    expect(attachUnlock).not.toHaveBeenCalled()
  })
})

describe('toast 声音服务装饰器', () => {
  it('保持调用与返回值，只按 create/update/类型糖的既有语义发声', () => {
    const calls: string[] = []
    let seq = 0
    const service = {
      marker: 'toast',
      create: (options?: { type?: 'info' | 'success' | 'warning' | 'error' | 'loading', title?: string }) => {
        calls.push(`create:${options?.type ?? 'none'}`)
        return `id-${++seq}`
      },
      update: (id: string, options: { type?: 'info' | 'success' | 'warning' | 'error' | 'loading', title?: string }) => {
        calls.push(`update:${id}:${options.type ?? 'none'}`)
      },
      info: (message: string) => {
        calls.push(`info:${message}`)
        return `id-${++seq}`
      },
      success: (message: string) => {
        calls.push(`success:${message}`)
        return `id-${++seq}`
      },
      warning: (message: string) => {
        calls.push(`warning:${message}`)
        return `id-${++seq}`
      },
      error: (message: string) => {
        calls.push(`error:${message}`)
        return `id-${++seq}`
      },
      loading: (message: string) => {
        calls.push(`loading:${message}`)
        return `id-${++seq}`
      },
      dispose: () => calls.push('service.dispose'),
    }
    const player = recorder()
    const decorated = withToastSoundService(service, { player, autoUnlock: false })

    expect(decorated.marker).toBe('toast')
    expect(decorated.create({ title: '默认' })).toBe('id-1')
    const loading = decorated.loading('上传中')
    decorated.update(loading, { title: '只改文案' })
    decorated.update(loading, { type: 'success' })
    expect(decorated.error('失败')).toBe('id-3')
    expect(player.played).toEqual(['info', 'success', 'error'])
    expect(calls).toEqual([
      'create:none',
      'loading:上传中',
      'update:id-2:none',
      'update:id-2:success',
      'error:失败',
    ])
  })

  it('声音覆盖与 dispose 顺序由核心统一持有', () => {
    const order: string[] = []
    const player = recorder()
    const service = {
      create: () => 'id',
      update: () => undefined,
      info: () => 'id',
      success: () => 'id',
      warning: () => 'id',
      error: () => 'id',
      loading: () => 'id',
      dispose: () => order.push('service'),
    }
    const decorated = withToastSoundService(service, {
      player,
      sounds: { success: 'complete', error: null },
      attachUnlock: () => () => order.push('unlock'),
    })
    decorated.success()
    decorated.error()
    expect(player.played).toEqual(['complete'])
    decorated.dispose()
    expect(order).toEqual(['unlock', 'service'])
  })
})

describe('dialog 声音服务装饰器', () => {
  it('只装饰五个打开入口，保留 Promise 与未装饰方法', async () => {
    const player = recorder()
    const prompt = vi.fn(async () => ({ name: 'xihan' }))
    const service = {
      confirm: async (value: string) => value === 'yes',
      info: async () => undefined,
      success: async () => undefined,
      warning: async () => undefined,
      error: async () => undefined,
      prompt,
      dispose: () => undefined,
    }
    const decorated = withDialogSoundService(service, { player, autoUnlock: false })

    await expect(decorated.confirm('yes')).resolves.toBe(true)
    await decorated.info()
    await decorated.success()
    await decorated.warning()
    await decorated.error()
    await expect(decorated.prompt()).resolves.toEqual({ name: 'xihan' })
    expect(prompt).toHaveBeenCalledTimes(1)
    expect(player.played).toEqual(['open', 'info', 'success', 'warning', 'error'])
  })
})
