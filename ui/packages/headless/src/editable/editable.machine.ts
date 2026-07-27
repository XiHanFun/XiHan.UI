import type { Scope } from '@xihan-ui/core'
import type { EditableSchema, EditableSubmitMode } from './editable.types'
import { focusSafely } from '@xihan-ui/behavior'
import { setup } from '@xihan-ui/machine'

const { createMachine, guards } = setup<EditableSchema>()
const { and, not } = guards

/** 收尾方式缺省：回车与离焦都算提交。 */
export const EDITABLE_DEFAULT_SUBMIT_MODE: EditableSubmitMode = 'both'
/** 激活方式缺省：单击预览区进编辑态。 */
export const EDITABLE_DEFAULT_ACTIVATION_MODE = 'click'

/**
 * 回车算不算提交。
 *
 * 连接层要拿它决定"拦不拦这一下默认行为"（不算提交就得把键交回去，
 * 多行输入靠它换行、外层表单靠它提交），机器不重复判断——两处各写一遍迟早会漂。
 */
export function submitsOnEnter(mode: EditableSubmitMode | undefined): boolean {
  const m = mode ?? EDITABLE_DEFAULT_SUBMIT_MODE
  return m === 'enter' || m === 'both'
}

/** 焦点离场（失焦或 Tab）算不算提交。不算的一律走撤销，不留下没提交过的值。 */
export function submitsOnLeave(mode: EditableSubmitMode | undefined): boolean {
  const m = mode ?? EDITABLE_DEFAULT_SUBMIT_MODE
  return m === 'blur' || m === 'both'
}

/** maxLength 是否给了个能用的上限。负数与非有限值按"没给"处理，与浏览器对 maxlength 的态度一致。 */
function hasLimit(maxLength: number | undefined): maxLength is number {
  return maxLength != null && Number.isFinite(maxLength) && maxLength >= 0
}

/**
 * 按 maxLength 截断。
 *
 * 原生 maxlength 只拦住"从键盘敲进来"这一路：作者调 setValue、以及自动化直接写
 * input.value 再派 input 事件，都绕得过去。上限若只写在属性上，超长值照样能提交出去。
 */
export function clampEditableValue(value: string, maxLength: number | undefined): string {
  if (!hasLimit(maxLength))
    return value
  return value.length > maxLength ? value.slice(0, maxLength) : value
}

/**
 * autoResize 时输入框的原生 size（能显示几个字符宽）。
 *
 * 刻意用 size 而不是量出来的像素宽：连接层是纯函数，不许读 DOM，
 * 而 size 只跟值与占位有关，算得出来。空值时按占位长度撑开，
 * 否则一开口就是个窄到看不见占位的小格子。
 */
export function editableInputSize(value: string, placeholder: string | undefined): number {
  const text = value === '' ? (placeholder ?? '') : value
  // 码点计数：代理对（表情之类）按 length 会算成两格，宽度凭空多一倍
  return Math.max(1, [...text].length)
}

export const editableMachine = createMachine({
  name: 'editable',
  refs: () => ({
    getInputEl: () => null,
    getPreviewEl: () => null,
  }),
  context: ({ prop, cell }) => ({
    // 值住在 cell 里：受控（给了 value）与非受控的收口点就是它，
    // 因此不需要 CONTROLLED.VALUE 影子事件，也不必在 watch 里守 undefined
    value: cell<string>(() => ({
      value: prop('value'),
      defaultValue: prop('defaultValue') ?? '',
      onChange: value => prop('onValueChange')?.({ value }),
    })),
    // 撤销的落点。不对外受控、也不通知：它是机器自己记的"上一次提交是什么"，
    // 让宿主也能改的话，Escape 会撤到一个用户从没见过的值上
    committedValue: cell<string>(() => ({
      defaultValue: prop('value') ?? prop('defaultValue') ?? '',
    })),
  }),
  initialState: ({ prop }) => ((prop('edit') ?? prop('defaultEdit')) ? 'edit' : 'preview'),
  // 编辑态是布尔态，走"守卫对 + CONTROLLED.* 影子事件 + watch 守 undefined"那一套；
  // 值是字符串，走 cell 原生受控。两套受控写法各管各的，不混用
  watch: ({ track, prop, action }) => track([() => prop('edit')], () => action(['syncEdit'])),
  // 写值与状态无关：预览态作者也能程序化改值（重置表单就是这么干的）
  on: {
    'VALUE.SET': { guard: 'canEdit', actions: ['setValue'] },
  },
  states: {
    preview: {
      on: {
        'EDIT.START': [
          // 禁用/只读：整条吃掉，连意图都不发——宿主收到意图会以为该进编辑态了
          { guard: not('canEdit') },
          // 受控命中 → 只发意图；非受控 → 落 target 并一并通知
          { guard: 'isEditControlled', actions: ['invokeEditOn'] },
          { target: 'edit', actions: ['invokeEditOn'] },
        ],
        'CONTROLLED.EDIT': { target: 'edit' },
      },
    },
    edit: {
      // 进编辑态那一刻拍下值的快照：撤销要回到的就是它。
      // 挂在 entry 而不是 EDIT.START 的 actions 上——受控回写（CONTROLLED.EDIT）
      // 也得拍这一张，否则宿主驱动的编辑态一按 Escape 就撤到上上次的值
      entry: ['snapshotValue'],
      effects: ['trackEditFocus'],
      on: {
        // 提交与撤销都不再看 disabled/readOnly：进得来就得出得去，
        // 拦住入口的活儿在 EDIT.START 那条守卫上已经干过了
        'EDIT.SUBMIT': [
          { guard: 'isEditControlled', actions: ['commitValue', 'invokeEditOff'] },
          { target: 'preview', actions: ['commitValue', 'invokeEditOff'] },
        ],
        'EDIT.CANCEL': [
          { guard: 'isEditControlled', actions: ['revertValue', 'invokeEditOff'] },
          { target: 'preview', actions: ['revertValue', 'invokeEditOff'] },
        ],
        // 离场按 submitMode 分岔：算提交就提交，不算就撤销。
        // 四条分支把"算不算提交"与"受不受控"两个维度铺开写全，
        // 少一条就会出现"受控时离场既不提交也不撤销"这种只在受控下才现形的洞
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
        // 值没变也照发：提交是"用户确认过一遍"这件事本身，不是"值变了"的另一种说法。
        // 想省掉无变化的写，调用方比对 previousValue 即可
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
       * 两头都要推迟到宿主提交之后：进来那一刻输入框还带着 hidden，
       * 出去那一刻预览区还带着 hidden——对着一个收起的节点调 focus() 是空操作，
       * 焦点会掉进 body，键盘用户就此失去落点。
       */
      trackEditFocus: ({ refs, prop, scope, state, flush }) => {
        let disposed = false
        flush(() => {
          if (disposed)
            return
          const input = refs.get('getInputEl')()
          // 无 DOM 环境（纯逻辑测试）：状态照常转移，只是不搬焦点
          if (!input)
            return
          focusWhenVisible(input, scope, () => !disposed, () => {
            // 单独调一次而不是走 focusSafely 的 select 选项：那条在"本来就聚焦着"时
            // 会连同 select 一起跳过，全选就成了看命的事
            if (prop('selectOnFocus') ?? true)
              selectAll(input)
          })
        })
        return () => {
          disposed = true
          const input = refs.get('getInputEl')()
          // 判据是"输入框当下正持有焦点"，不是"刚才在编辑态"：
          // Tab 出去时焦点已经落在下一个控件上，这时候抢回预览区
          // 等于把光标从用户刚到达的地方拽走，接着敲的字符直接丢掉
          if (!input || scope.getActiveElement() !== input)
            return
          const preview = refs.get('getPreviewEl')()
          if (!preview)
            return
          flush(() => {
            // 一出一进挨得极近时（撤销后立刻又点进编辑），这条回调可能排在
            // 新一轮的聚焦之前跑完，别让它把焦点从刚打开的输入框里拖走
            if (state.get() === 'edit')
              return
            focusWhenVisible(preview, scope, () => state.get() !== 'edit')
          })
        }
      },
    },
  },
})

/** 焦点最多再等几帧。与焦点域同一套：三帧还落不下就是真聚焦不上，别没完没了地试。 */
const FOCUS_RETRY_FRAMES = 3

/**
 * 把焦点搬到目标节点上：当场先试一下，没落下就逐帧重试。
 *
 * flush 只保证排在"宿主提交这一帧"之后，排不掉宿主自己那点异步——
 * Vue 的渲染任务与 WC 的一轮 update 都可能落在这条回调之后，那一刻目标还带着 hidden，
 * focus() 是空操作，焦点就此掉进 body。这条重试正是守它的
 * （jsdom 不管 hidden 照样聚焦得上，所以它只在真实浏览器里才看得出差别）。
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
 * 鸭子判定而不是 instanceof：跨 realm（iframe、测试宿主）时 instanceof 会认不出同名的类。
 */
function selectAll(el: HTMLElement): void {
  const select = (el as HTMLInputElement).select
  if (typeof select === 'function')
    select.call(el)
}
