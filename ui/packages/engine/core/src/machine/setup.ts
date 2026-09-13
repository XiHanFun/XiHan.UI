/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// setup<T>()：类型锚工厂。一次绑定 schema，后续全部推断。
import type { GuardCombinators } from './guards'
import type { MachineConfig, MachineSchema } from './types'
import { createMachine } from './create-machine'
import { createGuards } from './guards'

export interface Setup<T extends MachineSchema> {
  createMachine: (config: MachineConfig<T>) => MachineConfig<T>
  guards: GuardCombinators<T>
}

export function setup<T extends MachineSchema>(): Setup<T> {
  return {
    createMachine: (config: MachineConfig<T>) => createMachine<T>(config),
    guards: createGuards<T>(),
  }
}
