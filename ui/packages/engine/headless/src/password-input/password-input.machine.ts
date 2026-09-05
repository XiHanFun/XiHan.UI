import type { Params } from '@xihan-ui/core'
import type { PasswordInputSchema } from './password-input.types'
import { resetDeclaredValue, setup } from '@xihan-ui/core'
import { passwordInputInputId } from './password-input.anatomy'

const { createMachine } = setup<PasswordInputSchema>()

/**
 * 换掉明暗态，并把输入框里的光标与选中范围放回原处。
 *
 * input 的 type 一改，浏览器会重建框内的编辑器：光标被顶到末尾，选中的那一段也没了。
 * 用户点一下切换钮就要重新找位置，密码长的时候尤其难受。
 */
function applyVisibility(
  params: Pick<Params<PasswordInputSchema>, 'context' | 'flush' | 'scope'>,
  next: boolean,
): void {
  const { context, flush, scope } = params
  const input = scope.getById<HTMLInputElement>(passwordInputInputId(scope))
  const start = input?.selectionStart ?? null
  const end = input?.selectionEnd ?? null
  context.set('visible', next)
  // 等宿主把新的 type 提交到 DOM 之后再放光标：早一步放会被这次重建抹掉
  flush(() => {
    if (!input || start == null || end == null)
      return
    // 这一帧里值被改过就不放了，原来那段文字已经不在那个位置上
    if (input.value.length < end)
      return
    input.setSelectionRange?.(start, end)
  })
}

export const passwordInputMachine = createMachine({
  name: 'password-input',
  context: ({ prop, cell }) => ({
    // 值住在 cell 里，受控/非受控在此收口，不需要 CONTROLLED.* 影子事件
    value: cell<string>(() => ({
      value: prop('value'),
      defaultValue: prop('defaultValue') ?? '',
      onChange: value => prop('onValueChange')?.({ value }),
    })),
    // 明暗态同样走 cell：它不改变组件能做什么，没必要编码成状态
    visible: cell<boolean>(() => ({
      value: prop('visible'),
      defaultValue: prop('defaultVisible') ?? false,
      onChange: visible => prop('onVisibilityChange')?.({ visible }),
    })),
    // 大写锁定是 DOM 那侧的事实：不受控、不对外通知，只驱动提示部件
    capsLock: cell<boolean>(() => ({ defaultValue: false })),
  }),
  initialState: () => 'idle',
  // 只有一个状态，事件全挂根级；表单重置从任何时候发来都要认
  on: {
    'FORM.RESET': { actions: ['resetToDefault'] },
    'VALUE.SET': { guard: 'canEdit', actions: ['setValue'] },
    'VISIBILITY.SET': { guard: 'canToggleVisibility', actions: ['setVisible'] },
    'VISIBILITY.TOGGLE': { guard: 'canToggleVisibility', actions: ['toggleVisibility'] },
    'CAPS_LOCK.SET': { actions: ['setCapsLock'] },
  },
  states: {
    idle: {},
  },
  implementations: {
    guards: {
      canEdit: ({ prop }) => !prop('disabled') && !prop('readOnly'),
      // 只读不拦明暗：改的是怎么显示，不是值本身
      canToggleVisibility: ({ prop }) => !prop('disabled'),
    },
    actions: {
      resetToDefault: (params) => {
        resetDeclaredValue(params, 'value', 'value', 'defaultValue')
        // 明暗一并收回初始态：重置之后把明文密码继续摊在屏幕上不合适。
        // 大写锁定不动——它是键盘上的物理事实，重置表单改不了它
        resetDeclaredValue(params, 'visible', 'visible', 'defaultVisible')
      },
      setValue: ({ context, event }) => {
        const e = event.current()
        if (e.type !== 'VALUE.SET')
          return
        context.set('value', e.value)
      },
      setVisible: (params) => {
        const e = params.event.current()
        if (e.type !== 'VISIBILITY.SET')
          return
        applyVisibility(params, e.visible)
      },
      toggleVisibility: (params) => {
        const e = params.event.current()
        if (e.type !== 'VISIBILITY.TOGGLE')
          return
        applyVisibility(params, !params.context.get('visible'))
      },
      setCapsLock: ({ context, event }) => {
        const e = event.current()
        if (e.type !== 'CAPS_LOCK.SET')
          return
        context.set('capsLock', e.on)
      },
    },
  },
})
