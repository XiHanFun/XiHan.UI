// @vitest-environment jsdom

import type { Service } from '@xihan-ui/machine'
import type { SliderSchema } from '../src/slider'
import { normalizeProps } from '@xihan-ui/kernel'
import { createService } from '@xihan-ui/machine'
import { createVanillaRuntime } from '@xihan-ui/machine/vanilla'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { connectSlider, sliderMachine } from '../src/slider'

type Props = SliderSchema['props']
type Dict = Record<string, unknown>

/** props 用可变对象承载：受控用例要在机器活着的时候从外面改写 value。 */
function makeService(props: Props = {}): Service<SliderSchema> {
  const runtime = createVanillaRuntime()
  const service = createService(sliderMachine, { props: () => props, runtime })
  runtime.start()
  return service
}

function api(service: Service<SliderSchema>) {
  return connectSlider(service, normalizeProps)
}

function thumbProps(service: Service<SliderSchema>, index = 0): Dict {
  return api(service).getThumbProps(index) as Dict
}

/**
 * 造一个真事件再派发，而不是传个字面量对象：
 * 合成事件默认 cancelable=false，在那种事件上 preventDefault 是空操作，
 * "认下的键要拦住"这条断言会永远为真。
 */
function keydown(key: string, init: KeyboardEventInit = {}): KeyboardEvent {
  return new KeyboardEvent('keydown', { key, cancelable: true, bubbles: true, ...init })
}

function pressKey(service: Service<SliderSchema>, key: string, index = 0, init?: KeyboardEventInit): KeyboardEvent {
  const event = keydown(key, init)
  ;(thumbProps(service, index).onKeyDown as (e: KeyboardEvent) => void)(event)
  return event
}

// ── 拖动用的一套真实节点：轨道矩形由测试自己摆，机器在事件那一刻现量 ──

interface Rig {
  control: HTMLElement
  track: HTMLElement
  thumbs: HTMLElement[]
  press: (clientX: number) => void
}

function mountRig(service: Service<SliderSchema>, thumbCount = 1): Rig {
  const make = (part: string, tag = 'div'): HTMLElement => {
    const el = document.createElement(tag)
    el.setAttribute('data-scope', 'slider')
    el.setAttribute('data-part', part)
    return el
  }
  const control = make('control')
  const track = make('track')
  const thumbs = Array.from({ length: thumbCount }, () => {
    const el = make('thumb')
    el.tabIndex = 0
    return el
  })
  control.append(track, ...thumbs)
  document.body.append(control)

  // jsdom 不做布局，量出来恒是 0×0（几何那边会当作"还没布局"返回下界）。
  // 摆一个 200px 宽的轨道，值与坐标才有得换算
  track.getBoundingClientRect = () => ({
    x: 0,
    y: 0,
    width: 200,
    height: 10,
    top: 0,
    left: 0,
    right: 200,
    bottom: 10,
    toJSON: () => ({}),
  }) as DOMRect
  service.refs.set('getTrackEl', () => track)

  control.addEventListener('pointerdown', api(service).getControlProps().onPointerDown as EventListener)
  return {
    control,
    track,
    thumbs,
    press: (clientX: number) => {
      control.dispatchEvent(new PointerEvent('pointerdown', { clientX, clientY: 5, button: 0, bubbles: true, cancelable: true }))
    },
  }
}

afterEach(() => {
  document.body.innerHTML = ''
})

describe('sliderMachine 值与步进', () => {
  it('缺省值是长度 1 的数组，落在 min 上', () => {
    expect(makeService().context.get('value')).toEqual([0])
    expect(makeService({ min: 20 }).context.get('value')).toEqual([20])
  })

  it('按 step 推动，越界停在端点而不回绕', () => {
    const s = makeService({ defaultValue: [50], step: 5 })
    s.send({ type: 'THUMB.STEP', index: 0, direction: 1 })
    expect(s.context.get('value')).toEqual([55])
    s.send({ type: 'THUMB.STEP', index: 0, direction: -1 })
    expect(s.context.get('value')).toEqual([50])

    const edge = makeService({ defaultValue: [98], step: 5 })
    edge.send({ type: 'THUMB.STEP', index: 0, direction: 1 })
    expect(edge.context.get('value')).toEqual([100])
    edge.send({ type: 'THUMB.STEP', index: 0, direction: 1 })
    expect(edge.context.get('value')).toEqual([100])
  })

  it('large 步进默认是 10 倍 step，largeStep 给了就用它', () => {
    const s = makeService({ defaultValue: [0], step: 2 })
    s.send({ type: 'THUMB.STEP', index: 0, direction: 1, large: true })
    expect(s.context.get('value')).toEqual([20])

    const custom = makeService({ defaultValue: [0], step: 2, largeStep: 6 })
    custom.send({ type: 'THUMB.STEP', index: 0, direction: 1, large: true })
    expect(custom.context.get('value')).toEqual([6])
  })

  it('取端点：单滑块到 min/max，多滑块只到邻居允许的上下界', () => {
    const single = makeService({ defaultValue: [50] })
    single.send({ type: 'THUMB.TO_MAX', index: 0 })
    expect(single.context.get('value')).toEqual([100])
    single.send({ type: 'THUMB.TO_MIN', index: 0 })
    expect(single.context.get('value')).toEqual([0])

    const pair = makeService({ defaultValue: [20, 80] })
    pair.send({ type: 'THUMB.TO_MAX', index: 0 })
    // 顶到邻居身上就停住，不许越过去把两个滑块的身份换掉
    expect(pair.context.get('value')).toEqual([80, 80])
    pair.send({ type: 'THUMB.TO_MIN', index: 1 })
    expect(pair.context.get('value')).toEqual([80, 80])
  })

  it('disabled / readOnly 时守卫挡住一切写入，包括命令式赋值', () => {
    for (const guardProps of [{ disabled: true }, { readOnly: true }] as const) {
      const s = makeService({ defaultValue: [50], ...guardProps })
      s.send({ type: 'THUMB.STEP', index: 0, direction: 1 })
      s.send({ type: 'THUMB.TO_MAX', index: 0 })
      s.send({ type: 'THUMB.SET', index: 0, value: 90 })
      s.send({ type: 'VALUE.SET', value: [90] })
      expect(s.context.get('value')).toEqual([50])
    }
  })

  it('整组赋值先吸到 step 网格再按顺序归位，交叉的值不会留下', () => {
    const s = makeService({ defaultValue: [0], step: 10 })
    s.send({ type: 'VALUE.SET', value: [23, 67] })
    expect(s.context.get('value')).toEqual([20, 70])

    // 后一个被写在前一个之前：归位后顶到前一个身上，绝不让区间上下颠倒
    const crossed = makeService({ defaultValue: [0, 0] })
    crossed.send({ type: 'VALUE.SET', value: [80, 20] })
    expect(crossed.context.get('value')).toEqual([80, 80])

    const gapped = makeService({ defaultValue: [0, 0], minStepsBetweenThumbs: 10 })
    gapped.send({ type: 'VALUE.SET', value: [40, 42] })
    expect(gapped.context.get('value')).toEqual([40, 50])
  })

  it('受控 value：内部写入不落地，意图仍从 onValueChange 送出去', () => {
    const onValueChange = vi.fn()
    const props: Props = { value: [30], onValueChange }
    const s = makeService(props)
    s.send({ type: 'THUMB.STEP', index: 0, direction: 1 })
    expect(s.context.get('value')).toEqual([30])
    expect(onValueChange).toHaveBeenCalledWith({ value: [31] })

    // 宿主写回来了，界面才跟着走
    props.value = [31]
    expect(s.context.get('value')).toEqual([31])
  })

  it('onValueChangeEnd 只在一次操作收尾时发一次，并带上被推动的下标', () => {
    const onValueChangeEnd = vi.fn()
    const s = makeService({ defaultValue: [10, 90], onValueChangeEnd })
    s.send({ type: 'THUMB.STEP', index: 1, direction: -1 })
    expect(onValueChangeEnd).not.toHaveBeenCalled()

    const rig = mountRig(s, 2)
    rig.press(180)
    document.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }))
    expect(onValueChangeEnd).toHaveBeenCalledTimes(1)
    expect(onValueChangeEnd).toHaveBeenCalledWith({ value: [10, 90], index: 1 })
  })
})

describe('sliderMachine 指针拖动', () => {
  it('按下即跳到落点，随后跟着指针走，松手回 idle', () => {
    const s = makeService({ defaultValue: [0] })
    const rig = mountRig(s)

    rig.press(100)
    expect(s.state.get()).toBe('dragging')
    expect(s.context.get('value')).toEqual([50])

    document.dispatchEvent(new PointerEvent('pointermove', { clientX: 150, clientY: 5, bubbles: true }))
    expect(s.context.get('value')).toEqual([75])

    document.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }))
    expect(s.state.get()).toBe('idle')
  })

  it('松手后文档上的监听器逐个撤干净，指针再动值也不跟了', () => {
    // 只断言"值没跟着动"是咬不住撤除的：DRAG.MOVE 在 idle 下本来就没人接，
    // 监听器全泄漏了这条也照样绿。所以直接盯 add/remove 的配对
    const added = vi.spyOn(document, 'addEventListener')
    const removed = vi.spyOn(document, 'removeEventListener')
    const s = makeService({ defaultValue: [0] })
    const rig = mountRig(s)
    rig.press(100)
    document.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }))

    for (const type of ['pointermove', 'pointerup', 'pointercancel']) {
      const on = added.mock.calls.filter(c => c[0] === type)
      const off = removed.mock.calls.filter(c => c[0] === type)
      expect(on.length, `${type} 应当装过一次`).toBe(1)
      // 比函数身份而不是次数：撤错了对象等于没撤
      expect(off.map(c => c[1]), `${type} 应当被同一个处理器撤掉`).toContain(on[0]![1])
    }

    document.dispatchEvent(new PointerEvent('pointermove', { clientX: 20, clientY: 5, bubbles: true }))
    expect(s.context.get('value')).toEqual([50])
    added.mockRestore()
    removed.mockRestore()
  })

  it('pointercancel 同样收尾：系统抢走手势不会让状态永远停在 dragging', () => {
    const s = makeService({ defaultValue: [0] })
    const rig = mountRig(s)
    rig.press(100)
    document.dispatchEvent(new PointerEvent('pointercancel', { bubbles: true }))
    expect(s.state.get()).toBe('idle')
  })

  it('按下抓的是最近的那个滑块，焦点跟着转过去', () => {
    const s = makeService({ defaultValue: [20, 80] })
    const rig = mountRig(s, 2)

    rig.press(180) // 90 → 离 80 更近
    expect(s.context.get('activeIndex')).toBe(1)
    expect(s.context.get('value')).toEqual([20, 90])
    expect(document.activeElement).toBe(rig.thumbs[1])

    document.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }))
    rig.press(20) // 10 → 离 20 更近
    expect(s.context.get('activeIndex')).toBe(0)
    expect(s.context.get('value')).toEqual([10, 90])
    expect(document.activeElement).toBe(rig.thumbs[0])
  })

  it('禁用时按下不进 dragging，也不装监听器', () => {
    const s = makeService({ defaultValue: [0], disabled: true })
    const rig = mountRig(s)
    rig.press(100)
    expect(s.state.get()).toBe('idle')
    document.dispatchEvent(new PointerEvent('pointermove', { clientX: 150, clientY: 5, bubbles: true }))
    expect(s.context.get('value')).toEqual([0])
  })

  it('右键与中键不当拖动：只有主键才推得动', () => {
    const s = makeService({ defaultValue: [0] })
    const rig = mountRig(s)
    rig.control.dispatchEvent(new PointerEvent('pointerdown', { clientX: 100, clientY: 5, button: 2, bubbles: true, cancelable: true }))
    expect(s.state.get()).toBe('idle')
    expect(s.context.get('value')).toEqual([0])
  })
})

describe('connectSlider 键盘', () => {
  it('四个方向键、两个翻页键与 Home/End 都认，且都拦住默认行为', () => {
    const s = makeService({ defaultValue: [50], step: 5 })
    expect(pressKey(s, 'ArrowRight').defaultPrevented).toBe(true)
    expect(s.context.get('value')).toEqual([55])
    pressKey(s, 'ArrowUp')
    expect(s.context.get('value')).toEqual([60])
    pressKey(s, 'ArrowLeft')
    pressKey(s, 'ArrowDown')
    expect(s.context.get('value')).toEqual([50])

    expect(pressKey(s, 'PageUp').defaultPrevented).toBe(true)
    expect(s.context.get('value')).toEqual([100])
    pressKey(s, 'PageDown')
    expect(s.context.get('value')).toEqual([50])

    pressKey(s, 'End')
    expect(s.context.get('value')).toEqual([100])
    pressKey(s, 'Home')
    expect(s.context.get('value')).toEqual([0])
  })

  it('不认的键不吞：值不动，默认行为放行给页面', () => {
    const s = makeService({ defaultValue: [50] })
    const event = pressKey(s, 'Enter')
    expect(event.defaultPrevented).toBe(false)
    expect(s.context.get('value')).toEqual([50])
  })

  it('带修饰键的组合一律放行：Ctrl+Home 是浏览器的"跳到文档顶部"', () => {
    const s = makeService({ defaultValue: [50] })
    expect(pressKey(s, 'Home', 0, { ctrlKey: true }).defaultPrevented).toBe(false)
    expect(pressKey(s, 'ArrowRight', 0, { metaKey: true }).defaultPrevented).toBe(false)
    expect(s.context.get('value')).toEqual([50])
  })

  it('rTL 只对调左右两键，上下两键不受影响', () => {
    const s = makeService({ defaultValue: [50], dir: 'rtl' })
    pressKey(s, 'ArrowLeft')
    expect(s.context.get('value')).toEqual([51])
    pressKey(s, 'ArrowRight')
    expect(s.context.get('value')).toEqual([50])
    pressKey(s, 'ArrowUp')
    expect(s.context.get('value')).toEqual([51])
  })

  it('竖直轨道不吃 RTL 的对调：屏幕向右恒是朝 max', () => {
    // 几何那边 isInverted 遇竖直就短路、不看 dir；键盘得跟它同一条规矩，
    // 否则同一个滑块会出现"按右变大、按左也变大"
    const s = makeService({ defaultValue: [50], dir: 'rtl', orientation: 'vertical' })
    pressKey(s, 'ArrowRight')
    expect(s.context.get('value')).toEqual([51])
    pressKey(s, 'ArrowUp')
    expect(s.context.get('value')).toEqual([52])
  })

  it('推不动的时候连键都不接：禁用/只读下不 preventDefault', () => {
    for (const guardProps of [{ disabled: true }, { readOnly: true }] as const) {
      const s = makeService({ defaultValue: [50], ...guardProps })
      const event = pressKey(s, 'ArrowRight')
      expect(event.defaultPrevented).toBe(false)
      expect(s.context.get('value')).toEqual([50])
    }
  })

  it('按方向键的同时把 activeIndex 挪到这个滑块上', () => {
    const s = makeService({ defaultValue: [20, 80] })
    pressKey(s, 'ArrowRight', 1)
    expect(s.context.get('activeIndex')).toBe(1)
    expect(s.context.get('value')).toEqual([20, 81])
  })
})

describe('connectSlider 属性输出', () => {
  it('拇指是 role=slider，四个 aria-value* 与朝向、名字都写全', () => {
    const s = makeService({ defaultValue: [40], min: 10, max: 90 })
    const thumb = thumbProps(s)
    expect(thumb.role).toBe('slider')
    expect(thumb['aria-valuemin']).toBe('10')
    expect(thumb['aria-valuemax']).toBe('90')
    expect(thumb['aria-valuenow']).toBe('40')
    expect(thumb['aria-orientation']).toBe('horizontal')
    expect(thumb['aria-labelledby']).toBe((api(s).getLabelProps() as Dict).id)
    expect(thumb['data-scope']).toBe('slider')
    expect(thumb['data-part']).toBe('thumb')
    expect(thumb.tabindex).toBe(0)
  })

  it('aria-valuetext 只在给了格式化函数时才写', () => {
    expect(thumbProps(makeService({ defaultValue: [40] }))['aria-valuetext']).toBeUndefined()
    const s = makeService({
      defaultValue: [40, 60],
      getValueText: ({ value, index }) => `${index === 0 ? '起' : '止'} ${value}%`,
    })
    expect(thumbProps(s, 0)['aria-valuetext']).toBe('起 40%')
    expect(thumbProps(s, 1)['aria-valuetext']).toBe('止 60%')
  })

  it('多滑块的 aria 区间是自己那一段，不是整条轨道', () => {
    const s = makeService({ defaultValue: [20, 60], minStepsBetweenThumbs: 5 })
    expect(thumbProps(s, 0)['aria-valuemax']).toBe('55')
    expect(thumbProps(s, 1)['aria-valuemin']).toBe('25')
    expect(thumbProps(s, 0)['data-index']).toBe('0')
    expect(thumbProps(s, 1)['data-index']).toBe('1')
  })

  it('禁用：显式 aria-disabled=false / true，且禁用后退出 Tab 序列', () => {
    const on = thumbProps(makeService({ defaultValue: [0] }))
    expect(on['aria-disabled']).toBe('false')
    expect(on.tabindex).toBe(0)

    const off = thumbProps(makeService({ defaultValue: [0], disabled: true }))
    expect(off['aria-disabled']).toBe('true')
    expect(off.tabindex).toBeUndefined()

    // 只读仍可聚焦：读屏要念得到，用户也要能复制得走
    const ro = thumbProps(makeService({ defaultValue: [0], readOnly: true }))
    expect(ro.tabindex).toBe(0)
    expect(ro['data-readonly']).toBe('')
  })

  it('已选区间与拇指按逻辑属性定位，另一条轴每帧清空', () => {
    const h = api(makeService({ defaultValue: [25] }))
    expect((h.getRangeProps() as Dict).style).toEqual({
      insetBlockEnd: '',
      blockSize: '',
      insetInlineStart: '0%',
      inlineSize: '25%',
    })
    expect((h.getThumbProps(0) as Dict).style).toEqual({
      insetBlockEnd: '',
      blockSize: '',
      insetInlineStart: '25%',
      inlineSize: '',
    })

    const v = api(makeService({ defaultValue: [20, 60], orientation: 'vertical' }))
    expect((v.getRangeProps() as Dict).style).toEqual({
      insetInlineStart: '',
      inlineSize: '',
      insetBlockEnd: '20%',
      blockSize: '40%',
    })
  })

  it('小数 step 的百分比不拖浮点尾巴', () => {
    const s = makeService({ defaultValue: [0], min: 0, max: 1, step: 0.1 })
    s.send({ type: 'THUMB.STEP', index: 0, direction: 1 })
    s.send({ type: 'THUMB.STEP', index: 0, direction: 1 })
    s.send({ type: 'THUMB.STEP', index: 0, direction: 1 })
    expect(s.context.get('value')).toEqual([0.3])
    expect((api(s).getThumbProps(0) as Dict).style).toMatchObject({ insetInlineStart: '30%' })
  })

  it('隐藏输入是表单出口：带 name 才提交，禁用时不提交', () => {
    const s = makeService({ defaultValue: [20, 80], name: 'price' })
    const first = api(s).getHiddenInputProps(0) as Dict
    expect(first.type).toBe('hidden')
    expect(first.name).toBe('price')
    expect(first.value).toBe('20')
    expect(first.disabled).toBeUndefined()
    expect((api(s).getHiddenInputProps(1) as Dict).value).toBe('80')

    expect((api(makeService({ defaultValue: [0] })).getHiddenInputProps(0) as Dict).name).toBeUndefined()
    expect((api(makeService({ defaultValue: [0], name: 'x', disabled: true })).getHiddenInputProps(0) as Dict).disabled).toBe(true)
  })

  it('作者多写的拇指不产 NaN：下标夹回最后一个有值的位置', () => {
    const s = makeService({ defaultValue: [30] })
    const ghost = thumbProps(s, 5)
    expect(ghost['aria-valuenow']).toBe('30')
    expect(ghost['data-index']).toBe('0')
    // 下标是作者写的声明，写错了照样得给出一个能念的值
    expect(thumbProps(s, Number.NaN)['aria-valuenow']).toBe('30')
    expect(thumbProps(s, -3)['aria-valuenow']).toBe('30')
    expect(thumbProps(s, 1.5)['data-index']).toBe('0')
    // 推它也只推真实存在的那个，不会在值数组里凿出空洞
    ;(ghost.onKeyDown as (e: KeyboardEvent) => void)(keydown('ArrowRight'))
    expect(s.context.get('value')).toEqual([31])
  })

  it('拖动期间只有被抓住的那个拇指带 data-dragging', () => {
    const s = makeService({ defaultValue: [20, 80] })
    const rig = mountRig(s, 2)
    rig.press(180)
    expect(api(s).dragging).toBe(true)
    expect(thumbProps(s, 0)['data-dragging']).toBeUndefined()
    expect(thumbProps(s, 1)['data-dragging']).toBe('')
    expect((api(s).getRootProps() as Dict)['data-dragging']).toBe('')
  })

  it('api 的 setValue / setThumbValue 走同一条归位规则', () => {
    const s = makeService({ defaultValue: [0], step: 10 })
    api(s).setValue([37])
    expect(s.context.get('value')).toEqual([40])
    api(s).setThumbValue(0, 91)
    expect(s.context.get('value')).toEqual([90])
  })

  it('程序化送来的越界下标被夹住，不在值数组里凿洞', () => {
    // connect 的 clampIndex 只护住 api 那条路；直接 send 的下标以前会一路走到 out[99] = x
    const s = makeService({ defaultValue: [20, 80] })
    s.send({ type: 'THUMB.SET', index: 99, value: 50 })
    expect(s.context.get('value')).toEqual([20, 50])
    expect(s.context.get('activeIndex')).toBe(1)

    s.send({ type: 'THUMB.SET', index: -5, value: 10 })
    expect(s.context.get('value')).toEqual([10, 50])

    // 非有限下标按 0 处理：推的是第一个拇指，且照常被后一个拇指挡住不许越过
    s.send({ type: 'THUMB.TO_MAX', index: Number.NaN })
    expect(s.context.get('value')).toEqual([50, 50])
  })

  it('越界下标的步进也落在真实存在的那个拇指上', () => {
    const s = makeService({ defaultValue: [20], step: 1 })
    s.send({ type: 'THUMB.STEP', index: 42, direction: 1 })
    expect(s.context.get('value')).toEqual([21])
  })

  it('thumbs 与 range 把百分比算好交给作者', () => {
    const a = api(makeService({ defaultValue: [25, 75] }))
    expect(a.thumbs.map(t => t.percent)).toEqual([0.25, 0.75])
    expect(a.range).toEqual({ start: 0.25, end: 0.75 })
    expect(a.value).toEqual([25, 75])
  })
})
