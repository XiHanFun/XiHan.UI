import type { ExpressionIssue, ReferenceRename } from '../src'
import { describe, expect, it } from 'vitest'
import { collectReferences, parse, renameReferences } from '../src'
import cases from './fixtures/rename-references.json'

/**
 * 按引用改写的跨实现一致性用例。每条给出源码与一组前缀改名（路径以 from 开头的引用把这一段前缀换成 to，
 * 取第一条匹配的），以及期望的新源码或解析问题。其它语言的实现读同一份文件逐条比对。
 */
interface RenameCase {
  readonly source: string
  readonly renames: readonly (readonly [readonly string[], readonly string[]])[]
  readonly expected?: string
  readonly issue?: ExpressionIssue
}

function prefixRename(renames: RenameCase['renames']): ReferenceRename {
  return (path) => {
    const hit = renames.find(([from]) => from.length <= path.length && from.every((segment, index) => segment === path[index]))
    return hit === undefined ? undefined : [...hit[1], ...path.slice(hit[0].length)]
  }
}

describe('renameReferences：跨实现一致性用例', () => {
  it.each((cases as unknown as readonly RenameCase[]).map(item => [item.source, item] as const))('%s', (_source, item) => {
    const result = renameReferences(item.source, prefixRename(item.renames))
    if (item.issue === undefined) {
      expect(result).toMatchObject({ ok: true, source: item.expected })
      const reparsed = parse(result.source)
      expect(reparsed.ok).toBe(true)
    }
    else {
      expect(result).toEqual({ ok: false, source: item.source, issue: item.issue })
    }
  })
})

describe('renameReferences', () => {
  it('报出改了几处；改写后的引用路径就是 rename 给的新路径', () => {
    const result = renameReferences('a + $row.a + b', path => path.at(-1) === 'a' ? [...path.slice(0, -1), 'renamed'] : undefined)
    expect(result).toEqual({ ok: true, source: 'renamed + $row.renamed + b', renamed: 2 })
    const parsed = parse(result.source)
    expect(parsed.ok && collectReferences(parsed.ast).map(reference => reference.path)).toEqual([['renamed'], ['$row', 'renamed'], ['b']])
  })

  it('规格页的示例：参数改名，同名的成员与字符串不动', () => {
    expect(renameReferences('IF($year > 2025, $row.amount, 0)', path => path[0] === '$year' ? ['$fiscalYear', ...path.slice(1)] : undefined))
      .toEqual({ ok: true, source: 'IF($fiscalYear > 2025, $row.amount, 0)', renamed: 1 })
  })

  it('返回 undefined 或原路径时不改，不动源码里的空白与写法', () => {
    const source = 'IF( a>0 ,\n  `order amount` , b )'
    expect(renameReferences(source, path => path)).toEqual({ ok: true, source, renamed: 0 })
    expect(renameReferences(source, () => undefined)).toEqual({ ok: true, source, renamed: 0 })
  })

  it('新路径可以比原路径短或长：保留相同的前缀，其余按语法重写', () => {
    expect(renameReferences('$row.a.b', path => path.length === 3 ? ['$row', 'c'] : undefined).source).toBe('$row.c')
    expect(renameReferences('$row.a', () => ['$row', 'a', 'b']).source).toBe('$row.a.b')
    expect(renameReferences('(a.b).c', () => ['a']).source).toBe('(a)')
  })

  it('解析不了的源码原样返回并给出问题；rename 返回的不是非空字符串数组时抛 TypeError', () => {
    expect(renameReferences('1 +', () => ['x'])).toEqual({ ok: false, source: '1 +', issue: { code: 'XH_EXPR_UNEXPECTED_END', start: 3, end: 3 } })
    expect(() => renameReferences('a', () => [])).toThrow(TypeError)
    expect(() => renameReferences('a', () => [1] as unknown as string[])).toThrow(TypeError)
  })

  it('解析选项原样交给 parse', () => {
    expect(renameReferences('aaaa', () => ['b'], { maxLength: 3 })).toMatchObject({ ok: false, issue: { code: 'XH_EXPR_TOO_LONG' } })
  })
})
