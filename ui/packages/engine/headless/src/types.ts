/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 types 类型契约。

import type { Anatomy, MachineConfig, MachineSchema, NormalizeProps, PropTypes } from '@xihan-ui/core'

// 无头组件的公共契约：解剖 + 状态机定义 + 内置文案。api 形状由各组件自己声明。
export interface HeadlessComponent<Schema extends MachineSchema> {
  anatomy: Anatomy<string>
  machine: MachineConfig<Schema>
  messages: Readonly<Record<string, string>>
}

export type { NormalizeProps, PropTypes }
