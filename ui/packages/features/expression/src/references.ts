/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 收集语法树里的字段引用路径。
import type { ExpressionNode } from './ast'

/** 一处字段引用：从顶层标识符起、由点号成员或字符串下标连成的最长静态路径。 */
export interface ExpressionReference {
  readonly path: readonly string[]
  readonly start: number
  readonly end: number
}

function staticPath(node: ExpressionNode): string[] | null {
  switch (node.type) {
    case 'Identifier':
      return [node.name]
    case 'Member': {
      const base = staticPath(node.object)
      return base === null ? null : [...base, node.property]
    }
    case 'Index': {
      if (node.index.type !== 'Literal' || typeof node.index.value !== 'string')
        return null
      const base = staticPath(node.object)
      return base === null ? null : [...base, node.index.value]
    }
    default:
      return null
  }
}

function collect(node: ExpressionNode, out: ExpressionReference[]): void {
  const path = staticPath(node)
  if (path !== null) {
    out.push(Object.freeze({ path: Object.freeze(path), start: node.start, end: node.end }))
    return
  }
  switch (node.type) {
    case 'Array':
      node.elements.forEach(element => collect(element, out))
      return
    case 'Member':
      collect(node.object, out)
      return
    case 'Index':
      collect(node.object, out)
      collect(node.index, out)
      return
    case 'Unary':
      collect(node.argument, out)
      return
    case 'Binary':
    case 'Logical':
      collect(node.left, out)
      collect(node.right, out)
      return
    case 'Conditional':
      collect(node.test, out)
      collect(node.consequent, out)
      collect(node.alternate, out)
      return
    case 'Call':
      node.arguments.forEach(argument => collect(argument, out))
  }
}

/**
 * 按源码顺序列出全部字段引用。`a.b[c].d` 得到 `['a', 'b']` 与 `['c']`：
 * 数字下标与表达式下标截断路径，下标里的引用另行列出。
 */
export function collectReferences(ast: ExpressionNode): readonly ExpressionReference[] {
  const out: ExpressionReference[] = []
  collect(ast, out)
  return Object.freeze(out)
}
