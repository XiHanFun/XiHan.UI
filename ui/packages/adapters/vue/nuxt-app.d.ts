/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// @xihan-ui/vue/nuxt 交给 Nuxt 应用的类型：模块在 prepare:types 里引用本文件。
// 只在 Nuxt 应用里成立（'#app' 由 Nuxt 生成），所以不放进 src，适配器自己的类型检查不读它。
import type { VisualEnvironmentController } from '@xihan-ui/core/visual-environment'

declare module '#app' {
  interface NuxtApp {
    /**
     * 根作用域的视觉环境控制器：setPreference({ mode: 'dark' }) 切明暗，subscribe 订阅已定型的状态。
     * 服务端每个请求一个，按 initial 解出（system 轴取基线），<html> 上的属性跟着它；
     * 客户端的那个再叠上读者存过的偏好与系统偏好。按状态分支渲染的内容放到 onMounted 之后，免得水合对不上。
     */
    $xhVisual: VisualEnvironmentController
  }
}

export {}
