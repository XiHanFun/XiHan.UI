import type { JsonViewerApi, JsonViewerNode, JsonViewerSchema, JsonViewerTranslations } from '@xihan-ui/headless'
import type { Direction, Size } from '@xihan-ui/kernel'
import type { PropType, VNode } from 'vue'
import type { PayloadOf } from '../../runtime/payload'
import { defineComponent, h } from 'vue'
import { withXhConfig } from '../../config/config'
import { useJsonViewer } from './use-json-viewer'

type JsonViewerProps = JsonViewerSchema['props']

/** 可见行按父路径分组，铺 DOM 时逐层取用。 */
function groupByParent(nodes: readonly JsonViewerNode[]): Map<string | null, JsonViewerNode[]> {
  const out = new Map<string | null, JsonViewerNode[]>()
  for (const node of nodes) {
    const list = out.get(node.parent)
    if (list)
      list.push(node)
    else
      out.set(node.parent, [node])
  }
  return out
}

function renderRows(
  api: JsonViewerApi,
  children: Map<string | null, JsonViewerNode[]>,
  parent: string | null,
): VNode[] {
  return (children.get(parent) ?? []).map(node => renderRow(api, children, node))
}

/**
 * 一行：标量是 item（键名 + 值），对象与数组是 branch（控制行 + 子层）。
 * 没有键名的行（根行、截断占位）不渲染键名部件，免得多出一个空盒子。
 */
function renderRow(
  api: JsonViewerApi,
  children: Map<string | null, JsonViewerNode[]>,
  node: JsonViewerNode,
): VNode {
  const ref = { value: node.value }

  if (!node.branch) {
    const parts: VNode[] = []
    if (node.key != null)
      parts.push(h('span', api.getItemKeyProps(ref) as Record<string, unknown>, node.key))
    parts.push(h('span', api.getItemValueProps(ref) as Record<string, unknown>, api.valueText(node)))
    return h('div', { ...api.getItemProps(ref) as Record<string, unknown>, key: node.value }, parts)
  }

  const control: VNode[] = [
    h('span', api.getBranchTriggerProps(ref) as Record<string, unknown>, [
      h('span', api.getBranchIndicatorProps(ref) as Record<string, unknown>),
    ]),
  ]
  if (node.key != null)
    control.push(h('span', api.getBranchTextProps(ref) as Record<string, unknown>, node.key))
  control.push(h('span', api.getPreviewProps(ref) as Record<string, unknown>, api.previewText(node)))

  const parts: VNode[] = [h('div', api.getBranchControlProps(ref) as Record<string, unknown>, control)]
  // 收起的子层不渲染：一份大 JSON 全铺出来会把页面压住，展开集合本来也是逐层放开的
  if (api.isExpanded(node.value)) {
    parts.push(h(
      'div',
      api.getBranchContentProps(ref) as Record<string, unknown>,
      renderRows(api, children, node.value),
    ))
  }
  return h('div', { ...api.getBranchProps(ref) as Record<string, unknown>, key: node.value }, parts)
}

export const XhJsonViewerRoot = defineComponent({
  name: 'XhJsonViewerRoot',
  // 有 connect 兜底的 prop 一律 default: undefined
  props: {
    // 任意形状都收，类型检查交给使用方
    value: { type: null as unknown as PropType<unknown>, default: undefined },
    expandedValue: { type: Array as PropType<string[]>, default: undefined },
    defaultExpandedValue: { type: Array as PropType<string[]>, default: undefined },
    defaultExpandedDepth: { type: Number, default: undefined },
    maxStringLength: { type: Number, default: undefined },
    maxItems: { type: Number, default: undefined },
    sortKeys: { type: Boolean, default: undefined },
    loop: { type: Boolean, default: undefined },
    dir: { type: String as PropType<Direction>, default: undefined },
    size: { type: String as PropType<Size>, default: undefined },
    translations: { type: Object as PropType<Partial<JsonViewerTranslations>>, default: undefined },
  },
  // expanded-change 携带 { value }，update:expandedValue 携带裸集合
  emits: {
    'expanded-change': (_details: PayloadOf<JsonViewerProps, 'onExpandedChange'>) => true,
    'update:expandedValue': (_value: PayloadOf<JsonViewerProps, 'onExpandedChange'>['value']) => true,
  },
  setup(props, { emit }) {
    const notify: JsonViewerProps['onExpandedChange'] = (details) => {
      emit('expanded-change', details)
      emit('update:expandedValue', details.value)
    }
    const ctx = useJsonViewer(withXhConfig('json-viewer', props) as JsonViewerProps, notify)
    // 行是按数据摊出来的，作者写不出也不必写：整棵树由组件自己铺
    return () => {
      const api = ctx.api.value
      const children = groupByParent(api.visibleNodes)
      return h('div', api.getRootProps() as Record<string, unknown>, [
        h('div', api.getTreeProps() as Record<string, unknown>, renderRows(api, children, null)),
      ])
    }
  },
})
