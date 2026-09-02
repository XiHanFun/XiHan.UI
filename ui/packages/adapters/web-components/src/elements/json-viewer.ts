import type { JsonViewerApi, JsonViewerExpandedChangeDetails, JsonViewerNode, JsonViewerSchema, JsonViewerTranslations } from '@xihan-ui/headless'
import type { Direction, Size } from '@xihan-ui/kernel'
import { connectJsonViewer, jsonViewerAnatomy, jsonViewerMachine, jsonViewerMeta } from '@xihan-ui/headless'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'
import { MachineController } from '../runtime/machine-controller'
import { ScrollbarsController } from '../runtime/scrollbars-controller'

// 属性缺席翻成 undefined，缺省值由 connect 决定；Lit 自带转换器会把缺席落成 null/false，表达不了「未指定」。
const STRING_CONVERTER = { fromAttribute: (v: string | null) => v ?? undefined }
const NUMBER_CONVERTER = { fromAttribute: (v: string | null) => (v == null || v === '' ? undefined : Number(v)) }
// 三态布尔：缺席=undefined（走缺省）、在场=true、显式写 "false"=false。
const BOOLEAN_CONVERTER = { fromAttribute: (v: string | null) => (v === null ? undefined : v !== 'false') }
// 属性里写的是一段 JSON 文本；解析不了就当作一个字符串值展示，而不是整个视图空掉
const JSON_CONVERTER = {
  fromAttribute: (v: string | null): unknown => {
    if (v == null)
      return undefined
    try {
      return JSON.parse(v)
    }
    catch {
      return v
    }
  },
}

/** 一行的全部节点。分支与叶子的形状不同，形状变了就整行重建。 */
interface JsonRow {
  shape: string
  host: HTMLElement
  itemKey?: HTMLElement
  itemValue?: HTMLElement
  control?: HTMLElement
  trigger?: HTMLElement
  indicator?: HTMLElement
  text?: HTMLElement
  preview?: HTMLElement
  content?: HTMLElement
}

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

/** 顺序已经对上的节点一个都不碰：移动一个节点等于把它摘下来再插回去，焦点会跟着掉。 */
function reconcile(container: HTMLElement, wanted: readonly HTMLElement[]): void {
  let cursor = container.firstChild
  for (const el of wanted) {
    if (cursor === el) {
      cursor = el.nextSibling
      continue
    }
    container.insertBefore(el, cursor)
  }
  while (cursor) {
    const next = cursor.nextSibling
    container.removeChild(cursor)
    cursor = next
  }
}

function setText(el: HTMLElement, text: string): void {
  if (el.textContent !== text)
    el.textContent = text
}

/** 此刻在场的那一档滚动层：树档是 tree，原文档是 text，两者都是 root 的直接子节点。 */
function scrollLayerOf(root: HTMLElement | null): HTMLElement | null {
  return root?.querySelector<HTMLElement>(':scope > [data-part="tree"], :scope > [data-part="text"]') ?? null
}

/**
 * `<xh-json-viewer>` —— Light-DOM 行为宿主：作者只写一个 root 角色节点，
 * 元素跑 json-viewer 机器，把 value 摊成的每一行铺进 root 里。
 *
 * 行是按数据算出来的，作者写不出也不必写：树容器与每一行由本元素建，
 * root 的内容整份由本元素接管（写在里面的东西会被替换掉）。
 *
 * 收起的分支整棵子层不进 DOM——一份大 JSON 全铺出来会把页面压住。
 *
 * 属性里的 value 是一段 JSON 文本（解析不了就当一个字符串值展示）；
 * 直接喂对象走 property（`el.value = { … }`）。
 * expandedValue / defaultExpandedValue / translations 没有对应属性，只能走 property。
 *
 * @customElement xh-json-viewer
 * @attr {string} value - 要展示的值，写成一段 JSON 文本；对象与数组走 property
 * @attr {number} default-expanded-depth - 初始展开到第几层，默认 1（只展开根行）
 * @attr {number} max-string-length - 字符串值超过这么多字符就截断
 * @attr {number} max-items - 同一层最多摊出这么多成员，其余收成一行占位
 * @attr {boolean} sort-keys - 对象键按字典序排列
 * @attr {boolean} loop - 上下键走到首尾回绕，默认关闭
 * @attr {'ltr'|'rtl'} dir - 文字方向，只对调左右方向键的展开/收起语义；不写即从 DOM 现读
 * @attr {'sm'|'md'|'lg'} size - 尺寸
 * @fires expanded-change - 展开集合变化；detail 为 `{ value: string[] }`
 * @csspart root - 组件根容器，由作者写出；承载 data-size
 * @csspart tree - role=tree 的树容器（键盘在此收口，焦点在树外时它兜底占 Tab 位）
 * @csspart item - 标量行，role=treeitem，带 data-value-type
 * @csspart item-key - 标量行的键名
 * @csspart item-value - 标量行的值
 * @csspart branch - 对象/数组行，role=treeitem，带 aria-expanded 与 data-state
 * @csspart branch-control - 分支那一行本身（点它切换展开态）
 * @csspart branch-trigger - 展开箭头（aria-hidden，不占 Tab 位）
 * @csspart branch-indicator - 箭头字形，随 data-state 转向
 * @csspart branch-text - 分支的键名
 * @csspart preview - 收起摘要（如 `{…} 3`），对读屏隐藏
 * @csspart branch-content - role=group 的子层容器，只在展开时存在
 */
export class XhJsonViewerElement extends XhElement {
  static override partContract = { anatomy: jsonViewerAnatomy, meta: jsonViewerMeta }

  // dir 占属性名、字段改叫 direction：HTMLElement 原生 dir 是 string 访问器，
  // 同名声明既与基类类型冲突，也会盖掉原生反射。
  // 描述符逐个写全，CEM 分析器读不了对象展开。
  static override properties = {
    value: { converter: JSON_CONVERTER },
    expandedValue: { attribute: false },
    defaultExpandedValue: { attribute: false },
    defaultExpandedDepth: { converter: NUMBER_CONVERTER, attribute: 'default-expanded-depth' },
    maxStringLength: { converter: NUMBER_CONVERTER, attribute: 'max-string-length' },
    maxItems: { converter: NUMBER_CONVERTER, attribute: 'max-items' },
    sortKeys: { converter: BOOLEAN_CONVERTER, attribute: 'sort-keys' },
    view: { attribute: 'view' },
    loop: { converter: BOOLEAN_CONVERTER },
    direction: { converter: STRING_CONVERTER, attribute: 'dir' },
    size: { converter: STRING_CONVERTER },
    translations: { attribute: false },
  }

  declare value?: unknown
  declare expandedValue?: string[]
  declare defaultExpandedValue?: string[]
  declare defaultExpandedDepth?: number
  declare maxStringLength?: number
  declare maxItems?: number
  declare sortKeys?: boolean
  declare view?: 'tree' | 'text'
  declare loop?: boolean
  declare direction?: Direction
  declare size?: Size
  declare translations?: Partial<JsonViewerTranslations>

  private readonly notify = (details: JsonViewerExpandedChangeDetails): void => {
    this.dispatchEvent(new CustomEvent('expanded-change', { detail: details, bubbles: true, composed: true }))
  }

  // json-viewer 机器无副作用：不需要 config/layer/refs，controller 只带 props。
  private readonly ctrl = new MachineController<JsonViewerSchema>(this, jsonViewerMachine, () => this.machineProps())

  /**
   * 两档的自绘条：与滚动层同级挂在根上。两档互斥，交此刻在场的那个——
   * 两个容器都归本元素建，身上没有 data-xh-part，从 root 里现查。
   * 两条轴都摆：深层缩进往行首方向推、长字符串往行尾伸。
   */
  private readonly bars = new ScrollbarsController(this, {
    shell: () => this.getPart('root'),
    scrollable: () => scrollLayerOf(this.getPart('root')),
    axes: ['vertical', 'horizontal'],
    props: () => ({ dir: this.direction }),
  })

  /** 条子上一轮接的是哪一档的容器。 */
  private wiredLayer: HTMLElement | null = null

  private machineProps(): Partial<JsonViewerSchema['props']> {
    return {
      value: this.value,
      expandedValue: this.expandedValue,
      defaultExpandedValue: this.defaultExpandedValue,
      defaultExpandedDepth: this.defaultExpandedDepth,
      maxStringLength: this.maxStringLength,
      maxItems: this.maxItems,
      // 布尔一律原样透传：属性不在即 undefined，把缺省交回 connect
      sortKeys: this.sortKeys,
      view: this.view,
      loop: this.loop,
      dir: this.direction,
      size: this.size,
      translations: this.translations,
      onExpandedChange: this.notify,
    }
  }

  /** 树容器与每一行都归本元素建，按路径留着复用。 */
  private treeEl: HTMLElement | undefined
  private textEl: HTMLElement | undefined
  private readonly rows = new Map<string, JsonRow>()

  /**
   * root 被移出本宿主时，铺在它里面的行也一并离场。浏览器此时不派 focusout，
   * 机器会一直认为焦点还在树内，行重新铺回来时高亮仍挂在那一行上。
   * 这里替 DOM 把焦点离场如实上报（锚点留着，重新铺回来时仍落回那一行）。
   */
  protected override onPartsReleased(nodes: readonly HTMLElement[]): void {
    const { context, getStatus, send } = this.ctrl.service
    // 宿主断开时机器已停机，此刻无焦点可言（送事件还会在 dev 下抛）
    if (getStatus() !== 'Started')
      return
    if (!context.get('focusWithin'))
      return
    const tree = this.treeEl
    if (tree && nodes.some(el => el === tree || el.contains(tree)))
      send({ type: 'VIEWER.BLUR' })
  }

  private makeRow(node: JsonViewerNode, shape: string): JsonRow {
    const doc = this.ownerDocument
    if (node.branch) {
      const host = doc.createElement('div')
      const control = doc.createElement('div')
      const trigger = doc.createElement('span')
      const indicator = doc.createElement('span')
      const preview = doc.createElement('span')
      trigger.appendChild(indicator)
      control.appendChild(trigger)
      let text: HTMLElement | undefined
      // 没有键名的行（根行）不建键名部件，免得多出一个空盒子
      if (node.key != null) {
        text = doc.createElement('span')
        control.appendChild(text)
      }
      control.appendChild(preview)
      host.appendChild(control)
      return { shape, host, control, trigger, indicator, text, preview, content: doc.createElement('div') }
    }
    const host = doc.createElement('div')
    let itemKey: HTMLElement | undefined
    if (node.key != null) {
      itemKey = doc.createElement('span')
      host.appendChild(itemKey)
    }
    const itemValue = doc.createElement('span')
    host.appendChild(itemValue)
    return { shape, host, itemKey, itemValue }
  }

  private paint(
    container: HTMLElement,
    nodes: readonly JsonViewerNode[],
    children: Map<string | null, JsonViewerNode[]>,
    api: JsonViewerApi,
    alive: Set<string>,
  ): void {
    const wanted: HTMLElement[] = []
    for (const node of nodes) {
      alive.add(node.value)
      const shape = `${node.branch}|${node.key != null}`
      let row = this.rows.get(node.value)
      if (!row || row.shape !== shape) {
        row = this.makeRow(node, shape)
        this.rows.set(node.value, row)
      }
      const ref = { value: node.value }
      if (node.branch) {
        this.spreader.spread(row.host, api.getBranchProps(ref) as Record<string, unknown>)
        this.spreader.spread(row.control!, api.getBranchControlProps(ref) as Record<string, unknown>)
        this.spreader.spread(row.trigger!, api.getBranchTriggerProps(ref) as Record<string, unknown>)
        this.spreader.spread(row.indicator!, api.getBranchIndicatorProps(ref) as Record<string, unknown>)
        if (row.text) {
          this.spreader.spread(row.text, api.getBranchTextProps(ref) as Record<string, unknown>)
          setText(row.text, node.key ?? '')
        }
        this.spreader.spread(row.preview!, api.getPreviewProps(ref) as Record<string, unknown>)
        setText(row.preview!, api.previewText(node))
        if (api.isExpanded(node.value)) {
          this.spreader.spread(row.content!, api.getBranchContentProps(ref) as Record<string, unknown>)
          // 已经挂着就别再 appendChild：那是一次真的移除再插入，焦点若在子层里会掉回 body
          if (row.content!.parentNode !== row.host)
            row.host.appendChild(row.content!)
          this.paint(row.content!, children.get(node.value) ?? [], children, api, alive)
        }
        else {
          row.content!.remove()
        }
      }
      else {
        this.spreader.spread(row.host, api.getItemProps(ref) as Record<string, unknown>)
        if (row.itemKey) {
          this.spreader.spread(row.itemKey, api.getItemKeyProps(ref) as Record<string, unknown>)
          setText(row.itemKey, node.key ?? '')
        }
        this.spreader.spread(row.itemValue!, api.getItemValueProps(ref) as Record<string, unknown>)
        setText(row.itemValue!, api.valueText(node))
      }
      wanted.push(row.host)
    }
    reconcile(container, wanted)
  }

  protected wire(): void {
    const root = this.getPart('root')
    if (!root)
      return

    const api = connectJsonViewer(this.ctrl.service, wcNormalize)
    this.spreader.spread(root, api.getRootProps() as Record<string, unknown>)

    // 原文档不铺行：root 里换成一个 pre，整块可框选可复制
    if (api.view === 'text') {
      const pre = this.textEl ?? (this.textEl = this.ownerDocument.createElement('pre'))
      this.adopt(root, pre, this.treeEl)
      this.spreader.spread(pre, api.getTextProps() as Record<string, unknown>)
      setText(pre, api.text)
      // 换回树档时缓存的行要重铺，这里先清空
      this.rows.clear()
      this.syncBars()
      return
    }

    const tree = this.treeEl ?? (this.treeEl = this.ownerDocument.createElement('div'))
    this.adopt(root, tree, this.textEl)
    this.spreader.spread(tree, api.getTreeProps() as Record<string, unknown>)

    const children = groupByParent(api.visibleNodes)
    const alive = new Set<string>()
    this.paint(tree, children.get(null) ?? [], children, api, alive)
    // 收起或换了数据之后不再出现的行，缓存里也不留
    for (const key of [...this.rows.keys()]) {
      if (!alive.has(key))
        this.rows.delete(key)
    }

    this.syncBars()
  }

  /**
   * 把条子接到此刻在场的那一档容器上。
   * 机器的追踪器在本轮渲染之前就跑完了，这一轮换掉的容器它看不见；
   * 换了档就再催一轮，下一轮的追踪器才把滚动监听与容器标记挪过去。
   */
  private syncBars(): void {
    this.bars.wire()
    const layer = scrollLayerOf(this.getPart('root'))
    if (layer === this.wiredLayer)
      return
    this.wiredLayer = layer
    this.requestUpdate()
  }

  /**
   * root 里只留这一档的容器：摘走另一档，作者写在里面的东西也一并清掉。
   * 自绘条同样挂在 root 上，按 scope 认出来留着——整份 replaceChildren 会把条子一起抹掉。
   * 已经就位的节点一个都不碰：移动一个节点等于把它摘下来再插回去，焦点在树里会掉回 body。
   */
  private adopt(root: HTMLElement, keep: HTMLElement, drop: HTMLElement | undefined): void {
    drop?.remove()
    for (const child of [...root.children]) {
      if (child !== keep && child.getAttribute('data-scope') !== 'scrollbar')
        child.remove()
    }
    if (root.firstChild !== keep)
      root.insertBefore(keep, root.firstChild)
  }
}
