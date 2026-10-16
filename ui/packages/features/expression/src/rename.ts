/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 按引用改写表达式源码：只改 collectReferences 认出的引用，字符串字面量、函数名与其余源码一字不动。
import type { ExpressionNode } from './ast'
import type { ExpressionIssue } from './issues'
import type { ParseOptions } from './parser'
import { isWhitespace } from './chars'
import { parse } from './parser'
import { printReferenceSegment } from './print'
import { collectReferenceNodes } from './references'

/** 给一处引用的路径返回新路径；返回 undefined 或与原路径相同表示不改。 */
export type ReferenceRename = (path: readonly string[]) => readonly string[] | undefined

/** 改写结果：成功时是新源码与改了几处；解析失败时原样返回源码，并带上第一条问题。 */
export type RenameReferencesResult
  = | { readonly ok: true, readonly source: string, readonly renamed: number }
    | { readonly ok: false, readonly source: string, readonly issue: ExpressionIssue }

/** 引用链上的各段节点：首个是顶层标识符，其后依次是点号成员或字符串下标。 */
function chainOf(node: ExpressionNode): ExpressionNode[] {
  const chain: ExpressionNode[] = []
  let current: ExpressionNode = node
  while (current.type === 'Member' || current.type === 'Index') {
    chain.unshift(current)
    current = current.object
  }
  chain.unshift(current)
  return chain
}

function samePath(a: readonly string[], b: readonly string[]): boolean {
  return a.length === b.length && a.every((segment, index) => segment === b[index])
}

/**
 * 第 index 段在源码里的区间：首段是标识符本身，其后从点号或左方括号起到这一段的末尾。
 * 上一段末尾与点号、左方括号之间只会有空白与括住上一段的右括号，它们不算进这一段。
 */
function segmentSpan(source: string, chain: readonly ExpressionNode[], index: number): readonly [number, number] {
  const node = chain[index]!
  if (index === 0)
    return [node.start, node.end]
  let start = chain[index - 1]!.end
  while (start < node.end && source[start] !== '.' && source[start] !== '[' && (source[start] === ')' || isWhitespace(source.charCodeAt(start))))
    start += 1
  return [start, node.end]
}

function checkPath(path: unknown): readonly string[] {
  if (!Array.isArray(path) || path.length === 0 || path.some(segment => typeof segment !== 'string'))
    throw new TypeError('[expression] renameReferences: rename must return a non-empty array of strings or undefined')
  return path as readonly string[]
}

/**
 * 按 rename 改写源码里的引用：只重写名字变了的那几段，其余源码照抄（空白、括号、引号写法都不变）。
 * 重写的段沿用原来的写法：首段是标识符，其后是点号成员或字符串下标；新路径更长时多出的段接成点号成员，
 * 更短时去掉多出的段。名字不合标识符规则时加反引号，下标按字符串转义。
 * 不改入参；解析失败时原样返回并给出问题，不做半截改写。rename 返回的不是非空字符串数组时抛 `TypeError`。
 *
 * @example 把参数 `$year` 改名为 `$fiscalYear`：
 * renameReferences(source, path => path[0] === '$year' ? ['$fiscalYear', ...path.slice(1)] : undefined)
 */
export function renameReferences(source: string, rename: ReferenceRename, options: ParseOptions = {}): RenameReferencesResult {
  const parsed = parse(source, options)
  if (!parsed.ok)
    return { ok: false, source, issue: parsed.issue }
  let out = ''
  let cursor = 0
  let renamed = 0
  for (const { path, node } of collectReferenceNodes(parsed.ast)) {
    const next = rename(path)
    if (next === undefined)
      continue
    const target = checkPath(next)
    if (samePath(path, target))
      continue
    const chain = chainOf(node)
    for (let index = 0; index < path.length; index += 1) {
      if (index < target.length && path[index] === target[index])
        continue
      const [start, end] = segmentSpan(source, chain, index)
      const name = target[index]
      out += source.slice(cursor, start) + (name === undefined ? '' : printReferenceSegment(name, index === 0 ? 'identifier' : chain[index]!.type === 'Index' ? 'index' : 'member'))
      cursor = end
    }
    if (target.length > path.length) {
      out += source.slice(cursor, node.end) + target.slice(path.length).map(name => printReferenceSegment(name, 'member')).join('')
      cursor = node.end
    }
    renamed += 1
  }
  return { ok: true, source: out + source.slice(cursor), renamed }
}
