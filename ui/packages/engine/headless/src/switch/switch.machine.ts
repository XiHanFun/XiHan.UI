/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 switch 相关实现。

import type { ContextFacade, RefsFacade } from '@xihan-ui/core'
import type { SwitchSchema } from './switch.types'
import { setup } from '@xihan-ui/core'
import { createSpringValue, projectRelease, rubberClamp } from '@xihan-ui/motion'
import { createPointerSession, resolveSessionDoc } from '@xihan-ui/pointer'

const { createMachine } = setup<SwitchSchema>()

/** 按下之后横向移动过这么远（像素）才算拖动；不到这个距离的松手仍是一次点按。 */
const DRAG_ACTIVATION = 3

/** 滑块拖出两端时的橡皮筋尺寸（像素）：越拉越沉，趋近这么远。 */
const THUMB_STRETCH = 24

/** 松手落点的投影时间（秒）：拇指行程短，只看松手前一瞬的去势。 */
const PROJECTION_SECONDS = 0.06

/** 撤下松手落定的弹簧，滑块交还给样式层按开关态摆放。 */
function stopSettle(refs: RefsFacade<SwitchSchema>, context: ContextFacade<SwitchSchema>): void {
  refs.get('settle')?.stop()
  refs.set('settle', null)
  context.set('settling', false)
  context.set('thumbPosition', null)
}

/** 结束这一场拖动的指针会话。 */
function releaseDrag(refs: RefsFacade<SwitchSchema>): void {
  refs.get('drag')?.session.dispose()
  refs.set('drag', null)
}

// 受控（checked 给定）与 dialog 同构：用户事件只发意图、不自改状态；宿主写回 checked 后
// 由 watch 派发影子事件 CONTROLLED.* 无条件回写。
//
// 滑块可以拖：拖动不改开关态，松手时按落点决定停在哪一端、要不要切换，弹簧带着松手速度把滑块收过去。
// 受控时切换只发意图；宿主不接的话，滑块先落到拖去的那一端，交还样式层后再按原状态滑回。
export const switchMachine = createMachine({
  name: 'switch',
  context: ({ cell }) => ({
    // 按压通道：Space / Enter 与触屏按住期间为 true，与开关态无关（两个状态下都认 PRESS.*）
    pressed: cell<boolean>(() => ({ defaultValue: false })),
    thumbPosition: cell<number | null>(() => ({ defaultValue: null })),
    dragging: cell<boolean>(() => ({ defaultValue: false })),
    settling: cell<boolean>(() => ({ defaultValue: false })),
    swallowClick: cell<boolean>(() => ({ defaultValue: false })),
  }),
  refs: () => ({
    drag: null,
    settle: null,
  }),
  // 拖动的会话与松手的弹簧跨开关态存在，卸载时由它收
  effects: ['trackDrag'],
  initialState: ({ prop }) => ((prop('checked') ?? prop('defaultChecked')) ? 'on' : 'off'),
  watch: ({ track, prop, action }) => {
    track([() => prop('checked')], () => action(['syncChecked']))
    // 按住途中转入禁用、提交中或只读：原生 disabled 的按钮不再派 keyup / blur，提交中的轨道也不该停在按下面
    track([() => prop('disabled'), () => prop('loading'), () => prop('readOnly')], () => action(['releaseWhenInert']))
  },
  // 表单重置从两个状态都要认，所以挂根级。状态就是值，回落靠转移而不是写 context：
  // 受控时只发意图（前两条命中即止），非受控才真的转过去。
  // 按压通道同样挂根级：按住途中开关态会翻（Enter 在 keydown 那一刻就 click），按压面不能随状态丢
  on: {
    'PRESS.START': { guard: 'canPress', actions: ['startPress'] },
    'PRESS.END': { actions: ['endPress'] },
    // 拖动滑块：开关态由松手时的落点决定，拖动本身不改状态，两个状态都认
    'DRAG.START': { guard: 'canPress', actions: ['armDrag'] },
    'DRAG.MOVE': { actions: ['moveDrag'] },
    'DRAG.END': { actions: ['endDrag'] },
    'CLICK.SWALLOW': { actions: ['swallowClick'] },
    'FORM.RESET': [
      { guard: 'isCheckedControlled', actions: ['invokeReset'] },
      { guard: 'defaultsToChecked', target: 'on', actions: ['invokeReset'] },
      { target: 'off', actions: ['invokeReset'] },
    ],
  },
  states: {
    off: {
      on: {
        'TOGGLE': [
          { guard: 'isCheckedControlled', actions: ['invokeOnCheck'] },
          { target: 'on', actions: ['invokeOnCheck'] },
        ],
        'CONTROLLED.ON': { target: 'on' },
      },
    },
    on: {
      on: {
        'TOGGLE': [
          { guard: 'isCheckedControlled', actions: ['invokeOnUncheck'] },
          { target: 'off', actions: ['invokeOnUncheck'] },
        ],
        'CONTROLLED.OFF': { target: 'off' },
      },
    },
  },
  implementations: {
    guards: {
      isCheckedControlled: ({ prop }) => prop('checked') !== undefined,
      defaultsToChecked: ({ prop }) => !!prop('defaultChecked'),
      // 禁用、提交中与只读都不进按压面：后两者仍可聚焦，但按下去什么都不会发生，也就不该有按下的回执
      canPress: ({ prop }) => !prop('disabled') && !prop('loading') && !prop('readOnly'),
    },
    actions: {
      // 键盘按下之后的 click 是真的切换：拖完留下的吞点击标记到此作废
      startPress: ({ context }) => {
        context.set('pressed', true)
        context.set('swallowClick', false)
      },
      swallowClick: ({ context }) => context.set('swallowClick', false),

      /**
       * 指针按在轨道上：先不算拖动，横向移动过激活距离才接管。落定途中再按下时从弹簧此刻的位置接着拖。
       * 行程按轨道内宽减去滑块此刻的宽现算：按住时滑块的拉长还在过渡，每次移动都重量。
       */
      armDrag: ({ context, refs, event, state, send }) => {
        const e = event.current()
        if (e.type !== 'DRAG.START')
          return
        context.set('swallowClick', false)
        releaseDrag(refs)
        const thumb = e.root.querySelector<HTMLElement>('[data-scope="switch"][data-part="thumb"]')
        if (!thumb)
          return
        const view = e.root.ownerDocument.defaultView
        const style = view?.getComputedStyle(e.root)
        const rtl = style?.direction === 'rtl'
        const inner = e.root.clientWidth - Number.parseFloat(style?.paddingLeft ?? '0') - Number.parseFloat(style?.paddingRight ?? '0')
        // 滑块是正方形，高就是它收回原宽时的宽
        const rest = Math.max(0, inner - thumb.offsetHeight)
        // 上下文里是物理位移，拖动按书写方向算
        const physical = context.get('thumbPosition')
        const caught = physical == null ? null : physical * (rtl ? -1 : 1)
        const base = caught ?? (state.matches('on') ? rest : 0)
        if (caught != null) {
          refs.get('settle')?.stop()
          refs.set('settle', null)
          context.set('settling', false)
        }
        const session = createPointerSession({
          doc: resolveSessionDoc(e.root),
          pointerId: e.pointerId,
          onMove: ({ point }) => send({ type: 'DRAG.MOVE', clientX: point.clientX, clientY: point.clientY }),
          onEnd: ({ reason, velocity }) => send({ type: 'DRAG.END', velocity: velocity.x, canceled: reason === 'pointercancel' }),
        })
        refs.set('drag', {
          pointerId: e.pointerId,
          startX: e.clientX,
          startY: e.clientY,
          base,
          inner,
          rest,
          rtl,
          active: false,
          root: e.root,
          thumb,
          session,
        })
      },

      moveDrag: ({ context, refs, event }) => {
        const e = event.current()
        const drag = refs.get('drag')
        if (e.type !== 'DRAG.MOVE' || !drag)
          return
        const dx = (e.clientX - drag.startX) * (drag.rtl ? -1 : 1)
        const dy = e.clientY - drag.startY
        if (!drag.active) {
          if (Math.abs(dx) < DRAG_ACTIVATION && Math.abs(dy) < DRAG_ACTIVATION)
            return
          // 纵向为主：这是在滚页面，放手不管
          if (Math.abs(dy) > Math.abs(dx)) {
            releaseDrag(refs)
            return
          }
          drag.active = true
          context.set('dragging', true)
        }
        const travel = Math.max(0, drag.inner - drag.thumb.offsetWidth)
        context.set('thumbPosition', rubberClamp(drag.base + dx, 0, travel, THUMB_STRETCH) * (drag.rtl ? -1 : 1))
      },

      /**
       * 松手：落点顺着松手速度投影，过了中点就停到另一端并切换开关态，弹簧带着松手速度把滑块收过去。
       * 没拖起来（只是点按）时什么都不做，交给随后那次 click；被系统收走时回到原来那一端，不切换。
       */
      endDrag: ({ context, refs, event, state, send }) => {
        const e = event.current()
        const drag = refs.get('drag')
        releaseDrag(refs)
        if (e.type !== 'DRAG.END' || !drag || !drag.active)
          return
        context.set('dragging', false)
        // 浏览器紧跟着会在轨道上派一次 click：拖动已经决定了开关态，那一下不能再切
        context.set('swallowClick', !e.canceled)
        const checked = state.matches('on')
        const physical = context.get('thumbPosition')
        const at = physical == null ? drag.base : physical * (drag.rtl ? -1 : 1)
        const velocity = e.canceled ? 0 : e.velocity * (drag.rtl ? -1 : 1)
        const next = e.canceled ? checked : projectRelease(at, velocity, PROJECTION_SECONDS) > drag.rest / 2
        if (next !== checked)
          send({ type: 'TOGGLE' })
        const spring = createSpringValue({
          spring: 'smooth',
          value: at,
          target: drag.thumb,
          onUpdate: value => context.set('thumbPosition', value * (drag.rtl ? -1 : 1)),
        })
        refs.set('settle', spring)
        context.set('settling', true)
        void spring.to(next ? drag.rest : 0, { velocity }).then((result) => {
          if (result === 'rest' && refs.get('settle') === spring)
            stopSettle(refs, context)
        })
      },
      endPress: ({ context }) => context.set('pressed', false),
      releaseWhenInert: ({ context, prop }) => {
        if (prop('disabled') || prop('loading') || prop('readOnly'))
          context.set('pressed', false)
      },
      invokeOnCheck: ({ prop }) => prop('onCheckedChange')?.({ checked: true }),
      invokeOnUncheck: ({ prop }) => prop('onCheckedChange')?.({ checked: false }),
      // 受控且宿主没声明 defaultChecked 时不发：那句兜底的 false 是组件的空值、不是宿主说过的默认值
      invokeReset: ({ prop, state }) => {
        if (prop('checked') !== undefined && prop('defaultChecked') === undefined)
          return
        const next = !!prop('defaultChecked')
        // 已经停在默认态就不白发一次：原生重置也不会为没变的控件派事件
        if (state.matches(next ? 'on' : 'off'))
          return
        prop('onCheckedChange')?.({ checked: next })
      },
      syncChecked: ({ prop, send }) => {
        const checked = prop('checked')
        if (checked === undefined)
          return
        send(checked ? { type: 'CONTROLLED.ON' } : { type: 'CONTROLLED.OFF' })
      },
    },
    effects: {
      trackDrag: ({ refs, context }) => () => {
        releaseDrag(refs)
        stopSettle(refs, context)
      },
    },
  },
})
