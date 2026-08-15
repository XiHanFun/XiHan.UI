import type { Direction, Orientation, PropTypes, Size } from '@xihan-ui/kernel'
import type { MachineSchema } from '@xihan-ui/machine'

/**
 * 条目自报家门：值与禁用由作者在部件上声明，connect 据此产出属性。
 * connect 在 Vue 的 render 期求值，此时 DOM 尚不存在，不得反查 DOM。
 * 工具条只发身份标记、Tab 停靠位与 aria-disabled，条目的角色、按下态与点击行为归条目自己。
 */
export interface ToolbarItemProps {
  value: string
  disabled?: boolean
}

export interface ToolbarSchema extends MachineSchema {
  props: {
    /**
     * 主轴，默认 horizontal。它决定 root 的 aria-orientation、方向键收哪一对键
     * （另一轴原样放行给页面），以及分隔线的朝向（恒与主轴垂直）。
     */
    orientation?: Orientation
    /** 文字方向，默认 ltr；只改写水平主轴上左右方向键的语义。 */
    dir?: Direction
    /** 方向键走到尽头是否回绕，默认 true。 */
    loop?: boolean
    /** 整条禁用：条目全部转 aria-disabled，方向键不再接管。 */
    disabled?: boolean
    /** 尺寸：sm / md / lg。工具条是布局容器，只换排布尺寸，不带语气。 */
    size?: Size
  }
  context: {
    /**
     * 焦点位于工具条内时的瞬态锚点，焦点离开即清空。
     * 焦点模型是 roving tabindex，整条只留一个 Tab 停靠点；锚点只有焦点这一个来源。
     * 锚点为空时由 root 兜底进 Tab 序列，它的 onFocus 再把焦点转投给第一个可停留条目。
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

/** 读屏用的文案。本组件目前没有需要外露的文案，位先留着。 */
export interface ToolbarTranslations {}
