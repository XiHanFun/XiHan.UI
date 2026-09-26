/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 switch 类型契约。

import type { MachineSchema, PropTypes, Size, Tone } from '@xihan-ui/core'
import type { SpringValue } from '@xihan-ui/motion'
import type { PointerSession } from '@xihan-ui/pointer'

export interface SwitchCheckedChangeDetails {
  checked: boolean
}

/** 拖动滑块的一场：按下的位置、起始端、行程与节点；横向移动过激活距离之前 active 为 false。 */
export interface SwitchDrag {
  pointerId: number
  startX: number
  startY: number
  /** 按下那一刻滑块离起始端的位移。 */
  base: number
  /** 轨道内宽。行程 = 内宽 − 滑块此刻的宽：按住时滑块被拉长，拉长后的滑块走到头也不越出轨道。 */
  inner: number
  /** 松手后开着那一端的位移：滑块收回原宽时的行程。 */
  rest: number
  rtl: boolean
  active: boolean
  root: HTMLElement
  thumb: HTMLElement
  session: PointerSession
}

export interface SwitchRefs {
  drag: SwitchDrag | null
  /** 松手后把滑块收到一端的弹簧；落定、再次按下或卸载时撤下。 */
  settle: SpringValue | null
}

export interface SwitchSchema extends MachineSchema {
  props: {
    checked?: boolean
    defaultChecked?: boolean
    disabled?: boolean
    /** 只读：不可切换，但仍可聚焦、仍参与提交，对比度不降低。 */
    readOnly?: boolean
    /** 校验失败：只改变呈现，不阻止交互。 */
    invalid?: boolean
    /** 必填：随表单校验一起使用，只发无障碍属性，不自行拦截提交。 */
    required?: boolean
    /** 提交中：交互挂起、滑块转圈，但不呈现为禁用（仍可聚焦、对比度不降）。 */
    loading?: boolean
    /** 表单字段名；提供后 hidden-input 才带 name 并参与提交。 */
    name?: string
    /** 提交的值，默认 'on'，与原生复选框一致。 */
    value?: string
    /** 语气：brand / neutral / success / warning / danger / info，决定选中态轨道使用哪族颜色。 */
    tone?: Tone
    /** 尺寸：sm / md / lg，决定轨道与滑块的几何档位。 */
    size?: Size
    /** checked 变化意图回调；受控时是唯一出口，非受控时随内部转移一并通知。 */
    onCheckedChange?: (details: SwitchCheckedChangeDetails) => void
  }
  context: {
    /** 按压通道：Space / Enter 或触屏按住期间为 true，root 投影 data-pressed；抬起、失焦或指针取消即复位。与开关态无关。 */
    pressed: boolean
    /**
     * 拖动与松手落定期间滑块离起始端的横向位移（物理像素，从右往左书写时为负），连接层写成滑块的内联 translate；
     * 为 null 时滑块按开关态停在两端，由样式层摆放。
     */
    thumbPosition: number | null
    /** 正在拖动滑块（横向移动过了激活距离），投影 data-dragging。 */
    dragging: boolean
    /** 松手后弹簧正把滑块收到一端，投影 data-animating。 */
    settling: boolean
    /** 刚拖完：浏览器紧跟着派的那次 click 要吞掉，否则一拖一点会切两次。下一次按下或按键时复位。 */
    swallowClick: boolean
  }
  computed: Record<string, never>
  refs: SwitchRefs
  state: 'off' | 'on'
  event:
    | { type: 'TOGGLE' }
    // 受控回写：宿主改 checked 后由 watch 派发，无条件跳转、不再通知
    | { type: 'CONTROLLED.ON' }
    | { type: 'CONTROLLED.OFF' }
    | { type: 'FORM.RESET' }
    /** 指针按在轨道上：root 是轨道节点，量行程与找滑块用。 */
    | { type: 'DRAG.START', pointerId: number, clientX: number, clientY: number, root: HTMLElement }
    | { type: 'DRAG.MOVE', clientX: number, clientY: number }
    /** 指针抬起或被系统收走。velocity 是横向松手速度（像素每秒）。 */
    | { type: 'DRAG.END', velocity: number, canceled: boolean }
    /** 拖完之后浏览器补派的那次 click 被吞掉。 */
    | { type: 'CLICK.SWALLOW' }
    // 按压通道（shared/press）：Space / Enter 或触屏按住与松开
    | { type: 'PRESS.START' }
    | { type: 'PRESS.END' }
  tag: never
  guard: 'isCheckedControlled' | 'defaultsToChecked' | 'canPress'
  action:
    | 'invokeOnCheck'
    | 'invokeOnUncheck'
    | 'syncChecked'
    | 'invokeReset'
    | 'startPress'
    | 'endPress'
    | 'releaseWhenInert'
    | 'armDrag'
    | 'moveDrag'
    | 'endDrag'
    | 'swallowClick'
  effect: 'trackDrag'
}

export interface SwitchApi<T extends PropTypes = PropTypes> {
  checked: boolean
  /** 提交中。 */
  loading: boolean
  setChecked: (next: boolean) => void
  getRootProps: () => T['button']
  getThumbProps: () => T['element']
  /** 表单影子：开启后才提交。提供 name 后才带 name，未提供时不参与提交。 */
  getHiddenInputProps: () => T['input']
  /** 包裹轨道与文字的 <label>：点击文字即切换，轨道的可及名来自文字。只在带文字时渲染。 */
  getLabelProps: () => T['label']
  /** 轨道旁的文字。 */
  getTextProps: () => T['element']
}

/** 读屏文案。本组件目前没有需要外露的文案，保留该位。 */
export interface SwitchTranslations {}
