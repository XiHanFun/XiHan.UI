// @vitest-environment jsdom
// 判据按「配了声音的服务与原服务行为完全一致」写：视觉照旧、返回值照旧，
// 只是多出一声；禁用与未装声音包的路径都不许把调用点炸掉。
import type { SoundPlayer, SoundSpec } from '@xihan-ui/sound'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import { createDialogService, createToastService } from '../src'
import { setSoundPlayer, vSound, withDialogSound, withToastSound } from '../src/sound'

interface Recorder extends SoundPlayer {
  played: string[]
  unlocks: number
}

function recorder(): Recorder {
  const played: string[] = []
  const player = {
    played,
    unlocks: 0,
    play: (sound: string | SoundSpec) => {
      played.push(typeof sound === 'string' ? sound : '<spec>')
    },
    unlock: () => {
      player.unlocks++
    },
    setEnabled: () => undefined,
    isEnabled: () => true,
    setVolume: () => undefined,
    setTheme: () => undefined,
    dispose: () => undefined,
  }
  return player
}

async function tick(): Promise<void> {
  await nextTick()
  await nextTick()
  await new Promise(r => setTimeout(r, 0))
  await nextTick()
}

afterEach(() => {
  document.body.innerHTML = ''
})

describe('withToastSound', () => {
  it('四个类型糖各发各的声，视觉照旧', async () => {
    const player = recorder()
    const toast = withToastSound(createToastService(), { player, autoUnlock: false })
    toast.success('已保存')
    toast.error('保存失败')
    toast.warning('注意')
    toast.info('提示')
    await tick()
    expect(player.played).toEqual(['success', 'error', 'warning', 'info'])
    expect(document.body.textContent).toContain('已保存')
    toast.dispose()
  })

  it('loading 不发声，转成 success 时才响', async () => {
    const player = recorder()
    const toast = withToastSound(createToastService(), { player, autoUnlock: false })
    const id = toast.loading('上传中')
    await tick()
    expect(player.played).toEqual([])
    toast.update(id, { type: 'success', title: '上传完成' })
    await tick()
    expect(player.played).toEqual(['success'])
    expect(document.body.textContent).toContain('上传完成')
    toast.dispose()
  })

  it('只改文案不发声', async () => {
    const player = recorder()
    const toast = withToastSound(createToastService(), { player, autoUnlock: false })
    const id = toast.create({ type: 'info', title: '一' })
    await tick()
    toast.update(id, { title: '二' })
    await tick()
    expect(player.played).toEqual(['info'])
    toast.dispose()
  })

  it('create 不给类型时按 info 发声，返回的 id 原样透传', async () => {
    const player = recorder()
    const service = createToastService()
    const toast = withToastSound(service, { player, autoUnlock: false })
    const id = toast.create({ title: '无类型' })
    await tick()
    expect(player.played).toEqual(['info'])
    expect(typeof id).toBe('string')
    toast.dismiss(id)
    await tick()
    expect(player.played).toEqual(['info'])
    toast.dispose()
  })

  it('sounds 可逐项改写，给 null 即这一类静音', async () => {
    const player = recorder()
    const toast = withToastSound(createToastService(), {
      player,
      autoUnlock: false,
      sounds: { success: 'complete', error: null },
    })
    toast.success('好了')
    toast.error('坏了')
    toast.warning('小心')
    await tick()
    expect(player.played).toEqual(['complete', 'warning'])
    toast.dispose()
  })

  it('autoUnlock 在首次手势解锁一次，dispose 后不再监听', async () => {
    const player = recorder()
    const toast = withToastSound(createToastService(), { player })
    document.dispatchEvent(new Event('pointerdown'))
    document.dispatchEvent(new Event('pointerdown'))
    expect(player.unlocks).toBe(1)
    const later = withToastSound(createToastService(), { player })
    later.dispose()
    document.dispatchEvent(new Event('pointerdown'))
    expect(player.unlocks).toBe(1)
    toast.dispose()
  })
})

describe('withDialogSound', () => {
  it('confirm 弹出发 open，四个预设各发各的；收场不发声', async () => {
    const player = recorder()
    const dialog = withDialogSound(createDialogService(), { player, autoUnlock: false })
    const pending = dialog.confirm({ title: '删除？' })
    await tick()
    expect(player.played).toEqual(['open'])
    const buttons = [...document.querySelectorAll('button')]
    buttons.at(-1)!.click()
    await expect(pending).resolves.toBe(true)
    expect(player.played).toEqual(['open'])
    dialog.dispose()
  })

  it('error 预设发 error，resolve 行为不变', async () => {
    const player = recorder()
    const dialog = withDialogSound(createDialogService(), { player, autoUnlock: false })
    const pending = dialog.error({ title: '出错了' })
    await tick()
    expect(player.played).toEqual(['error'])
    ;[...document.querySelectorAll('button')].at(-1)!.click()
    await expect(pending).resolves.toBeUndefined()
    dialog.dispose()
  })
})

describe('v-sound', () => {
  function mount(value: unknown): HTMLButtonElement {
    const el = document.createElement('button')
    document.body.appendChild(el)
    vSound.mounted!(el, { value, oldValue: null, arg: undefined, modifiers: {}, instance: null, dir: vSound } as never, null as never, null as never)
    return el
  }

  it('默认放 click，字符串值即语义名', () => {
    const player = recorder()
    setSoundPlayer(player)
    const plain = mount(undefined)
    plain.click()
    const named = mount('send')
    named.click()
    expect(player.played).toEqual(['click', 'send'])
  })

  it('禁用态不发声', () => {
    const player = recorder()
    setSoundPlayer(player)
    const el = mount('click')
    el.setAttribute('aria-disabled', 'true')
    el.click()
    el.removeAttribute('aria-disabled')
    el.setAttribute('data-disabled', '')
    el.click()
    expect(player.played).toEqual([])
  })

  it('卸载后不再发声', () => {
    const player = recorder()
    setSoundPlayer(player)
    const el = mount('click')
    vSound.unmounted!(el, {} as never, null as never, null as never)
    el.click()
    expect(player.played).toEqual([])
  })
})

describe('共享播放器', () => {
  it('setSoundPlayer 销毁自动建的那个，不销毁外面塞进来的', async () => {
    // 共享播放器是模块级状态，这条判据要从未被设置过的那一刻起看
    vi.resetModules()
    const fresh = await import('../src/sound')
    const auto = fresh.getSoundPlayer()
    const disposeAuto = vi.spyOn(auto, 'dispose')
    const mine = recorder()
    fresh.setSoundPlayer(mine)
    expect(disposeAuto).toHaveBeenCalledTimes(1)
    expect(fresh.getSoundPlayer()).toBe(mine)
    const disposeMine = vi.spyOn(mine, 'dispose')
    fresh.setSoundPlayer(recorder())
    expect(disposeMine).not.toHaveBeenCalled()
  })
})
