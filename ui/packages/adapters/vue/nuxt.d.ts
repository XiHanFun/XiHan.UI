/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// @xihan-ui/vue/nuxt 的类型。模块函数只写出 Nuxt 调用它要用的形状，与 Nuxt 的 NuxtModule 同形即可放进 modules，
// 不依赖 nuxt 或 @nuxt/kit 的类型包。

/** 首帧主题与客户端控制器共用的偏好；brand 写品牌名字符串，不必 brandId()。 */
export interface XiHanUINuxtVisualEnvironment {
  /** 读者偏好存进 localStorage 的键；不给就不持久化，每次按 initial 与系统偏好来。 */
  storageKey?: string
  /** 初始偏好，与视觉环境控制器的 initial 同义：写了的轴压过读者存过的值。 */
  initial?: {
    mode?: 'light' | 'dark' | 'system'
    brand?: string
    density?: 'comfortable' | 'compact'
    dir?: 'ltr' | 'rtl'
    contrast?: 'default' | 'more' | 'system'
    motion?: 'default' | 'reduce' | 'system'
    transparency?: 'default' | 'reduce' | 'system'
    material?: 'standard' | 'liquid'
  }
}

export interface XiHanUINuxtOptions {
  /** 自动注册组件：模板里直接写 <XhButton>，不必 import。缺省开。 */
  components?: boolean
  /**
   * 注入令牌与皮肤：'layered'（缺省，@xihan-ui/styles）、'unlayered'（宿主带无层 reset 时用的无层一份）、
   * false 不注入（自己引令牌或写皮肤）。需要另装 @xihan-ui/styles。
   */
  styles?: 'layered' | 'unlayered' | false
  /** SSR 首帧主题与客户端视觉环境控制器；false 关掉，由应用自己管。 */
  visualEnvironment?: XiHanUINuxtVisualEnvironment | false
}

/** 登记给 Nuxt components:extend 的一条组件。 */
export interface XiHanUINuxtComponent {
  pascalName: string
  kebabName: string
  export: string
  filePath: string
  shortPath: string
  chunkName: string
  prefetch: boolean
  preload: boolean
  global: boolean
  mode: 'all'
  priority: number
}

/**
 * 与 Nuxt 的 NuxtModule 同形：Nuxt 从 getOptions 推出选项类型，nuxt.config 里的 xihanUI 因此有类型提示与检查。
 */
export interface XiHanUINuxtModule {
  (inlineOptions: XiHanUINuxtOptions | undefined, nuxt: any): Promise<void>
  /** 合并后的选项：缺省 < nuxt.config 的 xihanUI < 模块元组的第二项；写错的值在这里就抛。 */
  getOptions: (inlineOptions?: XiHanUINuxtOptions, nuxt?: any) => Promise<Required<XiHanUINuxtOptions>>
  getMeta: () => Promise<{ name: string, configKey: string, compatibility: { nuxt: string } }>
}

/** 主入口全部 Xh 前缀的组件，按 Nuxt 组件目录的写法登记。 */
export declare function xihanUINuxtComponents(): Promise<XiHanUINuxtComponent[]>

/** 首帧脚本：在首帧绘制前把读者偏好解出的八个视觉环境属性写到 <html> 上。 */
export declare function xihanUIFirstFrameScript(visual: XiHanUINuxtVisualEnvironment): string

declare const XiHanUINuxt: XiHanUINuxtModule
export default XiHanUINuxt
