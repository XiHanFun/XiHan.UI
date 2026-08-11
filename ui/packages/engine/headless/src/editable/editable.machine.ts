import type { Scope } from '@xihan-ui/kernel'
import type { EditableSchema, EditableSubmitMode } from './editable.types'
import { focusSafely } from '@xihan-ui/behavior'
import { resetDeclaredValue, setup } from '@xihan-ui/machine'

const { createMachine, guards } = setup<EditableSchema>()
const { and, not } = guards

/** 收尾方式缺省：回车与离焦都算提交。 */
export const EDITABLE_DEFAULT_SUBMIT_MODE: EditableSubmitMode = 'both'
/** 激活方式缺省：单击预览区进编辑态。 */
export const EDITABLE_DEFAULT_ACTIVATION_MODE = 'click'

/** 回车算不算提交。连接层用它决定拦不拦回车的默认行为。 */
export function submitsOnEnter(mode: EditableSubmitMode | undefined): boolean {
  const m = mode ?? EDITABLE_DEFAULT_SUBMIT_MODE
  return m === 'enter' || m === 'both'
}

/** 焦点离场（失焦或 Tab）算不算提交；不算的走撤销。 */
export function submitsOnLeave(mode: EditableSubmitMode | undefined): boolean {
  const m = mode ?? EDITABLE_DEFAULT_SUBMIT_MODE
  return m === 'blur' || m === 'both'
}

/** maxLength 是否是可用上限；负数与非有限值按"没给"处理。 */
function hasLimit(maxLength: number | undefined): maxLength is number {
  return maxLength != null && Number.isFinite(maxLength) && maxLength >= 0
}

/**
 * 按 maxLength 截断。
 *
 * 原生 maxlength 只拦键盘输入这一路，setValue 与直接写 input.value 再派事件都绕得过去。
 */
export function clampEditableValue(value: string, maxLength: number | undefined): string {
  if (!hasLimit(maxLength))
    return value
  return value.length > maxLength ? value.slice(0, maxLength) : value
}

/**
 * autoResize 时输入框的原生 size（能显示几个字符宽）。
 *
 * 只由值与占位算出，不读 DOM；值为空时按占位长度撑开。
 */
export function editableInputSize(value: string, placeholder: string | undefined): number {
  const text = value === '' ? (placeholder ?? '') : value
  // 按码点计数：代理对（表情之类）用 length 会算成两格
  return Math.max(1, [...text].length)
}

export const editableMachine = createMachine({
  name: 'editable',
  refs: () => ({
    getInputEl: () => null,
    getPreviewEl: () => null,
  }),
  context: ({ prop, cell }) => ({
    // 值走 cell 原生受控：受控（给了 value）与非受控都在这里收口，无 CONTROLLED.VALUE 影子事件
    value: cell<string>(() => ({
      value: prop('value'),
      defaultValue: prop('defaultValue') ?? '',
      onChange: value => prop('onValueChange')?.({ value }),
    })),
    // 撤销的落点：机器自己记的上一次提交值，不对外受控、也不通知
    committedValue: cell<string>(() => ({
      defaultValue: prop('value') ?? prop('defaultValue') ?? '',
    })),
  }),
  initialState: ({ prop }) => ((prop('edit') ?? prop('defaultEdit')) ? 'edit' : 'preview'),
  // 编辑态走守卫 + CONTROLLED.* 影子事件 + watch，值走 cell 原生受控，两套不混用
  watch: ({ track, prop, action }) => track([() => prop('edit')], () => action(['syncEdit'])),
  // 写值不分状态：预览态也能程序化改值
  on: {
    'FORM.RESET': { actions: ['resetToDefault'] },
    'VALUE.SET': { guard: 'canEdit', actions: ['setValue'] },
  },
  states: {
    preview: {
      on: {
        'EDIT.START': [
          // 禁用/只读：整条吃掉，连意图都不发
          { guard: not('canEdit') },
          // 受控只发意图，非受控转移并通知
          { guard: 'isEditControlled', actions: ['invokeEditOn'] },
          { target: 'edit', actions: ['invokeEditOn'] },
        ],
        'CONTROLLED.EDIT': { target: 'edit' },
      },
    },
    edit: {
      // 进编辑态拍下值的快照，撤销回到它。必须挂 entry 而非 EDIT.START：
      // 受控回写（CONTROLLED.EDIT）进来的编辑态也要拍这一张
      entry: ['snapshotValue'],
      effects: ['trackEditFocus'],
      on: {
        // 提交与撤销不看 disabled/readOnly，入口已在 EDIT.START 的守卫拦过
        'EDIT.SUBMIT': [
          { guard: 'isEditControlled', actions: ['commitValue', 'invokeEditOff'] },
          { target: 'preview', actions: ['commitValue', 'invokeEditOff'] },
        ],
        'EDIT.CANCEL': [
          { guard: 'isEditControlled', actions: ['revertValue', 'invokeEditOff'] },
          { target: 'preview', actions: ['revertValue', 'invokeEditOff'] },
        ],
        // 离场按 submitMode 分岔：算提交就提交，不算就撤销。
        // 四条分支覆盖"算不算提交"×"受不受控"，缺一条会出现受控下离场既不提交也不撤销
        'EDIT.LEAVE': [
          { guard: and('submitsOnLeave', 'isEditControlled'), actions: ['commitValue', 'invokeEditOff'] },
          { guard: 'submitsOnLeave', target: 'preview', actions: ['commitValue', 'invokeEditOff'] },
          { guard: 'isEditControlled', actions: ['revertValue', 'invokeEditOff'] },
          { target: 'preview', actions: ['revertValue', 'invokeEditOff'] },
        ],
        'CONTROLLED.PREVIEW': { target: 'preview' },
      },
    },
  },
  implementations: {
    guards: {
      isEditControlled: ({ prop }) => prop('edit') !== undefined,
      canEdit: ({ prop }) => !prop('disabled') && !prop('readOnly'),
      submitsOnLeave: ({ prop }) => submitsOnLeave(prop('submitMode')),
    },
    actions: {
      resetToDefault: (params) => {
        if (resetDeclaredValue(params, 'value', 'value', 'defaultValue'))
          params.context.set('committedValue', params.context.get('value'))
      },

      setValue: ({ context, prop, event }) => {
        const e = event.current()
        if (e.type === 'VALUE.SET')
          context.set('value', clampEditableValue(e.value, prop('maxLength')))
      },
      snapshotValue: ({ context }) => {
        context.set('committedValue', context.get('value'))
      },
      commitValue: ({ context, prop }) => {
        const value = context.get('value')
        const previousValue = context.get('committedValue')
        context.set('committedValue', value)
        // 值没变也发：这条事件表示用户确认过一次；要跳过无变化的提交，调用方比对 previousValue
        prop('onValueCommit')?.({ value, previousValue })
      },
      revertValue: ({ context, prop }) => {
        const value = context.get('committedValue')
        const discardedValue = context.get('value')
        // 受控值下这一写不落内部值，只经 cell 的 onChange 通知宿主，由宿主写回
        if (discardedValue !== value)
          context.set('value', value)
        prop('onValueRevert')?.({ value, discardedValue })
      },
      invokeEditOn: ({ prop }) => prop('onEditChange')?.({ edit: true }),
      invokeEditOff: ({ prop }) => prop('onEditChange')?.({ edit: false }),
      // 只在受控（edit 为布尔）时回写；edit 变回 undefined = 转非受控，不强制退出
      syncEdit: ({ prop, send }) => {
        const edit = prop('edit')
        if (edit === undefined)
          return
        send(edit ? { type: 'CONTROLLED.EDIT' } : { type: 'CONTROLLED.PREVIEW' })
      },
    },
    effects: {
      /**
       * 编辑态期间的焦点归属：进来搬进输入框，出去还给预览区。
       *
       * 两头都推迟到宿主提交之后：此刻目标节点仍带着 hidden，对收起的节点 focus() 是空操作。
       */
      trackEditFocus: ({ refs, prop, scope, state, flush }) => {
        let disposed = false
        flush(() => {
          if (disposed)
            return
          const input = refs.get('getInputEl')()
          // 无 DOM 环境（纯逻辑测试）下不搬焦点，状态照常转移
          if (!input)
            return
          focusWhenVisible(input, scope, () => !disposed, () => {
            // 不走 focusSafely 的 select 选项：已聚焦时它会连 select 一起跳过
            if (prop('selectOnFocus') ?? true)
              selectAll(input)
          })
        })
        return () => {
          disposed = true
          const input = refs.get('getInputEl')()
          // 判据是输入框当下持有焦点：Tab 出去时焦点已落在下一个控件上，不得抢回预览区
          if (!input || scope.getActiveElement() !== input)
            return
          const preview = refs.get('getPreviewEl')()
          if (!preview)
            return
          flush(() => {
            // 一出一进挨得极近时（撤销后立刻又点进编辑），这条回调不能把焦点从刚打开的输入框里拖走
            if (state.get() === 'edit')
              return
            focusWhenVisible(preview, scope, () => state.get() !== 'edit')
          })
        }
      },
    },
  },
})

/** 焦点重试的最大帧数。 */
const FOCUS_RETRY_FRAMES = 3

/**
 * 把焦点搬到目标节点上：当场先试一下，没落下就逐帧重试。
 *
 * 重试是为了等宿主的异步渲染（Vue 渲染任务、WC 的一轮 update）撤掉目标上的 hidden——
 * 对带 hidden 的节点调 focus() 是空操作。jsdom 不管 hidden 照样聚焦得上，
 * 这条只在真实浏览器里看得出差别。
 */
function focusWhenVisible(
  el: HTMLElement,
  scope: Scope,
  alive: () => boolean,
  afterFocus?: () => void,
): void {
  const attempt = (remaining: number): void => {
    if (!alive())
      return
    focusSafely(el)
    if (scope.getActiveElement() === el) {
      afterFocus?.()
      return
    }
    if (remaining > 0)
      scope.getWin().requestAnimationFrame(() => attempt(remaining - 1))
  }
  attempt(FOCUS_RETRY_FRAMES)
}

/**
 * 全选输入框内容。
 * 用鸭子判定而非 instanceof：跨 realm（iframe、测试宿主）时 instanceof 认不出同名的类。
 */
function selectAll(el: HTMLElement): void {
  const select = (el as HTMLInputElement).select
  if (typeof select === 'function')
    select.call(el)
}
