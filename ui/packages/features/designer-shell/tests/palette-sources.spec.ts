// 物料来源：合起各扩展的来源（重名抛 DesignerExtensionError、按 order 排），与内置分组合成物料面板的分组（重名抛 TypeError），
// 条目（含下级）属于来源时交给它的 insert，内置条目交回各款。
import type { DesignerPaletteSource } from '../src'
import { DesignerExtensionError } from '@xihan-ui/designer-kit'
import { describe, expect, it, vi } from 'vitest'
import { collectPaletteSources, resolvePaletteSources } from '../src'

interface Ctx { readonly user: string }
interface At { readonly x: number, readonly y: number }

function source(id: string, order?: number, insert = vi.fn()): DesignerPaletteSource<Ctx, At> {
  return {
    id,
    ...(order === undefined ? {} : { order }),
    groups: context => [{ id: `${id}.group`, label: `${id} of ${context.user}`, items: [{ id: `${id}.item`, label: 'Item', children: [{ id: `${id}.child`, label: 'Child' }] }] }],
    insert,
  }
}

describe('collectPaletteSources', () => {
  it('按 order 排，不写按 100，同值保持登记顺序', () => {
    const list = collectPaletteSources<Ctx, At>([
      { id: '@acme/a', paletteSources: [source('a.mine'), source('a.first', 150)] },
      { id: '@acme/b', paletteSources: [source('b.early', 100), source('b.top', 20)] },
      { id: '@acme/none' },
    ])
    expect(list.map(item => item.id)).toEqual(['b.top', 'a.mine', 'b.early', 'a.first'])
  })

  it('来源 id 重名时抛 DesignerExtensionError，名字空间 palette-source，报出两个扩展', () => {
    const error = (() => {
      try {
        collectPaletteSources<Ctx, At>([{ id: '@acme/a', paletteSources: [source('mine')] }, { id: '@acme/b', paletteSources: [source('mine')] }])
      }
      catch (caught) {
        return caught
      }
      return undefined
    })()
    expect(error).toBeInstanceOf(DesignerExtensionError)
    expect(error).toMatchObject({ space: 'palette-source', key: 'mine', extensions: ['@acme/a', '@acme/b'] })
  })
})

describe('resolvePaletteSources', () => {
  const builtin = [{ id: 'basic', label: 'Basic', items: [{ id: 'task', label: 'Task' }] }]

  it('内置分组在前，各来源按上下文现取的分组接在后面', () => {
    const view = resolvePaletteSources(builtin, [source('mine')], { user: 'Ann' })
    expect(view.groups.map(group => [group.id, group.label])).toEqual([['basic', 'Basic'], ['mine.group', 'mine of Ann']])
  })

  it('来源的条目与下级交给它的 insert（带上插入时的上下文与落点），内置条目返回 false', () => {
    const insert = vi.fn()
    const view = resolvePaletteSources(builtin, [source('mine', undefined, insert)], { user: 'Ann' })
    expect(view.insert('task', { user: 'Bob' })).toBe(false)
    expect(view.insert('missing', { user: 'Bob' })).toBe(false)
    expect(view.insert('mine.item', { user: 'Bob' })).toBe(true)
    expect(view.insert('mine.child', { user: 'Bob' }, { x: 10, y: 20 })).toBe(true)
    expect(insert.mock.calls).toEqual([
      [expect.objectContaining({ id: 'mine.item' }), { user: 'Bob' }, undefined],
      [expect.objectContaining({ id: 'mine.child' }), { user: 'Bob' }, { x: 10, y: 20 }],
    ])
  })

  it('组 id 或条目 id（含下级）重名时抛 TypeError', () => {
    const clash = (groups: DesignerPaletteSource<Ctx, At>['groups']): DesignerPaletteSource<Ctx, At> => ({ id: 'clash', groups, insert: () => {} })
    expect(() => resolvePaletteSources(builtin, [clash(() => [{ id: 'basic', label: 'x', items: [] }])], { user: 'Ann' })).toThrow(TypeError)
    expect(() => resolvePaletteSources(builtin, [clash(() => [{ id: 'g', label: 'x', items: [{ id: 'task', label: 'x' }] }])], { user: 'Ann' })).toThrow(/task/)
    expect(() => resolvePaletteSources(builtin, [clash(() => [{ id: 'g', label: 'x', items: [{ id: 'p', label: 'x', children: [{ id: 'task', label: 'x' }] }] }])], { user: 'Ann' })).toThrow(/clash/)
  })
})
