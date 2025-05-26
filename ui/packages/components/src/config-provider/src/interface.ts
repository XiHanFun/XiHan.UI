import type { ExtractPropTypes, PropType } from 'vue'

/**
 * ConfigProvider 组件的尺寸类型
 */
export type ConfigProviderSize = 'small' | 'medium' | 'large'

/**
 * ConfigProvider 组件的主题类型
 */
export type ConfigProviderType = 'default' | 'primary' | 'success' | 'warning' | 'error'

/**
 * ConfigProvider 组件的 Props 定义
 */
export const configproviderProps = {
  /**
   * 组件尺寸
   */
  size: {
    type: String as PropType<ConfigProviderSize>,
    default: 'medium'
  },
  /**
   * 组件类型
   */
  type: {
    type: String as PropType<ConfigProviderType>,
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
 * ConfigProvider 组件的 Props 类型
 */
export type ConfigProviderProps = ExtractPropTypes<typeof configproviderProps>

/**
 * ConfigProvider 组件的实例类型
 */
export interface ConfigProviderInstance {
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
 * ConfigProvider 组件的事件类型
 */
export interface ConfigProviderEvents {
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
 * ConfigProvider 组件的插槽类型
 */
export interface ConfigProviderSlots {
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

