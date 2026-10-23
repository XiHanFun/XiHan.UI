/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 主入口的全部导出，供插件取整张组件名单。
//
// 单独成模块：插件对它做命名空间导入，打包器要为命名空间生成一个对象。直接对主入口这么做，
// 那个对象会落进 index.js 并跟着导出，主入口的导出面平白多出一个内部名字。
export * from './index'
