// @vitest-environment jsdom
// 颜色选择器的 lazyMount / unmountOnExit：content 里的面板第一次展开时才挂、退场播完按 unmountOnExit 卸；
// inline 常驻形态恒挂载；标准结构按判定铺不铺面板。
import type { ColorPickerChannel, ColorPickerSchema, ColorPickerServices } from '../src/color-picker'
import type { ColorSliderSchema, ColorSliderServices } from '../src/color-slider'
import type { StructureChild, StructureNode } from '../src/shared/structure'
import type { SliderSchema } from '../src/slider'
import { createService, normalizeProps } from '@xihan-ui/core'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'
import { describe, expect, it } from 'vitest'
import { colorPickerAlphaSliderProps, colorPickerHueSliderProps, colorPickerMachine, colorPickerRecentSwatchPickerProps, colorPickerStructure, colorPickerSwatchPickerProps, connectColorPicker } from '../src/color-picker'
import { colorSliderMachine, colorSliderSliderProps } from '../src/color-slider'
import { colorSwatchPickerMachine } from '../src/color-swatch-picker'
import { sliderMachine } from '../src/slider'

function makeServices(props: ColorPickerSchema['props'] = {}): ColorPickerServices {
  const runtime = createVanillaRuntime()
  const root = createService(colorPickerMachine, { props: () => props, runtime })
  const slider = (channel: ColorPickerChannel): ColorSliderServices => {
    const read = channel === 'hue' ? colorPickerHueSliderProps : colorPickerAlphaSliderProps
    const bar = createService<ColorSliderSchema>(colorSliderMachine, { props: () => read(root), runtime })
    return { root: bar, slider: createService<SliderSchema>(sliderMachine, { props: () => colorSliderSliderProps(bar), runtime }) }
  }
  const services: ColorPickerServices = {
    root,
    hueSlider: slider('hue'),
    alphaSlider: slider('alpha'),
    swatchPicker: createService(colorSwatchPickerMachine, { props: () => colorPickerSwatchPickerProps(root), runtime }),
    recentSwatchPicker: createService(colorSwatchPickerMachine, { props: () => colorPickerRecentSwatchPickerProps(root), runtime }),
  }
  runtime.start()
  return services
}

const api = (services: ColorPickerServices) => connectColorPicker(services, normalizeProps)

function contentChildren(nodes: StructureChild[]): number {
  const find = (list: readonly StructureChild[] | undefined): StructureNode | undefined => {
    for (const node of list ?? []) {
      if (!('part' in node))
        continue
      if (node.part === 'content')
        return node
      const hit = find(node.children)
      if (hit)
        return hit
    }
    return undefined
  }
  return find(nodes)?.children?.length ?? -1
}

describe('color-picker lazyMount / unmountOnExit', () => {
  it('缺省恒挂载', () => {
    expect(api(makeServices()).isContentMounted(false)).toBe(true)
  })

  it('lazyMount：没展开过不挂，第一次展开起一直挂着', () => {
    const s = makeServices({ lazyMount: true })
    expect(api(s).isContentMounted(false)).toBe(false)
    s.root.send({ type: 'OPEN' })
    expect(api(s).isContentMounted(true)).toBe(true)
    s.root.send({ type: 'CLOSE' })
    expect(api(s).isContentMounted(false)).toBe(true)
  })

  it('unmountOnExit：退场闸门还开着照样挂着，闸门落下即卸', () => {
    const s = makeServices({ unmountOnExit: true })
    s.root.send({ type: 'OPEN' })
    s.root.send({ type: 'CLOSE' })
    expect(api(s).isContentMounted(true)).toBe(true)
    expect(api(s).isContentMounted(false)).toBe(false)
  })

  it('inline 常驻形态：两项都不起作用，面板恒挂载', () => {
    expect(api(makeServices({ inline: true, lazyMount: true, unmountOnExit: true })).isContentMounted(false)).toBe(true)
  })

  it('标准结构：判为不挂时 content 节点照旧铺，面板不铺', () => {
    const s = makeServices({ lazyMount: true })
    expect(contentChildren(colorPickerStructure(api(s), { contentMounted: false }))).toBe(0)
    expect(contentChildren(colorPickerStructure(api(s)))).toBeGreaterThan(0)
  })
})
