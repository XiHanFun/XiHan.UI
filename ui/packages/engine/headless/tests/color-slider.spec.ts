// @vitest-environment jsdom

import type { Service } from '@xihan-ui/core'
import type { ColorSliderSchema, ColorSliderServices } from '../src/color-slider'
import { createService, normalizeProps } from '@xihan-ui/core'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'
import { describe, expect, it, vi } from 'vitest'
import { colorSliderAlpha, colorSliderMachine, colorSliderSliderProps, colorSliderTrackGradient, colorSliderTrackStops, connectColorSlider } from '../src/color-slider'
import { sliderMachine } from '../src/slider'

type Props = ColorSliderSchema['props']
type Dict = Record<string, unknown>

/** props 用可变对象承载：受控用例要在机器活着的时候从外面改写 value。 */
function makeServices(props: Props = {}): ColorSliderServices {
  const runtime = createVanillaRuntime()
  const root: Service<ColorSliderSchema> = createService(colorSliderMachine, { props: () => props, runtime })
  const slider = createService(sliderMachine, { props: () => colorSliderSliderProps(root), runtime })
  runtime.start()
  return { root, slider }
}

function api(services: ColorSliderServices) {
  return connectColorSlider(services, normalizeProps)
}

describe('colorSliderMachine 值与通道', () => {
  it('受控 hsva：灰度串本身没有色相，滑块按宿主给的工作色定位并推色相', () => {
    const onValueChange = vi.fn()
    // #808080 反解出来色相是 0；宿主说它的色相其实是 200
    const s = makeServices({ value: '#808080', hsva: { h: 200, s: 0, v: 50, a: 1 }, onValueChange })
    expect(api(s).channelValue).toBe(200)
    expect(api(s).hsva).toEqual({ h: 200, s: 0, v: 50, a: 1 })
    s.root.send({ type: 'CHANNEL.SET', value: 90 })
    // 串照旧是灰（饱和度为 0），但回调里的工作色带着推出来的色相
    expect(onValueChange).toHaveBeenLastCalledWith({ value: '#808080', hsva: { h: 90, s: 0, v: 50, a: 1 } })
  })

  it('默认推色相：值串的色相角就是通道数值，推一下按 hex 写回', () => {
    const onValueChange = vi.fn()
    const s = makeServices({ defaultValue: '#ff0000', onValueChange })
    expect(api(s).channel).toBe('hue')
    expect(api(s).channelValue).toBe(0)
    expect(api(s).min).toBe(0)
    expect(api(s).max).toBe(360)
    s.root.send({ type: 'CHANNEL.SET', value: 120 })
    expect(api(s).value).toBe('#00ff00')
    expect(api(s).channelValue).toBe(120)
    expect(onValueChange).toHaveBeenLastCalledWith({ value: '#00ff00', hsva: { h: 120, s: 100, v: 100, a: 1 } })
  })

  it('推透明度那一路默认带透明度，其余通道默认把透明度归 1；显式 alpha 以它为准', () => {
    expect(colorSliderAlpha({ channel: 'alpha' })).toBe(true)
    expect(colorSliderAlpha({ channel: 'hue' })).toBe(false)
    expect(colorSliderAlpha({ channel: 'hue', alpha: true })).toBe(true)
    const a = makeServices({ defaultValue: '#ff000080', channel: 'alpha' })
    expect(api(a).channelValue).toBe(50)
    a.root.send({ type: 'CHANNEL.SET', value: 25 })
    expect(api(a).value).toBe('#ff000040')
    // 推色相时不带透明度：写回的串把透明度归 1
    const h = makeServices({ defaultValue: '#ff000080' })
    h.root.send({ type: 'CHANNEL.SET', value: 240 })
    expect(api(h).value).toBe('#0000ff')
    // 显式 alpha 时保留透明度，与一条透明度滑块并排才不互相踩
    const keep = makeServices({ defaultValue: '#ff000080', alpha: true })
    keep.root.send({ type: 'CHANNEL.SET', value: 240 })
    expect(api(keep).value).toBe('#0000ff80')
  })

  it('红绿蓝走 RGB 空间：只动那一路，format 决定写法', () => {
    const s = makeServices({ defaultValue: 'rgba(10, 20, 30, 1)', channel: 'green', format: 'rgba' })
    expect(api(s).channelValue).toBe(20)
    expect(api(s).max).toBe(255)
    s.root.send({ type: 'CHANNEL.SET', value: 200 })
    expect(api(s).value).toBe('rgba(10, 200, 30, 1)')
  })

  it('把明度推到 0（纯黑）再拉回来，色相靠锚保住', () => {
    const s = makeServices({ defaultValue: '#00ff00', channel: 'brightness' })
    s.root.send({ type: 'CHANNEL.SET', value: 0 })
    expect(api(s).value).toBe('#000000')
    s.root.send({ type: 'CHANNEL.SET', value: 100 })
    expect(api(s).value).toBe('#00ff00')
  })

  it('整体赋值：解析不出的串原地不动，合法的串换掉颜色但沿用当前色相作灰度的兜底', () => {
    const s = makeServices({ defaultValue: '#ff0000', channel: 'saturation' })
    s.root.send({ type: 'VALUE.SET', value: 'red' })
    expect(api(s).value).toBe('#ff0000')
    s.root.send({ type: 'VALUE.SET', value: 'hsl(120, 100%, 50%)' })
    expect(api(s).value).toBe('#00ff00')
    expect(api(s).channelValue).toBe(100)
  })

  it('受控：推动只发回调不落内部值；宿主写回后内嵌滑杆跟着走', () => {
    const onValueChange = vi.fn()
    const props: Props = { value: '#ff0000', onValueChange }
    const s = makeServices(props)
    s.root.send({ type: 'CHANNEL.SET', value: 180 })
    expect(onValueChange).toHaveBeenCalledWith({ value: '#00ffff', hsva: { h: 180, s: 100, v: 100, a: 1 } })
    expect(api(s).value).toBe('#ff0000')
    expect(s.slider.context.get('value')).toEqual([0])
    props.value = '#00ffff'
    expect(api(s).channelValue).toBe(180)
    expect(colorSliderSliderProps(s.root).value).toEqual([180])
  })

  it('禁用与只读都推不动；表单重置回到默认值', () => {
    const disabled = makeServices({ defaultValue: '#ff0000', disabled: true })
    disabled.root.send({ type: 'CHANNEL.SET', value: 90 })
    expect(api(disabled).value).toBe('#ff0000')
    const readOnly = makeServices({ defaultValue: '#ff0000', readOnly: true })
    readOnly.root.send({ type: 'VALUE.SET', value: '#00ff00' })
    expect(api(readOnly).value).toBe('#ff0000')
    const s = makeServices({ defaultValue: '#ff0000' })
    s.root.send({ type: 'CHANNEL.SET', value: 60 })
    expect(api(s).value).toBe('#ffff00')
    s.root.send({ type: 'FORM.RESET' })
    expect(api(s).value).toBe('#ff0000')
  })

  it('一次推动结束转发 onValueChangeEnd，带当时的串', () => {
    const onValueChangeEnd = vi.fn()
    const s = makeServices({ defaultValue: '#ff0000', onValueChangeEnd })
    s.root.send({ type: 'CHANNEL.SET', value: 60 })
    s.root.send({ type: 'CHANGE.END' })
    expect(onValueChangeEnd).toHaveBeenCalledWith({ value: '#ffff00', hsva: { h: 60, s: 100, v: 100, a: 1 } })
  })
})

describe('轨道渐变', () => {
  const hsva = { h: 0, s: 100, v: 100, a: 1 }

  it('色相走满七段等分角度；其余通道两端各一色、透明度以外的把 alpha 归 1', () => {
    expect(colorSliderTrackStops(hsva, 'hue')).toHaveLength(7)
    expect(colorSliderTrackStops(hsva, 'hue')[0]).toBe('hsl(0, 100%, 50%)')
    expect(colorSliderTrackStops(hsva, 'saturation')).toEqual(['rgba(255, 255, 255, 1)', 'rgba(255, 0, 0, 1)'])
    expect(colorSliderTrackStops(hsva, 'brightness')).toEqual(['rgba(0, 0, 0, 1)', 'rgba(255, 0, 0, 1)'])
    expect(colorSliderTrackStops({ ...hsva, a: 0.5 }, 'alpha')).toEqual(['rgba(255, 0, 0, 0)', 'rgba(255, 0, 0, 1)'])
    expect(colorSliderTrackStops({ ...hsva, a: 0.5 }, 'blue')).toEqual(['rgba(255, 0, 0, 1)', 'rgba(255, 0, 255, 1)'])
  })

  it('方向由调用方给', () => {
    expect(colorSliderTrackGradient(hsva, 'brightness', 'left')).toBe('linear-gradient(to left, rgba(0, 0, 0, 1), rgba(255, 0, 0, 1))')
  })
})

describe('connectColorSlider 投影', () => {
  it('拇指报区间、数值与带单位的播报文本；位置按未取整的工作色算', () => {
    const s = makeServices({ defaultValue: 'hsl(120, 100%, 50%)' })
    const thumb = api(s).getThumbProps() as Dict
    expect(thumb).toMatchObject({
      'role': 'slider',
      'aria-valuemin': '0',
      'aria-valuemax': '360',
      'aria-valuenow': '120',
      'aria-valuetext': '120°',
      'aria-label': 'Hue',
      'aria-orientation': 'horizontal',
      'tabindex': 0,
      'data-channel': 'hue',
    })
    expect((thumb.style as Dict).insetInlineStart).toBe('33.33%')
    expect((thumb.style as Dict)['--xh-_color-slider-thumb-color']).toBe('rgba(0, 255, 0, 1)')
  })

  it('轨道渐变写成内联 background-image，竖直恒向上、RTL 水平向左', () => {
    const ltr = api(makeServices({ defaultValue: '#ff0000', channel: 'brightness' })).getTrackProps() as Dict
    expect((ltr.style as Dict).backgroundImage).toBe('linear-gradient(to right, rgba(0, 0, 0, 1), rgba(255, 0, 0, 1))')
    const rtl = api(makeServices({ defaultValue: '#ff0000', channel: 'brightness', dir: 'rtl' })).getTrackProps() as Dict
    expect((rtl.style as Dict).backgroundImage).toContain('to left')
    const vertical = api(makeServices({ defaultValue: '#ff0000', channel: 'brightness', orientation: 'vertical' }))
    expect(((vertical.getTrackProps() as Dict).style as Dict).backgroundImage).toContain('to top')
    expect(((vertical.getThumbProps() as Dict).style as Dict).insetBlockEnd).toBe('100%')
  })

  it('禁用抽 Tab 位、只读不抽；表单影子给了 name 才参与提交', () => {
    const disabled = api(makeServices({ defaultValue: '#ff0000', disabled: true }))
    expect((disabled.getThumbProps() as Dict).tabindex).toBeUndefined()
    expect((disabled.getThumbProps() as Dict)['aria-disabled']).toBe('true')
    expect((disabled.getHiddenInputProps() as Dict).disabled).toBe(true)
    const readOnly = api(makeServices({ defaultValue: '#ff0000', readOnly: true }))
    expect((readOnly.getThumbProps() as Dict).tabindex).toBe(0)
    const named = api(makeServices({ defaultValue: '#ff0000', name: 'accent' }))
    expect(named.getHiddenInputProps()).toMatchObject({ type: 'hidden', name: 'accent', value: '#ff0000' })
    expect((api(makeServices({ defaultValue: '#ff0000' })).getHiddenInputProps() as Dict).name).toBeUndefined()
  })

  it('拇指上的键盘由内嵌滑杆接手：方向键走一格、PageUp 走十格、Home/End 取端点', () => {
    const s = makeServices({ defaultValue: '#ff0000' })
    const key = (k: string): void => {
      const thumb = api(s).getThumbProps() as Dict
      ;(thumb.onKeyDown as (e: KeyboardEvent) => void)(new KeyboardEvent('keydown', { key: k, cancelable: true }))
    }
    key('ArrowRight')
    expect(api(s).channelValue).toBe(1)
    key('PageUp')
    expect(api(s).channelValue).toBe(11)
    key('End')
    expect(api(s).channelValue).toBe(360)
    key('Home')
    expect(api(s).channelValue).toBe(0)
  })
})
