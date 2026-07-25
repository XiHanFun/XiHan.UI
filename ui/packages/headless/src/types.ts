import type { Anatomy, NormalizeProps, PropTypes } from '@xihan-ui/core'
import type { MachineConfig, MachineSchema } from '@xihan-ui/machine'

// 无头组件的公共契约：解剖 + 状态机定义 + 内置文案。api 形状由各组件自己声明。
export interface HeadlessComponent<Schema extends MachineSchema> {
  anatomy: Anatomy<string>
  machine: MachineConfig<Schema>
  messages: Readonly<Record<string, string>>
}

export type { NormalizeProps, PropTypes }
