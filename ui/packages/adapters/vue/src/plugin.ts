/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// @xihan-ui/vue/plugin —— 全量注册：app.use(XiHanUI) 后模板里直接写 <XhButton> / <xh-button>。
//
// 与主入口分开：插件引用全部组件，用了它就放弃了按需摇树，整包组件都进产物。
// 只想省掉 import 又要按需的，用 @xihan-ui/vue/resolver 配 unplugin-vue-components。
//
// 引入本模块的同时给 vue 的 GlobalComponents 补上全部组件的类型，Volar / vue-tsc 在
// 模板里就认得它们；名单直接取主入口的 Xh 前缀导出，不另维护一份。
import type { Plugin } from 'vue'
import * as entry from './plugin-components'

type ComponentName = Extract<keyof typeof entry, `Xh${string}`>

declare module 'vue' {
  export interface GlobalComponents extends Pick<typeof entry, ComponentName> {}
}

/** 把主入口全部 Xh 前缀的组件按导出名注册为全局组件。 */
export const XiHanUI: Plugin = {
  install(app) {
    for (const [name, component] of Object.entries(entry)) {
      if (/^Xh[A-Z]/.test(name))
        app.component(name, component as (typeof entry)[ComponentName])
    }
  },
}
