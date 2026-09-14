// 级联勾选算法的判据：AntD/常规树形多选的公认语义——
// 点分支整枝传导、子全勾父勾、有勾有不勾半选、禁用冻结、三种回显收敛。
import type { CascadeNodeLike } from '../src/behavior'
import { describe, expect, it } from 'vitest'
import { cascadeState, cascadeToggle, collapseChecked } from '../src/behavior'

// 华东(上海[静安 浦东] 杭州) 华北(北京) 独苗
const TREE: CascadeNodeLike[] = [
  {
    value: '华东',
    children: [
      { value: '上海', children: [{ value: '静安' }, { value: '浦东' }] },
      { value: '杭州' },
    ],
  },
  { value: '华北', children: [{ value: '北京' }] },
  { value: '独苗' },
]

function sorted(s: Iterable<string>): string[] {
  return [...s].sort()
}

describe('cascadeState', () => {
  it('空集：无勾无半选', () => {
    const { checked, indeterminate } = cascadeState(TREE, [])
    expect(checked.size).toBe(0)
    expect(indeterminate.size).toBe(0)
  })

  it('给分支值等于给整棵子树（最小式输入展开）', () => {
    const { checked, indeterminate } = cascadeState(TREE, ['上海'])
    expect(sorted(checked)).toEqual(['上海', '浦东', '静安'])
    expect(sorted(indeterminate)).toEqual(['华东'])
  })

  it('叶集聚合出父勾与半选', () => {
    const { checked, indeterminate } = cascadeState(TREE, ['静安', '浦东', '杭州'])
    expect(sorted(checked)).toEqual(['上海', '华东', '杭州', '浦东', '静安'])
    expect(indeterminate.size).toBe(0)
    const half = cascadeState(TREE, ['静安'])
    expect(sorted(half.indeterminate)).toEqual(['上海', '华东'])
  })

  it('查不到的值静默忽略', () => {
    const { checked } = cascadeState(TREE, ['不存在', '独苗'])
    expect(sorted(checked)).toEqual(['独苗'])
  })
})

describe('cascadeToggle', () => {
  it('点分支：整枝勾上，父层聚合', () => {
    const { checked, indeterminate } = cascadeToggle(TREE, [], '上海')
    expect(sorted(checked)).toEqual(['上海', '浦东', '静安'])
    expect(sorted(indeterminate)).toEqual(['华东'])
  })

  it('整枝已勾再点：整枝卸掉', () => {
    const { checked } = cascadeToggle(TREE, ['上海'], '上海')
    expect(checked.size).toBe(0)
  })

  it('半选分支点一下：补齐成全勾（半选优先落勾）', () => {
    const { checked } = cascadeToggle(TREE, ['静安'], '上海')
    expect(sorted(checked)).toEqual(['上海', '浦东', '静安'])
  })

  it('点根分支传导到最深层', () => {
    const { checked } = cascadeToggle(TREE, [], '华东')
    expect(sorted(checked)).toEqual(['上海', '华东', '杭州', '浦东', '静安'])
  })

  it('卸掉一个叶让父从勾中降为半选', () => {
    const all = cascadeToggle(TREE, [], '华东')
    const { checked, indeterminate } = cascadeToggle(TREE, all.checked, '静安')
    expect(checked.has('上海')).toBe(false)
    expect(checked.has('华东')).toBe(false)
    expect(sorted(indeterminate)).toEqual(['上海', '华东'])
    expect(checked.has('浦东')).toBe(true)
    expect(checked.has('杭州')).toBe(true)
  })

  it('next 显式设定是幂等的', () => {
    const once = cascadeToggle(TREE, [], '上海', true)
    const twice = cascadeToggle(TREE, once.checked, '上海', true)
    expect(sorted(twice.checked)).toEqual(sorted(once.checked))
  })

  it('禁用子树整棵冻结：点父不动它，聚合仍按它当前态计', () => {
    const tree: CascadeNodeLike[] = [
      {
        value: 'p',
        children: [
          { value: 'a' },
          { value: 'locked', disabled: true, children: [{ value: 'l1' }] },
        ],
      },
    ]
    // locked 未勾：点 p 只勾 a，p 只能半选
    const on = cascadeToggle(tree, [], 'p')
    expect(on.checked.has('a')).toBe(true)
    expect(on.checked.has('l1')).toBe(false)
    expect(on.indeterminate.has('p')).toBe(true)
    // locked 已勾：点 p 卸 a，locked 保持
    const preset = cascadeToggle(tree, ['l1', 'a'], 'p')
    expect(preset.checked.has('l1')).toBe(true)
    expect(preset.checked.has('a')).toBe(false)
  })

  it('点禁用节点本身没有任何效果', () => {
    const tree: CascadeNodeLike[] = [{ value: 'x', disabled: true, children: [{ value: 'y' }] }]
    const { checked } = cascadeToggle(tree, [], 'x')
    expect(checked.size).toBe(0)
  })

  it('children 为空数组的分支按自身真值参与', () => {
    const tree: CascadeNodeLike[] = [{ value: 'dir', children: [] }, { value: 'f' }]
    const on = cascadeToggle(tree, [], 'dir')
    expect(on.checked.has('dir')).toBe(true)
    const off = cascadeToggle(tree, on.checked, 'dir')
    expect(off.checked.size).toBe(0)
  })
})

describe('collapseChecked', () => {
  const FULL = ['静安', '浦东', '杭州']

  it('all：全部勾中节点', () => {
    expect(sorted(collapseChecked(TREE, FULL, 'all'))).toEqual(['上海', '华东', '杭州', '浦东', '静安'])
  })

  it('parent：收到最高整枝', () => {
    expect(collapseChecked(TREE, FULL, 'parent')).toEqual(['华东'])
    expect(sorted(collapseChecked(TREE, ['静安', '浦东'], 'parent'))).toEqual(['上海'])
  })

  it('child：只留叶', () => {
    expect(sorted(collapseChecked(TREE, FULL, 'child'))).toEqual(['杭州', '浦东', '静安'])
  })

  it('文档序输出（parent 档）', () => {
    expect(collapseChecked(TREE, ['杭州', '北京', '独苗'], 'parent')).toEqual(['杭州', '华北', '独苗'])
  })
})
