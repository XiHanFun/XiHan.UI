// @vitest-environment jsdom
//
// 判据按「配了声音的服务与原服务行为完全一致」写：视觉照旧、返回值照旧，
// 只是多出一声。被测的是包装层的接线，播放器用一个记录调用的假的；
// 「关掉声音时不发」那一条走真播放器，从诊断通道上看它有没有真的被穿到。
import type { PlayOptions, SoundPlayer, SoundSpec } from '@xihan-ui/sound'
import type { ReactNode } from 'react'
import type { SoundPressValue } from '../src/sound'
import { onDiagnostic, resetDiagnostics, setDiagnosticsConsoleOutput, setDiagnosticsDedupe, setDiagnosticsLevel } from '@xihan-ui/core'
import { createSoundPlayer } from '@xihan-ui/sound'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createDialogService, createToastService, XhButton } from '../src'
import { setSoundPlayer, useSoundOnPress, withDialogSound, withToastSound } from '../src/sound'

interface Recorder extends SoundPlayer {
  /** 收到的语义名，按调用先后。 */
  played: string[]
  /** 每次播放带的音量系数，没带记 undefined。 */
  volumes: Array<number | undefined>
  unlocks: number
}

function recorder(): Recorder {
  const played: string[] = []
  const volumes: Array<number | undefined> = []
  const player: Recorder = {
    played,
    volumes,
    unlocks: 0,
    play: (sound: string | SoundSpec, options?: PlayOptions) => {
      played.push(typeof sound === 'string' ? sound : '<spec>')
      volumes.push(options?.volume)
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

const globals = globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }

const cleanups: Array<() => void | Promise<void>> = []

beforeEach(() => {
  globals.IS_REACT_ACT_ENVIRONMENT = true
})

afterEach(async () => {
  for (const fn of cleanups.splice(0).reverse()) await fn()
  document.body.innerHTML = ''
  resetDiagnostics()
  vi.useRealTimers()
})

/** 服务的宿主树在 React 之外，推一拍让它把这次状态渲出来。 */
async function settle(): Promise<void> {
  await act(async () => {
    await Promise.resolve()
  })
}

interface View {
  rerender: (next: ReactNode) => Promise<void>
  unmount: () => Promise<void>
}

async function mount(node: ReactNode): Promise<View> {
  const host = document.createElement('div')
  document.body.append(host)
  const root = createRoot(host)
  await act(async () => root.render(node))
  let live = true
  const unmount = async (): Promise<void> => {
    if (!live)
      return
    live = false
    await act(async () => root.unmount())
    host.remove()
  }
  cleanups.push(() => void unmount())
  return {
    rerender: async next => act(async () => root.render(next)),
    unmount,
  }
}

function Pressable(props: { value?: SoundPressValue, label?: string }): ReactNode {
  return (
    <button type="button" ref={useSoundOnPress(props.value)}>
      {props.label ?? '按'}
    </button>
  )
}

const pressable = (): HTMLButtonElement => document.querySelector('button')!

describe('withToastSound', () => {
  it('四个类型糖各发各的声，视觉照旧', async () => {
    const player = recorder()
    const toast = withToastSound(createToastService(), { player, autoUnlock: false })
    cleanups.push(() => toast.dispose())
    toast.success('已保存')
    toast.error('保存失败')
    toast.warning('注意')
    toast.info('提示')
    await settle()
    expect(player.played).toEqual(['success', 'error', 'warning', 'info'])
    expect(document.body.textContent).toContain('已保存')
  })

  it('loading 不发声，转成 success 时才响', async () => {
    const player = recorder()
    const toast = withToastSound(createToastService(), { player, autoUnlock: false })
    cleanups.push(() => toast.dispose())
    const id = toast.loading('上传中')
    await settle()
    expect(player.played).toEqual([])
    toast.update(id, { type: 'success', title: '上传完成' })
    await settle()
    expect(player.played).toEqual(['success'])
    expect(document.body.textContent).toContain('上传完成')
  })

  it('只改文案不发声', async () => {
    const player = recorder()
    const toast = withToastSound(createToastService(), { player, autoUnlock: false })
    cleanups.push(() => toast.dispose())
    const id = toast.create({ type: 'info', title: '一' })
    await settle()
    toast.update(id, { title: '二' })
    await settle()
    expect(player.played).toEqual(['info'])
  })

  it('create 不给类型时按 info 发声，返回的 id 原样透传', async () => {
    const player = recorder()
    const toast = withToastSound(createToastService(), { player, autoUnlock: false })
    cleanups.push(() => toast.dispose())
    const id = toast.create({ title: '无类型' })
    await settle()
    expect(player.played).toEqual(['info'])
    expect(typeof id).toBe('string')
    expect(id).not.toBe('')
    toast.dismiss(id)
    await settle()
    // 关掉不发声
    expect(player.played).toEqual(['info'])
    expect(document.body.textContent).not.toContain('无类型')
  })

  it('行内动作的回调照原样透传', async () => {
    const player = recorder()
    const onAction = vi.fn()
    const toast = withToastSound(createToastService(), { player, autoUnlock: false })
    cleanups.push(() => toast.dispose())
    toast.create({ type: 'info', title: '已删除', actionLabel: '撤销', onAction })
    await settle()
    const trigger = document.querySelector<HTMLElement>('[data-scope="toast"][data-part="action-trigger"]')
    expect(trigger).not.toBeNull()
    await act(async () => trigger!.click())
    expect(onAction).toHaveBeenCalledTimes(1)
  })

  it('sounds 可逐项改写，给 null 即这一类静音', async () => {
    const player = recorder()
    const toast = withToastSound(createToastService(), {
      player,
      autoUnlock: false,
      sounds: { success: 'complete', error: null },
    })
    cleanups.push(() => toast.dispose())
    toast.success('好了')
    toast.error('坏了')
    toast.warning('小心')
    await settle()
    expect(player.played).toEqual(['complete', 'warning'])
    // 静音的那一类视觉照旧
    expect(document.body.textContent).toContain('坏了')
  })

  it('autoUnlock 在首次手势解锁一次，dispose 后不再监听', async () => {
    const player = recorder()
    const toast = withToastSound(createToastService(), { player })
    cleanups.push(() => toast.dispose())
    document.dispatchEvent(new Event('pointerdown'))
    document.dispatchEvent(new Event('pointerdown'))
    expect(player.unlocks).toBe(1)

    const later = withToastSound(createToastService(), { player })
    later.dispose()
    document.dispatchEvent(new Event('pointerdown'))
    expect(player.unlocks).toBe(1)
  })
})

describe('withDialogSound', () => {
  it('confirm 弹出发 open，收场不发声，resolve 值不变', async () => {
    const player = recorder()
    const dialog = withDialogSound(createDialogService(), { player, autoUnlock: false })
    cleanups.push(() => dialog.dispose())
    const pending = dialog.confirm({ title: '删除？' })
    await settle()
    expect(player.played).toEqual(['open'])
    const buttons = [...document.querySelectorAll<HTMLButtonElement>('[data-scope="dialog"][data-part="content"] [data-scope="button"][data-part="root"]')]
    await act(async () => buttons.at(-1)!.click())
    await expect(pending).resolves.toBe(true)
    expect(player.played).toEqual(['open'])
  })

  it('四个预设各发各的声', async () => {
    const player = recorder()
    const dialog = withDialogSound(createDialogService(), { player, autoUnlock: false })
    cleanups.push(() => dialog.dispose())
    void dialog.info({ title: '一' })
    void dialog.success({ title: '二' })
    void dialog.warning({ title: '三' })
    void dialog.error({ title: '四' })
    await settle()
    expect(player.played).toEqual(['info', 'success', 'warning', 'error'])
  })

  it('sounds 可逐项改写，给 null 即这一档静音', async () => {
    const player = recorder()
    const dialog = withDialogSound(createDialogService(), {
      player,
      autoUnlock: false,
      sounds: { confirm: null, error: 'boom' },
    })
    cleanups.push(() => dialog.dispose())
    void dialog.confirm({ title: '删除？' })
    void dialog.error({ title: '出错了' })
    await settle()
    expect(player.played).toEqual(['boom'])
    // 静音的那一档照样弹出来
    expect(document.querySelector('[data-scope="dialog"][data-part="title"]')?.textContent).toBe('删除？')
  })
})

describe('useSoundOnPress', () => {
  it('默认放 click，字符串值即语义名，volume 透传', async () => {
    const player = recorder()
    setSoundPlayer(player)
    const first = await mount(<Pressable />)
    pressable().click()
    expect(player.played).toEqual(['click'])
    expect(player.volumes).toEqual([undefined])
    await first.unmount()

    const second = await mount(<Pressable value="send" />)
    pressable().click()
    expect(player.played).toEqual(['click', 'send'])
    await second.unmount()

    await mount(<Pressable value={{ sound: 'toggle-on', volume: 0.6 }} />)
    pressable().click()
    expect(player.played).toEqual(['click', 'send', 'toggle-on'])
    expect(player.volumes.at(-1)).toBe(0.6)
  })

  it('禁用态不发声', async () => {
    const player = recorder()
    setSoundPlayer(player)
    await mount(<Pressable value="click" />)
    const el = pressable()
    el.setAttribute('aria-disabled', 'true')
    el.click()
    el.removeAttribute('aria-disabled')
    el.setAttribute('data-disabled', '')
    el.click()
    expect(player.played).toEqual([])
    el.removeAttribute('data-disabled')
    el.click()
    expect(player.played).toEqual(['click'])
  })

  it('卸载后不再发声', async () => {
    const player = recorder()
    setSoundPlayer(player)
    const view = await mount(<Pressable value="click" />)
    const el = pressable()
    await view.unmount()
    el.click()
    expect(player.played).toEqual([])
  })

  it('改了值不重绑也走新值，元素没换过', async () => {
    const player = recorder()
    setSoundPlayer(player)
    const view = await mount(<Pressable value="one" />)
    const first = pressable()
    first.click()
    await view.rerender(<Pressable value="two" />)
    expect(pressable()).toBe(first)
    pressable().click()
    expect(player.played).toEqual(['one', 'two'])
  })

  it('挂到组件转发出来的 ref 上照样发声，卸载后解绑', async () => {
    const player = recorder()
    setSoundPlayer(player)

    function SoundButton(): ReactNode {
      return <XhButton ref={useSoundOnPress('send')}>发送</XhButton>
    }

    const view = await mount(<SoundButton />)
    const el = document.querySelector<HTMLElement>('[data-scope="button"][data-part="root"]')!
    el.click()
    expect(player.played).toEqual(['send'])
    await view.unmount()
    el.click()
    expect(player.played).toEqual(['send'])
  })

  it('setSoundPlayer 换实现后按下走新的那个', async () => {
    const before = recorder()
    setSoundPlayer(before)
    await mount(<Pressable value="click" />)
    pressable().click()
    expect(before.played).toEqual(['click'])

    const after = recorder()
    setSoundPlayer(after)
    pressable().click()
    expect(before.played).toEqual(['click'])
    expect(after.played).toEqual(['click'])
  })
})

describe('共享播放器', () => {
  it('包服务时取的是当时的共享播放器，之后换实现不改已包好的那个', async () => {
    const before = recorder()
    setSoundPlayer(before)
    const early = withToastSound(createToastService(), { autoUnlock: false })
    cleanups.push(() => early.dispose())

    const after = recorder()
    setSoundPlayer(after)
    const late = withToastSound(createToastService(), { autoUnlock: false })
    cleanups.push(() => late.dispose())

    early.info('旧的')
    late.info('新的')
    await settle()
    expect(before.played).toEqual(['info'])
    expect(after.played).toEqual(['info'])
  })

  it('setSoundPlayer 销毁自动建的那个，不销毁外面塞进来的', async () => {
    // 共享播放器是模块级状态，这条判据要从未被设置过的那一刻起看
    vi.resetModules()
    const fresh = await import('../src/sound')
    const auto = fresh.getSoundPlayer()
    expect(fresh.getSoundPlayer()).toBe(auto)
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

describe('关掉声音', () => {
  // 这一条不用假播放器：真播放器在 play 的第一行就按开关早退，
  // 而它取不到主题里的名字时会往诊断通道报一条——那条报文就是「命令真的穿到了播放器」的凭据。
  it('播放器关掉之后，服务的命令不再穿到播放器', async () => {
    setDiagnosticsLevel('warn')
    setDiagnosticsDedupe(false)
    setDiagnosticsConsoleOutput(false)
    const reports: string[] = []
    cleanups.push(onDiagnostic(record => void reports.push(record.message)))

    const player = createSoundPlayer()
    cleanups.push(() => player.dispose())
    const toast = withToastSound(createToastService(), {
      player,
      autoUnlock: false,
      // 主题里没有这个名字：播放器一旦走到取配方那一步就会报一条
      sounds: { info: '主题里没有的名字' },
    })
    cleanups.push(() => toast.dispose())

    toast.info('开着')
    await settle()
    expect(reports).toHaveLength(1)

    player.setEnabled(false)
    toast.info('关了')
    await settle()
    expect(reports).toHaveLength(1)

    player.setEnabled(true)
    toast.info('又开了')
    await settle()
    expect(reports).toHaveLength(2)
  })

  it('播放器关掉之后，按下也不穿到播放器', async () => {
    setDiagnosticsLevel('warn')
    setDiagnosticsDedupe(false)
    setDiagnosticsConsoleOutput(false)
    const reports: string[] = []
    cleanups.push(onDiagnostic(record => void reports.push(record.message)))

    const player = createSoundPlayer()
    cleanups.push(() => player.dispose())
    setSoundPlayer(player)
    await mount(<Pressable value="主题里没有的名字" />)

    pressable().click()
    expect(reports).toHaveLength(1)

    player.setEnabled(false)
    pressable().click()
    expect(reports).toHaveLength(1)
  })
})
