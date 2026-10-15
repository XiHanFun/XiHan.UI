/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 按 JSON 路径编辑文档的四种操作：设置、插入、删除与移动，返回新文档与精确还原的逆操作。

import type { JsonArray, JsonPath, JsonValue } from '@xihan-ui/core/json'
import type { OperationResult } from './history'
import { findJsonViolation, getJsonAt, isPlainObject, jsonEquals, JsonPathError, setJsonAt } from '@xihan-ui/core/json'
import { applyInSequence } from './history'

/**
 * 路径编辑操作，都是纯 JSON：
 * - set：在路径处写入 value；value 缺省时删除对象键。createMissing 为 true 时中间缺少的对象键补成空对象。
 * - insert：把 value 插入 path 指向的数组，index 缺省时追加到末尾。
 * - remove：删除对象键或数组项。
 * - move：把 path 指向的数组项移到同一数组的 index 处。
 */
export type PathOperation
  = | { readonly type: 'set', readonly path: JsonPath, readonly value?: JsonValue, readonly createMissing?: boolean }
    | { readonly type: 'insert', readonly path: JsonPath, readonly index?: number, readonly value: JsonValue }
    | { readonly type: 'remove', readonly path: JsonPath }
    | { readonly type: 'move', readonly path: JsonPath, readonly index: number }

/** 路径编辑失败的原因。 */
export type PathOperationErrorCode
  = | 'invalid-operation'
    | 'invalid-path'
    | 'path-not-found'
    | 'invalid-value'
    | 'not-an-array'
    | 'index-out-of-range'

/** 路径编辑失败时抛出，message 即 code；文档保持不变。 */
export class PathOperationError extends Error {
  readonly code: PathOperationErrorCode
  readonly operation: PathOperation

  constructor(code: PathOperationErrorCode, operation: PathOperation) {
    super(code)
    this.name = 'PathOperationError'
    this.code = code
    this.operation = operation
  }
}

type Op<T extends PathOperation['type']> = Extract<PathOperation, { type: T }>

const TYPES: readonly string[] = ['set', 'insert', 'remove', 'move']

/**
 * 应用一个路径编辑操作，返回新文档与逆操作，不修改输入；未改动的部分沿用原引用，写入的值不做拷贝。
 * 没有带来变化时返回传入的同一个文档，逆操作为空数组。
 */
export function applyPathOperation<T extends JsonValue>(document: T, operation: PathOperation): OperationResult<T, PathOperation> {
  if (!isPlainObject(operation) || !TYPES.includes(operation.type as string) || !Array.isArray(operation.path))
    throw new PathOperationError('invalid-operation', operation)
  try {
    switch (operation.type) {
      case 'set':
        return applySet(document, operation)
      case 'insert':
        return applyInsert(document, operation)
      case 'remove':
        return applyRemove(document, operation)
      case 'move':
        return applyMove(document, operation)
    }
  }
  catch (error) {
    if (error instanceof JsonPathError)
      throw new PathOperationError(error.code, operation)
    throw error
  }
}

/** 依次应用一组路径编辑操作；逆操作为各操作逆操作按反序拼接。任一操作失败时抛错，输入文档保持不变。 */
export function applyPathOperations<T extends JsonValue>(document: T, operations: readonly PathOperation[]): OperationResult<T, PathOperation> {
  return applyInSequence(applyPathOperation<T>, document, operations)
}

function applySet<T extends JsonValue>(document: T, operation: Op<'set'>): OperationResult<T, PathOperation> {
  const { path, value } = operation
  if (path.length === 0) {
    if (value === undefined || findJsonViolation(value) !== undefined)
      throw new PathOperationError('invalid-value', operation)
    if (jsonEquals(document, value))
      return unchanged(document)
    return { document: value as T, inverse: [{ type: 'set', path: [], value: document }] }
  }
  const missing = operation.createMissing === true ? firstMissingPrefix(document, path) : undefined
  const result = setJsonAt(document, path, value, { createMissing: operation.createMissing === true })
  if (result.root === document)
    return unchanged(document)
  if (missing !== undefined)
    return { document: result.root, inverse: [{ type: 'remove', path: path.slice(0, missing) }] }
  return {
    document: result.root,
    inverse: [result.previous === undefined ? { type: 'remove', path } : { type: 'set', path, value: result.previous }],
  }
}

function applyInsert<T extends JsonValue>(document: T, operation: Op<'insert'>): OperationResult<T, PathOperation> {
  const { path, value } = operation
  const array = arrayAt(document, path, operation)
  const index = operation.index ?? array.length
  if (!Number.isInteger(index) || index < 0 || index > array.length)
    throw new PathOperationError('index-out-of-range', operation)
  if (value === undefined || findJsonViolation(value) !== undefined)
    throw new PathOperationError('invalid-value', operation)
  const next = [...array.slice(0, index), value, ...array.slice(index)]
  return { document: replaceAt(document, path, next), inverse: [{ type: 'remove', path: [...path, index] }] }
}

function applyRemove<T extends JsonValue>(document: T, operation: Op<'remove'>): OperationResult<T, PathOperation> {
  const { path } = operation
  if (path.length === 0)
    throw new PathOperationError('invalid-path', operation)
  const parentPath = path.slice(0, -1)
  const last = path.at(-1)!
  const old = getJsonAt(document, path)
  if (old === undefined)
    throw new PathOperationError('path-not-found', operation)
  if (typeof last === 'number') {
    const array = getJsonAt(document, parentPath) as JsonArray
    const next = [...array.slice(0, last), ...array.slice(last + 1)]
    return { document: replaceAt(document, parentPath, next), inverse: [{ type: 'insert', path: parentPath, index: last, value: old }] }
  }
  return { document: setJsonAt(document, path, undefined).root, inverse: [{ type: 'set', path, value: old }] }
}

function applyMove<T extends JsonValue>(document: T, operation: Op<'move'>): OperationResult<T, PathOperation> {
  const { path, index: target } = operation
  if (path.length === 0)
    throw new PathOperationError('invalid-path', operation)
  const parentPath = path.slice(0, -1)
  const last = path.at(-1)!
  const array = arrayAt(document, parentPath, operation)
  const item = getJsonAt(document, path)
  if (typeof last !== 'number' || item === undefined)
    throw new PathOperationError('path-not-found', operation)
  if (!Number.isInteger(target) || target < 0 || target >= array.length)
    throw new PathOperationError('index-out-of-range', operation)
  if (target === last)
    return unchanged(document)
  const next = array.filter((_, index) => index !== last)
  next.splice(target, 0, item)
  return { document: replaceAt(document, parentPath, next), inverse: [{ type: 'move', path: [...parentPath, target], index: last }] }
}

/** 取路径处的数组；路径不存在抛 path-not-found，不是数组抛 not-an-array。 */
function arrayAt(document: JsonValue, path: JsonPath, operation: PathOperation): JsonArray {
  const value = getJsonAt(document, path)
  if (value === undefined)
    throw new PathOperationError('path-not-found', operation)
  if (!Array.isArray(value))
    throw new PathOperationError('not-an-array', operation)
  return value
}

/** 把路径处的值换成 value；空路径换掉整个文档。 */
function replaceAt<T extends JsonValue>(document: T, path: JsonPath, value: JsonValue): T {
  return path.length === 0 ? value as T : setJsonAt(document, path, value).root
}

/** 路径上第一个不存在的前缀的长度；中间层都存在时为 undefined。 */
function firstMissingPrefix(document: JsonValue, path: JsonPath): number | undefined {
  for (let length = 1; length < path.length; length++) {
    if (getJsonAt(document, path.slice(0, length)) === undefined)
      return length
  }
  return undefined
}

function unchanged<T>(document: T): OperationResult<T, PathOperation> {
  return { document, inverse: [] }
}
