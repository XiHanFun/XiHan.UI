import type { Direction, Orientation, PropTypes } from '@xihan-ui/core'
import type { MachineSchema } from '@xihan-ui/machine'

/**
 * 条目自报家门：值与禁用由作者在部件上声明，connect 据此产出属性。
 * connect 因此是 (context/prop, 本条目声明) 的纯函数，不反查 DOM——
 * Vue 侧 connect 在 render 期求值（本帧 DOM 还不存在），WC 侧在 updated 后求值（DOM 已就位），
 * 连接期读 DOM 会让两个适配器的首帧快照分叉。
 *
 * 条目自己是什么控件（按钮、切换钮、下拉触发器）与工具条无关：
 * 工具条只发身份标记、Tab 停靠位与 aria-disabled，条目的角色、按下态、点击行为
 * 一律归条目自己，绝不在这里覆盖 role 或接管 click。
 */
export interface ToolbarItemProps {
  value: string
  disabled?: boolean
}

export interface ToolbarSchema extends MachineSchema {
  props: {
    /**
     * 主轴，默认 horizontal。它同时决定三件事：root 的 aria-orientation、
     * 方向键收哪一对键（横排收左右、竖排收上下，另一轴原样放行给页面），
     * 以及分隔线的朝向（恒与主轴垂直）。
     */
    orientation?: Orientation
    /** 文字方向，默认 ltr；只改写水平主轴上左右方向键的语义。 */
    dir?: Direction
    /** 方向键走到尽头是否回绕，默认 true。 */
    loop?: boolean
    /** 整条禁用：条目全部转 aria-disabled，方向键不再接管。 */
    disabled?: boolean
  }
  context: {
    /**
     * 焦点位于工具条内时的瞬态锚点，焦点离开即清空。
     *
     * 焦点模型是 roving tabindex（不做 aria-activedescendant 变体）：焦点真的落在条目上，
     * 整条只留一个 Tab 停靠点。工具条没有「选中值」这条线，锚点就只有焦点这一个来源——
     * 锚点为空时由 root 兜底进 Tab 序列，它的 onFocus 再把焦点转投给第一个可停留条目，
     * 「第一个可用项」这层兜底是这样兑现的：connect 不读 DOM，渲染期不可能知道谁排第一。
     */
    focusedValue: string | null
  }
  computed: Record<string, never>
  refs: Record<string, never>
  /** 焦点锚点不编码进状态，机器因此只有一个状态，逻辑全在 context 与 actions。 */
  state: 'idle'
  event:
    /** 焦点落到某个条目上（方向键搬过去的，或指针/程序直接聚焦的）。 */
    | { type: 'ITEM.FOCUS', value: string }
    /** 焦点离开整条工具条，或持有焦点的条目被移出 DOM（浏览器此时不派 focusout，由适配器如实上报）。 */
    | { type: 'TOOLBAR.BLUR' }
  tag: never
  guard: never
  action: 'setFocusedValue' | 'clearFocusedValue'
  effect: never
}

export interface ToolbarApi<T extends PropTypes = PropTypes> {
  /** 焦点锚点；焦点不在工具条内时为 null。 */
  focusedValue: string | null
  /** 生效的主轴。 */
  orientation: Orientation
  /** 分隔线的朝向：恒与主轴垂直（横排工具条里的分隔线是竖线）。 */
  separatorOrientation: Orientation
  disabled: boolean
  getRootProps: () => T['element']
  getGroupProps: () => T['element']
  getItemProps: (props: ToolbarItemProps) => T['element']
  getSeparatorProps: () => T['element']
}
