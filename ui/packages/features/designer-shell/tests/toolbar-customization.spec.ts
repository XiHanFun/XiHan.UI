// 工具栏定制：读设置里的值、与缺省排列合起来（用户的先后为准，后来新有的命令补到缺省位置旁边）、去掉藏起的。
import { describe, expect, it } from 'vitest'
import { applyToolbarCustomization, mergeToolbarCustomization, toolbarCustomizationOf } from '../src'

const DEFAULTS = [['undo', 'redo'], ['delete', 'duplicate'], ['zoom-out', 'zoom-in', 'zoom-to-fit']]

describe('toolbarCustomizationOf', () => {
  it('取 toolbar.layout：groups 是字符串的二维数组才认，hidden 只留字符串；别的形状当没写', () => {
    expect(toolbarCustomizationOf(undefined)).toBeUndefined()
    expect(toolbarCustomizationOf({ 'toolbar.layout': { groups: [['undo']], hidden: ['undo', 3] } })).toEqual({ groups: [['undo']], hidden: ['undo'] })
    expect(toolbarCustomizationOf({ 'toolbar.layout': { groups: [['undo']], hidden: [] } })).toEqual({ groups: [['undo']] })
    for (const value of [null, [], 'x', { groups: 'x' }, { groups: [['a', 1]] }, { hidden: ['a'] }])
      expect(toolbarCustomizationOf({ 'toolbar.layout': value as never })).toBeUndefined()
  })
})

describe('mergeToolbarCustomization', () => {
  it('没有定制时就是缺省排列的一份拷贝', () => {
    const merged = mergeToolbarCustomization(DEFAULTS, undefined)
    expect(merged).toEqual(DEFAULTS)
    expect(merged[0]).not.toBe(DEFAULTS[0])
  })

  it('用户的分组与先后为准；缺省排列里没有的命令去掉，重复的只留第一处，空组去掉', () => {
    const groups = [['zoom-in', 'undo', 'gone'], ['redo', 'undo', 'delete', 'duplicate', 'zoom-out', 'zoom-to-fit'], ['gone']]
    expect(mergeToolbarCustomization(DEFAULTS, { groups })).toEqual([['zoom-in', 'undo'], ['redo', 'delete', 'duplicate', 'zoom-out', 'zoom-to-fit']])
  })

  it('后来新有的命令：放在缺省排列里同组前面最近一条之后，没有就放在后面最近一条之前，整组都新就另起一组排在最后', () => {
    const arranged = [['undo', 'redo'], ['delete', 'duplicate'], ['zoom-out', 'zoom-in'], ['acme.run', 'acme.stop']]
    // 用户把 redo 挪到了第二组；duplicate、zoom-out 与 acme 那一组是用户定制之后才有的
    const customization = { groups: [['undo'], ['delete', 'redo'], ['zoom-in']] }
    expect(mergeToolbarCustomization(arranged, customization)).toEqual([
      ['undo'],
      ['delete', 'duplicate', 'redo'],
      ['zoom-out', 'zoom-in'],
      ['acme.run', 'acme.stop'],
    ])
  })
})

describe('applyToolbarCustomization', () => {
  it('合起来以后去掉藏起的命令与因此空了的组', () => {
    expect(applyToolbarCustomization(DEFAULTS, { groups: [['redo', 'undo'], ['delete', 'duplicate'], ['zoom-out', 'zoom-in', 'zoom-to-fit']], hidden: ['delete', 'duplicate', 'zoom-in'] }))
      .toEqual([['redo', 'undo'], ['zoom-out', 'zoom-to-fit']])
    expect(applyToolbarCustomization(DEFAULTS, undefined)).toEqual(DEFAULTS)
  })
})
