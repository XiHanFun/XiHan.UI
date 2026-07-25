// @xihan-ui/machine —— 薄 FSM 运行时。
// 定义层：类型 + createMachine + setup + guards + delay + errors。

export { createMachine } from './create-machine'
export { setIntervalEffect, setTimeoutEffect } from './delay'
export { MachineError } from './errors'
export type { MachineErrorCode } from './errors'
export { COMBINATOR, createGuards, isCombinator } from './guards'
export type { GuardCombinators } from './guards'
export { createService } from './service'
export { setup } from './setup'
export { appendStatePath, ensureStateIndex } from './state'
export { findTransition, getExitEnterStates, getStateChain, resolveStateValue, resolveToLeaf } from './transitions'

// 全部类型（import type，零运行时）
export type {
  ActionFn,
  ActionsOrFn,
  BaseSchema,
  Bindable,
  CellParams,
  ComputedFn,
  ContextFacade,
  ContextParams,
  Dep,
  DescendantState,
  Dict,
  EffectFn,
  EffectParams,
  EffectsOrFn,
  EventFacade,
  EventObject,
  GuardExpr,
  GuardFn,
  InspectionEvent,
  MachineConfig,
  MachineSchema,
  MachineStatus,
  Params,
  PropFn,
  PropsParams,
  ReactiveRuntime,
  RefsFacade,
  RefsParams,
  Service,
  ServiceOptions,
  SiblingName,
  Slice,
  StateChainItem,
  StateFacade,
  StateIndex,
  StateNode,
  TopLevelState,
  Transition,
  TransitionMap,
  WatchParams,
} from './types'
