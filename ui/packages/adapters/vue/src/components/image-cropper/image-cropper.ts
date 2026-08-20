import type {
  ImageCropperApi,
  ImageCropperHandlePosition,
  ImageCropperRect,
  ImageCropperSchema,
  ImageCropperShape,
} from '@xihan-ui/headless'
import type { PropType, SlotsType, VNode } from 'vue'
import type { PayloadOf } from '../../runtime/payload'
import { defineComponent, h } from 'vue'
import { withXhConfig } from '../../config/config'
import { provideImageCropper, useImageCropperContext } from './context'
import { useImageCropper } from './use-image-cropper'

type ImageCropperProps = ImageCropperSchema['props']

/** 默认插槽的载荷：裁切矩形与图片自然尺寸、缩放与旋转、两种拖动标记，以及改值改倍率与取结果。 */
export type ImageCropperRootSlotProps = Pick<
  ImageCropperApi,
  'value' | 'zoom' | 'rotation' | 'natural' | 'dragging' | 'resizing' | 'disabled' | 'readOnly'
  | 'getCropRect' | 'setValue' | 'setZoom'
>

export const XhImageCropperRoot = defineComponent({
  name: 'XhImageCropperRoot',
  // 全部 default: undefined，缺省值由 connect 与机器决定
  props: {
    src: { type: String, default: undefined },
    aspectRatio: { type: Number as PropType<number | null>, default: undefined },
    value: { type: Object as PropType<ImageCropperRect>, default: undefined },
    defaultValue: { type: Object as PropType<ImageCropperRect>, default: undefined },
    minWidth: { type: Number, default: undefined },
    minHeight: { type: Number, default: undefined },
    zoom: { type: Number, default: undefined },
    defaultZoom: { type: Number, default: undefined },
    rotation: { type: Number, default: undefined },
    shape: { type: String as PropType<ImageCropperShape>, default: undefined },
    disabled: { type: Boolean, default: undefined },
    readOnly: { type: Boolean, default: undefined },
    name: { type: String, default: undefined },
    translations: {
      type: Object as PropType<ImageCropperProps['translations']>,
      default: undefined,
    },
  },
  // value-change 携带 { value }，update:value 携带裸矩形；
  // value-change-end 在一次指针拖动松手时发一次，一次方向键微调也发一次
  emits: {
    'value-change': (_details: PayloadOf<ImageCropperProps, 'onValueChange'>) => true,
    'update:value': (_value: PayloadOf<ImageCropperProps, 'onValueChange'>['value']) => true,
    'value-change-end': (_details: PayloadOf<ImageCropperProps, 'onValueChangeEnd'>) => true,
    'zoom-change': (_details: PayloadOf<ImageCropperProps, 'onZoomChange'>) => true,
    'update:zoom': (_zoom: PayloadOf<ImageCropperProps, 'onZoomChange'>['zoom']) => true,
  },
  slots: Object as SlotsType<{
    default?: (props: ImageCropperRootSlotProps) => VNode[]
  }>,
  setup(props, { slots, emit }) {
    const onValueChange: ImageCropperProps['onValueChange'] = (details) => {
      emit('value-change', details)
      emit('update:value', details.value)
    }
    const onValueChangeEnd: ImageCropperProps['onValueChangeEnd'] = (details) => {
      emit('value-change-end', details)
    }
    const onZoomChange: ImageCropperProps['onZoomChange'] = (details) => {
      emit('zoom-change', details)
      emit('update:zoom', details.zoom)
    }
    const ctx = useImageCropper(
      withXhConfig('image-cropper', props) as ImageCropperProps,
      { onValueChange, onValueChangeEnd, onZoomChange },
    )
    provideImageCropper(ctx)
    return () => h('div', ctx.api.value.getRootProps() as Record<string, unknown>, slots.default?.({
      value: ctx.api.value.value,
      zoom: ctx.api.value.zoom,
      rotation: ctx.api.value.rotation,
      natural: ctx.api.value.natural,
      dragging: ctx.api.value.dragging,
      resizing: ctx.api.value.resizing,
      disabled: ctx.api.value.disabled,
      readOnly: ctx.api.value.readOnly,
      getCropRect: ctx.api.value.getCropRect,
      setValue: ctx.api.value.setValue,
      setZoom: ctx.api.value.setZoom,
    }))
  },
})

export const XhImageCropperViewport = defineComponent({
  name: 'XhImageCropperViewport',
  setup(_, { slots }) {
    const ctx = useImageCropperContext()
    // 视口节点交给机器，矩形在指针事件里现量
    return () => h('div', {
      ...ctx.api.value.getViewportProps() as Record<string, unknown>,
      ref: ctx.viewportRef,
    }, slots.default?.())
  },
})

export const XhImageCropperImage = defineComponent({
  name: 'XhImageCropperImage',
  setup() {
    const ctx = useImageCropperContext()
    // 用原生 img：自然尺寸与 load 事件都归它。alt 由作者写在标签上，透传落到这里
    return () => h('img', ctx.api.value.getImageProps() as Record<string, unknown>)
  },
})

export const XhImageCropperCropArea = defineComponent({
  name: 'XhImageCropperCropArea',
  setup(_, { slots }) {
    const ctx = useImageCropperContext()
    return () => h('div', ctx.api.value.getCropAreaProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhImageCropperCropHandle = defineComponent({
  name: 'XhImageCropperCropHandle',
  props: {
    /** 这个把手拉的是哪个方位，必填。 */
    position: { type: String as PropType<ImageCropperHandlePosition>, required: true },
  },
  setup(props, { slots }) {
    const ctx = useImageCropperContext()
    // 用原生 button：它天然可聚焦、天然在 Tab 序列里
    return () => h(
      'button',
      ctx.api.value.getCropHandleProps({ position: props.position }) as Record<string, unknown>,
      slots.default?.(),
    )
  },
})

export const XhImageCropperGrid = defineComponent({
  name: 'XhImageCropperGrid',
  setup(_, { slots }) {
    const ctx = useImageCropperContext()
    return () => h('div', ctx.api.value.getGridProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhImageCropperHiddenInput = defineComponent({
  name: 'XhImageCropperHiddenInput',
  setup() {
    const ctx = useImageCropperContext()
    return () => h('input', ctx.api.value.getHiddenInputProps() as Record<string, unknown>)
  },
})
