import type { StepWithExpect } from '../../conformance/types'

/**
 * 按压通道：Space / Enter 按住与触屏按下期间，部件投影 data-pressed；抬起、失焦或指针取消即撤下。
 * 套件的 key 步骤把 keydown 与 keyup 一次派完，看不到中间那一帧，只能拆开派。
 */
export function heldPress(scope: string, part: string): StepWithExpect {
  return {
    kind: 'raw',
    why: 'key 步骤把 keydown / keyup 一次派完，按住的中间帧要拆开派才看得见',
    run: async ({ doc, flush }) => {
      const el = doc.querySelector<HTMLElement>(`[data-scope="${scope}"][data-part="${part}"]`)
      if (!el)
        throw new Error(`找不到 ${scope} 的 ${part} 部件`)
      el.focus()
      const expectPressed = async (pressed: boolean, phase: string): Promise<void> => {
        await flush()
        const actual = el.hasAttribute('data-pressed')
        if (actual !== pressed)
          throw new Error(`${scope}.${part} ${phase}：data-pressed 应${pressed ? '在场' : '缺席'}，实际${actual ? '在场' : '缺席'}`)
      }
      await expectPressed(false, '静息')

      for (const key of [' ', 'Enter']) {
        el.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }))
        await expectPressed(true, `keydown ${JSON.stringify(key)} 之后`)
        el.dispatchEvent(new KeyboardEvent('keyup', { key, bubbles: true, cancelable: true }))
        await expectPressed(false, `keyup ${JSON.stringify(key)} 之后`)
      }

      // 按住途中失焦：不会再来 keyup，按压面得随焦点一起走。
      // 走真实的 blur()：浏览器派 blur 再派冒泡的 focusout，React 的 onBlur 挂的正是后者
      el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }))
      await expectPressed(true, '再次 keydown Enter 之后')
      el.blur()
      await expectPressed(false, 'blur 之后')

      // 触屏：手指按下即在场，滚动接管（pointercancel）即撤下；鼠标按下不走这一路
      el.dispatchEvent(new PointerEvent('pointerdown', { pointerType: 'mouse', bubbles: true, cancelable: true }))
      await expectPressed(false, '鼠标 pointerdown 之后（鼠标由 :active 表出）')
      el.dispatchEvent(new PointerEvent('pointerdown', { pointerType: 'touch', bubbles: true, cancelable: true }))
      await expectPressed(true, '触屏 pointerdown 之后')
      el.dispatchEvent(new PointerEvent('pointercancel', { pointerType: 'touch', bubbles: true }))
      await expectPressed(false, 'pointercancel 之后')
      el.dispatchEvent(new PointerEvent('pointerdown', { pointerType: 'touch', bubbles: true, cancelable: true }))
      await expectPressed(true, '触屏再次 pointerdown 之后')
      el.dispatchEvent(new PointerEvent('pointerup', { pointerType: 'touch', bubbles: true }))
      await expectPressed(false, 'pointerup 之后')
    },
  }
}

/** 禁用（或加载）时按住不进入按压面。 */
export function heldPressIgnored(scope: string, part: string, why: string): StepWithExpect {
  return {
    kind: 'raw',
    why: `按住的中间帧要拆开派才看得见；${why}`,
    run: async ({ doc, flush }) => {
      const el = doc.querySelector<HTMLElement>(`[data-scope="${scope}"][data-part="${part}"]`)
      if (!el)
        throw new Error(`找不到 ${scope} 的 ${part} 部件`)
      el.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true }))
      el.dispatchEvent(new PointerEvent('pointerdown', { pointerType: 'touch', bubbles: true, cancelable: true }))
      await flush()
      if (el.hasAttribute('data-pressed'))
        throw new Error(`${scope}.${part} ${why}，按住却投影了 data-pressed`)
    },
  }
}
