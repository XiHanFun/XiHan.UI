/**
 * 指针拖动要真实的活 DOM：视口矩形是在事件那一刻现量的，纯逻辑环境里演不出来。
 *
 * @vitest-environment jsdom
 */

import type { Service } from '@xihan-ui/core'
import type { ImageCropperHandlePosition, ImageCropperRect, ImageCropperSchema } from '../src/image-cropper'
import { createService, normalizeProps } from '@xihan-ui/core'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  connectImageCropper,
  CROP_HANDLES,
  cropToCanvas,
  imageCropperMachine,
  initialCropRect,
  moveCropRect,
  normalizeCropRect,
  parseCropRect,
  resizeCropRect,
  resolveAspectRatio,
  screenStepToImage,
  serializeCropRect,
  unprojectDelta,
} from '../src/image-cropper'

type Props = ImageCropperSchema['props']
type Dict = Record<string, unknown>

const IMAGE = { width: 400, height: 200 }
const FREE = { bounds: IMAGE, minWidth: 0, minHeight: 0, aspectRatio: null }

/** props 用可变对象承载：受控用例要在机器活着的时候从外面改写 value。 */
function makeService(props: Props = {}): Service<ImageCropperSchema> {
  const runtime = createVanillaRuntime()
  const service = createService(imageCropperMachine, { props: () => props, runtime })
  runtime.start()
  return service
}

function api(service: Service<ImageCropperSchema>) {
  return connectImageCropper(service, normalizeProps)
}

/** 图片加载完成：自然尺寸只能由 image 部件的 load 事件报进来。 */
function load(service: Service<ImageCropperSchema>, size = IMAGE): void {
  const img = document.createElement('img')
  Object.defineProperty(img, 'naturalWidth', { value: size.width })
  Object.defineProperty(img, 'naturalHeight', { value: size.height })
  const handler = (api(service).getImageProps() as Dict).onLoad as (e: Event) => void
  handler({ currentTarget: img } as unknown as Event)
}

function crop(service: Service<ImageCropperSchema>): ImageCropperRect {
  return api(service).value
}

function keydown(key: string, init: KeyboardEventInit = {}): KeyboardEvent {
  return new KeyboardEvent('keydown', { key, cancelable: true, bubbles: true, ...init })
}

function pressOnCropArea(service: Service<ImageCropperSchema>, key: string, init?: KeyboardEventInit): KeyboardEvent {
  const event = keydown(key, init)
  ;((api(service).getCropAreaProps() as Dict).onKeyDown as (e: KeyboardEvent) => void)(event)
  return event
}

function pressOnHandle(service: Service<ImageCropperSchema>, position: ImageCropperHandlePosition, key: string, init?: KeyboardEventInit): KeyboardEvent {
  const event = keydown(key, init)
  ;((api(service).getCropHandleProps({ position }) as Dict).onKeyDown as (e: KeyboardEvent) => void)(event)
  return event
}

// ── 拖动用的一套真实节点：视口矩形由测试自己摆，机器在事件那一刻现量 ──

interface Rig {
  viewport: HTMLElement
  cropArea: HTMLElement
  handle: HTMLElement
  /** 在指定节点上按下主键。 */
  press: (el: HTMLElement, clientX: number, clientY: number) => void
  move: (clientX: number, clientY: number) => void
  release: () => void
}

/** 视口摆成 400×200 的 CSS 像素，与默认图片自然尺寸 1:1，位移换算因此是恒等的。 */
function mountRig(service: Service<ImageCropperSchema>, position: ImageCropperHandlePosition = 'se'): Rig {
  const make = (part: string, tag = 'div'): HTMLElement => {
    const el = document.createElement(tag)
    el.setAttribute('data-scope', 'image-cropper')
    el.setAttribute('data-part', part)
    return el
  }
  const viewport = make('viewport')
  const cropArea = make('crop-area')
  const handle = make('crop-handle', 'button')
  cropArea.append(handle)
  viewport.append(cropArea)
  document.body.append(viewport)

  // jsdom 不做布局，量出来恒是 0×0，位移换算会当成"尺子还没就位"原地不动
  viewport.getBoundingClientRect = () => ({
    x: 0,
    y: 0,
    width: 400,
    height: 200,
    top: 0,
    left: 0,
    right: 400,
    bottom: 200,
    toJSON: () => ({}),
  }) as DOMRect
  service.refs.set('getViewportEl', () => viewport)

  cropArea.addEventListener('pointerdown', (api(service).getCropAreaProps() as Dict).onPointerDown as EventListener)
  handle.addEventListener('pointerdown', (api(service).getCropHandleProps({ position }) as Dict).onPointerDown as EventListener)

  return {
    viewport,
    cropArea,
    handle,
    press: (el, clientX, clientY) => {
      el.dispatchEvent(new PointerEvent('pointerdown', { clientX, clientY, button: 0, bubbles: true, cancelable: true }))
    },
    // 拖动途中的指针事件挂在文档上，手可以拖出视口甚至拖出窗口
    move: (clientX, clientY) => {
      document.dispatchEvent(new PointerEvent('pointermove', { clientX, clientY, bubbles: true }))
    },
    release: () => {
      document.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }))
    },
  }
}

afterEach(() => {
  document.body.innerHTML = ''
  vi.restoreAllMocks()
})

describe('image-cropper 矩形归一化', () => {
  it('比例只认有限正数，其余一律当作不锁比例', () => {
    expect(resolveAspectRatio(1.5)).toBe(1.5)
    expect(resolveAspectRatio(null)).toBeNull()
    expect(resolveAspectRatio(undefined)).toBeNull()
    expect(resolveAspectRatio(0)).toBeNull()
    expect(resolveAspectRatio(Number.NaN)).toBeNull()
  })

  it('出界的框整体推回图片里，尺寸不变', () => {
    expect(normalizeCropRect({ x: 380, y: -30, width: 100, height: 50 }, FREE))
      .toEqual({ x: 300, y: 0, width: 100, height: 50 })
  })

  it('图片尺寸未知时不夹取：夹到 0 会把作者给的初值当场抹平', () => {
    const unknown = { bounds: { width: 0, height: 0 }, minWidth: 0, minHeight: 0, aspectRatio: null }
    expect(normalizeCropRect({ x: 900, y: 900, width: 100, height: 50 }, unknown))
      .toEqual({ x: 900, y: 900, width: 100, height: 50 })
  })

  it('最小尺寸先于比例满足：抬起一条边，另一条边跟着抬', () => {
    expect(normalizeCropRect({ x: 0, y: 0, width: 10, height: 10 }, { ...FREE, minWidth: 80, aspectRatio: 2 }))
      .toEqual({ x: 0, y: 0, width: 80, height: 40 })
  })

  it('比例框超出图片时按装得下的那条边收缩', () => {
    // 400×200 的图里塞一个 1:1 的框，最大只能到 200×200
    expect(normalizeCropRect({ x: 0, y: 0, width: 400, height: 400 }, { ...FREE, aspectRatio: 1 }))
      .toEqual({ x: 0, y: 0, width: 200, height: 200 })
  })

  it('取整放在最后一步：矩形描述的是像素格子', () => {
    expect(normalizeCropRect({ x: 10.4, y: 10.6, width: 33.3, height: 33.7 }, FREE))
      .toEqual({ x: 10, y: 11, width: 33, height: 34 })
  })

  it('初值是尽可能大且居中的一块，锁了比例就按比例收', () => {
    expect(initialCropRect(FREE)).toEqual({ x: 0, y: 0, width: 400, height: 200 })
    expect(initialCropRect({ ...FREE, aspectRatio: 1 })).toEqual({ x: 100, y: 0, width: 200, height: 200 })
  })

  it('序列化与读回互逆', () => {
    const rect = { x: 1, y: 2, width: 3, height: 4 }
    expect(serializeCropRect(rect)).toBe('1,2,3,4')
    expect(parseCropRect('1,2,3,4')).toEqual(rect)
    expect(parseCropRect('1,2,3')).toBeNull()
    expect(parseCropRect('a,b,c,d')).toBeNull()
  })
})

describe('image-cropper 平移与改尺寸', () => {
  const base = { x: 100, y: 50, width: 100, height: 50 }

  it('平移不改尺寸，走到边界就停住', () => {
    expect(moveCropRect(base, 20, 10, FREE)).toEqual({ x: 120, y: 60, width: 100, height: 50 })
    expect(moveCropRect(base, 9999, 9999, FREE)).toEqual({ x: 300, y: 150, width: 100, height: 50 })
  })

  it('拉右下角：左上角钉住不动', () => {
    expect(resizeCropRect(base, 'se', 40, 20, FREE)).toEqual({ x: 100, y: 50, width: 140, height: 70 })
  })

  it('拉左上角：右下角钉住不动，起始边反向增长', () => {
    expect(resizeCropRect(base, 'nw', -40, -20, FREE)).toEqual({ x: 60, y: 30, width: 140, height: 70 })
  })

  it('拉边只动一条轴，另一条轴纹丝不动', () => {
    expect(resizeCropRect(base, 'e', 30, 999, FREE)).toEqual({ x: 100, y: 50, width: 130, height: 50 })
    expect(resizeCropRect(base, 'n', 999, -20, FREE)).toEqual({ x: 100, y: 30, width: 100, height: 70 })
  })

  it('锁定比例时拉边也会带动另一条边', () => {
    // 2:1，拉下边把高度加到 70，宽度跟着算成 140
    expect(resizeCropRect(base, 's', 0, 20, { ...FREE, aspectRatio: 2 }))
      .toEqual({ x: 100, y: 50, width: 140, height: 70 })
  })

  it('最小尺寸挡住把框拉塌', () => {
    expect(resizeCropRect(base, 'e', -999, 0, { ...FREE, minWidth: 30 }))
      .toEqual({ x: 100, y: 50, width: 30, height: 50 })
  })

  it('钉住的那条边到图片边界之间还剩多少地方，框最多长这么大', () => {
    expect(resizeCropRect(base, 'e', 999, 0, FREE)).toEqual({ x: 100, y: 50, width: 300, height: 50 })
    expect(resizeCropRect(base, 'w', -999, 0, FREE)).toEqual({ x: 0, y: 50, width: 200, height: 50 })
  })

  it('八个方位都在表里，顺序即铺开的顺序', () => {
    expect([...CROP_HANDLES].sort()).toEqual(['e', 'n', 'ne', 'nw', 's', 'se', 'sw', 'w'])
  })
})

describe('image-cropper 屏幕位移换算', () => {
  it('尺子没就位（倍率为 0）时返回零位移', () => {
    expect(unprojectDelta(50, 50, { scale: 0, zoom: 1, rotation: 0 })).toEqual({ dx: 0, dy: 0 })
  })

  it('放大之后同样的手势对应更少的图片像素', () => {
    expect(unprojectDelta(40, 20, { scale: 1, zoom: 2, rotation: 0 })).toEqual({ dx: 20, dy: 10 })
  })

  it('旋转 90 度后，向右的手势沿图片的上方向走', () => {
    const d = unprojectDelta(10, 0, { scale: 1, zoom: 1, rotation: 90 })
    expect(d.dx).toBeCloseTo(0)
    expect(d.dy).toBeCloseTo(-10)
  })
})

describe('imageCropperMachine 值与加载', () => {
  it('图片加载完成才铺得出初值：没给 defaultValue 时取整张图', () => {
    const service = makeService()
    expect(crop(service)).toEqual({ x: 0, y: 0, width: 0, height: 0 })
    load(service)
    expect(crop(service)).toEqual({ x: 0, y: 0, width: 400, height: 200 })
  })

  it('作者给了初值就只把它夹进这张图，不覆盖', () => {
    const service = makeService({ defaultValue: { x: 380, y: 0, width: 100, height: 50 } })
    load(service)
    expect(crop(service)).toEqual({ x: 300, y: 0, width: 100, height: 50 })
  })

  it('自然尺寸报成 0 时不铺初值：没有尺子就量不出框', () => {
    const service = makeService()
    load(service, { width: 0, height: 0 })
    expect(crop(service)).toEqual({ x: 0, y: 0, width: 0, height: 0 })
    expect(api(service).natural).toEqual({ width: 0, height: 0 })
  })

  it('setValue 与界面同一套口径：照样夹进图片、吃最小尺寸', () => {
    const service = makeService({ minWidth: 60 })
    load(service)
    api(service).setValue({ x: 390, y: 0, width: 10, height: 10 })
    expect(crop(service)).toEqual({ x: 340, y: 0, width: 60, height: 10 })
  })

  it('禁用与只读时值改不动', () => {
    // 加载时铺初值不受禁用管：一个禁用的裁切器照样要显示出裁的是哪一块
    const disabled = makeService({ disabled: true })
    load(disabled)
    expect(crop(disabled)).toEqual({ x: 0, y: 0, width: 400, height: 200 })
    disabled.send({ type: 'VALUE.SET', value: { x: 10, y: 10, width: 20, height: 20 } })
    expect(crop(disabled)).toEqual({ x: 0, y: 0, width: 400, height: 200 })

    const readOnly = makeService({ readOnly: true, defaultValue: { x: 0, y: 0, width: 100, height: 50 } })
    load(readOnly)
    readOnly.send({ type: 'CROP.NUDGE', dx: 5, dy: 5 })
    expect(crop(readOnly)).toEqual({ x: 0, y: 0, width: 100, height: 50 })
  })

  it('受控 value：内部不自改，只发一次意图', () => {
    const changes: ImageCropperRect[] = []
    const props: Props = {
      value: { x: 0, y: 0, width: 100, height: 50 },
      onValueChange: d => changes.push(d.value),
    }
    const runtime = createVanillaRuntime()
    const service = createService(imageCropperMachine, { props: () => props, runtime })
    runtime.start()
    load(service)

    api(service).setValue({ x: 40, y: 20, width: 100, height: 50 })
    expect(crop(service)).toEqual({ x: 0, y: 0, width: 100, height: 50 })
    expect(changes).toEqual([{ x: 40, y: 20, width: 100, height: 50 }])

    props.value = { x: 40, y: 20, width: 100, height: 50 }
    expect(crop(service)).toEqual({ x: 40, y: 20, width: 100, height: 50 })
  })

  it('表单重置回到 defaultValue', () => {
    const service = makeService({ defaultValue: { x: 10, y: 10, width: 100, height: 50 } })
    load(service)
    service.send({ type: 'CROP.NUDGE', dx: 30, dy: 0 })
    expect(crop(service).x).toBe(40)
    service.send({ type: 'FORM.RESET' })
    expect(crop(service)).toEqual({ x: 10, y: 10, width: 100, height: 50 })
  })

  it('表单重置补一次出界夹取：defaultValue 是在图片尺寸未知时归一化的', () => {
    const service = makeService({ defaultValue: { x: 380, y: 0, width: 100, height: 50 } })
    load(service)
    // 加载那一刻已经夹过一次
    expect(crop(service)).toEqual({ x: 300, y: 0, width: 100, height: 50 })
    service.send({ type: 'CROP.NUDGE', dx: -30, dy: 0 })
    service.send({ type: 'FORM.RESET' })
    // 重置落回的是未夹取的那份，这里要再夹一次，否则 x + width 会超出图片宽度
    expect(crop(service)).toEqual({ x: 300, y: 0, width: 100, height: 50 })
  })

  it('缩放倍率必须是有限正数，0 与负数一律不认', () => {
    const service = makeService()
    api(service).setZoom(2)
    expect(api(service).zoom).toBe(2)
    api(service).setZoom(0)
    api(service).setZoom(-1)
    api(service).setZoom(Number.NaN)
    expect(api(service).zoom).toBe(2)
  })

  it('缩放不是数据：禁用时照样调得动', () => {
    const service = makeService({ disabled: true })
    api(service).setZoom(3)
    expect(api(service).zoom).toBe(3)
  })
})

describe('connectImageCropper 属性表', () => {
  it('裁切框是可聚焦的具名 application，八个把手是原生按钮', () => {
    const service = makeService()
    load(service)
    const area = api(service).getCropAreaProps() as Dict
    // group 不是 widget，方向键会被读屏收走；slider 又会把八个把手当装饰整批抹掉
    expect(area.role).toBe('application')
    expect(area['aria-label']).toBe('Crop area')
    expect(area['aria-disabled']).toBe('false')
    expect(area.tabindex).toBe(0)

    const handle = api(service).getCropHandleProps({ position: 'nw' }) as Dict
    expect(handle.type).toBe('button')
    expect(handle.role).toBe('slider')
    expect(handle['aria-label']).toBe('Top left handle')
    expect(handle['data-position']).toBe('nw')
    // 集合条目一律 aria-disabled，绝不输出原生 disabled
    expect(handle.disabled).toBeUndefined()
  })

  it('把手报它推的那条边长，四个数完整写进 valuetext', () => {
    const service = makeService({ defaultValue: { x: 100, y: 50, width: 200, height: 100 }, minWidth: 20, minHeight: 10 })
    load(service)
    // 裁切框不是 range widget，不挂值属性：挂了读屏也不认
    const area = api(service).getCropAreaProps() as Dict
    expect(area['aria-valuenow']).toBeUndefined()
    expect(area['aria-valuetext']).toBeUndefined()

    // 拉角与拉左右边的把手推的是宽度
    const corner = api(service).getCropHandleProps({ position: 'nw' }) as Dict
    expect(corner['aria-valuemin']).toBe('20')
    expect(corner['aria-valuemax']).toBe('400')
    expect(corner['aria-valuenow']).toBe('200')
    // 上下两条边的把手推的是高度
    const edge = api(service).getCropHandleProps({ position: 's' }) as Dict
    expect(edge['aria-valuemin']).toBe('10')
    expect(edge['aria-valuemax']).toBe('200')
    expect(edge['aria-valuenow']).toBe('100')
    expect(edge['aria-valuetext']).toBe('X 100, Y 50, width 200, height 100')
  })

  it('translations 覆盖内建英文', () => {
    const service = makeService({
      defaultValue: { x: 1, y: 2, width: 3, height: 4 },
      translations: {
        cropArea: '裁切区域',
        handleTopLeft: '左上角把手',
        valueText: rect => `横 ${rect.x} 纵 ${rect.y}`,
      },
    })
    expect((api(service).getCropAreaProps() as Dict)['aria-label']).toBe('裁切区域')
    expect((api(service).getCropHandleProps({ position: 'nw' }) as Dict)['aria-valuetext']).toBe('横 1 纵 2')
    expect((api(service).getCropHandleProps({ position: 'nw' }) as Dict)['aria-label']).toBe('左上角把手')
    // 没覆盖的那些仍是内建英文
    expect((api(service).getCropHandleProps({ position: 'se' }) as Dict)['aria-label']).toBe('Bottom right handle')
  })

  it('禁用时裁切框与把手一起退出 Tab 序列', () => {
    const service = makeService({ disabled: true })
    // 裁切框是 div，不写 tabindex 就聚不了焦
    expect((api(service).getCropAreaProps() as Dict).tabindex).toBeUndefined()
    // 把手是原生 button，不写 tabindex 照样在 Tab 序列里，必须显式给 -1
    expect((api(service).getCropHandleProps({ position: 'e' }) as Dict).tabindex).toBe(-1)
    expect((api(service).getRootProps() as Dict)['data-disabled']).toBe('')
  })

  it('裁切框的坐标是百分比，且用物理属性写', () => {
    const service = makeService({ defaultValue: { x: 100, y: 50, width: 200, height: 100 } })
    load(service)
    const style = (api(service).getCropAreaProps() as Dict).style as Record<string, string>
    expect(style.left).toBe('25%')
    expect(style.top).toBe('25%')
    expect(style.width).toBe('50%')
    expect(style.height).toBe('50%')
    // 恒等变换写空串，让样式表接手
    expect(style.transform).toBe('')
    expect(style.transformOrigin).toBe('')
  })

  it('缩放与旋转同时打在图片与裁切框上，裁切框绕视口中心转', () => {
    const service = makeService({ defaultValue: { x: 0, y: 0, width: 200, height: 100 }, rotation: 90, defaultZoom: 2 })
    load(service)
    const image = (api(service).getImageProps() as Dict).style as Record<string, string>
    const area = (api(service).getCropAreaProps() as Dict).style as Record<string, string>
    expect(image.transform).toBe('rotate(90deg) scale(2)')
    expect(area.transform).toBe('rotate(90deg) scale(2)')
    // 框占左上 1/4，视口中心落在它自己盒子的 100% 100% 处
    expect(area.transformOrigin).toBe('100% 100%')
  })

  it('替代文本落在 image 部件上，不给时是空串', () => {
    const described = api(makeService({ src: 'a.png', alt: '一张示例图' })).getImageProps() as Dict
    expect(described.alt).toBe('一张示例图')

    const bare = api(makeService({ src: 'a.png' })).getImageProps() as Dict
    expect(bare.alt).toBe('')
  })

  it('表单出口把矩形序列化成 x,y,width,height；禁用时不提交', () => {
    const service = makeService({ name: 'avatar', defaultValue: { x: 1, y: 2, width: 3, height: 4 } })
    const input = api(service).getHiddenInputProps() as Dict
    expect(input.type).toBe('hidden')
    expect(input.name).toBe('avatar')
    expect(input.value).toBe('1,2,3,4')

    const off = makeService({ name: 'avatar', disabled: true })
    expect((api(off).getHiddenInputProps() as Dict).disabled).toBe(true)
  })

  it('getCropRect 给的是副本，改它不会动到内部值', () => {
    const service = makeService({ defaultValue: { x: 1, y: 2, width: 3, height: 4 } })
    const rect = api(service).getCropRect()
    rect.x = 999
    expect(crop(service).x).toBe(1)
  })
})

describe('connectImageCropper 键盘', () => {
  it('方向键在裁切框上平移一个自然像素，Shift 走十个', () => {
    const service = makeService({ defaultValue: { x: 100, y: 50, width: 100, height: 50 } })
    load(service)
    expect(pressOnCropArea(service, 'ArrowRight').defaultPrevented).toBe(true)
    expect(crop(service)).toEqual({ x: 101, y: 50, width: 100, height: 50 })
    pressOnCropArea(service, 'ArrowUp', { shiftKey: true })
    expect(crop(service)).toEqual({ x: 101, y: 40, width: 100, height: 50 })
  })

  it('方向键在把手上改尺寸，对面那条边钉住不动', () => {
    const service = makeService({ defaultValue: { x: 100, y: 50, width: 100, height: 50 } })
    load(service)
    pressOnHandle(service, 'se', 'ArrowRight', { shiftKey: true })
    expect(crop(service)).toEqual({ x: 100, y: 50, width: 110, height: 50 })
    pressOnHandle(service, 'nw', 'ArrowLeft')
    expect(crop(service)).toEqual({ x: 99, y: 50, width: 111, height: 50 })
  })

  it('不归自己管的键一律放行：不吞 Space，也不吞带 Ctrl 的组合', () => {
    const service = makeService({ defaultValue: { x: 100, y: 50, width: 100, height: 50 } })
    load(service)
    expect(pressOnCropArea(service, ' ').defaultPrevented).toBe(false)
    expect(pressOnCropArea(service, 'ArrowRight', { ctrlKey: true }).defaultPrevented).toBe(false)
    expect(crop(service)).toEqual({ x: 100, y: 50, width: 100, height: 50 })
  })

  it('把手上的方向键不冒到裁切框：同一次按键不能既改尺寸又整体平移', () => {
    const changes: ImageCropperRect[] = []
    const props: Props = {
      defaultValue: { x: 100, y: 50, width: 100, height: 50 },
      onValueChange: d => changes.push(d.value),
    }
    const runtime = createVanillaRuntime()
    const service = createService(imageCropperMachine, { props: () => props, runtime })
    runtime.start()
    load(service)

    const rig = mountRig(service)
    rig.cropArea.addEventListener('keydown', (api(service).getCropAreaProps() as Dict).onKeyDown as EventListener)
    rig.handle.addEventListener('keydown', (api(service).getCropHandleProps({ position: 'se' }) as Dict).onKeyDown as EventListener)

    rig.handle.dispatchEvent(keydown('ArrowRight'))
    expect(changes).toEqual([{ x: 100, y: 50, width: 101, height: 50 }])
  })

  it('只读时不吞方向键：改不动就该把键还给页面', () => {
    const service = makeService({ readOnly: true, defaultValue: { x: 100, y: 50, width: 100, height: 50 } })
    load(service)
    expect(pressOnCropArea(service, 'ArrowRight').defaultPrevented).toBe(false)
  })

  it('键盘微调也发收尾通知：一按就是一次改完的操作，收尾排在改值之后', () => {
    const log: string[] = []
    const service = makeService({
      defaultValue: { x: 100, y: 50, width: 100, height: 50 },
      onValueChange: d => log.push(`change ${serializeCropRect(d.value)}`),
      onValueChangeEnd: d => log.push(`end ${serializeCropRect(d.value)}`),
    })
    load(service)
    log.length = 0
    pressOnCropArea(service, 'ArrowRight')
    pressOnHandle(service, 'se', 'ArrowRight')
    expect(log).toEqual([
      'change 101,50,100,50',
      'end 101,50,100,50',
      'change 101,50,101,50',
      'end 101,50,101,50',
    ])
  })

  it('顶到图片边界推不动时不发收尾通知：值没变就不该报变完了', () => {
    const ends: ImageCropperRect[] = []
    const service = makeService({
      defaultValue: { x: 0, y: 0, width: 100, height: 50 },
      onValueChangeEnd: d => ends.push(d.value),
    })
    load(service)
    pressOnCropArea(service, 'ArrowLeft')
    expect(crop(service)).toEqual({ x: 0, y: 0, width: 100, height: 50 })
    expect(ends).toEqual([])
  })
})

describe('connectImageCropper 指针拖动', () => {
  it('在裁切框上按下并拖动，整块跟着走，松手发一次收尾通知', () => {
    const ends: ImageCropperRect[] = []
    const service = makeService({
      defaultValue: { x: 100, y: 50, width: 100, height: 50 },
      onValueChangeEnd: d => ends.push(d.value),
    })
    load(service)
    const rig = mountRig(service)

    rig.press(rig.cropArea, 0, 0)
    rig.move(30, 20)
    expect(crop(service)).toEqual({ x: 130, y: 70, width: 100, height: 50 })
    rig.move(60, 20)
    // 位移从按下那一刻算起，不逐帧累加
    expect(crop(service)).toEqual({ x: 160, y: 70, width: 100, height: 50 })
    rig.release()
    expect(ends).toEqual([{ x: 160, y: 70, width: 100, height: 50 }])
    // 松手之后再动指针不该有任何反应
    rig.move(200, 200)
    expect(crop(service)).toEqual({ x: 160, y: 70, width: 100, height: 50 })
  })

  it('按下就松手（零位移的一次单击）不发收尾通知', () => {
    const ends: ImageCropperRect[] = []
    const service = makeService({
      defaultValue: { x: 100, y: 50, width: 100, height: 50 },
      onValueChangeEnd: d => ends.push(d.value),
    })
    load(service)
    const rig = mountRig(service)

    rig.press(rig.cropArea, 0, 0)
    rig.release()
    expect(ends).toEqual([])
  })

  it('在把手上按下只改尺寸，不会连整体拖动一起触发', () => {
    const service = makeService({ defaultValue: { x: 100, y: 50, width: 100, height: 50 } })
    load(service)
    const rig = mountRig(service, 'se')

    rig.press(rig.handle, 0, 0)
    rig.move(40, 20)
    expect(crop(service)).toEqual({ x: 100, y: 50, width: 140, height: 70 })
    rig.release()
  })

  it('放大之后拖动仍然跟手：同样的手势走更少的图片像素', () => {
    const service = makeService({ defaultValue: { x: 100, y: 50, width: 100, height: 50 }, defaultZoom: 2 })
    load(service)
    const rig = mountRig(service)

    rig.press(rig.cropArea, 0, 0)
    rig.move(40, 20)
    expect(crop(service)).toEqual({ x: 120, y: 60, width: 100, height: 50 })
    rig.release()
  })

  it('禁用时按下不进入拖动态', () => {
    const service = makeService({ disabled: true, defaultValue: { x: 100, y: 50, width: 100, height: 50 } })
    load(service)
    const rig = mountRig(service)

    rig.press(rig.cropArea, 0, 0)
    rig.move(40, 20)
    expect(crop(service)).toEqual({ x: 100, y: 50, width: 100, height: 50 })
    expect(api(service).dragging).toBe(false)
  })

  it('右键与中键不开拖：一个会弹上下文菜单，一个是自动滚动', () => {
    const service = makeService({ defaultValue: { x: 100, y: 50, width: 100, height: 50 } })
    load(service)
    const rig = mountRig(service)

    rig.cropArea.dispatchEvent(new PointerEvent('pointerdown', { clientX: 0, clientY: 0, button: 2, bubbles: true, cancelable: true }))
    rig.move(40, 20)
    expect(crop(service)).toEqual({ x: 100, y: 50, width: 100, height: 50 })
  })
})

describe('image-cropper 翻转', () => {
  it('缺省两条轴都不翻；toggleFlip 只翻一条轴并发意图，setFlip 整份赋值', () => {
    const changes: unknown[] = []
    const service = makeService({ onFlipChange: details => changes.push(details) })
    expect(api(service).flip).toEqual({ horizontal: false, vertical: false })
    api(service).toggleFlip('horizontal')
    expect(api(service).flip).toEqual({ horizontal: true, vertical: false })
    api(service).setFlip({ horizontal: true, vertical: true })
    expect(changes).toEqual([
      { flip: { horizontal: true, vertical: false } },
      { flip: { horizontal: true, vertical: true } },
    ])
  })

  it('受控 flip：内部不自改，只发意图', () => {
    const changes: unknown[] = []
    const service = makeService({ flip: { horizontal: false, vertical: false }, onFlipChange: details => changes.push(details) })
    api(service).toggleFlip('vertical')
    expect(api(service).flip).toEqual({ horizontal: false, vertical: false })
    expect(changes).toEqual([{ flip: { horizontal: false, vertical: true } }])
  })

  it('翻转与缩放、旋转一样只改呈现：禁用与只读都拦不住命令式翻转', () => {
    const service = makeService({ disabled: true })
    api(service).toggleFlip('horizontal')
    expect(api(service).flip.horizontal).toBe(true)
  })

  it('翻转打在图片与裁切框上：先翻、再缩放、再旋转', () => {
    const service = makeService({ defaultValue: { x: 100, y: 50, width: 100, height: 50 }, defaultZoom: 2, defaultRotation: 90, defaultFlip: { horizontal: true, vertical: false } })
    load(service)
    const image = api(service).getImageProps() as Dict
    const cropArea = api(service).getCropAreaProps() as Dict
    expect((image.style as Dict).transform).toBe('rotate(90deg) scale(-2, 2)')
    expect((cropArea.style as Dict).transform).toBe('rotate(90deg) scale(-2, 2)')

    const plain = makeService({ defaultFlip: { horizontal: false, vertical: true } })
    expect(((api(plain).getImageProps() as Dict).style as Dict).transform).toBe('rotate(0deg) scale(1, -1)')
  })

  it('翻转按钮：原生按钮报 aria-pressed，接 Action Control text 档；点一下翻这条轴，禁用时原生 disabled', () => {
    const service = makeService()
    const trigger = (): Dict => api(service).getFlipTriggerProps({ axis: 'horizontal' }) as Dict
    expect(trigger()).toMatchObject({
      'type': 'button',
      'aria-label': 'Flip horizontally',
      'aria-pressed': 'false',
      'data-axis': 'horizontal',
      'data-state': 'off',
      'data-xh-action-control': '',
      'data-xh-action-profile': 'text',
      'data-xh-action-size': 'sm',
      'data-xh-action-variant': 'outline',
    })
    expect((api(service).getFlipTriggerProps({ axis: 'vertical' }) as Dict)['aria-label']).toBe('Flip vertically')
    ;(trigger().onClick as () => void)()
    expect(trigger()).toMatchObject({ 'aria-pressed': 'true', 'data-state': 'on' })

    const disabled = makeService({ disabled: true })
    const off = api(disabled).getFlipTriggerProps({ axis: 'horizontal' }) as Dict
    expect(off).toMatchObject({ 'disabled': true, 'data-disabled': '' })
    ;(off.onClick as () => void)()
    expect(api(disabled).flip.horizontal).toBe(false)
  })

  it('翻转按钮的按压通道：Space 按住投影 data-pressed；另一颗的 keyup 不松开这颗；禁用按不进', () => {
    const key = (name: string): KeyboardEvent => ({ key: name, repeat: false, isComposing: false, keyCode: 0 } as KeyboardEvent)
    const fire = (props: Dict, name: string, event: unknown): void => (props[name] as (e: unknown) => void)(event)
    const service = makeService()
    const h = (): Dict => api(service).getFlipTriggerProps({ axis: 'horizontal' }) as Dict
    const v = (): Dict => api(service).getFlipTriggerProps({ axis: 'vertical' }) as Dict
    fire(h(), 'onKeyDown', key(' '))
    expect(h()['data-pressed']).toBe('')
    expect(v()['data-pressed']).toBeUndefined()
    fire(v(), 'onKeyUp', key(' '))
    expect(h()['data-pressed']).toBe('')
    fire(h(), 'onKeyUp', key(' '))
    expect(h()['data-pressed']).toBeUndefined()

    const disabled = makeService({ disabled: true })
    fire(api(disabled).getFlipTriggerProps({ axis: 'horizontal' }) as Dict, 'onKeyDown', key(' '))
    expect((api(disabled).getFlipTriggerProps({ axis: 'horizontal' }) as Dict)['data-pressed']).toBeUndefined()
  })

  it('左右翻着时拖动仍跟手：往右拖，框在屏幕上往右走，落到图片上是往左', () => {
    const service = makeService({ defaultValue: { x: 100, y: 50, width: 100, height: 50 }, defaultFlip: { horizontal: true, vertical: false } })
    load(service)
    const rig = mountRig(service)
    rig.press(rig.cropArea, 0, 0)
    rig.move(40, 20)
    expect(crop(service)).toEqual({ x: 60, y: 70, width: 100, height: 50 })
    rig.release()
  })
})

describe('image-cropper 方向键跟随屏幕方向', () => {
  it('换算表：不转不翻原样；转 90° 时向右是图片的上方向；翻着的轴反号；斜着取最近的直角', () => {
    expect(screenStepToImage(1, 0, 0)).toEqual({ dx: 1, dy: 0 })
    expect(screenStepToImage(1, 0, 90)).toEqual({ dx: 0, dy: -1 })
    expect(screenStepToImage(0, 1, 90)).toEqual({ dx: 1, dy: 0 })
    expect(screenStepToImage(1, 0, 0, { horizontal: true, vertical: false })).toEqual({ dx: -1, dy: 0 })
    expect(screenStepToImage(0, 10, 0, { horizontal: false, vertical: true })).toEqual({ dx: 0, dy: -10 })
    expect(screenStepToImage(1, 0, 30)).toEqual({ dx: 1, dy: 0 })
    expect(screenStepToImage(1, 0, 60)).toEqual({ dx: 0, dy: -1 })
    expect(screenStepToImage(1, 0, -180)).toEqual({ dx: -1, dy: 0 })
  })

  it('裁切框上的方向键按屏幕方向平移：左右翻着时 ArrowRight 让框在图片上往左走', () => {
    const service = makeService({ defaultValue: { x: 100, y: 50, width: 100, height: 50 }, defaultFlip: { horizontal: true, vertical: false } })
    load(service)
    pressOnCropArea(service, 'ArrowRight')
    expect(crop(service)).toEqual({ x: 99, y: 50, width: 100, height: 50 })
  })

  it('把手上的方向键同样换算：转 90° 时 ArrowDown 推的是图片的横向那条边', () => {
    const service = makeService({ defaultValue: { x: 100, y: 50, width: 100, height: 50 }, defaultRotation: 90 })
    load(service)
    pressOnHandle(service, 'se', 'ArrowDown')
    expect(crop(service)).toEqual({ x: 100, y: 50, width: 101, height: 50 })
  })
})

/** 记下画布上下文的每一次调用：jsdom 没有 2d 上下文，出图的几何只能这样核。 */
function recordCanvas(): { calls: [string, unknown[]][], canvas: () => HTMLCanvasElement } {
  const calls: [string, unknown[]][] = []
  let last: HTMLCanvasElement | null = null
  const ctx = new Proxy({} as Record<string, unknown>, {
    get: (target, key: string) => key in target ? target[key] : (...args: unknown[]) => calls.push([key, args]),
    set: (target, key: string, value) => {
      target[key] = value
      calls.push([`set:${key}`, [value]])
      return true
    },
  })
  const create = document.createElement.bind(document)
  vi.spyOn(document, 'createElement').mockImplementation(((tag: string) => {
    const el = create(tag)
    if (tag === 'canvas') {
      ;(el as HTMLCanvasElement).getContext = (() => ctx) as unknown as HTMLCanvasElement['getContext']
      last = el as HTMLCanvasElement
    }
    return el
  }) as typeof document.createElement)
  return { calls, canvas: () => last! }
}

describe('cropToCanvas 出图', () => {
  const source = document.createElement('img')

  it('不转不翻：画布即裁切矩形的尺寸，按源图像素截取', () => {
    const rec = recordCanvas()
    const canvas = cropToCanvas(source, { x: 10, y: 20, width: 200, height: 100 })!
    expect([canvas.width, canvas.height]).toEqual([200, 100])
    expect(rec.calls.find(([name]) => name === 'drawImage')![1].slice(1)).toEqual([10, 20, 200, 100, -100, -50, 200, 100])
  })

  it('旋转 90° 的倍数时画布宽高互换，旋转与翻转都进了画布变换', () => {
    const rec = recordCanvas()
    const canvas = cropToCanvas(source, { x: 0, y: 0, width: 200, height: 100 }, { rotation: 90, flip: { horizontal: true, vertical: false } })!
    expect([canvas.width, canvas.height]).toEqual([100, 200])
    const names = rec.calls.map(([name]) => name)
    expect(names.indexOf('rotate')).toBeLessThan(names.indexOf('scale'))
    expect(rec.calls.find(([name]) => name === 'rotate')![1]).toEqual([Math.PI / 2])
    expect(rec.calls.find(([name]) => name === 'scale')![1]).toEqual([-1, 1])
  })

  it('斜角旋转时画布是旋转后的外接矩形', () => {
    recordCanvas()
    const canvas = cropToCanvas(source, { x: 0, y: 0, width: 100, height: 100 }, { rotation: 45 })!
    expect(canvas.width).toBe(141)
    expect(canvas.height).toBe(141)
  })

  it('圆形：先裁一个内切于裁切内容的椭圆再画图；给了底色时整张画布先铺底', () => {
    const rec = recordCanvas()
    cropToCanvas(source, { x: 0, y: 0, width: 200, height: 100 }, { shape: 'round', background: '#fff', width: 100 })
    const names = rec.calls.map(([name]) => name)
    expect(rec.calls.find(([name]) => name === 'fillRect')![1]).toEqual([0, 0, 100, 50])
    expect(rec.calls.find(([name]) => name === 'ellipse')![1]).toEqual([0, 0, 50, 25, 0, 0, Math.PI * 2])
    expect(names.indexOf('fillRect')).toBeLessThan(names.indexOf('clip'))
    expect(names.indexOf('clip')).toBeLessThan(names.indexOf('drawImage'))
  })

  it('toCanvas 带上此刻的旋转、翻转与外形；图片没加载或没有源图节点时给 null', () => {
    const rec = recordCanvas()
    const service = makeService({ shape: 'round', defaultRotation: 180, defaultFlip: { horizontal: false, vertical: true } })
    expect(api(service).toCanvas()).toBeNull()
    load(service)
    expect(api(service).toCanvas()).toBeNull()
    service.refs.set('getImageEl', () => source)
    const canvas = api(service).toCanvas({ width: 200 })!
    expect([canvas.width, canvas.height]).toEqual([200, 100])
    expect(rec.calls.find(([name]) => name === 'rotate')![1][0]).toBeCloseTo(Math.PI)
    expect(rec.calls.find(([name]) => name === 'scale')![1]).toEqual([1, -1])
    expect(rec.calls.some(([name]) => name === 'ellipse')).toBe(true)
  })
})
