// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from 'vitest'
import { createPortalLease } from '../src/kernel/structure/portal-lease'

interface Fixture {
  readonly source: HTMLElement
  readonly target: HTMLElement
  readonly firstParent: HTMLElement
  readonly secondParent: HTMLElement
  readonly firstBefore: HTMLElement
  readonly secondBefore: HTMLElement
  readonly first: HTMLElement
  readonly second: HTMLElement
}

function fixture(): Fixture {
  const stage = document.createElement('section')
  const source = document.createElement('button')
  source.dataset.theme = 'dark'
  const firstParent = document.createElement('div')
  const secondParent = document.createElement('div')
  const firstBefore = document.createElement('i')
  const secondBefore = document.createElement('i')
  const first = document.createElement('div')
  const second = document.createElement('div')
  const target = document.createElement('aside')
  firstParent.append(firstBefore, first)
  secondParent.append(secondBefore, second)
  stage.append(source, firstParent, secondParent)
  document.body.append(stage, target)
  return { source, target, firstParent, secondParent, firstBefore, secondBefore, first, second }
}

function placeholder(doc: Document = document): Comment | undefined {
  const walker = doc.createTreeWalker(doc, NodeFilter.SHOW_COMMENT)
  while (walker.nextNode()) {
    const node = walker.currentNode as Comment
    if (node.data === 'xh-portal-root')
      return node
  }
  return undefined
}

afterEach(() => {
  document.body.innerHTML = ''
})

describe('portal 租约', () => {
  it('把多个 roots 搬到同 Document 独占壳，并按各自占位精确归位', () => {
    const f = fixture()
    const afterRestore = vi.fn(() => {
      expect(f.first.parentNode).toBe(f.firstParent)
      expect(f.first.previousSibling).toBe(f.firstBefore)
      expect(f.second.parentNode).toBe(f.secondParent)
      expect(f.second.previousSibling).toBe(f.secondBefore)
    })
    const lease = createPortalLease({
      source: f.source,
      target: f.target,
      roots: [f.first, f.second],
      onShellReady: (shell) => {
        expect(shell.parentNode).toBe(f.target)
        expect(shell.dataset.xhPortalShell).toBe('')
        expect(shell.style.display).toBe('contents')
        expect(shell.getAttribute('data-theme')).toBe('dark')
        return afterRestore
      },
    })

    expect(lease.roots).toEqual([f.first, f.second])
    expect(f.first.parentNode).toBe(lease.shell)
    expect(f.second.parentNode).toBe(lease.shell)
    expect(f.firstParent.contains(f.first)).toBe(false)
    expect(f.secondParent.contains(f.second)).toBe(false)

    lease.release()
    lease.release()
    expect(afterRestore).toHaveBeenCalledTimes(1)
    expect(f.first.parentNode).toBe(f.firstParent)
    expect(f.first.previousSibling).toBe(f.firstBefore)
    expect(f.second.parentNode).toBe(f.secondParent)
    expect(f.second.previousSibling).toBe(f.secondBefore)
    expect(lease.shell.isConnected).toBe(false)
  })

  it('拒绝跨 Document 目标，初始化前不改变作者 roots', () => {
    const f = fixture()
    const other = document.implementation.createHTMLDocument('other')
    const target = other.createElement('aside')
    other.body.append(target)

    expect(() => createPortalLease({ source: f.source, target, roots: [f.first] }))
      .toThrow('[xh] Portal 租约的来源与目标必须属于同一 Document')
    expect(f.first.parentNode).toBe(f.firstParent)
    expect(f.first.previousSibling).toBe(f.firstBefore)
  })

  it('初始化中第二个 root 搬迁失败时，回滚全部 roots 与壳特有清理，并聚合清理异常', () => {
    const f = fixture()
    const primary = new Error('第二根移动失败')
    const cleanupError = new Error('壳所有权撤销失败')
    const onShellCleanup = vi.fn(() => {
      throw cleanupError
    })
    let caught: unknown

    try {
      createPortalLease({
        source: f.source,
        target: f.target,
        roots: [f.first, f.second],
        onShellReady: (shell) => {
          const appendChild = shell.appendChild.bind(shell)
          let count = 0
          vi.spyOn(shell, 'appendChild').mockImplementation(<T extends Node>(node: T): T => {
            count += 1
            if (count === 2)
              throw primary
            return appendChild(node) as T
          })
          return onShellCleanup
        },
      })
    }
    catch (error) {
      caught = error
    }

    expect(caught).toBeInstanceOf(AggregateError)
    expect((caught as AggregateError).errors).toEqual([primary, cleanupError])
    expect(onShellCleanup).toHaveBeenCalledTimes(1)
    expect(f.first.parentNode).toBe(f.firstParent)
    expect(f.first.previousSibling).toBe(f.firstBefore)
    expect(f.second.parentNode).toBe(f.secondParent)
    expect(f.second.previousSibling).toBe(f.secondBefore)
    expect(f.target.querySelector('[data-xh-portal-shell]')).toBeNull()
  })

  it('释放仍会完成全部阶段、聚合异常，并在失败后保持幂等', () => {
    const f = fixture()
    const cleanupError = new Error('适配器所有权撤销失败')
    const onShellCleanup = vi.fn(() => {
      throw cleanupError
    })
    const lease = createPortalLease({
      source: f.source,
      target: f.target,
      roots: [f.first],
      onShellReady: () => onShellCleanup,
    })
    placeholder()!.remove()

    let caught: unknown
    try {
      lease.release()
    }
    catch (error) {
      caught = error
    }

    expect(caught).toBeInstanceOf(AggregateError)
    const errors = (caught as AggregateError).errors as unknown[]
    expect(errors[0]).toBeInstanceOf(Error)
    expect((errors[0] as Error).message).toContain('占位节点已被移除')
    expect(errors[1]).toBe(cleanupError)
    expect(lease.shell.isConnected).toBe(false)
    expect(onShellCleanup).toHaveBeenCalledTimes(1)
    expect(() => lease.release()).not.toThrow()
    expect(onShellCleanup).toHaveBeenCalledTimes(1)
  })
})
