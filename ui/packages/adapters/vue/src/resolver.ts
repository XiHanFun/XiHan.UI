/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// @xihan-ui/vue/resolver —— unplugin-vue-components 的组件解析器：模板里用到的 Xh 组件
// 在编译期按需从主入口导入，不必手写 import，也不放弃摇树。
//
//   Components({ resolvers: [XiHanUIResolver()] })
//
// 只认 Xh 前缀（主入口的组件导出一律如此）。前缀对、名字拼错时不会静默吞掉：
// 解析器照常给出导入，打包器报「主入口没有这个导出」。皮肤不随组件导入：入口处引一次
// @xihan-ui/styles，或交给 @xihan-ui/styles/vite 按用到的组件注入。本模块在构建工具里运行，不引用任何组件。

/** unplugin-vue-components 的解析结果：组件从哪个模块、以哪个导出名导入。 */
export interface XiHanUIResolveResult {
  name: string
  from: string
}

/** 与 unplugin-vue-components 的 ComponentResolver 同形，不依赖它的类型包。 */
export interface XiHanUIComponentResolver {
  type: 'component'
  resolve: (name: string) => XiHanUIResolveResult | undefined
}

const COMPONENT_NAME = /^Xh[A-Z]/

export function XiHanUIResolver(): XiHanUIComponentResolver {
  return {
    type: 'component',
    resolve: name => (COMPONENT_NAME.test(name) ? { name, from: '@xihan-ui/vue' } : undefined),
  }
}
