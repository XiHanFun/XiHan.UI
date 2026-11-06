import type { Layer, LayerRegistry } from '../src/kernel'
import { describe, expect, it, vi } from 'vitest'
import { isInside, shouldDismiss } from '../src/behavior'

let layerSeq = 0
function fakeLayer(node: object, branches: object[] = [], surfaces: object[] = []): Layer {
  return {
    id: `l-${++layerSeq}`,
    kind: 'modal',
    node: () => node as HTMLElement,
    branches: () => branches as Element[],
    isModal: () => true,
    surfaces: () => surfaces as Element[],
  }
}

function fakeEvent(path: object[]): Event {
  return { composedPath: () => path } as unknown as Event
}

function fakeRegistry(layers: Layer[]): Pick<LayerRegistry, 'list'> {
  return { list: () => layers }
}

describe('isInside', () => {
  const node = { tag: 'content' }
  const branch = { tag: 'branch' }
  const surface = { tag: 'backdrop' }
  const layer = fakeLayer(node, [branch], [surface])

  it('命中层节点 → inside', () => {
    expect(isInside(fakeEvent([node]), layer)).toEqual({ inside: true, onSurface: false })
  })
  it('命中 branch → inside', () => {
    expect(isInside(fakeEvent([branch]), layer)).toEqual({ inside: true, onSurface: false })
  })
  it('命中 surface → onSurface', () => {
    expect(isInside(fakeEvent([surface]), layer)).toEqual({ inside: false, onSurface: true })
  })
  it('全不命中 → 外部', () => {
    expect(isInside(fakeEvent([{ x: 1 }]), layer)).toEqual({ inside: false, onSurface: false })
  })

  it('命中层节点后不读取 branch 与 surface getter', () => {
    const branches = vi.fn((): Element[] => {
      throw new Error('不应读取 branch')
    })
    const surfaces = vi.fn((): Element[] => {
      throw new Error('不应读取 surface')
    })
    const direct: Layer = {
      ...fakeLayer(node),
      branches,
      surfaces,
    }

    expect(isInside(fakeEvent([node]), direct)).toEqual({ inside: true, onSurface: false })
    expect(branches).not.toHaveBeenCalled()
    expect(surfaces).not.toHaveBeenCalled()
  })

  it('命中 branch 后不读取 surface getter', () => {
    const surfaces = vi.fn((): Element[] => {
      throw new Error('不应读取 surface')
    })
    const direct: Layer = {
      ...fakeLayer(node, [branch]),
      surfaces,
    }

    expect(isInside(fakeEvent([branch]), direct)).toEqual({ inside: true, onSurface: false })
    expect(surfaces).not.toHaveBeenCalled()
  })
})

describe('shouldDismiss（栈内仲裁）', () => {
  const inner = { tag: 'inner' }
  const outer = { tag: 'outer' }
  const layerOuter = fakeLayer(outer)
  const layerInner = fakeLayer(inner)
  const registry = fakeRegistry([layerOuter, layerInner]) // 索引即层级，inner 在上

  it('点最内层内部 → 都不消解', () => {
    const e = fakeEvent([inner])
    expect(shouldDismiss(e, registry, layerInner)).toBe(false)
    expect(shouldDismiss(e, registry, layerOuter)).toBe(false)
  })
  it('点最外层外部 → 两层都消解', () => {
    const e = fakeEvent([{ x: 1 }])
    expect(shouldDismiss(e, registry, layerInner)).toBe(true)
    expect(shouldDismiss(e, registry, layerOuter)).toBe(true)
  })
  it('点外层内部 → 只消解内层', () => {
    const e = fakeEvent([outer])
    expect(shouldDismiss(e, registry, layerInner)).toBe(true)
    expect(shouldDismiss(e, registry, layerOuter)).toBe(false)
  })
})

/** 带 contains 的假节点：children 是装在它里面的节点。 */
function fakeNode(tag: string, children: object[] = []): object {
  const node = { tag, contains: (target: object): boolean => target === node || children.includes(target) }
  return node
}

describe('shouldDismiss（内联层）', () => {
  function inlineLayer(node: object, branches: object[] = []): Layer {
    return { ...fakeLayer(node, branches), kind: 'inline', isModal: () => false }
  }

  it('命中内联层：与它无关的更低的层照常消解，它自己不消解', () => {
    const trigger = fakeNode('trigger')
    const lower = fakeLayer(fakeNode('lower'))
    const hint = inlineLayer(fakeNode('hint'), [trigger])
    const registry = fakeRegistry([lower, hint])

    const e = fakeEvent([trigger])
    expect(shouldDismiss(e, registry, hint)).toBe(false)
    expect(shouldDismiss(e, registry, lower)).toBe(true)
  })

  it('命中内联层：它开在其内容里的层受保护，再往下的层也不消解', () => {
    const trigger = fakeNode('trigger')
    const hintNode = fakeNode('hint')
    const bottom = fakeLayer(fakeNode('bottom'))
    const parent = fakeLayer(fakeNode('parent', [trigger]))
    const hint = inlineLayer(hintNode, [trigger])
    const registry = fakeRegistry([bottom, parent, hint])

    // 内联层的根节点不在 parent 里，事件路径只经过它自己
    const e = fakeEvent([hintNode])
    expect(shouldDismiss(e, registry, parent)).toBe(false)
    expect(shouldDismiss(e, registry, bottom)).toBe(false)
  })

  it('内联层在层外时与其余层一样消解', () => {
    const lower = fakeLayer(fakeNode('lower'))
    const hint = inlineLayer(fakeNode('hint'))
    const registry = fakeRegistry([lower, hint])

    const e = fakeEvent([{ x: 1 }])
    expect(shouldDismiss(e, registry, hint)).toBe(true)
    expect(shouldDismiss(e, registry, lower)).toBe(true)
  })
})

describe('shouldDismiss（悬停就出现的 popover 层）', () => {
  function popoverLayer(node: object, branches: object[] = [], opensOnHover?: boolean): Layer {
    return { ...fakeLayer(node, branches), kind: 'popover', isModal: () => false, opensOnHover }
  }

  it('登记了 opensOnHover：命中它时与它无关的更低的层照常消解，它自己不消解', () => {
    const trigger = fakeNode('trigger')
    const lower = fakeLayer(fakeNode('lower'))
    const card = popoverLayer(fakeNode('card'), [trigger], true)
    const registry = fakeRegistry([lower, card])

    const e = fakeEvent([trigger])
    expect(shouldDismiss(e, registry, card)).toBe(false)
    expect(shouldDismiss(e, registry, lower)).toBe(true)
  })

  it('登记了 opensOnHover：命中它时它开在其内容里的层受保护，再往下的层也不消解', () => {
    const trigger = fakeNode('trigger')
    const cardNode = fakeNode('card')
    const bottom = fakeLayer(fakeNode('bottom'))
    const parent = fakeLayer(fakeNode('parent', [trigger]))
    const card = popoverLayer(cardNode, [trigger], true)
    const registry = fakeRegistry([bottom, parent, card])

    const e = fakeEvent([cardNode])
    expect(shouldDismiss(e, registry, parent)).toBe(false)
    expect(shouldDismiss(e, registry, bottom)).toBe(false)
  })

  it('没登记的 popover 层照旧按栈序挡住下面每一层', () => {
    const trigger = fakeNode('trigger')
    const lower = fakeLayer(fakeNode('lower'))
    const menu = popoverLayer(fakeNode('menu'), [trigger])
    const registry = fakeRegistry([lower, menu])

    const e = fakeEvent([trigger])
    expect(shouldDismiss(e, registry, menu)).toBe(false)
    expect(shouldDismiss(e, registry, lower)).toBe(false)
  })

  it('内联层显式写 false：不再按 kind 取，按栈序挡住下面每一层', () => {
    const trigger = fakeNode('trigger')
    const lower = fakeLayer(fakeNode('lower'))
    const panel: Layer = { ...popoverLayer(fakeNode('panel'), [trigger], false), kind: 'inline' }
    const registry = fakeRegistry([lower, panel])

    expect(shouldDismiss(fakeEvent([trigger]), registry, lower)).toBe(false)
  })
})
