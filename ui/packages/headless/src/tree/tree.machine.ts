import type { TreeNode, TreeNodeMeta, TreeSchema, TreeSelectionMode, TreeVisibleNode } from './tree.types'
import { createTypeahead } from '@xihan-ui/behavior'
import { setup } from '@xihan-ui/machine'

const { createMachine } = setup<TreeSchema>()

/** 生效的选择模式。 */
export function treeSelectionMode(mode: TreeSelectionMode | undefined): TreeSelectionMode {
  return mode ?? 'single'
}

/**
 * 深度优先走一遍 collection，按 shouldDescend 决定要不要下潜。
 *
 * 环路防护取「祖先链」而不是「见过的全部值」：同一个值出现在两条不相干的分支里
 * 只是作者写错了 value（两行都照样摊出来，各自算各自的层级），
 * 而一个节点出现在自己的祖先链上才是真环，再下潜就是无限递归。
 */
function collectNodes(
  collection: readonly TreeNode[],
  shouldDescend: (value: string) => boolean,
): TreeNodeMeta[] {
  const out: TreeNodeMeta[] = []

  const walk = (
    nodes: readonly TreeNode[],
    level: number,
    parent: string | null,
    indexPath: readonly number[],
    ancestors: ReadonlySet<string>,
  ): void => {
    const setSize = nodes.length
    nodes.forEach((node, i) => {
      // children 给了数组即为分支，空数组也算：那是「暂时没有子项的目录」，仍要报 aria-expanded
      const branch = Array.isArray(node.children)
      const path = [...indexPath, i]
      out.push({
        value: node.value,
        label: node.label ?? node.value,
        disabled: !!node.disabled,
        branch,
        level,
        posInSet: i + 1,
        setSize,
        parent,
        indexPath: path,
      })
      if (!branch || ancestors.has(node.value) || !shouldDescend(node.value))
        return
      walk(node.children!, level + 1, node.value, path, new Set([...ancestors, node.value]))
    })
  }

  walk(collection, 1, null, [], new Set())
  return out
}

/**
 * 把树摊平成**可见行序列**：只有展开的分支才把子节点算进去，收起分支的整棵子树一行不出。
 *
 * 这是树的核心：方向键、Home/End、连打检索、'*' 展开同级，全部在这个序列上走，
 * 而不是在原始树上走。收起分支的子节点仍留在 DOM 里（内容常挂 + hidden，不卸载作者节点），
 * 光靠查 DOM 是分不清可见与否的。
 */
export function flattenTree(
  collection: readonly TreeNode[],
  expandedValue: readonly string[],
): TreeVisibleNode[] {
  const expanded = new Set(expandedValue)
  return collectNodes(collection, value => expanded.has(value))
    .map(meta => ({ ...meta, expanded: meta.branch && expanded.has(meta.value) }))
}

/**
 * 全树索引：值 → 层级元信息，收起分支里的节点也在其中。
 *
 * 与摊平分开是必需的——收起分支的子节点仍要渲染（只是 hidden），
 * 连接层照样得给它们产出 aria-level / aria-posinset 这些属性。
 * value 重复时以先出现的为准，保证「按值取元信息」是确定的。
 */
export function indexTree(collection: readonly TreeNode[]): Map<string, TreeNodeMeta> {
  const out = new Map<string, TreeNodeMeta>()
  for (const meta of collectNodes(collection, () => true)) {
    if (!out.has(meta.value))
      out.set(meta.value, meta)
  }
  return out
}

/** 去重且保序：展开集合是一个集合，重复元素没有意义。 */
function unique(values: readonly string[]): string[] {
  return [...new Set(values)]
}

/** 选中集合的不变量：单选恒为长度 ≤ 1，复选去重。公开 API 与内部写入都经这里收口。 */
function normalizeSelection(next: readonly string[], mode: TreeSelectionMode): string[] {
  return mode === 'single' ? next.slice(0, 1) : unique(next)
}

/**
 * 数组按元素比。默认的 Object.is 在这里不成立：受控时 cell 每次读都要把 prop 归一成
 * 新数组，引用恒不相等——版本号会每读一次自增一次（track 空转），
 * 写入时又会把「值其实没变」判成变了，回调便会重复发。
 */
function sameValues(a: string[], b: string[] | undefined): boolean {
  return !!b && a.length === b.length && a.every((v, i) => v === b[i])
}

// 展开集合与选中集合都住在 context 的 cell 里，不编码进 FSM 状态：cell 本身就是受控/非受控的
// 收口点（prop 给定即受控，读直取 prop、写只发回调不落内部值），因此不需要影子事件与受控守卫。
// 机器只有一个状态，逻辑全在 context + actions。
export const treeMachine = createMachine({
  name: 'tree',
  context: ({ prop, cell }) => ({
    expandedValue: cell<string[]>(() => ({
      value: prop('expandedValue'),
      defaultValue: prop('defaultExpandedValue') ?? [],
      isEqual: sameValues,
      onChange: value => prop('onExpandedChange')?.({ value }),
    })),
    selectedValue: cell<string[]>(() => ({
      value: prop('selectedValue'),
      defaultValue: prop('defaultSelectedValue') ?? [],
      isEqual: sameValues,
      onChange: value => prop('onSelectionChange')?.({ value }),
    })),
    // 焦点锚点不受控、不对外通知：它只服务 roving tabindex 与方向键起点
    focusedValue: cell<string | null>(() => ({ defaultValue: null })),
  }),
  refs: () => ({
    typeahead: createTypeahead(),
  }),
  initialState: () => 'idle',
  states: {
    idle: {
      // 省略 target：只跑 actions，不换状态
      on: {
        'EXPANDED.SET': { actions: ['setExpanded'] },
        'BRANCH.EXPAND': { actions: ['expandBranch'] },
        'BRANCH.COLLAPSE': { actions: ['collapseBranch'] },
        'BRANCH.TOGGLE': { actions: ['toggleBranch'] },
        'SELECTED.SET': { actions: ['setSelected'] },
        'NODE.SELECT': { actions: ['selectNode'] },
        'NODE.FOCUS': { actions: ['setFocusedValue'] },
        'TREE.BLUR': { actions: ['clearFocusedValue'] },
      },
    },
  },
  implementations: {
    actions: {
      setExpanded: ({ context, event }) => {
        const e = event.current()
        if (e.type !== 'EXPANDED.SET')
          return
        context.set('expandedValue', unique(e.value))
      },
      expandBranch: ({ context, event }) => {
        const e = event.current()
        if (e.type !== 'BRANCH.EXPAND')
          return
        const current = context.get('expandedValue')
        if (current.includes(e.value))
          return
        context.set('expandedValue', [...current, e.value])
      },
      collapseBranch: ({ context, event }) => {
        const e = event.current()
        if (e.type !== 'BRANCH.COLLAPSE')
          return
        context.set('expandedValue', context.get('expandedValue').filter(v => v !== e.value))
      },
      toggleBranch: ({ context, event }) => {
        const e = event.current()
        if (e.type !== 'BRANCH.TOGGLE')
          return
        const current = context.get('expandedValue')
        context.set(
          'expandedValue',
          current.includes(e.value) ? current.filter(v => v !== e.value) : [...current, e.value],
        )
      },
      setSelected: ({ context, prop, event }) => {
        const e = event.current()
        if (e.type !== 'SELECTED.SET')
          return
        context.set('selectedValue', normalizeSelection(e.value, treeSelectionMode(prop('selectionMode'))))
      },
      selectNode: ({ context, prop, event }) => {
        const e = event.current()
        if (e.type !== 'NODE.SELECT')
          return
        const current = context.get('selectedValue')
        // 单选没有「取消选中」这回事：点两下就把树点空了不是任何人期望的
        if (treeSelectionMode(prop('selectionMode')) === 'single') {
          context.set('selectedValue', [e.value])
          return
        }
        context.set(
          'selectedValue',
          current.includes(e.value) ? current.filter(v => v !== e.value) : [...current, e.value],
        )
      },
      setFocusedValue: ({ context, event }) => {
        const e = event.current()
        if (e.type === 'NODE.FOCUS')
          context.set('focusedValue', e.value)
      },
      // 焦点离场只清焦点锚点，展开与选中留着：下次焦点回来还要从选中值起步
      clearFocusedValue: ({ context, refs }) => {
        context.set('focusedValue', null)
        // 焦点走了缓冲也得丢：否则下次进来第一个字母会被拼进上一轮的查询串
        refs.get('typeahead').clear()
      },
    },
  },
})
