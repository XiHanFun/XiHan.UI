import type {
  ActionsOrFn,
  EffectsOrFn,
  GuardExpr,
  MachineConfig,
  MachineSchema,
  StateNode,
  Transition,
  TransitionMap,
} from './types'
// createMachine：构建状态索引、跑静态校验，原样返回配置。
import { MachineError } from './errors'
import { COMBINATOR, isCombinator } from './guards'
import { getOwnCallableImplementation } from './implementation'
import { ensureStateIndex } from './state'

interface GuardWalkState {
  audited: Set<object>
  visiting: Set<object>
}

function collectActions(v: ActionsOrFn<any> | undefined, into: Set<string>): void {
  if (Array.isArray(v)) {
    for (const a of v) into.add(a)
  }
  // 函数形态的动态 actions 跳过，无法静态检查。
}

function collectEffects(v: EffectsOrFn<any> | undefined, into: Set<string>): void {
  if (Array.isArray(v)) {
    for (const e of v) into.add(e)
  }
}

function readCombinatorArgs(expr: object): unknown[] {
  const marker = Object.getOwnPropertyDescriptor(expr, COMBINATOR)
  if (!marker || !('value' in marker))
    throw new MachineError('INLINE_IMPL', 'guard combinator marker must be an own data property')
  const metadata = marker.value
  if ((typeof metadata !== 'object' && typeof metadata !== 'function') || metadata === null)
    throw new MachineError('INLINE_IMPL', 'guard combinator metadata must be an object')
  const op = Object.getOwnPropertyDescriptor(metadata, 'op')
  if (!op || !('value' in op) || (op.value !== 'and' && op.value !== 'or' && op.value !== 'not'))
    throw new MachineError('INLINE_IMPL', 'guard combinator metadata must contain a supported own data op')
  const args = Object.getOwnPropertyDescriptor(metadata, 'args')
  if (!args || !('value' in args) || !Array.isArray(args.value))
    throw new MachineError('INLINE_IMPL', 'guard combinator metadata must contain an own data args array')
  if (op.value === 'not' && args.value.length !== 1)
    throw new MachineError('INLINE_IMPL', 'the not guard combinator must contain exactly one argument')
  return args.value
}

function collectGuard(expr: GuardExpr<any>, guards: Set<string>, walk: GuardWalkState): void {
  if (typeof expr === 'string') {
    guards.add(expr)
    return
  }
  if (!isCombinator(expr))
    throw new MachineError('INLINE_IMPL', 'inline guard function in states must be a combinator (and/or/not); use a named guard')
  if (walk.audited.has(expr))
    return
  if (walk.visiting.has(expr))
    throw new MachineError('INLINE_IMPL', 'guard combinator metadata must not contain a cycle')
  walk.visiting.add(expr)
  try {
    for (const arg of readCombinatorArgs(expr)) {
      if (typeof arg !== 'string' && typeof arg !== 'function')
        throw new MachineError('INLINE_IMPL', 'guard combinator arguments must be named guards or combinators')
      collectGuard(arg as GuardExpr<any>, guards, walk)
    }
  }
  finally {
    walk.visiting.delete(expr)
  }
  walk.audited.add(expr)
}

/** 遍历一个 transition：校验 guard 并收集 action 名。 */
function walkTransition(t: Transition<any>, actions: Set<string>, guards: Set<string>, walk: GuardWalkState): void {
  collectActions(t.actions, actions)
  if (t.guard !== undefined)
    collectGuard(t.guard, guards, walk)
}

function walkTransitionMap(
  map: TransitionMap<any, any> | undefined,
  actions: Set<string>,
  guards: Set<string>,
  walk: GuardWalkState,
): void {
  if (!map)
    return
  for (const value of Object.values(map)) {
    if (!value)
      continue
    const list = Array.isArray(value) ? value : [value]
    for (const t of list) walkTransition(t, actions, guards, walk)
  }
}

function walkNode(
  node: StateNode<any>,
  actions: Set<string>,
  guards: Set<string>,
  effects: Set<string>,
  tags: Map<string, number>,
  walk: GuardWalkState,
): void {
  collectActions(node.entry, actions)
  collectActions(node.exit, actions)
  collectEffects(node.effects, effects)
  walkTransitionMap(node.on, actions, guards, walk)
  for (const tag of node.tags ?? []) tags.set(tag, (tags.get(tag) ?? 0) + 1)
  if (node.states) {
    const children = Object.values(node.states) as Array<StateNode<any>>
    for (const child of children) walkNode(child, actions, guards, effects, tags, walk)
  }
}

/** 静态自检：内联守卫、未知 action/guard/effect。 */
function auditMachine<T extends MachineSchema>(config: MachineConfig<T>): void {
  const actions = new Set<string>()
  const guards = new Set<string>()
  const effects = new Set<string>()
  const tags = new Map<string, number>()
  const guardWalk: GuardWalkState = {
    audited: new Set<object>(),
    visiting: new Set<object>(),
  }

  collectActions(config.entry, actions)
  collectActions(config.exit, actions)
  collectEffects(config.effects, effects)
  walkTransitionMap(config.on, actions, guards, guardWalk)
  const roots = Object.values(config.states) as Array<StateNode<any>>
  for (const node of roots) walkNode(node, actions, guards, effects, tags, guardWalk)

  const impl = config.implementations ?? {}
  // 引用名必须在 implementations 里存在。
  for (const name of actions) {
    if (!getOwnCallableImplementation(impl.actions, name))
      throw new MachineError('UNKNOWN_ACTION', `action "${name}" is referenced but not implemented in "${config.name}"`)
  }
  for (const name of guards) {
    if (!getOwnCallableImplementation(impl.guards, name))
      throw new MachineError('UNKNOWN_GUARD', `guard "${name}" is referenced but not implemented in "${config.name}"`)
  }
  for (const name of effects) {
    if (!getOwnCallableImplementation(impl.effects, name))
      throw new MachineError('UNKNOWN_EFFECT', `effect "${name}" is referenced but not implemented in "${config.name}"`)
  }
}

export function createMachine<T extends MachineSchema>(config: MachineConfig<T>): MachineConfig<T> {
  ensureStateIndex(config)
  auditMachine(config)
  return config
}
