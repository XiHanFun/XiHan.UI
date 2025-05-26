import type { ExtractPropTypes, PropType } from 'vue'

/**
 * Empty 组件的尺寸类型
 */
export type EmptySize = 'small' | 'medium' | 'large'

/**
 * Empty 组件的主题类型
 */
export type EmptyType = 'default' | 'primary' | 'success' | 'warning' | 'error'

/**
 * Empty 组件的 Props 定义
 */
export const emptyProps = {
  /**
   * 组件尺寸
   */
  size: {
    type: String as PropType<EmptySize>,
    default: 'medium'
  },
  /**
   * 组件类型
   */
  type: {
    type: String as PropType<EmptyType>,
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
 * Empty 组件的 Props 类型
 */
export type EmptyProps = ExtractPropTypes<typeof emptyProps>

/**
 * Empty 组件的实例类型
 */
export interface EmptyInstance {
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
 * Empty 组件的事件类型
 */
export interface EmptyEvents {
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
 * Empty 组件的插槽类型
 */
export interface EmptySlots {
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

