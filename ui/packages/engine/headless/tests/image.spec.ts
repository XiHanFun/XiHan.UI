import type { ImageSchema, ImageStatusChangeDetails } from '../src/image'
import { createService, normalizeProps } from '@xihan-ui/core'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'
import { afterEach, describe, expect, it, vi } from 'vitest'
// 直接指到组件目录：包主入口的导出由接线一并补，测试不等它
import { connectImage, imageMachine, resolveFallbackDelay } from '../src/image'

type Props = ImageSchema['props']
type Dict = Record<string, unknown>

afterEach(() => {
  vi.useRealTimers()
})

function makeImage(initial: Props = {}) {
  const runtime = createVanillaRuntime()
  // props 走 signal 而不是裸对象：改 src 要真的惊动 watch，才验得到"换图重走一轮"这一路
  const props = runtime.signal<Props>(initial)
  const service = createService(imageMachine, { props: () => props.get(), runtime })
  runtime.start()
  return {
    service,
    state: () => service.state.get(),
    setProps: (next: Props) => props.set({ ...props.get(), ...next }),
    api: () => connectImage(service, normalizeProps),
  }
}

/** 来源决议推迟到宿主提交一帧之后（flush = queueMicrotask），等一拍微任务它才落地。 */
async function settleSrc(): Promise<void> {
  await Promise.resolve()
  await Promise.resolve()
}

describe('resolveFallbackDelay', () => {
  it('缺省与非正数都是 0：加载期间回退内容立刻露面', () => {
    expect(resolveFallbackDelay(undefined)).toBe(0)
    expect(resolveFallbackDelay(0)).toBe(0)
    expect(resolveFallbackDelay(-100)).toBe(0)
    // NaN 不该被当成一个"很大的延迟"把回退内容永远压着
    expect(resolveFallbackDelay(Number.NaN)).toBe(0)
  })

  it('正数原样返回；Infinity 表示加载期间永不露面', () => {
    expect(resolveFallbackDelay(200)).toBe(200)
    expect(resolveFallbackDelay(Number.POSITIVE_INFINITY)).toBe(Number.POSITIVE_INFINITY)
  })
})

describe('imageMachine 状态转移', () => {
  it('首帧停在 idle，来源决议要等宿主提交一帧', async () => {
    const s = makeImage({ src: 'a.png' })
    // 进入初始状态那一刻转移还没走完，此时 send 会被丢在半路
    expect(s.state()).toBe('idle')

    await settleSrc()
    expect(s.state()).toBe('loading')
  })

  it('没有 src 直接落 error：只剩回退内容可看', async () => {
    const s = makeImage()
    await settleSrc()
    expect(s.state()).toBe('error')

    // 空串同样算"没有来源"
    const empty = makeImage({ src: '' })
    await settleSrc()
    expect(empty.state()).toBe('error')
  })

  it('load / error 事件决定落点', async () => {
    const ok = makeImage({ src: 'a.png' })
    await settleSrc()
    ok.service.send({ type: 'IMAGE.LOAD' })
    expect(ok.state()).toBe('loaded')

    const bad = makeImage({ src: 'a.png' })
    await settleSrc()
    bad.service.send({ type: 'IMAGE.ERROR' })
    expect(bad.state()).toBe('error')
  })

  it('决议落地前就已就绪（缓存命中）的图片不丢事件', () => {
    const s = makeImage({ src: 'a.png' })
    // 还停在 idle 就把 load 送进来，仍要接住
    s.service.send({ type: 'IMAGE.LOAD' })
    expect(s.state()).toBe('loaded')
  })

  it('换 src 重走一轮：从 loaded 回到 loading', async () => {
    const s = makeImage({ src: 'a.png' })
    await settleSrc()
    s.service.send({ type: 'IMAGE.LOAD' })
    expect(s.state()).toBe('loaded')

    s.setProps({ src: 'b.png' })
    expect(s.state()).toBe('loading')
  })

  it('src 没真变就不重来，也不重复通知', async () => {
    const onStatusChange = vi.fn<(d: ImageStatusChangeDetails) => void>()
    const s = makeImage({ src: 'a.png', onStatusChange })
    await settleSrc()
    s.service.send({ type: 'IMAGE.LOAD' })
    expect(onStatusChange.mock.calls.map(c => c[0].status)).toEqual(['loading', 'loaded'])

    s.setProps({ src: 'a.png' })
    expect(s.state()).toBe('loaded')
    expect(onStatusChange).toHaveBeenCalledTimes(2)
  })

  it('状态每次落位通知一次，过渡态 idle 不通知', async () => {
    const seen: ImageStatusChangeDetails[] = []
    const s = makeImage({ src: 'a.png', onStatusChange: d => seen.push(d) })
    // 挂载那一刻还在 idle，通知它等于开局就骚扰宿主一次
    expect(seen).toEqual([])

    await settleSrc()
    s.service.send({ type: 'IMAGE.ERROR' })
    expect(seen).toEqual([{ status: 'loading' }, { status: 'error' }])
  })
})

describe('image 回退延迟', () => {
  it('没给延迟：加载期间回退内容立刻在台前', async () => {
    const s = makeImage({ src: 'a.png' })
    await settleSrc()
    expect(s.state()).toBe('loading')
    expect(s.api().showFallback).toBe(true)
  })

  it('给了延迟：门槛内先空着，到点才让回退内容顶上', async () => {
    vi.useFakeTimers()
    const s = makeImage({ src: 'a.png', fallbackDelay: 200 })
    await vi.advanceTimersByTimeAsync(0)
    expect(s.state()).toBe('loading')
    // 快图（缓存命中）在这一段里就到了，回退内容一次都不会闪
    expect(s.api().showFallback).toBe(false)

    vi.advanceTimersByTime(199)
    expect(s.api().showFallback).toBe(false)
    vi.advanceTimersByTime(1)
    expect(s.api().showFallback).toBe(true)
  })

  it('给了延迟时连 idle 那一拍也不露面：否则闪一下的正是它', () => {
    const s = makeImage({ src: 'a.png', fallbackDelay: 200 })
    expect(s.state()).toBe('idle')
    expect(s.api().showFallback).toBe(false)
  })

  it('图片在门槛内到位：计时器随 loading 退出一并撤掉，回退内容不会迟到冒出来', async () => {
    vi.useFakeTimers()
    const s = makeImage({ src: 'a.png', fallbackDelay: 200 })
    await vi.advanceTimersByTimeAsync(0)
    s.service.send({ type: 'IMAGE.LOAD' })
    expect(s.state()).toBe('loaded')

    vi.advanceTimersByTime(1000)
    expect(s.api().showFallback).toBe(false)
  })

  it('加载失败不受延迟约束：回退内容立刻顶上', async () => {
    vi.useFakeTimers()
    const s = makeImage({ src: 'a.png', fallbackDelay: 200 })
    await vi.advanceTimersByTimeAsync(0)
    s.service.send({ type: 'IMAGE.ERROR' })
    // 图已经没了，还压着回退内容等门槛就是一片空白
    expect(s.api().showFallback).toBe(true)
  })

  it('换图重来时把上一轮翻开的回退内容按回去', async () => {
    vi.useFakeTimers()
    const s = makeImage({ src: 'a.png', fallbackDelay: 200 })
    await vi.advanceTimersByTimeAsync(0)
    vi.advanceTimersByTime(200)
    expect(s.api().showFallback).toBe(true)

    s.setProps({ src: 'b.png' })
    expect(s.state()).toBe('loading')
    // 不重置的话新图的延迟窗口白给了：换一张图就一定先闪一下回退内容
    expect(s.api().showFallback).toBe(false)

    vi.advanceTimersByTime(200)
    expect(s.api().showFallback).toBe(true)
  })

  it('门槛还没走完就换图：旧计时器要撤掉，新窗口从头算', async () => {
    vi.useFakeTimers()
    const s = makeImage({ src: 'a.png', fallbackDelay: 200 })
    await vi.advanceTimersByTimeAsync(0)
    vi.advanceTimersByTime(100)
    expect(s.api().showFallback).toBe(false)

    s.setProps({ src: 'b.png' })
    // 旧计时器还在的话，这一刻（旧窗口的第 200ms）就会把回退内容翻开，
    // 而新图才刚开始加载 100ms，门槛远没到
    vi.advanceTimersByTime(100)
    expect(s.api().showFallback).toBe(false)

    vi.advanceTimersByTime(100)
    expect(s.api().showFallback).toBe(true)
  })

  it('fallbackDelay=Infinity：加载期间永不露面，失败才露', async () => {
    vi.useFakeTimers()
    const s = makeImage({ src: 'a.png', fallbackDelay: Number.POSITIVE_INFINITY })
    await vi.advanceTimersByTimeAsync(0)
    vi.advanceTimersByTime(60_000)
    expect(s.state()).toBe('loading')
    expect(s.api().showFallback).toBe(false)

    s.service.send({ type: 'IMAGE.ERROR' })
    expect(s.api().showFallback).toBe(true)
  })
})

describe('connectImage 结构与显隐', () => {
  it('root 带 anatomy 标记与状态位', async () => {
    const s = makeImage({ src: 'a.png' })
    await settleSrc()
    const root = s.api().getRootProps() as Dict
    expect(root['data-scope']).toBe('image')
    expect(root['data-part']).toBe('root')
    expect(root['data-state']).toBe('loading')
  })

  it('image 落 src / alt，并把 load / error 接回机器', async () => {
    const s = makeImage({ src: 'a.png', alt: '一张图' })
    await settleSrc()
    const image = s.api().getImageProps() as Dict
    expect(image.src).toBe('a.png')
    expect(image.alt).toBe('一张图')
    // 语义交给原生 img，不自己编 role
    expect(image.role).toBeUndefined()

    ;(image.onError as () => void)()
    expect(s.state()).toBe('error')
  })

  it('image 只在 loaded 时显出，其余一律收起', async () => {
    const s = makeImage({ src: 'a.png' })
    await settleSrc()
    expect((s.api().getImageProps() as Dict).hidden).toBe(true)

    s.service.send({ type: 'IMAGE.LOAD' })
    expect((s.api().getImageProps() as Dict).hidden).toBeUndefined()
  })

  it('fallback 的显隐跟着 showFallback 走，节点始终不卸载', async () => {
    vi.useFakeTimers()
    const s = makeImage({ src: 'a.png', fallbackDelay: 200 })
    await vi.advanceTimersByTimeAsync(0)
    expect((s.api().getFallbackProps() as Dict).hidden).toBe(true)

    vi.advanceTimersByTime(200)
    expect((s.api().getFallbackProps() as Dict).hidden).toBeUndefined()

    s.service.send({ type: 'IMAGE.LOAD' })
    expect((s.api().getFallbackProps() as Dict).hidden).toBe(true)
  })

  it('三个部件都带同一个 data-state', async () => {
    const s = makeImage({ src: 'a.png' })
    await settleSrc()
    s.service.send({ type: 'IMAGE.LOAD' })
    const api = s.api()
    expect((api.getRootProps() as Dict)['data-state']).toBe('loaded')
    expect((api.getImageProps() as Dict)['data-state']).toBe('loaded')
    expect((api.getFallbackProps() as Dict)['data-state']).toBe('loaded')
    expect(api.loaded).toBe(true)
  })
})
