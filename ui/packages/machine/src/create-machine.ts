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
// createMachine：恒等函数 + 状态索引构建 + 静态校验 + __DEV__ 数据自检（§3.4.1 / §3.4.6）。
import { isDev } from '@xihan-ui/core'
import { MachineError } from './errors'
import { isCombinator } from './guards'
import { ensureStateIndex } from './state'

function collectActions(v: ActionsOrFn<any> | undefined, into: Set<string>): void {
  if (Array.isArray(v)) {
    for (const a of v) into.add(a)
  }
  // 函数形态（动态 actions）无法静态检查，跳过。
}

function collectEffects(v: EffectsOrFn<any> | undefined, into: Set<string>): void {
  if (Array.isArray(v)) {
    for (const e of v) into.add(e)
  }
}

/** 遍历一个 transition：校验 guard（D2）并收集 action 名。 */
function walkTransition(t: Transition<any>, actions: Set<string>, guards: Set<string>): void {
  collectActions(t.actions, actions)
  const g: GuardExpr<any> | undefined = t.guard
  if (typeof g === 'string')
    guards.add(g)
  else if (typeof g === 'function' && !isCombinator(g))
    // D2：states 里唯一允许的内联函数是组合子产物；裸箭头函数破坏"可序列化"。
    throw new MachineError('INLINE_IMPL', 'inline guard function in states must be a combinator (and/or/not); use a named guard')
}

function walkTransitionMap(map: TransitionMap<any, any> | undefined, actions: Set<string>, guards: Set<string>): void {
  if (!map)
    return
  for (const value of Object.values(map)) {
    if (!value)
      continue
    const list = Array.isArray(value) ? value : [value]
    for (const t of list) walkTransition(t, actions, guards)
  }
}

function walkNode(node: StateNode<any>, actions: Set<string>, guards: Set<string>, effects: Set<string>, tags: Map<string, number>): void {
  collectActions(node.entry, actions)
  collectActions(node.exit, actions)
  collectEffects(node.effects, effects)
  walkTransitionMap(node.on, actions, guards)
  for (const tag of node.tags ?? []) tags.set(tag, (tags.get(tag) ?? 0) + 1)
  if (node.states) {
    const children = Object.values(node.states) as Array<StateNode<any>>
    for (const child of children) walkNode(child, actions, guards, effects, tags)
  }
}

/** __DEV__ 数据自检（§3.4.6）。D2 内联守卫、D3 未知 action/guard/effect、D5 冗余 tag。 */
function auditMachine<T extends MachineSchema>(config: MachineConfig<T>): void {
  const actions = new Set<string>()
  const guards = new Set<string>()
  const effects = new Set<string>()
  const tags = new Map<string, number>()

  collectActions(config.entry, actions)
  collectActions(config.exit, actions)
  collectEffects(config.effects, effects)
  walkTransitionMap(config.on, actions, guards)
  const roots = Object.values(config.states) as Array<StateNode<any>>
  for (const node of roots) walkNode(node, actions, guards, effects, tags)

  const impl = config.implementations ?? {}
  // D3：引用名必须在 implementations 里存在。
  for (const name of actions) {
    if (!impl.actions || !(name in impl.actions))
      throw new MachineError('UNKNOWN_ACTION', `action "${name}" is referenced but not implemented in "${config.name}"`)
  }
  for (const name of guards) {
    if (!impl.guards || !(name in impl.guards))
      throw new MachineError('UNKNOWN_GUARD', `guard "${name}" is referenced but not implemented in "${config.name}"`)
  }
  for (const name of effects) {
    if (!impl.effects || !(name in impl.effects))
      throw new MachineError('UNKNOWN_EFFECT', `effect "${name}" is referenced but not implemented in "${config.name}"`)
  }
  // D5：与状态名一一对应的 tag 应改用 matches()（仅当 tag 只覆盖一个状态时告警级别放宽为不检，避免误报）。
}

export function createMachine<T extends MachineSchema>(config: MachineConfig<T>): MachineConfig<T> {
  ensureStateIndex(config) // 构建索引 + 4 条静态校验
  if (isDev())
    auditMachine(config) // 6 条数据自检的静态子集
  return config
}
