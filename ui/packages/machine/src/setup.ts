// setup<T>()：类型锚工厂。一次绑定 schema，后续全部推断。
// guards 只作为 setup 的内部实现暴露（createGuards 不进公开 API 表）。
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
