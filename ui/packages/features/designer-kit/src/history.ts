/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 撤销重做历史栈：只依赖「应用一个操作，返回新文档与逆操作」这一形态，与文档和操作的具体类型无关。
// 每一步只存待执行方向的操作：撤销时应用逆操作，得到的逆操作即重做所需；支持合并连续输入、事务分组与步数上限。

/** 应用一个操作的结果：新文档，以及按顺序应用即可撤销的逆操作。 */
export interface OperationResult<D, O> {
  readonly document: D
  readonly inverse: readonly O[]
}

/** 应用一个操作；不修改输入文档，失败时抛错。 */
export type ApplyOperation<D, O> = (document: D, operation: O) => OperationResult<D, O>

export interface HistoryOptions<D, O> {
  /** 初始文档。 */
  readonly document: D
  readonly apply: ApplyOperation<D, O>
  /** 撤销栈最多保留的步数，超出时丢弃最早的一步，缺省 100。 */
  readonly limit?: number
  /** 带同一合并键的连续执行，相隔不超过这么多毫秒才并入上一步；缺省不限。 */
  readonly mergeWithin?: number
  /** 取当前毫秒数，缺省 Date.now。 */
  readonly now?: () => number
}

export interface ExecuteOptions {
  /** 合并键：上一步带同一合并键且未封口时并入上一步。事务内忽略。 */
  readonly merge?: string
  /** 这一步的说明，供撤销重做按钮提示；合并时保留上一步的说明。 */
  readonly label?: string
}

/** 历史变化的种类。 */
export type HistoryChangeKind = 'execute' | 'undo' | 'redo' | 'commit' | 'rollback' | 'reset' | 'clear'

/** 一次历史变化：变化后的文档与这次实际应用的操作（commit / reset / clear 为空）。 */
export interface HistoryChange<D, O> {
  readonly kind: HistoryChangeKind
  readonly document: D
  readonly operations: readonly O[]
}

export interface History<D, O> {
  /** 当前文档。 */
  readonly document: D
  readonly canUndo: boolean
  readonly canRedo: boolean
  readonly undoCount: number
  readonly redoCount: number
  /** 下一次撤销那一步的说明。 */
  readonly undoLabel: string | undefined
  /** 下一次重做那一步的说明。 */
  readonly redoLabel: string | undefined
  /** 是否处在事务中。 */
  readonly inTransaction: boolean
  /** 依次应用一组操作并记为一步（事务中并入事务）；返回新文档。空数组什么都不做。 */
  readonly execute: (operations: readonly O[], options?: ExecuteOptions) => D
  /** 撤销一步；没有可撤销的步时返回 false。事务中调用抛错。 */
  readonly undo: () => boolean
  /** 重做一步；没有可重做的步时返回 false。事务中调用抛错。 */
  readonly redo: () => boolean
  /** 开始事务：其间的执行在提交时记为一步；可嵌套，最外层提交时才入栈。 */
  readonly begin: (label?: string) => void
  /** 提交一层事务。 */
  readonly commit: () => void
  /** 放弃整个事务（含外层），文档回到事务开始前。 */
  readonly rollback: () => void
  /** 在事务中运行 run：正常返回则提交，抛错则放弃整个事务后重新抛出。 */
  readonly transact: <T>(run: () => T, label?: string) => T
  /** 封口：此后的执行不再并入当前最上面一步。 */
  readonly seal: () => void
  /** 换成新文档并清空撤销与重做栈。事务中调用抛错。 */
  readonly reset: (document: D) => void
  /** 清空撤销与重做栈，文档不变。事务中调用抛错。 */
  readonly clear: () => void
  /** 订阅变化，返回取消订阅的函数。 */
  readonly subscribe: (listener: (change: HistoryChange<D, O>) => void) => () => void
}

interface Entry<O> {
  operations: readonly O[]
  readonly label: string | undefined
  readonly merge: string | undefined
  time: number
}

interface Transaction<O> {
  undo: readonly O[]
  readonly label: string | undefined
}

/** 创建撤销重做历史栈。 */
export function createHistory<D, O>(options: HistoryOptions<D, O>): History<D, O> {
  const { apply } = options
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
  let transaction: Transaction<O> | undefined
  let depth = 0
  const listeners = new Set<(change: HistoryChange<D, O>) => void>()

  const emit = (kind: HistoryChangeKind, operations: readonly O[]): void => {
    const change: HistoryChange<D, O> = { kind, document, operations }
    for (const listener of Array.from(listeners))
      listener(change)
  }

  const run = (operations: readonly O[]): OperationResult<D, O> => {
    let current = document
    const inverses: (readonly O[])[] = []
    for (const operation of operations) {
      const result = apply(current, operation)
      current = result.document
      inverses.push(result.inverse)
    }
    return { document: current, inverse: inverses.reverse().flat() }
  }

  const pushUndo = (entry: Entry<O>): void => {
    undoStack.push(entry)
    if (undoStack.length > limit)
      undoStack = undoStack.slice(undoStack.length - limit)
  }

  const assertIdle = (action: string): void => {
    if (depth > 0)
      throw new Error(`[designer-kit] cannot ${action} during a transaction`)
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
      return undoStack.at(-1)?.label
    },
    get redoLabel() {
      return redoStack.at(-1)?.label
    },
    get inTransaction() {
      return depth > 0
    },

    execute(operations, executeOptions = {}) {
      if (operations.length === 0)
        return document
      const result = run(operations)
      document = result.document
      if (transaction) {
        transaction.undo = [...result.inverse, ...transaction.undo]
      }
      else {
        const time = now()
        const top = undoStack.at(-1)
        const merge = executeOptions.merge
        if (merge !== undefined && top && !sealed && top.merge === merge && time - top.time <= mergeWithin) {
          top.operations = [...result.inverse, ...top.operations]
          top.time = time
        }
        else {
          pushUndo({ operations: result.inverse, label: executeOptions.label, merge, time })
        }
        sealed = false
        redoStack = []
      }
      emit('execute', operations)
      return document
    },

    undo() {
      assertIdle('undo')
      const entry = undoStack.at(-1)
      if (!entry)
        return false
      const result = run(entry.operations)
      undoStack.pop()
      document = result.document
      redoStack.push({ operations: result.inverse, label: entry.label, merge: undefined, time: now() })
      sealed = true
      emit('undo', entry.operations)
      return true
    },

    redo() {
      assertIdle('redo')
      const entry = redoStack.at(-1)
      if (!entry)
        return false
      const result = run(entry.operations)
      redoStack.pop()
      document = result.document
      pushUndo({ operations: result.inverse, label: entry.label, merge: undefined, time: now() })
      sealed = true
      emit('redo', entry.operations)
      return true
    },

    begin(label) {
      if (depth === 0)
        transaction = { undo: [], label }
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
        pushUndo({ operations: finished.undo, label: finished.label, merge: undefined, time: now() })
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

    transact<T>(body: () => T, label?: string): T {
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

    reset(next) {
      assertIdle('reset')
      document = next
      undoStack = []
      redoStack = []
      sealed = true
      emit('reset', [])
    },

    clear() {
      assertIdle('clear')
      undoStack = []
      redoStack = []
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
