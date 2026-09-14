import type { AvatarSchema, AvatarStatusChangeDetails } from '../src/avatar'
import { createService, normalizeProps } from '@xihan-ui/core'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'
import { describe, expect, it } from 'vitest'
import { avatarMachine, connectAvatar } from '../src/avatar'

type Props = AvatarSchema['props']

// 来源决议挂在 flush 里，等运行时冲一次才落状态
const settle = (): Promise<void> => new Promise(resolve => setTimeout(resolve, 0))

function makeAvatar(initial: Props = {}) {
  const changes: AvatarStatusChangeDetails[] = []
  const runtime = createVanillaRuntime()
  const props = runtime.signal<Props>({ ...initial, onStatusChange: d => changes.push(d) })
  const service = createService(avatarMachine, { props: () => props.get(), runtime })
  runtime.start()
  return {
    service,
    changes,
    state: () => service.state.get(),
    api: () => connectAvatar(service, normalizeProps),
    image: () => connectAvatar(service, normalizeProps).getImageProps() as Record<string, unknown>,
    fallback: () => connectAvatar(service, normalizeProps).getFallbackProps() as Record<string, unknown>,
    setProps: (next: Props) => props.set({ ...props.get(), ...next }),
    stop: () => runtime.stop(),
  }
}

describe('avatarMachine 来源决议', () => {
  it('给了 src：挂上后进 loading 并通知，图片藏着、兜底露着；onload 进 loaded 换过来', async () => {
    const a = makeAvatar({ src: '/a.png', alt: '曦寒' })
    await settle()
    expect(a.state()).toBe('loading')
    expect(a.changes).toEqual([{ status: 'loading' }])
    expect(a.image()).toMatchObject({ 'src': '/a.png', 'alt': '曦寒', 'hidden': true, 'data-state': 'loading' })
    expect(a.fallback().hidden).toBeUndefined()
    expect(a.api().loaded).toBe(false)

    ;(a.image().onLoad as () => void)()
    expect(a.state()).toBe('loaded')
    expect(a.api().loaded).toBe(true)
    expect(a.image().hidden).toBeUndefined()
    expect(a.fallback()).toMatchObject({ 'hidden': true, 'data-state': 'loaded' })
    expect(a.changes).toEqual([{ status: 'loading' }, { status: 'loaded' }])
    a.stop()
  })

  it('没给 src：挂上后直接进 error，只显示兜底', async () => {
    const a = makeAvatar()
    await settle()
    expect(a.state()).toBe('error')
    expect(a.changes).toEqual([{ status: 'error' }])
    expect(a.image().hidden).toBe(true)
    expect(a.fallback().hidden).toBeUndefined()
    a.stop()
  })

  it('加载失败进 error；之后换一个 src 重新进 loading', async () => {
    const a = makeAvatar({ src: '/broken.png' })
    await settle()
    ;(a.image().onError as () => void)()
    expect(a.state()).toBe('error')
    a.setProps({ src: '/next.png' })
    expect(a.state()).toBe('loading')
    expect(a.changes.map(c => c.status)).toEqual(['loading', 'error', 'loading'])
    a.stop()
  })

  it('已加载后把 src 清掉，退回 error 露兜底', async () => {
    const a = makeAvatar({ src: '/a.png' })
    await settle()
    ;(a.image().onLoad as () => void)()
    a.setProps({ src: undefined })
    expect(a.state()).toBe('error')
    expect(a.fallback().hidden).toBeUndefined()
    a.stop()
  })
})

describe('connectAvatar 投影', () => {
  it('根落状态与两轴，缺省档不写属性', async () => {
    const a = makeAvatar({ src: '/a.png', size: 'lg', tone: 'brand' })
    await settle()
    expect(a.api().getRootProps()).toMatchObject({ 'data-state': 'loading', 'data-size': 'lg', 'data-tone': 'brand' })
    const bare = makeAvatar()
    expect((bare.api().getRootProps() as Record<string, unknown>)['data-size']).toBeUndefined()
    a.stop()
    bare.stop()
  })
})
