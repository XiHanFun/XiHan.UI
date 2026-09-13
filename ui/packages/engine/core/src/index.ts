/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// @xihan-ui/core —— 运行时底座（框架无关）。
// 三段各自的公开面在这里汇成一个主入口：
//   kernel   结构原语、解剖、诊断、端口类型契约
//   machine  薄 FSM 运行时
//   behavior 交互行为原语

export * from './behavior/index'
export * from './kernel/index'
export * from './machine/index'
