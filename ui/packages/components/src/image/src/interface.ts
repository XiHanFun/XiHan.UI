import type { ExtractPropTypes, PropType } from 'vue'

/**
 * Image 组件的尺寸类型
 */
export type ImageSize = 'small' | 'medium' | 'large'

/**
 * Image 组件的主题类型
 */
export type ImageType = 'default' | 'primary' | 'success' | 'warning' | 'error'

/**
 * Image 组件的 Props 定义
 */
export const imageProps = {
  /**
   * 组件尺寸
   */
  size: {
    type: String as PropType<ImageSize>,
    default: 'medium'
  },
  /**
   * 组件类型
   */
  type: {
    type: String as PropType<ImageType>,
    default: 'default'
  },
  /**
   * 是否禁用
   */
  disabled: {
    type: Boolean,
    default: false
  },
  /**
   * 自定义类名
   */
  class: {
    type: String,
    default: ''
  },
  /**
   * 自定义样式
   */
  style: {
    type: [String, Object] as PropType<string | Record<string, any>>,
    default: ''
  }
} as const

/**
 * Image 组件的 Props 类型
 */
export type ImageProps = ExtractPropTypes<typeof imageProps>

/**
 * Image 组件的实例类型
 */
export interface ImageInstance {
  /**
   * 组件的 DOM 元素
   */
  $el: HTMLElement
  /**
   * 获取组件的当前状态
   */
  getState(): Record<string, any>
  /**
   * 重置组件状态
   */
  reset(): void
}

/**
 * Image 组件的事件类型
 */
export interface ImageEvents {
  /**
   * 点击事件
   */
  click: (event: MouseEvent) => void
  /**
   * 焦点事件
   */
  focus: (event: FocusEvent) => void
  /**
   * 失焦事件
   */
  blur: (event: FocusEvent) => void
  /**
   * 变化事件
   */
  change: (value: any) => void
}

/**
 * Image 组件的插槽类型
 */
export interface ImageSlots {
  /**
   * 默认插槽
   */
  default?: () => any
  /**
   * 前缀插槽
   */
  prefix?: () => any
  /**
   * 后缀插槽
   */
  suffix?: () => any
}

