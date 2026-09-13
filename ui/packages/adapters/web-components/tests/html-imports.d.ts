/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

/** 浏览器测试通过 Vite 原样读取 HTML 示例，不把它当可执行模块。 */
declare module '*.html?raw' {
  const source: string
  export default source
}
