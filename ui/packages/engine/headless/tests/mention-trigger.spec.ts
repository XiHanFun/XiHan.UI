import { describe, expect, it } from 'vitest'
import { findMentionTrigger, insertMention, MENTION_DEFAULT_PREFIX, normalizeMentionPrefixes } from '../src/mention'

const AT = [MENTION_DEFAULT_PREFIX]

/** 找触发点：光标写成 | 更好读，这里把它拆成正文与下标。 */
function at(marked: string, prefixes: readonly string[] = AT) {
  const caret = marked.indexOf('|')
  const text = marked.replace('|', '')
  return findMentionTrigger(text, caret, prefixes)
}

describe('前缀触发', () => {
  it('行首的前缀开候选，查询串是前缀到光标之间那段', () => {
    expect(at('@ab|')).toEqual({ prefix: '@', index: 0, query: 'ab' })
  })

  it('空白之后的前缀照样开', () => {
    expect(at('你好 @ab|')).toEqual({ prefix: '@', index: 3, query: 'ab' })
  })

  it('换行之后的前缀照样开：行首判据认的是空白，不是字符串开头', () => {
    expect(at('第一行\n@ab|')).toEqual({ prefix: '@', index: 4, query: 'ab' })
  })

  it('刚敲下前缀那一刻就开，查询串为空串', () => {
    expect(at('@|')).toEqual({ prefix: '@', index: 0, query: '' })
  })

  it('邮箱里的 @ 不误触发：它前面是字母，往前扫又撞上空白', () => {
    expect(at('写信给 foo@bar|')).toBeNull()
    expect(at('foo@bar|')).toBeNull()
  })

  it('查询串里出现空白即收工：提及不跨词', () => {
    expect(at('@ab cd|')).toBeNull()
  })

  it('光标退回到前缀之前就不再触发', () => {
    expect(at('|@ab')).toBeNull()
    expect(at('hi |@ab')).toBeNull()
  })

  it('光标停在前缀正上方（前缀还没落在光标之前）不触发', () => {
    // "a @b" 里光标在 @ 之前一位
    expect(at('a |@b')).toBeNull()
  })

  it('正文里没有前缀就没有触发', () => {
    expect(at('一段普通的话|')).toBeNull()
  })

  it('多种前缀并存，报回命中的是哪一个', () => {
    const prefixes = ['@', '#']
    expect(at('聊 #话题|', prefixes)).toEqual({ prefix: '#', index: 2, query: '话题' })
    expect(at('聊 @某人|', prefixes)).toEqual({ prefix: '@', index: 2, query: '某人' })
  })

  it('多字符前缀按整串匹配', () => {
    expect(at('跑 ::cmd|', ['::'])).toEqual({ prefix: '::', index: 2, query: 'cmd' })
  })

  it('前缀连着前缀时只认最靠前那个合法的', () => {
    // 第二个 @ 前面是第一个 @，不是空白，所以往前退到下标 0
    expect(at('@@a|')).toEqual({ prefix: '@', index: 0, query: '@a' })
  })

  it('光标在 0 位或没有前缀表时一律不触发', () => {
    expect(findMentionTrigger('@ab', 0, AT)).toBeNull()
    expect(findMentionTrigger('@ab', 3, [])).toBeNull()
  })
})

describe('前缀表归一', () => {
  it('不给就用 @', () => {
    expect(normalizeMentionPrefixes(undefined)).toEqual(['@'])
  })

  it('裸串是单个前缀的简写', () => {
    expect(normalizeMentionPrefixes('#')).toEqual(['#'])
  })

  it('空串会在任意位置命中，剔掉', () => {
    expect(normalizeMentionPrefixes(['@', '', '#'])).toEqual(['@', '#'])
  })
})

describe('把候选插回正文中间', () => {
  it('换掉的只是查询串那一段，前后文一字不动', () => {
    const text = '请 @li 看一下'
    // 光标停在 li 之后、那个空格之前
    const trigger = findMentionTrigger(text, 5, AT)!
    expect(trigger).toEqual({ prefix: '@', index: 2, query: 'li' })
    expect(insertMention(text, trigger, '李雷')).toEqual({
      value: '请 @李雷  看一下',
      // 光标落到插入内容之后：'请 ' 2 字 + '@李雷 ' 4 字
      caret: 6,
    })
  })

  it('插在正文末尾时同样只动查询串', () => {
    const text = '喊一声 @h'
    const trigger = findMentionTrigger(text, text.length, AT)!
    expect(insertMention(text, trigger, 'Han')).toEqual({ value: '喊一声 @Han ', caret: 9 })
  })

  it('插入内容末尾带一个空格：光标随后落在空白之后，同一处不会立刻又触发', () => {
    const text = '@h'
    const trigger = findMentionTrigger(text, 2, AT)!
    const next = insertMention(text, trigger, 'Han')
    expect(next.value).toBe('@Han ')
    expect(next.caret).toBe(5)
    expect(findMentionTrigger(next.value, next.caret, AT)).toBeNull()
  })

  it('查询串为空（刚敲下前缀）也插得进去', () => {
    const text = 'hi @'
    const trigger = findMentionTrigger(text, 4, AT)!
    expect(insertMention(text, trigger, 'Ann')).toEqual({ value: 'hi @Ann ', caret: 8 })
  })

  it('多字符前缀连同前缀一起写回正文', () => {
    const text = '跑 ::c'
    const trigger = findMentionTrigger(text, text.length, ['::'])!
    expect(insertMention(text, trigger, 'clean')).toEqual({ value: '跑 ::clean ', caret: 10 })
  })
})
