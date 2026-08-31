import type { NormalizeProps, PropTypes } from '@xihan-ui/kernel'
import type { Service } from '@xihan-ui/machine'
import type { ApprovalApi, ApprovalSchema, ApprovalScope, ApprovalStatus } from './approval.types'
import { dataAttr } from '@xihan-ui/kernel'
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
    canApprove,
    announcement: announcementOf(status, translations),
    approve: () => send({ type: 'APPROVE' }),
    deny: () => send({ type: 'DENY', source: 'api' }),
    setGrantedScopes: next => send({ type: 'SCOPE.SET', value: next }),
    isScopeGranted,

    // 不给 tabindex：内部按钮与勾选项都可聚焦，Escape 冒泡到这里即可。
    // 也不发 aria-busy——挂起中只在按钮上表达
    getRootProps: () => normalize.element({
      'role': 'group',
      ...parts.root.attrs,
      'aria-labelledby': ids.title,
      'aria-describedby': ids.description,
      'data-state': status,
      'data-busy': dataAttr(busy),
      'data-tone': prop('tone'),
      'data-size': prop('size'),
      'onKeyDown': (event: KeyboardEvent) => {
        if (event.key !== 'Escape' || settled || prop('denyOnEscape') === false)
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
    getAnnouncementProps: () => normalize.element({
      ...parts.announcement.attrs,
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

    // 逐秒变化的剩余时间若进活区会不停打断；截止这件事在播报区里一次说清
    getTimerProps: () => normalize.element({
      ...parts.timer.attrs,
      'aria-hidden': true,
      'data-state': status,
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
      'data-busy': dataAttr(busy),
      'onClick': () => {
        if (!settled && canApprove)
          send({ type: 'APPROVE' })
      },
    }),

    // 拒绝这条路永远走得通：不吃挂起中、不吃必选项、不吃任何闸门
    getDenyTriggerProps: () => normalize.button({
      ...parts['deny-trigger'].attrs,
      'type': 'button',
      'aria-label': translations?.deny,
      'disabled': settled || undefined,
      'data-state': status,
      'onClick': () => {
        if (!settled)
          send({ type: 'DENY', source: 'user' })
      },
    }),
  }
}
