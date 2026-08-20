import type {
  ImageCropperHandlePosition,
  ImageCropperRect,
  ImageCropperSchema,
  ImageCropperShape,
  ImageCropperValueChangeDetails,
  ImageCropperValueChangeEndDetails,
  ImageCropperZoomChangeDetails,
} from '@xihan-ui/headless'
import type { Service } from '@xihan-ui/machine'
import { connectImageCropper, imageCropperAnatomy, imageCropperMachine, imageCropperMeta } from '@xihan-ui/headless'
import { DIAGNOSTIC_CODES, reportDiagnostic } from '@xihan-ui/kernel'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'
import { MachineController } from '../runtime/machine-controller'

// 属性缺席翻成 undefined，缺省值的唯一事实源留在机器与 connect。
// Lit 默认转换器会落成 null / false，那样就表达不了"未指定"。
const STRING_CONVERTER = { fromAttribute: (v: string | null) => v ?? undefined }
const NUMBER_CONVERTER = { fromAttribute: (v: string | null) => (v == null || v === '' ? undefined : Number(v)) }
// 三态布尔：缺席=undefined（走缺省）、在场=true、显式写 "false"=false。
const BOOLEAN_CONVERTER = { fromAttribute: (v: string | null) => (v === null ? undefined : v !== 'false') }
/**
 * 裁切矩形写成逗号分隔的四个数：`x,y,width,height`。
 * 读不出四个有限数就当没写：留下 NaN 会一路写进定位百分比与表单值。
 */
const RECT_CONVERTER = {
  fromAttribute: (v: string | null): ImageCropperRect | undefined => {
    if (v == null || v.trim() === '')
      return undefined
    const n = v.split(',').map(Number)
    if (n.length !== 4 || n.some(x => !Number.isFinite(x)))
      return undefined
    return { x: n[0]!, y: n[1]!, width: n[2]!, height: n[3]! }
  },
}

/** 合法方位的查表用集合，属性值不在表里即视为没写。 */
const HANDLE_POSITIONS: Record<ImageCropperHandlePosition, true> = {
  nw: true,
  n: true,
  ne: true,
  e: true,
  se: true,
  s: true,
  sw: true,
  w: true,
}

/**
 * `<xh-image-cropper>` —— Light-DOM 行为宿主：作者写 root/viewport/image/crop-area
 * 与可选的 crop-handle、grid、hidden-input 角色节点，元素跑 image-cropper 机器并把 connect 产出打上去。
 *
 * 裁切矩形以源图的自然像素记录，坐标换算取 viewport 的矩形——矩形在指针事件发生的那一刻才量，
 * 连接期一律不碰 DOM；自然尺寸由 image 部件的 load 事件报进来，所以图片必须写成原生 `<img>`。
 * 视口的尺寸要由图片撑出来（图片铺满视口），裁切框的百分比坐标才对得上。
 *
 * 每个把手必须用 position 属性写明自己拉的是哪个方位（`position="se"`），八个合法值是
 * `nw|n|ne|e|se|s|sw|w`；写不出合法方位的把手不接行为，控制台留一条诊断。
 * 缩放与旋转同时作用在图片与裁切框上，两者始终贴合。
 *
 * @customElement xh-image-cropper
 * @attr {string} src - 图片地址，原样写到 image 部件上
 * @attr {string} value - 受控裁切矩形，写成 "x,y,width,height"；缺省该属性即非受控
 * @attr {string} default-value - 非受控初值，同样是四个逗号分隔的数；缺省时图片加载完取整张图
 * @attr {number} aspect-ratio - 宽高比（宽 ÷ 高）；不写即不锁比例
 * @attr {number} min-width - 裁切框最小宽度，自然像素，默认 0
 * @attr {number} min-height - 裁切框最小高度，自然像素，默认 0
 * @attr {number} zoom - 受控缩放倍率；缺省该属性即非受控
 * @attr {number} default-zoom - 非受控初始缩放倍率，默认 1
 * @attr {number} rotation - 显示旋转角度，单位度，默认 0
 * @attr {'rect'|'round'} shape - 裁切框外形，默认 rect
 * @attr {boolean} disabled - 禁用：裁切框与把手退出 Tab 序列、改不动、不参与表单提交
 * @attr {boolean} read-only - 只读：仍可聚焦与被读屏念出，改不动
 * @attr {string} name - 表单字段名；给了才参与提交，值序列化成 "x,y,width,height"
 * @fires value-change - 裁切矩形变化（拖动途中会连发）；detail 为 `{ value: { x, y, width, height } }`
 * @fires value-change-end - 一次指针拖动松手发一次，一次方向键微调也发一次；detail 为 `{ value: { x, y, width, height } }`
 * @fires zoom-change - 缩放倍率变化；detail 为 `{ zoom: number }`
 * @csspart root - 承载 data-disabled / data-readonly / data-dragging / data-resizing / data-shape 的容器
 * @csspart viewport - 量坐标的那个盒子，图片铺满它、裁切框绝对定位在它里面
 * @csspart image - 源图，须是原生 `<img>`；自然尺寸与加载完成都由它报出来
 * @csspart crop-area - role=application 的裁切框，可聚焦，方向键平移
 * @csspart crop-handle - 改尺寸的把手，须是原生 `<button>` 并自带 position 属性标识方位
 * @csspart grid - 裁切框里的构图参考线，纯装饰
 * @csspart hidden-input - 表单影子（须是原生 input）
 */
export class XhImageCropperElement extends XhElement {
  static override partContract = { anatomy: imageCropperAnatomy, meta: imageCropperMeta }

  // 描述符逐个写全，CEM 分析器读不了对象展开。
  static override properties = {
    src: { converter: STRING_CONVERTER },
    value: { converter: RECT_CONVERTER },
    defaultValue: { converter: RECT_CONVERTER, attribute: 'default-value' },
    aspectRatio: { converter: NUMBER_CONVERTER, attribute: 'aspect-ratio' },
    minWidth: { converter: NUMBER_CONVERTER, attribute: 'min-width' },
    minHeight: { converter: NUMBER_CONVERTER, attribute: 'min-height' },
    zoom: { converter: NUMBER_CONVERTER },
    defaultZoom: { converter: NUMBER_CONVERTER, attribute: 'default-zoom' },
    rotation: { converter: NUMBER_CONVERTER },
    shape: { converter: STRING_CONVERTER },
    disabled: { converter: BOOLEAN_CONVERTER },
    readOnly: { converter: BOOLEAN_CONVERTER, attribute: 'read-only' },
    name: { converter: STRING_CONVERTER },
    // 文案表只走 property，属性装不下一个对象
    translations: { attribute: false },
  }

  declare src?: string
  declare value?: ImageCropperRect
  declare defaultValue?: ImageCropperRect
  declare aspectRatio?: number
  declare minWidth?: number
  declare minHeight?: number
  declare zoom?: number
  declare defaultZoom?: number
  declare rotation?: number
  declare shape?: ImageCropperShape
  declare disabled?: boolean
  declare readOnly?: boolean
  declare name?: string
  declare translations?: ImageCropperSchema['props']['translations']

  private readonly notifyValue = (details: ImageCropperValueChangeDetails): void => {
    this.dispatchEvent(new CustomEvent('value-change', { detail: details, bubbles: true, composed: true }))
  }

  private readonly notifyValueEnd = (details: ImageCropperValueChangeEndDetails): void => {
    this.dispatchEvent(new CustomEvent('value-change-end', { detail: details, bubbles: true, composed: true }))
  }

  private readonly notifyZoom = (details: ImageCropperZoomChangeDetails): void => {
    this.dispatchEvent(new CustomEvent('zoom-change', { detail: details, bubbles: true, composed: true }))
  }

  private readonly ctrl = new MachineController<ImageCropperSchema>(
    this,
    imageCropperMachine,
    () => this.machineProps(),
    { onBuilt: svc => this.injectRefs(svc) },
  )

  private machineProps(): Partial<ImageCropperSchema['props']> {
    return {
      src: this.src,
      value: this.value,
      defaultValue: this.defaultValue,
      aspectRatio: this.aspectRatio,
      minWidth: this.minWidth,
      minHeight: this.minHeight,
      zoom: this.zoom,
      defaultZoom: this.defaultZoom,
      rotation: this.rotation,
      shape: this.shape,
      // 布尔一律原样透传：属性不在即 undefined，把缺省交回 connect
      disabled: this.disabled,
      readOnly: this.readOnly,
      name: this.name,
      translations: this.translations,
      onValueChange: this.notifyValue,
      onValueChangeEnd: this.notifyValueEnd,
      onZoomChange: this.notifyZoom,
    }
  }

  // onBuilt 在 ctrl 构造期就跑（此刻 this.ctrl 尚未赋值），故 service 由参数传入。
  // 视口懒读：角色节点要等首次 updated 才发现得到，机器建起来的那一刻 partMap 还空着。
  private injectRefs(svc: Service<ImageCropperSchema>): void {
    svc.refs.set('getViewportEl', () => this.getPart('viewport'))
  }

  /**
   * 把手自报的方位。作者在节点上写 position="se"，与 Vue 侧的 `:position` 是同一份声明；
   * 写不出合法方位（没写、写错）时返回 null，由调用方决定怎么处理。
   */
  private handlePosition(el: HTMLElement): ImageCropperHandlePosition | null {
    const raw = el.getAttribute('position')
    // 只认自有键：in 会走原型链，position="toString" 这类值会被当成合法方位一路带进几何算式
    return raw != null && Object.hasOwn(HANDLE_POSITIONS, raw) ? raw as ImageCropperHandlePosition : null
  }

  protected wire(): void {
    const api = connectImageCropper(this.ctrl.service, wcNormalize)

    const put = (name: string, props: Record<string, unknown>): void => {
      const el = this.getPart(name)
      if (el)
        this.spreader.spread(el, props)
    }
    put('root', api.getRootProps() as Record<string, unknown>)
    put('viewport', api.getViewportProps() as Record<string, unknown>)
    put('image', api.getImageProps() as Record<string, unknown>)
    put('crop-area', api.getCropAreaProps() as Record<string, unknown>)
    put('grid', api.getGridProps() as Record<string, unknown>)
    put('hidden-input', api.getHiddenInputProps() as Record<string, unknown>)

    // 把手是多实例 part：身份取节点自报的 position 属性。
    // 报不出合法方位就整个不铺——退回某个缺省方位的话八个把手会全拉同一个角，界面看着正常、拖谁都一样
    for (const el of this.getParts('crop-handle')) {
      const position = this.handlePosition(el)
      if (position == null) {
        reportDiagnostic({
          code: DIAGNOSTIC_CODES.warn,
          level: 'warn',
          message: '把手没写出合法的 position（nw|n|ne|e|se|s|sw|w），这一个把手不接行为',
          scope: imageCropperAnatomy.name,
          part: 'crop-handle',
          node: el,
        })
        continue
      }
      this.spreader.spread(el, api.getCropHandleProps({ position }) as Record<string, unknown>)
    }
  }
}
