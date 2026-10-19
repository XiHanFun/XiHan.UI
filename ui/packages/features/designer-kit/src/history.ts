/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 撤销重做历史栈：只依赖「应用一个操作，返回新文档与逆操作」这一形态，与文档和操作的具体类型无关。
// 每一步只存待执行方向的操作：撤销时应用逆操作，得到的逆操作即重做所需；
// 支持合并连续输入、事务分组、步数上限与保存点，文档引用不变的执行不入栈；列出全部步骤，可一次跳到其中一步。

/** 应用一个操作的结果：新文档，以及按顺序应用即可撤销的逆操作；没有变化时文档是传入的同一引用。 */
export interface OperationResult<D, O> {
  readonly document: D
  readonly inverse: readonly O[]
}

/** 应用一个操作；不修改输入文档，失败时抛错。 */
export type ApplyOperation<D, O> = (document: D, operation: O) => OperationResult<D, O>

/** 依次应用一组操作，返回最终文档与按反序拼接的各步逆操作；任一操作抛错时整体抛错，输入文档不变。 */
export function applyInSequence<D, O>(apply: ApplyOperation<D, O>, document: D, operations: readonly O[]): OperationResult<D, O> {
  let current = document
  const inverses: (readonly O[])[] = []
  for (const operation of operations) {
    const result = apply(current, operation)
    current = result.document
    inverses.push(result.inverse)
  }
  return { document: current, inverse: inverses.reverse().flat() }
}

/** 一步的说明：字符串，或读的时候现取的函数（换语言后跟着变）。 */
export type HistoryLabel = string | (() => string)

/** 把说明取成字符串；没有说明时为 undefined。 */
function readLabel(label: HistoryLabel | undefined): string | undefined {
  return typeof label === 'function' ? label() : label
}

/** 键盘微移的合并时限（毫秒）：连续按、选中不变、相隔不超过它的并成一步。 */
export const HISTORY_NUDGE_MERGE_WITHIN = 1000

/** 键盘微移的合并键：按选中对象的 id 定，与先后无关；选中不同就不同。 */
export function nudgeMergeKey(ids: readonly string[]): string {
  return `nudge:${JSON.stringify([...ids].sort())}`
}

export interface HistoryOptions<D, O> {
  /** 初始文档，视为已保存。 */
  readonly document: D
  readonly apply: ApplyOperation<D, O>
  /** 撤销栈最多保留的步数，超出时丢弃最早的一步，缺省 100。 */
  readonly limit?: number
  /** 带同一合并键的连续执行，相隔不超过这么多毫秒才并入上一步；缺省不限。 */
  readonly mergeWithin?: number
  /** 取当前毫秒数，缺省 Date.now。 */
  readonly now?: () => number
  /**
   * 没写说明的一步，按这一步的正向操作与应用前的文档生成说明；返回 undefined 时这一步没有说明。
   * 新起一步时调用（并入上一步的不调）；事务提交时按整个事务的正向操作与事务开始前的文档调一次。
   */
  readonly describe?: (operations: readonly O[], before: D) => HistoryLabel | undefined
}

export interface ExecuteOptions {
  /** 合并键：上一步带同一合并键且未封口时并入上一步。事务内忽略。 */
  readonly merge?: string
  /** 这一步的说明，供步骤列表与撤销重做的提示；合并时保留上一步的说明。事务内忽略，取事务的说明。 */
  readonly label?: HistoryLabel
  /** 这一次并入上一步的时限（毫秒），缺省取历史的 mergeWithin；Infinity 表示不看时间，只等封口。 */
  readonly mergeWithin?: number
}

/** 历史变化的种类。 */
export type HistoryChangeKind = 'execute' | 'undo' | 'redo' | 'commit' | 'rollback' | 'reset' | 'clear' | 'save'

/** 一次历史变化：变化后的文档与这次实际应用的操作（commit / reset / clear / save 为空）。 */
export interface HistoryChange<D, O> {
  readonly kind: HistoryChangeKind
  readonly document: D
  /** 这次实际应用的全部操作，按应用的先后拼起来。 */
  readonly operations: readonly O[]
  /** undo / redo 一次走了几步：undo()、redo() 为 1，goTo 为实际步数；别的种类为 0。 */
  readonly steps: number
}

/** 历史里的一步。 */
export interface HistoryEntry {
  /** 位置号：这一步做完之后的位置，跳转与保存点都按它认；同一步撤销、重做后不变。 */
  readonly position: number
  readonly label: HistoryLabel | undefined
  /** 已做（在当前位置及之前）或已撤销（之后，可重做）。 */
  readonly state: 'done' | 'undone'
  /** 做完这一步时的位置是保存点。 */
  readonly saved: boolean
  /** 最近一次执行或并入的时间（毫秒）。 */
  readonly time: number
}

export interface History<D, O> {
  /** 当前文档。 */
  readonly document: D
  readonly canUndo: boolean
  readonly canRedo: boolean
  readonly undoCount: number
  readonly redoCount: number
  /** 下一次撤销那一步的说明，现取成字符串。 */
  readonly undoLabel: string | undefined
  /** 下一次重做那一步的说明，现取成字符串。 */
  readonly redoLabel: string | undefined
  /** 全部步骤，按先后：已做的在前（最早的第一），已撤销的在后。每次读都给新数组。 */
  readonly entries: readonly HistoryEntry[]
  /** 当前位置：最后一个已做步骤的位置号；一步都没做时等于 origin。 */
  readonly position: number
  /** 起点：entries 之前那个状态的位置号，即打开、重新载入、清空之后或丢掉的最后一步之后的位置。 */
  readonly origin: number
  /** 起点之前有被步数上限丢掉的步骤，起点已不是打开时的文档。reset、clear 之后为 false。 */
  readonly truncated: boolean
  /** 起点是保存点。 */
  readonly originSaved: boolean
  /** 是否处在事务中。 */
  readonly inTransaction: boolean
  /** 当前位置与保存点不同，或事务中已有改动：有未保存的修改。保存点被新执行清出重做栈、或早于步数上限能退回的位置时，再也回不到保存点。 */
  readonly dirty: boolean
  /**
   * 依次应用一组操作并记为一步（事务中并入事务）；返回新文档。
   * 空数组或文档引用没有变化时什么都不做，不入栈也不通知。
   */
  readonly execute: (operations: readonly O[], options?: ExecuteOptions) => D
  /** 撤销一步；没有可撤销的步时返回 false。事务中调用抛错。 */
  readonly undo: () => boolean
  /** 重做一步；没有可重做的步时返回 false。事务中调用抛错。 */
  readonly redo: () => boolean
  /**
   * 跳到某个位置：position 是 origin 或某一步的位置号。在当前位置之前就连续撤销，之后就连续重做，记为一次变化。
   * 各步依次应用、全部成功才生效；有一步抛错时文档与栈都不变，错误照样抛出。已在那里或位置号不认识时返回 false。
   * 事务中调用抛错。
   */
  readonly goTo: (position: number) => boolean
  /** 开始事务：其间的执行在提交时记为一步；可嵌套，最外层提交时才入栈。说明以最外层给的为准。 */
  readonly begin: (label?: HistoryLabel) => void
  /** 提交一层事务。 */
  readonly commit: () => void
  /** 放弃整个事务（含外层），文档回到事务开始前。 */
  readonly rollback: () => void
  /** 在事务中运行 run：正常返回则提交，抛错则放弃整个事务后重新抛出。 */
  readonly transact: <T>(run: () => T, label?: HistoryLabel) => T
  /** 封口：此后的执行不再并入当前最上面一步。 */
  readonly seal: () => void
  /** 把当前位置记为保存点并封口。事务中调用抛错。 */
  readonly markSaved: () => void
  /** 换成新文档、清空撤销与重做栈，新文档视为已保存。事务中调用抛错。 */
  readonly reset: (document: D) => void
  /** 清空撤销与重做栈，文档与是否已保存不变。事务中调用抛错。 */
  readonly clear: () => void
  /** 订阅变化，返回取消订阅的函数。 */
  readonly subscribe: (listener: (change: HistoryChange<D, O>) => void) => () => void
}

interface Entry<O> {
  /** 这一步执行完之后的位置标识；撤销重做时随步搬动，保存点按它比对。 */
  readonly position: number
  operations: readonly O[]
  readonly label: HistoryLabel | undefined
  readonly merge: string | undefined
  time: number
}

interface Transaction<D, O> {
  undo: readonly O[]
  /** 事务里依次应用的正向操作，提交时交给 describe。 */
  forward: readonly O[]
  /** 事务开始前的文档。 */
  readonly before: D
  readonly label: HistoryLabel | undefined
}

/** 面板与宿主用的历史快照：说明已现取成字符串。 */
export interface HistorySnapshot {
  readonly entries: readonly {
    readonly position: number
    readonly label: string | undefined
    readonly state: 'done' | 'undone'
    readonly saved: boolean
  }[]
  readonly position: number
  readonly origin: number
  readonly truncated: boolean
  readonly originSaved: boolean
}

/** 把历史取成快照，说明按此刻的语言现取。 */
export function snapshotHistory(history: Pick<History<unknown, unknown>, 'entries' | 'position' | 'origin' | 'truncated' | 'originSaved'>): HistorySnapshot {
  return {
    entries: history.entries.map(entry => ({ position: entry.position, label: readLabel(entry.label), state: entry.state, saved: entry.saved })),
    position: history.position,
    origin: history.origin,
    truncated: history.truncated,
    originSaved: history.originSaved,
  }
}

/** 创建撤销重做历史栈。 */
export function createHistory<D, O>(options: HistoryOptions<D, O>): History<D, O> {
  const { apply, describe } = options
  const limit = options.limit ?? 100
  if (!Number.isInteger(limit) || limit < 0)
    throw new RangeError(`[designer-kit] history limit must be a non-negative integer, got ${limit}`)
  const mergeWithin = options.mergeWithin ?? Infinity
  if (!(mergeWithin >= 0))
    throw new RangeError(`[designer-kit] history mergeWithin must be non-negative, got ${mergeWithin}`)
  const now = options.now ?? Date.now

  let document = options.document
  let undoStack: Entry<O>[] = []
  let redoStack: Entry<O>[] = []
  let sealed = true
  let transaction: Transaction<D, O> | undefined
  let depth = 0
  let positions = 0
  /** 撤销栈清空时所处位置的标识：初始为 0，丢弃或清空步时随之前移。 */
  let floor = 0
  let saved = 0
  /** 起点之前丢过步。 */
  let truncated = false
  const listeners = new Set<(change: HistoryChange<D, O>) => void>()

  const position = (): number => undoStack.at(-1)?.position ?? floor

  const emit = (kind: HistoryChangeKind, operations: readonly O[], steps = 0): void => {
    const change: HistoryChange<D, O> = { kind, document, operations, steps }
    for (const listener of Array.from(listeners))
      listener(change)
  }

  const run = (operations: readonly O[]): OperationResult<D, O> => applyInSequence(apply, document, operations)

  const pushUndo = (entry: Entry<O>): void => {
    undoStack.push(entry)
    if (undoStack.length > limit) {
      const dropped = undoStack.slice(0, undoStack.length - limit)
      floor = dropped.at(-1)!.position
      undoStack = undoStack.slice(undoStack.length - limit)
      truncated = true
    }
  }

  const assertIdle = (action: string): void => {
    if (depth > 0)
      throw new Error(`[designer-kit] cannot ${action} during a transaction`)
  }

  /**
   * 往一个方向连走 count 步：先在副本上依次应用，全部成功才换栈、换文档并通知一次；有一步抛错时什么都不变。
   */
  const travel = (direction: 'undo' | 'redo', count: number): void => {
    const from = direction === 'undo' ? undoStack : redoStack
    const moving = from.slice(from.length - count).reverse()
    let current = document
    const applied: O[] = []
    const moved: Entry<O>[] = []
    const time = now()
    for (const entry of moving) {
      const result = applyInSequence(apply, current, entry.operations)
      current = result.document
      applied.push(...entry.operations)
      moved.push({ position: entry.position, operations: result.inverse, label: entry.label, merge: undefined, time })
    }
    document = current
    if (direction === 'undo') {
      undoStack = undoStack.slice(0, undoStack.length - count)
      redoStack.push(...moved)
    }
    else {
      redoStack = redoStack.slice(0, redoStack.length - count)
      for (const entry of moved)
        pushUndo(entry)
    }
    sealed = true
    emit(direction, applied, count)
  }

  const history: History<D, O> = {
    get document() {
      return document
    },
    get canUndo() {
      return undoStack.length > 0
    },
    get canRedo() {
      return redoStack.length > 0
    },
    get undoCount() {
      return undoStack.length
    },
    get redoCount() {
      return redoStack.length
    },
    get undoLabel() {
      return readLabel(undoStack.at(-1)?.label)
    },
    get redoLabel() {
      return readLabel(redoStack.at(-1)?.label)
    },
    get entries() {
      const entry = (item: Entry<O>, state: HistoryEntry['state']): HistoryEntry => ({ position: item.position, label: item.label, state, saved: item.position === saved, time: item.time })
      return [...undoStack.map(item => entry(item, 'done')), ...[...redoStack].reverse().map(item => entry(item, 'undone'))]
    },
    get position() {
      return position()
    },
    get origin() {
      return floor
    },
    get truncated() {
      return truncated
    },
    get originSaved() {
      return floor === saved
    },
    get inTransaction() {
      return depth > 0
    },
    get dirty() {
      return transaction !== undefined && transaction.undo.length > 0 ? true : position() !== saved
    },

    execute(operations, executeOptions = {}) {
      if (operations.length === 0)
        return document
      const within = executeOptions.mergeWithin ?? mergeWithin
      if (!(within >= 0))
        throw new RangeError(`[designer-kit] execute mergeWithin must be non-negative, got ${within}`)
      const before = document
      const result = run(operations)
      if (result.document === document)
        return document
      document = result.document
      if (transaction) {
        transaction.undo = [...result.inverse, ...transaction.undo]
        transaction.forward = [...transaction.forward, ...operations]
      }
      else {
        const time = now()
        const top = undoStack.at(-1)
        const merge = executeOptions.merge
        if (merge !== undefined && top && !sealed && top.merge === merge && time - top.time <= within) {
          top.operations = [...result.inverse, ...top.operations]
          top.time = time
        }
        else {
          const label = executeOptions.label ?? describe?.(operations, before)
          pushUndo({ position: ++positions, operations: result.inverse, label, merge, time })
        }
        sealed = false
        redoStack = []
      }
      emit('execute', operations)
      return document
    },

    undo() {
      assertIdle('undo')
      if (undoStack.length === 0)
        return false
      travel('undo', 1)
      return true
    },

    redo() {
      assertIdle('redo')
      if (redoStack.length === 0)
        return false
      travel('redo', 1)
      return true
    },

    goTo(target) {
      assertIdle('go to a position')
      if (target === position())
        return false
      if (target === floor) {
        travel('undo', undoStack.length)
        return true
      }
      const done = undoStack.findIndex(entry => entry.position === target)
      if (done >= 0) {
        travel('undo', undoStack.length - 1 - done)
        return true
      }
      const undone = redoStack.findIndex(entry => entry.position === target)
      if (undone >= 0) {
        travel('redo', redoStack.length - undone)
        return true
      }
      return false
    },

    begin(label) {
      if (depth === 0)
        transaction = { undo: [], forward: [], before: document, label }
      depth++
      sealed = true
    },

    commit() {
      if (depth === 0)
        throw new Error('[designer-kit] commit called without an open transaction')
      depth--
      if (depth > 0)
        return
      const finished = transaction!
      transaction = undefined
      if (finished.undo.length > 0) {
        const label = finished.label ?? describe?.(finished.forward, finished.before)
        pushUndo({ position: ++positions, operations: finished.undo, label, merge: undefined, time: now() })
        redoStack = []
      }
      sealed = true
      emit('commit', [])
    },

    rollback() {
      if (depth === 0)
        throw new Error('[designer-kit] rollback called without an open transaction')
      const aborted = transaction!
      const result = run(aborted.undo)
      document = result.document
      transaction = undefined
      depth = 0
      sealed = true
      emit('rollback', aborted.undo)
    },

    transact<T>(body: () => T, label?: HistoryLabel): T {
      history.begin(label)
      let value: T
      try {
        value = body()
      }
      catch (error) {
        if (depth > 0)
          history.rollback()
        throw error
      }
      history.commit()
      return value
    },

    seal() {
      sealed = true
    },

    markSaved() {
      assertIdle('mark saved')
      saved = position()
      sealed = true
      emit('save', [])
    },

    reset(next) {
      assertIdle('reset')
      document = next
      undoStack = []
      redoStack = []
      floor = ++positions
      saved = floor
      truncated = false
      sealed = true
      emit('reset', [])
    },

    clear() {
      assertIdle('clear')
      floor = position()
      undoStack = []
      redoStack = []
      truncated = false
      sealed = true
      emit('clear', [])
    },

    subscribe(listener) {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    },
  }
  return history
}
