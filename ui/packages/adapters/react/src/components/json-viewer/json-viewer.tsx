import type { Direction, Size } from '@xihan-ui/core'
import type { JsonViewerApi, JsonViewerNode, JsonViewerSchema, JsonViewerTranslations, JsonViewerVariant, JsonViewerView } from '@xihan-ui/headless'
import type { ReactNode } from 'react'
import { useCallback, useRef } from 'react'
import { withXhConfig } from '../../config/config'
import { mergeReactProps } from '../../runtime/merge-props'
import { useNativeEvents } from '../../runtime/native-events'
import { useScrollbars } from '../../runtime/use-scrollbars'
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

interface RowsProps {
  api: JsonViewerApi
  groups: Map<string | null, JsonViewerNode[]>
  parent: string | null
}

interface BranchProps {
  api: JsonViewerApi
  groups: Map<string | null, JsonViewerNode[]>
  node: JsonViewerNode
}

/** 一层的行：标量是 item，对象与数组是 branch。 */
function JsonRows({ api, groups, parent }: RowsProps): ReactNode {
  return (groups.get(parent) ?? []).map(node => (node.branch
    ? <JsonBranch key={node.value} api={api} groups={groups} node={node} />
    : <JsonItem key={node.value} api={api} node={node} />))
}

/** 标量行：键名加值。没有键名的行（截断占位）不渲染键名部件，免得多出一个空盒子。 */
function JsonItem({ api, node }: { api: JsonViewerApi, node: JsonViewerNode }): ReactNode {
  const ref = { value: node.value }
  // 行的聚焦上报不冒泡，改装成原生监听器
  const bind = useNativeEvents(api.getItemProps(ref) as Record<string, unknown>, ['onFocus'])
  return (
    <div {...bind.attrs} ref={bind.ref}>
      {node.key != null ? <span {...api.getItemKeyProps(ref) as Record<string, unknown>}>{node.key}</span> : null}
      <span {...api.getItemValueProps(ref) as Record<string, unknown>}>{api.valueText(node)}</span>
    </div>
  )
}

/** 分支行：控制行加子层。根行没有键名，不渲染键名部件。 */
function JsonBranch({ api, groups, node }: BranchProps): ReactNode {
  const ref = { value: node.value }
  // 行的聚焦上报不冒泡，改装成原生监听器
  const bind = useNativeEvents(api.getBranchProps(ref) as Record<string, unknown>, ['onFocus'])
  return (
    <div {...bind.attrs} ref={bind.ref}>
      <div {...api.getBranchControlProps(ref) as Record<string, unknown>}>
        <span {...api.getBranchTriggerProps(ref) as Record<string, unknown>}>
          <span {...api.getBranchIndicatorProps(ref) as Record<string, unknown>} />
        </span>
        {node.key != null ? <span {...api.getBranchTextProps(ref) as Record<string, unknown>}>{node.key}</span> : null}
        <span {...api.getPreviewProps(ref) as Record<string, unknown>}>{api.previewText(node)}</span>
      </div>
      {/* 收起的子层不渲染：一份大 JSON 全铺出来会把页面压住，展开集合本来也是逐层放开的 */}
      {api.isExpanded(node.value)
        ? (
            <div {...api.getBranchContentProps(ref) as Record<string, unknown>}>
              <JsonRows api={api} groups={groups} parent={node.value} />
            </div>
          )
        : null}
    </div>
  )
}

/** 树档的滚动层：整棵树铺在它里面，键盘也在它身上收口。 */
function JsonViewerTree({ api, keepLayer }: { api: JsonViewerApi, keepLayer: (el: HTMLElement | null) => void }): ReactNode {
  // 容器的 onFocus 是 DOM 的 focus（不冒泡，只在容器自己得焦时接管）。React 的同名合成事件
  // 挂的是冒泡的 focusin，行得焦也会把它叫起来，那一下会把焦点从行抢回锚点上。
  // 同一节点上的 onFocusOut 归到 React 的 onBlur，留在合成事件那一档不动
  const bind = useNativeEvents(api.getTreeProps() as Record<string, unknown>, ['onFocus'])
  const groups = groupByParent(api.visibleNodes)
  return (
    <div {...mergeReactProps(bind.attrs, { ref: bind.ref }, { ref: keepLayer })}>
      <JsonRows api={api} groups={groups} parent={null} />
    </div>
  )
}

export interface XhJsonViewerRootProps {
  /** 要展示的值，任意形状。 */
  value?: unknown
  /** 展示形态：tree 摊成可折叠的行，text 直接出 JSON 原文。 */
  view?: JsonViewerView
  /** 外框形态：surface 带描边与底色（缺省），plain 只留内容。 */
  variant?: JsonViewerVariant
  expandedValue?: string[]
  defaultExpandedValue?: string[]
  defaultExpandedDepth?: number
  maxStringLength?: number
  maxItems?: number
  sortKeys?: boolean
  loop?: boolean
  dir?: Direction
  size?: Size
  translations?: Partial<JsonViewerTranslations>
  onExpandedValueChange?: JsonViewerProps['onExpandedValueChange']
  /** 空态那一格的内容；不写即铺 translations 里的兜底文案。 */
  empty?: ReactNode
}

/** 行是按数据摊出来的，作者写不出也不必写：整棵树由组件自己铺。 */
export function XhJsonViewerRoot({ empty, ...props }: XhJsonViewerRootProps): ReactNode {
  const ctx = useJsonViewer(withXhConfig('json-viewer', props) as JsonViewerProps)
  const { api } = ctx

  // 此刻在场的那个滚动层：两档互斥，树档是 tree、原文档是 pre。
  // 只记在场的那个：换档时旧节点的那次空调用不往下传，条子中间就不会有一拍找不到容器
  const layerRef = useRef<HTMLElement | null>(null)
  const keepLayer = useCallback((el: HTMLElement | null) => {
    if (el)
      layerRef.current = el
  }, [])

  // 两档的自绘条：与滚动层同级、绝对定位不占布局，壳是这层根。
  // 两条轴都摆——深层缩进往行首方向推、长字符串往行尾伸
  const dir = props.dir
  const bars = useScrollbars({
    scrollable: () => layerRef.current,
    axes: ['vertical', 'horizontal'],
    props: () => ({ dir }),
  })

  // 空态与滚动层同级：一行也摊不出来时由它说话，有行可摊时 connect 给它打 hidden
  const emptySlot = (
    <div {...api.getEmptyProps() as Record<string, unknown>}>{empty ?? api.emptyText}</div>
  )

  return (
    <div {...api.getRootProps() as Record<string, unknown>}>
      {/* 原文档不铺行：整块文本交给 pre，框选与复制才拿得到与后端一字不差的那份 */}
      {api.view === 'text'
        ? <pre {...api.getTextProps() as Record<string, unknown>} ref={keepLayer}>{api.text}</pre>
        : <JsonViewerTree api={api} keepLayer={keepLayer} />}
      {emptySlot}
      {bars.render()}
    </div>
  )
}

XhJsonViewerRoot.xhEvents = ['expanded-value-change'] as const
