import type { NormalizeProps, PropTypes } from '@xihan-ui/kernel'
import type { Service } from '@xihan-ui/machine'
import type { ApprovalApi, ApprovalSchema, ApprovalScope, ApprovalStatus } from './approval.types'
import { dataAttr, isComposingEvent } from '@xihan-ui/kernel'
import { approvalAnatomy } from './approval.anatomy'
import { canApproveScopes } from './approval.types'

const parts = approvalAnatomy.build()

function announcementOf(status: ApprovalStatus, translations: ApprovalSchema['props']['translations']): string {
  switch (status) {
    case 'approved':
      return translations?.approved ?? 'Approved'
    case 'denied':
      return translations?.denied ?? 'Denied'
    case 'expired':
      return translations?.expired ?? 'Expired, treated as denied'
    default:
      return translations?.pending ?? 'Waiting for your decision'
  }
}

export function connectApproval<T extends PropTypes>(
  service: Service<ApprovalSchema>,
  normalize: NormalizeProps<T>,
): ApprovalApi<T> {
  const { state, prop, send, context, scope } = service
  const status = state.get()
  const settled = status !== 'pending'
  const busy = prop('busy') === true
  const granted = context.get('grantedScopes')
  const note = context.get('note')
  const scopes = prop('scopes')
  const translations = prop('translations')
  const ids = scope.ids('approval', 'title', 'description')
  // 必选项没勾满、或判定在途，都批不了；拒绝这条路不受它们影响
  const canApprove = !busy && canApproveScopes(scopes, granted)

  const isScopeGranted = (value: string): boolean => granted.includes(value)
  const scopeDisabled = (item: ApprovalScope): boolean => settled || busy || item.disabled === true

  return {
    status,
    settled,
    busy,
    grantedScopes: granted,
    note,
    canApprove,
    announcement: announcementOf(status, translations),
    approve: () => send({ type: 'APPROVE' }),
    deny: () => send({ type: 'DENY', source: 'api' }),
    setGrantedScopes: next => send({ type: 'SCOPE.SET', value: next }),
    setNote: next => send({ type: 'NOTE.SET', value: next }),
    isScopeGranted,

    // 不给 tabindex：内部按钮与勾选项都可聚焦，Escape 冒泡到这里即可。
    // 也不发 aria-busy——挂起中只在按钮上表达
    getRootProps: () => normalize.element({
      'role': 'group',
      ...parts.root.attrs,
      'aria-labelledby': ids.title,
      'aria-describedby': ids.description,
      'data-state': status,
      'data-loading': dataAttr(busy),
      'data-tone': prop('tone'),
      'data-size': prop('size'),
      'onKeyDown': (event: KeyboardEvent) => {
        // 备注框在根内，组合期间的 Escape 是收候选词框，不是拒绝
        if (isComposingEvent(event))
          return
        // busy 与拒绝钮同一道闸门：Escape 是那颗钮的键盘等价物，只锁住钮的话
        // 等待期里换只手按 Escape 照样打得出第二条判定
        if (event.key !== 'Escape' || settled || busy || prop('denyOnEscape') === false)
          return
        // 这不是「关闭」：本组件不提供不作答的出口
        event.preventDefault()
        send({ type: 'DENY', source: 'escape' })
      },
    }),

    getTitleProps: () => normalize.element({
      ...parts.title.attrs,
      id: ids.title,
    }),

    getDescriptionProps: () => normalize.element({
      ...parts.description.attrs,
      id: ids.description,
    }),

    // 不写 role：role=status 会把档位钉死成 polite，而这一格的档位是可配的
    getLiveRegionProps: () => normalize.element({
      ...parts['live-region'].attrs,
      'aria-live': prop('live') ?? 'polite',
      'aria-atomic': 'true',
    }),

    getScopeGroupProps: () => normalize.element({
      ...parts['scope-group'].attrs,
      'role': 'group',
      'aria-label': translations?.scopes ?? 'Permissions',
    }),

    // 每个复选框各占一个 Tab 停靠点，不做 roving：授权项要逐条读、逐条勾
    getScopeItemProps: item => normalize.element({
      'role': 'checkbox',
      ...parts['scope-item'].attrs,
      'aria-checked': isScopeGranted(item.value) ? 'true' : 'false',
      'aria-disabled': scopeDisabled(item) ? 'true' : 'false',
      'aria-required': item.required === true ? 'true' : 'false',
      'data-value': item.value,
      'data-state': isScopeGranted(item.value) ? 'checked' : 'unchecked',
      'data-disabled': dataAttr(scopeDisabled(item)),
      'tabindex': settled ? -1 : 0,
      'onClick': () => {
        if (!scopeDisabled(item))
          send({ type: 'SCOPE.TOGGLE', value: item.value })
      },
      // 只认 Space，Enter 刻意不参与——与原生复选框一致
      'onKeyDown': (event: KeyboardEvent) => {
        if (event.key !== ' ' && event.key !== 'Spacebar')
          return
        event.preventDefault()
        // 按住不放会连发 keydown，勾选会来回翻转；键照样吞掉，只是不重复执行
        if (event.repeat)
          return
        if (!scopeDisabled(item))
          send({ type: 'SCOPE.TOGGLE', value: item.value })
      },
    }),

    getScopeIndicatorProps: item => normalize.element({
      ...parts['scope-indicator'].attrs,
      'aria-hidden': true,
      'data-state': isScopeGranted(item.value) ? 'checked' : 'unchecked',
    }),

    // 排在勾选项之内，文本自然构成它的可及名
    getScopeLabelProps: item => normalize.element({
      ...parts['scope-label'].attrs,
      'data-value': item.value,
    }),

    // 只随判定载荷发出，不参与 canApprove。判过了就跟着两颗按钮一起禁用
    getNoteProps: () => normalize.input({
      ...parts.note.attrs,
      'type': 'text',
      'value': note,
      'aria-label': translations?.note ?? 'Note',
      'placeholder': translations?.notePlaceholder,
      'disabled': settled || undefined,
      'data-state': status,
      'onInput': (event: Event) => {
        send({ type: 'NOTE.SET', value: (event.target as HTMLInputElement).value })
      },
    }),

    // 逐秒变化的剩余时间若进活区会不停打断；截止这件事在播报区里一次说清
    getTimerProps: () => normalize.element({
      ...parts.timer.attrs,
      'aria-hidden': true,
      'data-state': status,
    }),

    // 判定落定后才露出的那一格。文字由播报区念，这里只给眼睛看
    getResultProps: () => normalize.element({
      ...parts.result.attrs,
      'aria-hidden': true,
      'hidden': !settled || undefined,
      'data-state': status,
    }),

    // 只排布两颗按钮，不承载语义
    getFooterProps: () => normalize.element({
      ...parts.footer.attrs,
    }),

    // 待决时用 aria-disabled 而不是原生 disabled：保住可聚焦，让读屏念得到为什么按不动
    getApproveTriggerProps: () => normalize.button({
      ...parts['approve-trigger'].attrs,
      'type': 'button',
      'aria-disabled': (!canApprove || busy) ? 'true' : 'false',
      'aria-busy': busy ? 'true' : undefined,
      'aria-label': translations?.approve,
      'disabled': settled || undefined,
      'data-state': status,
      'data-loading': dataAttr(busy),
      'onClick': () => {
        if (!settled && canApprove)
          send({ type: 'APPROVE' })
      },
    }),

    // 拒绝不吃必选项那道闸门——没勾满照样拒得掉。但一条判定已经在途时它必须跟批准一样锁住：
    // 状态机要等宿主回话才落定，这段空窗里再按一次就会送出第二条判定，闸门后面的系统收到
    // 两条相互矛盾的结论。锁法与批准同构：aria-disabled 而不是原生 disabled，保住可聚焦，
    // 让读屏念得到为什么按不动
    getDenyTriggerProps: () => normalize.button({
      ...parts['deny-trigger'].attrs,
      'type': 'button',
      'aria-disabled': busy ? 'true' : 'false',
      'aria-busy': busy ? 'true' : undefined,
      'aria-label': translations?.deny,
      'disabled': settled || undefined,
      'data-state': status,
      'data-loading': dataAttr(busy),
      'onClick': () => {
        if (!settled && !busy)
          send({ type: 'DENY', source: 'user' })
      },
    }),
  }
}
