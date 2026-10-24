// @vitest-environment jsdom
//
import type { TreeApi, TreeNode, TreeSchema } from '../src/tree'
import { createService, normalizeProps } from '@xihan-ui/core'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { connectTree, treeMachine } from '../src/tree'

// 懒分支：取数核心与树选择共用（shared/lazy-branch），这里核树这一侧的接线——
// 有效树、展开即取、收起即中止、重试、受控展开与 collection 换代，以及四种反馈部件的收放。

type Props = TreeSchema['props']

interface Harness {
  api: () => TreeApi
  setProps: (next: Partial<Props>) => void
  stop: () => void
}

const runtimes: { stop: () => void }[] = []

function mount(initial: Partial<Props>): Harness {
  const runtime = createVanillaRuntime()
  const props = runtime.signal<Partial<Props>>(initial)
  const service = createService(treeMachine, { props: () => props.get(), runtime })
  runtime.start()
  runtimes.push(runtime)
  return {
    api: () => connectTree(service, normalizeProps),
    setProps: next => props.set({ ...props.get(), ...next }),
    stop: () => runtime.stop(),
  }
}

/** flush 在 vanilla 运行时是一枚微任务，请求兑现再走几枚。 */
function tick(): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, 0))
}

function deferred<T>(): { promise: Promise<T>, resolve: (value: T) => void, reject: (error: unknown) => void } {
  let resolve!: (value: T) => void
  let reject!: (error: unknown) => void
  const promise = new Promise<T>((done, fail) => {
    resolve = done
    reject = fail
  })
  return { promise, resolve, reject }
}

const attrs = (props: unknown): Record<string, unknown> => props as Record<string, unknown>

afterEach(() => {
  for (const runtime of runtimes.splice(0))
    runtime.stop()
})

describe('tree 懒分支', () => {
  it('没取回之前是空子层的分支；展开即取，取回的子项进有效树与可见行，不写回作者的 collection', async () => {
    const collection: TreeNode[] = [{ value: 'dept', label: '研发', hasChildren: true }, { value: 'board', label: '董事办' }]
    const onBranchLoadStart = vi.fn()
    const onBranchLoad = vi.fn()
    const loadChildren = vi.fn(async (_request: { node: TreeNode }) => [{ value: 'dept-1', label: '赵一' }])
    const h = mount({ collection, loadChildren, onBranchLoadStart, onBranchLoad })

    expect(h.api().visibleNodes.map(node => [node.value, node.branch])).toEqual([['dept', true], ['board', false]])
    expect(h.api().branchLoadState('dept')).toEqual({ status: 'idle' })
    expect(h.api().branchLoadState('board')).toBeNull()

    h.api().expand('dept')
    expect(h.api().branchLoadState('dept')).toEqual({ status: 'loading' })
    expect(attrs(h.api().getBranchProps({ value: 'dept' }))['aria-busy']).toBe('true')
    expect(attrs(h.api().getBranchLoadingProps({ value: 'dept' })).hidden).toBeUndefined()
    await tick()

    expect(loadChildren).toHaveBeenCalledTimes(1)
    expect(loadChildren.mock.calls[0]![0]).toMatchObject({ node: collection[0] })
    expect(onBranchLoadStart).toHaveBeenCalledWith(expect.objectContaining({ value: 'dept', reason: 'expand' }))
    expect(onBranchLoad).toHaveBeenCalledWith(expect.objectContaining({ value: 'dept', children: [{ value: 'dept-1', label: '赵一' }] }))
    expect(h.api().branchLoadState('dept')).toEqual({ status: 'loaded', empty: false })
    expect(h.api().visibleNodes.map(node => node.value)).toEqual(['dept', 'dept-1', 'board'])
    expect(attrs(h.api().getBranchProps({ value: 'dept' }))['aria-busy']).toBeUndefined()
    expect(attrs(h.api().getBranchLoadingProps({ value: 'dept' })).hidden).toBe(true)
    expect(collection[0]!.children).toBeUndefined()
  })

  it('收起再展开不重复请求；取回空数组是成功，露出空结果而不是失败', async () => {
    const loadChildren = vi.fn(async () => [])
    const h = mount({ collection: [{ value: 'dept', hasChildren: true }], loadChildren })

    h.api().expand('dept')
    await tick()
    h.api().collapse('dept')
    h.api().expand('dept')
    await tick()

    expect(loadChildren).toHaveBeenCalledTimes(1)
    expect(h.api().branchLoadState('dept')).toEqual({ status: 'loaded', empty: true })
    expect(attrs(h.api().getBranchEmptyProps({ value: 'dept' })).hidden).toBeUndefined()
    expect(attrs(h.api().getBranchErrorProps({ value: 'dept' })).hidden).toBe(true)
    expect(attrs(h.api().getBranchProps({ value: 'dept' }))['data-empty']).toBe('')
  })

  it('收起中止在途的一轮，晚到的结果不写回；再展开重新取', async () => {
    const first = deferred<TreeNode[]>()
    const signals: AbortSignal[] = []
    const loadChildren = vi.fn()
      .mockImplementationOnce(({ signal }: { signal: AbortSignal }) => {
        signals.push(signal)
        return first.promise
      })
      .mockImplementationOnce(async () => [{ value: 'fresh' }])
    const h = mount({ collection: [{ value: 'dept', hasChildren: true }], loadChildren })

    h.api().expand('dept')
    await tick()
    h.api().collapse('dept')
    expect(signals[0]!.aborted).toBe(true)
    expect(h.api().branchLoadState('dept')).toEqual({ status: 'idle' })
    first.resolve([{ value: 'stale' }])
    await tick()
    expect(h.api().collection[0]!.children).toEqual([])

    h.api().expand('dept')
    await tick()
    expect(loadChildren).toHaveBeenCalledTimes(2)
    expect(h.api().collection[0]!.children!.map(node => node.value)).toEqual(['fresh'])
  })

  it('失败保留原始 error、露出失败说明与重试钮；再次展开不自动重试，显式重试才再发', async () => {
    const loadChildren = vi.fn()
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValueOnce([{ value: 'ok' }])
    const onBranchLoadError = vi.fn()
    const h = mount({ collection: [{ value: 'dept', hasChildren: true }], loadChildren, onBranchLoadError })

    h.api().expand('dept')
    await tick()
    expect(h.api().branchLoadState('dept')?.status).toBe('error')
    expect(onBranchLoadError).toHaveBeenCalledWith(expect.objectContaining({ value: 'dept', error: expect.objectContaining({ message: 'offline' }) }))
    expect(attrs(h.api().getBranchErrorProps({ value: 'dept' })).hidden).toBeUndefined()
    const retry = attrs(h.api().getBranchRetryTriggerProps({ value: 'dept' }))
    expect(retry.hidden).toBeUndefined()
    expect(retry['aria-label']).toBe('Retry')
    expect(retry.tabindex).toBe(-1)

    h.api().collapse('dept')
    h.api().expand('dept')
    await tick()
    expect(loadChildren).toHaveBeenCalledTimes(1)

    h.api().retryBranch('dept')
    await tick()
    expect(loadChildren).toHaveBeenCalledTimes(2)
    expect(onBranchLoadError).toHaveBeenCalledTimes(1)
    expect(h.api().branchLoadState('dept')).toEqual({ status: 'loaded', empty: false })
  })

  it('没给 loadChildren 的懒分支展开即落到失败态并回调，不静默', async () => {
    const onBranchLoadError = vi.fn()
    const h = mount({ collection: [{ value: 'dept', hasChildren: true }], onBranchLoadError })

    h.api().expand('dept')
    await tick()
    expect(h.api().branchLoadState('dept')?.status).toBe('error')
    expect(onBranchLoadError).toHaveBeenCalledWith(expect.objectContaining({
      value: 'dept',
      error: expect.objectContaining({ message: 'Tree lazy branch "dept" requires loadChildren' }),
    }))
  })

  it('初始就展开的懒分支在挂载后取数；受控 expandedValue 写入的展开同样会取', async () => {
    const loadChildren = vi.fn(async ({ node }: { node: TreeNode }) => [{ value: `${node.value}-1` }])
    const h = mount({
      collection: [{ value: 'a', hasChildren: true }, { value: 'b', hasChildren: true }],
      defaultExpandedValue: ['a'],
      loadChildren,
    })
    await tick()
    expect(loadChildren).toHaveBeenCalledTimes(1)
    expect(h.api().visibleNodes.map(node => node.value)).toEqual(['a', 'a-1', 'b'])

    const controlled = mount({ collection: [{ value: 'c', hasChildren: true }], expandedValue: [], loadChildren })
    controlled.setProps({ expandedValue: ['c'] })
    await tick()
    expect(controlled.api().visibleNodes.map(node => node.value)).toEqual(['c', 'c-1'])
  })

  it('collection 换掉这个分支的节点对象时，在途请求中止、取回的结果作废', async () => {
    const pending = deferred<TreeNode[]>()
    const signals: AbortSignal[] = []
    const loadChildren = vi.fn(({ signal }: { signal: AbortSignal }) => {
      signals.push(signal)
      return pending.promise
    })
    const h = mount({ collection: [{ value: 'dept', hasChildren: true }], loadChildren })

    h.api().expand('dept')
    await tick()
    h.setProps({ collection: [{ value: 'other', label: 'Other' }] })
    await tick()
    expect(signals[0]!.aborted).toBe(true)
    pending.resolve([{ value: 'late' }])
    await tick()
    expect(h.api().visibleNodes.map(node => node.value)).toEqual(['other'])
  })

  it('取数失败的分支上，确认键是重试而不是选中', async () => {
    const loadChildren = vi.fn().mockRejectedValueOnce(new Error('offline')).mockResolvedValueOnce([])
    const h = mount({ collection: [{ value: 'dept', hasChildren: true }], loadChildren })
    h.api().expand('dept')
    await tick()

    const tree = document.createElement('div')
    const branch = document.createElement('div')
    tree.append(branch)
    document.body.append(tree)
    const write = (el: HTMLElement, props: Record<string, unknown>): void => {
      for (const [key, value] of Object.entries(props)) {
        if (typeof value !== 'function' && value != null && typeof value !== 'object')
          el.setAttribute(key, String(value))
      }
    }
    write(tree, attrs(h.api().getTreeProps()))
    write(branch, attrs(h.api().getBranchProps({ value: 'dept' })))
    // 处理器按 context 里的焦点值找行：先走一遍分支的 onFocus，再取那之后的键盘处理器
    ;(attrs(h.api().getBranchProps({ value: 'dept' })).onFocus as () => void)()
    const onKeyDown = attrs(h.api().getTreeProps()).onKeyDown as ((event: KeyboardEvent) => void) | undefined
    tree.addEventListener('keydown', event => onKeyDown?.(event))
    branch.focus()
    branch.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }))
    await tick()

    expect(loadChildren).toHaveBeenCalledTimes(2)
    expect(h.api().selection).toEqual([])
    tree.remove()
  })

  it('卸载中止所有在途请求', async () => {
    const signals: AbortSignal[] = []
    const loadChildren = vi.fn(({ signal }: { signal: AbortSignal }) => {
      signals.push(signal)
      return new Promise<TreeNode[]>(() => {})
    })
    const h = mount({ collection: [{ value: 'dept', hasChildren: true }], loadChildren })
    h.api().expand('dept')
    await tick()
    h.stop()
    expect(signals[0]!.aborted).toBe(true)
  })
})
