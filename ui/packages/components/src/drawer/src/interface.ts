import type { ExtractPropTypes, PropType } from 'vue'

/**
 * Drawer 组件的尺寸类型
 */
export type DrawerSize = 'small' | 'medium' | 'large'

/**
 * Drawer 组件的主题类型
 */
export type DrawerType = 'default' | 'primary' | 'success' | 'warning' | 'error'

/**
 * Drawer 组件的 Props 定义
 */
export const drawerProps = {
  /**
   * 组件尺寸
   */
  size: {
    type: String as PropType<DrawerSize>,
    default: 'medium'
  },
  /**
   * 组件类型
   */
  type: {
    type: String as PropType<DrawerType>,
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
 * Drawer 组件的 Props 类型
 */
export type DrawerProps = ExtractPropTypes<typeof drawerProps>

/**
 * Drawer 组件的实例类型
 */
export interface DrawerInstance {
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
 * Drawer 组件的事件类型
 */
export interface DrawerEvents {
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
 * Drawer 组件的插槽类型
 */
export interface DrawerSlots {
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

