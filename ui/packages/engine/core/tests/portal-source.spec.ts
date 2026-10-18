// @vitest-environment jsdom
// Portal 外壳的逻辑来源：租约搬走的内容沿逻辑祖先链走到外壳时跳回来源，释放后照 DOM 走；
// 登记表挂在 Document 上，另一份 core 读到的是同一份登记。

import { afterEach, describe, expect, it, vi } from 'vitest'
import { createPortalLease } from '../src/kernel/structure/portal-lease'
import { bindPortalSource, logicallyContains, logicalParentElement } from '../src/kernel/structure/portal-source'
import { createPortalVisualBridge } from '../src/kernel/structure/portal-visual-bridge'

interface Fixture {
  readonly scope: HTMLElement
  readonly source: HTMLElement
  readonly root: HTMLElement
  readonly leaf: HTMLElement
  readonly target: HTMLElement
}

function fixture(): Fixture {
  const scope = document.createElement('section')
  const source = document.createElement('div')
  const root = document.createElement('div')
  const leaf = document.createElement('span')
  const target = document.createElement('aside')
  root.append(leaf)
  source.append(root)
  scope.append(source)
  document.body.append(scope, target)
  return { scope, source, root, leaf, target }
}

afterEach(() => {
  document.body.innerHTML = ''
  vi.resetModules()
})

describe('portal 外壳的逻辑来源', () => {
  it('租约期间外壳的逻辑父元素是来源，搬走的内容在逻辑上仍在来源所在的子树里', () => {
    const f = fixture()
    const lease = createPortalLease({ source: f.source, target: f.target, roots: [f.root] })

    expect(f.root.parentElement).toBe(lease.shell)
    expect(logicalParentElement(lease.shell)).toBe(f.source)
    expect(logicalParentElement(f.root)).toBe(lease.shell)
    expect(f.scope.contains(f.leaf)).toBe(false)
    expect(logicallyContains(f.scope, f.leaf)).toBe(true)
    expect(logicallyContains(f.source, f.leaf)).toBe(true)
    expect(logicallyContains(f.target, f.leaf)).toBe(true)

    lease.release()
    expect(logicalParentElement(lease.shell)).toBeNull()
    expect(f.scope.contains(f.leaf)).toBe(true)
    expect(logicallyContains(f.scope, f.leaf)).toBe(true)
  })

  it('没有登记的节点照 DOM 走：逻辑父元素就是 parentElement，与来源无关的子树不算包含', () => {
    const f = fixture()
    const other = document.createElement('div')
    document.body.append(other)
    const lease = createPortalLease({ source: f.source, target: f.target, roots: [f.root] })

    expect(logicalParentElement(f.leaf)).toBe(f.root)
    expect(logicalParentElement(document.documentElement)).toBeNull()
    expect(logicallyContains(other, f.leaf)).toBe(false)
    expect(logicallyContains(f.leaf, f.leaf)).toBe(true)
    lease.release()
  })

  it('外壳登记跟着视觉桥：桥释放就撤销，晚到的旧清理不撤销新来源', () => {
    const f = fixture()
    const shell = document.createElement('div')
    f.target.append(shell)
    const bridge = createPortalVisualBridge({ source: f.source, shell })
    expect(logicalParentElement(shell)).toBe(f.source)
    bridge.dispose()
    expect(logicalParentElement(shell)).toBe(f.target)

    const first = bindPortalSource(shell, f.source)
    bindPortalSource(shell, f.scope)
    first()
    expect(logicalParentElement(shell)).toBe(f.scope)
  })

  it('另一份 core 读到同一份登记', async () => {
    const f = fixture()
    const lease = createPortalLease({ source: f.source, target: f.target, roots: [f.root] })
    vi.resetModules()
    const other = await import('../src/kernel/structure/portal-source')

    expect(other.logicalParentElement).not.toBe(logicalParentElement)
    expect(other.logicalParentElement(lease.shell)).toBe(f.source)
    expect(other.logicallyContains(f.scope, f.leaf)).toBe(true)
    lease.release()
    expect(other.logicalParentElement(lease.shell)).toBeNull()
  })
})
