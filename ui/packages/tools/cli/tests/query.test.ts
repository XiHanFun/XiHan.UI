import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { findComponent, findPage, loadKnowledge, suggestComponents } from '../src/knowledge'
import { compareVersions, demoSource, listComponents, queryChangelog, QueryError, queryTokens, resolveDoc } from '../src/query'

const knowledge = loadKnowledge(fileURLToPath(new URL('./fixtures/data', import.meta.url)))

describe('组件名解析', () => {
  it.each([
    ['date-picker'],
    ['DatePicker'],
    ['XhDatePickerRoot'],
    ['XhDatePickerTrigger'],
    ['DatePickerTrigger'],
    ['xh-date-picker'],
    ['<xh-date-picker>'],
    ['日期选择器'],
    ['date picker'],
  ])('%s 解析到 date-picker', (name) => {
    expect(findComponent(knowledge, name)?.id).toBe('date-picker')
  })

  it('未知名字返回 undefined，候选按编辑距离给出', () => {
    expect(findComponent(knowledge, 'buton')).toBeUndefined()
    expect(suggestComponents(knowledge, 'buton').map(c => c.id)).toEqual(['button'])
    expect(findComponent(knowledge, '')).toBeUndefined()
  })
})

describe('文档页', () => {
  it('完整路径与唯一末段都能找到，大小写与扩展名不敏感于写法', () => {
    expect(findPage(knowledge, 'guide/theme')?.title).toBe('设计令牌与主题')
    expect(findPage(knowledge, 'theme')?.path).toBe('guide/theme')
    expect(findPage(knowledge, '/guide/theme.md')?.path).toBe('guide/theme')
    expect(findPage(knowledge, 'nope')).toBeUndefined()
  })

  it('组件页按所选写法内联示例，缺写法时明说', () => {
    const vue = resolveDoc(knowledge, 'Button', 'vue')
    expect(vue.markdown).toContain('```vue\n<template><XhButton>保存</XhButton></template>\n```')
    expect(vue.markdown).not.toContain('<XhDemo')
    const wc = resolveDoc(knowledge, 'button', 'web-components')
    expect(wc.markdown).toContain('```html\n<xh-button>')
    expect(wc.markdown).toContain('> 示例 `button/02-tone` 没有 Web Components 写法。')
  })

  it('找不到时抛出带候选的 QueryError', () => {
    expect(() => resolveDoc(knowledge, 'butto', 'vue')).toThrow(QueryError)
    try {
      resolveDoc(knowledge, 'butto', 'vue')
    }
    catch (error) {
      expect((error as QueryError).suggestions).toContain('button')
    }
  })
})

describe('列表', () => {
  it('按分类与关键字过滤，空分类不出现', () => {
    expect(listComponents(knowledge).map(g => g.id)).toEqual(['general', 'form'])
    expect(listComponents(knowledge, { category: '数据录入' }).flatMap(g => g.components.map(c => c.id))).toEqual(['date-picker'])
    expect(listComponents(knowledge, { query: '日期' }).map(g => g.id)).toEqual(['form'])
  })

  it('未知分类报错并列出全部分类', () => {
    expect(() => listComponents(knowledge, { category: 'nope' })).toThrow(/没有名为「nope」的分类/)
  })
})

describe('示例', () => {
  const button = findComponent(knowledge, 'button')!

  it.each([['1'], ['01-basic'], ['basic'], ['基础用法']])('按 %s 取到第一个示例', (name) => {
    expect(demoSource(knowledge, button, name, 'react').source).toBe('export default () => <XhButton>保存</XhButton>')
  })

  it('示例缺所选写法时报错并列出现有写法', () => {
    try {
      demoSource(knowledge, button, '2', 'react')
      expect.unreachable()
    }
    catch (error) {
      expect((error as QueryError).suggestions).toEqual(['vue'])
    }
  })
})

describe('令牌', () => {
  it('不给参数时列令牌族', () => {
    const result = queryTokens(knowledge)
    expect(result.kind === 'families' && result.families).toEqual([{ family: 'bg', count: 2 }, { family: 'shape', count: 1 }])
  })

  it('按片段匹配，可带 --xh- 前缀', () => {
    const result = queryTokens(knowledge, { query: '--xh-bg-brand' })
    expect(result.kind === 'global' && result.tokens.map(t => t.name)).toEqual(['--xh-bg-brand', '--xh-bg-brand-subtle'])
  })

  it('按组件列覆盖槽', () => {
    const result = queryTokens(knowledge, { component: 'XhButton' })
    expect(result.kind === 'component' && result.tokens.map(t => t.name)).toEqual(['--xh-button-bg'])
  })

  it('没有匹配时报错', () => {
    expect(() => queryTokens(knowledge, { query: 'zzz' })).toThrow(QueryError)
  })
})

describe('更新日志', () => {
  it('不给版本取最近一版', () => {
    expect(queryChangelog(knowledge).map(s => s.version)).toEqual(['4.1.0'])
  })

  it('区间不含起点、含终点，两端顺序无关', () => {
    expect(queryChangelog(knowledge, { from: '4.0.0', to: '4.1.0' }).map(s => s.version)).toEqual(['4.1.0', '4.0.1'])
    expect(queryChangelog(knowledge, { from: 'v4.1.0', to: '4.0.0' }).map(s => s.version)).toEqual(['4.1.0', '4.0.1'])
  })

  it('关键字是组件名时连同 PascalCase 与中文名一起匹配', () => {
    const sections = queryChangelog(knowledge, { from: '4.0.0-alpha.0', to: '4.1.0', keyword: 'date-picker' })
    expect(sections.map(s => s.body)).toEqual(['- **修复** DatePicker 标题聚焦', '- **调整** 日期选择器星期格式'])
  })

  it('不存在的版本报错', () => {
    expect(() => queryChangelog(knowledge, { from: '9.9.9' })).toThrow(/没有 9\.9\.9/)
  })

  it('预发布排在同号正式版之前', () => {
    expect(compareVersions('4.0.0-alpha.0', '4.0.0')).toBeLessThan(0)
    expect(compareVersions('4.0.1', '4.0.0')).toBeGreaterThan(0)
    expect(compareVersions('v4.1.0', '4.1.0')).toBe(0)
  })
})
