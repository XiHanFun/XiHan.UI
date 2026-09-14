// @vitest-environment jsdom

import type { ReactiveRuntime, Service } from '@xihan-ui/core'
import type { ExitLease } from '@xihan-ui/core/presence'
import type { ColorPickerChannel, ColorPickerSchema, ColorPickerServices } from '../src/color-picker'
import type { ColorSliderSchema, ColorSliderServices } from '../src/color-slider'
import type { SliderSchema } from '../src/slider'
import { createRuntimeConfig, createService, normalizeProps } from '@xihan-ui/core'
import { createPresence } from '@xihan-ui/core/presence'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { colorPickerAlphaSliderProps, colorPickerHueSliderProps, colorPickerMachine, colorPickerSwatchPickerProps, connectColorPicker } from '../src/color-picker'
import { colorSliderMachine, colorSliderSliderProps } from '../src/color-slider'
import { colorSwatchPickerMachine } from '../src/color-swatch-picker'
import { colorParse } from '../src/shared/color'
import { sliderMachine } from '../src/slider'

type Props = ColorPickerSchema['props']
type Dict = Record<string, unknown>

/**
 * 三件内嵌组件（两条颜色滑块各带一台滑杆、一台色块选择器），按根服务索引。
 * 用例照旧只拿根服务说话，连接层要的整份服务表由这里补齐。
 */
const sliderBundles = new WeakMap<Service<ColorPickerSchema>, ColorPickerServices>()

/** 给一台取色器补上两条颜色滑块与色板的机器；须在 runtime.start() 之前调。 */
function attachSliders(service: Service<ColorPickerSchema>, runtime: ReactiveRuntime): Service<ColorPickerSchema> {
  const make = (channel: ColorPickerChannel): ColorSliderServices => {
    const props = channel === 'hue' ? colorPickerHueSliderProps : colorPickerAlphaSliderProps
    const root = createService<ColorSliderSchema>(colorSliderMachine, { props: () => props(service), runtime })
    const slider = createService<SliderSchema>(sliderMachine, { props: () => colorSliderSliderProps(root), runtime })
    return { root, slider }
  }
  const swatchPicker = createService(colorSwatchPickerMachine, { props: () => colorPickerSwatchPickerProps(service), runtime })
  sliderBundles.set(service, { root: service, hueSlider: make('hue'), alphaSlider: make('alpha'), swatchPicker })
  return service
}

/** 推某条内嵌滑块的通道数值：与拇指上的键盘、轨道上的指针最后走的是同一条路。 */
function setChannel(service: Service<ColorPickerSchema>, channel: ColorPickerChannel, value: number): void {
  const bundle = servicesOf(service)
  ;(channel === 'hue' ? bundle.hueSlider : bundle.alphaSlider).root.send({ type: 'CHANNEL.SET', value })
}

function servicesOf(service: Service<ColorPickerSchema>): ColorPickerServices {
  const bundle = sliderBundles.get(service)
  if (!bundle)
    throw new Error('这台取色器没登记通道滑杆')
  return bundle
}

/** props 用可变对象承载：受控用例要在机器活着的时候从外面改写 value / open。 */
function makeService(props: Props = {}): Service<ColorPickerSchema> {
  const runtime = createVanillaRuntime()
  const service = attachSliders(createService(colorPickerMachine, { props: () => props, runtime }), runtime)
  runtime.start()
  return service
}

function api(service: Service<ColorPickerSchema>) {
  return connectColorPicker(servicesOf(service), normalizeProps)
}

/** 真实退场资源用的最小 DOM 与行为层接线。 */
function makePresenceService() {
  const runtime = createVanillaRuntime()
  const service = attachSliders(createService(colorPickerMachine, { props: () => ({}), runtime }), runtime)
  const root = document.createElement('div')
  const trigger = document.createElement('button')
  const positioner = document.createElement('div')
  const content = document.createElement('div')
  content.appendChild(document.createElement('button'))
  positioner.appendChild(content)
  root.append(trigger, positioner)
  document.body.appendChild(root)
  const config = createRuntimeConfig()
  const presence = createPresence({ config, open: false, onRenderedChange: () => {} })
  service.refs.set('config', config)
  service.refs.set('presence', presence)
  service.refs.set('registerLayer', () => config.layerRegistry.register({
    kind: 'popover',
    node: () => content,
    branches: () => [trigger],
    isModal: () => false,
    surfaces: () => [],
  }))
  service.refs.set('getAnchorEl', () => trigger)
  service.refs.set('getFloatingEl', () => positioner)
  service.refs.set('getContentEl', () => content)
  runtime.start()
  return { config, content, presence, root, runtime, service }
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
  const slider = channel === 'hue' ? api(service).hueSlider : api(service).alphaSlider
  const props = slider.getThumbProps() as Dict
  ;(props.onKeyDown as (e: KeyboardEvent) => void)(event)
  return event
}

/** 值串 → rgba，断言里用它比颜色，免得被写法差异绊倒。 */
function rgbaOf(service: Service<ColorPickerSchema>) {
  return colorParse(service.context.get('value'))
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

  // 两条内嵌滑块的部件带 color-slider 自己的 scope
  const makeSliderPart = (part: string): HTMLElement => {
    const el = document.createElement('div')
    el.setAttribute('data-scope', 'color-slider')
    el.setAttribute('data-part', part)
    return el
  }
  const sliders: Record<ColorPickerChannel, HTMLElement> = { hue: makeSliderPart('control'), alpha: makeSliderPart('control') }
  const tracks: Record<ColorPickerChannel, HTMLElement> = { hue: makeSliderPart('track'), alpha: makeSliderPart('track') }
  for (const channel of ['hue', 'alpha'] as const) {
    const thumb = makeSliderPart('thumb')
    thumb.tabIndex = 0
    sliders[channel].append(tracks[channel], thumb)
    // jsdom 不做布局，量出来恒是 0×0（几何那边会当作"还没布局"给 0）；摆一条 200px 的轨道
    stubRect(tracks[channel], { x: 0, y: 0, width: 200, height: 10 })
  }
  // 取色区摆成 200×100，横轴饱和度、纵轴明度
  stubRect(area, { x: 0, y: 0, width: 200, height: 100 })
  document.body.append(area, sliders.hue, sliders.alpha)

  service.refs.set('getAreaEl', () => area)
  // 通道的轨道矩形归各条滑块内嵌的那台滑杆量
  servicesOf(service).hueSlider.slider.refs.set('getTrackEl', () => tracks.hue)
  servicesOf(service).alphaSlider.slider.refs.set('getTrackEl', () => tracks.alpha)

  area.addEventListener('pointerdown', api(service).getSaturationAreaProps().onPointerDown as EventListener)
  for (const channel of ['hue', 'alpha'] as const) {
    const slider = channel === 'hue' ? api(service).hueSlider : api(service).alphaSlider
    sliders[channel].addEventListener('pointerdown', slider.getControlProps().onPointerDown as EventListener)
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

describe('colorPicker 真实退场资源', () => {
  it('逻辑关闭立即失活，行为资源等 Presence 完成才释放；中途重开复用原 Layer', () => {
    const h = makePresenceService()
    const leases: ExitLease[] = []
    const stopExit = h.presence.onBeforeExit(() => {
      leases.push(h.presence.claimExit(`color-picker exit ${leases.length + 1}`))
    })

    api(h.service).setOpen(true)
    const original = h.config.layerRegistry.list()[0]
    expect(original).toBeDefined()
    api(h.service).setOpen(false)
    const closing = api(h.service).getContentProps() as Dict
    expect(closing.inert).toBe(true)
    expect(closing['aria-hidden']).toBe(true)
    expect(h.config.layerRegistry.list()).toEqual([original])
    h.presence.update(false)
    expect(leases).toHaveLength(1)

    api(h.service).setOpen(true)
    expect(leases[0]!.settled).toBe(true)
    expect(h.config.layerRegistry.list()).toEqual([original])

    api(h.service).setOpen(false)
    h.presence.update(false)
    leases[1]!.done()
    expect(h.config.layerRegistry.list()).toHaveLength(0)

    stopExit()
    h.presence.dispose()
    h.runtime.stop()
    h.root.remove()
  })
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

  it('整体赋值解析失败时原地不动，并按来源留下可清理错误', () => {
    const onColorError = vi.fn()
    const s = makeService({ defaultValue: '#3b82f6', onColorError })
    s.send({ type: 'VALUE.SET', value: '#3b82f', source: 'swatch' })
    expect(s.context.get('value')).toBe('#3b82f6')
    expect(api(s).errors.parse).toEqual({ type: 'parse', source: 'swatch', value: '#3b82f' })
    expect(onColorError).toHaveBeenCalledWith({ type: 'parse', source: 'swatch', value: '#3b82f' })
    api(s).clearError()
    expect(api(s).errors.parse).toBeNull()
    s.send({ type: 'VALUE.SET', value: 'rgb(255, 0, 0)' })
    expect(rgbaOf(s)).toEqual({ r: 255, g: 0, b: 0, a: 1 })
  })

  it('未知 format 是独立错误，修正前不允许静默用 hex 落值', () => {
    const onColorError = vi.fn()
    const s = makeService({ defaultValue: '#3b82f6', format: 'oklch' as never, onColorError })
    expect(api(s).errors.format).toEqual({ type: 'format', format: 'oklch' })
    expect(onColorError).toHaveBeenCalledWith({ type: 'format', format: 'oklch' })
    s.send({ type: 'AREA.STEP', axis: 'x', direction: 1 })
    expect(s.context.get('value')).toBe('#3b82f6')
    expect(onColorError).toHaveBeenCalledTimes(1)
  })

  it('alpha 关掉时值恒不透明：透明度那条滑块整条禁用，推也推不动', () => {
    const s = makeService({ defaultValue: '#3b82f6' })
    setChannel(s, 'alpha', 30)
    expect(rgbaOf(s)?.a).toBe(1)
    expect(api(s).alphaSlider.disabled).toBe(true)

    const withAlpha = makeService({ defaultValue: '#3b82f6', alpha: true })
    setChannel(withAlpha, 'alpha', 30)
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

describe('colorPickerMachine 内嵌滑块', () => {
  it('推色相那条滑块，取色器落下整份工作色；两条滑块与取色器读的是同一个颜色', () => {
    const s = makeService({ defaultValue: '#ff0000' })
    setChannel(s, 'hue', 120)
    expect(rgbaOf(s)).toEqual({ r: 0, g: 255, b: 0, a: 1 })
    expect(api(s).hueSlider.channelValue).toBe(120)
    expect(api(s).hueSlider.value).toBe('#00ff00')
    expect(api(s).alphaSlider.value).toBe('#00ff00')
  })

  it('灰度处推色相：串不变但色相记下了，再把饱和度拉起来颜色就是那个色相', () => {
    // #808080 反解不出色相；推到 200 后串照旧是灰，取色区一拉饱和度就该是青蓝而不是红
    const s = makeService({ defaultValue: '#808080' })
    setChannel(s, 'hue', 200)
    expect(s.context.get('value')).toBe('#808080')
    expect(Math.round(api(s).hsva.h)).toBe(200)
    expect(api(s).hueSlider.channelValue).toBe(200)
    s.send({ type: 'AREA.TO_EDGE', axis: 'x', edge: 'max' })
    expect(Math.round(api(s).hsva.h)).toBe(200)
    expect(rgbaOf(s)).toEqual({ r: 0, g: 85, b: 128, a: 1 })
  })

  it('透明度那条按百分数走，值串带透明度', () => {
    const s = makeService({ defaultValue: '#ff0000', alpha: true })
    setChannel(s, 'alpha', 0)
    expect(rgbaOf(s)?.a).toBe(0)
    // 值串是八位十六进制，透明度到那儿会被量化成 1/255 的整数格，比不了太细
    setChannel(s, 'alpha', 10)
    expect(rgbaOf(s)?.a).toBeCloseTo(0.1, 2)
    setChannel(s, 'alpha', 100)
    expect(rgbaOf(s)?.a).toBe(1)
    expect(api(s).alphaSlider.channelValue).toBe(100)
  })

  it('推色相不会把透明度归 1：两条滑块共用同一份工作色', () => {
    const s = makeService({ defaultValue: '#ff000080', alpha: true })
    setChannel(s, 'hue', 240)
    expect(rgbaOf(s)?.a).toBeCloseTo(0.5, 2)
    expect(rgbaOf(s)?.b).toBe(255)
  })

  it('预设色板：挑一格即换色，当前色那一格按颜色比选中', () => {
    const s = makeService({ defaultValue: '#f00', swatches: ['#ff0000', '#00ff00'] })
    expect(api(s).swatchPicker.swatches.map(m => m.value)).toEqual(['#ff0000', '#00ff00'])
    expect(api(s).swatchPicker.isSelected('#ff0000')).toBe(true)
    expect(api(s).swatchPicker.isSelected('#00ff00')).toBe(false)
    servicesOf(s).swatchPicker.send({ type: 'ITEM.SELECT', value: '#00ff00' })
    expect(rgbaOf(s)).toEqual({ r: 0, g: 255, b: 0, a: 1 })
    expect(api(s).swatchPicker.isSelected('#00ff00')).toBe(true)
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

  it('非法提交保留草稿与错误，显式清理后才恢复规范文本', () => {
    const onColorError = vi.fn()
    const s = makeService({ defaultValue: '#3b82f6', onColorError })
    s.send({ type: 'INPUT.CHANGE', channel: 'hex', value: '#ff000' })
    s.send({ type: 'INPUT.COMMIT', channel: 'hex' })
    expect(s.context.get('value')).toBe('#3b82f6')
    expect(api(s).inputText('hex')).toBe('#ff000')
    expect(api(s).errors.input).toEqual({ type: 'input', channel: 'hex', value: '#ff000' })
    // change 与 commit 的同一个错误不得重复通知。
    expect(onColorError).toHaveBeenCalledTimes(1)
    api(s).clearError()
    expect(api(s).inputText('hex')).toBe('#3b82f6')
    expect(api(s).errors.input).toBeNull()
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
    const s = attachSliders(createService(colorPickerMachine, {
      props: () => ({ value: value.get(), onValueChange }),
      runtime,
    }), runtime)
    runtime.start()

    setChannel(s, 'hue', 120)
    expect(s.context.get('value')).toBe('#ff0000')
    expect(onValueChange).toHaveBeenCalledWith({ value: '#00ff00' })
    // 受控下界面不许自作主张：工作色仍是宿主给的那个
    expect(Math.round(api(s).hsva.h)).toBe(0)

    value.set('#00ff00')
    expect(Math.round(api(s).hsva.h)).toBe(120)
  })

  it('宿主写入新值会丢弃旧草稿与旧输入错误，旧提交不能污染新值', () => {
    const runtime = createVanillaRuntime()
    const value = runtime.signal('#ff0000')
    const s = attachSliders(createService(colorPickerMachine, {
      props: () => ({ value: value.get() }),
      runtime,
    }), runtime)
    runtime.start()

    s.send({ type: 'INPUT.CHANGE', channel: 'hex', value: '#00ff0' })
    expect(api(s).errors.input).not.toBeNull()
    value.set('#0000ff')
    expect(api(s).inputText('hex')).toBe('#0000ff')
    expect(api(s).errors.input).toBeNull()
    s.send({ type: 'INPUT.COMMIT', channel: 'hex' })
    expect(s.context.get('value')).toBe('#0000ff')
  })

  it('受控 open：只发意图，宿主写回才转移', () => {
    const onOpenChange = vi.fn()
    const runtime = createVanillaRuntime()
    const open = runtime.signal(false)
    const s = attachSliders(createService(colorPickerMachine, {
      props: () => ({ open: open.get(), onOpenChange }),
      runtime,
    }), runtime)
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

  it('取到颜色就落值，用户放弃则原地不动且不报异常', async () => {
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
    reject(new DOMException('用户按了 Esc', 'AbortError'))
    await Promise.resolve()
    await Promise.resolve()
    expect(s.context.get('value')).toBe('#ff0000')
    expect(s.state.matches('open.idle')).toBe(true)
    expect(api(s).errors.eyeDropper).toBeNull()
  })

  it('屏幕取色异常走独立错误出口，重试前清理并可成功', async () => {
    const pending: Array<{
      resolve: (result: { sRGBHex: string }) => void
      reject: (reason: unknown) => void
    }> = []
    Reflect.set(window, 'EyeDropper', class {
      open(): Promise<{ sRGBHex: string }> {
        return new Promise((resolve, reject) => pending.push({ resolve, reject }))
      }
    })
    const onColorError = vi.fn()
    const s = makeService({ defaultValue: '#000000', defaultOpen: true, onColorError })

    s.send({ type: 'EYE_DROPPER.OPEN' })
    const cause = new Error('平台取色失败')
    pending[0]!.reject(cause)
    await Promise.resolve()
    await Promise.resolve()
    expect(api(s).errors.eyeDropper).toEqual({ type: 'eye-dropper', cause })
    expect(onColorError).toHaveBeenCalledWith({ type: 'eye-dropper', cause })

    s.send({ type: 'EYE_DROPPER.OPEN' })
    expect(api(s).errors.eyeDropper).toBeNull()
    pending[1]!.resolve({ sRGBHex: '#00ff00' })
    await Promise.resolve()
    await Promise.resolve()
    expect(s.context.get('value')).toBe('#00ff00')
  })

  it('屏幕取色返回非法颜色走解析错误，下一次重试会清掉旧诊断', async () => {
    const pending: Array<(result: { sRGBHex: string }) => void> = []
    Reflect.set(window, 'EyeDropper', class {
      open(): Promise<{ sRGBHex: string }> {
        return new Promise(resolve => pending.push(resolve))
      }
    })
    const onColorError = vi.fn()
    const s = makeService({ defaultValue: '#000000', defaultOpen: true, onColorError })

    s.send({ type: 'EYE_DROPPER.OPEN' })
    pending[0]!({ sRGBHex: '不是颜色' })
    await Promise.resolve()
    await Promise.resolve()
    expect(api(s).errors.parse).toEqual({ type: 'parse', source: 'eye-dropper', value: '不是颜色' })
    expect(onColorError).toHaveBeenCalledWith({ type: 'parse', source: 'eye-dropper', value: '不是颜色' })

    s.send({ type: 'EYE_DROPPER.OPEN' })
    expect(api(s).errors.parse).toBeNull()
  })

  it('上一次取色的迟到结果不得污染本次结果', async () => {
    const pending: Array<(result: { sRGBHex: string }) => void> = []
    Reflect.set(window, 'EyeDropper', class {
      open(): Promise<{ sRGBHex: string }> {
        return new Promise(resolve => pending.push(resolve))
      }
    })
    const s = makeService({ defaultValue: '#000000', defaultOpen: true })

    s.send({ type: 'EYE_DROPPER.OPEN' })
    s.send({ type: 'CLOSE' })
    s.send({ type: 'OPEN' })
    s.send({ type: 'EYE_DROPPER.OPEN' })
    pending[0]!({ sRGBHex: '#ff0000' })
    await Promise.resolve()
    await Promise.resolve()
    expect(s.context.get('value')).toBe('#000000')
    pending[1]!({ sRGBHex: '#00ff00' })
    await Promise.resolve()
    await Promise.resolve()
    expect(s.context.get('value')).toBe('#00ff00')
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

  it('两条内嵌滑块各自报自己的区间、单位与名字，文案取自取色器的文案桶', () => {
    const s = makeService({ defaultValue: '#3b82f6', alpha: true })
    const hue = api(s).hueSlider.getThumbProps() as Dict
    expect(hue['aria-valuemin']).toBe('0')
    expect(hue['aria-valuemax']).toBe('360')
    expect(hue['aria-valuenow']).toBe('217')
    expect(hue['aria-valuetext']).toBe('217°')
    expect(hue['aria-label']).toBe('Hue')

    const alpha = api(s).alphaSlider.getThumbProps() as Dict
    expect(alpha['aria-valuemax']).toBe('100')
    expect(alpha['aria-valuenow']).toBe('100')
    expect(alpha['aria-valuetext']).toBe('100%')
    expect(alpha['aria-label']).toBe('Alpha')

    const custom = makeService({
      defaultValue: '#3b82f6',
      translations: { channel: c => (c === 'hue' ? '色相' : '透明度'), channelValueText: (c, v) => `${c} ${v}` },
    })
    expect((api(custom).hueSlider.getThumbProps() as Dict)['aria-label']).toBe('色相')
    expect((api(custom).hueSlider.getThumbProps() as Dict)['aria-valuetext']).toBe('hue 217')
  })

  it('挂载点同时充当内嵌根节点：滑块 root 的状态标记照抄，scope 与部件名是取色器自己的', () => {
    const s = makeService({ defaultValue: '#3b82f6', size: 'lg' })
    const hue = api(s).getHueSliderProps() as Dict
    expect(hue['data-scope']).toBe('color-picker')
    expect(hue['data-part']).toBe('hue-slider')
    expect(hue['data-channel']).toBe('hue')
    expect(hue['data-orientation']).toBe('horizontal')
    expect(hue['data-size']).toBe('lg')
    expect(hue['data-disabled']).toBeUndefined()
    // 色板的挂载点带着 radiogroup 的角色与兜底 Tab 位
    const swatches = api(s).getSwatchPickerProps() as Dict
    expect(swatches['data-scope']).toBe('color-picker')
    expect(swatches['data-part']).toBe('swatch-picker')
    expect(swatches.role).toBe('radiogroup')
    expect(swatches.tabindex).toBe(0)
    expect(typeof swatches.onKeyDown).toBe('function')
  })

  it('alpha 关掉时透明度那条整条不可用（含输入框与挂载点）', () => {
    const s = makeService({ defaultValue: '#3b82f6' })
    const thumb = api(s).alphaSlider.getThumbProps() as Dict
    expect(thumb['aria-disabled']).toBe('true')
    expect(thumb.tabindex).toBeUndefined()
    expect((api(s).getAlphaSliderProps() as Dict)['data-disabled']).toBe('')
    expect((api(s).getChannelInputProps({ channel: 'a' }) as Dict).disabled).toBe(true)
    // 色相那条不受影响
    expect((api(s).hueSlider.getThumbProps() as Dict).tabindex).toBe(0)
    expect((api(s).getHueSliderProps() as Dict)['data-disabled']).toBeUndefined()
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

  it('预设色板：当前色那一格是 role=radio 且 aria-checked=true，点击即换色', () => {
    const s = makeService({ defaultValue: '#ff0000', swatches: ['#ff0000', '#00ff00'] })
    expect(api(s).swatches).toEqual(['#ff0000', '#00ff00'])
    const red = api(s).swatchPicker.getItemProps({ value: '#ff0000' }) as Dict
    const green = api(s).swatchPicker.getItemProps({ value: '#00ff00' }) as Dict
    expect(red.role).toBe('radio')
    expect(red['aria-checked']).toBe('true')
    expect(red['data-value']).toBe('#ff0000')
    expect(green['aria-checked']).toBe('false')
    ;(green.onClick as () => void)()
    expect(rgbaOf(s)).toEqual({ r: 0, g: 255, b: 0, a: 1 })
    expect(api(s).swatchPicker.isSelected('#0f0')).toBe(true)
  })

  it('禁用与只读时色板挑不动：格子标 data-disabled / data-readonly，点击不落值', () => {
    for (const props of [{ disabled: true }, { readOnly: true }] as const) {
      const s = makeService({ defaultValue: '#ff0000', swatches: ['#ff0000', '#00ff00'], ...props })
      const green = api(s).swatchPicker.getItemProps({ value: '#00ff00' }) as Dict
      expect(green['data-disabled'] ?? green['data-readonly']).toBe('')
      ;(green.onClick as () => void)()
      expect(s.context.get('value')).toBe('#ff0000')
    }
  })

  it('两条轨道的渐变收在内联样式里：透明度从全透明走到实色，色相走满七段', () => {
    const s = makeService({ defaultValue: '#ff0000', alpha: true })
    const alphaTrack = api(s).alphaSlider.getTrackProps() as Dict
    expect((alphaTrack.style as Dict).backgroundImage).toBe('linear-gradient(to right, rgba(255, 0, 0, 0), rgba(255, 0, 0, 1))')
    const hueTrack = api(s).hueSlider.getTrackProps() as Dict
    expect(String((hueTrack.style as Dict).backgroundImage)).toContain('linear-gradient(to right, hsl(0')
  })

  it('触发钮里的色块走 Swatch 家族：带家族属性，颜色写进私有槽，解析不出的串不画颜色层', () => {
    const s = makeService({ defaultValue: '#ff000080', alpha: true, size: 'sm' })
    const swatch = api(s).getSwatchProps() as Dict
    expect(swatch['data-xh-swatch']).toBe('')
    expect(swatch['data-xh-swatch-size']).toBe('sm')
    expect(swatch.style).toEqual({ '--xh-_swatch-color': 'rgba(255, 0, 0, 0.502)' })
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

  it('内嵌滑块的拇指上按方向键与 Home/End，取色器跟着落值', () => {
    const s = makeService({ defaultValue: '#ff0000' })
    expect(pressChannel(s, 'hue', 'ArrowUp').defaultPrevented).toBe(true)
    expect(Math.round(api(s).hsva.h)).toBe(1)
    pressChannel(s, 'hue', 'PageUp')
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

// 通道滑杆三件套的现状判据：属性、键盘、指针三面各钉一遍。
describe('connectColorPicker 内嵌滑块的指针', () => {
  it('按下滑块的 control 把焦点转投到它的拇指上，拖动期间取色器与那条滑块都报 dragging', () => {
    const s = makeService({ defaultValue: '#ff0000', defaultOpen: true })
    const rig = mountRig(s)

    rig.pressChannel('hue', 100)
    expect(document.activeElement?.getAttribute('data-part')).toBe('thumb')
    expect(api(s).dragging).toBe(true)
    expect(api(s).hueSlider.dragging).toBe(true)
    // 另一条滑块与取色区都不该跟着亮
    expect(api(s).alphaSlider.dragging).toBe(false)
    expect((api(s).getSaturationAreaProps() as Dict)['data-dragging']).toBeUndefined()

    movePointer(200)
    expect(Math.round(api(s).hsva.h)).toBe(360)
    releasePointer()
    expect(api(s).dragging).toBe(false)

    // 松手后监听器撤干净，再动指针值不跟
    const settled = s.context.get('value')
    movePointer(0)
    expect(s.context.get('value')).toBe(settled)
  })

  it('只读、禁用、以及 alpha 关掉时按下滑块都不改值', () => {
    for (const props of [{ readOnly: true }, { disabled: true }] as const) {
      const s = makeService({ defaultValue: '#ff0000', alpha: true, defaultOpen: true, ...props })
      const rig = mountRig(s)
      rig.pressChannel('hue', 100)
      expect(s.context.get('value')).toBe('#ff0000')
      expect(api(s).dragging).toBe(false)
      document.body.innerHTML = ''
    }
    const off = makeService({ defaultValue: '#ff0000', defaultOpen: true })
    const rig = mountRig(off)
    rig.pressChannel('alpha', 100)
    expect(off.context.get('value')).toBe('#ff0000')
    expect(api(off).dragging).toBe(false)
  })

  it('非主键按下不接管', () => {
    const s = makeService({ defaultValue: '#ff0000', defaultOpen: true })
    const rig = mountRig(s)
    rig.hue.dispatchEvent(new PointerEvent('pointerdown', { clientX: 100, clientY: 5, button: 2, bubbles: true }))
    expect(s.context.get('value')).toBe('#ff0000')
    expect(api(s).dragging).toBe(false)
  })
})
