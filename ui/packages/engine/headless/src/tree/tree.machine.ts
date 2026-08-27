import type { TreeNode, TreeNodeMeta, TreeSchema, TreeSelectionMode, TreeVisibleNode } from './tree.types'
import { applySelection, cascadeToggle, collapseChecked, createTypeahead } from '@xihan-ui/behavior'
import { setup } from '@xihan-ui/machine'

const { createMachine } = setup<TreeSchema>()

/**
 * 生效的选择模式。
 *
 * 两个来源：新的 `multiple` 布尔与旧的 `selectionMode` 枚举。两者同时给时以 selectionMode
 * 为准——与 listbox 同一条规矩，也让过渡期里旧代码的行为一点不变。
 */
export function treeSelectionMode(mode: TreeSelectionMode | undefined, multiple?: boolean): TreeSelectionMode {
  return mode ?? (multiple ? 'multiple' : 'single')
}

/**
 * 深度优先走一遍 collection，按 shouldDescend 决定要不要下潜。
 * 环路防护取祖先链而不是见过的全部值：一个节点出现在自己的祖先链上才是真环，
 * 同一个值出现在两条不相干的分支里只是作者写错了 value。
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
      // children 给了数组即为分支，空数组也算，仍要报 aria-expanded
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
 * 把树摊平成可见行序列：只有展开的分支才把子节点算进去，收起分支的整棵子树一行不出。
 * 方向键、Home/End、连打检索、'*' 展开同级全部在这个序列上走，而不是在原始树上走；
 * 收起分支的子节点仍留在 DOM 里（只是 hidden），查 DOM 分不清可见与否。
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
 * 与摊平分开：收起分支的子节点仍要渲染，连接层照样得给它们产出 aria-level 这些属性。
 * value 重复时以先出现的为准。
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

/** 数组按元素比：受控时 cell 每次读都产出新数组，默认的 Object.is 恒不相等。 */
function sameValues(a: string[], b: string[] | undefined): boolean {
  return !!b && a.length === b.length && a.every((v, i) => v === b[i])
}

// 展开集合与选中集合都住在 context 的 cell 里，受控/非受控在 cell 收口，
// 不需要影子事件与受控守卫。
export const treeMachine = createMachine({
  name: 'tree',
  context: ({ prop, cell }) => ({
    expandedValue: cell<string[]>(() => ({
      value: prop('expandedValue'),
      defaultValue: prop('defaultExpandedValue') ?? [],
      isEqual: sameValues,
      onChange: value => prop('onExpandedChange')?.({ value }),
    })),
    selection: cell<string[]>(() => ({
      value: prop('selection'),
      defaultValue: prop('defaultSelection') ?? [],
      isEqual: sameValues,
      onChange: value => prop('onSelectionChange')?.({ value }),
    })),
    // 焦点锚点不受控、不对外通知：它只服务 roving tabindex 与方向键起点
    focusedValue: cell<string | null>(() => ({ defaultValue: null })),
    selectionAnchor: cell<string | null>(() => ({ defaultValue: null })),
    selectionBaseline: cell<string[] | null>(() => ({ defaultValue: null })),
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
        'SELECTION.SET': { actions: ['setSelection'] },
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
      setSelection: ({ context, prop, event }) => {
        const e = event.current()
        if (e.type !== 'SELECTION.SET')
          return
        context.set('selection', normalizeSelection(e.value, treeSelectionMode(prop('selectionMode'), prop('multiple'))))
      },
      selectNode: ({ context, prop, event }) => {
        const e = event.current()
        if (e.type !== 'NODE.SELECT')
          return
        const current = context.get('selection')
        const anchor = context.get('selectionAnchor')
        const multiple = treeSelectionMode(prop('selectionMode'), prop('multiple')) === 'multiple'

        // 按住 Shift 选一段。级联那一路不接：勾一个本来就带一片，
        // 再叠上范围选，选出来什么会难以预料
        if (e.extend && multiple && !prop('cascade') && anchor != null) {
          const roots = prop('collection') ?? []
          // 全序取展开后的可见行：折叠起来的子节点不在屏幕上，不该被一段选进去
          const order = flattenTree(roots, context.get('expandedValue')).map(row => row.value)
          const baseline = context.get('selectionBaseline') ?? current
          context.set('selectionBaseline', baseline)
          const next = applySelection({
            state: { selected: baseline, anchor },
            mode: 'multiple',
            value: e.value,
            extend: true,
            additive: true,
            items: order,
          })
          context.set('selection', [...next.selected])
          return
        }
        context.set('selectionAnchor', e.value)
        context.set('selectionBaseline', null)
        // 单选没有取消选中这回事，点两下不会把树点空
        if (treeSelectionMode(prop('selectionMode'), prop('multiple')) === 'single') {
          context.set('selection', [e.value])
          return
        }
        // 级联：整枝传导后按收敛策略落对外值；朴素切换只动被点的那一个
        if (prop('cascade')) {
          const roots = prop('collection') ?? []
          const state = cascadeToggle(roots, current, e.value)
          context.set('selection', collapseChecked(roots, state.checked, prop('checkedStrategy') ?? 'child'))
          return
        }
        context.set(
          'selection',
          current.includes(e.value) ? current.filter(v => v !== e.value) : [...current, e.value],
        )
      },
      setFocusedValue: ({ context, event }) => {
        const e = event.current()
        if (e.type === 'NODE.FOCUS')
          context.set('focusedValue', e.value)
      },
      // 焦点离场只清焦点锚点，展开与选中留着
      clearFocusedValue: ({ context, refs }) => {
        context.set('focusedValue', null)
        // 焦点走了缓冲也得丢，否则下次进来首字母会拼进上一轮查询串
        refs.get('typeahead').clear()
      },
    },
  },
})
