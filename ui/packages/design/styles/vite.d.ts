/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// @xihan-ui/styles/vite 的类型。插件对象只写出 name 与 enforce，与 Vite 的 Plugin 同形即可放进 plugins，
// 不依赖 vite 的类型包。

export interface XiHanUIStylesOptions {
  /** 扫描哪些文件或目录找用到的组件，相对 Vite 的 root。默认 ['index.html', 'src']，跳过 node_modules、dist 与点开头的目录。 */
  scan?: string[]
  /** 扫哪些扩展名的文件。默认 .vue .ts .tsx .js .jsx .mjs .mts .html .md .svelte .astro。 */
  extensions?: string[]
  /** 另外注入的组件（短横线写法，如 'dialog'）：写在扫描范围之外、由别的包渲染的组件在这里补。 */
  include?: string[]
  /** 不注入的组件，即使源码里写到了。 */
  exclude?: string[]
  /** 开发态挂漏引探测：页面上出现了没注入皮肤的组件就在控制台报一条。默认开。 */
  skinCheck?: boolean
}

export interface XiHanUIStylesPlugin {
  name: string
  enforce: 'pre'
}

/** 随包发布的注入清单（dist/manifest.json）。 */
export interface XiHanUIStyleManifest {
  version: 1
  /** 全量入口里各文件真正落下的先后；令牌记它的包路径。 */
  order: string[]
  /** 组件名 → 它的皮肤文件。 */
  skins: Record<string, string>
  /** 文件 → 它头上的相对 @import（家族配方、被引的皮肤）。 */
  imports: Record<string, string[]>
  /** 组件 → 它渲染时借来的别的组件。 */
  uses: Record<string, string[]>
}

/**
 * 按用到的组件自动注入皮肤：应用入口写 `import 'virtual:xihan-ui/styles'`。
 * 层序、令牌与公共层总在，家族配方与借来的组件皮肤自动补齐，先后与全量入口一致；开发态默认挂漏引探测。
 */
export declare function XiHanUIStyles(options?: XiHanUIStylesOptions): XiHanUIStylesPlugin

/**
 * 按组件名拼出注入的样式（插件内部用的就是它）：全量入口的子集，先后不变。
 * 令牌缺省是一条 @import；inlineTokens 为真时把令牌文件整份贴进来（插件这样用）。
 */
export declare function composeStyles(scopes: Iterable<string>, manifest?: XiHanUIStyleManifest, options?: { inlineTokens?: boolean }): string

/** 一段源码里写到的组件名：认 Xh 前缀的导出名与 xh- 前缀的标签，按最长的组件名前缀归属。 */
export declare function scopesIn(source: string, manifest?: XiHanUIStyleManifest): string[]

/** 读随包发布的注入清单。 */
export declare function readStyleManifest(): XiHanUIStyleManifest
