// @vitest-environment jsdom

import type { Service } from '@xihan-ui/machine'
import type { ColorPickerChannel, ColorPickerSchema } from '../src/color-picker'
import { normalizeProps } from '@xihan-ui/core'
import { createService } from '@xihan-ui/machine'
import { createVanillaRuntime } from '@xihan-ui/machine/vanilla'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { colorPickerMachine, colorPickerParse, connectColorPicker } from '../src/color-picker'

type Props = ColorPickerSchema['props']
type Dict = Record<string, unknown>

/** props 用可变对象承载：受控用例要在机器活着的时候从外面改写 value / open。 */
function makeService(props: Props = {}): Service<ColorPickerSchema> {
  const runtime = createVanillaRuntime()
  const service = createService(colorPickerMachine, { props: () => props, runtime })
  runtime.start()
  return service
}

function api(service: Service<ColorPickerSchema>) {
  return connectColorPicker(service, normalizeProps)
}

/**
 * 造一个真事件再派发，而不是传个字面量对象：
 * 合成事件默认 cancelable=false，在那种事件上 preventDefault 是空操作，
 * "认下的键要拦住"这条断言会永远为真。
 */
function keydown(key: string, init: KeyboardEventInit = {}): KeyboardEvent {
  return new KeyboardEvent('keydown', { key, cancelable: true, bubbles: true, ...init })
}

function pressArea(service: Service<ColorPickerSchema>, key: string, init?: KeyboardEventInit): KeyboardEvent {
  const event = keydown(key, init)
  const props = api(service).getAreaThumbProps() as Dict
  ;(props.onKeyDown as (e: KeyboardEvent) => void)(event)
  return event
}

function pressChannel(
  service: Service<ColorPickerSchema>,
  channel: ColorPickerChannel,
  key: string,
  init?: KeyboardEventInit,
): KeyboardEvent {
  const event = keydown(key, init)
  const props = api(service).getChannelSliderThumbProps({ channel }) as Dict
  ;(props.onKeyDown as (e: KeyboardEvent) => void)(event)
  return event
}

/** 值串 → rgba，断言里用它比颜色，免得被写法差异绊倒。 */
function rgbaOf(service: Service<ColorPickerSchema>) {
  return colorPickerParse(service.context.get('value'))
}

// ── 拖动用的一套真实节点：矩形由测试自己摆，机器在事件那一刻现量 ──

interface Rig {
  area: HTMLElement
  hue: HTMLElement
  alpha: HTMLElement
  pressArea: (clientX: number, clientY: number) => void
  pressChannel: (channel: ColorPickerChannel, clientX: number) => void
}

function stubRect(el: HTMLElement, rect: { x: number, y: number, width: number, height: number }): void {
  el.getBoundingClientRect = () => ({
    ...rect,
    top: rect.y,
    left: rect.x,
    right: rect.x + rect.width,
    bottom: rect.y + rect.height,
    toJSON: () => ({}),
  }) as DOMRect
}

function mountRig(service: Service<ColorPickerSchema>): Rig {
  const make = (part: string): HTMLElement => {
    const el = document.createElement('div')
    el.setAttribute('data-scope', 'color-picker')
    el.setAttribute('data-part', part)
    return el
  }
  const area = make('area')
  const areaThumb = make('area-thumb')
  areaThumb.tabIndex = 0
  area.append(areaThumb)

  const sliders: Record<ColorPickerChannel, HTMLElement> = { hue: make('channel-slider'), alpha: make('channel-slider') }
  const tracks: Record<ColorPickerChannel, HTMLElement> = {
    hue: make('channel-slider-track'),
    alpha: make('channel-slider-track'),
  }
  for (const channel of ['hue', 'alpha'] as const) {
    const thumb = make('channel-slider-thumb')
    thumb.tabIndex = 0
    sliders[channel].append(tracks[channel], thumb)
    // jsdom 不做布局，量出来恒是 0×0（几何那边会当作"还没布局"给 0）；摆一条 200px 的轨道
    stubRect(tracks[channel], { x: 0, y: 0, width: 200, height: 10 })
  }
  // 取色区摆成 200×100，横轴饱和度、纵轴明度
  stubRect(area, { x: 0, y: 0, width: 200, height: 100 })
  document.body.append(area, sliders.hue, sliders.alpha)

  service.refs.set('getAreaEl', () => area)
  service.refs.set('getChannelTrackEl', channel => tracks[channel])

  area.addEventListener('pointerdown', api(service).getAreaProps().onPointerDown as EventListener)
  for (const channel of ['hue', 'alpha'] as const) {
    sliders[channel].addEventListener(
      'pointerdown',
      api(service).getChannelSliderProps({ channel }).onPointerDown as EventListener,
    )
  }

  return {
    area,
    hue: sliders.hue,
    alpha: sliders.alpha,
    pressArea: (clientX, clientY) => {
      area.dispatchEvent(new PointerEvent('pointerdown', { clientX, clientY, button: 0, bubbles: true, cancelable: true }))
    },
    pressChannel: (channel, clientX) => {
      sliders[channel].dispatchEvent(
        new PointerEvent('pointerdown', { clientX, clientY: 5, button: 0, bubbles: true, cancelable: true }),
      )
    },
  }
}

function movePointer(clientX: number, clientY = 0): void {
  document.dispatchEvent(new PointerEvent('pointermove', { clientX, clientY, bubbles: true }))
}

function releasePointer(): void {
  document.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }))
}

afterEach(() => {
  document.body.innerHTML = ''
  Reflect.deleteProperty(window, 'EyeDropper')
})

describe('colorPickerMachine 值', () => {
  it('缺省值是纯黑，defaultValue 原样收下', () => {
    expect(makeService().context.get('value')).toBe('#000000')
    expect(makeService({ defaultValue: '#3b82f6' }).context.get('value')).toBe('#3b82f6')
  })

  it('format 决定对外写法，改的只是序列化', () => {
    expect(makeService({ defaultValue: '#3b82f6', format: 'rgba' }).context.get('value')).toBe('#3b82f6')
    const s = makeService({ defaultValue: '#3b82f6', format: 'rgba' })
    s.send({ type: 'AREA.STEP', axis: 'x', direction: 1 })
    // 第一次改值之后才轮到组件自己序列化：初值原样保留，不擅自改写作者给的串
    expect(s.context.get('value')).toMatch(/^rgba\(/)
  })

  it('整体赋值时解析不出的串原地不动', () => {
    const s = makeService({ defaultValue: '#3b82f6' })
    s.send({ type: 'VALUE.SET', value: '#3b82f' })
    expect(s.context.get('value')).toBe('#3b82f6')
    s.send({ type: 'VALUE.SET', value: 'rgb(255, 0, 0)' })
    expect(rgbaOf(s)).toEqual({ r: 255, g: 0, b: 0, a: 1 })
  })

  it('alpha 关掉时值恒不透明', () => {
    const s = makeService({ defaultValue: '#3b82f6' })
    s.send({ type: 'CHANNEL.SET', channel: 'alpha', value: 30 })
    expect(rgbaOf(s)?.a).toBe(1)

    const withAlpha = makeService({ defaultValue: '#3b82f6', alpha: true })
    withAlpha.send({ type: 'CHANNEL.SET', channel: 'alpha', value: 30 })
    expect(rgbaOf(withAlpha)?.a).toBeCloseTo(0.3, 2)
  })
})

describe('colorPickerMachine 取色区', () => {
  it('方向键按 1 调饱和度与明度，Shift 走 10', () => {
    const s = makeService({ defaultValue: '#3b82f6' })
    const before = api(s).hsva
    s.send({ type: 'AREA.STEP', axis: 'x', direction: 1 })
    expect(api(s).hsva.s).toBeCloseTo(before.s + 1, 5)
    s.send({ type: 'AREA.STEP', axis: 'y', direction: -1, large: true })
    expect(api(s).hsva.v).toBeCloseTo(before.v - 10, 5)
  })

  it('贴住边界的那一步停在端点，不回绕', () => {
    const s = makeService({ defaultValue: '#ffffff' })
    // 白色的明度已经是 100
    s.send({ type: 'AREA.STEP', axis: 'y', direction: 1 })
    expect(api(s).hsva.v).toBe(100)
    s.send({ type: 'AREA.TO_EDGE', axis: 'x', edge: 'max' })
    expect(api(s).hsva.s).toBe(100)
    s.send({ type: 'AREA.TO_EDGE', axis: 'x', edge: 'min' })
    expect(api(s).hsva.s).toBe(0)
  })

  it('把明度拖到 0（纯黑）再拉回来，色相不丢', () => {
    // 这是取色器最容易塌的一处：纯黑算不出色相，只按值反解会一路变成红
    const s = makeService({ defaultValue: '#3b82f6' })
    const hue = Math.round(api(s).hsva.h)
    s.send({ type: 'AREA.SET', x: 0.76, y: 1 })
    expect(rgbaOf(s)).toEqual({ r: 0, g: 0, b: 0, a: 1 })
    expect(Math.round(api(s).hsva.h)).toBe(hue)
    s.send({ type: 'AREA.SET', x: 0.76, y: 0.04 })
    expect(Math.round(api(s).hsva.h)).toBe(hue)
  })
})

describe('colorPickerMachine 通道', () => {
  it('色相按 1 走、Shift 走 10，Home/End 取端点', () => {
    const s = makeService({ defaultValue: '#ff0000' })
    s.send({ type: 'CHANNEL.STEP', channel: 'hue', direction: 1 })
    expect(Math.round(api(s).hsva.h)).toBe(1)
    s.send({ type: 'CHANNEL.STEP', channel: 'hue', direction: 1, large: true })
    expect(Math.round(api(s).hsva.h)).toBe(11)
    s.send({ type: 'CHANNEL.TO_EDGE', channel: 'hue', edge: 'max' })
    expect(Math.round(api(s).hsva.h)).toBe(360)
    s.send({ type: 'CHANNEL.TO_EDGE', channel: 'hue', edge: 'min' })
    expect(Math.round(api(s).hsva.h)).toBe(0)
  })

  it('透明度按百分数走，端点是 0 与 100', () => {
    const s = makeService({ defaultValue: '#ff0000', alpha: true })
    s.send({ type: 'CHANNEL.TO_EDGE', channel: 'alpha', edge: 'min' })
    expect(rgbaOf(s)?.a).toBe(0)
    // 值串是八位十六进制，透明度到那儿会被量化成 1/255 的整数格，比不了太细
    s.send({ type: 'CHANNEL.STEP', channel: 'alpha', direction: 1, large: true })
    expect(rgbaOf(s)?.a).toBeCloseTo(0.1, 2)
    s.send({ type: 'CHANNEL.TO_EDGE', channel: 'alpha', edge: 'max' })
    expect(rgbaOf(s)?.a).toBe(1)
  })
})

describe('colorPickerMachine 数值输入', () => {
  it('打到一半只留草稿、不改值；打全了当场落值', () => {
    const s = makeService({ defaultValue: '#3b82f6' })
    // 五位是真的"打到一半"：三位与四位都是合法简写，收得下来
    s.send({ type: 'INPUT.CHANGE', channel: 'hex', value: '#ff000' })
    expect(s.context.get('value')).toBe('#3b82f6')
    expect(api(s).inputText('hex')).toBe('#ff000')

    s.send({ type: 'INPUT.CHANGE', channel: 'hex', value: '#ff0000' })
    expect(rgbaOf(s)).toEqual({ r: 255, g: 0, b: 0, a: 1 })
  })

  it('收下（回车/失焦）时草稿丢掉，框里复原成规范文本', () => {
    const s = makeService({ defaultValue: '#3b82f6' })
    s.send({ type: 'INPUT.CHANGE', channel: 'hex', value: '#ff000' })
    s.send({ type: 'INPUT.COMMIT', channel: 'hex' })
    // 收不下来的草稿不该留在框里长期与实际值对不上
    expect(s.context.get('value')).toBe('#3b82f6')
    expect(api(s).inputText('hex')).toBe('#3b82f6')
  })

  it('rgb 分量框各改一路', () => {
    const s = makeService({ defaultValue: '#000000' })
    s.send({ type: 'INPUT.CHANGE', channel: 'r', value: '128' })
    expect(rgbaOf(s)).toEqual({ r: 128, g: 0, b: 0, a: 1 })
  })

  it('收起浮层会把没收下的草稿丢掉', () => {
    const s = makeService({ defaultValue: '#3b82f6', defaultOpen: true })
    s.send({ type: 'INPUT.CHANGE', channel: 'hex', value: '#ff000' })
    s.send({ type: 'CLOSE' })
    expect(api(s).inputText('hex')).toBe('#3b82f6')
  })
})

describe('colorPickerMachine 指针拖动', () => {
  it('按下取色区即跳到落点，随后跟着指针走，松手收尾', () => {
    const s = makeService({ defaultValue: '#ff0000', defaultOpen: true })
    const rig = mountRig(s)

    rig.pressArea(100, 0) // 200×100 的正中偏上：饱和度 50、明度 100
    expect(api(s).hsva.s).toBeCloseTo(50, 5)
    expect(api(s).hsva.v).toBeCloseTo(100, 5)
    expect(s.state.matches('open.dragging')).toBe(true)
    // 按下的同时焦点转投到拇指上：松手就能接着用方向键微调
    expect(document.activeElement?.getAttribute('data-part')).toBe('area-thumb')

    movePointer(200, 50)
    expect(api(s).hsva.s).toBeCloseTo(100, 5)
    expect(api(s).hsva.v).toBeCloseTo(50, 5)

    releasePointer()
    expect(s.state.matches('open.dragging')).toBe(false)

    // 松手后监听器该撤干净，再动指针值不能跟
    const settled = s.context.get('value')
    movePointer(0, 100)
    expect(s.context.get('value')).toBe(settled)
  })

  it('按下通道轨道按比例取值', () => {
    const s = makeService({ defaultValue: '#ff0000', alpha: true, defaultOpen: true })
    const rig = mountRig(s)

    rig.pressChannel('hue', 100) // 200px 轨道的正中 → 180 度
    expect(Math.round(api(s).hsva.h)).toBe(180)
    releasePointer()

    rig.pressChannel('alpha', 50) // 四分之一处 → 25%
    expect(rgbaOf(s)?.a).toBeCloseTo(0.25, 2)
    releasePointer()
  })

  it('rtl 下横轴掉头', () => {
    const s = makeService({ defaultValue: '#ff0000', dir: 'rtl', defaultOpen: true })
    const rig = mountRig(s)
    rig.pressChannel('hue', 0) // 屏幕最左 = rtl 下的最大值
    expect(Math.round(api(s).hsva.h)).toBe(360)
  })

  it('禁用与只读时按下取色区不改值、也不进拖动态', () => {
    for (const props of [{ disabled: true }, { readOnly: true }] as const) {
      const s = makeService({ defaultValue: '#ff0000', defaultOpen: true, ...props })
      const rig = mountRig(s)
      rig.pressArea(100, 50)
      expect(s.context.get('value')).toBe('#ff0000')
      expect(s.state.matches('open.dragging')).toBe(false)
      document.body.innerHTML = ''
    }
  })
})

describe('colorPickerMachine 受控', () => {
  it('受控 value：宿主不写回则值纹丝不动，回调照发', () => {
    const onValueChange = vi.fn()
    const runtime = createVanillaRuntime()
    const value = runtime.signal('#ff0000')
    const s = createService(colorPickerMachine, {
      props: () => ({ value: value.get(), onValueChange }),
      runtime,
    })
    runtime.start()

    s.send({ type: 'CHANNEL.SET', channel: 'hue', value: 120 })
    expect(s.context.get('value')).toBe('#ff0000')
    expect(onValueChange).toHaveBeenCalledWith({ value: '#00ff00' })
    // 受控下界面不许自作主张：工作色仍是宿主给的那个
    expect(Math.round(api(s).hsva.h)).toBe(0)

    value.set('#00ff00')
    expect(Math.round(api(s).hsva.h)).toBe(120)
  })

  it('受控 open：只发意图，宿主写回才转移', () => {
    const onOpenChange = vi.fn()
    const runtime = createVanillaRuntime()
    const open = runtime.signal(false)
    const s = createService(colorPickerMachine, {
      props: () => ({ open: open.get(), onOpenChange }),
      runtime,
    })
    runtime.start()

    s.send({ type: 'TOGGLE' })
    expect(s.state.matches('open')).toBe(false)
    expect(onOpenChange).toHaveBeenCalledWith({ open: true })

    // 宿主写回 → watch 派发影子事件 → 状态跟上，且不再重复通知
    open.set(true)
    expect(s.state.matches('open')).toBe(true)
    expect(onOpenChange).toHaveBeenCalledTimes(1)
  })

  it('非受控开合：TOGGLE 自己转移并通知', () => {
    const onOpenChange = vi.fn()
    const s = makeService({ onOpenChange })
    s.send({ type: 'TOGGLE' })
    expect(s.state.matches('open')).toBe(true)
    expect(onOpenChange).toHaveBeenCalledWith({ open: true })
    s.send({ type: 'CLOSE' })
    expect(s.state.matches('open')).toBe(false)
  })
})

describe('colorPickerMachine 屏幕取色', () => {
  it('环境没有 EyeDropper 时按钮禁用，点了也不进取色态', () => {
    const s = makeService({ defaultOpen: true })
    expect(api(s).eyeDropperSupported).toBe(false)
    expect((api(s).getEyeDropperTriggerProps() as Dict).disabled).toBe(true)
    s.send({ type: 'EYE_DROPPER.OPEN' })
    expect(s.state.matches('open.picking')).toBe(false)
  })

  it('取到颜色就落值，用户放弃则原地不动', async () => {
    let settle: (result: { sRGBHex: string }) => void = () => {}
    let reject: (reason: unknown) => void = () => {}
    Reflect.set(window, 'EyeDropper', class {
      open(): Promise<{ sRGBHex: string }> {
        return new Promise((res, rej) => {
          settle = res
          reject = rej
        })
      }
    })

    const s = makeService({ defaultValue: '#000000', defaultOpen: true })
    expect(api(s).eyeDropperSupported).toBe(true)
    s.send({ type: 'EYE_DROPPER.OPEN' })
    expect(s.state.matches('open.picking')).toBe(true)
    settle({ sRGBHex: '#ff0000' })
    await Promise.resolve()
    await Promise.resolve()
    expect(rgbaOf(s)).toEqual({ r: 255, g: 0, b: 0, a: 1 })
    expect(s.state.matches('open.idle')).toBe(true)

    s.send({ type: 'EYE_DROPPER.OPEN' })
    reject(new Error('用户按了 Esc'))
    await Promise.resolve()
    await Promise.resolve()
    expect(s.context.get('value')).toBe('#ff0000')
    expect(s.state.matches('open.idle')).toBe(true)
  })
})

describe('connectColorPicker 输出', () => {
  it('取色区拇指是 role=slider，两条轴的位置写进内联样式', () => {
    const s = makeService({ defaultValue: '#3b82f6' })
    const thumb = api(s).getAreaThumbProps() as Dict
    expect(thumb.role).toBe('slider')
    expect(thumb['aria-valuemin']).toBe('0')
    expect(thumb['aria-valuemax']).toBe('100')
    expect(thumb['aria-valuenow']).toBe('76')
    expect(thumb['aria-valuetext']).toBe('Saturation 76%, brightness 96%')
    // 显式 false：省略是"没说"，读屏对两者的处理并不一样
    expect(thumb['aria-disabled']).toBe('false')
    expect(thumb.tabindex).toBe(0)
    expect(thumb.style).toEqual({ insetInlineStart: '76.02%', insetBlockStart: '3.53%' })
  })

  it('两条通道滑杆各自报自己的区间与单位', () => {
    const s = makeService({ defaultValue: '#3b82f6', alpha: true })
    const hue = api(s).getChannelSliderThumbProps({ channel: 'hue' }) as Dict
    expect(hue['aria-valuemin']).toBe('0')
    expect(hue['aria-valuemax']).toBe('360')
    expect(hue['aria-valuenow']).toBe('217')
    expect(hue['aria-valuetext']).toBe('217°')
    expect(hue['aria-label']).toBe('Hue')

    const alpha = api(s).getChannelSliderThumbProps({ channel: 'alpha' }) as Dict
    expect(alpha['aria-valuemax']).toBe('100')
    expect(alpha['aria-valuenow']).toBe('100')
    expect(alpha['aria-valuetext']).toBe('100%')
  })

  it('alpha 关掉时透明度那条整条不可用（含输入框）', () => {
    const s = makeService({ defaultValue: '#3b82f6' })
    const thumb = api(s).getChannelSliderThumbProps({ channel: 'alpha' }) as Dict
    expect(thumb['aria-disabled']).toBe('true')
    expect(thumb.tabindex).toBeUndefined()
    expect((api(s).getChannelInputProps({ channel: 'a' }) as Dict).disabled).toBe(true)
    // 色相那条不受影响
    expect((api(s).getChannelSliderThumbProps({ channel: 'hue' }) as Dict).tabindex).toBe(0)
  })

  it('disabled 抽掉 Tab 位；readOnly 保留 Tab 位但改不动', () => {
    const off = makeService({ defaultValue: '#3b82f6', disabled: true })
    const offThumb = api(off).getAreaThumbProps() as Dict
    expect(offThumb['aria-disabled']).toBe('true')
    expect(offThumb.tabindex).toBeUndefined()

    const ro = makeService({ defaultValue: '#3b82f6', readOnly: true })
    const roThumb = api(ro).getAreaThumbProps() as Dict
    // 与 disabled 的差别就在这里：仍在 Tab 序列里、仍被读屏念得到
    expect(roThumb['aria-disabled']).toBe('false')
    expect(roThumb.tabindex).toBe(0)
    ro.send({ type: 'AREA.STEP', axis: 'x', direction: 1 })
    expect(ro.context.get('value')).toBe('#3b82f6')
  })

  it('触发器与浮层：aria-expanded / aria-controls / hidden 随开合走', () => {
    const s = makeService()
    expect((api(s).getTriggerProps() as Dict)['aria-expanded']).toBe('false')
    expect((api(s).getContentProps() as Dict).hidden).toBe(true)
    s.send({ type: 'OPEN' })
    expect((api(s).getTriggerProps() as Dict)['aria-expanded']).toBe('true')
    // 收起时留在 DOM 只隐藏，不卸载作者节点
    expect((api(s).getContentProps() as Dict).hidden).toBeUndefined()
    expect((api(s).getContentProps() as Dict).role).toBe('dialog')
  })

  it('数值框：草稿收不下来时报 aria-invalid', () => {
    const s = makeService({ defaultValue: '#3b82f6' })
    expect((api(s).getChannelInputProps({ channel: 'hex' }) as Dict)['aria-invalid']).toBe('false')
    s.send({ type: 'INPUT.CHANGE', channel: 'hex', value: '#ff000' })
    const input = api(s).getChannelInputProps({ channel: 'hex' }) as Dict
    expect(input['aria-invalid']).toBe('true')
    expect(input.value).toBe('#ff000')
    expect(input['data-invalid']).toBe('')
  })

  it('预设色板：当前色那一格报 aria-pressed=true，点击即换色', () => {
    const s = makeService({ defaultValue: '#ff0000', swatches: ['#ff0000', '#00ff00'] })
    expect(api(s).swatches).toEqual(['#ff0000', '#00ff00'])
    expect(api(s).isSwatchSelected('#f00')).toBe(true)
    const red = api(s).getSwatchItemProps({ value: '#ff0000' }) as Dict
    const green = api(s).getSwatchItemProps({ value: '#00ff00' }) as Dict
    expect(red['aria-pressed']).toBe('true')
    expect(red['data-value']).toBe('#ff0000')
    expect(green['aria-pressed']).toBe('false')
    ;(green.onClick as () => void)()
    expect(rgbaOf(s)).toEqual({ r: 0, g: 255, b: 0, a: 1 })
  })

  it('透明度轨道的渐变收在内联样式里，色相轨道把它清空', () => {
    const s = makeService({ defaultValue: '#ff0000', alpha: true })
    const alphaTrack = api(s).getChannelSliderTrackProps({ channel: 'alpha' }) as Dict
    expect(alphaTrack.style).toEqual({
      backgroundImage: 'linear-gradient(to right, transparent, rgba(255, 0, 0, 1))',
    })
    // 两个适配器的内联样式必须逐帧一致：色相那条要显式写空串把上一帧的声明撤掉
    expect(api(s).getChannelSliderTrackProps({ channel: 'hue' }).style).toEqual({ backgroundImage: '' })
  })
})

describe('connectColorPicker 键盘', () => {
  it('取色区：方向键调两条轴，Shift 走大步，Home/End 取饱和度端点', () => {
    const s = makeService({ defaultValue: '#3b82f6' })
    const before = api(s).hsva

    expect(pressArea(s, 'ArrowRight').defaultPrevented).toBe(true)
    expect(api(s).hsva.s).toBeCloseTo(before.s + 1, 5)
    pressArea(s, 'ArrowLeft', { shiftKey: true })
    expect(api(s).hsva.s).toBeCloseTo(before.s - 9, 5)
    pressArea(s, 'ArrowUp')
    expect(api(s).hsva.v).toBeCloseTo(before.v + 1, 5)
    pressArea(s, 'ArrowDown')
    expect(api(s).hsva.v).toBeCloseTo(before.v, 5)
    pressArea(s, 'End')
    expect(api(s).hsva.s).toBe(100)
    pressArea(s, 'Home')
    expect(api(s).hsva.s).toBe(0)
  })

  it('rtl 下取色区左右两键对调，上下不受影响', () => {
    const s = makeService({ defaultValue: '#3b82f6', dir: 'rtl' })
    const before = api(s).hsva
    pressArea(s, 'ArrowLeft')
    expect(api(s).hsva.s).toBeCloseTo(before.s + 1, 5)
    pressArea(s, 'ArrowUp')
    expect(api(s).hsva.v).toBeCloseTo(before.v + 1, 5)
  })

  it('通道滑杆：方向键与 Home/End', () => {
    const s = makeService({ defaultValue: '#ff0000' })
    expect(pressChannel(s, 'hue', 'ArrowUp').defaultPrevented).toBe(true)
    expect(Math.round(api(s).hsva.h)).toBe(1)
    pressChannel(s, 'hue', 'ArrowRight', { shiftKey: true })
    expect(Math.round(api(s).hsva.h)).toBe(11)
    pressChannel(s, 'hue', 'End')
    expect(Math.round(api(s).hsva.h)).toBe(360)
  })

  it('带 Ctrl / Meta / Alt 的组合一律放行（那是浏览器与读屏的快捷键）', () => {
    const s = makeService({ defaultValue: '#3b82f6' })
    const before = s.context.get('value')
    const event = pressArea(s, 'Home', { ctrlKey: true })
    expect(event.defaultPrevented).toBe(false)
    expect(s.context.get('value')).toBe(before)
  })

  it('禁用与只读时不吞键：这一下该留给页面滚动', () => {
    for (const props of [{ disabled: true }, { readOnly: true }] as const) {
      const s = makeService({ defaultValue: '#3b82f6', ...props })
      const event = pressArea(s, 'ArrowRight')
      expect(event.defaultPrevented).toBe(false)
      expect(s.context.get('value')).toBe('#3b82f6')
      expect(pressChannel(s, 'hue', 'ArrowRight').defaultPrevented).toBe(false)
    }
  })

  it('数值框回车即收下，并拦住表单提交', () => {
    const s = makeService({ defaultValue: '#3b82f6' })
    s.send({ type: 'INPUT.CHANGE', channel: 'hex', value: '#ff0000' })
    const props = api(s).getChannelInputProps({ channel: 'hex' }) as Dict
    const event = keydown('Enter')
    ;(props.onKeyDown as (e: KeyboardEvent) => void)(event)
    expect(event.defaultPrevented).toBe(true)
    expect(api(s).inputText('hex')).toBe('#ff0000')
  })
})
