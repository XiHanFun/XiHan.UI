import type { MasonryColumns, MasonryMeasurement, MasonryProps } from '@xihan-ui/headless'
import type { PropType, VNode } from 'vue'
import { connectMasonry, distributeMasonry, measureMasonry, resolveMasonryColumns, sameMasonryHeights } from '@xihan-ui/headless'
import { Comment, defineComponent, Fragment, h, onBeforeUnmount, onMounted, onUpdated, ref, Text } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'

/** 断点对象形态的列数，从 MasonryProps 上取，不在这里另抄一份档位清单。 */
type ColumnsByBreakpoint = Exclude<MasonryColumns, number>

/** 列数的档位名，base 在前，其余自窄到宽。 */
const COLUMN_TIERS = ['base', 'sm', 'md', 'lg', 'xl'] as const

/** 模板里写 columns="3" 拿到的是字符串，交给算法前统一转成数字。 */
function count(value: number | string | undefined): number | undefined {
  return value == null ? undefined : Number(value)
}

/** 列数：整数与字符串按单个数走；断点对象逐档转数字，没写的档不带进去。 */
function columnsOf(value: number | string | ColumnsByBreakpoint | undefined): MasonryColumns | undefined {
  if (value == null || typeof value !== 'object')
    return count(value)
  const out: ColumnsByBreakpoint = {}
  for (const tier of COLUMN_TIERS) {
    const raw = value[tier]
    if (raw != null)
      out[tier] = Number(raw)
  }
  return out
}

/**
 * 把默认插槽摊成一个个项。
 *
 * `v-for` 产出的是一个片段而不是若干节点，不摊平就整段算一项，一列里会塞进所有内容；
 * `v-if` 为假留下的注释节点与模板缩进留下的空白文本一个像素都不画，留着会占掉一个格位。
 */
function masonryItems(nodes: readonly VNode[]): VNode[] {
  const items: VNode[] = []
  for (const node of nodes) {
    if (node.type === Comment)
      continue
    if (node.type === Text) {
      if (String(node.children ?? '').trim() !== '')
        items.push(node)
      continue
    }
    if (node.type === Fragment && Array.isArray(node.children)) {
      items.push(...masonryItems(node.children as VNode[]))
      continue
    }
    items.push(node)
  }
  return items
}

export const XhMasonry = defineComponent({
  name: 'XhMasonry',
  // 有 connect 兜底的 prop：普通类型省略 default，Boolean 显式保留 undefined
  props: {
    // 列数由作者声明：兼收字符串以支持模板里写 columns="3"，收对象则是逐档的列数
    columns: {
      type: [Number, String, Object] as PropType<number | string | ColumnsByBreakpoint>,
    },
    gap: { type: String as PropType<MasonryProps['gap']> },
    sequential: { type: Boolean, default: undefined },
  },
  setup(props, { slots }) {
    const rootEl = ref<HTMLElement | null>(null)
    /** 容器自身的宽度，换档看它。 */
    const width = ref(0)
    /** 按作者写的项序排好的实测高度。 */
    const heights = ref<number[]>([])

    let observer: ResizeObserver | null = null
    /** 当前挂着观察器的节点，与新一轮比对后才决定要不要重挂。 */
    let observed: HTMLElement[] = []

    /** Headless 只产出测量快照；是否写入 Vue ref 仍由适配器决定。 */
    const publishMeasurement = (measurement: MasonryMeasurement): void => {
      if (measurement.width !== width.value)
        width.value = measurement.width
      if (!sameMasonryHeights(measurement.heights, heights.value))
        heights.value = [...measurement.heights]
    }

    /** 量一遍容器宽度与每一项的高度。量到的与上一遍一样就不写，否则量一次重排一次没完。 */
    const measure = (): void => {
      const el = rootEl.value
      if (!el)
        return
      publishMeasurement(measureMasonry(el))
    }

    /** 项增删后把观察器挂到新的一批节点上，再量一遍。节点没变就不重挂：重挂会白白多跑一轮回调。 */
    const sync = (): void => {
      const el = rootEl.value
      if (!el)
        return
      const measurement = measureMasonry(el)
      const next = [el, ...measurement.items]
      const changed = next.length !== observed.length || next.some((node, index) => node !== observed[index])
      if (observer && changed) {
        observer.disconnect()
        for (const node of next) observer.observe(node)
        observed = next
      }
      publishMeasurement(measurement)
    }

    onMounted(() => {
      const win = rootEl.value?.ownerDocument.defaultView
      // 无布局环境没有 ResizeObserver：只在挂载后量这一次，之后不再跟随尺寸变化
      if (win && typeof win.ResizeObserver === 'function')
        observer = new win.ResizeObserver(() => measure())
      sync()
    })

    onUpdated(sync)

    onBeforeUnmount(() => {
      observer?.disconnect()
      observer = null
      observed = []
    })

    return () => {
      const children = masonryItems(slots.default?.() ?? [])
      const declared = columnsOf(props.columns)
      const columnCount = resolveMasonryColumns(declared, width.value)
      const assign = distributeMasonry(
        children.map((_, index) => heights.value[index] ?? 0),
        columnCount,
        props.sequential ?? false,
      )
      const api = connectMasonry({
        columns: declared,
        gap: props.gap,
        sequential: props.sequential,
      }, vueNormalize)

      const columns: VNode[] = []
      for (let column = 0; column < columnCount; column++) {
        const kids: VNode[] = []
        children.forEach((child, index) => {
          if (assign[index] !== column)
            return
          // 项各包一层：量高度要有个稳定的盒子，作者写什么内容都不影响
          // 键跟着作者写的 key 走，同一列内增删才不会连累后面几项重建
          kids.push(h(
            'div',
            { ...api.getItemProps({ index, column }) as Record<string, unknown>, key: child.key ?? `xh-masonry-item-${index}` },
            [child],
          ))
        })
        columns.push(h(
          'div',
          { ...api.getColumnProps({ index: column }) as Record<string, unknown>, key: column },
          kids,
        ))
      }

      return h('div', { ...api.getRootProps() as Record<string, unknown>, ref: rootEl }, columns)
    }
  },
})
