import type { StepWithExpect } from '../../conformance/types'

export interface PressTargetOptions {
  /** 多条目部件按 data-value 指定按哪一条；不给取文档序里第一个。 */
  value?: string
  /** 条目身份不在 data-value 上（如 cascader 的检索候选）时，直接给出目标选择器；与 value 二选一。 */
  selector?: string
  /**
   * 按住途中失焦的落点选择器；不给就 el.blur() 落到 body。
   * 浮层里的条目落到 body 时，React 的合成 focusout 沿组件树穿过 Portal 叫起根的 onFocusOut，而 Vue / WC 的
   * DOM 路径到不了根——两家对「焦点离开浮层」的回应不同，对拍会在这一步分叉；把落点指到宿主内部的节点，
   * 三家都只看见条目自己的 blur。
   */
  blurTo?: string
  /**
   * aria-activedescendant 模型（combobox / mention / command）：焦点恒在输入框，条目自己收不到按键，
   * Enter 按住时由这个选择器指向的输入框替高亮条目进按压通道。给了它，键盘与失焦都派到输入框上、
   * 只测 Enter（Space 在输入框里是打字），按压面仍在条目上看；触屏那一路照旧派到条目自己身上。
   */
  keyboardHost?: string
}

function targetSelector(scope: string, part: string, options: PressTargetOptions): string {
  if (options.selector !== undefined)
    return options.selector
  const base = `[data-scope="${scope}"][data-part="${part}"]`
  return options.value === undefined ? base : `${base}[data-value="${options.value}"]`
}

function describeTarget(scope: string, part: string, options: PressTargetOptions): string {
  if (options.selector !== undefined)
    return `${scope}.${part}（${options.selector}）`
  return options.value === undefined ? `${scope}.${part}` : `${scope}.${part}[${options.value}]`
}

/**
 * 按压通道：Space / Enter 按住与触屏按下期间，部件投影 data-pressed；抬起、失焦或指针取消即撤下。
 * 套件的 key 步骤把 keydown 与 keyup 一次派完，看不到中间那一帧，只能拆开派。
 */
export function heldPress(scope: string, part: string, options: PressTargetOptions = {}): StepWithExpect {
  const label = describeTarget(scope, part, options)
  return {
    kind: 'raw',
    why: 'key 步骤把 keydown / keyup 一次派完，按住的中间帧要拆开派才看得见',
    run: async ({ doc, flush }) => {
      const el = doc.querySelector<HTMLElement>(targetSelector(scope, part, options))
      if (!el)
        throw new Error(`找不到 ${label} 部件`)
      const host = options.keyboardHost === undefined ? el : doc.querySelector<HTMLElement>(options.keyboardHost)
      if (!host)
        throw new Error(`找不到键盘宿主 ${options.keyboardHost}`)
      host.focus()
      const expectPressed = async (pressed: boolean, phase: string): Promise<void> => {
        await flush()
        const actual = el.hasAttribute('data-pressed')
        if (actual !== pressed)
          throw new Error(`${label} ${phase}：data-pressed 应${pressed ? '在场' : '缺席'}，实际${actual ? '在场' : '缺席'}`)
      }
      await expectPressed(false, '静息')

      for (const key of options.keyboardHost === undefined ? [' ', 'Enter'] : ['Enter']) {
        host.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }))
        await expectPressed(true, `keydown ${JSON.stringify(key)} 之后`)
        host.dispatchEvent(new KeyboardEvent('keyup', { key, bubbles: true, cancelable: true }))
        await expectPressed(false, `keyup ${JSON.stringify(key)} 之后`)
      }

      // 按住途中失焦：不会再来 keyup，按压面得随焦点一起走。
      // 走真实的 blur()：浏览器派 blur 再派冒泡的 focusout，React 的 onBlur 挂的正是后者
      host.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }))
      await expectPressed(true, '再次 keydown Enter 之后')
      if (options.blurTo === undefined) {
        host.blur()
      }
      else {
        const next = doc.querySelector<HTMLElement>(options.blurTo)
        if (!next)
          throw new Error(`找不到失焦落点 ${options.blurTo}`)
        next.focus()
      }
      await expectPressed(false, '失焦之后')

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

export interface PressIgnoredOptions extends Pick<PressTargetOptions, 'value' | 'selector'> {
  /**
   * 键盘那一路从哪里派：不给就派到部件自己身上；给选择器即 aria-activedescendant 模型的输入框（派 Enter）；
   * 给 null 表示键盘到不了这个部件（如从未被高亮的禁用候选），只验触屏——把按键硬派到它身上会冒泡到
   * 容器的键盘处理器、激活焦点所在的另一个条目，验的就不是它了。
   */
  keyboardHost?: string | null
}

/** 禁用（或加载）时按住不进入按压面。 */
export function heldPressIgnored(scope: string, part: string, why: string, options: PressIgnoredOptions = {}): StepWithExpect {
  const label = describeTarget(scope, part, options)
  return {
    kind: 'raw',
    why: `按住的中间帧要拆开派才看得见；${why}`,
    run: async ({ doc, flush }) => {
      const el = doc.querySelector<HTMLElement>(targetSelector(scope, part, options))
      if (!el)
        throw new Error(`找不到 ${label} 部件`)
      if (options.keyboardHost === undefined) {
        el.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true }))
      }
      else if (options.keyboardHost !== null) {
        const host = doc.querySelector<HTMLElement>(options.keyboardHost)
        if (!host)
          throw new Error(`找不到键盘宿主 ${options.keyboardHost}`)
        host.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }))
      }
      el.dispatchEvent(new PointerEvent('pointerdown', { pointerType: 'touch', bubbles: true, cancelable: true }))
      await flush()
      if (el.hasAttribute('data-pressed'))
        throw new Error(`${label} ${why}，按住却投影了 data-pressed`)
    },
  }
}
