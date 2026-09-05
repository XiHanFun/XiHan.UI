import type { ApprovalSchema } from './approval.types'
import { setTimeoutEffect, setup } from '@xihan-ui/machine'
import { toggleItemValue } from '../checkbox-group'
import { canApproveScopes } from './approval.types'

const { createMachine, guards } = setup<ApprovalSchema>()

/** 判定载荷里的备注那一格：空串时不带。 */
function noteOf(note: string): { note?: string } {
  return note === '' ? {} : { note }
}

/**
 * 超时一律按拒绝收口，这条由机器结构保证，不靠调用方守规矩：
 *
 * 1. 判定的取值域只有批准与拒绝，`invokeExpire` 里写死拒绝；`expired` 只是显示态。
 * 2. 通往 `approved` 的转移全机只有一条，且必过 `canApprove`。
 * 3. `after.timeout` 只声明在 `pending` 上，三个终态不声明它——迟到的定时事件落地即静默丢弃。
 * 4. 时长非有限或非正数时一个计时器都不起，停在待决：既不当 0ms 立刻到期，
 *    也绝不当成无限期放行。
 * 5. 根级 `exit` 在机器停止时若仍待决就按拒绝派一次（须显式开启）。
 * 6. 机器这一层的拒绝永远走得通：DENY 不吃挂起中、不吃必选项、不吃任何闸门，
 *    超时、卸载兜底与宿主的 deny() 都要能落地。人手按的那两条路（拒绝按钮与 Escape）
 *    另有一道挂起闸门，写在连接层，为的是判定在途时按不出第二条。
 */
export const approvalMachine = createMachine({
  name: 'approval',
  context: ({ prop, cell }) => ({
    grantedScopes: cell<string[]>(() => ({
      value: prop('grantedScopes') as string[] | undefined,
      defaultValue: (prop('defaultGrantedScopes') as string[] | undefined) ?? [],
      // 数组要逐项比：不给的话受控父组件写回一份等价数组就会多派一次回调
      isEqual: (a, b) => Array.isArray(b) && a.length === b.length && a.every((v, i) => v === b[i]),
      onChange: value => prop('onGrantedScopesChange')?.({ value }),
    })),
    note: cell<string>(() => ({
      value: prop('note') as string | undefined,
      defaultValue: (prop('defaultNote') as string | undefined) ?? '',
      onChange: value => prop('onNoteChange')?.({ value }),
    })),
  }),
  initialState: ({ prop }) => prop('status') ?? prop('defaultStatus') ?? 'pending',
  watch: ({ track, prop, action }) => {
    track([() => prop('status')], () => action(['syncStatus']))
    // 换了一轮请求就重入待决：reenter 把计时效应拆掉重挂，新一轮按新时长起跑
    track([() => prop('requestId')], () => action(['resetRequest']))
  },
  on: {
    // 受控回写，只跳转不通知
    'CONTROLLED.PENDING': { target: 'pending' },
    'CONTROLLED.APPROVE': { target: 'approved' },
    'CONTROLLED.DENY': { target: 'denied' },
    'CONTROLLED.EXPIRE': { target: 'expired' },
    'REQUEST.RESET': { target: 'pending', reenter: true, actions: ['resetScopes', 'resetNote'] },
    // 程序化写入不挂可编辑守卫：那是给宿主用的入口
    'SCOPE.SET': { actions: ['setScopes'] },
    'NOTE.SET': { actions: ['setNote'] },
  },
  // 机器停止时若仍待决，按拒绝派一次（须 denyOnUnmount 显式开启）
  exit: ['denyIfPending'],
  states: {
    pending: {
      effects: ['trackTimeout'],
      on: {
        'APPROVE': [
          { guard: 'canApproveControlled', actions: ['invokeApprove'] },
          { guard: 'canApprove', target: 'approved', actions: ['invokeApprove'] },
        ],
        'DENY': [
          { guard: 'isStatusControlled', actions: ['invokeDeny'] },
          { target: 'denied', actions: ['invokeDeny'] },
        ],
        'after.timeout': [
          { guard: 'isStatusControlled', actions: ['invokeExpire'] },
          { target: 'expired', actions: ['invokeExpire'] },
        ],
        'SCOPE.TOGGLE': [{ guard: 'isEditable', actions: ['toggleScope'] }],
      },
    },
    approved: {},
    denied: {},
    expired: {},
  },
  implementations: {
    guards: {
      isStatusControlled: ({ prop }) => prop('status') !== undefined,
      canApprove: ({ prop, context }) =>
        prop('loading') !== true && canApproveScopes(prop('scopes'), context.get('grantedScopes')),
      isEditable: ({ prop }) => prop('loading') !== true,
      // 受控且能批：只发意图，不自改状态
      canApproveControlled: guards.and('isStatusControlled', 'canApprove'),
    },
    actions: {
      invokeApprove: ({ prop, context }) => {
        prop('onDecision')?.({
          requestId: prop('requestId'),
          decision: 'approved',
          source: 'user',
          scopes: [...context.get('grantedScopes')],
          ...noteOf(context.get('note')),
        })
      },
      invokeDeny: ({ prop, context, event }) => {
        const e = event.current()
        prop('onDecision')?.({
          requestId: prop('requestId'),
          decision: 'denied',
          source: e.type === 'DENY' ? e.source : 'user',
          scopes: [...context.get('grantedScopes')],
          ...noteOf(context.get('note')),
        })
      },
      // 超时写死成拒绝：类型层与这一行一起把「超时放行」这条路封死
      invokeExpire: ({ prop, context }) => {
        prop('onDecision')?.({
          requestId: prop('requestId'),
          decision: 'denied',
          source: 'timeout',
          scopes: [...context.get('grantedScopes')],
          ...noteOf(context.get('note')),
        })
      },
      toggleScope: ({ context, event }) => {
        const e = event.current()
        if (e.type === 'SCOPE.TOGGLE')
          context.set('grantedScopes', toggleItemValue(context.get('grantedScopes'), e.value))
      },
      setScopes: ({ context, event }) => {
        const e = event.current()
        if (e.type === 'SCOPE.SET')
          context.set('grantedScopes', [...e.value])
      },
      resetScopes: ({ context, prop }) => {
        context.set('grantedScopes', [...(prop('defaultGrantedScopes') ?? [])])
      },
      setNote: ({ context, event }) => {
        const e = event.current()
        if (e.type === 'NOTE.SET')
          context.set('note', e.value)
      },
      resetNote: ({ context, prop }) => {
        context.set('note', prop('defaultNote') ?? '')
      },
      denyIfPending: ({ prop, context, state }) => {
        if (prop('denyOnUnmount') !== true || state.get() !== 'pending')
          return
        prop('onDecision')?.({
          requestId: prop('requestId'),
          decision: 'denied',
          source: 'unmount',
          scopes: [...context.get('grantedScopes')],
          ...noteOf(context.get('note')),
        })
      },
      // 换了一轮请求：旧结果由宿主自己作废，这里不替旧一轮补一次拒绝
      resetRequest: ({ send }) => send({ type: 'REQUEST.RESET' }),
      // 只在受控（status 有值）时回写
      syncStatus: ({ prop, send }) => {
        const status = prop('status')
        if (status === undefined)
          return
        if (status === 'pending')
          send({ type: 'CONTROLLED.PENDING' })
        else if (status === 'approved')
          send({ type: 'CONTROLLED.APPROVE' })
        else if (status === 'denied')
          send({ type: 'CONTROLLED.DENY' })
        else
          send({ type: 'CONTROLLED.EXPIRE' })
      },
    },
    effects: {
      /** 时长非有限或非正数时一个计时器都不起，停在待决。 */
      trackTimeout: ({ prop, send }) => {
        const ms = prop('timeoutMs')
        if (ms === undefined || !Number.isFinite(ms) || ms <= 0)
          return undefined
        return setTimeoutEffect(() => send({ type: 'after.timeout' }), ms)
      },
    },
  },
})
