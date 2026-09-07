import type {
  ImageCropperApi,
  ImageCropperHandlePosition,
  ImageCropperRect,
  ImageCropperSchema,
  ImageCropperShape,
} from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import type { SlotChildren } from '../../runtime/slot-content'
import { withXhConfig } from '../../config/config'
import { mergeReactProps } from '../../runtime/merge-props'
import { renderSlot } from '../../runtime/slot-content'
import { ImageCropperProvider, useImageCropperContext } from './context'
import { useImageCropper } from './use-image-cropper'

type ImageCropperProps = ImageCropperSchema['props']

function noop(): void {}

/** 函数式 children 的载荷：裁切矩形与图片自然尺寸、缩放与旋转、两种拖动标记，以及改值改倍率与取结果。 */
export type ImageCropperRootSlotProps = Pick<
  ImageCropperApi,
  'value' | 'zoom' | 'rotation' | 'natural' | 'dragging' | 'resizing' | 'disabled' | 'readOnly'
  | 'getCropRect' | 'setValue' | 'setZoom' | 'setRotation'
>

export interface XhImageCropperRootProps {
  src?: string
  alt?: string
  aspectRatio?: number | null
  value?: ImageCropperRect
  defaultValue?: ImageCropperRect
  minWidth?: number
  minHeight?: number
  zoom?: number
  defaultZoom?: number
  minZoom?: number
  maxZoom?: number
  zoomStep?: number
  rotation?: number
  defaultRotation?: number
  minRotation?: number
  maxRotation?: number
  rotationStep?: number
  shape?: ImageCropperShape
  disabled?: boolean
  readOnly?: boolean
  /** 表单字段名；给了才参与提交。 */
  name?: string
  translations?: ImageCropperProps['translations']
  onValueChange?: ImageCropperProps['onValueChange']
  /** 一次指针拖动松手时发一次，一次方向键微调也发一次。 */
  onValueChangeEnd?: ImageCropperProps['onValueChangeEnd']
  onZoomChange?: ImageCropperProps['onZoomChange']
  onRotationChange?: ImageCropperProps['onRotationChange']
  children?: SlotChildren<ImageCropperRootSlotProps>
}

export function XhImageCropperRoot({ children, ...props }: XhImageCropperRootProps): ReactNode {
  const ctx = useImageCropper(withXhConfig('image-cropper', props) as ImageCropperProps)
  const api = ctx.api
  return (
    <ImageCropperProvider value={ctx}>
      <div
        {...api.getRootProps() as Record<string, unknown>}
        ref={(el: HTMLDivElement | null) => { ctx.rootRef.current = el }}
      >
        {renderSlot(children, {
          value: api.value,
          zoom: api.zoom,
          rotation: api.rotation,
          natural: api.natural,
          dragging: api.dragging,
          resizing: api.resizing,
          disabled: api.disabled,
          readOnly: api.readOnly,
          getCropRect: api.getCropRect,
          setValue: api.setValue,
          setZoom: api.setZoom,
          setRotation: api.setRotation,
        })}
      </div>
    </ImageCropperProvider>
  )
}

XhImageCropperRoot.xhEvents = ['value-change'] as const

export interface XhImageCropperViewportProps extends ComponentPropsWithRef<'div'> {}
/** 量尺子的那个盒子：图片铺满它，裁切框的百分比坐标以它为准。 */
export function XhImageCropperViewport({ children, ...rest }: XhImageCropperViewportProps): ReactNode {
  const ctx = useImageCropperContext()
  return (
    <div
      {...mergeReactProps(
        ctx.api.getViewportProps() as Record<string, unknown>,
        rest as Record<string, unknown>,
        { ref: (el: HTMLDivElement | null) => { ctx.viewportRef.current = el } },
      )}
    >
      {children}
    </div>
  )
}

export interface XhImageCropperImageProps extends Omit<ComponentPropsWithRef<'img'>, 'children' | 'src' | 'alt'> {}
/** 用原生 img：自然尺寸与 load 事件都归它。src 与 alt 由根上的同名 prop 写进来。 */
export function XhImageCropperImage({ ...rest }: XhImageCropperImageProps): ReactNode {
  const ctx = useImageCropperContext()
  return <img {...mergeReactProps(ctx.api.getImageProps() as Record<string, unknown>, rest as Record<string, unknown>)} />
}

export interface XhImageCropperCropAreaProps extends ComponentPropsWithRef<'div'> {}
export function XhImageCropperCropArea({ children, ...rest }: XhImageCropperCropAreaProps): ReactNode {
  const ctx = useImageCropperContext()
  return (
    <div {...mergeReactProps(ctx.api.getCropAreaProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </div>
  )
}

export interface XhImageCropperCropHandleProps extends ComponentPropsWithRef<'button'> {
  /** 这个把手拉的是哪个方位。 */
  position: ImageCropperHandlePosition
}
/** 用原生 button：它天然可聚焦、天然在 Tab 序列里。 */
export function XhImageCropperCropHandle({ position, children, ...rest }: XhImageCropperCropHandleProps): ReactNode {
  const ctx = useImageCropperContext()
  return (
    <button
      {...mergeReactProps(
        ctx.api.getCropHandleProps({ position }) as Record<string, unknown>,
        rest as Record<string, unknown>,
      )}
    >
      {children}
    </button>
  )
}

export interface XhImageCropperGridProps extends ComponentPropsWithRef<'div'> {}
export function XhImageCropperGrid({ children, ...rest }: XhImageCropperGridProps): ReactNode {
  const ctx = useImageCropperContext()
  return (
    <div {...mergeReactProps(ctx.api.getGridProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </div>
  )
}

export interface XhImageCropperZoomSliderProps extends Omit<ComponentPropsWithRef<'input'>, 'value' | 'defaultValue' | 'type'> {}
/** 用原生 range：拇指拖动、方向键步进与读屏播报都归它。 */
export function XhImageCropperZoomSlider({ ...rest }: XhImageCropperZoomSliderProps): ReactNode {
  const ctx = useImageCropperContext()
  return (
    <input
      {...mergeReactProps(
        ctx.api.getZoomSliderProps() as Record<string, unknown>,
        // 倍率攥在机器里，写回走连接层的 onInput。React 要求带 value 的输入交出一个 onChange，
        // 否则在开发构建里逐帧告警
        { onChange: noop },
        rest as Record<string, unknown>,
      )}
    />
  )
}

export interface XhImageCropperRotateSliderProps extends Omit<ComponentPropsWithRef<'input'>, 'value' | 'defaultValue' | 'type'> {}
export function XhImageCropperRotateSlider({ ...rest }: XhImageCropperRotateSliderProps): ReactNode {
  const ctx = useImageCropperContext()
  return (
    <input
      {...mergeReactProps(
        ctx.api.getRotateSliderProps() as Record<string, unknown>,
        { onChange: noop },
        rest as Record<string, unknown>,
      )}
    />
  )
}

export interface XhImageCropperHiddenInputProps extends Omit<ComponentPropsWithRef<'input'>, 'value' | 'defaultValue' | 'type'> {}
/** 表单出口：裁切矩形靠这份原生输入随表单提交，序列化成 `x,y,width,height`。 */
export function XhImageCropperHiddenInput({ ...rest }: XhImageCropperHiddenInputProps): ReactNode {
  const ctx = useImageCropperContext()
  return (
    <input
      {...mergeReactProps(
        ctx.api.getHiddenInputProps() as Record<string, unknown>,
        // 值攥在机器里，这份影子输入没有自己的变更出口；节点是 hidden，这个出口不会被调用
        { onChange: noop },
        rest as Record<string, unknown>,
      )}
    />
  )
}
