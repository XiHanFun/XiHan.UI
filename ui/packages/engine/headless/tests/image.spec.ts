// @vitest-environment jsdom
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
    // 图片载好：回退内容先淡出（与图片交叉），播完才藏起；jsdom 里没有可等的动画，宿主提交之后即刻藏起
    expect((s.api().getFallbackProps() as Dict).hidden).toBeUndefined()
    await vi.advanceTimersByTimeAsync(0)
    expect((s.api().getFallbackProps() as Dict).hidden).toBe(true)
  })

  it('占位层撤下时先淡出、播完才藏起：图片载好或失败都一样', async () => {
    const s = makeImage({ src: 'a.png' })
    await settleSrc()
    expect((s.api().getPlaceholderProps() as Dict).hidden).toBeUndefined()
    s.service.send({ type: 'IMAGE.LOAD' })
    expect((s.api().getPlaceholderProps() as Dict)['data-state']).toBe('loaded')
    expect((s.api().getPlaceholderProps() as Dict).hidden).toBeUndefined()
    await settleSrc()
    expect((s.api().getPlaceholderProps() as Dict).hidden).toBe(true)
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

describe('image 铺法', () => {
  it('写了 fit 才落 data-fit：没写时交给皮肤的 --xh-image-fit', async () => {
    const plain = makeImage({ src: 'a.png' })
    await settleSrc()
    expect((plain.api().getImageProps() as Dict)['data-fit']).toBeUndefined()

    const contain = makeImage({ src: 'a.png', fit: 'contain' })
    await settleSrc()
    expect((contain.api().getImageProps() as Dict)['data-fit']).toBe('contain')

    contain.setProps({ fit: 'scale-down' })
    expect((contain.api().getImageProps() as Dict)['data-fit']).toBe('scale-down')
  })
})

describe('image 懒加载', () => {
  it('没开懒加载：不写 loading，图片载好之前收着', async () => {
    const s = makeImage({ src: 'a.png' })
    await settleSrc()
    const image = s.api().getImageProps() as Dict
    expect(image.loading).toBeUndefined()
    expect(image.hidden).toBe(true)
  })

  it('开了懒加载：交给原生 loading="lazy"，等着取图期间不收起，否则浏览器永远不会去取', async () => {
    const s = makeImage({ src: 'a.png', lazy: true })
    // 来源决议前那一拍也不能收：收起的图片连观察都不会被观察
    expect((s.api().getImageProps() as Dict).hidden).toBeUndefined()
    await settleSrc()
    expect(s.state()).toBe('loading')
    const image = s.api().getImageProps() as Dict
    expect(image.loading).toBe('lazy')
    expect(image.hidden).toBeUndefined()
    // loading 排在 src 之前：先说好延后，再给地址
    const keys = Object.keys(image)
    expect(keys.indexOf('loading')).toBeLessThan(keys.indexOf('src'))
    // 占位与回退照常顶着图位
    expect(s.api().showPlaceholder).toBe(true)
    expect(s.api().showFallback).toBe(true)
  })

  it('懒加载的图取不到：照样收起，回退内容顶上', async () => {
    const s = makeImage({ src: 'a.png', lazy: true })
    await settleSrc()
    s.service.send({ type: 'IMAGE.ERROR' })
    expect((s.api().getImageProps() as Dict).hidden).toBe(true)
    expect(s.api().showFallback).toBe(true)
  })

  it('懒加载的图载好：显出', async () => {
    const s = makeImage({ src: 'a.png', lazy: true })
    await settleSrc()
    s.service.send({ type: 'IMAGE.LOAD' })
    expect((s.api().getImageProps() as Dict).hidden).toBeUndefined()
  })
})

describe('image 大图预览', () => {
  function keydown(key: string) {
    return { key, preventDefault: vi.fn() } as unknown as KeyboardEvent & { preventDefault: ReturnType<typeof vi.fn> }
  }

  it('没开预览：root 不是按钮，也不可聚焦', async () => {
    const s = makeImage({ src: 'a.png', alt: '山谷' })
    await settleSrc()
    const root = s.api().getRootProps() as Dict
    expect(root.role).toBeUndefined()
    expect(root.tabindex).toBeUndefined()
    expect(root['aria-haspopup']).toBeUndefined()
    expect(root['data-interactive']).toBeUndefined()
    expect(root.onClick).toBeUndefined()
    expect(s.api().previewable).toBe(false)
    expect(s.api().previewItem).toBeNull()
  })

  it('开了预览：整张图是一颗打开对话框的按钮，占一个 Tab 位', async () => {
    const s = makeImage({ src: 'a.png', alt: '山谷', preview: true })
    await settleSrc()
    const root = s.api().getRootProps() as Dict
    expect(root.role).toBe('button')
    expect(root.tabindex).toBe(0)
    expect(root['aria-haspopup']).toBe('dialog')
    expect(root['data-interactive']).toBe('')
    expect(s.api().previewable).toBe(true)
    expect(s.api().previewOpen).toBe(false)
    expect(s.api().previewItem).toEqual({ src: 'a.png', alt: '山谷' })
  })

  it('点击打开预览，setPreviewOpen(false) 收起', async () => {
    const s = makeImage({ src: 'a.png', preview: true })
    await settleSrc()
    ;((s.api().getRootProps() as Dict).onClick as () => void)()
    expect(s.api().previewOpen).toBe(true)

    s.api().setPreviewOpen(false)
    expect(s.api().previewOpen).toBe(false)
  })

  it('enter 与 Space 打开预览并拦下缺省动作；别的键不管', async () => {
    const s = makeImage({ src: 'a.png', preview: true })
    await settleSrc()
    const onKeyDown = (s.api().getRootProps() as Dict).onKeyDown as (e: KeyboardEvent) => void

    const other = keydown('a')
    onKeyDown(other)
    expect(other.preventDefault).not.toHaveBeenCalled()
    expect(s.api().previewOpen).toBe(false)

    for (const key of ['Enter', ' ']) {
      s.api().setPreviewOpen(false)
      const event = keydown(key)
      ;((s.api().getRootProps() as Dict).onKeyDown as (e: KeyboardEvent) => void)(event)
      expect(event.preventDefault).toHaveBeenCalledTimes(1)
      expect(s.api().previewOpen).toBe(true)
    }
  })

  it('载入中、失败了都能打开：大图在预览层里另走一遍加载', async () => {
    const s = makeImage({ src: 'a.png', preview: true })
    await settleSrc()
    s.service.send({ type: 'IMAGE.ERROR' })
    s.api().setPreviewOpen(true)
    expect(s.api().previewOpen).toBe(true)
  })

  it('preview.src 给预览层另一张图：缩略图用小图、预览用原图', async () => {
    const s = makeImage({ src: 'thumb.png', alt: '山谷', preview: { src: 'full.png' } })
    await settleSrc()
    expect(s.api().previewItem).toEqual({ src: 'full.png', alt: '山谷' })
    // 缩略图自己的地址不变
    expect((s.api().getImageProps() as Dict).src).toBe('thumb.png')
  })

  it('没有可看的图（src 与 preview.src 都没给）：预览不生效，打开也被拦下', async () => {
    const s = makeImage({ preview: true })
    await settleSrc()
    expect(s.api().previewable).toBe(false)
    expect((s.api().getRootProps() as Dict).role).toBeUndefined()
    s.api().setPreviewOpen(true)
    expect(s.api().previewOpen).toBe(false)

    // 只给 preview.src 也算有图可看
    const only = makeImage({ preview: { src: 'full.png' } })
    await settleSrc()
    expect(only.api().previewItem).toEqual({ src: 'full.png' })
  })

  it('开着的时候把预览关掉或把图撤掉：预览层跟着收起', async () => {
    const s = makeImage({ src: 'a.png', preview: true })
    await settleSrc()
    s.api().setPreviewOpen(true)
    s.setProps({ preview: false })
    expect(s.api().previewOpen).toBe(false)

    s.setProps({ preview: true })
    s.api().setPreviewOpen(true)
    s.setProps({ src: undefined })
    expect(s.api().previewOpen).toBe(false)
  })
})
