import type { ExtractPropTypes, PropType } from 'vue'

/**
 * Alert 组件的尺寸类型
 */
export type AlertSize = 'small' | 'medium' | 'large'

/**
 * Alert 组件的主题类型
 */
export type AlertType = 'default' | 'primary' | 'success' | 'warning' | 'error'

/**
 * Alert 组件的 Props 定义
 */
export const alertProps = {
  /**
   * 组件尺寸
   */
  size: {
    type: String as PropType<AlertSize>,
    default: 'medium'
  },
  /**
   * 组件类型
   */
  type: {
    type: String as PropType<AlertType>,
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
 * Alert 组件的 Props 类型
 */
export type AlertProps = ExtractPropTypes<typeof alertProps>

/**
 * Alert 组件的实例类型
 */
export interface AlertInstance {
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
 * Alert 组件的事件类型
 */
export interface AlertEvents {
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
 * Alert 组件的插槽类型
 */
export interface AlertSlots {
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

