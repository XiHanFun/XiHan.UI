import type { Layer, LayerRegistry } from '@xihan-ui/core'
import { describe, expect, it } from 'vitest'
import { isInside, shouldDismiss } from '../src'

let layerSeq = 0
function fakeLayer(node: object, branches: object[] = [], surfaces: object[] = []): Layer {
  return {
    id: `l-${++layerSeq}`,
    kind: 'modal',
    node: () => node as HTMLElement,
    branches: () => branches as Element[],
    isModal: () => true,
    setModal: () => {},
    surfaces: () => surfaces as Element[],
  }
}

function fakeEvent(path: object[]): Event {
  return { composedPath: () => path } as unknown as Event
}

function fakeRegistry(layers: Layer[]): LayerRegistry {
  return { list: () => layers } as LayerRegistry
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
