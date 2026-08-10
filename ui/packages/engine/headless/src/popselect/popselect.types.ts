import type { PropTypes } from '@xihan-ui/kernel'
import type { Service } from '@xihan-ui/machine'
import type { ListboxSchema } from '../listbox'
import type { PopoverSchema } from '../popover'

/** 条目数据。给了 collection，显示文本与禁用就以它为准。 */
export interface PopselectNode {
  value: string
  /** 展示文本，也是连打检索的取字处；缺省退回 value。 */
  label?: string
  /** 条目禁用：方向键跳过它，但它仍可聚焦、仍是导航起点。 */
  disabled?: boolean
}

/** 单个条目的元信息，由 collection 推出，不含选中态与焦点态。 */
export interface PopselectNodeMeta {
  value: string
  /** node.label ?? node.value，恒为字符串。 */
  label: string
  disabled: boolean
}

/**
 * 条目自报家门：值必报，禁用可由 collection 代为声明。
 * connect 是 (机器状态, 本条目声明) 的纯函数，不反查 DOM——Vue 侧在 render 期求值（本帧 DOM 还不存在），
 * WC 侧在 updated 后求值（DOM 已就位），连接期读 DOM 会让两个适配器的首帧快照分叉。
 */
export interface PopselectItemProps {
  value: string
  /** 逐条覆盖禁用；缺省时回 collection 里查，两处都没有即为不禁用。 */
  disabled?: boolean
}

/** 三个视觉轴，只落在根上；触发器与浮层都从根继承私有槽。 */
export interface PopselectProps {
  /** 形态：outline / subtle / ghost，决定触发器的描边与底色怎么用。 */
  variant?: string
  /** 语气：brand / neutral / success / warning / danger / info，决定聚焦与选中强调用哪族颜色。 */
  tone?: string
  /** 尺寸：sm / md / lg，决定触发器高度、内边距与字号档位。 */
  size?: string
}

/**
 * 两台机器合起来驱动一个组件：
 * - popover 管浮层开合、定位、消解层与焦点域；
 * - listbox 管选中集合与焦点锚点。
 *
 * 两者的职责不重叠：listbox 机器不建任何副作用，它只把「焦点落在哪个条目」记成 context，
 * 焦点域自始至终归 popover 那一台。视觉轴不入任何一台机器，由 props 直给。
 */
export interface PopselectService {
  popover: Service<PopoverSchema>
  listbox: Service<ListboxSchema>
  props: PopselectProps
}

export interface PopselectApi<T extends PropTypes = PropTypes> {
  open: boolean
  /** 选中集合；单选恒为长度 ≤ 1。 */
  value: string[]
  /** collection 推出的条目元信息，按数据顺序排列；没给 collection 即空数组。 */
  collection: readonly PopselectNodeMeta[]
  multiple: boolean
  /** 焦点锚点；焦点不在列表内时为 null。 */
  focusedValue: string | null
  disabled: boolean
  isSelected: (value: string) => boolean
  setOpen: (next: boolean) => void
  setValue: (next: string[]) => void
  /** 落值：单选替换并收起浮层，多选切换并保持展开。 */
  select: (value: string) => void
  getRootProps: () => T['element']
  getTriggerProps: () => T['button']
  getPositionerProps: () => T['element']
  getContentProps: () => T['element']
  getItemProps: (props: PopselectItemProps) => T['element']
  getItemTextProps: (props: PopselectItemProps) => T['element']
  getItemIndicatorProps: (props: PopselectItemProps) => T['element']
}
