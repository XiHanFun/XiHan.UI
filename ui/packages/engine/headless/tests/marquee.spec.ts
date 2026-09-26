import type { MarqueeApi, MarqueeDirection, MarqueeProps } from '../src/marquee'
import { createService, normalizeProps } from '@xihan-ui/core'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'
import { afterEach, describe, expect, it, vi } from 'vitest'
// 直接从组件目录导入，不经包主入口
import { connectMarquee, marqueeMachine } from '../src/marquee'

type Dict = Record<string, unknown>

let stops: Array<() => void> = []

afterEach(() => {
  stops.forEach(stop => stop())
  stops = []
})

/** 起一台跑马灯机器；返回的 api 每次现取，setProps 模拟宿主改属性。 */
function mount(initial: MarqueeProps = {}) {
  const runtime = createVanillaRuntime()
  const props = runtime.signal<MarqueeProps>(initial)
  const service = createService(marqueeMachine, { props: () => props.get(), runtime })
  runtime.start()
  stops.push(() => runtime.stop())
  return {
    api: (): MarqueeApi => connectMarquee(service, normalizeProps),
    setProps: (next: MarqueeProps) => props.set({ ...props.get(), ...next }),
  }
}

function root(props: MarqueeProps = {}): Dict {
  return mount(props).api().getRootProps() as Dict
}

function trigger(api: MarqueeApi): Dict {
  return api.getAutoplayTriggerProps() as Dict
}

describe('marquee 的档位', () => {
  it('缺省往左滚，方向与轴恒有值', () => {
    expect(root()['data-direction']).toBe('left')
    expect(root()['data-orientation']).toBe('horizontal')
  })

  it('轴跟着方向走：左右是横的，上下是竖的', () => {
    const axis: Record<MarqueeDirection, string> = {
      left: 'horizontal',
      right: 'horizontal',
      up: 'vertical',
      down: 'vertical',
    }
    for (const [direction, orientation] of Object.entries(axis)) {
      expect(root({ direction: direction as MarqueeDirection })['data-orientation']).toBe(orientation)
      expect(root({ direction: direction as MarqueeDirection })['data-direction']).toBe(direction)
    }
  })

  it('悬停暂停缺省开，写 false 才关；铺满缺省关', () => {
    expect(root()['data-pause-on-hover']).toBe('')
    expect(root({ pauseOnHover: false })['data-pause-on-hover']).toBeUndefined()
    expect(root()['data-auto-fill']).toBeUndefined()
    expect(root({ autoFill: true })['data-auto-fill']).toBe('')
  })

  it('铺几份由 autoFill 决定：开是两份，关是一份', () => {
    expect(mount().api().copies).toBe(1)
    expect(mount({ autoFill: false }).api().copies).toBe(1)
    expect(mount({ autoFill: true }).api().copies).toBe(2)
  })
})

describe('marquee 的速度', () => {
  it('有限正数写成根上的内联变量', () => {
    expect(root({ speed: 90 }).style).toBe('--xh-marquee-speed: 90')
    expect(root({ speed: 12.5 }).style).toBe('--xh-marquee-speed: 12.5')
  })

  // 皮肤拿一份内容的长度除以速度算一圈的时长：写出 0 会让时长变成无穷，
  // 整段动画一格都不动；负数与非有限值同理，一律不写出、退回皮肤缺省。
  it('零、负数与非有限值一概不写出', () => {
    for (const speed of [0, -1, -0.5, Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY, undefined])
      expect(root({ speed }).style).toBeUndefined()
  })

  it('速度不占语义属性', () => {
    const attrs = root({ speed: 90 })
    expect(attrs['data-speed']).toBeUndefined()
    expect(attrs.role).toBeUndefined()
  })
})

describe('marquee 的暂停开关', () => {
  it('缺省在走：开关的名字是下一步的动作，状态投影 running，指向轨道', () => {
    const { api } = mount()
    const t = trigger(api())
    expect(api().paused).toBe(false)
    expect(t.type).toBe('button')
    expect(t['aria-label']).toBe('Pause scrolling')
    expect(t['aria-pressed']).toBeUndefined()
    expect(t['data-state']).toBe('running')
    expect(t['aria-controls']).toBe((api().getContentProps() as Dict).id)
    expect((api().getRootProps() as Dict)['data-paused']).toBeUndefined()
  })

  it('按一下停住、再按一下继续；名字、状态与根上的 data-paused 跟着换', () => {
    const onPausedChange = vi.fn()
    const { api } = mount({ onPausedChange })
    ;(trigger(api()).onClick as () => void)()
    expect(api().paused).toBe(true)
    expect(trigger(api())['aria-label']).toBe('Resume scrolling')
    expect(trigger(api())['data-state']).toBe('paused')
    expect((api().getRootProps() as Dict)['data-paused']).toBe('')
    ;(trigger(api()).onClick as () => void)()
    expect(api().paused).toBe(false)
    expect(onPausedChange.mock.calls.map(([details]) => details)).toEqual([{ paused: true }, { paused: false }])
  })

  it('defaultPaused 给非受控初值；setPaused 与按开关走同一路径', () => {
    const onPausedChange = vi.fn()
    const { api } = mount({ defaultPaused: true, onPausedChange })
    expect(api().paused).toBe(true)
    api().setPaused(false)
    expect(api().paused).toBe(false)
    expect(onPausedChange).toHaveBeenCalledWith({ paused: false })
  })

  it('受控：按开关只报意图，作者写回才换', () => {
    const onPausedChange = vi.fn()
    const { api, setProps } = mount({ paused: false, onPausedChange })
    ;(trigger(api()).onClick as () => void)()
    expect(onPausedChange).toHaveBeenCalledWith({ paused: true })
    expect(api().paused).toBe(false)
    setProps({ paused: true })
    expect(api().paused).toBe(true)
    expect((api().getRootProps() as Dict)['data-paused']).toBe('')
  })

  it('translations 换掉两种状态下的名字', () => {
    const { api } = mount({ translations: { autoplayTriggerPause: '暂停滚动', autoplayTriggerPlay: '继续滚动' } })
    expect(trigger(api())['aria-label']).toBe('暂停滚动')
    api().setPaused(true)
    expect(trigger(api())['aria-label']).toBe('继续滚动')
  })

  it('开关接动作控件家族：单图标方钮、描边档，按住投影 data-pressed', () => {
    const { api } = mount()
    const t = trigger(api())
    expect(t['data-xh-action-control']).toBe('')
    expect(t['data-xh-action-profile']).toBe('icon')
    expect(t['data-xh-action-variant']).toBe('outline')
    expect(t['data-pressed']).toBeUndefined()
    ;(t.onKeyDown as (event: unknown) => void)({ key: ' ', repeat: false, preventDefault: () => {}, currentTarget: {} })
    expect(trigger(api())['data-pressed']).toBe('')
    ;(trigger(api()).onBlur as () => void)()
    expect(trigger(api())['data-pressed']).toBeUndefined()
  })
})
